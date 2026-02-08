import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [ProductModule],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
