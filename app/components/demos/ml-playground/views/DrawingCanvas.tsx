import { useRef, useEffect, useCallback } from "react";
import { Box, Button } from "@mui/material";

const CANVAS_SIZE = 280; // 10x zoom of 28x28
const IMG_SIZE = 28;
const LINE_WIDTH = 18; // thick strokes for digit drawing

interface Props {
  disabled: boolean;
  onDrawingComplete: (imageData: Float32Array) => void;
  onClear: () => void;
}

export function DrawingCanvas({ disabled, onDrawingComplete, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas with black background
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    onClear();
  }, [onClear]);

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scale,
        y: (touch.clientY - rect.top) * scale,
      };
    }
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || disabled) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;

    // Downscale to 28x28 and extract
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const small = document.createElement("canvas");
    small.width = IMG_SIZE;
    small.height = IMG_SIZE;
    const sCtx = small.getContext("2d")!;

    // Use high-quality downscaling
    sCtx.drawImage(canvas, 0, 0, IMG_SIZE, IMG_SIZE);
    const imgData = sCtx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);

    // Convert to float32 grayscale normalized to [0, 1]
    const float32 = new Float32Array(IMG_SIZE * IMG_SIZE);
    for (let i = 0; i < IMG_SIZE * IMG_SIZE; i++) {
      float32[i] = imgData.data[i * 4] / 255; // red channel
    }

    onDrawingComplete(float32);
  };

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
          border: `1px solid ${disabled ? "#1a1a1a" : "#2a2a2a"}`,
          cursor: disabled ? "not-allowed" : "crosshair",
          touchAction: "none",
          opacity: disabled ? 0.4 : 1,
          transition: "opacity 0.3s, border-color 0.3s",
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <Button
        size="small"
        variant="outlined"
        disabled={disabled}
        onClick={clearCanvas}
        sx={{
          mt: 1,
          width: "100%",
          maxWidth: CANVAS_SIZE,
          fontSize: 11,
          textTransform: "none",
          color: "text.secondary",
          borderColor: "divider",
        }}
      >
        Clear
      </Button>
    </Box>
  );
}
