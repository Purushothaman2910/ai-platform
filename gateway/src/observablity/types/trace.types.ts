export interface ToolTrace {
  sessionId: string;
  toolName: string;
  input: any;
  output: any;
  status: 'success' | 'error';
  duration: number;
  timestamp: Date;
  metadata?: {
    serverName?: string;
  };
}
