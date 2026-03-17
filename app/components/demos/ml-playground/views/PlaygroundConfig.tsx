import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Button,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type {
  PlaygroundConfig as PGConfig,
  DatasetPattern,
  ActivationFn,
  PlaygroundPhase,
} from "../engine/types";

const FONT = "'Fira Code', monospace";

const DATASETS: { value: DatasetPattern; label: string }[] = [
  { value: "spiral", label: "Spiral" },
  { value: "circles", label: "Circles" },
  { value: "xor", label: "XOR" },
  { value: "moons", label: "Moons" },
];

const ACTIVATIONS: { value: ActivationFn; label: string }[] = [
  { value: "relu", label: "ReLU" },
  { value: "sigmoid", label: "Sigmoid" },
  { value: "tanh", label: "Tanh" },
];

const NEURON_MARKS = [2, 4, 8, 16].map((v) => ({ value: v, label: String(v) }));

interface Props {
  config: PGConfig;
  phase: PlaygroundPhase;
  onConfigChange: (partial: Partial<PGConfig>) => void;
  onTrain: () => void;
  onReset: () => void;
}

export function PlaygroundConfig({
  config,
  phase,
  onConfigChange,
  onTrain,
  onReset,
}: Props) {
  const isTraining = phase === "training";
  const tbs = {
    textTransform: "none" as const,
    fontSize: "0.7rem",
    fontFamily: FONT,
    py: 0.25,
    px: 1,
    color: "text.secondary",
    borderColor: "#2a2a2a",
    "&.Mui-selected": { color: "text.primary", bgcolor: "rgba(255,255,255,0.06)" },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Dataset */}
      <Box>
        <Typography
          variant="body2"
          sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary", mb: 0.5 }}
        >
          Dataset
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={config.dataset}
          onChange={(_, v) => v && onConfigChange({ dataset: v })}
          disabled={isTraining}
        >
          {DATASETS.map((d) => (
            <ToggleButton key={d.value} value={d.value} sx={tbs}>
              {d.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Activation */}
      <Box>
        <Typography
          variant="body2"
          sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary", mb: 0.5 }}
        >
          Activation
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={config.activation}
          onChange={(_, v) => v && onConfigChange({ activation: v })}
          disabled={isTraining}
        >
          {ACTIVATIONS.map((a) => (
            <ToggleButton key={a.value} value={a.value} sx={tbs}>
              {a.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Hidden layers */}
      <Box>
        <Typography
          variant="body2"
          sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary", mb: 0.5 }}
        >
          Hidden layers: {config.hiddenLayers}
        </Typography>
        <Slider
          min={1}
          max={4}
          step={1}
          value={config.hiddenLayers}
          onChange={(_, v) => onConfigChange({ hiddenLayers: v as number })}
          disabled={isTraining}
          marks
          sx={{
            color: "#f97316",
            "& .MuiSlider-markLabel": { fontFamily: FONT, fontSize: "0.6rem" },
          }}
        />
      </Box>

      {/* Neurons per layer */}
      <Box>
        <Typography
          variant="body2"
          sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary", mb: 0.5 }}
        >
          Neurons/layer: {config.neuronsPerLayer}
        </Typography>
        <Slider
          min={2}
          max={16}
          step={null}
          marks={NEURON_MARKS}
          value={config.neuronsPerLayer}
          onChange={(_, v) => onConfigChange({ neuronsPerLayer: v as number })}
          disabled={isTraining}
          sx={{
            color: "#f97316",
            "& .MuiSlider-markLabel": { fontFamily: FONT, fontSize: "0.6rem" },
          }}
        />
      </Box>

      {/* Learning rate */}
      <Box>
        <Typography
          variant="body2"
          sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary", mb: 0.5 }}
        >
          Learning rate: {config.learningRate}
        </Typography>
        <Slider
          min={0.001}
          max={0.1}
          step={0.001}
          value={config.learningRate}
          onChange={(_, v) => onConfigChange({ learningRate: v as number })}
          disabled={isTraining}
          sx={{ color: "#f97316" }}
        />
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={onTrain}
          disabled={isTraining}
          sx={{
            flex: 1,
            textTransform: "none",
            fontSize: "0.75rem",
            fontFamily: FONT,
            bgcolor: "#f97316",
            "&:hover": { bgcolor: "#ea580c" },
          }}
        >
          {isTraining ? "Training..." : "Train"}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          disabled={isTraining}
          sx={{
            textTransform: "none",
            fontSize: "0.75rem",
            fontFamily: FONT,
            color: "text.secondary",
            borderColor: "divider",
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
