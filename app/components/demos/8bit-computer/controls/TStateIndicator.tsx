import { Box, Stack } from "@mui/material";
import { T_STATE_COUNT } from "../engine/types";

const ACCENT = "#f97316";

interface TStateIndicatorProps {
  tState: number;
  halted: boolean;
}

export function TStateIndicator({ tState, halted }: TStateIndicatorProps) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {Array.from({ length: T_STATE_COUNT }, (_, i) => (
        <Box
          key={i}
          sx={{
            width: 22,
            height: 18,
            borderRadius: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            bgcolor: halted
              ? "rgba(239,68,68,0.15)"
              : i === tState
                ? ACCENT
                : "rgba(255,255,255,0.04)",
            color: halted
              ? "rgba(239,68,68,0.6)"
              : i === tState
                ? "#000"
                : "rgba(255,255,255,0.25)",
            transition: "background-color 0.15s, color 0.15s",
          }}
        >
          T{i}
        </Box>
      ))}
    </Stack>
  );
}
