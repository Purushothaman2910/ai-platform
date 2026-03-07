import React from "react";
import { Box, Typography, Chip, Button } from "@mui/material";
import { motion } from "framer-motion";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AddIcon from "@mui/icons-material/Add";
import {
  welcomeScreenVariants,
  staggerContainerVariants,
} from "../../theme/animations";
import { gradients } from "../../theme/theme";
import { alpha } from "@mui/material/styles";

export interface WelcomeScreenProps {
  /** Callback when a suggested prompt is clicked */
  onPromptClick?: (prompt: string) => void;
  /** Callback for new chat button */
  onNewChat?: () => void;
}

const suggestedPrompts = [
  { id: "1", text: "Show all products", icon: "📦" },
  { id: "2", text: "Create a report", icon: "📊" },
  { id: "3", text: "Search inventory", icon: "🔍" },
  { id: "4", text: "Analyze data", icon: "📈" },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onPromptClick,
  onNewChat,
}) => {
  return (
    <motion.div
      variants={welcomeScreenVariants}
      initial="hidden"
      animate="visible"
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "600px",
          px: 3,
        }}
      >
        {/* Glassmorphism background effect */}
        <Box
          sx={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: gradients.accent,
            filter: "blur(120px)",
            opacity: 0.15,
            zIndex: -1,
          }}
        />

        {/* AI Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "28px",
              background: gradients.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
            }}
          >
            <SmartToyIcon sx={{ fontSize: 56, color: "white" }} />
          </Box>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "24px", md: "32px" },
              fontWeight: 700,
              background: `linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1.5,
            }}
          >
            Start a Conversation
          </Typography>
        </motion.div>

        {/* Subheading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "#94A3B8",
              fontSize: "16px",
              mb: 4,
            }}
          >
            Ask me anything about products, files, or data
          </Typography>
        </motion.div>

        {/* Suggested prompts */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1.5,
              mb: 4,
            }}
          >
            {suggestedPrompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                variants={staggerContainerVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Chip
                  label={prompt.text}
                  onClick={() => onPromptClick?.(prompt.text)}
                  sx={{
                    px: 1,
                    py: 2.5,
                    height: "auto",
                    backgroundColor: alpha("#1E2749", 0.8),
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    "&:hover": {
                      backgroundColor: alpha("#6366F1", 0.1),
                      borderColor: "#6366F1",
                    },
                  }}
                  icon={
                    <Box
                      component="span"
                      sx={{
                        fontSize: "16px",
                        ml: 0.5,
                      }}
                    >
                      {prompt.icon}
                    </Box>
                  }
                />
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* New Chat button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewChat}
            sx={{
              background: gradients.accent,
              px: 4,
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.35)",
              },
            }}
          >
            New Chat
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default WelcomeScreen;
