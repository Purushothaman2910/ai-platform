import React from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DnsIcon from "@mui/icons-material/Dns";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";
import type { ChatSettings, Server } from "../../types/chat.types";
import { settingsPanelVariants } from "../../theme/animations";

export interface SettingsPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Current settings */
  settings: ChatSettings;
  /** Callback when settings change */
  onSettingsChange: (settings: Partial<ChatSettings>) => void;
  /** Callback when panel should close */
  onClose: () => void;
  /** Callback for clear history */
  onClearHistory: () => void;
}

const mockServers: Server[] = [
  {
    id: "1",
    name: "Products API",
    status: "connected",
    endpoint: "http://localhost:3001",
    tools: ["get_products", "create_product"],
  },
  {
    id: "2",
    name: "Files Server",
    status: "connected",
    endpoint: "http://localhost:3002",
    tools: ["read_file", "write_file"],
  },
  {
    id: "3",
    name: "Data Analysis",
    status: "connected",
    endpoint: "http://localhost:3003",
    tools: ["analyze_data", "generate_report"],
  },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  settings,
  onSettingsChange,
  onClose,
  onClearHistory,
}) => {
  const handleTemperatureChange = (_event: Event, value: number | number[]) => {
    onSettingsChange({ temperature: value as number });
  };

  const handleMaxTokensChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      onSettingsChange({ maxTokens: value });
    }
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ model: event.target.value });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400 },
          backgroundColor: "background.secondary",
        },
      }}
    >
      <motion.div
        variants={settingsPanelVariants}
        initial="closed"
        animate={open ? "open" : "closed"}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h2" sx={{ fontSize: "20px", fontWeight: 600 }}>
            Settings
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, overflowY: "auto", height: "calc(100% - 64px)" }}>
          {/* Theme toggle */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.secondary", mb: 1.5 }}
            >
              Appearance
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: "background.tertiary",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.theme === "dark"}
                    onChange={(e) =>
                      onSettingsChange({
                        theme: e.target.checked ? "dark" : "light",
                      })
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#6366F1",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#6366F1",
                        },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {settings.theme === "dark" ? (
                      <DarkModeIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <LightModeIcon sx={{ fontSize: 20 }} />
                    )}
                    <Typography variant="body2">Dark Mode</Typography>
                  </Box>
                }
              />
            </Box>
          </Box>

          {/* Model settings */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.secondary", mb: 1.5 }}
            >
              Model Configuration
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: "background.tertiary",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                label="Model"
                value={settings.model}
                onChange={handleModelChange}
                size="small"
                fullWidth
                placeholder="e.g., gpt-4"
              />

              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Temperature: {settings.temperature}
                </Typography>
                <Slider
                  value={settings.temperature}
                  onChange={handleTemperatureChange}
                  min={0}
                  max={2}
                  step={0.1}
                  sx={{
                    color: "#6366F1",
                    "& .MuiSlider-thumb": {
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 8px rgba(99, 102, 241, 0.16)",
                      },
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="caption" color="text.tertiary">
                    Precise
                  </Typography>
                  <Typography variant="caption" color="text.tertiary">
                    Creative
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Max Tokens"
                type="number"
                value={settings.maxTokens}
                onChange={handleMaxTokensChange}
                size="small"
                inputProps={{ min: 100, max: 32000 }}
              />
            </Box>
          </Box>

          {/* Connected servers */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.secondary", mb: 1.5 }}
            >
              Connected Servers
            </Typography>
            <List sx={{ p: 0 }}>
              {mockServers.map((server) => (
                <ListItem
                  key={server.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: "12px",
                    backgroundColor: "background.tertiary",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <DnsIcon
                      sx={{
                        color:
                          server.status === "connected" ? "#10B981" : "#EF4444",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={server.name}
                    secondary={server.endpoint}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: "14px",
                    }}
                    secondaryTypographyProps={{
                      fontSize: "12px",
                      color: "text.tertiary",
                    }}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={server.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          server.status === "connected"
                            ? alpha("#10B981", 0.1)
                            : alpha("#EF4444", 0.1),
                        color:
                          server.status === "connected" ? "#10B981" : "#EF4444",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ borderColor: "divider", my: 2 }} />

          {/* Clear history button */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={onClearHistory}
            fullWidth
            sx={{
              borderRadius: "10px",
              py: 1.5,
              borderColor: alpha("#EF4444", 0.5),
              "&:hover": {
                borderColor: "#EF4444",
                backgroundColor: alpha("#EF4444", 0.1),
              },
            }}
          >
            Clear Chat History
          </Button>
        </Box>
      </motion.div>
    </Drawer>
  );
};

export default SettingsPanel;
