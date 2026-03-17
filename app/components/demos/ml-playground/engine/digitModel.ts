import * as tf from "@tensorflow/tfjs";
import type { MnistData } from "./mnistLoader";
import type { LayerVizData } from "./types";

const IMG_SIZE = 28;
const NUM_CLASSES = 10;
const TOTAL_EPOCHS = 10;
const BATCH_SIZE = 128;
const PRETRAINED_MODEL_URL = "/models/mnist/model.json";

/**
 * Load the pretrained MNIST model from static assets.
 */
export async function loadPretrainedModel(): Promise<tf.LayersModel> {
  return tf.loadLayersModel(PRETRAINED_MODEL_URL);
}

/**
 * Build a small CNN for MNIST digit classification.
 * Conv2D(8,3x3) → MaxPool → Conv2D(16,3x3) → MaxPool → Dense(128) → Dense(10)
 */
export function createDigitModel(): tf.LayersModel {
  const model = tf.sequential();

  model.add(
    tf.layers.conv2d({
      inputShape: [IMG_SIZE, IMG_SIZE, 1],
      filters: 8,
      kernelSize: 3,
      activation: "relu",
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  model.add(
    tf.layers.conv2d({
      filters: 16,
      kernelSize: 3,
      activation: "relu",
    })
  );
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 128, activation: "relu" }));
  model.add(tf.layers.dense({ units: NUM_CLASSES, activation: "softmax" }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

/**
 * Train the model on MNIST data with per-epoch callback.
 */
export async function trainDigitModel(
  model: tf.LayersModel,
  data: MnistData,
  onEpochEnd: (epoch: number, loss: number, accuracy: number) => void
): Promise<void> {
  await model.fit(data.trainImages, data.trainLabels, {
    epochs: TOTAL_EPOCHS,
    batchSize: BATCH_SIZE,
    validationSplit: 0.1,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        onEpochEnd(epoch + 1, logs?.loss ?? 0, logs?.acc ?? 0);
      },
    },
  });
}

/**
 * Predict a single 28x28 grayscale image. Returns softmax probabilities.
 */
export function predictDigit(
  model: tf.LayersModel,
  imageData: Float32Array
): number[] {
  const input = tf.tensor4d(imageData, [1, IMG_SIZE, IMG_SIZE, 1]);
  const preds = model.predict(input) as tf.Tensor;
  const probs = Array.from(preds.dataSync());
  input.dispose();
  preds.dispose();
  return probs;
}

/**
 * Get per-layer activation magnitudes for 3D CNN visualization.
 * Returns a LayerVizData[] with normalized mean activation for each layer.
 *
 * NOTE: We must NOT call activationModel.dispose() on intermediate models
 * created via tf.model() — they share weight tensors with the original model,
 * and disposing them kills the shared weights.
 */
export function getLayerActivations(
  model: tf.LayersModel,
  imageData: Float32Array
): LayerVizData[] {
  const input = tf.tensor4d(imageData, [1, IMG_SIZE, IMG_SIZE, 1]);
  const results: LayerVizData[] = [];

  // Input layer magnitude (mean pixel intensity)
  const inputMean = tf.tidy(() => tf.mean(input).dataSync()[0]);
  results.push({ name: "Input", magnitude: inputMean });

  // Track max magnitude for normalization
  let maxMag = inputMean;
  const rawMags: { name: string; mag: number }[] = [];

  for (const layer of model.layers) {
    const className = layer.getClassName();
    if (className === "InputLayer") continue;

    const activationModel = tf.model({
      inputs: model.input,
      outputs: layer.output,
    });

    const activation = activationModel.predict(input) as tf.Tensor;
    const meanAct = tf.tidy(() =>
      tf.mean(tf.abs(activation)).dataSync()[0]
    );
    rawMags.push({ name: className, mag: meanAct });
    if (meanAct > maxMag) maxMag = meanAct;

    activation.dispose();
    // Do NOT dispose activationModel — it shares weights with the original model
  }

  // Normalize to 0-1 range
  for (const { name, mag } of rawMags) {
    results.push({ name, magnitude: maxMag > 0 ? mag / maxMag : 0 });
  }

  // Also normalize input
  results[0].magnitude = maxMag > 0 ? inputMean / maxMag : 0;

  input.dispose();
  return results;
}

/**
 * Get activation maps for each conv layer.
 * Returns an array of { filterMaps: Float32Array[], width, height } per conv layer.
 */
export function getActivationMaps(
  model: tf.LayersModel,
  imageData: Float32Array
): { filterMaps: Float32Array[]; width: number; height: number }[] {
  const input = tf.tensor4d(imageData, [1, IMG_SIZE, IMG_SIZE, 1]);
  const results: { filterMaps: Float32Array[]; width: number; height: number }[] = [];

  for (const layer of model.layers) {
    if (layer.getClassName() !== "Conv2D") continue;

    const activationModel = tf.model({
      inputs: model.input,
      outputs: layer.output,
    });

    const activation = activationModel.predict(input) as tf.Tensor;
    const [, h, w, filters] = activation.shape;

    const filterMaps: Float32Array[] = [];
    for (let f = 0; f < filters; f++) {
      const slice = activation.slice([0, 0, 0, f], [1, h, w, 1]);
      filterMaps.push(new Float32Array(slice.dataSync()));
      slice.dispose();
    }

    results.push({ filterMaps, width: w, height: h });
    activation.dispose();
    // Do NOT dispose activationModel — it shares weights with the original model
  }

  input.dispose();
  return results;
}

/**
 * Evaluate model on test set, return per-sample predicted vs actual.
 */
export function evaluateSamples(
  model: tf.LayersModel,
  data: MnistData,
  count: number
): { predicted: number; actual: number }[] {
  const testSlice = data.testImages.slice(0, count);
  const preds = model.predict(testSlice) as tf.Tensor;
  const predArgmax = preds.argMax(-1).dataSync();
  const actualArgmax = data.testLabels.slice(0, count).argMax(-1).dataSync();

  const results: { predicted: number; actual: number }[] = [];
  for (let i = 0; i < count; i++) {
    results.push({ predicted: predArgmax[i], actual: actualArgmax[i] });
  }

  testSlice.dispose();
  preds.dispose();
  return results;
}

export { TOTAL_EPOCHS };
