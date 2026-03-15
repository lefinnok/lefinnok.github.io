import type { HardwareStage } from "~/data/hardware";

const BG = "#111111";
const BORDER_DEFAULT = "#2a2a2a";
const FONT = "'Fira Code', monospace";

interface HardwarePipelineStageProps {
  stage: HardwareStage;
  highlighted: boolean;
  dimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function HardwarePipelineStage({
  stage,
  highlighted,
  dimmed,
  onMouseEnter,
  onMouseLeave,
}: HardwarePipelineStageProps) {
  const { x, y, w, h, color, label, tool } = stage;
  const borderColor = highlighted ? color : BORDER_DEFAULT;
  const glowFilter = highlighted
    ? `drop-shadow(0 0 8px ${color}60)`
    : "none";
  const strokeAlpha = highlighted ? "cc" : "55";
  const sc = `${color}${strokeAlpha}`; // stroke color with opacity

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
      {/* Background */}
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

      {/* Stage label */}
      <text
        x={x + w / 2}
        y={y + 16}
        textAnchor="middle"
        fill={highlighted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)"}
        fontSize={9}
        fontFamily={FONT}
        fontWeight={500}
        style={{ transition: "fill 0.2s", pointerEvents: "none" }}
      >
        {label}
      </text>

      {/* Tool icons + sublabel */}
      {stage.icons.length > 0 ? (
        <>
          {/* Icons row via foreignObject */}
          <foreignObject
            x={x}
            y={y + 19}
            width={w}
            height={14}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                height: "100%",
                color: highlighted ? color : `${color}88`,
                transition: "color 0.2s",
              }}
            >
              {stage.icons.map((Icon, i) => (
                <Icon key={i} size={10} />
              ))}
            </div>
          </foreignObject>
          {/* Tool name below icons */}
          <text
            x={x + w / 2}
            y={y + 42}
            textAnchor="middle"
            fill={highlighted ? `${color}cc` : "rgba(255,255,255,0.3)"}
            fontSize={6}
            fontFamily={FONT}
            style={{ transition: "fill 0.2s", pointerEvents: "none" }}
          >
            {tool}
          </text>
        </>
      ) : (
        <text
          x={x + w / 2}
          y={y + 28}
          textAnchor="middle"
          fill={highlighted ? `${color}cc` : "rgba(255,255,255,0.3)"}
          fontSize={7}
          fontFamily={FONT}
          style={{ transition: "fill 0.2s", pointerEvents: "none" }}
        >
          {tool}
        </text>
      )}

      {/* Separator */}
      <line
        x1={x + 10}
        y1={y + (stage.icons.length > 0 ? 47 : 34)}
        x2={x + w - 10}
        y2={y + (stage.icons.length > 0 ? 47 : 34)}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={0.5}
      />

      {/* Mini visualization area */}
      <g style={{ pointerEvents: "none" }}>
        <MiniViz stageId={stage.id} x={x} y={y} w={w} sc={sc} color={color} hasIcons={stage.icons.length > 0} />
      </g>

      {/* Description */}
      <text
        x={x + w / 2}
        y={y + h - 10}
        textAnchor="middle"
        fill={highlighted ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}
        fontSize={6}
        fontFamily={FONT}
        style={{ transition: "fill 0.2s", pointerEvents: "none" }}
      >
        {stage.description}
      </text>
    </g>
  );
}

// ── Mini Visualizations ─────────────────────────────────────────

