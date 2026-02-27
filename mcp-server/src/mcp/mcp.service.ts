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
import path from 'path';
import * as fs from 'fs';

@Injectable()
export class McpService implements OnModuleInit {
  private server: Server;

  constructor(private readonly productService: ProductService) {}

  private logFile = path.join(__dirname, '../../mcp-server.log');

  private log(message: string) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(this.logFile, `[${timestamp}] ${message}\n`);
  }

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
    this.log('Registering tools...');
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
        this.log(`Tool call received: ${request.params.name}`);
        this.log(`Arguments: ${JSON.stringify(request.params.arguments)}`);
        switch (request.params.name) {
          case 'get_all_products':
            this.log('Executing get_all_products');
            return await this.getAllProducts();
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      },
    );
  }

  private async getAllProducts() {
    this.log('Fetching all products...');
    const products = await this.productService.findAll();

    if (products.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No products found',
          },
        ],
      };
    }

    this.log(`Found ${products.length} products`);
    this.log(`Found ${JSON.stringify(products)} products`);

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
