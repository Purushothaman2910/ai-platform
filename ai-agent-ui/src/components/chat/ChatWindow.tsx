import React, { useCallback } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "../../types/chat.types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageSkeleton } from "../common/LoadingSpinner";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { staggerContainerVariants } from "../../theme/animations";

export interface ChatWindowProps {
  /** List of messages */
  messages: Message[];
  /** Whether the chat is loading */
  isLoading?: boolean;
  /** Whether the AI is typing */
  isTyping?: boolean;
  /** Callback when message is sent */
  onSendMessage: (message: string) => void;
  /** Callback for new chat */
  onNewChat?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading = false,
  isTyping = false,
  onSendMessage,
  onNewChat,
}) => {
  const { containerRef } = useAutoScroll([messages, isTyping], {
    offset: 100,
  });

  const handleSendMessage = useCallback(
    (message: string) => {
      onSendMessage(message);
    },
    [onSendMessage],
  );

  const handlePromptClick = useCallback(
    (prompt: string) => {
      onSendMessage(prompt);
    },
    [onSendMessage],
  );

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* Message list area */}
      <Box
        ref={containerRef as React.RefObject<HTMLDivElement>}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: { xs: 2, md: 3 },
          py: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Welcome screen when empty */}
        {isEmpty && (
          <WelcomeScreen
            onPromptClick={handlePromptClick}
            onNewChat={onNewChat}
          />
        )}

        {/* Message list */}
        {!isEmpty && (
          <Box
            sx={{
              maxWidth: "900px",
              width: "100%",
              mx: "auto",
              pt: 2,
            }}
          >
            {/* Loading skeletons */}
            {isLoading && messages.length === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <MessageSkeleton isUser={false} />
                <MessageSkeleton isUser />
              </Box>
            )}

            {/* Messages */}
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {messages
                  .filter(
                    (message) =>
                      message.role !== "system" &&
                      !(
                        message.role === "assistant" &&
                        (!message.content || message.content.trim() === "")
                      )
                  )
                  .map((message, index, filteredMessages) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isLast={index === filteredMessages.length - 1}
                    />
                  ))}
              </AnimatePresence>
            </motion.div>

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}
          </Box>
        )}
      </Box>

      {/* Chat input */}
      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </Box>
  );
};

export default ChatWindow;
