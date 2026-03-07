import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { Avatar } from "../common/Avatar";
import { typingIndicatorVariants, dotVariants } from "../../theme/animations";

export interface TypingIndicatorProps {
  /** Number of dots to show */
  dotCount?: number;
  /** Size of the indicator */
  size?: "small" | "medium" | "large";
}

const dotSizes = {
  small: 6,
  medium: 8,
  large: 10,
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  dotCount = 3,
  size = "medium",
}) => {
  const dotSize = dotSizes[size];
  const dots = Array.from({ length: dotCount }, (_, i) => i);

  return (
    <motion.div
      variants={typingIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          maxWidth: "70%",
        }}
      >
        <Avatar type="ai" size="medium" />

        <Box
          sx={{
            backgroundColor: "background.secondary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "18px 18px 18px 4px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {dots.map((index) => (
            <motion.div
              key={index}
              variants={dotVariants}
              initial="hidden"
              animate="visible"
              transition={{
                delay: index * 0.15,
              }}
              style={{
                display: "inline-block",
              }}
            >
              <Box
                sx={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                }}
              />
            </motion.div>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

export default TypingIndicator;
