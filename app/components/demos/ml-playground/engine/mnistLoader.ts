import * as tf from "@tensorflow/tfjs";

const SPRITE_PATH = "/data/mnist/mnist_sprites.png";
const LABELS_PATH = "/data/mnist/mnist_labels.bin";

const IMG_SIZE = 28;
const GRID_COLS = 100;
const TOTAL_IMAGES = 10_000;
const TRAIN_COUNT = 8_000;

export interface MnistData {
  trainImages: tf.Tensor4D;
  trainLabels: tf.Tensor2D;
  testImages: tf.Tensor4D;
  testLabels: tf.Tensor2D;
}

/**
 * Load MNIST subset from the bundled sprite sheet and labels file.
 * Sprite: 2800x2800 PNG (100x100 grid of 28x28 images).
 * Labels: 10,000 bytes, one per image (row-major matching sprite grid).
 *
 * @param onProgress — called with 0-100 as the sprite PNG downloads
 */
export async function loadMnistData(
  onProgress?: (percent: number) => void
): Promise<MnistData> {
  const [spriteImg, labelsBuf] = await Promise.all([
    loadSpriteImageWithProgress(onProgress),
    fetch(LABELS_PATH).then((r) => r.arrayBuffer()),
  ]);

  const labels = new Uint8Array(labelsBuf);

  // Draw sprite to canvas, read pixel data
  const canvas = document.createElement("canvas");
  canvas.width = spriteImg.width;
  canvas.height = spriteImg.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(spriteImg, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Extract individual images as normalized float32
  const allImages = new Float32Array(TOTAL_IMAGES * IMG_SIZE * IMG_SIZE);

  for (let i = 0; i < TOTAL_IMAGES; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const imgOffset = i * IMG_SIZE * IMG_SIZE;

    for (let y = 0; y < IMG_SIZE; y++) {
      for (let x = 0; x < IMG_SIZE; x++) {
        const srcIdx =
          ((row * IMG_SIZE + y) * canvas.width + (col * IMG_SIZE + x)) * 4;
        // Use red channel (grayscale), normalize to [0, 1]
        allImages[imgOffset + y * IMG_SIZE + x] =
          imageData.data[srcIdx] / 255;
      }
    }
  }

  // Split into train and test
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
    10
  ) as tf.Tensor2D;
  const testLabels = tf.oneHot(
    tf.tensor1d(
      Array.from(labels.slice(TRAIN_COUNT)),
      "int32"
    ),
    10
  ) as tf.Tensor2D;

  return { trainImages, trainLabels, testImages, testLabels };
}

/**
 * Fetch the sprite PNG with download progress tracking,
 * then create an HTMLImageElement from the blob.
 */
async function loadSpriteImageWithProgress(
  onProgress?: (percent: number) => void
): Promise<HTMLImageElement> {
  const response = await fetch(SPRITE_PATH);

  const contentLength = response.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body || !total) {
    // Fallback: no streaming / unknown size — load normally
    onProgress?.(50); // indeterminate halfway
    const blob = await response.blob();
    onProgress?.(90);
    return blobToImage(blob);
  }

  // Stream the response and track bytes received
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(Math.round((received / total) * 90)); // 0-90% for download
  }

  const blob = new Blob(chunks as BlobPart[], { type: "image/png" });
  onProgress?.(95); // decoding
  const img = await blobToImage(blob);
  onProgress?.(100);
  return img;
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode MNIST sprite image"));
    };
    img.src = url;
  });
}

/**
 * Dispose all tensors in a MnistData object.
 */
export function disposeMnistData(data: MnistData) {
  data.trainImages.dispose();
  data.trainLabels.dispose();
  data.testImages.dispose();
  data.testLabels.dispose();
}
