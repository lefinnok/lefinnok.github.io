import { Box, Typography, LinearProgress } from "@mui/material";
import type { TrainingMetrics, DigitMode } from "../engine/types";
import { LossChart } from "./LossChart";

const FONT = "'Fira Code', monospace";

interface Props {
  metrics: TrainingMetrics;
  mode: DigitMode;
}

export function TrainingPanel({ metrics, mode }: Props) {
  const { phase, loadProgress, epoch, totalEpochs, lossHistory, accuracyHistory } =
    metrics;

  const isLoading = phase === "loading-data";
  const isLoadingModel = phase === "loading-model";
  const progress = isLoading
    ? loadProgress
    : isLoadingModel
    ? 50
    : phase === "training"
    ? (epoch / totalEpochs) * 100
    : phase === "trained"
    ? 100
    : 0;

  const statusText = isLoadingModel
    ? "Loading pretrained model..."
    : isLoading
    ? `Downloading MNIST data... ${loadProgress}%`
    : phase === "idle"
    ? "Waiting..."
    : phase === "training"
    ? "Training model..."
    : phase === "trained"
    ? mode === "pretrained"
      ? "Pretrained model ready!"
      : "Model ready!"
    : phase === "error"
    ? "Error occurred"
    : phase;

  return (
    <Box>
      {/* Status + epoch */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: FONT,
            fontSize: "0.75rem",
            color:
              phase === "trained"
                ? "#4ade80"
                : phase === "error"
                ? "#f87171"
                : "text.secondary",
          }}
        >
          {statusText}
        </Typography>
        {(phase === "training" || phase === "trained") &&
          mode === "training" && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: FONT,
                fontSize: "0.7rem",
                color: "text.secondary",
              }}
            >
              Epoch {epoch}/{totalEpochs}
            </Typography>
          )}
      </Box>

      {/* Progress bar — only show during loading/training */}
      {phase !== "trained" && phase !== "idle" && (
        <LinearProgress
          variant={isLoadingModel ? "indeterminate" : "determinate"}
          value={progress}
          sx={{
            mb: 1.5,
            height: 3,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.05)",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#f97316",
            },
          }}
        />
      )}

      {/* Charts — only in training mode */}
      {mode === "training" && lossHistory.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <LossChart
            data={lossHistory}
            label="Loss"
            color="#f97316"
            width={200}
            height={90}
          />
          <LossChart
            data={accuracyHistory}
            label="Accuracy"
            color="#4ade80"
            width={200}
            height={90}
            formatValue={(v) => `${(v * 100).toFixed(1)}%`}
          />
        </Box>
      )}
    </Box>
  );
}
