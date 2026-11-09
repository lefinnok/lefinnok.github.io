import type { TypographyOptions } from "@mui/material/styles/createTypography";

const display = '"Archivo Variable", "Archivo", system-ui, sans-serif';
const body = '"Inter Variable", "Inter", system-ui, sans-serif';
const mono = '"JetBrains Mono", ui-monospace, monospace';

export const typography: TypographyOptions = {
  fontFamily: body,
  h1: {
    fontFamily: display,
    fontWeight: 800,
    letterSpacing: "-0.035em",
    lineHeight: 0.94,
    textTransform: "uppercase",
  },
  h2: {
    fontFamily: display,
    fontWeight: 800,
    letterSpacing: "-0.025em",
    textTransform: "uppercase",
  },
  h3: { fontFamily: display, fontWeight: 700, letterSpacing: "-0.015em" },
  h4: { fontFamily: display, fontWeight: 700 },
  h5: { fontFamily: display, fontWeight: 600 },
  h6: { fontFamily: display, fontWeight: 600 },
  button: { fontFamily: mono, fontWeight: 500, textTransform: "uppercase" },
  body1: { fontFamily: body },
  body2: { fontFamily: body },
  overline: {
    fontFamily: mono,
    fontWeight: 400,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
};
