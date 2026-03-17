#!/usr/bin/env node
/**
 * Trains the MNIST CNN and saves a pretrained model to public/models/mnist/.
 * Reads the existing sprite PNG + labels from public/data/mnist/.
 *
 * Usage: node scripts/train-mnist-model.mjs
 * Requires: @tensorflow/tfjs-node (dev dep), sharp (dev dep)
 */

import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data", "mnist");
const MODEL_DIR = join(__dirname, "..", "public", "models", "mnist");

const IMG_SIZE = 28;
const GRID_COLS = 100;
const TOTAL_IMAGES = 10_000;
const TRAIN_COUNT = 8_000;
const NUM_CLASSES = 10;
const EPOCHS = 30;
const BATCH_SIZE = 128;

async function main() {
  console.log("=== MNIST Model Training ===\n");

  // Dynamic import to avoid issues if not installed
  const tf = await import("@tensorflow/tfjs-node");
  const sharp = (await import("sharp")).default;

  // Read sprite PNG and extract pixel data
  console.log("Step 1: Loading sprite sheet...");
  const spritePath = join(DATA_DIR, "mnist_sprites.png");
  const { data: rawPixels, info } = await sharp(spritePath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`  Sprite: ${info.width}x${info.height}, ${info.channels} channel(s)`);

  // Read labels
  const labelsPath = join(DATA_DIR, "mnist_labels.bin");
  const labels = readFileSync(labelsPath);
  console.log(`  Labels: ${labels.length} entries`);

  // Extract individual images as normalized Float32Array
  console.log("\nStep 2: Extracting images...");
  const allImages = new Float32Array(TOTAL_IMAGES * IMG_SIZE * IMG_SIZE);

  for (let i = 0; i < TOTAL_IMAGES; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const imgOffset = i * IMG_SIZE * IMG_SIZE;

    for (let y = 0; y < IMG_SIZE; y++) {
      for (let x = 0; x < IMG_SIZE; x++) {
        const srcIdx = (row * IMG_SIZE + y) * info.width + (col * IMG_SIZE + x);
        allImages[imgOffset + y * IMG_SIZE + x] = rawPixels[srcIdx] / 255;
      }
    }
  }

  // Create tensors
  console.log("\nStep 3: Creating tensors...");
  const trainImages = tf.tensor4d(
    allImages.slice(0, TRAIN_COUNT * IMG_SIZE * IMG_SIZE),
    [TRAIN_COUNT, IMG_SIZE, IMG_SIZE, 1]
  );
  const testImages = tf.tensor4d(
    allImages.slice(TRAIN_COUNT * IMG_SIZE * IMG_SIZE),
    [TOTAL_IMAGES - TRAIN_COUNT, IMG_SIZE, IMG_SIZE, 1]
  );

  const trainLabels = tf.oneHot(
    tf.tensor1d(Array.from(labels.slice(0, TRAIN_COUNT)), "int32"),
    NUM_CLASSES
  );
  const testLabels = tf.oneHot(
    tf.tensor1d(Array.from(labels.slice(TRAIN_COUNT)), "int32"),
    NUM_CLASSES
  );

  // Build model (same architecture as digitModel.ts)
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

  // Train
  console.log(`\nStep 5: Training for ${EPOCHS} epochs...`);
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

  // Evaluate on test set
  console.log("\nStep 6: Evaluating on test set...");
  const evalResult = model.evaluate(testImages, testLabels);
  const testLoss = evalResult[0].dataSync()[0];
  const testAcc = evalResult[1].dataSync()[0];
  console.log(`  Test loss: ${testLoss.toFixed(4)}, Test accuracy: ${(testAcc * 100).toFixed(1)}%`);

  // Save model
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
