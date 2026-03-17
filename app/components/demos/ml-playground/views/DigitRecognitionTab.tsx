import { useRef, useState, useEffect, useCallback, type Dispatch } from "react";
import { Box, Typography, Button } from "@mui/material";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import type { DigitState, MlDemoAction } from "../engine/types";
import { loadMnistData, disposeMnistData } from "../engine/mnistLoader";
import type { MnistData } from "../engine/mnistLoader";
import {
  loadPretrainedModel,
  createDigitModel,
  predictDigit,
  getLayerActivations,
  getActivationMaps,
  evaluateSamples,
} from "../engine/digitModel";
import { trainWithGradientTracking } from "../engine/trainWithGradients";
import { TrainingPanel } from "./TrainingPanel";
import { CnnViz3D } from "./CnnViz3D";
import { DrawingCanvas } from "./DrawingCanvas";
import { PredictionBars } from "./PredictionBars";
import { ActivationMaps } from "./ActivationMaps";
import { SamplePredictions } from "./SamplePredictions";

const FONT = "'Fira Code', monospace";

interface Props {
  state: DigitState;
  tfReady: boolean;
  dispatch: Dispatch<MlDemoAction>;
}

export function DigitRecognitionTab({ state, tfReady, dispatch }: Props) {
  const modelRef = useRef<import("@tensorflow/tfjs").LayersModel | null>(null);
  const dataRef = useRef<MnistData | null>(null);
  const activationsRef = useRef<
    { filterMaps: Float32Array[]; width: number; height: number }[] | null
  >(null);
  const [inputPixels, setInputPixels] = useState<Float32Array | null>(null);

  // Load pretrained model by default
  useEffect(() => {
    if (!tfReady || state.mode !== "pretrained") return;

    let cancelled = false;

    (async () => {
      try {
        dispatch({ type: "DIGIT_PHASE", phase: "loading-model" });
        const model = await loadPretrainedModel();
        if (cancelled) {
          model.dispose();
          return;
        }
        modelRef.current = model;
        dispatch({ type: "DIGIT_TRAINED", sampleResults: [] });
      } catch (err) {
        if (!cancelled) {
          dispatch({
            type: "DIGIT_PHASE",
            phase: "error",
            error: String(err),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfReady, state.mode]);

  // Train from scratch when user requests it
  useEffect(() => {
    if (!tfReady || state.mode !== "training") return;

    let cancelled = false;

    (async () => {
      try {
        // Load data
        dispatch({ type: "DIGIT_PHASE", phase: "loading-data" });
        const data = await loadMnistData((progress) => {
          if (!cancelled) {
            dispatch({ type: "DIGIT_LOAD_PROGRESS", progress });
          }
        });
        if (cancelled) {
          disposeMnistData(data);
          return;
        }
        dataRef.current = data;

        // Create and train model with gradient tracking
        dispatch({ type: "DIGIT_PHASE", phase: "training" });
        const model = createDigitModel();
        modelRef.current = model;

        await trainWithGradientTracking(model, data, (step) => {
          if (!cancelled) {
            dispatch({
              type: "DIGIT_EPOCH",
              epoch: step.epoch,
              loss: step.loss,
              accuracy: step.accuracy,
            });
            dispatch({
              type: "DIGIT_WEIGHT_UPDATE",
              deltas: step.layerDeltas,
              gradients: step.layerGradients,
            });
          }
        });

        if (cancelled) return;

        // Evaluate samples
        const sampleResults = evaluateSamples(model, data, 20);
        dispatch({ type: "DIGIT_TRAINED", sampleResults });
      } catch (err) {
        if (!cancelled) {
          dispatch({
            type: "DIGIT_PHASE",
            phase: "error",
            error: String(err),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfReady, state.mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      modelRef.current?.dispose();
      if (dataRef.current) disposeMnistData(dataRef.current);
    };
  }, []);

  const handleDrawingComplete = useCallback(
    (imageData: Float32Array) => {
      const model = modelRef.current;
      if (!model) return;

      try {
        // Store input pixels for 3D viz
        setInputPixels(imageData);

        const predictions = predictDigit(model, imageData);
        dispatch({ type: "DIGIT_PREDICTION", predictions });

        // Get activation maps for 2D heatmaps
        const maps = getActivationMaps(model, imageData);
        activationsRef.current = maps;

        // Get per-layer activations for 3D viz
        const layerActs = getLayerActivations(model, imageData);
        dispatch({ type: "DIGIT_ACTIVATIONS", activations: layerActs });
      } catch (err) {
        console.warn("Prediction failed:", err);
      }
    },
    [dispatch]
  );

  const handleClear = useCallback(() => {
    activationsRef.current = null;
    setInputPixels(null);
    dispatch({ type: "DIGIT_CLEAR_PREDICTION" });
  }, [dispatch]);

  const handleStartTraining = useCallback(() => {
    // Dispose previous model (try-catch in case model is already corrupted)
    try {
      modelRef.current?.dispose();
    } catch {
      // ignore
    }
    modelRef.current = null;
    if (dataRef.current) {
      disposeMnistData(dataRef.current);
      dataRef.current = null;
    }
    // Clear local drawing state
    setInputPixels(null);
    activationsRef.current = null;
    dispatch({ type: "DIGIT_MODE", mode: "training" });
  }, [dispatch]);

  const isTrained = state.metrics.phase === "trained";
  const isTrainingMode = state.mode === "training";

  return (
    <Box>
      {/* Training section */}
      <TrainingPanel metrics={state.metrics} mode={state.mode} />

      {/* Train your Own Model button */}
      {isTrained && !isTrainingMode && (
        <Box sx={{ mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ModelTrainingIcon />}
            onClick={handleStartTraining}
            sx={{
              fontSize: "0.7rem",
              textTransform: "none",
              fontFamily: FONT,
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "rgba(255,255,255,0.03)",
              },
            }}
          >
            Train your Own Model
          </Button>
        </Box>
      )}

      {/* Sample predictions (after local training) */}
      {state.sampleResults.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <SamplePredictions samples={state.sampleResults} />
        </Box>
      )}

      {/* Drawing + prediction section */}
      <Box
        sx={{
          mt: 2.5,
          pt: 2,
          borderTop: "1px solid #1a1a1a",
          display: "flex",
          gap: { xs: 2, sm: 3 },
          flexWrap: "wrap",
        }}
      >
        {/* Drawing canvas */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: FONT,
              fontSize: "0.7rem",
              color: "text.secondary",
              mb: 1,
            }}
          >
            {isTrained
              ? "Draw a digit (0-9)"
              : "Canvas activates after model loads"}
          </Typography>
          <DrawingCanvas
            disabled={!isTrained}
            onDrawingComplete={handleDrawingComplete}
            onClear={handleClear}
          />
        </Box>

        {/* Results panel */}
        <Box sx={{ flex: 1, minWidth: 160 }}>
          <PredictionBars predictions={state.predictions} />

          {/* Activation maps */}
          <Box sx={{ mt: 2 }}>
            <ActivationMaps layers={activationsRef.current} />
          </Box>
        </Box>
      </Box>

      {/* 3D CNN Architecture — below predictions */}
      <Box sx={{ mt: 2.5 }}>
        <CnnViz3D
          inputPixels={inputPixels}
          predictions={state.predictions}
          weightDeltas={state.weightDeltas}
          gradientMagnitudes={state.gradientMagnitudes}
          height={340}
        />
      </Box>
    </Box>
  );
}
