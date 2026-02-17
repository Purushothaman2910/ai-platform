import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ChildProcess } from 'child_process';

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private serverProcess: ChildProcess;
  private transport: StdioClientTransport;

  async onModuleInit() {
    try {
      // Create transport with command configuration
      this.transport = new StdioClientTransport({
        command: 'node',
        args: ['../mcp-server/dist/main.js'],
      });

      this.client = new Client(
        {
          name: 'gateway',
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );

      await this.client.connect(this.transport);
      console.log('✅ Connected to MCP Server');
    } catch (error) {
      console.error('❌ Failed to connect to MCP Server:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.client) {
        await this.client.close();
      }
    } catch (error) {
      console.error('Error closing MCP client:', error);
    }
  }

  async listTools() {
    return this.client.listTools();
  }

  async callTool(name: string, args: any) {
    return this.client.callTool({ name, arguments: args });
  }
}
