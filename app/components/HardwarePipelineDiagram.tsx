import { useState } from "react";
import {
  HARDWARE_STAGES,
  STAGE_MAP,
  PIPELINE_CONNECTIONS,
} from "~/data/hardware";
import { HardwarePipelineStage } from "./HardwarePipelineStage";

const VB_W = 1000;
const VB_H = 560;

export function HardwarePipelineDiagram() {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ display: "block" }}
      role="img"
      aria-label="Hardware product development lifecycle pipeline"
    >
      {/* Background */}
      <rect width={VB_W} height={VB_H} fill="#0a0a0a" rx={8} />

      {/* Title */}
      <text
        x={VB_W / 2}
        y={560}
        textAnchor="middle"
        fill="rgba(255,255,255,0.15)"
        fontSize={9}
        fontFamily="'Fira Code', monospace"
      >
        Product Development Lifecycle
      </text>

      {/* Connection arrows between stages (bezier curves) */}
      {PIPELINE_CONNECTIONS.map((conn) => {
        const from = STAGE_MAP[conn.from];
        const to = STAGE_MAP[conn.to];

        // Start at right edge center of source, end at left edge center of target
        const x1 = from.x + from.w;
        const y1 = from.y + from.h / 2;
        const x2 = to.x;
        const y2 = to.y + to.h / 2;

        // Control points — horizontal tangent at both ends for smooth S-curves
        const dx = x2 - x1;
        const cpOff = Math.max(dx * 0.4, 25);
        const cp1x = x1 + cpOff;
        const cp2x = x2 - cpOff;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const involved =
          hoveredStage === conn.from || hoveredStage === conn.to;
        const dimmed = hoveredStage !== null && !involved;

        const color = from.color;
        const strokeOpacity = dimmed ? 0.06 : involved ? 0.7 : 0.25;
        const strokeWidth = involved ? 1.5 : 1;

        return (
          <g key={`${conn.from}-${conn.to}`}>
            {/* Bezier curve */}
            <path
              d={`M${x1},${y1} C${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={strokeOpacity}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s, opacity 0.2s" }}
            />
            {/* Arrowhead (always horizontal since tangent at end is horizontal) */}
            <path
              d={`M${x2 - 5},${y2 - 4} L${x2},${y2} L${x2 - 5},${y2 + 4}`}
              fill="none"
              stroke={color}
              strokeWidth={1}
              opacity={strokeOpacity}
              style={{ transition: "stroke 0.2s, opacity 0.2s" }}
            />
            {/* Label at midpoint of curve */}
            {conn.label && (
              <text
                x={midX}
                y={midY - 5}
                textAnchor="middle"
                fill={color}
                fontSize={6}
                fontFamily="'Fira Code', monospace"
                opacity={dimmed ? 0.06 : involved ? 0.8 : 0.3}
                style={{ transition: "opacity 0.2s", pointerEvents: "none" }}
              >
                {conn.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Stage blocks */}
      {HARDWARE_STAGES.map((stage) => (
        <HardwarePipelineStage
          key={stage.id}
          stage={stage}
          highlighted={hoveredStage === stage.id}
          dimmed={hoveredStage !== null && hoveredStage !== stage.id}
          onMouseEnter={() => setHoveredStage(stage.id)}
          onMouseLeave={() => setHoveredStage(null)}
        />
      ))}
    </svg>
  );
}