function MiniViz({
  stageId,
  x,
  y,
  w,
  sc,
  color,
  hasIcons,
}: {
  stageId: string;
  x: number;
  y: number;
  w: number;
  sc: string;
  color: string;
  hasIcons: boolean;
}) {
  // When icons are present, the separator is lower (y+47 vs y+34), so shift viz down
  const vx = x + 10;
  const vy = y + (hasIcons ? 50 : 40);

  switch (stageId) {
    case "schematic":
      return <SchematicViz vx={vx} vy={vy} sc={sc} color={color} />;
    case "pcb-layout":
      return <PcbLayoutViz vx={vx} vy={vy} sc={sc} color={color} />;
    case "fabrication":
      return <FabricationViz vx={vx} vy={vy} sc={sc} color={color} />;
    case "chassis":
      return <ChassisViz vx={vx} vy={vy} sc={sc} />;
    case "firmware":
      return <FirmwareViz vx={vx} vy={vy} sc={sc} color={color} />;
    case "3d-printing":
      return <PrintingViz vx={vx} vy={vy} sc={sc} color={color} />;
    case "assembly":
      return <AssemblyViz vx={vx} vy={vy} sc={sc} color={color} />;
    case "integration":
      return <IntegrationViz vx={vx} vy={vy} sc={sc} color={color} />;
    default:
      return null;
  }
}

/** Schematic: resistor zigzag, capacitor, IC block */
function SchematicViz({
  vx,
  vy,
  sc,
  color,
}: {
  vx: number;
  vy: number;
  sc: string;
  color: string;
}) {
  return (
    <g>
      {/* Wire + Resistor zigzag + Wire */}
      <line x1={vx} y1={vy + 25} x2={vx + 15} y2={vy + 25} stroke={sc} strokeWidth={1.5} />
      <polyline
        points={`${vx + 15},${vy + 25} ${vx + 20},${vy + 17} ${vx + 25},${vy + 33} ${vx + 30},${vy + 17} ${vx + 35},${vy + 33} ${vx + 40},${vy + 17} ${vx + 45},${vy + 25}`}
        fill="none"
        stroke={sc}
        strokeWidth={1.5}
      />
      <line x1={vx + 45} y1={vy + 25} x2={vx + 60} y2={vy + 25} stroke={sc} strokeWidth={1.5} />

      {/* Capacitor */}
      <line x1={vx + 60} y1={vy + 15} x2={vx + 60} y2={vy + 35} stroke={sc} strokeWidth={2} />
      <line x1={vx + 65} y1={vy + 15} x2={vx + 65} y2={vy + 35} stroke={sc} strokeWidth={2} />
      <line x1={vx + 65} y1={vy + 25} x2={vx + 80} y2={vy + 25} stroke={sc} strokeWidth={1.5} />

      {/* Ground symbol */}
      <line x1={vx + 80} y1={vy + 25} x2={vx + 80} y2={vy + 35} stroke={sc} strokeWidth={1.5} />
      <line x1={vx + 74} y1={vy + 35} x2={vx + 86} y2={vy + 35} stroke={sc} strokeWidth={1.5} />
      <line x1={vx + 76} y1={vy + 39} x2={vx + 84} y2={vy + 39} stroke={sc} strokeWidth={1} />
      <line x1={vx + 78} y1={vy + 43} x2={vx + 82} y2={vy + 43} stroke={sc} strokeWidth={0.5} />

      {/* IC block */}
      <rect x={vx + 25} y={vy + 55} width={50} height={30} rx={2} fill="none" stroke={sc} strokeWidth={1.5} />
      <text x={vx + 50} y={vy + 74} textAnchor="middle" fill={color} fontSize={8} fontFamily="'Fira Code', monospace" opacity={0.6}>IC</text>
      {/* IC pins */}
      <line x1={vx + 15} y1={vy + 63} x2={vx + 25} y2={vy + 63} stroke={sc} strokeWidth={1} />
      <line x1={vx + 15} y1={vy + 73} x2={vx + 25} y2={vy + 73} stroke={sc} strokeWidth={1} />
      <line x1={vx + 75} y1={vy + 63} x2={vx + 85} y2={vy + 63} stroke={sc} strokeWidth={1} />
      <line x1={vx + 75} y1={vy + 73} x2={vx + 85} y2={vy + 73} stroke={sc} strokeWidth={1} />
      <line x1={vx + 42} y1={vy + 85} x2={vx + 42} y2={vy + 95} stroke={sc} strokeWidth={1} />
      <line x1={vx + 58} y1={vy + 85} x2={vx + 58} y2={vy + 95} stroke={sc} strokeWidth={1} />
    </g>
  );
}

