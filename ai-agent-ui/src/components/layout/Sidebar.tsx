import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChatIcon from "@mui/icons-material/Chat";
import { motion, AnimatePresence } from "framer-motion";
import { alpha } from "@mui/material/styles";
import type { Session } from "../../types/chat.types";
import { ChatListSkeleton } from "../common/LoadingSpinner";
import { formatRelativeTime } from "../../utils/formatters";
import { useMediaQuery, useTheme } from "@mui/material";

export interface SidebarProps {
  /** Whether the sidebar is open */
  open: boolean;
  /** List of sessions */
  sessions: Session[];
  /** Current active session */
  currentSession: Session | null;
  /** Whether sessions are loading */
  isLoading?: boolean;
  /** Callback when session is selected */
  onSessionSelect: (session: Session) => void;
  /** Callback for new chat */
  onNewChat: () => void;
  /** Callback when session is deleted */
  onSessionDelete: (sessionId: string) => void;
  /** Callback when sidebar should close */
  onClose: () => void;
}

const SIDEBAR_WIDTH = 280;

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  sessions,
  currentSession,
  isLoading = false,
  onSessionSelect,
  onNewChat,
  onSessionDelete,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const handleSessionClick = (session: Session) => {
    onSessionSelect(session);
    if (isMobile) {
      onClose();
    }
  };

  const content = (
    <Box
      sx={{
        width: isMobile ? "100%" : SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.secondary",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Sessions
        </Typography>
      </Box>

      {/* New Chat button */}
      <Box sx={{ px: 2, pb: 2 }}>
        <ListItemButton
          onClick={onNewChat}
          sx={{
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            color: "white",
            py: 1.5,
            "&:hover": {
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              opacity: 0.9,
            },
          }}
        >
          <AddIcon sx={{ mr: 1, fontSize: 20 }} />
          <ListItemText
            primary="New Chat"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: "14px",
            }}
          />
        </ListItemButton>
      </Box>

      <Divider sx={{ borderColor: "divider" }} />

      {/* Sessions list */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 1,
        }}
      >
        {isLoading ? (
          <ChatListSkeleton count={5} />
        ) : sessions.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
            }}
          >
            <ChatIcon
              sx={{
                fontSize: 48,
                color: "text.tertiary",
                mb: 1,
              }}
            />
            <Typography
              sx={{
                color: "text.tertiary",
                fontSize: "14px",
              }}
            >
              No conversations yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ px: 1 }}>
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItemButton
                    selected={currentSession?.id === session.id}
                    onClick={() => handleSessionClick(session)}
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                    sx={{
                      borderRadius: "10px",
                      mb: 0.5,
                      py: 1.5,
                      "&.Mui-selected": {
                        backgroundColor: alpha("#6366F1", 0.15),
                        "&:hover": {
                          backgroundColor: alpha("#6366F1", 0.2),
                        },
                      },
                    }}
                  >
                    <ChatIcon
                      sx={{
                        mr: 1.5,
                        fontSize: 20,
                        color:
                          currentSession?.id === session.id
                            ? "primary.main"
                            : "text.secondary",
                      }}
                    />
                    <ListItemText
                      primary={session.title}
                      secondary={`${session.messageCount} messages`}
                      primaryTypographyProps={{
                        fontSize: "14px",
                        fontWeight: 500,
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{
                        fontSize: "12px",
                        color: "text.tertiary",
                      }}
                      sx={{
                        overflow: "hidden",
                      }}
                    />

                    {/* Timestamp and delete button */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.tertiary",
                          fontSize: "11px",
                        }}
                      >
                        {formatRelativeTime(session.updatedAt)}
                      </Typography>

                      {/* Delete button on hover */}
                      <AnimatePresence>
                        {hoveredSession === session.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Tooltip title="Delete" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSessionDelete(session.id);
                                }}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  color: "text.tertiary",
                                  "&:hover": {
                                    color: "error.main",
                                    backgroundColor: alpha("#EF4444", 0.1),
                                  },
                                }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Box>
                  </ListItemButton>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.tertiary",
            fontSize: "11px",
          }}
        >
          {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
        </Typography>
      </Box>
    </Box>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            backgroundColor: "background.secondary",
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  // Desktop drawer (permanent)
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          backgroundColor: "background.secondary",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default Sidebar;
