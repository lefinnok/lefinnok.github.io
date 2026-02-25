/**
 * Jacobi eigenvalue algorithm for real symmetric matrices.
 * Used to compute the Laplacian spectrum of hand graphs.
 */
export function symmetricEigenvalues(matrix: number[][]): number[] {
  const n = matrix.length;
  const A: number[][] = matrix.map((row) => [...row]);

  const maxIterations = 100 * n * n;
  const tolerance = 1e-10;

  for (let iter = 0; iter < maxIterations; iter++) {
    let maxVal = 0;
    let p = 0;
    let q = 1;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i][j]) > maxVal) {
          maxVal = Math.abs(A[i][j]);
          p = i;
          q = j;
        }
      }
    }

    if (maxVal < tolerance) break;

    const diff = A[q][q] - A[p][p];
    let t: number;
    if (Math.abs(A[p][q]) < tolerance * Math.abs(diff)) {
      t = A[p][q] / diff;
    } else {
      const phi = diff / (2 * A[p][q]);
      t = 1 / (Math.abs(phi) + Math.sqrt(phi * phi + 1));
      if (phi < 0) t = -t;
    }

    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;
    const tau = s / (1 + c);

    const apq = A[p][q];
    A[p][q] = 0;
    A[q][p] = 0;
    A[p][p] -= t * apq;
    A[q][q] += t * apq;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const aip = A[i][p];
        const aiq = A[i][q];
        A[i][p] = A[p][i] = aip - s * (aiq + tau * aip);
        A[i][q] = A[q][i] = aiq + s * (aip - tau * aiq);
      }
    }
  }

  const eigenvalues = Array.from({ length: n }, (_, i) => A[i][i]);
  eigenvalues.sort((a, b) => a - b);
  return eigenvalues;
}
