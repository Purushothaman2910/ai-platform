import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, ChatState } from "../types/chat.types";
import {
  askAgent,
  getSessionMessages,
  createUserMessage,
  createAIMessage,
  createLoadingMessage,
  createErrorMessage,
} from "../services/chat.service";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getOrCreateDefaultSession,
} from "../services/session.service";
import { setCurrentSessionId, getCurrentSessionId } from "../utils/storage";
import { generateSessionTitle } from "../utils/formatters";

// Initial state
const initialChatState: ChatState = {
  messages: [],
  currentSession: null,
  isLoading: false,
  isTyping: false,
  error: null,
};

export function useChat() {
  const queryClient = useQueryClient();
  const [chatState, setChatState] = useState<ChatState>(initialChatState);
  const isTypingRef = useRef(false);

  // Query for sessions
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
    staleTime: 1000 * 60, // 1 minute
  });

  // Query for messages when session changes
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ["messages", chatState.currentSession?.id],
    queryFn: () => getSessionMessages(chatState.currentSession!.id),
    enabled: !!chatState.currentSession,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Update chat state when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setChatState((prev) => ({
        ...prev,
        messages,
      }));
    }
  }, [messages]);

  // Initialize with default session
  useEffect(() => {
    const initSession = async () => {
      if (!chatState.currentSession) {
        const sessionId = getCurrentSessionId();

        if (sessionId) {
          const existingSession = sessions.find((s) => s.id === sessionId);
          if (existingSession) {
            setChatState((prev) => ({
              ...prev,
              currentSession: existingSession,
            }));
            return;
          }
        }

        // Create or get default session
        const defaultSession = await getOrCreateDefaultSession();
        setCurrentSessionId(defaultSession.id);
        setChatState((prev) => ({
          ...prev,
          currentSession: defaultSession,
        }));
      }
    };

    initSession();
  }, [sessions]);

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!chatState.currentSession) {
        throw new Error("No active session");
      }

      if (isTypingRef.current) {
        return null;
      }

      isTypingRef.current = true;

      // Create user message
      const userMessage = createUserMessage(
        chatState.currentSession.id,
        content,
      );

      // Create loading message with a unique ID for this specific request
      const loadingMessage = createLoadingMessage(chatState.currentSession.id);
      const loadingMessageId = loadingMessage.id;

      // Add messages to state immediately
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, loadingMessage],
        isTyping: true,
        error: null,
      }));

      try {
        // Send to API
        const response = await askAgent({
          sessionId: chatState.currentSession.id,
          question: content,
        });

        // Replace loading message with AI response
        const aiMessage = createAIMessage(
          chatState.currentSession.id,
          response.response,
          response.toolCalls,
        );

        // Update session with new title if it's a new conversation
        if (chatState.currentSession.messageCount === 0) {
          const title = generateSessionTitle(content);
          await updateSession(chatState.currentSession.id, {
            title,
            messageCount: 1,
            lastMessage: content,
          });
        } else {
          await updateSession(chatState.currentSession.id, {
            messageCount: (chatState.currentSession.messageCount || 0) + 1,
            lastMessage: content,
          });
        }

        return { userMessage, aiMessage, loadingMessageId };
      } catch (error) {
        isTypingRef.current = false;
        throw { error, loadingMessageId };
      } finally {
        isTypingRef.current = false;
      }
    },
    onSuccess: (data) => {
      if (!data) return;
      const { aiMessage, loadingMessageId } = data;

      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === loadingMessageId ? aiMessage : m,
        ),
        isTyping: false,
        error: null,
      }));

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", chatState.currentSession?.id],
      });
    },
    onError: (errorData: any) => {
      const { error, loadingMessageId } = errorData;
      const errorMessageString = error?.message || "Failed to get response";

      // Replace specific loading message with error
      const errorMessage = createErrorMessage(
        chatState.currentSession!.id,
        errorMessageString,
      );

      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === loadingMessageId ? errorMessage : m,
        ),
        isTyping: false,
        error: errorMessageString,
      }));
    },
  });

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || chatState.isTyping) {
        return;
      }

      await sendMessageMutation.mutateAsync(content.trim());
    },
    [chatState.currentSession, chatState.isTyping, sendMessageMutation],
  );

  // Create a new session
  const createNewSession = useCallback(async () => {
    const newSession = await createSession();
    setCurrentSessionId(newSession.id);

    setChatState((prev) => ({
      ...prev,
      currentSession: newSession,
      messages: [],
      error: null,
    }));

    queryClient.invalidateQueries({ queryKey: ["sessions"] });

    return newSession;
  }, [queryClient]);

  // Switch to a different session
  const switchSession = useCallback(async (session: Session) => {
    setCurrentSessionId(session.id);

    setChatState((prev) => ({
      ...prev,
      currentSession: session,
      messages: [],
      isLoading: true,
      error: null,
    }));

    // Messages will be loaded by the useQuery
    setChatState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  // Delete a session
  const deleteSessionById = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId);

      // If deleting current session, switch to another
      if (chatState.currentSession?.id === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          await switchSession(remaining[0]);
        } else {
          await createNewSession();
        }
      }

      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    [
      chatState.currentSession,
      sessions,
      queryClient,
      switchSession,
      createNewSession,
    ],
  );

  // Clear current chat
  const clearChat = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  return {
    // State
    messages: chatState.messages,
    currentSession: chatState.currentSession,
    sessions,
    isLoading: chatState.isLoading || isLoadingSessions || isLoadingMessages,
    isTyping: chatState.isTyping,
    error: chatState.error || sessionsError?.message || messagesError?.message,

    // Actions
    sendMessage,
    createNewSession,
    switchSession,
    deleteSession: deleteSessionById,
    clearChat,
  };
}

export default useChat;
