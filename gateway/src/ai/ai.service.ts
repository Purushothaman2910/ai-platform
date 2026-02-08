import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  async testModel(prompt: string): Promise<any> {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct', //  model id
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}
