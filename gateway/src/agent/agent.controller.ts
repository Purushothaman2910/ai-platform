import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agent: AgentService) {}

  @Post('ask')
  ask(@Body('question') question: string) {
    return this.agent.ask(question);
  }
}
