import { Box } from "@mui/material";
import { useMemo } from "react";

interface NavSquareGridProps {
  active: boolean;
  width: number;
  height: number;
  squareSize?: number;
  baseDelay?: number;
  maxRandomDelay?: number;
}

interface SquareData {
  top: number;
  left: number;
  size: number;
  delay: number;
}

export function NavSquareGrid({
  active,
  width,
  height,
  squareSize = 5,
  baseDelay = 3,
  maxRandomDelay = 10,
}: NavSquareGridProps) {
  const squares = useMemo(() => {
    if (width === 0 || height === 0) return [];

    const cols = Math.floor(width / squareSize) + 2;
    const rows = Math.floor(height / squareSize) + 2;
    const result: SquareData[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        result.push({
          top: row * squareSize,
          left: col * squareSize,
          size: squareSize,
          delay: Math.random() * maxRandomDelay + col * baseDelay,
        });
      }
    }

    return result;
  }, [width, height, squareSize, baseDelay, maxRandomDelay]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "difference",
      }}
    >
      {squares.map((sq, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: sq.top,
            left: sq.left,
            width: sq.size,
            height: sq.size,
            bgcolor: "#ffffff",
            transform: active ? "scale(1)" : "scale(0)",
            transition: "transform 0.15s ease-out",
            transitionDelay: active ? `${sq.delay}ms` : "0ms",
          }}
        />
      ))}
    </Box>
  );
}
