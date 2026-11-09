import { createTheme } from "@mui/material/styles";

/**
 * Demos live on an ink stage inside a paper frame. The palette keeps the
 * contrast the instruments need while using the site's ember accent and
 * type system instead of the old cyan and Fira Code.
 */
export const demoTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#D97757", contrastText: "#151412" },
    secondary: { main: "#A8A29A" },
    background: { default: "#121110", paper: "#191715" },
    text: { primary: "#F5F1E8", secondary: "#B8B0A6" },
    divider: "rgba(245, 241, 232, 0.16)",
  },
  typography: {
    fontFamily: '"Inter Variable", "Inter", system-ui, sans-serif',
    h5: { fontFamily: '"Archivo Variable", "Archivo", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Archivo Variable", "Archivo", sans-serif', fontWeight: 700 },
    button: {
      fontFamily: '"JetBrains Mono", monospace',
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    overline: {
      fontFamily: '"JetBrains Mono", monospace',
      letterSpacing: "0.14em",
    },
  },
});
