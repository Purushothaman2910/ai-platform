import React, { useState, useCallback } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  type AlertColor,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ChatSettings, Session } from "../types/chat.types";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { SettingsPanel } from "../components/layout/SettingsPanel";
import { ChatWindow } from "../components/chat/ChatWindow";
import { useChat } from "../hooks/useChat";
import {
  getStoredSettings,
  storeSettings,
  clearAllStorage,
} from "../utils/storage";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Default settings
const defaultSettings: ChatSettings = {
  theme: "dark",
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 2000,
  connectedServers: [],
};

export const ChatPageContent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(() => {
    const stored = getStoredSettings();
    return stored || defaultSettings;
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  // Chat hook
  const {
    messages,
    currentSession,
    sessions,
    isLoading,
    isTyping,
    error,
    sendMessage,
    createNewSession,
    switchSession,
    deleteSession,
    clearChat,
  } = useChat();

  // Handlers
  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(async () => {
    await createNewSession();
    setSidebarOpen(!isMobile);
  }, [createNewSession, isMobile]);

  const handleSettingsOpen = useCallback(() => {
    setSettingsPanelOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsPanelOpen(false);
  }, []);

  const handleSettingsChange = useCallback(
    (newSettings: Partial<ChatSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        storeSettings(updated);
        return updated;
      });
    },
    [],
  );

  const handleSessionSelect = useCallback(
    (session: Session) => {
      switchSession(session);
    },
    [switchSession],
  );

  const handleSessionDelete = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId);
      setSnackbar({
        open: true,
        message: "Conversation deleted",
        severity: "success",
      });
    },
    [deleteSession],
  );

  const handleClearHistory = useCallback(() => {
    clearAllStorage();
    clearChat();
    setSettingsPanelOpen(false);
    setSnackbar({
      open: true,
      message: "Chat history cleared",
      severity: "success",
    });
  }, [clearChat]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Header
        currentSession={currentSession}
        sidebarOpen={sidebarOpen}
        onMenuToggle={handleMenuToggle}
        onNewChat={handleNewChat}
        onSettings={handleSettingsOpen}
        serverCount={settings.connectedServers.length || 3}
      />

      {/* Main content area */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          sessions={sessions}
          currentSession={currentSession}
          isLoading={isLoading}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onSessionDelete={handleSessionDelete}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Chat area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: { xs: "100%", md: `calc(100% - 280px)` },
          }}
        >
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            onNewChat={handleNewChat}
          />
        </Box>
      </Box>

      {/* Settings panel */}
      <SettingsPanel
        open={settingsPanelOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={handleSettingsClose}
        onClearHistory={handleClearHistory}
      />

      {/* Error snackbar */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      {/* Success snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ChatPage with QueryClient provider
export const ChatPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatPageContent />
    </QueryClientProvider>
  );
};

export default ChatPage;
