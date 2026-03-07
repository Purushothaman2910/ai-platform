import type { Session, ChatSettings } from "../types/chat.types";

// Storage keys
const STORAGE_KEYS = {
  SESSIONS: "ai_agent_sessions",
  SETTINGS: "ai_agent_settings",
  CURRENT_SESSION: "ai_agent_current_session",
  MESSAGES: "ai_agent_messages",
};

/**
 * Get stored sessions from localStorage
 */
export function getStoredSessions(): Session[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (stored) {
      return JSON.parse(stored).map((session: Session) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      }));
    }
  } catch (error) {
    console.error("Error reading sessions from storage:", error);
  }
  return [];
}

/**
 * Store sessions in localStorage
 */
export function storeSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error storing sessions:", error);
  }
}

/**
 * Get stored settings from localStorage
 */
export function getStoredSettings(): ChatSettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading settings from storage:", error);
  }
  return null;
}

/**
 * Store settings in localStorage
 */
export function storeSettings(settings: ChatSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Error storing settings:", error);
  }
}

/**
 * Get current session ID from localStorage
 */
export function getCurrentSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch {
    return null;
  }
}

/**
 * Store current session ID in localStorage
 */
export function setCurrentSessionId(sessionId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
  } catch (error) {
    console.error("Error storing current session ID:", error);
  }
}

/**
 * Get messages for a specific session from localStorage
 */
export function getStoredMessages(sessionId: string): string | null {
  try {
    const key = `${STORAGE_KEYS.MESSAGES}_${sessionId}`;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Store messages for a specific session in localStorage
 */
export function storeMessages(sessionId: string, messages: unknown[]): void {
  try {
    const key = `${STORAGE_KEYS.MESSAGES}_${sessionId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error("Error storing messages:", error);
  }
}

/**
 * Clear messages for a specific session
 */
export function clearSessionMessages(sessionId: string): void {
  try {
    const key = `${STORAGE_KEYS.MESSAGES}_${sessionId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing session messages:", error);
  }
}

/**
 * Clear all stored data
 */
export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

export default {
  getStoredSessions,
  storeSessions,
  getStoredSettings,
  storeSettings,
  getCurrentSessionId,
  setCurrentSessionId,
  getStoredMessages,
  storeMessages,
  clearSessionMessages,
  clearAllStorage,
};
