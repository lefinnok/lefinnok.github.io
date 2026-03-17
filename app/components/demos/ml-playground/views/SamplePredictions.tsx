import { Box, Typography } from "@mui/material";

const FONT = "'Fira Code', monospace";

interface Props {
  samples: { predicted: number; actual: number }[];
}

export function SamplePredictions({ samples }: Props) {
  if (samples.length === 0) return null;

  const correct = samples.filter((s) => s.predicted === s.actual).length;
  const accuracy = ((correct / samples.length) * 100).toFixed(1);

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          fontFamily: FONT,
          fontSize: "0.7rem",
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        Test samples — {accuracy}% correct ({correct}/{samples.length})
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {samples.map((s, i) => {
          const ok = s.predicted === s.actual;
          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 0.25,
                borderRadius: 0.5,
                border: "1px solid",
                borderColor: ok ? "#4ade8040" : "#f8717140",
                bgcolor: ok ? "#4ade8008" : "#f871710a",
                minWidth: 24,
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT,
                  fontSize: "0.6rem",
                  color: ok ? "#4ade80" : "#f87171",
                }}
              >
                {s.actual}→{s.predicted}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
