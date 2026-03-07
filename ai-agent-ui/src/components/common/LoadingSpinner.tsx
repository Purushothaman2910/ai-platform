import React from "react";
import {
  Box,
  CircularProgress,
  type CircularProgressProps,
  Skeleton,
  type SkeletonProps,
} from "@mui/material";

export interface LoadingSpinnerProps extends Omit<
  CircularProgressProps,
  "variant"
> {
  /** Size of the spinner */
  size?: number;
  /** Color of the spinner */
  color?: "primary" | "secondary" | "inherit";
  /** Whether to show a label */
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = "primary",
  label,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        ...sx,
      }}
    >
      <CircularProgress
        size={size}
        color={color}
        sx={{
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
        {...props}
      />
      {label && (
        <Box
          sx={{
            fontSize: "14px",
            color: "text.secondary",
          }}
        >
          {label}
        </Box>
      )}
    </Box>
  );
};

// Skeleton loader for message placeholders
interface MessageSkeletonProps {
  isUser?: boolean;
  count?: number;
}

export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  isUser = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 1.5,
        maxWidth: "70%",
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      {!isUser && (
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={{
            backgroundColor: "background.tertiary",
          }}
        />
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Skeleton
          variant="rounded"
          width={200}
          height={20}
          sx={{
            backgroundColor: "background.tertiary",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          }}
        />
        <Skeleton
          variant="rounded"
          width={150}
          height={20}
          sx={{
            backgroundColor: "background.tertiary",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          }}
        />
      </Box>
    </Box>
  );
};

// Skeleton for chat list
interface ChatListSkeletonProps {
  count?: number;
}

export const ChatListSkeleton: React.FC<ChatListSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={56}
          sx={{
            backgroundColor: "background.tertiary",
            borderRadius: "8px",
          }}
        />
      ))}
    </Box>
  );
};

// Shimmer effect skeleton
interface ShimmerSkeletonProps extends SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  width = "100%",
  height = 20,
  sx,
  ...props
}) => {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={height}
      sx={{
        backgroundColor: "background.tertiary",
        backgroundImage:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        "@keyframes shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        ...sx,
      }}
      {...props}
    />
  );
};

// Full page loading state
interface FullPageLoaderProps {
  message?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = "Loading...",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        gap: 2,
      }}
    >
      <LoadingSpinner size={48} />
      <Box
        sx={{
          color: "text.secondary",
          fontSize: "14px",
        }}
      >
        {message}
      </Box>
    </Box>
  );
};

export default LoadingSpinner;
