import React from "react";
import {
  Box,
  Avatar as MuiAvatar,
  type AvatarProps as MuiAvatarProps,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { gradients } from "../../theme/theme";

export interface AvatarProps extends MuiAvatarProps {
  /** Avatar type - user or AI */
  type?: "user" | "ai";
  /** Size of the avatar */
  size?: "small" | "medium" | "large";
  /** Whether to show a gradient background */
  showGradient?: boolean;
}

const sizeMap = {
  small: 28,
  medium: 36,
  large: 48,
};

const iconSizeMap = {
  small: 16,
  medium: 20,
  large: 28,
};

export const Avatar: React.FC<AvatarProps> = ({
  type = "ai",
  size = "medium",
  showGradient = true,
  children,
  sx,
  ...props
}) => {
  const avatarSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  const isUser = type === "user";

  return (
    <MuiAvatar
      sx={{
        width: avatarSize,
        height: avatarSize,
        background: showGradient
          ? isUser
            ? gradients.accent
            : `linear-gradient(135deg, ${alpha("#8B5CF6", 0.8)} 0%, ${alpha("#6366F1", 0.8)} 100%)`
          : undefined,
        backgroundColor: showGradient ? undefined : "background.tertiary",
        border: showGradient ? "none" : `1px solid ${alpha("#fff", 0.1)}`,
        ...sx,
      }}
      {...props}
    >
      {children ||
        (isUser ? (
          <PersonIcon sx={{ fontSize: iconSize, color: "white" }} />
        ) : (
          <SmartToyIcon sx={{ fontSize: iconSize, color: "white" }} />
        ))}
    </MuiAvatar>
  );
};

// Avatar Group component for multiple avatars
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  spacing?: "small" | "medium";
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 4,
  spacing = "small",
}) => {
  const childArray = React.Children.toArray(children);
  const displayedChildren = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row-reverse",
        justifyContent: "flex-end",
        "& .MuiAvatar-root": {
          border: "2px solid",
          borderColor: "background.default",
          marginLeft: spacing === "small" ? -8 : -12,
          "&:first-of-type": {
            marginLeft: 0,
          },
        },
      }}
    >
      {displayedChildren.reverse()}
      {remaining > 0 && (
        <MuiAvatar
          sx={{
            width: sizeMap.medium,
            height: sizeMap.medium,
            backgroundColor: "background.tertiary",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          +{remaining}
        </MuiAvatar>
      )}
    </Box>
  );
};

export default Avatar;
