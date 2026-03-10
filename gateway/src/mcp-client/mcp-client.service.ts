/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as fs from 'fs';
import * as path from 'path';
import {
  MCPConfiguration,
  MCPServerConfig,
  MCPServerConnection,
  ToolWithServer,
} from './interfaces/mcp-config.interface';

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpClientService.name);
  private servers: Map<string, MCPServerConnection> = new Map();
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'mcp-servers.config.json');
  }

  async onModuleInit() {
    await this.loadServersFromConfig();
  }

  async onModuleDestroy() {
    await this.disconnectAllServers();
  }

  /**
   * Load and connect to all MCP servers from configuration file
   */
  private async loadServersFromConfig(): Promise<void> {
    try {
      this.logger.log('📋 Loading MCP servers from config...');

      if (!fs.existsSync(this.configPath)) {
        this.logger.warn(
          `⚠️  Config file not found: ${this.configPath}. Creating default config...`,
        );
        this.createDefaultConfig();
      }

      const configFile = fs.readFileSync(this.configPath, 'utf-8');
      const config: MCPConfiguration = JSON.parse(configFile);

      if (!config.servers || config.servers.length === 0) {
        this.logger.warn('⚠️  No MCP servers configured');
        return;
      }

      // Connect to all enabled servers
      const connectionPromises = config.servers
        .filter((serverConfig) => serverConfig.enabled !== false)
        .map((serverConfig) => this.connectToServer(serverConfig));

      await Promise.allSettled(connectionPromises);

      this.logger.log(
        `✅ Successfully connected to ${this.servers.size} MCP server(s)`,
      );

      // Log connected servers
      this.servers.forEach((connection, name) => {
        this.logger.log(
          `   • ${name}${connection.description ? `: ${connection.description}` : ''}`,
        );
      });
    } catch (error) {
      this.logger.error('❌ Failed to load MCP server config:', error);
      throw error;
    }
  }

  /**
   * Connect to a single MCP server
   */
  private async connectToServer(config: MCPServerConfig): Promise<void> {
    try {
      this.logger.log(`🔌 Connecting to ${config.name}...`);

      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: config.env,
      });

      const client = new Client(
        {
          name: 'gateway',
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );

      await client.connect(transport);

      this.servers.set(config.name, {
        name: config.name,
        description: config.description,
        client,
        transport,
        enabled: true,
      });

      this.logger.log(`✅ Connected to ${config.name}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to connect to ${config.name}:`,
        error.message,
      );
      // Don't throw - allow other servers to connect
    }
  }

  /**
   * Disconnect from all MCP servers
   */
  private async disconnectAllServers(): Promise<void> {
    const disconnectPromises = Array.from(this.servers.entries()).map(
      async ([name, connection]) => {
        try {
          await connection.client.close();
          this.logger.log(`🔌 Disconnected from ${name}`);
        } catch (error) {
          this.logger.error(`Error closing ${name}:`, error);
        }
      },
    );

    await Promise.allSettled(disconnectPromises);
    this.servers.clear();
  }

  /**
   * Get all available tools from all connected servers
   */
  async listTools(): Promise<{ tools: ToolWithServer[] }> {
    const allTools: ToolWithServer[] = [];

    for (const [serverName, connection] of this.servers) {
      try {
        const result = await connection.client.listTools();

        // Add server name to each tool for tracking
        const toolsWithServer = result.tools.map((tool) => ({
          ...tool,
          serverName,
        }));

        allTools.push(...toolsWithServer);
      } catch (error) {
        this.logger.error(`❌ Error listing tools from ${serverName}:`, error);
      }
    }

    return { tools: allTools };
  }

  /**
   * Get tools from a specific server
   */
  async listToolsFromServer(serverName: string): Promise<any> {
    const connection = this.servers.get(serverName);

    if (!connection) {
      throw new Error(`Server '${serverName}' not found or not connected`);
    }

    return connection.client.listTools();
  }

  /**
   * Call a tool on any server that provides it
   */
  async callTool(name: string, args: any): Promise<any> {
    this.logger.log(`🔧 Looking for tool: ${name}`);

    // Search for the tool across all servers
    for (const [serverName, connection] of this.servers) {
      try {
        const tools = await connection.client.listTools();
        const tool = tools.tools.find((t) => t.name === name);

        if (tool) {
          this.logger.log(`📤 Calling ${name} on ${serverName}`);
          const result = await connection.client.callTool({
            name,
            arguments: args,
          });
          this.logger.log(`✅ Result from ${serverName}`);
          return result;
        }
      } catch (error) {
        this.logger.error(
          `❌ Error checking ${serverName} for tool ${name}:`,
          error,
        );
      }
    }

    throw new Error(`Tool '${name}' not found in any connected MCP server`);
  }

  /**
   * Call a tool on a specific server
   */
  async callToolOnServer(
    serverName: string,
    toolName: string,
    args: any,
  ): Promise<any> {
    const connection = this.servers.get(serverName);

    if (!connection) {
      throw new Error(`Server '${serverName}' not found or not connected`);
    }

    this.logger.log(`📤 Calling ${toolName} on ${serverName}`);

    const result = await connection.client.callTool({
      name: toolName,
      arguments: args,
    });

    this.logger.log(`✅ Result from ${serverName}`);
    return result;
  }

  /**
   * Get list of connected server names
   */
  getConnectedServers(): string[] {
    return Array.from(this.servers.keys());
  }

  /**
   * Get detailed info about connected servers
   */
  getServerInfo(): Array<{
    name: string;
    description?: string;
    enabled: boolean;
  }> {
    return Array.from(this.servers.values()).map((connection) => ({
      name: connection.name,
      description: connection.description,
      enabled: connection.enabled,
    }));
  }

  /**
   * Check if a specific server is connected
   */
  isServerConnected(serverName: string): boolean {
    return this.servers.has(serverName);
  }

  /**
   * Reload configuration and reconnect to servers
   */
  async reloadServers(): Promise<void> {
    this.logger.log('🔄 Reloading MCP servers...');
    await this.disconnectAllServers();
    await this.loadServersFromConfig();
  }

  /**
   * Enable a specific server
   */
  async enableServer(serverName: string): Promise<void> {
    const configFile = fs.readFileSync(this.configPath, 'utf-8');
    const config: MCPConfiguration = JSON.parse(configFile);

    const serverConfig = config.servers.find((s) => s.name === serverName);

    if (!serverConfig) {
      throw new Error(`Server '${serverName}' not found in config`);
    }

    if (this.servers.has(serverName)) {
      this.logger.warn(`Server '${serverName}' is already connected`);
      return;
    }

    await this.connectToServer(serverConfig);
  }

  /**
   * Disable a specific server
   */
  async disableServer(serverName: string): Promise<void> {
    const connection = this.servers.get(serverName);

    if (!connection) {
      this.logger.warn(`Server '${serverName}' is not connected`);
      return;
    }

    await connection.client.close();
    this.servers.delete(serverName);
    this.logger.log(`🔌 Disabled server: ${serverName}`);
  }

  /**
   * Create default configuration file
   */
  private createDefaultConfig(): void {
    const defaultConfig: MCPConfiguration = {
      servers: [
        {
          name: 'product-server',
          description: 'Product management MCP server',
          command: 'node',
          args: ['../mcp-server/dist/main.js'],
          enabled: true,
        },
      ],
    };

    fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));

    this.logger.log(`✅ Created default config at ${this.configPath}`);
  }
}
