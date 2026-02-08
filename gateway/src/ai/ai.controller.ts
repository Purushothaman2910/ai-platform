import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('test')
  async test(@Query('q') prompt: string): Promise<string> {
    return this.ai.testModel(prompt);
  }
}
