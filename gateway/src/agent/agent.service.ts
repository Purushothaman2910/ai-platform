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

    const completion = await this.llm.chat(
      [
        { role: 'user', content: question },
        {
          role: 'system',
          content: `You are a helpful assistant. You can use the following tools: ${tools?.tools.map((tool) => tool.name).join(', ')}`,
        },
      ],
      tools.tools,
    );

    const msg = completion.choices[0].message;

    if (msg.tool_calls?.length) {
      const toolCall = msg.tool_calls[0];

      // Type guard to check if it's a function tool call
      if (toolCall.type === 'function' && 'function' in toolCall) {
        return this.mcpClient.callTool(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments),
        );
      }
    }

    return msg.content;
  }
}
