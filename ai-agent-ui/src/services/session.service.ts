import api from "./api";
import type { Session } from "../types/chat.types";
import { getStoredSessions, storeSessions } from "../utils/storage";

// API endpoints
const ENDPOINTS = {
  SESSIONS: "/sessions",
  SESSION: (id: string) => `/sessions/${id}`,
  DELETE_SESSION: (id: string) => `/sessions/${id}`,
};

/**
 * Get all sessions
 */
export async function getSessions(): Promise<Session[]> {
  try {
    const response = await api.get<Session[]>(ENDPOINTS.SESSIONS);
    return response.data.map((session) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    }));
  } catch {
    // Fallback to local storage if API fails
    const stored = getStoredSessions();
    return stored;
  }
}

/**
 * Get a single session by ID
 */
export async function getSession(id: string): Promise<Session | null> {
  try {
    const response = await api.get<Session>(ENDPOINTS.SESSION(id));
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  } catch {
    // Fallback to local storage
    const sessions = getStoredSessions();
    return sessions.find((s) => s.id === id) || null;
  }
}

/**
 * Create a new session
 */
export async function createSession(title?: string): Promise<Session> {
  const sessionData = {
    title: title || `New Conversation ${new Date().toLocaleDateString()}`,
  };

  try {
    const response = await api.post<Session>(ENDPOINTS.SESSIONS, sessionData);
    const newSession: Session = {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };

    // Also store locally
    const sessions = getStoredSessions();
    storeSessions([newSession, ...sessions]);

    return newSession;
  } catch {
    // Create locally if API fails
    const newSession: Session = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: sessionData.title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    };

    const sessions = getStoredSessions();
    storeSessions([newSession, ...sessions]);

    return newSession;
  }
}

/**
 * Update a session
 */
export async function updateSession(
  id: string,
  updates: Partial<Pick<Session, "title" | "messageCount" | "lastMessage">>,
): Promise<Session | null> {
  try {
    const response = await api.patch<Session>(ENDPOINTS.SESSION(id), updates);
    const updatedSession: Session = {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };

    // Update local storage
    const sessions = getStoredSessions();
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s,
    );
    storeSessions(updated);

    return updatedSession;
  } catch {
    // Update locally
    const sessions = getStoredSessions();
    const session = sessions.find((s) => s.id === id);
    if (session) {
      const updated = { ...session, ...updates, updatedAt: new Date() };
      storeSessions(sessions.map((s) => (s.id === id ? updated : s)));
      return updated;
    }
    return null;
  }
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<boolean> {
  try {
    await api.delete(ENDPOINTS.DELETE_SESSION(id));
  } catch {
    // Continue with local deletion even if API fails
  }

  // Always remove from local storage
  const sessions = getStoredSessions();
  storeSessions(sessions.filter((s) => s.id !== id));

  return true;
}

/**
 * Clear all sessions
 */
export async function clearAllSessions(): Promise<boolean> {
  try {
    // Try to clear on server
    await api.delete(ENDPOINTS.SESSIONS);
  } catch {
    // Continue with local clear
  }

  storeSessions([]);
  return true;
}

/**
 * Get or create a default session
 */
export async function getOrCreateDefaultSession(): Promise<Session> {
  const sessions = await getSessions();

  if (sessions.length > 0) {
    // Return the most recent session
    return sessions[0];
  }

  // Create a new session if none exist
  return createSession();
}

export default {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  clearAllSessions,
  getOrCreateDefaultSession,
};
