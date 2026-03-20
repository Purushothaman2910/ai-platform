// Message types
export interface Message {
  id: string;
  sessionId: string;
  content: string;
  role: "user" | "assistant" | "system" | "tool";
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  toolCalls?: ToolCall[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokenCount?: number;
  serverName?: string;
  processingTime?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  result?: string;
  status: "pending" | "success" | "error";
}

// Session types
export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
}

// API types
export interface AskRequest {
  sessionId: string;
  question: string;
}

export interface AskResponse {
  response: string;
  sessionId: string;
  toolCalls?: ToolCall[];
  metadata?: {
    tokenCount?: number;
    processingTime?: number;
    serverName?: string;
  };
}

// Chat state types
export interface ChatState {
  messages: Message[];
  currentSession: Session | null;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

// Settings types
export interface ChatSettings {
  theme: "light" | "dark";
  model: string;
  temperature: number;
  maxTokens: number;
  connectedServers: Server[];
}

export interface Server {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  endpoint: string;
  tools: string[];
}

// UI state types
export interface UIState {
  sidebarOpen: boolean;
  settingsPanelOpen: boolean;
  mobileMenuOpen: boolean;
}

// Action types
export type ChatAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | {
      type: "UPDATE_MESSAGE";
      payload: { id: string; updates: Partial<Message> };
    }
  | { type: "DELETE_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SESSION"; payload: Session | null }
  | { type: "CLEAR_CHAT" };

export type UIAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; payload: boolean }
  | { type: "TOGGLE_SETTINGS_PANEL" }
  | { type: "SET_SETTINGS_PANEL_OPEN"; payload: boolean }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "SET_MOBILE_MENU_OPEN"; payload: boolean };

// Suggested prompts
export interface SuggestedPrompt {
  id: string;
  text: string;
  icon?: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Loading states
export type LoadingState = "idle" | "loading" | "success" | "error";

// Date formatting
export type DateFormat = "relative" | "absolute" | "time";

// Character limit
export const MAX_MESSAGE_LENGTH = 4000;
export const WARNING_MESSAGE_LENGTH = 2000;
