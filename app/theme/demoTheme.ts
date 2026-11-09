import { createTheme } from "@mui/material/styles";

/**
 * The demos were built against the original dark palette. Keep that theme
 * scoped to the demo panels so the site can stay on paper.
 */
export const demoTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ffffff", contrastText: "#0a0a0a" },
    secondary: { main: "#6e6e6e" },
    background: { default: "#0a0a0a", paper: "#141414" },
    text: { primary: "#f0f0f0", secondary: "#a0a0a0" },
    divider: "#2a2a2a",
  },
  typography: {
    fontFamily: '"Inter", "Fira Code", sans-serif',
    button: { fontFamily: '"Inter", sans-serif', textTransform: "none" },
    overline: {
      fontFamily: '"Fira Code", monospace',
      letterSpacing: "0.05em",
    },
  },
});
