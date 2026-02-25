import type { Components, Theme } from "@mui/material";

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: "10px 24px",
        fontSize: "1rem",
        border: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.2)",
        transition: "transform 0.15s ease-out, border-color 0.15s ease-out",
        "&:hover": {
          transform: "scale(1.02)",
          borderColor: "rgba(255, 255, 255, 0.6)",
        },
      },
    },
    defaultProps: { disableRipple: true },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundImage: "none",
        transition: "transform 0.2s ease-out, border-color 0.2s ease-out",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: { backgroundImage: "none", boxShadow: "none" },
    },
    defaultProps: { elevation: 0 },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontFamily: '"Fira Code", monospace',
        fontSize: "0.75rem",
        fontWeight: 500,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: "none",
      },
    },
  },
  MuiIconButton: { defaultProps: { disableRipple: true } },
};
