import { Injectable, Logger } from '@nestjs/common';
import { ToolTrace } from './types/trace.types';

@Injectable()
export class TraceService {
  private readonly logger = new Logger('ToolTrace');

  logToolTrace(trace: ToolTrace) {
    this.logger.log(
      JSON.stringify({
        tool: trace.toolName,
        duration: trace.duration,
        status: trace.status,
      }),
    );

    console.log('🔎 TOOL TRACE:', JSON.stringify(trace, null, 2));
  }
}
