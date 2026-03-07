import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import DnsIcon from "@mui/icons-material/Dns";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";
import type { Session } from "../../types/chat.types";
import { gradients } from "../../theme/theme";

export interface HeaderProps {
  /** Current session */
  currentSession: Session | null;
  /** Whether sidebar is open */
  sidebarOpen: boolean;
  /** Callback for menu toggle */
  onMenuToggle: () => void;
  /** Callback for new chat */
  onNewChat: () => void;
  /** Callback for settings */
  onSettings: () => void;
  /** Number of connected servers */
  serverCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  sidebarOpen: _sidebarOpen,
  onMenuToggle,
  onNewChat,
  onSettings,
  serverCount = 0,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 1, md: 2 },
        background: gradients.header,
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Left section - Menu and Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            onClick={onMenuToggle}
            sx={{
              color: "text.secondary",
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: gradients.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 700,
                color: "white",
              }}
            >
              AI
            </Typography>
          </Box>
          {!isMobile && (
            <Typography
              variant="h3"
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                background: `linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Agent Platform
            </Typography>
          )}
        </Box>
      </Box>

      {/* Center section - Session info (desktop only) */}
      {!isMobile && currentSession && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "8px",
              backgroundColor: alpha("#1E2749", 0.6),
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "text.primary",
                maxWidth: "300px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentSession.title}
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Right section - Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Connected servers badge */}
        <Tooltip
          title={`${serverCount} servers connected`}
          arrow
          placement="bottom"
        >
          <Badge
            badgeContent={serverCount}
            color="success"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#10B981",
                fontSize: "10px",
                height: "18px",
                minWidth: "18px",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                borderRadius: "8px",
                backgroundColor: alpha("#10B981", 0.1),
                border: "1px solid",
                borderColor: alpha("#10B981", 0.2),
              }}
            >
              <DnsIcon sx={{ fontSize: 16, color: "#10B981" }} />
              {!isMobile && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#10B981",
                  }}
                >
                  {serverCount} servers
                </Typography>
              )}
            </Box>
          </Badge>
        </Tooltip>

        {/* Settings button */}
        <Tooltip title="Settings" arrow placement="bottom">
          <IconButton
            onClick={onSettings}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: alpha("#6366F1", 0.1),
                color: "primary.main",
              },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>

        {/* New chat button */}
        <Tooltip title="New Chat" arrow placement="bottom">
          <Button
            variant="contained"
            onClick={onNewChat}
            startIcon={<AddIcon />}
            sx={{
              background: gradients.accent,
              borderRadius: "8px",
              px: 2,
              py: 1,
              fontSize: "14px",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.2)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              },
              display: { xs: "none", sm: "flex" },
            }}
          >
            New Chat
          </Button>
        </Tooltip>

        {/* Mobile new chat button */}
        <IconButton
          onClick={onNewChat}
          sx={{
            display: { xs: "flex", sm: "none" },
            background: gradients.accent,
            color: "white",
            "&:hover": {
              background: gradients.accent,
              opacity: 0.9,
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Header;