/** PCB Layout: board outline, traces, pads, vias */
function PcbLayoutViz({
  vx,
  vy,
  sc,
  color,
}: {
  vx: number;
  vy: number;
  sc: string;
  color: string;
}) {
  return (
    <g>
      {/* Board outline */}
      <rect x={vx + 5} y={vy + 5} width={100} height={90} rx={3} fill="#0d1a0d" stroke={sc} strokeWidth={1} />

      {/* Traces */}
      <polyline points={`${vx + 15},${vy + 20} ${vx + 50},${vy + 20} ${vx + 50},${vy + 45}`} fill="none" stroke={sc} strokeWidth={2} strokeLinejoin="round" />
      <polyline points={`${vx + 85},${vy + 30} ${vx + 65},${vy + 30} ${vx + 65},${vy + 60}`} fill="none" stroke={sc} strokeWidth={2} strokeLinejoin="round" />
      <line x1={vx + 20} y1={vy + 75} x2={vx + 80} y2={vy + 75} stroke={sc} strokeWidth={2} />

      {/* SMD pads */}
      <rect x={vx + 11} y={vy + 17} width={8} height={5} rx={1} fill={`${color}99`} />
      <rect x={vx + 47} y={vy + 42} width={5} height={8} rx={1} fill={`${color}99`} />
      <rect x={vx + 82} y={vy + 27} width={8} height={5} rx={1} fill={`${color}99`} />
      <rect x={vx + 62} y={vy + 57} width={5} height={8} rx={1} fill={`${color}99`} />
      <rect x={vx + 16} y={vy + 72} width={8} height={5} rx={1} fill={`${color}99`} />
      <rect x={vx + 76} y={vy + 72} width={8} height={5} rx={1} fill={`${color}99`} />

      {/* Vias */}
      <circle cx={vx + 50} cy={vy + 55} r={4} fill="none" stroke={sc} strokeWidth={1} />
      <circle cx={vx + 50} cy={vy + 55} r={1.5} fill={`${color}88`} />
      <circle cx={vx + 35} cy={vy + 40} r={4} fill="none" stroke={sc} strokeWidth={1} />
      <circle cx={vx + 35} cy={vy + 40} r={1.5} fill={`${color}88`} />

      {/* Silkscreen labels */}
      <text x={vx + 22} y={vy + 30} fill="rgba(255,255,255,0.2)" fontSize={5} fontFamily="'Fira Code', monospace">R1</text>
      <text x={vx + 70} y={vy + 50} fill="rgba(255,255,255,0.2)" fontSize={5} fontFamily="'Fira Code', monospace">U1</text>
    </g>
  );
}

/** Fabrication: layer stackup cross-section */
function FabricationViz({
  vx,
  vy,
  sc,
  color,
}: {
  vx: number;
  vy: number;
  sc: string;
  color: string;
}) {
  const lx = vx + 15;
  const lw = 80;
  const layers = [
    { label: "Cu", fill: `${color}55`, h: 10 },
    { label: "PP", fill: "#1a1a2a", h: 14 },
    { label: "Cu", fill: `${color}35`, h: 10 },
    { label: "Core", fill: "#1a1a1a", h: 18 },
    { label: "Cu", fill: `${color}35`, h: 10 },
    { label: "PP", fill: "#1a1a2a", h: 14 },
    { label: "Cu", fill: `${color}55`, h: 10 },
  ];
  let ly = vy + 5;

  return (
    <g>
      {layers.map((layer, i) => {
        const thisY = ly;
        ly += layer.h;
        return (
          <g key={i}>
            <rect x={lx} y={thisY} width={lw} height={layer.h} fill={layer.fill} stroke={sc} strokeWidth={0.5} />
            <text x={lx + lw + 4} y={thisY + layer.h / 2 + 3} fill="rgba(255,255,255,0.25)" fontSize={5} fontFamily="'Fira Code', monospace">{layer.label}</text>
          </g>
        );
      })}

      {/* Drill vias — vertical lines through all layers */}
      <line x1={lx + 25} y1={vy + 5} x2={lx + 25} y2={ly} stroke={sc} strokeWidth={1} strokeDasharray="2,2" />
      <line x1={lx + 60} y1={vy + 5} x2={lx + 60} y2={ly} stroke={sc} strokeWidth={1} strokeDasharray="2,2" />

      {/* Solder mask overlay (top and bottom) */}
      <rect x={lx} y={vy + 3} width={lw} height={3} rx={1} fill="#22c55e" opacity={0.15} />
      <rect x={lx} y={ly - 1} width={lw} height={3} rx={1} fill="#22c55e" opacity={0.15} />
    </g>
  );
}

