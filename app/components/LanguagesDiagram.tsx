import { useState } from "react";
import {
  LANGUAGE_DOMAINS,
  DOMAIN_MAP,
  ARCH_MODULES,
  MODULE_MAP,
  ARCH_CONNECTIONS,
  TIER_LABELS,
  TIER_LINES,
} from "~/data/languages";
import { LanguagesDiagramModule } from "./LanguagesDiagramModule";

const VB_W = 860;
const VB_H = 480;

/**
 * Compute an SVG path between two module boxes.
 * Goes from the bottom-center of `from` to the top-center of `to`,
 * using a smooth cubic bezier for non-trivial vertical connections
 * or a straight line when modules are roughly aligned.
 */
function connectionPath(
  fromId: string,
  toId: string
): { d: string; midX: number; midY: number } {
  const f = MODULE_MAP[fromId];
  const t = MODULE_MAP[toId];
  const fx = f.x + f.w / 2;
  const fy = f.y + f.h;
  const tx = t.x + t.w / 2;
  const ty = t.y;

  // If target is above source (reverse flow like build-scripts → services)
  // route from top of source to bottom of target
  if (ty < fy) {
    const sfx = f.x + f.w / 2;
    const sfy = f.y;
    const stx = t.x + t.w / 2;
    const sty = t.y + t.h;
    const midY = (sfy + sty) / 2;
    return {
      d: `M${sfx},${sfy} C${sfx},${midY} ${stx},${midY} ${stx},${sty}`,
      midX: (sfx + stx) / 2,
      midY,
    };
  }

  const midY = (fy + ty) / 2;
  // Nearly aligned — straight line
  if (Math.abs(fx - tx) < 10) {
    return {
      d: `M${fx},${fy} L${tx},${ty}`,
      midX: fx,
      midY,
    };
  }
  // Offset — bezier curve
  return {
    d: `M${fx},${fy} C${fx},${midY} ${tx},${midY} ${tx},${ty}`,
    midX: (fx + tx) / 2,
    midY,
  };
}

/**
 * Small arrowhead at the end of a connection path.
 * Points downward by default (target is below source).
 */
function ArrowHead({
  fromId,
  toId,
  color,
  opacity,
}: {
  fromId: string;
  toId: string;
  color: string;
  opacity: number;
}) {
  const f = MODULE_MAP[fromId];
  const t = MODULE_MAP[toId];
  const tx = t.x + t.w / 2;
  const fy = f.y + f.h;
  const ty = t.y;

  // Reverse flow: arrow points up from bottom of target
  if (ty < fy) {
    const sty = t.y + t.h;
    return (
      <path
        d={`M${tx - 4},${sty + 5} L${tx},${sty} L${tx + 4},${sty + 5}`}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={opacity}
        style={{ transition: "stroke 0.2s, opacity 0.2s" }}
      />
    );
  }

  return (
    <path
      d={`M${tx - 4},${ty - 5} L${tx},${ty} L${tx + 4},${ty - 5}`}
      fill="none"
      stroke={color}
      strokeWidth={1}
      opacity={opacity}
      style={{ transition: "stroke 0.2s, opacity 0.2s" }}
    />
  );
}

