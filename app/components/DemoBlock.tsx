import { ThemeProvider } from "@mui/material/styles";
import { InteractiveDemoSlot } from "./InteractiveDemoSlot";
import { LazyMount } from "./LazyMount";
import { DemoFrame } from "./DemoFrame";
import { demoTheme } from "~/theme/demoTheme";

export function DemoBlock({
  componentName,
  title,
  description,
  year,
  context,
  kicker = "Interactive demo",
  tone = "ink",
  related,
  index,
  showHeader = true,
}: {
  componentName: string;
  title: string;
  description?: string;
  year?: string;
  context?: string;
  kicker?: string;
  tone?: "ink" | "paper";
  related?: { label: string; url: string };
  index?: string;
  showHeader?: boolean;
}) {
  return (
    <DemoFrame
      kicker={kicker}
      title={title}
      description={description}
      year={year}
      context={context}
      tone={tone}
      related={related}
      index={index}
      showHeader={showHeader}
    >
      <LazyMount>
        <ThemeProvider theme={demoTheme}>
          <InteractiveDemoSlot available componentName={componentName} />
        </ThemeProvider>
      </LazyMount>
    </DemoFrame>
  );
}
