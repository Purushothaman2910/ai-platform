import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';
import { LlmModule } from './llm/llm.module';
import { AgentModule } from './agent/agent.module';
import { McpClientModule } from './mcp-client/mcp-client.module';

@Module({
  imports: [ConfigModule.forRoot(), LlmModule, AgentModule, McpClientModule],
  controllers: [AppController, AiController],
  providers: [AppService, AiService],
})
export class AppModule {}
