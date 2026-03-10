import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "../../types/chat.types";
import { Avatar } from "../common/Avatar";
import { MessageActions } from "./MessageActions";
import {
  formatRelativeTime,
  formatTokenCount,
  formatProcessingTime,
} from "../../utils/formatters";
import { userMessageVariants, aiMessageVariants } from "../../theme/animations";
import { colors } from "../../theme/theme";
import { alpha } from "@mui/material/styles";

export interface MessageBubbleProps {
  /** Message data */
  message: Message;
  /** Callback for like action */
  onLike?: () => void;
  /** Callback for dislike action */
  onDislike?: () => void;
  /** Whether this is the last message */
  isLast?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onLike,
  onDislike,
  isLast = false,
}) => {
  const isUser = message.role === "user";
  const isLoading = message.isLoading;
  const hasError = !!message.error;

  // Select the appropriate animation variants
  const variants = isUser ? userMessageVariants : aiMessageVariants;

  // Render code blocks with syntax highlighting
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                animation: "pulse 1.5s infinite",
                animationDelay: `${i * 0.15}s`,
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 0.4 },
                  "50%": { opacity: 1 },
                },
              }}
            />
          ))}
        </Box>
      );
    }

    if (hasError) {
      return (
        <Typography
          sx={{
            color: "error.main",
            fontSize: "14px",
          }}
        >
          {message.content || message.error}
        </Typography>
      );
    }

    return (
      <ReactMarkdown
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            if (isInline) {
              return (
                <code
                  style={{
                    backgroundColor: alpha(colors.accent.primary, 0.15),
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <Box sx={{ position: "relative", my: 1 }}>
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </Box>
            );
          },
          p: ({ children }) => (
            <Typography
              component="p"
              sx={{
                fontSize: "14px",
                lineHeight: 1.6,
                "&:not(:last-child)": { mb: 1 },
              }}
            >
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
            <Box
              component="ul"
              sx={{
                pl: 2,
                mb: 1,
                "& li": {
                  mb: 0.5,
                },
              }}
            >
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box
              component="ol"
              sx={{
                pl: 2,
                mb: 1,
                "& li": {
                  mb: 0.5,
                },
              }}
            >
              {children}
            </Box>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.accent.primary,
                textDecoration: "none",
              }}
            >
              {children}
            </a>
          ),
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout={isLast}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          gap: 1.5,
          alignItems: "flex-start",
          maxWidth: "100%",
          position: "relative",
          mb: 2,
        }}
      >
        {/* Avatar for AI messages */}
        {!isUser && <Avatar type="ai" size="medium" />}

        {/* Message bubble */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "70%",
            position: "relative",
          }}
        >
          <Box
            sx={{
              background: isUser
                ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                : "background.secondary",
              color: isUser ? "white" : "text.primary",
              borderRadius: isUser
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              padding: "12px 16px",
              border: isUser ? "none" : "1px solid",
              borderColor: hasError ? "error.main" : "divider",
              boxShadow: isUser
                ? "0 2px 8px rgba(99, 102, 241, 0.2)"
                : "0 2px 8px rgba(0, 0, 0, 0.2)",
              wordBreak: "break-word",
              position: "relative",
            }}
          >
            {/* Error indicator */}
            {hasError && (
              <Box
                sx={{
                  position: "absolute",
                  top: -8,
                  right: 8,
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: `8px solid ${colors.status.error}`,
                }}
              />
            )}

            {/* Message content */}
            {renderContent()}

            {/* Message actions for AI messages */}
            {!isUser && !isLoading && !hasError && (
              <MessageActions
                content={message.content}
                onLike={onLike}
                onDislike={onDislike}
              />
            )}
          </Box>

          {/* Timestamp and metadata */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 0.5,
              px: 1,
              justifyContent: isUser ? "flex-end" : "flex-start",
            }}
          >
            {/* Timestamp */}
            <Typography
              variant="caption"
              sx={{
                color: "text.tertiary",
                fontSize: "11px",
              }}
            >
              {formatRelativeTime(message.timestamp)}
            </Typography>

            {/* Token count */}
            {message.metadata?.tokenCount && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.tertiary",
                  fontSize: "11px",
                }}
              >
                {formatTokenCount(message.metadata.tokenCount)}
              </Typography>
            )}

            {/* Processing time */}
            {message.metadata?.processingTime && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.tertiary",
                  fontSize: "11px",
                }}
              >
                {formatProcessingTime(message.metadata.processingTime)}
              </Typography>
            )}

            {/* Server badge */}
            {message.metadata?.serverName && (
              <Chip
                label={message.metadata.serverName}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "10px",
                  backgroundColor: alpha(colors.accent.primary, 0.1),
                  color: "primary.main",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default MessageBubble;
