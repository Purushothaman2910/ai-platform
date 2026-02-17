import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenRouterService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  async chat(messages: any[], tools: any[]) {
    return this.client.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct',
      messages,
      tools,
      tool_choice: 'auto',
    });
  }
}
