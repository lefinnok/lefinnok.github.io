import type { DatasetPattern } from "./types";

export interface Dataset2D {
  points: [number, number][];
  labels: number[];
}

export function generateDataset(
  pattern: DatasetPattern,
  n: number = 200
): Dataset2D {
  switch (pattern) {
    case "spiral":
      return generateSpiral(n);
    case "circles":
      return generateCircles(n);
    case "xor":
      return generateXor(n);
    case "moons":
      return generateMoons(n);
  }
}

function generateSpiral(n: number): Dataset2D {
  const points: [number, number][] = [];
  const labels: number[] = [];
  const half = Math.floor(n / 2);

  for (let i = 0; i < half; i++) {
    const r = (i / half) * 0.8;
    const t = (i / half) * 3 * Math.PI + Math.random() * 0.3;
    points.push([r * Math.cos(t), r * Math.sin(t)]);
    labels.push(0);

    points.push([r * Math.cos(t + Math.PI), r * Math.sin(t + Math.PI)]);
    labels.push(1);
  }

  return { points, labels };
}

function generateCircles(n: number): Dataset2D {
  const points: [number, number][] = [];
  const labels: number[] = [];

  for (let i = 0; i < n; i++) {
    const isInner = i < n / 2;
    const r = isInner ? Math.random() * 0.35 : 0.5 + Math.random() * 0.35;
    const angle = Math.random() * 2 * Math.PI;
    points.push([r * Math.cos(angle), r * Math.sin(angle)]);
    labels.push(isInner ? 0 : 1);
  }

  return { points, labels };
}

function generateXor(n: number): Dataset2D {
  const points: [number, number][] = [];
  const labels: number[] = [];

  for (let i = 0; i < n; i++) {
    const x = Math.random() * 1.6 - 0.8;
    const y = Math.random() * 1.6 - 0.8;
    const noise = (Math.random() - 0.5) * 0.1;
    points.push([x + noise, y + noise]);
    labels.push(x * y > 0 ? 0 : 1);
  }

  return { points, labels };
}

function generateMoons(n: number): Dataset2D {
  const points: [number, number][] = [];
  const labels: number[] = [];
  const half = Math.floor(n / 2);

  for (let i = 0; i < half; i++) {
    const angle = (i / half) * Math.PI;
    const noise = () => (Math.random() - 0.5) * 0.15;

    // Upper moon
    points.push([Math.cos(angle) + noise(), Math.sin(angle) + noise()]);
    labels.push(0);

    // Lower moon (shifted)
    points.push([
      1 - Math.cos(angle) + noise(),
      0.5 - Math.sin(angle) + noise(),
    ]);
    labels.push(1);
  }

  // Center the data
  const cx =
    points.reduce((s, p) => s + p[0], 0) / points.length;
  const cy =
    points.reduce((s, p) => s + p[1], 0) / points.length;
  for (const p of points) {
    p[0] -= cx;
    p[1] -= cy;
  }

  return { points, labels };
}
