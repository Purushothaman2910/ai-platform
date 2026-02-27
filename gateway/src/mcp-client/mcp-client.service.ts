import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ChildProcess, spawn } from 'child_process';

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private serverProcess: ChildProcess;
  private transport: StdioClientTransport;

  async onModuleInit() {
    try {
      // Manually spawn the process to capture logs
      this.serverProcess = spawn('node', ['../mcp-server/dist/main.js'], {
        stdio: ['pipe', 'pipe', 'inherit'], // inherit stderr to see logs
      });

      // Capture server logs
      this.serverProcess.stderr?.on('data', (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        console.log('📝 MCP Server log:', data.toString());
      });

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
    console.log('🔧 Gateway calling tool:', name, 'with args:', args);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.client.callTool({ name, arguments: args });
      console.log(
        '✅ Gateway received result:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('❌ Gateway tool call error:', error);
      throw error;
    }
  }
}