/** Chassis: isometric wireframe enclosure */
function ChassisViz({
  vx,
  vy,
  sc,
}: {
  vx: number;
  vy: number;
  sc: string;
}) {
  // Isometric box
  const ox = vx + 15;
  const oy = vy + 30;
  // Front face
  const front = `M${ox},${oy + 55} L${ox + 70},${oy + 55} L${ox + 70},${oy + 15} L${ox},${oy + 15} Z`;
  // Top face
  const top = `M${ox},${oy + 15} L${ox + 25},${oy} L${ox + 95},${oy} L${ox + 70},${oy + 15} Z`;
  // Right face
  const right = `M${ox + 70},${oy + 15} L${ox + 95},${oy} L${ox + 95},${oy + 40} L${ox + 70},${oy + 55} Z`;

  return (
    <g>
      <path d={front} fill="none" stroke={sc} strokeWidth={1.5} />
      <path d={top} fill="none" stroke={sc} strokeWidth={1.5} />
      <path d={right} fill="none" stroke={sc} strokeWidth={1.5} />

      {/* Hidden back edges — dashed */}
      <line x1={ox} y1={oy + 15} x2={ox + 25} y2={oy} stroke={sc} strokeWidth={0.5} strokeDasharray="2,3" opacity={0.4} />

      {/* Mounting holes on front face */}
      <circle cx={ox + 8} cy={oy + 22} r={2} fill="none" stroke={sc} strokeWidth={0.8} />
      <circle cx={ox + 62} cy={oy + 22} r={2} fill="none" stroke={sc} strokeWidth={0.8} />
      <circle cx={ox + 8} cy={oy + 48} r={2} fill="none" stroke={sc} strokeWidth={0.8} />
      <circle cx={ox + 62} cy={oy + 48} r={2} fill="none" stroke={sc} strokeWidth={0.8} />

      {/* Ventilation slots on right face */}
      <line x1={ox + 76} y1={oy + 12} x2={ox + 88} y2={oy + 6} stroke={sc} strokeWidth={0.8} />
      <line x1={ox + 76} y1={oy + 18} x2={ox + 88} y2={oy + 12} stroke={sc} strokeWidth={0.8} />
      <line x1={ox + 76} y1={oy + 24} x2={ox + 88} y2={oy + 18} stroke={sc} strokeWidth={0.8} />
    </g>
  );
}

