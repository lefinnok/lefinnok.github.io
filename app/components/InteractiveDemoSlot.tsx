import { lazy, Suspense } from "react";
import { Box, Typography } from "@mui/material";
import { MatrixLoader } from "~/components/MatrixLoader";

const DEMO_COMPONENTS: Record<
  string,
  React.LazyExoticComponent<React.ComponentType>
> = {
  GestureRecognitionDemo: lazy(
    () =>
      import("~/components/demos/gesture-recognition/GestureRecognitionDemo"),
  ),
};

interface InteractiveDemoSlotProps {
  available: boolean;
  componentName?: string;
}

export function InteractiveDemoSlot({
  available,
  componentName,
}: InteractiveDemoSlotProps) {
  if (!available || !componentName) return null;

  const DemoComponent = DEMO_COMPONENTS[componentName];

  if (!DemoComponent) {
    return (
      <Box
        sx={{
          mt: 4,
          p: 4,
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="overline" color="text.secondary">
          Interactive demo: {componentName} — coming soon
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Suspense
        fallback={<MatrixLoader message="Loading demo..." height={300} />}
      >
        <DemoComponent />
      </Suspense>
    </Box>
  );
}
