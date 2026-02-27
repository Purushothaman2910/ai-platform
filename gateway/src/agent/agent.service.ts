import { Injectable } from '@nestjs/common';
import { OpenRouterService } from '../llm/openrouter.service';
import { McpClientService } from 'src/mcp-client/mcp-client.service';

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

    console.log('openAiTools : ', JSON.stringify(openAiTools, null, 2));

    const completion = await this.llm.chat(
      [
        {
          role: 'system',
          content: `You are a helpful assistant. You can use the following tools: ${tools?.tools.map((tool) => tool.name).join(', ')}`,
        },
        { role: 'user', content: question },
      ],
      openAiTools,
    );

    console.log('completion : ', JSON.stringify(completion, null, 2));

    const msg = completion.choices[0].message;

    if (msg.tool_calls?.length) {
      const toolCall = msg.tool_calls[0];

      if (toolCall.type === 'function' && 'function' in toolCall) {
        console.log('🔧 Tool call detected:', {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        });

        // Parse arguments, default to empty object if null/undefined
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const args = toolCall.function.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};

        console.log('📤 Calling MCP tool with:', {
          name: toolCall.function.name,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          args,
        });

        const result = await this.mcpClient.callTool(
          toolCall.function.name,
          args,
        );

        console.log('📥 MCP tool result:', result);
        return result;
      }
    }

    return msg.content;
  }
}
