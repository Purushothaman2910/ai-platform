import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { LlmModule } from 'src/llm/llm.module';
import { McpClientModule } from 'src/mcp-client/mcp-client.module';
import { SessionModule } from 'src/session/session.module';
import { ObservablityModule } from 'src/observablity/observablity.module';

@Module({
  imports: [LlmModule, McpClientModule, SessionModule, ObservablityModule],
  providers: [AgentService],
  controllers: [AgentController],
})
export class AgentModule {}
