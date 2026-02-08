// src/mcp/mcp.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { ProductService } from '../product/product.service';

@Injectable()
export class McpService implements OnModuleInit {
  private server: Server;

  constructor(private readonly productService: ProductService) {}

  async onModuleInit() {
    await this.initializeMcpServer();
  }

  private async initializeMcpServer() {
    this.server = new Server(
      {
        name: 'product-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.registerTools();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  private registerTools() {
    // Register tools/list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_all_products',
            description: 'Get all products from the database',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Register tools/call handler
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        switch (request.params.name) {
          case 'get_all_products':
            return await this.getAllProducts();
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      },
    );
  }

  private async getAllProducts() {
    const products = await this.productService.findAll();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(products, null, 2),
        },
      ],
    };
  }
}
