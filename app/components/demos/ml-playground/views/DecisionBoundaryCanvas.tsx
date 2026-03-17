import { useRef, useEffect } from "react";
import { Box } from "@mui/material";

const CANVAS_SIZE = 400;
const RANGE = 1.2; // data range: [-1.2, 1.2]

// Colors for the two classes
const CLASS_COLORS = [
  [56, 189, 248], // #38bdf8 sky blue
  [249, 115, 22], // #f97316 orange
];

interface Props {
  dataPoints: { x: number; y: number; label: number }[];
  boundary: Float32Array | null; // resolution^2 values in [0, 1]
  resolution: number;
}

export function DecisionBoundaryCanvas({
  dataPoints,
  boundary,
  resolution,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw decision boundary
    if (boundary) {
      const cellW = CANVAS_SIZE / resolution;
      const cellH = CANVAS_SIZE / resolution;

      for (let yi = 0; yi < resolution; yi++) {
        for (let xi = 0; xi < resolution; xi++) {
          const prob1 = boundary[yi * resolution + xi];
          const prob0 = 1 - prob1;

          // Blend colors based on probability
          const r = CLASS_COLORS[0][0] * prob0 + CLASS_COLORS[1][0] * prob1;
          const g = CLASS_COLORS[0][1] * prob0 + CLASS_COLORS[1][1] * prob1;
          const b = CLASS_COLORS[0][2] * prob0 + CLASS_COLORS[1][2] * prob1;

          // Low alpha for background
          ctx.fillStyle = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},0.2)`;
          ctx.fillRect(xi * cellW, yi * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    }

    // Draw data points
    for (const pt of dataPoints) {
      const px = ((pt.x + RANGE) / (2 * RANGE)) * CANVAS_SIZE;
      const py = ((pt.y + RANGE) / (2 * RANGE)) * CANVAS_SIZE;
      const [r, g, b] = CLASS_COLORS[pt.label];

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes
    const center = CANVAS_SIZE / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, center);
    ctx.lineTo(CANVAS_SIZE, center);
    ctx.moveTo(center, 0);
    ctx.lineTo(center, CANVAS_SIZE);
    ctx.stroke();
  }, [dataPoints, boundary, resolution]);

  return (
    <Box>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          width: "100%",
          maxWidth: CANVAS_SIZE,
          aspectRatio: "1",
          borderRadius: 8,
          border: "1px solid #2a2a2a",
        }}
      />
    </Box>
  );
}