/** Firmware: mini code editor with embedded C */
function FirmwareViz({
  vx,
  vy,
  sc,
  color,
}: {
  vx: number;
  vy: number;
  sc: string;
  color: string;
}) {
  const ex = vx + 3;
  const ey = vy + 2;
  const ew = 104;
  const eh = 92;
  const fs = 6.5;
  const lh = 11; // line height

  return (
    <g>
      {/* Editor bg */}
      <rect x={ex} y={ey} width={ew} height={eh} rx={3} fill="#0d0d0d" stroke={sc} strokeWidth={0.5} />

      {/* Line numbers */}
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <text
          key={n}
          x={ex + 8}
          y={ey + 10 + (n - 1) * lh}
          textAnchor="end"
          fill="rgba(255,255,255,0.12)"
          fontSize={5}
          fontFamily="'Fira Code', monospace"
        >
          {n}
        </text>
      ))}

      {/* Separator line */}
      <line x1={ex + 12} y1={ey + 2} x2={ex + 12} y2={ey + eh - 2} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />

      {/* Code lines */}
      <text x={ex + 16} y={ey + 10} fill={color} fontSize={fs} fontFamily="'Fira Code', monospace" opacity={0.7}>#include &lt;esp.h&gt;</text>
      <text x={ex + 16} y={ey + 10 + lh} fill="rgba(255,255,255,0.5)" fontSize={fs} fontFamily="'Fira Code', monospace" />
      <text x={ex + 16} y={ey + 10 + 2 * lh} fill="rgba(255,255,255,0.6)" fontSize={fs} fontFamily="'Fira Code', monospace">
        <tspan fill={color} opacity={0.7}>void</tspan> setup() {"{"}
      </text>
      <text x={ex + 24} y={ey + 10 + 3 * lh} fill="rgba(255,255,255,0.5)" fontSize={fs} fontFamily="'Fira Code', monospace">
        gpio_init(<tspan fill={color} opacity={0.7}>LED</tspan>);
      </text>
      <text x={ex + 24} y={ey + 10 + 4 * lh} fill="rgba(255,255,255,0.5)" fontSize={fs} fontFamily="'Fira Code', monospace">
        wifi_start();
      </text>
      <text x={ex + 16} y={ey + 10 + 5 * lh} fill="rgba(255,255,255,0.6)" fontSize={fs} fontFamily="'Fira Code', monospace">{"}"}</text>
    </g>
  );
}

/** 3D Printing: printer frame, nozzle, partially printed object on build plate */
function PrintingViz({
  vx,
  vy,
  sc,
  color,
}: {
  vx: number;
  vy: number;
  sc: string;
  color: string;
}) {
  const fx = vx + 15; // frame left
  const fy = vy + 5;  // frame top

  return (
    <g>
      {/* Printer frame — two vertical uprights + top bar */}
      <line x1={fx} y1={fy} x2={fx} y2={fy + 90} stroke={sc} strokeWidth={1.5} />
      <line x1={fx + 80} y1={fy} x2={fx + 80} y2={fy + 90} stroke={sc} strokeWidth={1.5} />
      <line x1={fx} y1={fy} x2={fx + 80} y2={fy} stroke={sc} strokeWidth={1.5} />

      {/* Gantry bar (horizontal, moves along Y) */}
      <line x1={fx + 2} y1={fy + 30} x2={fx + 78} y2={fy + 30} stroke={sc} strokeWidth={1.2} />

      {/* Nozzle (on gantry) */}
      <rect x={fx + 32} y={fy + 27} width={12} height={8} rx={1} fill="#0d0d0d" stroke={sc} strokeWidth={1} />
      <line x1={fx + 38} y1={fy + 35} x2={fx + 38} y2={fy + 40} stroke={color} strokeWidth={1.5} />

      {/* Build plate */}
      <rect x={fx + 5} y={fy + 75} width={70} height={4} rx={1} fill="none" stroke={sc} strokeWidth={1} />

      {/* Partially printed object — layered rectangles */}
      <rect x={fx + 22} y={fy + 68} width={36} height={7} rx={1} fill={`${color}15`} stroke={sc} strokeWidth={0.5} />
      <rect x={fx + 22} y={fy + 61} width={36} height={7} rx={1} fill={`${color}20`} stroke={sc} strokeWidth={0.5} />
      <rect x={fx + 22} y={fy + 54} width={36} height={7} rx={1} fill={`${color}28`} stroke={sc} strokeWidth={0.5} />
      <rect x={fx + 22} y={fy + 47} width={36} height={7} rx={1} fill={`${color}35`} stroke={sc} strokeWidth={0.5} />

      {/* Filament path from top */}
      <path
        d={`M${fx + 60},${fy} Q${fx + 55},${fy + 15} ${fx + 42},${fy + 27}`}
        fill="none"
        stroke={sc}
        strokeWidth={0.8}
        strokeDasharray="3,2"
      />

      {/* Layer lines on printed object */}
      {[49, 53, 57, 61, 65, 69, 73].map((ly) => (
        <line
          key={ly}
          x1={fx + 23}
          y1={fy + ly - 1}
          x2={fx + 57}
          y2={fy + ly - 1}
          stroke={color}
          strokeWidth={0.3}
          opacity={0.3}
        />
      ))}
    </g>
  );
}

