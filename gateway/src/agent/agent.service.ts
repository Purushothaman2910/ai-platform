/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/agent/agent.service.ts
import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../llm/openrouter.service';
import { McpClientService } from 'src/mcp-client/mcp-client.service';
import { SessionService } from 'src/session/session.service';
import { TraceService } from 'src/observablity/trace.service';

import { Message } from 'src/session/session.service';

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ReasoningLoopConfig {
  maxIterations: number;
  maxToolCalls: number;
}

@Injectable()
export class AgentService {
  private readonly reasoningConfig: ReasoningLoopConfig = {
    maxIterations: 5,
    maxToolCalls: 10,
  };

  constructor(
    private readonly llm: OpenRouterService,
    private readonly mcpClient: McpClientService,
    private readonly sessionService: SessionService,
    private readonly traceService: TraceService,
  ) {}

  async ask(sessionId: string, question: string) {
    // Initialize session
    this.sessionService.createSession(sessionId);

    // Get tools from ALL connected MCP servers
    const tools = await this.mcpClient.listTools();

    // Check if any servers are connected
    const connectedServers = this.mcpClient.getConnectedServers();
    if (connectedServers.length === 0) {
      return {
        response:
          'No MCP servers are currently connected. Please check your configuration.',
        sessionId,
      };
    }

    // Format tools for OpenAI
    const openAiTools = this.formatToolsForOpenAI(tools.tools);

    // Get conversation history and add user message
    const messages = this.sessionService.getMessages(sessionId);

    // Enhanced system message with server info
    if (messages.length === 0) {
      const sysMsg = {
        id: `sys-${Date.now()}`,
        role: 'system' as const,
        content: this.buildSystemMessage(connectedServers, tools.tools),
        timestamp: new Date(),
      };
      messages.push(sysMsg);
      this.sessionService.addMessage(sessionId, sysMsg);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: question,
      timestamp: new Date(),
    };
    messages.push(userMessage);
    this.sessionService.addMessage(sessionId, userMessage);

    // Run reasoning loop
    const startTime = Date.now();
    const response = await this.reasoningLoop(sessionId, messages, openAiTools);
    const processingTime = Date.now() - startTime;

    // Save final assistant message is already handled in reasoningLoop?
    // Wait, reasoningLoop adds messages to the local 'messages' array.
    // I should make sure it's saved in the sessionService.

    return {
      response,
      sessionId,
      metadata: {
        processingTime,
      },
    };
  }

  /**
   * Build enhanced system message with server and tool information
   */
  private buildSystemMessage(servers: string[], tools: any[]): string {
    const serverList = servers.join(', ');
    const toolsByServer = this.groupToolsByServer(tools);

    let message = `You are a helpful AI assistant with access to ${servers.length} MCP server(s): ${serverList}.\n\n`;
    message += 'Available tools:\n';

    for (const [serverName, serverTools] of Object.entries(toolsByServer)) {
      message += `\n[${serverName}]:\n`;
      serverTools.forEach((tool: any) => {
        message += `  • ${tool.name}: ${tool.description || 'No description'}\n`;
      });
    }

    return message;
  }

