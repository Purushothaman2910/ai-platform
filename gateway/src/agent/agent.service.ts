import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../llm/openrouter.service';
import { McpClientService } from 'src/mcp-client/mcp-client.service';
import { SessionService } from 'src/session/session.service';
import { TraceService } from 'src/observablity/trace.service';

type Message =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: any[] }
  | { role: 'tool'; tool_call_id: string; content: string };

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
    maxIterations: 5, // Maximum reasoning loops
    maxToolCalls: 10, // Maximum total tool calls
  };

  constructor(
    private readonly llm: OpenRouterService,
    private readonly mcpClient: McpClientService,
    private readonly sessionService: SessionService,
    private readonly traceService: TraceService,
  ) {}

  async ask(sessionId: string, question: string) {
    // Initialize session and tools
    this.sessionService.createSession(sessionId);
    const tools = await this.mcpClient.listTools();
    const openAiTools = this.formatToolsForOpenAI(tools.tools);

    // Get conversation history and add user message
    const messages = this.sessionService.getMessages(sessionId);
    messages.push({ role: 'user', content: question });

    // Run reasoning loop
    const response = await this.reasoningLoop(sessionId, messages, openAiTools);

    // Save final conversation state
    this.sessionService.setMessages(sessionId, messages);

    return { response };
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
        messages.push({
          role: 'assistant',
          content: assistantMessage.content,
        });
        return assistantMessage.content || 'No response generated.';
      }

      // Check tool call limit
      totalToolCalls += assistantMessage.tool_calls.length;
      if (totalToolCalls > this.reasoningConfig.maxToolCalls) {
        console.warn('⚠️ Max tool calls reached');
        messages.push({
          role: 'assistant',
          content:
            "I've reached my tool usage limit. Here's what I found so far...",
        });
        return await this.getFinalResponse(messages, openAiTools);
      }

      // Process tool calls
      await this.processToolCalls(sessionId, messages, assistantMessage);
    }

    // Max iterations reached - get final answer
    console.warn('⚠️ Max reasoning iterations reached');
    return await this.getFinalResponse(messages, openAiTools);
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
    messages.push({
      role: 'assistant',
      content: assistantMessage.content,
      tool_calls: assistantMessage.tool_calls,
    });

    // Filter and execute function tool calls
    const functionToolCalls = this.filterFunctionToolCalls(
      assistantMessage.tool_calls,
    );
    const toolResults = await this.executeToolCalls(
      sessionId,
      functionToolCalls,
    );

    // Add tool results to conversation
    messages.push(...toolResults);
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
      const result = await this.mcpClient.callTool(toolName, args);
      const duration = Date.now() - startTime;

      // Log successful tool execution
      this.logToolTrace(sessionId, toolName, args, result, 'success', duration);

      return {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
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
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify({ error: error.message }),
      };
    }
  }

  private async getFinalResponse(
    messages: Message[],
    openAiTools: any[],
  ): Promise<string> {
    // Force LLM to give final answer without tool calls
    const finalCompletion = await this.llm.chat(messages, openAiTools);
    const finalMessage = finalCompletion.choices[0].message;

    messages.push({
      role: 'assistant',
      content: finalMessage.content,
    });

    return finalMessage.content || 'Unable to generate response.';
  }

  private formatToolsForOpenAI(tools: any[]): any[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
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
  ): void {
    this.traceService.logToolTrace({
      sessionId,
      toolName,
      input,
      output,
      status,
      duration,
      timestamp: new Date(),
    });
  }
}
