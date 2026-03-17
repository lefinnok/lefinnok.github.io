import * as tf from "@tensorflow/tfjs";
import type { MnistData } from "./mnistLoader";
import type { LayerVizData } from "./types";

const BATCH_SIZE = 128;
const TOTAL_EPOCHS = 10;

export interface TrainStepData {
  epoch: number;
  loss: number;
  accuracy: number;
  layerDeltas: LayerVizData[];
  layerGradients: LayerVizData[];
}

/**
 * Custom training loop that exposes real weight deltas and gradient magnitudes
 * per epoch for the 3D CNN visualization.
 *
 * Uses optimizer.computeGradients() + applyGradients() instead of model.fit()
 * to get access to actual gradient tensors.
 */
export async function trainWithGradientTracking(
  model: tf.LayersModel,
  data: MnistData,
  onStep: (step: TrainStepData) => void,
  onBatchProgress?: (batch: number, totalBatches: number) => void
): Promise<void> {
  const optimizer = model.optimizer as tf.Optimizer;
  const numSamples = data.trainImages.shape[0];
  const numBatches = Math.ceil(numSamples / BATCH_SIZE);

  // Snapshot weights at start for delta computation
  let prevWeights = await snapshotWeights(model);

  for (let epoch = 0; epoch < TOTAL_EPOCHS; epoch++) {
    // Shuffle indices
    const indices = tf.util.createShuffledIndices(numSamples);
    let epochLoss = 0;
    let epochCorrect = 0;
    let epochTotal = 0;

    // Last batch gradients for visualization
    let lastGrads: Record<string, Float32Array> = {};

    for (let b = 0; b < numBatches; b++) {
      const start = b * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, numSamples);
      const batchSize = end - start;

      // Gather batch indices
      const batchIndices = Array.from(indices.slice(start, end));
      const batchIdxTensor = tf.tensor1d(batchIndices, "int32");

      const batchX = tf.gather(data.trainImages, batchIdxTensor);
      const batchY = tf.gather(data.trainLabels, batchIdxTensor);

      // Compute gradients and loss
      const { value: lossTensor, grads } = optimizer.computeGradients(() => {
        const preds = model.apply(batchX, { training: true }) as tf.Tensor;
        return tf.losses.softmaxCrossEntropy(batchY, preds);
      });

      // Apply gradients
      optimizer.applyGradients(grads);

      // Accumulate loss
      const lossVal = lossTensor.dataSync()[0];
      epochLoss += lossVal * batchSize;

      // Compute accuracy
      const preds = model.predict(batchX) as tf.Tensor;
      const predLabels = preds.argMax(-1);
      const trueLabels = batchY.argMax(-1);
      const correct = predLabels
        .equal(trueLabels)
        .sum()
        .dataSync()[0];
      epochCorrect += correct;
      epochTotal += batchSize;

      // Save last batch gradients for per-layer visualization
      if (b === numBatches - 1) {
        lastGrads = {};
        for (const varName in grads) {
          lastGrads[varName] = new Float32Array(
            await grads[varName].data()
          );
        }
      }

      // Dispose tensors
      lossTensor.dispose();
      for (const key in grads) grads[key].dispose();
      batchIdxTensor.dispose();
      batchX.dispose();
      batchY.dispose();
      preds.dispose();
      predLabels.dispose();
      trueLabels.dispose();

      onBatchProgress?.(b + 1, numBatches);
    }

    // Compute per-layer weight deltas
    const currentWeights = await snapshotWeights(model);
    const layerDeltas = computeLayerDeltas(model, prevWeights, currentWeights);
    prevWeights = currentWeights;

    // Compute per-layer gradient magnitudes from last batch
    const layerGradients = computeLayerGradients(model, lastGrads);

    const avgLoss = epochLoss / epochTotal;
    const accuracy = epochCorrect / epochTotal;

    onStep({
      epoch: epoch + 1,
      loss: avgLoss,
      accuracy,
      layerDeltas,
      layerGradients,
    });

    // Yield to UI
    await tf.nextFrame();
  }
}

/**
 * Snapshot all trainable weights as Float32Arrays.
 */
async function snapshotWeights(
  model: tf.LayersModel
): Promise<Map<string, Float32Array>> {
  const snapshot = new Map<string, Float32Array>();
  for (const layer of model.layers) {
    const weights = layer.getWeights();
    for (let i = 0; i < weights.length; i++) {
      const key = `${layer.name}/${i}`;
      snapshot.set(key, new Float32Array(await weights[i].data()));
    }
  }
  return snapshot;
}

/**
 * Compute per-layer mean absolute weight delta between two snapshots.
 * Returns one entry per model layer (including non-trainable layers for
 * alignment with the CNN_LAYERS visualization data).
 */
function computeLayerDeltas(
  model: tf.LayersModel,
  prev: Map<string, Float32Array>,
  curr: Map<string, Float32Array>
): LayerVizData[] {
  const results: LayerVizData[] = [];
  let maxDelta = 0;

  // One entry for input
  results.push({ name: "Input", magnitude: 0 });

  for (const layer of model.layers) {
    const className = layer.getClassName();
    const weights = layer.getWeights();
    if (weights.length === 0) {
      results.push({ name: className, magnitude: 0 });
      continue;
    }

    let totalDelta = 0;
    let count = 0;
    for (let i = 0; i < weights.length; i++) {
      const key = `${layer.name}/${i}`;
      const prevW = prev.get(key);
      const currW = curr.get(key);
      if (!prevW || !currW) continue;

      for (let j = 0; j < prevW.length; j++) {
        totalDelta += Math.abs(currW[j] - prevW[j]);
        count++;
      }
    }

    const meanDelta = count > 0 ? totalDelta / count : 0;
    if (meanDelta > maxDelta) maxDelta = meanDelta;
    results.push({ name: className, magnitude: meanDelta });
  }

  // Normalize to 0-1
  if (maxDelta > 0) {
    for (const r of results) {
      r.magnitude /= maxDelta;
    }
  }

  return results;
}

/**
 * Compute per-layer gradient magnitudes from the last batch's gradients.
 */
function computeLayerGradients(
  model: tf.LayersModel,
  grads: Record<string, Float32Array>
): LayerVizData[] {
  const results: LayerVizData[] = [];
  let maxMag = 0;

  results.push({ name: "Input", magnitude: 0 });

  for (const layer of model.layers) {
    const className = layer.getClassName();
    const trainableWeights = layer.trainableWeights;
    if (trainableWeights.length === 0) {
      results.push({ name: className, magnitude: 0 });
      continue;
    }

    let totalMag = 0;
    let count = 0;
    for (const tw of trainableWeights) {
      const gradData = grads[tw.name];
      if (!gradData) continue;
      for (let j = 0; j < gradData.length; j++) {
        totalMag += Math.abs(gradData[j]);
        count++;
      }
    }

    const meanMag = count > 0 ? totalMag / count : 0;
    if (meanMag > maxMag) maxMag = meanMag;
    results.push({ name: className, magnitude: meanMag });
  }

  // Normalize to 0-1
  if (maxMag > 0) {
    for (const r of results) {
      r.magnitude /= maxMag;
    }
  }

  return results;
}

export { TOTAL_EPOCHS };