export function LanguagesDiagram() {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  function domainColor(domainId: string): string {
    return DOMAIN_MAP[domainId]?.color ?? "#2a2a2a";
  }

  function isHighlighted(domainId: string): boolean {
    return hoveredDomain === domainId;
  }

  function isDimmed(domainId: string): boolean {
    return hoveredDomain !== null && hoveredDomain !== domainId;
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ display: "block" }}
      role="img"
      aria-label="Project architecture diagram showing language use cases"
    >
      {/* Background */}
      <rect width={VB_W} height={VB_H} fill="#0a0a0a" rx={8} />

      {/* Title */}
      <text
        x={VB_W / 2}
        y={18}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={9}
        fontFamily="'Fira Code', monospace"
      >
        Sample Project Architecture
      </text>

      {/* Tier separator lines */}
      {TIER_LINES.map((ty) => (
        <line
          key={ty}
          x1={30}
          y1={ty}
          x2={VB_W - 30}
          y2={ty}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      ))}

      {/* Tier labels */}
      {TIER_LABELS.map(({ label, y }) => (
        <text
          key={label}
          x={10}
          y={y}
          textAnchor="middle"
          transform={`rotate(-90, 10, ${y})`}
          fill="rgba(255,255,255,0.1)"
          fontSize={8}
          fontFamily="'Fira Code', monospace"
        >
          {label}
        </text>
      ))}

      {/* Connection lines */}
      {ARCH_CONNECTIONS.map((conn) => {
        const fromMod = MODULE_MAP[conn.from];
        const toMod = MODULE_MAP[conn.to];
        const fromDomain = fromMod.domainId;
        const toDomain = toMod.domainId;
        const color = domainColor(fromDomain);

        const connInvolved =
          hoveredDomain === fromDomain || hoveredDomain === toDomain;
        const connDimmed = hoveredDomain !== null && !connInvolved;

        const strokeOpacity = connDimmed ? 0.06 : connInvolved ? 0.7 : 0.2;
        const strokeWidth = connInvolved ? 1.5 : 1;

        const { d, midX, midY } = connectionPath(conn.from, conn.to);

        return (
          <g key={`${conn.from}-${conn.to}`}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={strokeOpacity}
              style={{
                transition:
                  "stroke 0.2s, stroke-width 0.2s, opacity 0.2s",
              }}
            />
            <ArrowHead
              fromId={conn.from}
              toId={conn.to}
              color={color}
              opacity={strokeOpacity}
            />
            {/* Connection label */}
            {conn.label && (
              <text
                x={midX}
                y={midY - 4}
                textAnchor="middle"
                fill={color}
                fontSize={7}
                fontFamily="'Fira Code', monospace"
                opacity={connDimmed ? 0.06 : connInvolved ? 0.8 : 0.3}
                style={{ transition: "opacity 0.2s", pointerEvents: "none" }}
              >
                {conn.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Module blocks */}
      {ARCH_MODULES.map((mod) => (
        <LanguagesDiagramModule
          key={mod.id}
          label={mod.label}
          sublabel={mod.sublabel}
          x={mod.x}
          y={mod.y}
          w={mod.w}
          h={mod.h}
          color={domainColor(mod.domainId)}
          highlighted={isHighlighted(mod.domainId)}
          dimmed={isDimmed(mod.domainId)}
          onMouseEnter={() => setHoveredDomain(mod.domainId)}
          onMouseLeave={() => setHoveredDomain(null)}
        />
      ))}

      {/* Legend */}
      {(() => {
        const count = LANGUAGE_DOMAINS.length;
        const totalW = VB_W - 80;
        const spacing = totalW / count;
        const startX = 40 + spacing / 2;

        return LANGUAGE_DOMAINS.map((domain, i) => {
          const cx = startX + i * spacing;
          const highlighted = hoveredDomain === domain.id;
          const dimmed =
            hoveredDomain !== null && hoveredDomain !== domain.id;

          return (
            <g
              key={domain.id}
              onMouseEnter={() => setHoveredDomain(domain.id)}
              onMouseLeave={() => setHoveredDomain(null)}
              style={{
                cursor: "pointer",
                opacity: dimmed ? 0.25 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <circle
                cx={cx - 30}
                cy={VB_H - 18}
                r={4}
                fill={domain.color}
                opacity={highlighted ? 1 : 0.7}
                style={{ transition: "opacity 0.2s" }}
              />
              <text
                x={cx - 22}
                y={VB_H - 22}
                fill={
                  highlighted
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.4)"
                }
                fontSize={7}
                fontFamily="'Fira Code', monospace"
                style={{ transition: "fill 0.2s" }}
              >
                {domain.label}
              </text>
              <text
                x={cx - 22}
                y={VB_H - 12}
                fill={
                  highlighted
                    ? `${domain.color}cc`
                    : "rgba(255,255,255,0.2)"
                }
                fontSize={6}
                fontFamily="'Fira Code', monospace"
                style={{ transition: "fill 0.2s" }}
              >
                {domain.useCase}
              </text>
            </g>
          );
        });
      })()}
    </svg>
  );
}
