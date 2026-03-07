import { createTheme, alpha } from "@mui/material/styles";

// Color Palette (Modern Dark Theme)
export const colors = {
  background: {
    primary: "#0A0E27",
    secondary: "#151B3B",
    tertiary: "#1E2749",
  },
  accent: {
    primary: "#6366F1",
    secondary: "#8B5CF6",
  },
  text: {
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    tertiary: "#64748B",
  },
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  border: "rgba(148, 163, 184, 0.1)",
};

// Typography
export const typography = {
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  codeFont: "'JetBrains Mono', 'Fira Code', monospace",
  h1: {
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: "24px",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: 1.4,
  },
};

// Custom theme
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.accent.primary,
      light: colors.accent.secondary,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: colors.accent.secondary,
      contrastText: "#FFFFFF",
    },
    background: {
      default: colors.background.primary,
      paper: colors.background.secondary,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.tertiary,
    },
    success: {
      main: colors.status.success,
    },
    warning: {
      main: colors.status.warning,
    },
    error: {
      main: colors.status.error,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    body1: typography.body1,
    body2: typography.body2,
    caption: typography.caption,
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.primary,
          scrollbarColor: `${colors.background.tertiary} ${colors.background.secondary}`,
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: colors.background.secondary,
          },
          "&::-webkit-scrollbar-thumb": {
            background: colors.background.tertiary,
            borderRadius: "4px",
            "&:hover": {
              background: colors.accent.primary,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: "8px",
          padding: "8px 16px",
        },
        contained: {
          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.2)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: colors.background.tertiary,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: colors.background.secondary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.border}`,
          borderRadius: "16px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: colors.background.tertiary,
            borderRadius: "12px",
            "& fieldset": {
              borderColor: colors.border,
            },
            "&:hover fieldset": {
              borderColor: colors.accent.primary,
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.accent.primary,
              boxShadow: `0 0 0 3px ${alpha(colors.accent.primary, 0.1)}`,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
        filled: {
          backgroundColor: colors.background.tertiary,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.secondary,
          borderLeft: `1px solid ${colors.border}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.background.tertiary,
          color: colors.text.primary,
          fontSize: "12px",
          padding: "8px 12px",
          borderRadius: "6px",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          margin: "2px 8px",
          "&:hover": {
            backgroundColor: colors.background.tertiary,
          },
          "&.Mui-selected": {
            backgroundColor: alpha(colors.accent.primary, 0.15),
            "&:hover": {
              backgroundColor: alpha(colors.accent.primary, 0.2),
            },
          },
        },
      },
    },
  },
});

// Gradient definitions
export const gradients = {
  accent: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  header: "linear-gradient(180deg, #151B3B 0%, transparent 100%)",
};

export default theme;
