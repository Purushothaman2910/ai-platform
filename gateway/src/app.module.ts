import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, AiController],
  providers: [AppService, AiService],
})
export class AppModule {}
