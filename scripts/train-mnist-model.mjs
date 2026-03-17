#!/usr/bin/env node
/**
 * Trains the MNIST CNN on the FULL 60K training set and saves to public/models/mnist/.
 * Downloads raw MNIST IDX files directly (no sprite dependency).
 *
 * Usage: node scripts/train-mnist-model.mjs
 * Requires: @tensorflow/tfjs-node (dev dep)
 */

import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = join(__dirname, "..", "public", "models", "mnist");

const IMG_SIZE = 28;
const NUM_CLASSES = 10;
const EPOCHS = 30;
const BATCH_SIZE = 128;

const MNIST_BASE = "https://storage.googleapis.com/cvdf-datasets/mnist/";
const FILES = {
  trainImages: "train-images-idx3-ubyte.gz",
  trainLabels: "train-labels-idx1-ubyte.gz",
  testImages: "t10k-images-idx3-ubyte.gz",
  testLabels: "t10k-labels-idx1-ubyte.gz",
};

async function downloadAndDecompress(filename) {
  const url = MNIST_BASE + filename;
  console.log(`  Downloading ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const chunks = [];
  const gunzip = createGunzip();
  const readable = Readable.fromWeb(res.body);

  return new Promise((resolve, reject) => {
    readable
      .pipe(gunzip)
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .on("error", reject);
  });
}

function parseIDXImages(buf) {
  const numImages = buf.readUInt32BE(4);
  const rows = buf.readUInt32BE(8);
  const cols = buf.readUInt32BE(12);
  console.log(`  Images: ${numImages} x ${rows}x${cols}`);
  const pixels = buf.subarray(16);
  return { numImages, rows, cols, pixels };
}

function parseIDXLabels(buf) {
  const numLabels = buf.readUInt32BE(4);
  console.log(`  Labels: ${numLabels}`);
  return { numLabels, labels: buf.subarray(8) };
}

async function main() {
  console.log("=== MNIST Model Training (Full 60K) ===\n");

  const tf = await import("@tensorflow/tfjs-node");

  // Step 1: Download all four MNIST IDX files
  console.log("Step 1: Downloading MNIST...");
  const [trainImgBuf, trainLblBuf, testImgBuf, testLblBuf] = await Promise.all(
    [
      downloadAndDecompress(FILES.trainImages),
      downloadAndDecompress(FILES.trainLabels),
      downloadAndDecompress(FILES.testImages),
      downloadAndDecompress(FILES.testLabels),
    ]
  );

  // Step 2: Parse IDX format
  console.log("\nStep 2: Parsing IDX format...");
  const trainImgs = parseIDXImages(trainImgBuf);
  const trainLbls = parseIDXLabels(trainLblBuf);
  const testImgs = parseIDXImages(testImgBuf);
  const testLbls = parseIDXLabels(testLblBuf);

  // Step 3: Create normalized tensors
  console.log("\nStep 3: Creating tensors...");
  const trainPixels = new Float32Array(
    trainImgs.numImages * IMG_SIZE * IMG_SIZE
  );
  for (let i = 0; i < trainImgs.pixels.length; i++) {
    trainPixels[i] = trainImgs.pixels[i] / 255;
  }
  const testPixels = new Float32Array(testImgs.numImages * IMG_SIZE * IMG_SIZE);
  for (let i = 0; i < testImgs.pixels.length; i++) {
    testPixels[i] = testImgs.pixels[i] / 255;
  }

  const trainImages = tf.tensor4d(trainPixels, [
    trainImgs.numImages,
    IMG_SIZE,
    IMG_SIZE,
    1,
  ]);
  const testImages = tf.tensor4d(testPixels, [
    testImgs.numImages,
    IMG_SIZE,
    IMG_SIZE,
    1,
  ]);

  const trainLabels = tf.oneHot(
    tf.tensor1d(Array.from(trainLbls.labels), "int32"),
    NUM_CLASSES
  );
  const testLabels = tf.oneHot(
    tf.tensor1d(Array.from(testLbls.labels), "int32"),
    NUM_CLASSES
  );

  console.log(`  Train: ${trainImages.shape}, Test: ${testImages.shape}`);

  // Step 4: Build model (same architecture as digitModel.ts)
  console.log("\nStep 4: Building model...");
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

  model.summary();

  // Step 5: Train on full 60K
  console.log(
    `\nStep 5: Training on ${trainImgs.numImages} images for ${EPOCHS} epochs...`
  );
  await model.fit(trainImages, trainLabels, {
    epochs: EPOCHS,
    batchSize: BATCH_SIZE,
    validationSplit: 0.1,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `  Epoch ${epoch + 1}/${EPOCHS} — loss: ${logs.loss.toFixed(4)}, acc: ${logs.acc.toFixed(4)}, val_loss: ${logs.val_loss.toFixed(4)}, val_acc: ${logs.val_acc.toFixed(4)}`
        );
      },
    },
  });

  // Step 6: Evaluate on full 10K test set
  console.log("\nStep 6: Evaluating on test set...");
  const evalResult = model.evaluate(testImages, testLabels);
  const testLoss = evalResult[0].dataSync()[0];
  const testAcc = evalResult[1].dataSync()[0];
  console.log(
    `  Test loss: ${testLoss.toFixed(4)}, Test accuracy: ${(testAcc * 100).toFixed(1)}%`
  );

  // Step 7: Save model
  console.log("\nStep 7: Saving model...");
  mkdirSync(MODEL_DIR, { recursive: true });
  await model.save(`file://${MODEL_DIR}`);
  console.log(`  Saved to ${MODEL_DIR}/`);

  // Cleanup
  trainImages.dispose();
  testImages.dispose();
  trainLabels.dispose();
  testLabels.dispose();

  console.log("\n=== Done! ===");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
