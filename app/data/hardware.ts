import type { IconType } from "react-icons";
import {
  SiKicad,
  SiFreecad,
  SiAnycubic,
  SiBambulab,
  SiEspressif,
  SiArduino,
  SiMqtt,
  SiBluetooth,
} from "react-icons/si";

// ── Hardware Lifecycle Stages ────────────────────────────────────

export interface HardwareStage {
  id: string;
  label: string;
  tool: string;
  icons: IconType[];
  description: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Graph layout — 6 stages on the middle row, Fabrication above, Firmware below
// ViewBox: 1000 x 560
//
//                         [Fabrication] ──────────────────┐
//                        ╱                                ▼
// [Schematic] → [PCB] ──┤→ [Chassis] → [3D Print] → [Assembly] → [Integration]
//                        ╲                                ▲
//                         [Firmware] ─────────────────────┘

const W = 130;
const H = 160;
const ROW_TOP = 15;
const ROW_MID = 200;
const ROW_BOT = 385;

export const HARDWARE_STAGES: HardwareStage[] = [
  {
    id: "schematic",
    label: "Schematic Design",
    tool: "KiCad",
    icons: [SiKicad],
    description: "Circuit design with symbols and nets",
    color: "#4ade80",
    x: 15, y: ROW_MID, w: W, h: H,
  },
  {
    id: "pcb-layout",
    label: "PCB Layout",
    tool: "KiCad",
    icons: [SiKicad],
    description: "Routing traces and placing footprints",
    color: "#38bdf8",
    x: 175, y: ROW_MID, w: W, h: H,
  },
  {
    id: "fabrication",
    label: "Fabrication",
    tool: "JLCPCB / OSHPark",
    icons: [],
    description: "Manufacturing boards and assembly",
    color: "#a78bfa",
    x: 350, y: ROW_TOP, w: W, h: H,
  },
  {
    id: "chassis",
    label: "Chassis Design",
    tool: "FreeCAD",
    icons: [SiFreecad],
    description: "Enclosure modeling and mounting",
    color: "#f97316",
    x: 350, y: ROW_MID, w: W, h: H,
  },
  {
    id: "3d-printing",
    label: "3D Printing",
    tool: "Anycubic / Bambu Labs",
    icons: [SiAnycubic, SiBambulab],
    description: "Rapid prototyping & enclosures",
    color: "#fbbf24",
    x: 520, y: ROW_MID, w: W, h: H,
  },
  {
    id: "firmware",
    label: "Firmware",
    tool: "ESP32 / Arduino",
    icons: [SiEspressif, SiArduino],
    description: "Embedded C/C++ for peripherals",
    color: "#f472b6",
    x: 350, y: ROW_BOT, w: W, h: H,
  },
  {
    id: "assembly",
    label: "Product Assembly",
    tool: "Solder / test",
    icons: [],
    description: "Final build, test & packaging",
    color: "#f87171",
    x: 700, y: ROW_MID, w: W, h: H,
  },
  {
    id: "integration",
    label: "Integration",
    tool: "MQTT / BLE / WiFi",
    icons: [SiMqtt, SiBluetooth],
    description: "Device connectivity and deploy",
    color: "#00e5ff",
    x: 870, y: ROW_MID, w: W, h: H,
  },
];

export const STAGE_MAP = Object.fromEntries(
  HARDWARE_STAGES.map((s) => [s.id, s])
) as Record<string, HardwareStage>;

// ── Pipeline Connections ────────────────────────────────────────

export interface PipelineConnection {
  from: string;
  to: string;
  label?: string;
}

export const PIPELINE_CONNECTIONS: PipelineConnection[] = [
  { from: "schematic", to: "pcb-layout", label: "netlist" },
  // PCB fans out to three parallel branches
  { from: "pcb-layout", to: "fabrication", label: "gerber" },
  { from: "pcb-layout", to: "chassis", label: "board dims" },
  { from: "pcb-layout", to: "firmware", label: "pinout" },
  // Chassis → 3D printing
  { from: "chassis", to: "3d-printing", label: "STL" },
  // All branches converge at assembly
  { from: "fabrication", to: "assembly", label: "PCBAs" },
  { from: "3d-printing", to: "assembly", label: "parts" },
  { from: "firmware", to: "assembly", label: "flash" },
  // Assembly → final integration
  { from: "assembly", to: "integration", label: "deploy" },
];
