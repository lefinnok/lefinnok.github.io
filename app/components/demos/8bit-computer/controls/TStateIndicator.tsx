import { Box, Stack } from "@mui/material";

const ACCENT = "#f97316";

interface TStateIndicatorProps {
  tState: number;
  halted: boolean;
  count: number;
  fetchLen: number;
}

export function TStateIndicator({ tState, halted, count, fetchLen }: TStateIndicatorProps) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {Array.from({ length: count }, (_, i) => {
        const isFetch = i < fetchLen;
        return (
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
              borderBottom: isFetch ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            T{i}
          </Box>
        );
      })}
    </Stack>
  );
}
