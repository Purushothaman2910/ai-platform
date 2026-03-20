import { Injectable } from '@nestjs/common';

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  timestamp: Date;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface Session {
  id: string;
  title: string;
}

@Injectable()
export class SessionService {
  private sessions = new Map<string, Message[]>();

  findAll(): Session[] {
    return Array.from(this.sessions.keys()).map((id) => ({
      id,
      title: `Conversation ${id}`, // Simple fallback title
    }));
  }

  findOne(id: string): Session | null {
    if (this.sessions.has(id)) {
      return { id, title: `Conversation ${id}` };
    }
    return null;
  }

  createSession(sessionId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    return { id: sessionId, title: `Conversation ${sessionId}` };
  }

  getMessages(sessionId: string): Message[] {
    const messages = this.sessions.get(sessionId);
    return messages ? [...messages] : [];
  }

  addMessage(sessionId: string, message: Message) {
    const messages = this.sessions.get(sessionId) || [];
    messages.push(message);
    this.sessions.set(sessionId, messages);
  }

  setMessages(sessionId: string, messages: Message[]) {
    this.sessions.set(sessionId, messages);
  }

  delete(id: string) {
    this.sessions.delete(id);
  }

  deleteAll() {
    this.sessions.clear();
  }
}
