import { symmetricEigenvalues } from "./eigenvalues";

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface ReferenceGesture {
  id: number;
  label: string;
  spectrum: number[];
  thumbnail: string | null;
}

export interface MatchResult {
  referenceId: number;
  label: string;
  similarity: number;
}

/**
 * Graph structure from the Python implementation (final struct_dict).
 * Connects wrist (0) and fingertips (4, 8, 12, 16, 20).
 * Thumb tip connects to all other tips; consecutive tips connect to each other.
 */
const GRAPH_STRUCTURE: Record<number, number[]> = {
  4: [0, 8, 12, 16, 20],
  8: [0, 12],
  12: [0, 16],
  16: [0, 20],
  20: [0],
};

/** All undirected edges used by the analysis graph (for visualization). */
export const ANALYSIS_EDGES: [number, number][] = [
  [0, 4],
  [0, 8],
  [0, 12],
  [0, 16],
  [0, 20],
  [4, 8],
  [4, 12],
  [4, 16],
  [4, 20],
  [8, 12],
  [12, 16],
  [16, 20],
];

/** Standard MediaPipe hand skeleton connections (for visualization). */
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
];

export const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

const NUM_NODES = 21;
const SCALE = 100;

function euclidean(a: Landmark, b: Landmark, scale: number): number {
  const dx = (a.x - b.x) * scale;
  const dy = (a.y - b.y) * scale;
  const dz = (a.z - b.z) * scale;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Convert hand landmarks to a Laplacian spectrum.
 * Port of the Python hand2Graph → laplacian_spectrum pipeline.
 *
 * 1. Normalize coordinates by the wrist-to-index-base distance
 * 2. Build a weighted adjacency matrix from the graph structure
 * 3. Compute the graph Laplacian (L = D - A)
 * 4. Return sorted eigenvalues
 */
export function landmarksToSpectrum(landmarks: Landmark[]): number[] {
  const wrist = landmarks[0];
  const indexBase = landmarks[5];
  const sizeFactor = euclidean(wrist, indexBase, 1);

  if (sizeFactor < 1e-6) return new Array(NUM_NODES).fill(0);

  const normScale = SCALE / sizeFactor;

  // Build weighted adjacency matrix
  const adj: number[][] = Array.from({ length: NUM_NODES }, () =>
    new Array(NUM_NODES).fill(0),
  );

  for (const originStr of Object.keys(GRAPH_STRUCTURE)) {
    const origin = parseInt(originStr);
    for (const target of GRAPH_STRUCTURE[origin]) {
      const weight = euclidean(landmarks[origin], landmarks[target], normScale);
      adj[origin][target] = weight;
      adj[target][origin] = weight;
    }
  }

  // Laplacian: L_ii = degree, L_ij = -weight
  const laplacian: number[][] = Array.from({ length: NUM_NODES }, (_, i) => {
    const row = adj[i].map((v) => -v);
    row[i] = adj[i].reduce((sum, v) => sum + v, 0);
    return row;
  });

  return symmetricEigenvalues(laplacian);
}

/**
 * Compare two Laplacian spectra using sum of squared differences.
 * Lower value = more similar. Direct port of graphSim from hands.py.
 */
export function spectralSimilarity(
  spectrum1: number[],
  spectrum2: number[],
): number {
  const minimumEnergy = 1 - 1e-15;

  function selectK(spectrum: number[]): number {
    const total = spectrum.reduce((sum, v) => sum + v, 0);
    if (total === 0) return spectrum.length;
    let running = 0;
    for (let i = 0; i < spectrum.length; i++) {
      running += spectrum[i];
      if (running / total >= minimumEnergy) return i + 1;
    }
    return spectrum.length;
  }

  const k = Math.max(selectK(spectrum1), selectK(spectrum2));

  let similarity = 0;
  for (let i = 0; i < k; i++) {
    const diff = (spectrum1[i] ?? 0) - (spectrum2[i] ?? 0);
    similarity += diff * diff;
  }

  return similarity;
}

/**
 * Find the best matching reference gesture for a given spectrum.
 * Returns null if no references exist.
 */
export function findBestMatch(
  spectrum: number[],
  references: ReferenceGesture[],
): MatchResult | null {
  if (references.length === 0) return null;

  let best: MatchResult = {
    referenceId: references[0].id,
    label: references[0].label,
    similarity: Infinity,
  };

  for (const ref of references) {
    const sim = spectralSimilarity(spectrum, ref.spectrum);
    if (sim < best.similarity) {
      best = { referenceId: ref.id, label: ref.label, similarity: sim };
    }
  }

  return best;
}
