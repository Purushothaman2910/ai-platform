import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../llm/openrouter.service';
import { McpClientService } from 'src/mcp-client/mcp-client.service';

type Message =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: any[] }
  | { role: 'tool'; tool_call_id: string; content: string };

@Injectable()
export class AgentService {
  constructor(
    private readonly llm: OpenRouterService,
    private readonly mcpClient: McpClientService,
  ) {}

  async ask(question: string) {
    const tools = await this.mcpClient.listTools();

    const openAiTools = tools.tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a helpful assistant. You can use the following tools: ${tools?.tools.map((tool) => tool.name).join(', ')}`,
      },
      { role: 'user', content: question },
    ];

    // First LLM call
    const completion = await this.llm.chat(messages, openAiTools);
    const msg = completion.choices[0].message;

    if (msg.tool_calls?.length) {
      console.log(`🔧 Processing ${msg.tool_calls.length} tool call(s)`);

      // Add assistant's message with tool calls to conversation
      messages.push({
        role: 'assistant',
        content: msg?.content,
        tool_calls: msg.tool_calls,
      });

      // Filter function tool calls
      const functionToolCalls = msg.tool_calls.filter(
        (toolCall) => toolCall.type === 'function' && 'function' in toolCall,
      );

      // Execute all function tool calls
      const toolResults = await Promise.all(
        functionToolCalls.map(async (toolCall) => {
          console.log('📤 Calling tool:', toolCall.function.name);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const args = toolCall.function.arguments
            ? JSON.parse(toolCall.function.arguments)
            : {};

          try {
            const result = await this.mcpClient.callTool(
              toolCall.function.name,
              args,
            );
            console.log('✅ Result from', toolCall.function.name);

            // Return in the format expected by OpenAI
            return {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            };
          } catch (error) {
            console.error('❌ Error calling', toolCall.function.name, error);
            return {
              role: 'tool',
              tool_call_id: toolCall.id,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              content: JSON.stringify({ error: error.message }),
            };
          }
        }),
      );

      // Add all tool results to the conversation
      messages.push(...(toolResults as Message[]));

      // Get LLM's final natural language response
      const finalCompletion = await this.llm.chat(messages, openAiTools);
      return finalCompletion.choices[0].message.content;
    }

    // No tool calls, return direct response
    return msg.content;
  }
}
