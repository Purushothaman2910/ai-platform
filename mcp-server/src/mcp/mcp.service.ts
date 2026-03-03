/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
          {
            name: 'get_product_by_id',
            description: 'Get a single product by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'ID of the product',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'add_product',
            description: 'Add a new product to the database',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the product',
                },
                price: {
                  type: 'number',
                  description: 'Price of the product',
                },
                stock: {
                  type: 'number',
                  description: 'Available stock quantity',
                },
                description: {
                  type: 'string',
                  description: 'Product description (optional)',
                },
              },
              required: ['name', 'price', 'stock'],
            },
          },
          {
            name: 'update_product',
            description: 'Update an existing product',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'ID of the product to update',
                },
                name: {
                  type: 'string',
                  description: 'Name of the product',
                },
                price: {
                  type: 'number',
                  description: 'Price of the product',
                },
                stock: {
                  type: 'number',
                  description: 'Available stock quantity',
                },
                description: {
                  type: 'string',
                  description: 'Product description',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'delete_product',
            description: 'Delete a product from the database',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'ID of the product to delete',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_products_by_filters',
            description:
              'Get products filtered by criteria (name, price range, stock availability)',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Filter by product name (partial match)',
                },
                minPrice: {
                  type: 'number',
                  description: 'Minimum price',
                },
                maxPrice: {
                  type: 'number',
                  description: 'Maximum price',
                },
                inStock: {
                  type: 'boolean',
                  description: 'Filter for in-stock products only',
                },
              },
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

        try {
          switch (request.params.name) {
            case 'get_all_products':
              this.log('Executing get_all_products');
              return await this.getAllProducts();

            case 'get_product_by_id':
              this.log('Executing get_product_by_id');
              return await this.getProductById(request.params.arguments);

            case 'add_product':
              this.log('Executing add_product');
              return await this.addProduct(request.params.arguments);

            case 'update_product':
              this.log('Executing update_product');
              return await this.updateProduct(request.params.arguments);

            case 'delete_product':
              this.log('Executing delete_product');
              return await this.deleteProduct(request.params.arguments);

            case 'get_products_by_filters':
              this.log('Executing get_products_by_filters');
              return await this.getProductsByFilters(request.params.arguments);

            default:
              throw new Error(`Unknown tool: ${request.params.name}`);
          }
        } catch (error: any) {
          this.log(`Error executing tool: ${error.message}`);
          return {
            content: [
              {
                type: 'text',

                text: JSON.stringify({ error: error.message }),
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  // ============= CRUD Operations =============

  private async getAllProducts() {
    this.log('Fetching all products...');
    const products = await this.productService.findAll();

    if (products.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No products found in the database.',
          },
        ],
      };
    }

    this.log(`Found ${products.length} products`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(products, null, 2),
        },
      ],
    };
  }

  private async getProductById(args: any) {
    this.log(`Fetching product with ID: ${args.id}`);

    const product = await this.productService.findOne(args.id);

    if (!product) {
      return {
        content: [
          {
            type: 'text',
            text: `Product with ID ${args.id} not found.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(product, null, 2),
        },
      ],
    };
  }

  private async addProduct(args: any) {
    this.log('Adding new product...');

    const product = await this.productService.create(args);

    this.log(`Product created with ID: ${product.id}`);

    return {
      content: [
        {
          type: 'text',
          text: `Product added successfully. ${JSON.stringify(product, null, 2)}`,
        },
      ],
    };
  }

  private async updateProduct(args: any) {
    this.log(`Updating product with ID: ${args.id}`);

    const { id, ...updateData } = args;

    const updatedProduct = await this.productService.update(id, updateData);

    if (!updatedProduct) {
      return {
        content: [
          {
            type: 'text',
            text: `Product with ID ${id} not found.`,
          },
        ],
      };
    }

    this.log(`Product ${id} updated successfully`);

    return {
      content: [
        {
          type: 'text',
          text: `Product updated successfully. ${JSON.stringify(updatedProduct, null, 2)}`,
        },
      ],
    };
  }

  private async deleteProduct(args: any) {
    this.log(`Deleting product with ID: ${args.id}`);

    const result = await this.productService.delete(args.id);

    if (!result) {
      return {
        content: [
          {
            type: 'text',
            text: `Product with ID ${args.id} not found.`,
          },
        ],
      };
    }

    this.log(`Product ${args.id} deleted successfully`);

    return {
      content: [
        {
          type: 'text',
          text: `Product with ID ${args.id} deleted successfully.`,
        },
      ],
    };
  }

  private async getProductsByFilters(args: any) {
    this.log('Getting products by filters...');
    this.log(`Filters: ${JSON.stringify(args)}`);

    const products = await this.productService.getProductsByFilters(args);

    if (products.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No products found matching the filters.',
          },
        ],
      };
    }

    this.log(`Found ${products.length} products matching filters`);

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
