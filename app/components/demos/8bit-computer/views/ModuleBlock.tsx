import { LedStrip } from "./LedStrip";

const ACCENT = "#f97316";
const SECONDARY = "#00e5ff";
const BORDER_DEFAULT = "#2a2a2a";
const BG = "#111111";

interface Signal {
  name: string;
  active: boolean;
  direction: "in" | "out";
}

interface ModuleBlockProps {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: number;
  bits?: 4 | 8;
  signals?: Signal[];
  active: boolean;
  selected: boolean;
  onClick: () => void;
  /** Optional secondary label (e.g. decoded instruction) */
  sublabel?: string;
}

/**
 * SVG module block — rounded rect with label, LED strip, and signal indicators.
 * Glows orange when active (current T-state), cyan border when user-selected.
 */
export function ModuleBlock({
  label,
  x,
  y,
  width,
  height,
  value,
  bits = 8,
  signals,
  active,
  selected,
  onClick,
  sublabel,
}: ModuleBlockProps) {
  const borderColor = selected ? SECONDARY : active ? ACCENT : BORDER_DEFAULT;
  const glowColor = selected
    ? `drop-shadow(0 0 6px ${SECONDARY}40)`
    : active
      ? `drop-shadow(0 0 6px ${ACCENT}60)`
      : "none";

  const ledX = x + (width - (bits * 5 + (bits - 1) * 3)) / 2;
  const ledY = y + height - 18;

  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      aria-label={`${label} module`}
    >
      {/* Background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        fill={BG}
        stroke={borderColor}
        strokeWidth={selected || active ? 1.5 : 1}
        style={{
          filter: glowColor,
          transition: "stroke 0.2s, filter 0.2s, stroke-width 0.2s",
        }}
      />

      {/* Label */}
      <text
        x={x + width / 2}
        y={y + 16}
        textAnchor="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize={10}
        fontFamily="'Fira Code', monospace"
        fontWeight={500}
      >
        {label}
      </text>

      {/* Sublabel (e.g. decoded instruction) */}
      {sublabel && (
        <text
          x={x + width / 2}
          y={y + 28}
          textAnchor="middle"
          fill={SECONDARY}
          fontSize={8}
          fontFamily="'Fira Code', monospace"
        >
          {sublabel}
        </text>
      )}

      {/* LED strip */}
      {value !== undefined && (
        <LedStrip value={value} bits={bits} x={ledX} y={ledY} showHex />
      )}

      {/* Signal indicators along right edge */}
      {signals && signals.length > 0 && (
        <g>
          {signals.map((sig, i) => {
            const sy = y + 14 + i * 12;
            const sx = x + width + 4;
            return (
              <g key={sig.name}>
                {/* Arrow */}
                <text
                  x={sx}
                  y={sy}
                  fill={sig.active ? ACCENT : "rgba(255,255,255,0.15)"}
                  fontSize={7}
                  fontFamily="'Fira Code', monospace"
                  dominantBaseline="middle"
                  style={{ transition: "fill 0.15s" }}
                >
                  {sig.direction === "in" ? "\u2190" : "\u2192"}
                </text>
                {/* Name */}
                <text
                  x={sx + 10}
                  y={sy}
                  fill={sig.active ? ACCENT : "rgba(255,255,255,0.15)"}
                  fontSize={7}
                  fontFamily="'Fira Code', monospace"
                  dominantBaseline="middle"
                  style={{ transition: "fill 0.15s" }}
                >
                  {sig.name}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}
