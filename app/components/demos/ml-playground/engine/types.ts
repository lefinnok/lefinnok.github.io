// ── Training Presets ─────────────────────────────────────────────

export type TrainingPresetId = "quick" | "balanced" | "full";

export interface TrainingPreset {
  id: TrainingPresetId;
  name: string;
  samples: number;
  epochs: number;
  description: string;
}

export const TRAINING_PRESETS: TrainingPreset[] = [
  {
    id: "quick",
    name: "Quick",
    samples: 2_000,
    epochs: 5,
    description: "2K samples, 5 epochs — fast demo (~30s)",
  },
  {
    id: "balanced",
    name: "Balanced",
    samples: 5_000,
    epochs: 8,
    description: "5K samples, 8 epochs — recommended (~1-2 min)",
  },
  {
    id: "full",
    name: "Full",
    samples: 8_000,
    epochs: 12,
    description: "8K samples, 12 epochs — best local accuracy (~2-4 min)",
  },
];

// ── Training Metrics ─────────────────────────────────────────────

export type TrainingPhase =
  | "idle"
  | "loading-model"
  | "loading-data"
  | "training"
  | "trained"
  | "error";

export type DigitMode = "pretrained" | "selecting-preset" | "training";

export interface TrainingMetrics {
  phase: TrainingPhase;
  loadProgress: number; // 0-100 download percentage
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  lossHistory: number[];
  accuracyHistory: number[];
  errorMessage?: string;
}

// ── Layer activation/weight data for 3D viz ─────────────────────

export interface LayerVizData {
  name: string;
  magnitude: number; // 0-1 normalized mean activation or weight delta
}

// ── Digit Recognition ────────────────────────────────────────────

export interface DigitState {
  mode: DigitMode;
  selectedPreset: TrainingPresetId | null;
  metrics: TrainingMetrics;
  predictions: number[] | null; // length 10 softmax probs
  sampleResults: { predicted: number; actual: number }[];
  layerActivations: LayerVizData[] | null; // per-layer for 3D viz
  weightDeltas: LayerVizData[] | null; // per-layer weight changes (training mode)
  gradientMagnitudes: LayerVizData[] | null; // per-layer gradient magnitudes
}

// ── 2D Playground ────────────────────────────────────────────────

export type DatasetPattern = "spiral" | "circles" | "xor" | "moons";
export type ActivationFn = "relu" | "sigmoid" | "tanh";

export interface PlaygroundConfig {
  dataset: DatasetPattern;
  hiddenLayers: number; // 1-4
  neuronsPerLayer: number; // 2, 4, 8, 16
  activation: ActivationFn;
  learningRate: number;
}

export type PlaygroundPhase = "idle" | "training" | "trained";

export interface PlaygroundState {
  config: PlaygroundConfig;
  phase: PlaygroundPhase;
  epoch: number;
  totalEpochs: number;
  lossHistory: number[];
  dataPoints: { x: number; y: number; label: number }[];
}

// ── Top-Level Demo State ─────────────────────────────────────────

export interface MlDemoState {
  activeTab: 0 | 1;
  tfReady: boolean;
  digit: DigitState;
  playground: PlaygroundState;
}

export type MlDemoAction =
  | { type: "SET_TAB"; tab: 0 | 1 }
  | { type: "TF_READY" }
  // Digit recognition
  | { type: "DIGIT_MODE"; mode: DigitMode }
  | { type: "DIGIT_SELECT_PRESET"; preset: TrainingPresetId }
  | { type: "DIGIT_START_TRAINING" }
  | { type: "DIGIT_PHASE"; phase: TrainingPhase; error?: string }
  | { type: "DIGIT_LOAD_PROGRESS"; progress: number }
  | {
      type: "DIGIT_EPOCH";
      epoch: number;
      loss: number;
      accuracy: number;
    }
  | { type: "DIGIT_TRAINED"; sampleResults: DigitState["sampleResults"] }
  | { type: "DIGIT_PREDICTION"; predictions: number[] }
  | { type: "DIGIT_CLEAR_PREDICTION" }
  | { type: "DIGIT_ACTIVATIONS"; activations: LayerVizData[] }
  | {
      type: "DIGIT_WEIGHT_UPDATE";
      deltas: LayerVizData[];
      gradients: LayerVizData[];
    }
  // 2D playground
  | { type: "PG_SET_CONFIG"; config: Partial<PlaygroundConfig> }
  | { type: "PG_SET_DATA"; dataPoints: PlaygroundState["dataPoints"] }
  | { type: "PG_PHASE"; phase: PlaygroundPhase }
  | { type: "PG_EPOCH"; epoch: number; loss: number }
  | { type: "PG_RESET" };

// ── Initial State ────────────────────────────────────────────────

export const INITIAL_STATE: MlDemoState = {
  activeTab: 0,
  tfReady: false,
  digit: {
    mode: "pretrained",
    selectedPreset: null,
    metrics: {
      phase: "idle",
      loadProgress: 0,
      epoch: 0,
      totalEpochs: 10,
      loss: 0,
      accuracy: 0,
      lossHistory: [],
      accuracyHistory: [],
    },
    predictions: null,
    sampleResults: [],
    layerActivations: null,
    weightDeltas: null,
    gradientMagnitudes: null,
  },
  playground: {
    config: {
      dataset: "spiral",
      hiddenLayers: 2,
      neuronsPerLayer: 8,
      activation: "relu",
      learningRate: 0.03,
    },
    phase: "idle",
    epoch: 0,
    totalEpochs: 200,
    lossHistory: [],
    dataPoints: [],
  },
};
