import type { Variants } from "framer-motion";

// Animation durations
export const durations = {
  fast: 0.1,
  normal: 0.2,
  slow: 0.3,
};

// Easing curves
export const easing = {
  default: [0.4, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
};

// Message animations
export const messageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

// User message variants (slide from right)
export const userMessageVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easing.easeOut,
    },
  },
};

// AI message variants (slide from left)
export const aiMessageVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easing.easeOut,
    },
  },
};

// Typing indicator animation
export const typingIndicatorVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.fast,
    },
  },
};

export const dotVariants: Variants = {
  hidden: {
    y: 0,
  },
  visible: {
    y: -8,
    transition: {
      duration: 0.4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: easing.bounce,
    },
  },
};

// Sidebar animation
export const sidebarVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easing.default,
    },
  },
  closed: {
    x: -280,
    opacity: 0,
    transition: {
      duration: durations.normal,
      ease: easing.default,
    },
  },
};

// Settings panel animation
export const settingsPanelVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easing.default,
    },
  },
  closed: {
    x: 400,
    opacity: 0,
    transition: {
      duration: durations.normal,
      ease: easing.default,
    },
  },
};

// Fade animation
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
    },
  },
};

// Scale animation for buttons
export const scaleVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: durations.fast,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: durations.fast,
    },
  },
};

// Stagger children animation
export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Skeleton loading animation
export const skeletonVariants: Variants = {
  initial: {
    x: -100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.slow,
    },
  },
};

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Welcome screen animation
export const welcomeScreenVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easing.easeOut,
    },
  },
};

// Micro-interaction variants
export const hoverScaleVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: durations.fast,
    },
  },
};

// Button ripple effect
export const buttonRippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.5,
  },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
};
