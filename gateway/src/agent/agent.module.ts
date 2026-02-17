import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { LlmModule } from 'src/llm/llm.module';
import { McpClientModule } from 'src/mcp-client/mcp-client.module';

@Module({
  imports: [LlmModule, McpClientModule],
  providers: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
