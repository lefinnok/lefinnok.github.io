import { ThemeProvider } from "@mui/material/styles";
import { InteractiveDemoSlot } from "./InteractiveDemoSlot";
import { DemoFrame } from "./DemoFrame";
import { demoTheme } from "~/theme/demoTheme";

export function DemoBlock({
  componentName,
  title,
  description,
  kicker = "Interactive demo",
  tone = "ink",
  related,
  showHeader = true,
}: {
  componentName: string;
  title: string;
  description?: string;
  kicker?: string;
  tone?: "ink" | "paper";
  related?: { label: string; url: string };
  showHeader?: boolean;
}) {
  return (
    <DemoFrame
      kicker={kicker}
      title={title}
      description={description}
      tone={tone}
      related={related}
      showHeader={showHeader}
    >
      <ThemeProvider theme={demoTheme}>
        <InteractiveDemoSlot available componentName={componentName} />
      </ThemeProvider>
    </DemoFrame>
  );
}