/** Assembly: exploded view — board + enclosure halves + screws + cable */
function AssemblyViz({
  vx,
  vy,
  sc,
  color,
}: {
  vx: number;
  vy: number;
  sc: string;
  color: string;
}) {
  const cx = vx + 55; // center x
  const cy = vy + 48; // center y

  return (
    <g>
      {/* Enclosure top half (above) */}
      <rect x={cx - 35} y={cy - 40} width={70} height={20} rx={3} fill="none" stroke={sc} strokeWidth={1} />
      <text x={cx} y={cy - 27} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={5} fontFamily="'Fira Code', monospace">top shell</text>

      {/* Assembly arrow — top shell down */}
      <line x1={cx} y1={cy - 19} x2={cx} y2={cy - 12} stroke={color} strokeWidth={0.8} opacity={0.5} />
      <path d={`M${cx - 3},${cy - 14} L${cx},${cy - 10} L${cx + 3},${cy - 14}`} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5} />

      {/* PCB board (center) */}
      <rect x={cx - 30} y={cy - 8} width={60} height={18} rx={2} fill="#0d1a0d" stroke={sc} strokeWidth={1.2} />
      {/* Components on PCB */}
      <rect x={cx - 20} y={cy - 4} width={8} height={5} rx={1} fill={`${color}40`} />
      <rect x={cx - 5} y={cy - 5} width={12} height={8} rx={1} fill={`${color}30`} />
      <rect x={cx + 12} y={cy - 3} width={6} height={4} rx={0.5} fill={`${color}35`} />

      {/* Assembly arrow — bottom shell up */}
      <line x1={cx} y1={cy + 14} x2={cx} y2={cy + 21} stroke={color} strokeWidth={0.8} opacity={0.5} />
      <path d={`M${cx - 3},${cy + 16} L${cx},${cy + 12} L${cx + 3},${cy + 16}`} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5} />

      {/* Enclosure bottom half (below) */}
      <rect x={cx - 35} y={cy + 22} width={70} height={20} rx={3} fill="none" stroke={sc} strokeWidth={1} />
      <text x={cx} y={cy + 35} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={5} fontFamily="'Fira Code', monospace">bottom shell</text>

      {/* Screws on sides */}
      <circle cx={cx - 38} cy={cy - 30} r={2.5} fill="none" stroke={sc} strokeWidth={0.8} />
      <line x1={cx - 38} y1={cy - 31.5} x2={cx - 38} y2={cy - 28.5} stroke={sc} strokeWidth={0.5} />
      <circle cx={cx + 38} cy={cy - 30} r={2.5} fill="none" stroke={sc} strokeWidth={0.8} />
      <line x1={cx + 38} y1={cy - 31.5} x2={cx + 38} y2={cy - 28.5} stroke={sc} strokeWidth={0.5} />

      {/* Assembly arrows for screws */}
      <line x1={cx - 38} y1={cy - 26} x2={cx - 38} y2={cy - 18} stroke={color} strokeWidth={0.5} strokeDasharray="2,1" opacity={0.4} />
      <line x1={cx + 38} y1={cy - 26} x2={cx + 38} y2={cy - 18} stroke={color} strokeWidth={0.5} strokeDasharray="2,1" opacity={0.4} />

      {/* Cable connector (right side) */}
      <rect x={cx + 32} y={cy + 2} width={14} height={6} rx={1} fill="none" stroke={sc} strokeWidth={0.8} />
      <line x1={cx + 46} y1={cy + 5} x2={cx + 52} y2={cy + 5} stroke={sc} strokeWidth={0.8} strokeDasharray="2,1" />
    </g>
  );
}