  /**
   * Group tools by their server name
   */
  private groupToolsByServer(tools: any[]): Record<string, any[]> {
    return tools.reduce(
      (acc, tool) => {
        const serverName = tool.serverName || 'unknown';
        if (!acc[serverName]) {
          acc[serverName] = [];
        }
        acc[serverName].push(tool);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }

  private async reasoningLoop(
    sessionId: string,
    messages: Message[],
    openAiTools: any[],
  ): Promise<string> {
    let iteration = 0;
    let totalToolCalls = 0;

    while (iteration < this.reasoningConfig.maxIterations) {
      iteration++;
      console.log(`🧠 Reasoning iteration ${iteration}`);

      // Get LLM response
      const completion = await this.llm.chat(messages, openAiTools);
      const assistantMessage = completion.choices[0].message;

      // Check if LLM wants to use tools
      if (!assistantMessage.tool_calls?.length) {
        // No more tool calls - return final answer
        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant' as const,
          content: assistantMessage.content,
          timestamp: new Date(),
        };
        messages.push(aiMsg);
        this.sessionService.addMessage(sessionId, aiMsg);
        return assistantMessage.content || 'No response generated.';
      }

      // Check tool call limit
      totalToolCalls += assistantMessage.tool_calls.length;
      if (totalToolCalls > this.reasoningConfig.maxToolCalls) {
        console.warn('⚠️ Max tool calls reached');
        const limitMsg = {
          id: `ai-limit-${Date.now()}`,
          role: 'assistant' as const,
          content:
            "I've reached my tool usage limit. Here's what I found so far...",
          timestamp: new Date(),
        };
        messages.push(limitMsg);
        this.sessionService.addMessage(sessionId, limitMsg);
        return await this.getFinalResponse(sessionId, messages, openAiTools);
      }

      // Process tool calls
      await this.processToolCalls(sessionId, messages, assistantMessage);
    }

    // Max iterations reached - get final answer
    console.warn('⚠️ Max reasoning iterations reached');
    return await this.getFinalResponse(sessionId, messages, openAiTools);
  }

  private async processToolCalls(
    sessionId: string,
    messages: Message[],
    assistantMessage: any,
  ): Promise<void> {
    console.log(
      `🔧 Processing ${assistantMessage.tool_calls.length} tool call(s)`,
    );

    // Add assistant's message with tool calls
    const aiMsg = {
      id: `ai-${Date.now()}`,
      role: 'assistant' as const,
      content: assistantMessage.content,
      tool_calls: assistantMessage.tool_calls,
      timestamp: new Date(),
    };
    messages.push(aiMsg);
    this.sessionService.addMessage(sessionId, aiMsg);

    // Filter and execute function tool calls
    const functionToolCalls = this.filterFunctionToolCalls(
      assistantMessage.tool_calls,
    );
    const toolResults = await this.executeToolCalls(
      sessionId,
      functionToolCalls,
    );

    // Add tool results to conversation
    for (const result of toolResults) {
      messages.push(result);
      this.sessionService.addMessage(sessionId, result);
    }
  }

  private filterFunctionToolCalls(toolCalls: any[]): ToolCall[] {
    return toolCalls.filter(
      (toolCall) => toolCall.type === 'function' && 'function' in toolCall,
    );
  }

  private async executeToolCalls(
    sessionId: string,
    toolCalls: ToolCall[],
  ): Promise<Message[]> {
    return Promise.all(
      toolCalls.map((toolCall) => this.executeToolCall(sessionId, toolCall)),
    );
  }

  private async executeToolCall(
    sessionId: string,
    toolCall: ToolCall,
  ): Promise<Message> {
    const toolName = toolCall.function.name;
    console.log(`📤 Calling tool: ${toolName}`);

    const args = this.parseToolArguments(toolCall.function.arguments);
    const startTime = Date.now();

    try {
      // The MCP client now automatically finds which server has this tool
      const result = await this.mcpClient.callTool(toolName, args);
      const duration = Date.now() - startTime;

      // Determine which server handled the tool (from result or logs)
      const serverName = this.extractServerName(result, toolName);

      // Log successful tool execution
      this.logToolTrace(
        sessionId,
        toolName,
        args,
        result,
        'success',
        duration,
        serverName,
      );

      return {
        id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
        timestamp: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Error calling ${toolName}:`, error);

      // Log failed tool execution
      this.logToolTrace(
        sessionId,
        toolName,
        args,
        { error: error.message },
        'error',
        duration,
      );

      return {
        id: `tool-err-${Date.now()}`,
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: JSON.stringify({
          error: error.message,
          hint: 'The tool may not be available on any connected MCP server.',
        }),
        timestamp: new Date(),
      };
    }
  }

  /**
   * Extract server name from result or tool name
   */
  private extractServerName(result: any, toolName: string): string {
    // You could enhance this by having the MCP client return server info
    // For now, we'll try to infer from connected servers
    const servers = this.mcpClient.getConnectedServers();

    // Simple heuristic - could be improved
    if (toolName.includes('product'))
      return servers.includes('product-server') ? 'product-server' : 'unknown';
    if (toolName.includes('file'))
      return servers.includes('filesystem-server')
        ? 'filesystem-server'
        : 'unknown';

    return servers[0] || 'unknown';
  }

  private async getFinalResponse(
    sessionId: string,
    messages: Message[],
    openAiTools: any[],
  ): Promise<string> {
    // Force LLM to give final answer without tool calls
    const finalCompletion = await this.llm.chat(messages, openAiTools);
    const finalMessage = finalCompletion.choices[0].message;

    const finalMsg = {
      id: `ai-final-${Date.now()}`,
      role: 'assistant' as const,
      content: finalMessage.content,
      timestamp: new Date(),
    };
    messages.push(finalMsg);
    this.sessionService.addMessage(sessionId, finalMsg);

    return finalMessage.content || 'Unable to generate response.';
  }

  private formatToolsForOpenAI(tools: any[]): any[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description || 'No description provided',
        parameters: tool.inputSchema,
      },
    }));
  }

  private parseToolArguments(args: string): any {
    if (!args) return {};
    try {
      return JSON.parse(args);
    } catch {
      return {};
    }
  }

  private logToolTrace(
    sessionId: string,
    toolName: string,
    input: any,
    output: any,
    status: 'success' | 'error',
    duration: number,
    serverName?: string,
  ): void {
    this.traceService.logToolTrace({
      sessionId,
      toolName,
      input,
      output,
      status,
      duration,
      timestamp: new Date(),
      metadata: {
        serverName: serverName || 'unknown',
      },
    });
  }

  /**
   * Get available MCP servers - useful for debugging/monitoring
   */
  getAvailableServers() {
    return {
      servers: this.mcpClient.getServerInfo(),
      connectedCount: this.mcpClient.getConnectedServers().length,
    };
  }

  /**
   * Get all available tools grouped by server
   */
  async getAvailableTools() {
    const tools = await this.mcpClient.listTools();
    return {
      total: tools.tools.length,
      byServer: this.groupToolsByServer(tools.tools),
    };
  }
}
