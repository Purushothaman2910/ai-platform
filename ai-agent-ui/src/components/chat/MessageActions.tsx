import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  type SnackbarCloseReason,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CheckIcon from "@mui/icons-material/Check";
import { motion, AnimatePresence } from "framer-motion";
import { alpha } from "@mui/material/styles";

export interface MessageActionsProps {
  /** Message content to copy */
  content: string;
  /** Callback for regenerate action */
  onRegenerate?: () => void;
  /** Callback for like action */
  onLike?: () => void;
  /** Callback for dislike action */
  onDislike?: () => void;
  /** Whether the message is loading */
  isLoading?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  onRegenerate,
  onLike,
  onDislike,
  isLoading = false,
}) => {
  const [showCopied, setShowCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setShowCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleCopiedClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setShowCopied(false);
  };

  return (
    <>
      <AnimatePresence>
        {hovered && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                position: "absolute",
                top: -32,
                right: 0,
                backgroundColor: "background.paper",
                borderRadius: "8px",
                padding: "2px 4px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Tooltip title="Copy" arrow placement="top">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    width: 28,
                    height: 28,
                    color: "text.secondary",
                    "&:hover": {
                      backgroundColor: alpha("#6366F1", 0.1),
                      color: "primary.main",
                    },
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {onRegenerate && (
                <Tooltip title="Regenerate" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={onRegenerate}
                    sx={{
                      width: 28,
                      height: 28,
                      color: "text.secondary",
                      "&:hover": {
                        backgroundColor: alpha("#6366F1", 0.1),
                        color: "primary.main",
                      },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {onLike && (
                <Tooltip title="Good response" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={onLike}
                    sx={{
                      width: 28,
                      height: 28,
                      color: "text.secondary",
                      "&:hover": {
                        backgroundColor: alpha("#10B981", 0.1),
                        color: "success.main",
                      },
                    }}
                  >
                    <ThumbUpIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {onDislike && (
                <Tooltip title="Poor response" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={onDislike}
                    sx={{
                      width: 28,
                      height: 28,
                      color: "text.secondary",
                      "&:hover": {
                        backgroundColor: alpha("#EF4444", 0.1),
                        color: "error.main",
                      },
                    }}
                  >
                    <ThumbDownIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible hover area */}
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />

      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={handleCopiedClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCopiedClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
          icon={<CheckIcon />}
        >
          Copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
};

export default MessageActions;
