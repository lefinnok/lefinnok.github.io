import { type CpuState, type ModuleId, CS, activeModules } from "../engine/types";
import { disassemble } from "../engine/cpu";
import { ModuleBlock } from "./ModuleBlock";
import { LedStrip, ledStripWidth } from "./LedStrip";
import { BusAnimation } from "./BusAnimation";

const ACCENT = "#f97316";
const BUS_COLOR = "#2a2a2a";
const BUS_ACTIVE_COLOR = "#f97316";

// ── Layout constants ────────────────────────────────────────────
// SVG viewBox: 0 0 780 520

const BUS_X = 250; // x position of the vertical bus
const BUS_TOP = 30;
const BUS_BOTTOM = 490;

// Module positions — arranged around the bus like Figure 2.2
const MODULES = {
  pc: { x: 30, y: 40, w: 120, h: 52, label: "Program Counter" },
  mar: { x: 30, y: 110, w: 120, h: 52, label: "MAR" },
  ram: { x: 30, y: 180, w: 120, h: 52 },
  ir: { x: 30, y: 260, w: 120, h: 52, label: "Instruction Reg" },
  control: { x: 30, y: 340, w: 120, h: 48, label: "Control Logic" },
  clock: { x: 30, y: 410, w: 120, h: 48, label: "Clock" },
  regA: { x: 390, y: 40, w: 120, h: 52, label: "Register A" },
  alu: { x: 390, y: 120, w: 120, h: 56, label: "ALU" },
  regB: { x: 390, y: 204, w: 120, h: 52, label: "Register B" },
  keyboard: { x: 390, y: 300, w: 120, h: 48, label: "Keyboard" },
  output: { x: 390, y: 380, w: 120, h: 52, label: "Output Display" },
} as const;

// Bus connection points (y positions where modules tap into the bus)
const BUS_TAPS: Record<string, number> = {
  pc: 66,
  mar: 136,
  ram: 206,
  ir: 286,
  regA: 66,
  alu: 148,
  regB: 230,
  keyboard: 324,
  output: 406,
};

interface ArchitectureSvgProps {
  cpu: CpuState;
  selectedModule: ModuleId | null;
  onSelectModule: (id: ModuleId | null) => void;
}

