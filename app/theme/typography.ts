import type { TypographyOptions } from "@mui/material/styles/createTypography";

export const typography: TypographyOptions = {
  fontFamily: '"Inter", "Fira Code", sans-serif',
  h1: {
    fontFamily: '"Inter", sans-serif',
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  h3: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
  h4: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
  h5: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
  h6: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
  button: {
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    textTransform: "none",
  },
  body1: { fontFamily: '"Inter", sans-serif' },
  body2: { fontFamily: '"Inter", sans-serif' },
  overline: {
    fontFamily: '"Fira Code", monospace',
    fontWeight: 400,
    letterSpacing: "0.05em",
  },
};
