import { useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const FONT = "'Fira Code', monospace";
const MAP_DISPLAY_SIZE = 32; // CSS size for each filter map

interface ActivationLayer {
  filterMaps: Float32Array[];
  width: number;
  height: number;
}

interface Props {
  layers: ActivationLayer[] | null;
}

export function ActivationMaps({ layers }: Props) {
  if (!layers || layers.length === 0) {
    return (
      <Box sx={{ opacity: 0.3 }}>
        <Typography
          variant="body2"
          sx={{ fontFamily: FONT, fontSize: "0.7rem", color: "text.secondary" }}
        >
          Activations will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {layers.map((layer, li) => (
        <Box key={li} sx={{ mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: FONT,
              fontSize: "0.65rem",
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            Conv Layer {li + 1} ({layer.filterMaps.length} filters)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {layer.filterMaps.map((map, fi) => (
              <FilterMapCanvas
                key={fi}
                data={map}
                width={layer.width}
                height={layer.height}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function FilterMapCanvas({
  data,
  width,
  height,
}: {
  data: Float32Array;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Find min/max for normalization
    let min = Infinity;
    let max = -Infinity;
    for (const v of data) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min || 1;

    const imgData = ctx.createImageData(width, height);
    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] - min) / range;
      // Heat colormap: black → orange → white
      const r = Math.min(255, Math.floor(normalized * 510));
      const g = Math.min(255, Math.floor(Math.max(0, normalized - 0.5) * 510));
      const b = Math.min(255, Math.floor(Math.max(0, normalized - 0.75) * 1020));
      imgData.data[i * 4] = r;
      imgData.data[i * 4 + 1] = g;
      imgData.data[i * 4 + 2] = b;
      imgData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: MAP_DISPLAY_SIZE,
        height: MAP_DISPLAY_SIZE,
        borderRadius: 2,
        border: "1px solid #2a2a2a",
        imageRendering: "pixelated",
      }}
    />
  );
}
