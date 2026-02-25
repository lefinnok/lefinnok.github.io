import { Box, Typography } from "@mui/material";

interface InteractiveDemoSlotProps {
  available: boolean;
  componentName?: string;
}

export function InteractiveDemoSlot({
  available,
  componentName,
}: InteractiveDemoSlotProps) {
  if (!available) return null;

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
        {componentName
          ? `Interactive demo: ${componentName} — coming soon`
          : "Interactive demo — coming soon"}
      </Typography>
    </Box>
  );
}
