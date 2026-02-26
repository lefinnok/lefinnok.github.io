import { useEffect, useRef, useState } from "react";
import { Box, Typography, Stack } from "@mui/material";

export const ACCENT = "#00e5ff";
const DIM = 0.15;

// ─── Lazy KaTeX ──────────────────────────────────────────────────

export function Latex({
  math,
  display = false,
}: {
  math: string;
  display?: boolean;
}) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    import("katex").then((katex) => {
      if (cancelled) return;
      setHtml(
        katex.default.renderToString(math, {
          displayMode: display,
          throwOnError: false,
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [math, display]);

  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      style={
        display
          ? { display: "block", textAlign: "center", margin: "16px 0" }
          : undefined
      }
    />
  );
}

export function KatexStyles() {
  useEffect(() => {
    if (document.querySelector("link[data-katex-css]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css";
    link.setAttribute("data-katex-css", "");
    document.head.appendChild(link);
  }, []);
  return null;
}

// ─── Side-by-side layout ─────────────────────────────────────────

export function SlidePair({
  visual,
  children,
}: {
  visual: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 3, md: 4 },
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {visual}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

// ─── Hand landmark positions (300×400 viewBox) ──────────────────

const HP: [number, number][] = [
  [150, 375], // 0  wrist
  [122, 318], // 1
  [106, 268], // 2
  [92, 222], // 3
  [72, 178], // 4  thumb tip
  [118, 198], // 5  index base
  [108, 148], // 6
  [102, 106], // 7
  [97, 62], // 8  index tip
  [148, 192], // 9  middle base
  [148, 138], // 10
  [148, 92], // 11
  [148, 48], // 12 middle tip
  [178, 198], // 13 ring base
  [183, 148], // 14
  [186, 108], // 15
  [189, 68], // 16 ring tip
  [205, 212], // 17 pinky base
  [218, 168], // 18
  [225, 132], // 19
  [230, 98], // 20 pinky tip
];

const SKELETON: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const ANALYSIS: [number, number][] = [
  [0, 4], [0, 8], [0, 12], [0, 16], [0, 20],
  [4, 8], [4, 12], [4, 16], [4, 20],
  [8, 12], [12, 16], [16, 20],
];

const TIPS = [4, 8, 12, 16, 20];

export function HandDiagram({
  highlight,
  showAnalysis = false,
  highlightAnalysisEdge,
  dimOthers = false,
}: {
  highlight?: number[];
  showAnalysis?: boolean;
  highlightAnalysisEdge?: [number, number];
  dimOthers?: boolean;
}) {
  const isHigh = (i: number) => !highlight || highlight.includes(i);
  const isEdgeHigh = (a: number, b: number) =>
    highlightAnalysisEdge &&
    ((highlightAnalysisEdge[0] === a && highlightAnalysisEdge[1] === b) ||
      (highlightAnalysisEdge[0] === b && highlightAnalysisEdge[1] === a));

  return (
    <svg viewBox="0 0 300 420" width="100%" style={{ maxWidth: 260 }}>
      {/* Skeleton connections */}
      {SKELETON.map(([a, b]) => (
        <line
          key={`s-${a}-${b}`}
          x1={HP[a][0]} y1={HP[a][1]}
          x2={HP[b][0]} y2={HP[b][1]}
          stroke="#fff"
          strokeWidth={1.2}
          opacity={dimOthers && !isHigh(a) && !isHigh(b) ? DIM : 0.3}
        />
      ))}

      {/* Analysis edges */}
      {showAnalysis &&
        ANALYSIS.map(([a, b]) => (
          <line
            key={`a-${a}-${b}`}
            x1={HP[a][0]} y1={HP[a][1]}
            x2={HP[b][0]} y2={HP[b][1]}
            stroke={isEdgeHigh(a, b) ? "#fff" : ACCENT}
            strokeWidth={isEdgeHigh(a, b) ? 3 : 2}
            opacity={
              highlightAnalysisEdge
                ? isEdgeHigh(a, b)
                  ? 1
                  : 0.2
                : 0.5
            }
          />
        ))}

      {/* Landmark dots */}
      {HP.map(([x, y], i) => {
        const tip = TIPS.includes(i);
        const wrist = i === 0;
        const active = isHigh(i);
        const r = tip || wrist ? 7 : 4;
        return (
          <g key={i}>
            <circle
              cx={x} cy={y} r={r}
              fill={
                !active && dimOthers
                  ? "#555"
                  : tip
                    ? ACCENT
                    : wrist
                      ? "#fff"
                      : "#ccc"
              }
              opacity={dimOthers && !active ? DIM : 1}
            />
            {(active || !dimOthers) && (
              <text
                x={x + (x < 150 ? -12 : 12)}
                y={y + 4}
                textAnchor={x < 150 ? "end" : "start"}
                fill={active ? "#fff" : "#888"}
                fontSize={10}
                fontFamily="'Fira Code', monospace"
              >
                {i}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Analysis graph (6-node circular) ────────────────────────────

const GRAPH_NODES = [
  { id: 0, label: "W", full: "Wrist", angle: 270 },
  { id: 4, label: "T", full: "Thumb", angle: 210 },
  { id: 8, label: "I", full: "Index", angle: 150 },
  { id: 12, label: "M", full: "Middle", angle: 90 },
  { id: 16, label: "R", full: "Ring", angle: 30 },
  { id: 20, label: "P", full: "Pinky", angle: 330 },
];

function gpos(angle: number, r = 100, cx = 150, cy = 150): [number, number] {
  const rad = (angle * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
}

const SAMPLE_WEIGHTS: Record<string, number> = {
  "0-4": 100, "0-8": 195, "0-12": 198, "0-16": 85, "0-20": 82,
  "4-8": 130, "4-12": 150, "4-16": 90, "4-20": 105,
  "8-12": 40, "12-16": 140, "16-20": 50,
};

function edgeKey(a: number, b: number) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

export function GraphDiagram({
  highlightEdge,
  highlightNodes,
  showWeights = false,
}: {
  highlightEdge?: [number, number];
  highlightNodes?: number[];
  showWeights?: boolean;
}) {
  const positions = Object.fromEntries(
    GRAPH_NODES.map((n) => [n.id, gpos(n.angle)]),
  );

  const isNodeHigh = (id: number) =>
    !highlightNodes || highlightNodes.includes(id);
  const isEdgeHigh = (a: number, b: number) =>
    highlightEdge &&
    ((highlightEdge[0] === a && highlightEdge[1] === b) ||
      (highlightEdge[0] === b && highlightEdge[1] === a));

  return (
    <svg viewBox="0 0 300 300" width="100%" style={{ maxWidth: 280 }}>
      {/* Edges */}
      {ANALYSIS.map(([a, b]) => {
        const [x1, y1] = positions[a];
        const [x2, y2] = positions[b];
        const eHigh = isEdgeHigh(a, b);
        const dimmed = highlightEdge && !eHigh;
        return (
          <g key={`e-${a}-${b}`}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={eHigh ? "#fff" : ACCENT}
              strokeWidth={eHigh ? 2.5 : 1.2}
              opacity={dimmed ? 0.12 : eHigh ? 1 : 0.4}
            />
            {showWeights && !dimmed && (
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 4}
                textAnchor="middle"
                fill={eHigh ? "#fff" : "#888"}
                fontSize={9}
                fontFamily="'Fira Code', monospace"
              >
                {SAMPLE_WEIGHTS[edgeKey(a, b)]}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {GRAPH_NODES.map((n) => {
        const [x, y] = positions[n.id];
        const active = isNodeHigh(n.id);
        const dimmed = highlightNodes && !active;
        return (
          <g key={n.id}>
            <circle
              cx={x} cy={y} r={18}
              fill={dimmed ? "#1a1a1a" : "#1a1a2e"}
              stroke={
                dimmed ? "#333" : n.id === 0 ? "#fff" : ACCENT
              }
              strokeWidth={active && highlightNodes ? 2.5 : 1.5}
              opacity={dimmed ? 0.3 : 1}
            />
            <text
              x={x} y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={dimmed ? "#555" : "#fff"}
              fontSize={11}
              fontWeight={600}
              fontFamily="'Fira Code', monospace"
            >
              {n.label}
            </text>
            <text
              x={x}
              y={y + (n.angle > 180 ? 32 : -28)}
              textAnchor="middle"
              fill={dimmed ? "#333" : "#888"}
              fontSize={8}
              fontFamily="Inter, sans-serif"
            >
              {n.full}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Matrix grid ─────────────────────────────────────────────────

export function MatrixGrid({
  matrix,
  labels,
  title,
  highlightCells,
  highlightDiag = false,
  compact = false,
}: {
  matrix: number[][];
  labels: string[];
  title?: string;
  highlightCells?: [number, number][];
  highlightDiag?: boolean;
  compact?: boolean;
}) {
  const isHigh = (r: number, c: number) =>
    highlightCells?.some(([hr, hc]) => hr === r && hc === c) ||
    (highlightDiag && r === c);
  const size = compact ? 30 : 38;
  const fontSize = compact ? 8 : 10;

  return (
    <Box sx={{ overflowX: "auto" }}>
      {title && (
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ mb: 0.5, display: "block", textAlign: "center" }}
        >
          {title}
        </Typography>
      )}
      <Box
        component="table"
        sx={{
          mx: "auto",
          borderCollapse: "collapse",
          fontFamily: "'Fira Code', monospace",
          fontSize,
        }}
      >
        <thead>
          <tr>
            <td />
            {labels.map((l) => (
              <Box
                component="td"
                key={l}
                sx={{
                  width: size, height: size / 1.4,
                  textAlign: "center",
                  color: ACCENT,
                  fontWeight: 600,
                }}
              >
                {l}
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, r) => (
            <tr key={r}>
              <Box
                component="td"
                sx={{
                  pr: 0.5,
                  textAlign: "right",
                  color: ACCENT,
                  fontWeight: 600,
                }}
              >
                {labels[r]}
              </Box>
              {row.map((val, c) => (
                <Box
                  component="td"
                  key={c}
                  sx={{
                    width: size, height: size,
                    textAlign: "center",
                    color: isHigh(r, c) ? "#fff" : "#888",
                    bgcolor: isHigh(r, c)
                      ? "rgba(0,229,255,0.12)"
                      : "transparent",
                    border: "1px solid",
                    borderColor: isHigh(r, c)
                      ? "rgba(0,229,255,0.3)"
                      : "rgba(255,255,255,0.06)",
                    fontWeight: isHigh(r, c) ? 600 : 400,
                    transition: "all 0.2s",
                  }}
                >
                  {val}
                </Box>
              ))}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

// ─── Spectrum bars ───────────────────────────────────────────────

export function SpectrumBars({
  values,
  label,
  color = ACCENT,
  compare,
  compareLabel,
  compareColor = "#a0a0a0",
}: {
  values: number[];
  label?: string;
  color?: string;
  compare?: number[];
  compareLabel?: string;
  compareColor?: string;
}) {
  const allVals = [...values, ...(compare ?? [])];
  const maxVal = Math.max(...allVals, 1);

  return (
    <Box sx={{ width: "100%", maxWidth: 320, mx: "auto" }}>
      {(label || compareLabel) && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 1.5 }}
          justifyContent="center"
        >
          {label && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Stack>
          )}
          {compareLabel && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: compareColor,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {compareLabel}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}

      <Stack spacing={0.75}>
        {values.map((v, i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="caption"
              sx={{
                width: 20,
                color: "text.secondary",
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
              }}
            >
              {"\u03bb"}
              {i + 1}
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: compare ? 22 : 16,
                bgcolor: "rgba(255,255,255,0.04)",
                borderRadius: 0.5,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  bottom: compare ? "50%" : 0,
                  left: 0,
                  width: `${(v / maxVal) * 100}%`,
                  height: compare ? "50%" : "100%",
                  bgcolor: color,
                  borderRadius: 0.5,
                }}
              />
              {compare && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: `${((compare[i] ?? 0) / maxVal) * 100}%`,
                    height: "50%",
                    bgcolor: compareColor,
                    borderRadius: 0.5,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                width: compare ? 60 : 32,
                textAlign: "right",
                color: "text.secondary",
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
              }}
            >
              {Math.round(v)}
              {compare ? ` / ${Math.round(compare[i] ?? 0)}` : ""}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
