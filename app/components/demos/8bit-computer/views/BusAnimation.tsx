/**
 * BusAnimation — renders animated data packets traveling along bus connections.
 *
 * Uses CSS keyframe animations on SVG circles. The global CSS rule in app.css
 * handles `prefers-reduced-motion` by setting animation-duration to 0.01ms.
 * We also use the useReducedMotion hook to skip rendering entirely.
 *
 * The `stepKey` prop (unique per T-state step) is used as a React key on
 * the wrapper <g>, causing React to remount the element tree and retrigger
 * all animations on each step.
 */

import { useReducedMotion } from "~/hooks/useReducedMotion";
import { CS } from "../engine/types";

// ── Layout constants (must match ArchitectureSvg) ───────────────

const BUS_X = 250;
const LEFT_EDGE = 150; // left modules: x=30, w=120 → right edge = 150
const RIGHT_EDGE = 390; // right modules start at x=390

// ── Bus endpoint definitions ────────────────────────────────────

interface BusEndpoint {
  side: "left" | "right";
  tapY: number;
}

/** Signals that drive data onto the bus (one active at a time). */
const OUTPUT_SIGNALS: { signal: number; endpoint: BusEndpoint }[] = [
  { signal: CS.CO, endpoint: { side: "left", tapY: 66 } }, // PC
  { signal: CS.AO, endpoint: { side: "right", tapY: 66 } }, // Reg A
  { signal: CS.EO, endpoint: { side: "right", tapY: 148 } }, // ALU
  { signal: CS.RO, endpoint: { side: "left", tapY: 206 } }, // RAM
  { signal: CS.IO, endpoint: { side: "left", tapY: 286 } }, // IR operand
];

/** Signals that load data from the bus. */
const INPUT_SIGNALS: { signal: number; endpoint: BusEndpoint }[] = [
  { signal: CS.MI, endpoint: { side: "left", tapY: 136 } }, // MAR
  { signal: CS.II, endpoint: { side: "left", tapY: 286 } }, // IR
  { signal: CS.AI, endpoint: { side: "right", tapY: 66 } }, // Reg A
  { signal: CS.BI, endpoint: { side: "right", tapY: 230 } }, // Reg B
  { signal: CS.RI, endpoint: { side: "left", tapY: 206 } }, // RAM
  { signal: CS.OI, endpoint: { side: "right", tapY: 406 } }, // Output
  { signal: CS.J, endpoint: { side: "left", tapY: 66 } }, // PC (jump)
];

function edgeX(side: "left" | "right"): number {
  return side === "left" ? LEFT_EDGE : RIGHT_EDGE;
}

// ── Animation config ────────────────────────────────────────────

const ANIM_DURATION = 0.4; // seconds
const DOT_COUNT = 3;
const DOT_STAGGER = 0.04; // seconds between trailing dots
const ACCENT = "#f97316";

// ── Component ───────────────────────────────────────────────────

interface BusAnimationProps {
  controlWord: number;
  stepKey: string; // unique per step — used as React key
}

export function BusAnimation({ controlWord, stepKey }: BusAnimationProps) {
  const reduced = useReducedMotion();

  if (reduced || controlWord === 0) return null;

  // Find active source (which module is outputting to bus)
  const source = OUTPUT_SIGNALS.find((o) => controlWord & o.signal);
  if (!source) return null;

  // Find active destinations (which modules are loading from bus)
  const dests = INPUT_SIGNALS.filter((i) => controlWord & i.signal);
  if (dests.length === 0) return null;

  const srcX = edgeX(source.endpoint.side);
  const srcY = source.endpoint.tapY;

  // Sanitize stepKey for use in CSS animation name
  const safeKey = stepKey.replace(/[^a-z0-9]/gi, "");

  // Build keyframes for each destination
  const keyframeRules: string[] = [];
  const packets: { animName: string; delay: number; dotIdx: number }[] = [];

  dests.forEach((dest, destIdx) => {
    const dstX = edgeX(dest.endpoint.side);
    const dstY = dest.endpoint.tapY;

    // Compute path segment lengths for constant-speed motion
    const d1 = Math.abs(srcX - BUS_X);
    const d2 = Math.abs(srcY - dstY);
    const d3 = Math.abs(BUS_X - dstX);
    const total = d1 + d2 + d3 || 1;
    const pct1 = ((d1 / total) * 100).toFixed(1);
    const pct2 = (((d1 + d2) / total) * 100).toFixed(1);

    const animName = `bp${safeKey}d${destIdx}`;

    keyframeRules.push(`@keyframes ${animName} {
  0% { transform: translate(${srcX}px, ${srcY}px); opacity: 0; }
  3% { transform: translate(${srcX}px, ${srcY}px); opacity: 0.9; }
  ${pct1}% { transform: translate(${BUS_X}px, ${srcY}px); }
  ${pct2}% { transform: translate(${BUS_X}px, ${dstY}px); }
  97% { transform: translate(${dstX}px, ${dstY}px); opacity: 0.9; }
  100% { transform: translate(${dstX}px, ${dstY}px); opacity: 0; }
}`);

    // Trailing dots
    for (let dotIdx = 0; dotIdx < DOT_COUNT; dotIdx++) {
      packets.push({
        animName,
        delay: dotIdx * DOT_STAGGER,
        dotIdx,
      });
    }
  });

  return (
    <g key={stepKey}>
      <style>{keyframeRules.join("\n")}</style>
      {packets.map(({ animName, delay, dotIdx }, i) => (
        <circle
          key={i}
          r={3 - dotIdx * 0.7}
          fill={ACCENT}
          style={{
            animation: `${animName} ${ANIM_DURATION}s ease-in-out ${delay}s forwards`,
            opacity: 0,
            filter: `drop-shadow(0 0 ${3 - dotIdx}px ${ACCENT})`,
          }}
        />
      ))}
    </g>
  );
}
