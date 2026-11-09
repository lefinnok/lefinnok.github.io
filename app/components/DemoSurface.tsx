import { ThemeProvider } from "@mui/material/styles";
import { demoTheme } from "~/theme/demoTheme";

/**
 * Dark surface for the MUI demos that were built against the old palette.
 * The site stays on paper; only the demo surface goes dark.
 */
export function DemoSurface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`demo-surface ${className}`.trim()}>
      <ThemeProvider theme={demoTheme}>{children}</ThemeProvider>
    </div>
  );
}
