import type { DateFormat } from "../types/chat.types";

/**
 * Format a date to relative time (e.g., "5m ago", "2h ago", "Yesterday")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Fall back to absolute date for older messages
  return formatDate(date, "absolute");
}

/**
 * Format a date with time (e.g., "Today at 3:30 PM", "Yesterday at 10:00 AM")
 */
export function formatDateTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = formatTime(date);

  if (isToday) {
    return `Today at ${time}`;
  }

  if (isYesterday) {
    return `Yesterday at ${time}`;
  }

  return `${formatDate(date, "absolute")} at ${time}`;
}

/**
 * Format time (e.g., "3:30 PM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date (e.g., "Mar 7, 2026")
 */
export function formatDate(
  date: Date,
  format: DateFormat = "absolute",
): string {
  if (format === "relative") {
    return formatRelativeTime(date);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format date for message separators
 */
export function formatMessageDateSeparator(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
  const shortDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (isToday) {
    return "Today";
  }

  if (isYesterday) {
    return "Yesterday";
  }

  // Check if within the last week
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffInDays < 7) {
    return dayOfWeek;
  }

  return shortDate;
}

/**
 * Format number with commas (e.g., "1,234")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Format token count
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return `${count} tokens`;
  }
  return `${(count / 1000).toFixed(1)}K tokens`;
}

/**
 * Format processing time
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generate a session title from first message
 */
export function generateSessionTitle(firstMessage: string): string {
  // Take first 50 characters of the first message
  const truncated = truncateText(firstMessage, 50);
  return truncated || "New Conversation";
}

export default {
  formatRelativeTime,
  formatDateTime,
  formatTime,
  formatDate,
  formatMessageDateSeparator,
  formatNumber,
  formatTokenCount,
  formatProcessingTime,
  truncateText,
  generateSessionTitle,
};