export function ArchitectureSvg({
  cpu,
  selectedModule,
  onSelectModule,
}: ArchitectureSvgProps) {
  const active = activeModules(cpu.controlWord);
  const cw = cpu.controlWord;

  // Determine which bus segments are active (source -> dest)
  const busActive = cw !== 0 && !cpu.halted;

  function isActive(id: ModuleId): boolean {
    return active.has(id);
  }

  function isSelected(id: ModuleId): boolean {
    return selectedModule === id;
  }

  function handleClick(id: ModuleId) {
    onSelectModule(selectedModule === id ? null : id);
  }

  return (
    <svg
      viewBox="0 0 780 520"
      width="100%"
      style={{ maxHeight: 520, display: "block" }}
      role="img"
      aria-label="8-bit computer architecture diagram"
    >
      {/* Background */}
      <rect width="780" height="520" fill="#0a0a0a" rx={8} />

      {/* Title */}
      <text
        x={390}
        y={18}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={9}
        fontFamily="'Fira Code', monospace"
      >
        Modified SAP-1 Architecture
      </text>

      {/* ── Bus ──────────────────────────────────────────────── */}
      {/* Main vertical bus backbone */}
      <line
        x1={BUS_X}
        y1={BUS_TOP}
        x2={BUS_X}
        y2={BUS_BOTTOM}
        stroke={busActive ? `${BUS_ACTIVE_COLOR}40` : `${BUS_COLOR}60`}
        strokeWidth={busActive ? 2 : 1.5}
        style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
      />

      {/* LED strip showing current bus value — centered vertically */}
      {(() => {
        const stripW = ledStripWidth(8, 6, 3);
        const stripX = BUS_X - stripW / 2;
        const stripY = (BUS_TOP + BUS_BOTTOM) / 2 - 3;
        return (
          <g>
            {/* Dark background behind LEDs for contrast */}
            <rect
              x={stripX - 6}
              y={stripY - 6}
              width={stripW + 12}
              height={18}
              rx={4}
              fill="#0a0a0a"
              stroke={busActive ? `${BUS_ACTIVE_COLOR}30` : `${BUS_COLOR}40`}
              strokeWidth={0.5}
              style={{ transition: "stroke 0.3s" }}
            />
            <LedStrip
              value={busActive ? cpu.bus : 0}
              bits={8}
              x={stripX}
              y={stripY}
              size={6}
              gap={3}
            />
          </g>
        );
      })()}

      {/* Bus value hex label */}
      <text
        x={BUS_X}
        y={(BUS_TOP + BUS_BOTTOM) / 2 + 20}
        textAnchor="middle"
        fill={busActive ? ACCENT : "rgba(255,255,255,0.15)"}
        fontSize={9}
        fontFamily="'Fira Code', monospace"
        style={{ transition: "fill 0.2s" }}
      >
        {busActive
          ? `0x${cpu.bus.toString(16).toUpperCase().padStart(2, "0")}`
          : "BUS"}
      </text>

      {/* Bus label at bottom */}
      <text
        x={BUS_X}
        y={BUS_BOTTOM + 14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={8}
        fontFamily="'Fira Code', monospace"
      >
        8-BIT BUS
      </text>

      {/* ── Bus connections (horizontal lines from modules to bus) ── */}
      {/* Left side modules */}
      {(["pc", "mar", "ram", "ir"] as const).map((id) => {
        const m = MODULES[id];
        const tapY = BUS_TAPS[id];
        const connActive = isActive(id);
        return (
          <g key={`conn-${id}`}>
            <line
              x1={m.x + m.w}
              y1={tapY}
              x2={BUS_X - 10}
              y2={tapY}
              stroke={connActive ? ACCENT : BUS_COLOR}
              strokeWidth={connActive ? 1.5 : 1}
              strokeDasharray={connActive ? "none" : "3,3"}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
            {/* Arrow triangles on bus end */}
            <BusArrow x={BUS_X - 10} y={tapY} active={connActive} direction="right" />
          </g>
        );
      })}

      {/* Right side modules */}
      {(["regA", "alu", "regB", "keyboard", "output"] as const).map((id) => {
        const m = MODULES[id];
        const tapY = BUS_TAPS[id];
        const connActive = isActive(id);
        return (
          <g key={`conn-${id}`}>
            <line
              x1={BUS_X + 10}
              y1={tapY}
              x2={m.x}
              y2={tapY}
              stroke={connActive ? ACCENT : BUS_COLOR}
              strokeWidth={connActive ? 1.5 : 1}
              strokeDasharray={connActive ? "none" : "3,3"}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
            <BusArrow x={BUS_X + 10} y={tapY} active={connActive} direction="left" />
          </g>
        );
      })}

      {/* ── Special connections (not via bus) ── */}
      {/* ALU takes direct inputs from regA and regB (not via bus) */}
      <line
        x1={MODULES.regA.x + MODULES.regA.w / 2}
        y1={MODULES.regA.y + MODULES.regA.h}
        x2={MODULES.alu.x + 30}
        y2={MODULES.alu.y}
        stroke={isActive("alu") ? `${ACCENT}60` : `${BUS_COLOR}40`}
        strokeWidth={1}
        strokeDasharray="2,2"
        style={{ transition: "stroke 0.2s" }}
      />
      <line
        x1={MODULES.regB.x + MODULES.regB.w / 2}
        y1={MODULES.regB.y}
        x2={MODULES.alu.x + 90}
        y2={MODULES.alu.y + MODULES.alu.h}
        stroke={isActive("alu") ? `${ACCENT}60` : `${BUS_COLOR}40`}
        strokeWidth={1}
        strokeDasharray="2,2"
        style={{ transition: "stroke 0.2s" }}
      />

      {/* Control logic -> all modules (shown as a single line to bus) */}
      <line
        x1={MODULES.control.x + MODULES.control.w}
        y1={MODULES.control.y + MODULES.control.h / 2}
        x2={BUS_X - 10}
        y2={MODULES.control.y + MODULES.control.h / 2}
        stroke={`${BUS_COLOR}40`}
        strokeWidth={1}
        strokeDasharray="2,4"
      />

      {/* Clock -> Control */}
      <line
        x1={MODULES.clock.x + MODULES.clock.w / 2}
        y1={MODULES.clock.y}
        x2={MODULES.control.x + MODULES.control.w / 2}
        y2={MODULES.control.y + MODULES.control.h}
        stroke={`${BUS_COLOR}60`}
        strokeWidth={1}
      />
      <text
        x={MODULES.clock.x + MODULES.clock.w / 2 - 14}
        y={(MODULES.clock.y + MODULES.control.y + MODULES.control.h) / 2}
        fill="rgba(255,255,255,0.15)"
        fontSize={7}
        fontFamily="'Fira Code', monospace"
      >
        CLK
      </text>

      {/* ── Module blocks ────────────────────────────────────── */}

      <ModuleBlock
        id="pc"
        label={MODULES.pc.label}
        x={MODULES.pc.x}
        y={MODULES.pc.y}
        width={MODULES.pc.w}
        height={MODULES.pc.h}
        value={cpu.pc}
        bits={cpu.ramSize === 256 ? 8 : 4}
        active={isActive("pc")}
        selected={isSelected("pc")}
        onClick={() => handleClick("pc")}
        signals={[
          { name: "CO", active: !!(cw & CS.CO), direction: "out" },
          { name: "CE", active: !!(cw & CS.CE), direction: "in" },
          { name: "J", active: !!(cw & CS.J), direction: "in" },
        ]}
      />

      <ModuleBlock
        id="mar"
        label={MODULES.mar.label}
        x={MODULES.mar.x}
        y={MODULES.mar.y}
        width={MODULES.mar.w}
        height={MODULES.mar.h}
        value={cpu.mar}
        bits={cpu.ramSize === 256 ? 8 : 4}
        active={isActive("mar")}
        selected={isSelected("mar")}
        onClick={() => handleClick("mar")}
        signals={[
          { name: "MI", active: !!(cw & CS.MI), direction: "in" },
        ]}
      />

      <ModuleBlock
        id="ram"
        label={cpu.ramSize === 256 ? "RAM 256\u00d78" : "RAM 16\u00d78"}
        x={MODULES.ram.x}
        y={MODULES.ram.y}
        width={MODULES.ram.w}
        height={MODULES.ram.h}
        value={cpu.ram[cpu.mar]}
        bits={8}
        active={isActive("ram")}
        selected={isSelected("ram")}
        onClick={() => handleClick("ram")}
        signals={[
          { name: "RO", active: !!(cw & CS.RO), direction: "out" },
          { name: "RI", active: !!(cw & CS.RI), direction: "in" },
        ]}
        sublabel={`[${cpu.mar.toString(16).toUpperCase()}]`}
      />

      <ModuleBlock
        id="ir"
        label={MODULES.ir.label}
        x={MODULES.ir.x}
        y={MODULES.ir.y}
        width={MODULES.ir.w}
        height={MODULES.ir.h}
        value={cpu.regIR}
        bits={8}
        active={isActive("ir")}
        selected={isSelected("ir")}
        onClick={() => handleClick("ir")}
        signals={[
          { name: "II", active: !!(cw & CS.II), direction: "in" },
          { name: "IO", active: !!(cw & CS.IO), direction: "out" },
        ]}
        sublabel={disassemble(cpu.regIR, cpu.ramSize === 256 ? cpu.regOperand : undefined, cpu.ramSize)}
      />

      <ModuleBlock
        id="control"
        label={MODULES.control.label}
        x={MODULES.control.x}
        y={MODULES.control.y}
        width={MODULES.control.w}
        height={MODULES.control.h}
        active={false}
        selected={isSelected("control")}
        onClick={() => handleClick("control")}
      />

      <ModuleBlock
        id="clock"
        label={MODULES.clock.label}
        x={MODULES.clock.x}
        y={MODULES.clock.y}
        width={MODULES.clock.w}
        height={MODULES.clock.h}
        active={isActive("clock")}
        selected={isSelected("clock")}
        onClick={() => handleClick("clock")}
      />

      <ModuleBlock
        id="regA"
        label={MODULES.regA.label}
        x={MODULES.regA.x}
        y={MODULES.regA.y}
        width={MODULES.regA.w}
        height={MODULES.regA.h}
        value={cpu.regA}
        bits={8}
        active={isActive("regA")}
        selected={isSelected("regA")}
        onClick={() => handleClick("regA")}
        signals={[
          { name: "AI", active: !!(cw & CS.AI), direction: "in" },
          { name: "AO", active: !!(cw & CS.AO), direction: "out" },
        ]}
      />

      <ModuleBlock
        id="alu"
        label={MODULES.alu.label}
        x={MODULES.alu.x}
        y={MODULES.alu.y}
        width={MODULES.alu.w}
        height={MODULES.alu.h}
        value={
          cw & CS.SU
            ? (cpu.regA - cpu.regB) & 0xff
            : (cpu.regA + cpu.regB) & 0xff
        }
        bits={8}
        active={isActive("alu")}
        selected={isSelected("alu")}
        onClick={() => handleClick("alu")}
        signals={[
          { name: "EO", active: !!(cw & CS.EO), direction: "out" },
          { name: "SU", active: !!(cw & CS.SU), direction: "in" },
          { name: "FI", active: !!(cw & CS.FI), direction: "in" },
        ]}
        sublabel={
          cpu.flagCarry || cpu.flagZero
            ? `${cpu.flagCarry ? "C" : ""}${cpu.flagZero ? "Z" : ""}`
            : undefined
        }
      />

      <ModuleBlock
        id="regB"
        label={MODULES.regB.label}
        x={MODULES.regB.x}
        y={MODULES.regB.y}
        width={MODULES.regB.w}
        height={MODULES.regB.h}
        value={cpu.regB}
        bits={8}
        active={isActive("regB")}
        selected={isSelected("regB")}
        onClick={() => handleClick("regB")}
        signals={[
          { name: "BI", active: !!(cw & CS.BI), direction: "in" },
        ]}
      />

      <ModuleBlock
        id="keyboard"
        label={MODULES.keyboard.label}
        x={MODULES.keyboard.x}
        y={MODULES.keyboard.y}
        width={MODULES.keyboard.w}
        height={MODULES.keyboard.h}
        active={false}
        selected={isSelected("keyboard")}
        onClick={() => handleClick("keyboard")}
      />

      <ModuleBlock
        id="output"
        label={MODULES.output.label}
        x={MODULES.output.x}
        y={MODULES.output.y}
        width={MODULES.output.w}
        height={MODULES.output.h}
        value={cpu.regOut}
        bits={8}
        active={isActive("output")}
        selected={isSelected("output")}
        onClick={() => handleClick("output")}
        signals={[
          { name: "OI", active: !!(cw & CS.OI), direction: "in" },
        ]}
        sublabel={cpu.regOut > 0 ? `= ${cpu.regOut}` : undefined}
      />

      {/* ── Flags display ────────────────────────────────────── */}
      <g>
        <FlagIndicator x={540} y={150} label="C" active={cpu.flagCarry} />
        <FlagIndicator x={565} y={150} label="Z" active={cpu.flagZero} />
      </g>

      {/* ── Bus data packet animation ─────────────────────────── */}
      <BusAnimation
        controlWord={cpu.controlWord}
        stepKey={`${cpu.cycleCount}-${cpu.tState}`}
      />

      {/* ── Halted overlay ───────────────────────────────────── */}
      {cpu.halted && (
        <text
          x={BUS_X}
          y={BUS_BOTTOM + 28}
          textAnchor="middle"
          fill="#ef4444"
          fontSize={10}
          fontFamily="'Fira Code', monospace"
          opacity={0.6}
        >
          HALTED
        </text>
      )}
    </svg>
  );
}

// ── Helper sub-components ───────────────────────────────────────

function BusArrow({
  x,
  y,
  active,
  direction,
}: {
  x: number;
  y: number;
  active: boolean;
  direction: "left" | "right";
}) {
  const d =
    direction === "right"
      ? `M${x - 4},${y - 3} L${x},${y} L${x - 4},${y + 3}`
      : `M${x + 4},${y - 3} L${x},${y} L${x + 4},${y + 3}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={active ? ACCENT : BUS_COLOR}
      strokeWidth={1}
      style={{ transition: "stroke 0.2s" }}
    />
  );
}

function FlagIndicator({
  x,
  y,
  label,
  active,
}: {
  x: number;
  y: number;
  label: string;
  active: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={18}
        height={14}
        rx={3}
        fill={active ? `${ACCENT}25` : "rgba(255,255,255,0.03)"}
        stroke={active ? ACCENT : "rgba(255,255,255,0.1)"}
        strokeWidth={0.5}
        style={{ transition: "fill 0.2s, stroke 0.2s" }}
      />
      <text
        x={x + 9}
        y={y + 10}
        textAnchor="middle"
        fill={active ? ACCENT : "rgba(255,255,255,0.2)"}
        fontSize={8}
        fontFamily="'Fira Code', monospace"
        fontWeight={600}
        style={{ transition: "fill 0.2s" }}
      >
        {label}
      </text>
    </g>
  );
}
