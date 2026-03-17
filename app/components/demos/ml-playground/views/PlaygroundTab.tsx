import { useRef, useEffect, useCallback, useState, type Dispatch } from "react";
import { Box, Typography } from "@mui/material";
import type { PlaygroundState, MlDemoAction, PlaygroundConfig } from "../engine/types";
import { generateDataset } from "../engine/datasetGenerators";
import {
  createPlaygroundModel,
  trainPlaygroundModel,
  computeDecisionBoundary,
} from "../engine/playgroundModel";
import { PlaygroundConfig as ConfigPanel } from "./PlaygroundConfig";
import { DecisionBoundaryCanvas } from "./DecisionBoundaryCanvas";
import { LossChart } from "./LossChart";

const FONT = "'Fira Code', monospace";
const BOUNDARY_RESOLUTION = 60;

interface Props {
  state: PlaygroundState;
  tfReady: boolean;
  dispatch: Dispatch<MlDemoAction>;
}

export function PlaygroundTab({ state, tfReady, dispatch }: Props) {
  const modelRef = useRef<import("@tensorflow/tfjs").LayersModel | null>(null);
  const [boundary, setBoundary] = useState<Float32Array | null>(null);

  // Generate initial dataset
  useEffect(() => {
    const data = generateDataset(state.config.dataset, 200);
    dispatch({
      type: "PG_SET_DATA",
      dataPoints: data.points.map((p, i) => ({
        x: p[0],
        y: p[1],
        label: data.labels[i],
      })),
    });
  }, [state.config.dataset, dispatch]);

  const handleConfigChange = useCallback(
    (partial: Partial<PlaygroundConfig>) => {
      dispatch({ type: "PG_SET_CONFIG", config: partial });
    },
    [dispatch]
  );

  const handleTrain = useCallback(async () => {
    if (!tfReady || state.dataPoints.length === 0) return;

    // Dispose previous model
    modelRef.current?.dispose();
    setBoundary(null);
    dispatch({ type: "PG_RESET" });
    dispatch({ type: "PG_PHASE", phase: "training" });

    const model = createPlaygroundModel(state.config);
    modelRef.current = model;

    const dataset = {
      points: state.dataPoints.map((p) => [p.x, p.y] as [number, number]),
      labels: state.dataPoints.map((p) => p.label),
    };

    await trainPlaygroundModel(
      model,
      dataset,
      (epoch, loss) => {
        dispatch({ type: "PG_EPOCH", epoch, loss });

        // Update boundary every 5 epochs
        if (epoch % 5 === 0 || epoch === state.config.hiddenLayers) {
          const b = computeDecisionBoundary(model, BOUNDARY_RESOLUTION);
          setBoundary(new Float32Array(b));
        }
      },
      200
    );

    // Final high-res boundary
    const finalBoundary = computeDecisionBoundary(model, BOUNDARY_RESOLUTION);
    setBoundary(new Float32Array(finalBoundary));
    dispatch({ type: "PG_PHASE", phase: "trained" });
  }, [tfReady, state.dataPoints, state.config, dispatch]);

  const handleReset = useCallback(() => {
    modelRef.current?.dispose();
    modelRef.current = null;
    setBoundary(null);
    dispatch({ type: "PG_RESET" });
    // Regenerate dataset
    const data = generateDataset(state.config.dataset, 200);
    dispatch({
      type: "PG_SET_DATA",
      dataPoints: data.points.map((p, i) => ({
        x: p[0],
        y: p[1],
        label: data.labels[i],
      })),
    });
  }, [state.config.dataset, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      modelRef.current?.dispose();
    };
  }, []);

  return (
    <Box>
      {!tfReady && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: FONT, fontSize: "0.75rem", mb: 2 }}
        >
          Loading TensorFlow.js...
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, sm: 3 },
          flexWrap: "wrap",
        }}
      >
        {/* Config panel */}
        <Box sx={{ minWidth: 200, maxWidth: 260, flex: "0 0 auto" }}>
          <ConfigPanel
            config={state.config}
            phase={state.phase}
            onConfigChange={handleConfigChange}
            onTrain={handleTrain}
            onReset={handleReset}
          />
        </Box>

        {/* Visualization */}
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <DecisionBoundaryCanvas
            dataPoints={state.dataPoints}
            boundary={boundary}
            resolution={BOUNDARY_RESOLUTION}
          />

          {/* Loss chart */}
          {state.lossHistory.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <LossChart
                data={state.lossHistory}
                label="Loss"
                color="#f97316"
                width={400}
                height={80}
              />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: FONT,
                  fontSize: "0.65rem",
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                Epoch {state.epoch}/{state.totalEpochs}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
