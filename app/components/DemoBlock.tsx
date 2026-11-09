import { ThemeProvider } from "@mui/material/styles";
import { InteractiveDemoSlot } from "./InteractiveDemoSlot";
import { demoTheme } from "~/theme/demoTheme";

export function DemoBlock({
  componentName,
  title = "Interactive demo",
}: {
  componentName: string;
  title?: string;
}) {
  return (
    <div className="demo-block">
      <div className="mono" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <div className="demo-scope">
        <ThemeProvider theme={demoTheme}>
          <InteractiveDemoSlot available componentName={componentName} />
        </ThemeProvider>
      </div>
    </div>
  );
}
