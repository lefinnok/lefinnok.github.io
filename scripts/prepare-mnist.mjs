#!/usr/bin/env node
/**
 * Downloads MNIST dataset, extracts a balanced 10K subset,
 * and writes a sprite sheet PNG + labels binary to public/data/mnist/.
 *
 * Usage: node scripts/prepare-mnist.mjs
 *
 * Requires: npm install sharp (dev dependency, used only for sprite generation)
 */

import { createWriteStream, writeFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "data", "mnist");

const MNIST_BASE = "https://storage.googleapis.com/cvdf-datasets/mnist/";
const FILES = {
  trainImages: "train-images-idx3-ubyte.gz",
  trainLabels: "train-labels-idx1-ubyte.gz",
};

const SAMPLES_PER_CLASS = 1000; // 1K per digit = 10K total
const NUM_CLASSES = 10;
const TOTAL = SAMPLES_PER_CLASS * NUM_CLASSES;
const IMG_SIZE = 28;
const GRID_COLS = 100; // 100 cols x 100 rows = 10,000 images
const GRID_ROWS = 100;

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
  // IDX format: 4 bytes magic, 4 bytes numImages, 4 bytes rows, 4 bytes cols, then pixel data
  const magic = buf.readUInt32BE(0);
  const numImages = buf.readUInt32BE(4);
  const rows = buf.readUInt32BE(8);
  const cols = buf.readUInt32BE(12);
  console.log(`  Images: ${numImages} x ${rows}x${cols} (magic: 0x${magic.toString(16)})`);
  const pixels = buf.subarray(16);
  return { numImages, rows, cols, pixels };
}

function parseIDXLabels(buf) {
  const magic = buf.readUInt32BE(0);
  const numLabels = buf.readUInt32BE(4);
  console.log(`  Labels: ${numLabels} (magic: 0x${magic.toString(16)})`);
  const labels = buf.subarray(8);
  return { numLabels, labels };
}

function selectBalancedSubset(images, labels, samplesPerClass) {
  const buckets = Array.from({ length: NUM_CLASSES }, () => []);

  // Bucket indices by label
  for (let i = 0; i < labels.numLabels; i++) {
    const label = labels.labels[i];
    if (buckets[label].length < samplesPerClass) {
      buckets[label].push(i);
    }
  }

  // Interleave: take from each class in round-robin for good shuffling
  const selectedIndices = [];
  for (let s = 0; s < samplesPerClass; s++) {
    for (let c = 0; c < NUM_CLASSES; c++) {
      selectedIndices.push(buckets[c][s]);
    }
  }

  const pixelsPerImage = images.rows * images.cols;
  const outPixels = Buffer.alloc(selectedIndices.length * pixelsPerImage);
  const outLabels = Buffer.alloc(selectedIndices.length);

  for (let i = 0; i < selectedIndices.length; i++) {
    const srcIdx = selectedIndices[i];
    images.pixels.copy(outPixels, i * pixelsPerImage, srcIdx * pixelsPerImage, (srcIdx + 1) * pixelsPerImage);
    outLabels[i] = labels.labels[srcIdx];
  }

  return { pixels: outPixels, labels: outLabels, count: selectedIndices.length };
}

async function createSpritePNG(subset) {
  // Try to use sharp; if not available, fall back to raw binary format
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.log("  sharp not installed — writing raw binary format instead of PNG sprite.");
    console.log("  (Run `npm install -D sharp` for PNG sprite output)");

    // Write raw pixels as a binary file that the browser can decode
    const outPath = join(OUT_DIR, "mnist_sprites.bin");
    writeFileSync(outPath, subset.pixels);
    console.log(`  Wrote ${outPath} (${(subset.pixels.length / 1024 / 1024).toFixed(2)} MB)`);

    // Write metadata
    const meta = {
      totalImages: subset.count,
      imageSize: IMG_SIZE,
      gridCols: GRID_COLS,
      gridRows: GRID_ROWS,
      format: "raw_grayscale",
    };
    writeFileSync(join(OUT_DIR, "metadata.json"), JSON.stringify(meta, null, 2));
    return;
  }

  // Arrange images in a grid: GRID_COLS x GRID_ROWS
  const spriteW = GRID_COLS * IMG_SIZE; // 2800
  const spriteH = GRID_ROWS * IMG_SIZE; // 2800
  const spritePixels = Buffer.alloc(spriteW * spriteH, 0);

  for (let i = 0; i < subset.count; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const srcOffset = i * IMG_SIZE * IMG_SIZE;

    for (let y = 0; y < IMG_SIZE; y++) {
      const dstOffset = (row * IMG_SIZE + y) * spriteW + col * IMG_SIZE;
      subset.pixels.copy(spritePixels, dstOffset, srcOffset + y * IMG_SIZE, srcOffset + (y + 1) * IMG_SIZE);
    }
  }

  const outPath = join(OUT_DIR, "mnist_sprites.png");
  await sharp(spritePixels, {
    raw: { width: spriteW, height: spriteH, channels: 1 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  const { size } = await import("node:fs").then((fs) =>
    fs.promises.stat(outPath)
  );
  console.log(`  Wrote ${outPath} (${(size / 1024 / 1024).toFixed(2)} MB)`);

  // Write metadata
  const meta = {
    totalImages: subset.count,
    imageSize: IMG_SIZE,
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    format: "png_sprite",
  };
  writeFileSync(join(OUT_DIR, "metadata.json"), JSON.stringify(meta, null, 2));
}

async function main() {
  console.log("=== MNIST Data Preparation ===\n");

  console.log("Step 1: Downloading MNIST...");
  const [imgBuf, lblBuf] = await Promise.all([
    downloadAndDecompress(FILES.trainImages),
    downloadAndDecompress(FILES.trainLabels),
  ]);

  console.log("\nStep 2: Parsing IDX format...");
  const images = parseIDXImages(imgBuf);
  const labels = parseIDXLabels(lblBuf);

  console.log(`\nStep 3: Selecting balanced ${TOTAL}-image subset...`);
  const subset = selectBalancedSubset(images, labels, SAMPLES_PER_CLASS);
  console.log(`  Selected ${subset.count} images (${SAMPLES_PER_CLASS} per digit)`);

  // Verify balance
  const counts = new Array(10).fill(0);
  for (let i = 0; i < subset.count; i++) counts[subset.labels[i]]++;
  console.log(`  Distribution: ${counts.join(", ")}`);

  console.log("\nStep 4: Creating sprite sheet...");
  await createSpritePNG(subset);

  console.log("\nStep 5: Writing labels...");
  const labelsPath = join(OUT_DIR, "mnist_labels.bin");
  writeFileSync(labelsPath, subset.labels);
  console.log(`  Wrote ${labelsPath} (${subset.labels.length} bytes)`);

  console.log("\n=== Done! ===");
  console.log(`Output directory: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
