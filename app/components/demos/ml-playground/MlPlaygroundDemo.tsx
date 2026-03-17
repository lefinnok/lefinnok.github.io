import { useReducer, useEffect } from "react";
import { Box, Tab, Tabs, Paper } from "@mui/material";
import type {
  MlDemoState,
  MlDemoAction,
} from "./engine/types";
import { INITIAL_STATE } from "./engine/types";
import { DigitRecognitionTab } from "./views/DigitRecognitionTab";
import { PlaygroundTab } from "./views/PlaygroundTab";

function reducer(state: MlDemoState, action: MlDemoAction): MlDemoState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "TF_READY":
      return { ...state, tfReady: true };

    // ── Digit recognition ──────────────────────────────
    case "DIGIT_PHASE":
      return {
        ...state,
        digit: {
          ...state.digit,
          metrics: {
            ...state.digit.metrics,
            phase: action.phase,
            errorMessage: action.error,
          },
        },
      };
    case "DIGIT_LOAD_PROGRESS":
      return {
        ...state,
        digit: {
          ...state.digit,
          metrics: {
            ...state.digit.metrics,
            loadProgress: action.progress,
          },
        },
      };
    case "DIGIT_EPOCH":
      return {
        ...state,
        digit: {
          ...state.digit,
          metrics: {
            ...state.digit.metrics,
            epoch: action.epoch,
            loss: action.loss,
            accuracy: action.accuracy,
            lossHistory: [...state.digit.metrics.lossHistory, action.loss],
            accuracyHistory: [
              ...state.digit.metrics.accuracyHistory,
              action.accuracy,
            ],
          },
        },
      };
    case "DIGIT_TRAINED":
      return {
        ...state,
        digit: {
          ...state.digit,
          metrics: { ...state.digit.metrics, phase: "trained" },
          sampleResults: action.sampleResults,
        },
      };
    case "DIGIT_PREDICTION":
      return {
        ...state,
        digit: { ...state.digit, predictions: action.predictions },
      };
    case "DIGIT_CLEAR_PREDICTION":
      return {
        ...state,
        digit: {
          ...state.digit,
          predictions: null,
          layerActivations: null,
        },
      };
    case "DIGIT_MODE":
      return {
        ...state,
        digit: {
          ...INITIAL_STATE.digit,
          mode: action.mode,
        },
      };
    case "DIGIT_ACTIVATIONS":
      return {
        ...state,
        digit: { ...state.digit, layerActivations: action.activations },
      };
    case "DIGIT_WEIGHT_UPDATE":
      return {
        ...state,
        digit: {
          ...state.digit,
          weightDeltas: action.deltas,
          gradientMagnitudes: action.gradients,
        },
      };

    // ── 2D playground ──────────────────────────────────
    case "PG_SET_CONFIG":
      return {
        ...state,
        playground: {
          ...state.playground,
          config: { ...state.playground.config, ...action.config },
        },
      };
    case "PG_SET_DATA":
      return {
        ...state,
        playground: { ...state.playground, dataPoints: action.dataPoints },
      };
    case "PG_PHASE":
      return {
        ...state,
        playground: { ...state.playground, phase: action.phase },
      };
    case "PG_EPOCH":
      return {
        ...state,
        playground: {
          ...state.playground,
          epoch: action.epoch,
          lossHistory: [...state.playground.lossHistory, action.loss],
        },
      };
    case "PG_RESET":
      return {
        ...state,
        playground: {
          ...state.playground,
          phase: "idle",
          epoch: 0,
          lossHistory: [],
        },
      };

    default:
      return state;
  }
}

export default function MlPlaygroundDemo() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Warm up TF.js backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      if (!cancelled) dispatch({ type: "TF_READY" });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Paper
      variant="outlined"
      sx={{
        bgcolor: "#0a0a0a",
        borderColor: "#2a2a2a",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Tabs
        value={state.activeTab}
        onChange={(_, v) => dispatch({ type: "SET_TAB", tab: v })}
        sx={{
          borderBottom: "1px solid #2a2a2a",
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "0.8rem",
            fontFamily: "'Fira Code', monospace",
            color: "text.secondary",
            "&.Mui-selected": { color: "text.primary" },
          },
          "& .MuiTabs-indicator": { backgroundColor: "#f97316" },
        }}
      >
        <Tab label="Digit Recognition" />
        <Tab label="2D Playground" />
      </Tabs>

      <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {state.activeTab === 0 && (
          <DigitRecognitionTab
            state={state.digit}
            tfReady={state.tfReady}
            dispatch={dispatch}
          />
        )}
        {state.activeTab === 1 && (
          <PlaygroundTab
            state={state.playground}
            tfReady={state.tfReady}
            dispatch={dispatch}
          />
        )}
      </Box>
    </Paper>
  );
}
