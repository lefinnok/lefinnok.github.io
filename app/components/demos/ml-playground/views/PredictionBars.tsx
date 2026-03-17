import { Box, Typography } from "@mui/material";

const FONT = "'Fira Code', monospace";
const ACCENT = "#f97316";
const MUTED = "rgba(255,255,255,0.15)";

interface Props {
  predictions: number[] | null; // 10 softmax probabilities
}

export function PredictionBars({ predictions }: Props) {
  if (!predictions) {
    return (
      <Box sx={{ opacity: 0.3 }}>
        <Typography
          variant="body2"
          sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary", mb: 1 }}
        >
          Draw a digit to classify
        </Typography>
        {Array.from({ length: 10 }, (_, i) => (
          <BarRow key={i} digit={i} value={0} isMax={false} />
        ))}
      </Box>
    );
  }

  const maxIdx = predictions.indexOf(Math.max(...predictions));

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary", mb: 1 }}
      >
        Prediction
      </Typography>
      {predictions.map((p, i) => (
        <BarRow key={i} digit={i} value={p} isMax={i === maxIdx} />
      ))}
    </Box>
  );
}

function BarRow({
  digit,
  value,
  isMax,
}: {
  digit: number;
  value: number;
  isMax: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        mb: 0.25,
        height: 18,
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT,
          fontSize: "0.65rem",
          width: 12,
          textAlign: "right",
          color: isMax ? ACCENT : "text.secondary",
          fontWeight: isMax ? 700 : 400,
        }}
      >
        {digit}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 10,
          bgcolor: "rgba(255,255,255,0.04)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${value * 100}%`,
            bgcolor: isMax ? ACCENT : MUTED,
            borderRadius: 1,
            transition: "width 0.15s ease-out",
          }}
        />
      </Box>
      <Typography
        sx={{
          fontFamily: FONT,
          fontSize: "0.6rem",
          width: 32,
          textAlign: "right",
          color: isMax ? ACCENT : "text.secondary",
        }}
      >
        {(value * 100).toFixed(1)}%
      </Typography>
    </Box>
  );
}