/** Integration: device → WiFi → cloud, BLE → phone */
function IntegrationViz({
  vx,
  vy,
  sc,
  color,
}: {
  vx: number;
  vy: number;
  sc: string;
  color: string;
}) {
  const cx = vx + 55; // center x
  const cy = vy + 50; // device center

  return (
    <g>
      {/* Central device (chip) */}
      <rect x={cx - 12} y={cy - 8} width={24} height={16} rx={2} fill="#0d0d0d" stroke={sc} strokeWidth={1.5} />
      <text x={cx} y={cy + 3} textAnchor="middle" fill={color} fontSize={5} fontFamily="'Fira Code', monospace" opacity={0.6}>MCU</text>

      {/* WiFi arcs (top-right) */}
      <path d={`M${cx + 18},${cy - 4} A6,6 0 0,1 ${cx + 18},${cy - 16}`} fill="none" stroke={sc} strokeWidth={1} />
      <path d={`M${cx + 22},${cy - 2} A10,10 0 0,1 ${cx + 22},${cy - 20}`} fill="none" stroke={sc} strokeWidth={0.8} />
      <path d={`M${cx + 26},${cy} A14,14 0 0,1 ${cx + 26},${cy - 24}`} fill="none" stroke={sc} strokeWidth={0.6} />

      {/* Cloud shape (top) */}
      <path
        d={`M${cx - 15},${vy + 15} A8,8 0 0,1 ${cx - 3},${vy + 8} A6,6 0 0,1 ${cx + 8},${vy + 10} A7,7 0 0,1 ${cx + 18},${vy + 15} L${cx - 15},${vy + 15} Z`}
        fill="none"
        stroke={sc}
        strokeWidth={1}
      />

      {/* MQTT arrow: device → cloud */}
      <line x1={cx} y1={cy - 8} x2={cx} y2={vy + 16} stroke={sc} strokeWidth={1} strokeDasharray="3,2" />
      <text x={cx + 4} y={vy + 28} fill={color} fontSize={5} fontFamily="'Fira Code', monospace" opacity={0.5}>MQTT</text>

      {/* Phone (bottom-left) */}
      <rect x={vx + 5} y={cy + 15} width={14} height={22} rx={2} fill="none" stroke={sc} strokeWidth={1} />
      <line x1={vx + 9} y1={cy + 34} x2={vx + 16} y2={cy + 34} stroke={sc} strokeWidth={0.5} />

      {/* BLE arrow: device → phone */}
      <line x1={cx - 12} y1={cy + 4} x2={vx + 19} y2={cy + 24} stroke={sc} strokeWidth={1} strokeDasharray="3,2" />
      <text x={vx + 8} y={cy + 12} fill={color} fontSize={5} fontFamily="'Fira Code', monospace" opacity={0.5}>BLE</text>

      {/* Sensor nodes (right side) */}
      <circle cx={cx + 38} cy={cy + 20} r={4} fill="none" stroke={sc} strokeWidth={1} />
      <circle cx={cx + 38} cy={cy + 36} r={4} fill="none" stroke={sc} strokeWidth={1} />
      <line x1={cx + 12} y1={cy + 4} x2={cx + 34} y2={cy + 20} stroke={sc} strokeWidth={0.8} strokeDasharray="2,2" />
      <line x1={cx + 12} y1={cy + 6} x2={cx + 34} y2={cy + 36} stroke={sc} strokeWidth={0.8} strokeDasharray="2,2" />
      <text x={cx + 35} y={cy + 48} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={4} fontFamily="'Fira Code', monospace">sensors</text>
    </g>
  );
}
