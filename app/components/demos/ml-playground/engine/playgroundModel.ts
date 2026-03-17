import * as tf from "@tensorflow/tfjs";
import type { PlaygroundConfig } from "./types";
import type { Dataset2D } from "./datasetGenerators";

const DEFAULT_EPOCHS = 200;
const BATCH_SIZE = 32;

/**
 * Build an MLP for 2D binary classification from playground config.
 */
export function createPlaygroundModel(
  config: PlaygroundConfig
): tf.LayersModel {
  const model = tf.sequential();

  // First hidden layer (with inputShape)
  model.add(
    tf.layers.dense({
      inputShape: [2],
      units: config.neuronsPerLayer,
      activation: config.activation,
    })
  );

  // Additional hidden layers
  for (let i = 1; i < config.hiddenLayers; i++) {
    model.add(
      tf.layers.dense({
        units: config.neuronsPerLayer,
        activation: config.activation,
      })
    );
  }

  // Output layer — binary classification
  model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

  model.compile({
    optimizer: tf.train.adam(config.learningRate),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

/**
 * Train the playground model with per-epoch callbacks.
 */
export async function trainPlaygroundModel(
  model: tf.LayersModel,
  dataset: Dataset2D,
  onEpochEnd: (epoch: number, loss: number) => void,
  epochs: number = DEFAULT_EPOCHS
): Promise<void> {
  const xs = tf.tensor2d(dataset.points);
  const ys = tf.oneHot(tf.tensor1d(dataset.labels, "int32"), 2);

  try {
    await model.fit(xs, ys, {
      epochs,
      batchSize: BATCH_SIZE,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          onEpochEnd(epoch + 1, logs?.loss ?? 0);
        },
      },
    });
  } finally {
    xs.dispose();
    ys.dispose();
  }
}

/**
 * Compute decision boundary on a grid.
 * Returns a Float32Array of [resolution * resolution] values in [0, 1],
 * representing the probability of class 1 at each grid point.
 */
export function computeDecisionBoundary(
  model: tf.LayersModel,
  resolution: number,
  range: number = 1.2
): Float32Array {
  const gridPoints: number[] = [];
  const step = (2 * range) / resolution;

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      gridPoints.push(-range + x * step, -range + y * step);
    }
  }

  const input = tf.tensor2d(gridPoints, [resolution * resolution, 2]);
  const preds = model.predict(input) as tf.Tensor;
  // Get probability of class 1 (second column)
  const class1Probs = preds.slice([0, 1], [-1, 1]);
  const result = new Float32Array(class1Probs.dataSync());

  input.dispose();
  preds.dispose();
  class1Probs.dispose();

  return result;
}
