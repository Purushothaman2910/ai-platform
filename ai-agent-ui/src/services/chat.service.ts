import api from "./api";
import type { AskRequest, AskResponse, Message } from "../types/chat.types";

// API endpoints
const ENDPOINTS = {
  ASK: "/agent/ask",
  MESSAGES: (sessionId: string) => `/sessions/${sessionId}/messages`,
  REGENERATE: (messageId: string) => `/messages/${messageId}/regenerate`,
};

/**
 * Send a question to the AI agent
 */
export async function askAgent(request: AskRequest): Promise<AskResponse> {
  const response = await api.post<AskResponse>(ENDPOINTS.ASK, request);
  return response.data;
}

/**
 * Get messages for a session
 */
export async function getSessionMessages(
  sessionId: string,
): Promise<Message[]> {
  const response = await api.get<Message[]>(ENDPOINTS.MESSAGES(sessionId));
  return response.data.map((msg) => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  }));
}

/**
 * Regenerate a response for a specific message
 */
export async function regenerateResponse(
  messageId: string,
): Promise<AskResponse> {
  const response = await api.post<AskResponse>(ENDPOINTS.REGENERATE(messageId));
  return response.data;
}

/**
 * Create a new user message
 */
export function createUserMessage(sessionId: string, content: string): Message {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    content,
    role: "user",
    timestamp: new Date(),
  };
}

/**
 * Create a new AI message
 */
export function createAIMessage(
  sessionId: string,
  content: string,
  toolCalls?: AskResponse["toolCalls"],
): Message {
  return {
    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    content,
    role: "assistant",
    timestamp: new Date(),
    toolCalls,
  };
}

/**
 * Create a loading message placeholder
 */
export function createLoadingMessage(sessionId: string): Message {
  return {
    id: `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    content: "",
    role: "assistant",
    timestamp: new Date(),
    isLoading: true,
  };
}

/**
 * Create an error message
 */
export function createErrorMessage(
  sessionId: string,
  errorMessage: string,
  _originalMessage?: string,
): Message {
  return {
    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    content: errorMessage,
    role: "assistant",
    timestamp: new Date(),
    error: errorMessage,
  };
}

export default {
  askAgent,
  getSessionMessages,
  regenerateResponse,
  createUserMessage,
  createAIMessage,
  createLoadingMessage,
  createErrorMessage,
};
