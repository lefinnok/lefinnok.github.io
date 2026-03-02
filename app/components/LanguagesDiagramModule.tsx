const BG = "#111111";
const BORDER_DEFAULT = "#2a2a2a";

interface LanguageModuleProps {
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  highlighted: boolean;
  dimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function LanguagesDiagramModule({
  label,
  sublabel,
  x,
  y,
  w,
  h,
  color,
  highlighted,
  dimmed,
  onMouseEnter,
  onMouseLeave,
}: LanguageModuleProps) {
  const borderColor = highlighted ? color : BORDER_DEFAULT;
  const glowFilter = highlighted
    ? `drop-shadow(0 0 8px ${color}60)`
    : "none";

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        cursor: "pointer",
        opacity: dimmed ? 0.25 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        ry={6}
        fill={BG}
        stroke={borderColor}
        strokeWidth={highlighted ? 1.5 : 1}
        style={{
          filter: glowFilter,
          transition: "stroke 0.2s, filter 0.2s, stroke-width 0.2s",
        }}
      />

      {/* Label */}
      <text
        x={x + w / 2}
        y={sublabel ? y + 22 : y + h / 2 + 4}
        textAnchor="middle"
        fill={highlighted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)"}
        fontSize={10}
        fontFamily="'Fira Code', monospace"
        fontWeight={500}
        style={{ transition: "fill 0.2s", pointerEvents: "none" }}
      >
        {label}
      </text>

      {/* Sublabel (language) */}
      {sublabel && (
        <text
          x={x + w / 2}
          y={y + 38}
          textAnchor="middle"
          fill={highlighted ? `${color}cc` : "rgba(255,255,255,0.35)"}
          fontSize={8}
          fontFamily="'Fira Code', monospace"
          style={{ transition: "fill 0.2s", pointerEvents: "none" }}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}
