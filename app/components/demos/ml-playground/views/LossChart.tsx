import { Box } from "@mui/material";

const FONT = "'Fira Code', monospace";

interface LossChartProps {
  data: number[];
  label: string;
  color: string;
  width?: number;
  height?: number;
  formatValue?: (v: number) => string;
}

export function LossChart({
  data,
  label,
  color,
  width = 240,
  height = 100,
  formatValue = (v) => v.toFixed(3),
}: LossChartProps) {
  const pad = { top: 14, right: 8, bottom: 16, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  if (data.length === 0) {
    return (
      <Box sx={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={width} height={height}>
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="rgba(255,255,255,0.2)"
            fontSize={9}
            fontFamily={FONT}
          >
            {label}
          </text>
        </svg>
      </Box>
    );
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data
    .map((v, i) => {
      const x = pad.left + (i / Math.max(data.length - 1, 1)) * plotW;
      const y = pad.top + plotH - ((v - minVal) / range) * plotH;
      return `${x},${y}`;
    })
    .join(" ");

  const lastVal = data[data.length - 1];

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* Background */}
      <rect width={width} height={height} fill="#0d0d0d" rx={4} />

      {/* Label */}
      <text
        x={pad.left}
        y={11}
        fill="rgba(255,255,255,0.4)"
        fontSize={8}
        fontFamily={FONT}
      >
        {label}
      </text>

      {/* Current value */}
      <text
        x={width - pad.right}
        y={11}
        textAnchor="end"
        fill={color}
        fontSize={8}
        fontFamily={FONT}
      >
        {formatValue(lastVal)}
      </text>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = pad.top + plotH * (1 - frac);
        return (
          <line
            key={frac}
            x1={pad.left}
            y1={y}
            x2={width - pad.right}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* X axis label */}
      <text
        x={pad.left + plotW / 2}
        y={height - 3}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        fontFamily={FONT}
      >
        epoch
      </text>

      {/* Y axis labels */}
      <text
        x={pad.left - 3}
        y={pad.top + 3}
        textAnchor="end"
        fill="rgba(255,255,255,0.2)"
        fontSize={6}
        fontFamily={FONT}
      >
        {formatValue(maxVal)}
      </text>
      <text
        x={pad.left - 3}
        y={pad.top + plotH + 3}
        textAnchor="end"
        fill="rgba(255,255,255,0.2)"
        fontSize={6}
        fontFamily={FONT}
      >
        {formatValue(minVal)}
      </text>
    </svg>
  );
}
