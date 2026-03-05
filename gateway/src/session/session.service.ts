import { Injectable } from '@nestjs/common';

type Message =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: any[] }
  | { role: 'tool'; tool_call_id: string; content: string };

@Injectable()
export class SessionService {
  private sessions = new Map<string, Message[]>();

  createSession(sessionId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
  }

  getMessages(sessionId: string): Message[] {
    return this.sessions.get(sessionId) || [];
  }

  addMessage(sessionId: string, message: Message) {
    const messages = this.sessions.get(sessionId) || [];
    messages.push(message);
    this.sessions.set(sessionId, messages);
  }

  setMessages(sessionId: string, messages: Message[]) {
    this.sessions.set(sessionId, messages);
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}
