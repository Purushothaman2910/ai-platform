import { useEffect, useRef, useCallback } from "react";

interface UseAutoScrollOptions {
  /** Whether auto-scroll is enabled */
  enabled?: boolean;
  /** Offset from the bottom in pixels */
  offset?: number;
  /** Duration of the smooth scroll animation in ms */
  duration?: number;
}

export function useAutoScroll<T extends HTMLElement = HTMLDivElement>(
  dependencies: unknown[] = [],
  options: UseAutoScrollOptions = {},
) {
  const { enabled = true, offset = 0, duration = 100 } = options;
  const containerRef = useRef<T>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect if user is manually scrolling
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 50;

    if (!isAtBottom) {
      isUserScrolling.current = true;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 1000);
    } else {
      isUserScrolling.current = false;
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(
    (smooth = true) => {
      if (!containerRef.current) return;

      const { scrollHeight, clientHeight } = containerRef.current;
      const targetScrollTop = scrollHeight - clientHeight - offset;

      if (smooth) {
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      } else {
        containerRef.current.scrollTop = targetScrollTop;
      }
    },
    [offset],
  );

  // Auto-scroll when dependencies change
  useEffect(() => {
    if (!enabled || isUserScrolling.current) return;

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      scrollToBottom(true);
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [dependencies, enabled, duration, scrollToBottom]);

  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    scrollToBottom,
    isUserScrolling: () => isUserScrolling.current,
  };
}

export default useAutoScroll;
