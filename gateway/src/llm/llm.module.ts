import { Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [OpenRouterService],
  exports: [OpenRouterService],
})
export class LlmModule {}
