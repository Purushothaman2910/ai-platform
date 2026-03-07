import React, {
  useState,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { Box, TextField, IconButton, Tooltip, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { motion, AnimatePresence } from "framer-motion";
import { alpha } from "@mui/material/styles";
import {
  MAX_MESSAGE_LENGTH,
  WARNING_MESSAGE_LENGTH,
} from "../../types/chat.types";
import { gradients } from "../../theme/theme";

export interface ChatInputProps {
  /** Callback when message is submitted */
  onSend: (message: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Ask me anything...",
}) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textFieldRef = useRef<HTMLDivElement>(null);

  const isEmpty = message.trim().length === 0;
  const isOverLimit = message.length > MAX_MESSAGE_LENGTH;
  const isNearLimit = message.length > WARNING_MESSAGE_LENGTH && !isOverLimit;

  const handleSend = useCallback(() => {
    if (isEmpty || disabled || isOverLimit) return;

    onSend(message);
    setMessage("");

    // Reset focus after sending
    setTimeout(() => {
      textFieldRef.current?.querySelector("textarea")?.focus();
    }, 0);
  }, [message, disabled, isEmpty, isOverLimit, onSend]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Send on Enter (without Shift)
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      // Only limit if exceeding max length
      if (value.length <= MAX_MESSAGE_LENGTH + 100) {
        setMessage(value);
      }
    },
    [],
  );

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: alpha("#151B3B", 0.8),
        backdropFilter: "blur(10px)",
        borderTop: "1px solid",
        borderColor: "divider",
        px: { xs: 2, md: 3 },
        py: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "900px",
          mx: "auto",
          position: "relative",
        }}
      >
        {/* Attachment button */}
        <Tooltip title="Attach file" arrow placement="top">
          <IconButton
            disabled={disabled}
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: isFocused ? "primary.main" : "text.secondary",
              transition: "all 200ms ease",
              zIndex: 1,
            }}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        {/* Input field */}
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          minRows={1}
          maxRows={5}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          sx={{
            "& .MuiOutlinedInput-root": {
              pr: "52px",
              pl: "48px",
              py: 1,
              backgroundColor: "background.tertiary",
              borderRadius: "12px",
              transition: "all 200ms ease",
              ...(isFocused && {
                boxShadow: `0 0 0 3px ${alpha("#6366F1", 0.15)}`,
              }),
              ...(isOverLimit && {
                borderColor: "error.main",
              }),
            },
            "& .MuiInputBase-input": {
              fontSize: "14px",
              lineHeight: 1.5,
              "&::placeholder": {
                color: "#64748B",
                opacity: 1,
              },
            },
          }}
        />

        {/* Send button */}
        <AnimatePresence mode="wait">
          {!isEmpty && !disabled && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Tooltip title="Send message" arrow placement="top">
                <IconButton
                  onClick={handleSend}
                  disabled={isEmpty || disabled || isOverLimit}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 40,
                    height: 40,
                    background: gradients.accent,
                    color: "white",
                    transition: "all 200ms ease",
                    "&:hover": {
                      transform: "translateY(-50%) scale(1.05)",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                    },
                    "&:active": {
                      transform: "translateY(-50%) scale(0.95)",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "background.tertiary",
                      color: "#64748B",
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character counter */}
        {isNearLimit && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              right: 56,
              bottom: -20,
              color: isOverLimit ? "error.main" : "#64748B",
              fontSize: "11px",
            }}
          >
            {message.length}/{MAX_MESSAGE_LENGTH}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChatInput;
