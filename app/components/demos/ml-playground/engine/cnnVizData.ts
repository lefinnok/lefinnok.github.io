/**
 * Constants for the individual-node CNN 3D visualization.
 * Layout: left (input) → right (output) along X-axis, no rotation.
 */

// ── Input grid (28×28 spheres) ──────────────────────────────────

export const INPUT_GRID = 28;
export const INPUT_SPACING = 0.12;
export const INPUT_RADIUS = 0.04;
export const INPUT_X = -5;
export const INPUT_DIM_COLOR = [0.15, 0.15, 0.15] as const;
export const INPUT_COLOR = 0x888888;

// ── Inner layer definitions ─────────────────────────────────────

export interface InnerLayerDef {
  id: string;
  label: string;
  nodeCount: number;
  grid: [number, number]; // [cols, rows]
  xPos: number;
  color: number;
  radius: number;
  spacing: number;
  /** Index into weightDeltas/activations array (aligned with model.layers) */
  deltaIndex: number;
}

export const INNER_LAYERS: InnerLayerDef[] = [
  { id: "conv1", label: "Conv", nodeCount: 8, grid: [2, 4], xPos: -2.2, color: 0xffd700, radius: 0.06, spacing: 0.20, deltaIndex: 1 },
  { id: "pool1", label: "Pool", nodeCount: 8, grid: [2, 4], xPos: -0.8, color: 0x00ced1, radius: 0.06, spacing: 0.20, deltaIndex: 2 },
  { id: "conv2", label: "Conv", nodeCount: 16, grid: [4, 4], xPos: 0.6, color: 0xffd700, radius: 0.05, spacing: 0.16, deltaIndex: 3 },
  { id: "pool2", label: "Pool", nodeCount: 16, grid: [4, 4], xPos: 2.0, color: 0x00ced1, radius: 0.05, spacing: 0.16, deltaIndex: 4 },
  { id: "dense", label: "Dense", nodeCount: 128, grid: [8, 16], xPos: 4.0, color: 0x4ade80, radius: 0.035, spacing: 0.10, deltaIndex: 6 },
];

// ── Output spheres (10 digits) ──────────────────────────────────

export const OUTPUT_COUNT = 10;
export const OUTPUT_SPACING = 0.30;
export const OUTPUT_RADIUS = 0.12;
export const OUTPUT_X = 6.0;
export const OUTPUT_COLOR = 0xf97316;
export const OUTPUT_DELTA_INDEX = 7;
