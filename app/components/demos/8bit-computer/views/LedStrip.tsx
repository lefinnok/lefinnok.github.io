const ACCENT = "#f97316";
const OFF = "#1a1a1a";

interface LedStripProps {
  value: number;
  bits?: 4 | 8;
  x: number;
  y: number;
  size?: number;
  gap?: number;
  /** Show hex value label to the right */
  showHex?: boolean;
}

/**
 * SVG LED strip — renders `bits` circles in a row.
 * Orange with glow for 1-bits, dim for 0-bits.
 */
export function LedStrip({
  value,
  bits = 8,
  x,
  y,
  size = 5,
  gap = 3,
  showHex = false,
}: LedStripProps) {
  const totalWidth = bits * size + (bits - 1) * gap;

  return (
    <g>
      {Array.from({ length: bits }, (_, i) => {
        const bitVal = (value >> (bits - 1 - i)) & 1;
        const cx = x + i * (size + gap) + size / 2;
        const cy = y + size / 2;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={size / 2}
            fill={bitVal ? ACCENT : OFF}
            style={{
              filter: bitVal ? `drop-shadow(0 0 3px ${ACCENT})` : "none",
              transition: "fill 0.15s, filter 0.15s",
            }}
          />
        );
      })}
      {showHex && (
        <text
          x={x + totalWidth + 6}
          y={y + size / 2 + 1}
          fill="rgba(255,255,255,0.4)"
          fontSize={9}
          fontFamily="'Fira Code', monospace"
          dominantBaseline="middle"
        >
          {value.toString(16).toUpperCase().padStart(bits === 4 ? 1 : 2, "0")}
        </text>
      )}
    </g>
  );
}

/** Utility: get the width in px of a LedStrip */
export function ledStripWidth(bits: number, size = 5, gap = 3): number {
  return bits * size + (bits - 1) * gap;
}
