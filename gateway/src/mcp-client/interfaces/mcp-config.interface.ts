import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// src/mcp-client/interfaces/mcp-config.interface.ts
export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  enabled?: boolean;
  description?: string;
  env?: Record<string, string>;
}

export interface MCPConfiguration {
  servers: MCPServerConfig[];
}

export interface MCPServerConnection {
  name: string;
  description?: string;
  client: Client;
  transport: StdioClientTransport;
  enabled: boolean;
}

export interface ToolWithServer {
  name: string;
  description?: string;
  inputSchema: any;
  serverName: string;
}
