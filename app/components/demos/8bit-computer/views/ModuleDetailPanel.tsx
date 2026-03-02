import { useState } from "react";
import { Box, Chip, Collapse, Divider, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import {
  RegisterCircuit,
  AluCircuit,
  ClockCircuit,
  PcCircuit,
  IrCircuit,
  RamCircuit,
  ControlCircuit,
  KeyboardCircuit,
  OutputCircuit,
} from "./ModuleCircuitDiagrams";
import {
  type CpuState,
  type ModuleId,
  CS,
  CS_NAMES,
  OPCODE_NAMES,
  tStateCount,
  fetchLength,
} from "../engine/types";
import { disassemble } from "../engine/cpu";
import { getInstructionMicrocode } from "../engine/microcode";

const ACCENT = "#f97316";
const SECONDARY = "#00e5ff";
const MONO = "'Fira Code', monospace";

// ── Shared sub-components ───────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: MONO, mb: 0.25 }}>
      {children}
    </Typography>
  );
}

function LedRow({ label, value, bits = 8 }: { label: string; value: number; bits?: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)", width: 36, textAlign: "right" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: bits }, (_, i) => {
          const on = (value >> (bits - 1 - i)) & 1;
          return (
            <Box
              key={i}
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: on ? ACCENT : "rgba(255,255,255,0.06)",
                boxShadow: on ? `0 0 3px ${ACCENT}` : "none",
                transition: "background-color 0.15s",
              }}
            />
          );
        })}
      </Box>
      <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
        0x{value.toString(16).toUpperCase().padStart(bits <= 4 ? 1 : 2, "0")}
      </Typography>
      <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
        {value}
      </Typography>
    </Box>
  );
}

function SignalChip({ name, active }: { name: string; active: boolean }) {
  return (
    <Chip
      label={name}
      size="small"
      sx={{
        height: 18,
        fontSize: 9,
        fontFamily: MONO,
        bgcolor: active ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.03)",
        color: active ? ACCENT : "rgba(255,255,255,0.2)",
        border: active ? `1px solid ${ACCENT}40` : "1px solid rgba(255,255,255,0.06)",
      }}
    />
  );
}

function Sep() {
  return <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 1 }} />;
}

function toHex(v: number, pad = 2): string {
  return v.toString(16).toUpperCase().padStart(pad, "0");
}

// ── Per-module panels ───────────────────────────────────────────

function RegisterPanel({ cpu, reg }: { cpu: CpuState; reg: "A" | "B" }) {
  const val = reg === "A" ? cpu.regA : cpu.regB;
  const cw = cpu.controlWord;
  const sigIn = reg === "A" ? CS.AI : CS.BI;
  const sigOut = reg === "A" ? CS.AO : 0; // B has no bus output
  const sigInName = reg === "A" ? "AI" : "BI";
  const sigOutName = reg === "A" ? "AO" : null;

  return (
    <>
      <Label>VALUE</Label>
      <LedRow label={`Reg ${reg}`} value={val} />

      <Sep />
      <Label>D FLIP-FLOP CELLS</Label>
      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const bit = (val >> (7 - i)) & 1;
          return (
            <Box
              key={i}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0.5,
                border: `1px solid ${bit ? ACCENT + "60" : "rgba(255,255,255,0.08)"}`,
                bgcolor: bit ? `${ACCENT}15` : "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: MONO,
                fontSize: 11,
                color: bit ? ACCENT : "rgba(255,255,255,0.2)",
                transition: "all 0.15s",
              }}
            >
              {bit}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5, mt: 0.25 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <Box
            key={i}
            sx={{
              width: 28,
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 8,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            D{7 - i}
          </Box>
        ))}
      </Box>

      <Sep />
      <Label>SIGNALS</Label>
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
        <SignalChip name={sigInName} active={!!(cw & sigIn)} />
        {sigOutName && <SignalChip name={sigOutName} active={!!(cw & sigOut)} />}
      </Stack>
    </>
  );
}

function AluPanel({ cpu }: { cpu: CpuState }) {
  const cw = cpu.controlWord;
  const sub = !!(cw & CS.SU);
  const result = sub ? (cpu.regA - cpu.regB) & 0xff : (cpu.regA + cpu.regB) & 0xff;
  const rawResult = sub ? cpu.regA - cpu.regB : cpu.regA + cpu.regB;

  return (
    <>
      <Label>INPUTS</Label>
      <LedRow label="A" value={cpu.regA} />
      <LedRow label="B" value={cpu.regB} />

      <Sep />
      <Label>OPERATION</Label>
      <Typography sx={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.7)", mt: 0.25 }}>
        {cpu.regA} {sub ? "-" : "+"} {cpu.regB} = {result}
        {rawResult > 255 || rawResult < 0 ? " (overflow)" : ""}
      </Typography>

      <Sep />
      <Label>RESULT</Label>
      <LedRow label="ALU" value={result} />

      <Sep />
      <Label>FLAGS</Label>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        <Chip
          label={`Carry: ${cpu.flagCarry ? "1" : "0"}`}
          size="small"
          sx={{
            height: 20, fontSize: 10, fontFamily: MONO,
            bgcolor: cpu.flagCarry ? `${ACCENT}20` : "rgba(255,255,255,0.03)",
            color: cpu.flagCarry ? ACCENT : "rgba(255,255,255,0.3)",
          }}
        />
        <Chip
          label={`Zero: ${cpu.flagZero ? "1" : "0"}`}
          size="small"
          sx={{
            height: 20, fontSize: 10, fontFamily: MONO,
            bgcolor: cpu.flagZero ? `${ACCENT}20` : "rgba(255,255,255,0.03)",
            color: cpu.flagZero ? ACCENT : "rgba(255,255,255,0.3)",
          }}
        />
      </Stack>

      <Sep />
      <Label>SIGNALS</Label>
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
        <SignalChip name="EO" active={!!(cw & CS.EO)} />
        <SignalChip name="SU" active={!!(cw & CS.SU)} />
        <SignalChip name="FI" active={!!(cw & CS.FI)} />
      </Stack>
    </>
  );
}

function RamPanel({ cpu }: { cpu: CpuState }) {
  const cw = cpu.controlWord;
  const extended = cpu.ramSize === 256;
  const displaySize = Math.min(cpu.ramSize, 16);
  // Show 16 rows centered around MAR
  const startAddr = extended ? Math.max(0, Math.min(cpu.mar - 8, cpu.ramSize - 16)) : 0;

  return (
    <>
      <Label>ADDRESS (MAR)</Label>
      <LedRow label="MAR" value={cpu.mar} bits={extended ? 8 : 4} />
      <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
        {!!(cw & CS.RO) ? "Reading" : !!(cw & CS.RI) ? "Writing" : "Idle"}
        {" "}RAM[0x{toHex(cpu.mar, extended ? 2 : 1)}]
        {" = "}0x{toHex(cpu.ram[cpu.mar] ?? 0)}
      </Typography>

      <Sep />
      <Label>CONTENTS ({cpu.ramSize} bytes)</Label>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.25,
          mt: 0.5,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        {Array.from({ length: displaySize }, (_, idx) => {
          const i = startAddr + idx;
          const val = cpu.ram[i] ?? 0;
          const isMAR = i === cpu.mar;
          const isPC = i === cpu.pc && cpu.tState === 0;
          let decoded: string;
          if (extended && i % 2 === 0 && i + 1 < cpu.ramSize) {
            decoded = disassemble(val, cpu.ram[i + 1], cpu.ramSize);
          } else if (extended && i % 2 === 1) {
            decoded = "";
          } else {
            decoded = disassemble(val);
          }
          return (
            <Box
              key={i}
              sx={{
                fontFamily: MONO, fontSize: 9, px: 0.5, py: 0.2, borderRadius: 0.5,
                bgcolor: isMAR ? "rgba(249,115,22,0.12)" : isPC ? "rgba(0,229,255,0.08)" : "transparent",
                color: isMAR ? ACCENT : "rgba(255,255,255,0.45)",
              }}
            >
              <Box component="span" sx={{ color: "rgba(255,255,255,0.2)" }}>
                {toHex(i, extended ? 2 : 1)}:
              </Box>{" "}
              {toHex(val)}
              {decoded && (
                <Box component="span" sx={{ color: "rgba(255,255,255,0.18)", ml: 0.5, fontSize: 8 }}>
                  {decoded}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Sep />
      <Label>SIGNALS</Label>
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
        <SignalChip name="RO" active={!!(cw & CS.RO)} />
        <SignalChip name="RI" active={!!(cw & CS.RI)} />
      </Stack>
    </>
  );
}

function PcMarPanel({ cpu }: { cpu: CpuState }) {
  const cw = cpu.controlWord;
  const bits = cpu.ramSize === 256 ? 8 : 4;

  return (
    <>
      <Label>PROGRAM COUNTER</Label>
      <LedRow label="PC" value={cpu.pc} bits={bits} />
      <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.4)", mt: 0.25 }}>
        Next fetch at address 0x{toHex(cpu.pc, bits <= 4 ? 1 : 2)}
      </Typography>

      <Sep />
      <Label>MEMORY ADDRESS REGISTER</Label>
      <LedRow label="MAR" value={cpu.mar} bits={bits} />
      <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.4)", mt: 0.25 }}>
        Pointing to RAM[0x{toHex(cpu.mar, bits <= 4 ? 1 : 2)}] = 0x{toHex(cpu.ram[cpu.mar] ?? 0)}
      </Typography>

      <Sep />
      <Label>SIGNALS</Label>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
        <SignalChip name="CO" active={!!(cw & CS.CO)} />
        <SignalChip name="CE" active={!!(cw & CS.CE)} />
        <SignalChip name="J" active={!!(cw & CS.J)} />
        <SignalChip name="MI" active={!!(cw & CS.MI)} />
      </Stack>
    </>
  );
}

function IrPanel({ cpu }: { cpu: CpuState }) {
  const cw = cpu.controlWord;
  const extended = cpu.ramSize === 256;
  const opcode = (cpu.regIR >> 4) & 0x0f;
  const operand = extended ? cpu.regOperand : cpu.regIR & 0x0f;
  const opName = OPCODE_NAMES[opcode] ?? "???";

  return (
    <>
      <Label>INSTRUCTION REGISTER</Label>
      <LedRow label="IR" value={cpu.regIR} />
      {extended && <LedRow label="OPR" value={cpu.regOperand} />}

      <Sep />
      <Label>DECODED</Label>
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            Opcode:
          </Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: 12, color: SECONDARY }}>
            {opName} (0x{opcode.toString(16).toUpperCase()})
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            Operand:
          </Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: 12, color: SECONDARY }}>
            {operand} (0x{toHex(operand, extended ? 2 : 1)})
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
          {disassemble(cpu.regIR, extended ? cpu.regOperand : undefined, cpu.ramSize)}
        </Typography>
      </Stack>

      <Sep />
      <Label>SIGNALS</Label>
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
        <SignalChip name="II" active={!!(cw & CS.II)} />
        <SignalChip name="IO" active={!!(cw & CS.IO)} />
      </Stack>
    </>
  );
}

function ControlLogicPanel({ cpu }: { cpu: CpuState }) {
  const opcode = (cpu.regIR >> 4) & 0x0f;
  const opName = OPCODE_NAMES[opcode] ?? "???";
  const { ramSize } = cpu;
  const tCount = tStateCount(ramSize);
  const fLen = fetchLength(ramSize);
  const microcode = getInstructionMicrocode(
    opcode,
    { carry: cpu.flagCarry, zero: cpu.flagZero },
    ramSize,
  );

  return (
    <>
      <Label>CURRENT INSTRUCTION</Label>
      <Typography sx={{ fontFamily: MONO, fontSize: 12, color: SECONDARY }}>
        {disassemble(cpu.regIR, ramSize === 256 ? cpu.regOperand : undefined, ramSize)}
      </Typography>

      <Sep />
      <Label>MICROCODE TABLE</Label>
      <Box sx={{ mt: 0.5 }}>
        {microcode.map((word, t) => {
          const isActive = t === cpu.tState;
          const sigNames: string[] = [];
          for (let b = 0; b < 16; b++) {
            if (word & (1 << b)) sigNames.push(CS_NAMES[b]);
          }
          return (
            <Box
              key={t}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                py: 0.25,
                px: 0.5,
                borderRadius: 0.5,
                bgcolor: isActive ? "rgba(249,115,22,0.12)" : "transparent",
              }}
            >
              <Typography
                sx={{
                  fontFamily: MONO, fontSize: 9, width: 18,
                  color: isActive ? ACCENT : "rgba(255,255,255,0.25)",
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                T{t}
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO, fontSize: 9, width: 38,
                  color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
                }}
              >
                {t < fLen ? "FETCH" : "EXEC"}
              </Typography>
              <Typography
                sx={{
                  fontFamily: MONO, fontSize: 9, flex: 1,
                  color: isActive ? ACCENT : "rgba(255,255,255,0.3)",
                }}
              >
                {sigNames.length > 0 ? sigNames.join(" | ") : "—"}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Sep />
      <Label>ACTIVE CONTROL WORD</Label>
      <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.4)", mt: 0.25 }}>
        0x{cpu.controlWord.toString(16).toUpperCase().padStart(4, "0")}
      </Typography>
    </>
  );
}

function ClockPanel({ cpu }: { cpu: CpuState }) {
  const tCount = tStateCount(cpu.ramSize);
  const fLen = fetchLength(cpu.ramSize);

  return (
    <>
      <Label>CLOCK STATE</Label>
      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
        {Array.from({ length: tCount }, (_, i) => (
          <Box
            key={i}
            sx={{
              width: 26, height: 22, borderRadius: 0.5,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: MONO, fontSize: 9,
              bgcolor: cpu.halted
                ? "rgba(239,68,68,0.15)"
                : i === cpu.tState ? ACCENT : "rgba(255,255,255,0.04)",
              color: cpu.halted
                ? "rgba(239,68,68,0.6)"
                : i === cpu.tState ? "#000" : "rgba(255,255,255,0.25)",
              borderBottom: i < fLen ? "1px solid rgba(255,255,255,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            T{i}
          </Box>
        ))}
      </Box>

      <Sep />
      <Label>WAVEFORM</Label>
      <svg width="100%" viewBox="0 0 200 40" style={{ maxHeight: 40, display: "block", marginTop: 4 }}>
        {Array.from({ length: tCount }, (_, i) => {
          const segW = 200 / tCount;
          const x = i * segW;
          const high = i === cpu.tState;
          return (
            <g key={i}>
              <rect
                x={x + 1}
                y={high ? 2 : 20}
                width={segW - 2}
                height={high ? 18 : 18}
                rx={1}
                fill={high ? `${ACCENT}30` : "rgba(255,255,255,0.03)"}
              />
              {/* Rising/falling edges */}
              {i > 0 && (
                <line x1={x} y1={2} x2={x} y2={38} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
              )}
            </g>
          );
        })}
        {/* Square wave */}
        <polyline
          points={Array.from({ length: tCount }, (_, i) => {
            const segW = 200 / tCount;
            const x1 = i * segW;
            const x2 = (i + 1) * segW;
            const y = i === cpu.tState ? 6 : 34;
            const yPrev = (i > 0 && (i - 1) === cpu.tState) ? 6 : 34;
            return `${x1},${yPrev} ${x1},${y} ${x2},${y}`;
          }).join(" ")}
          fill="none"
          stroke={cpu.halted ? "#ef4444" : ACCENT}
          strokeWidth={1.5}
          opacity={0.6}
        />
      </svg>

      <Sep />
      <Label>STATUS</Label>
      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          Cycle: {cpu.cycleCount}
        </Typography>
        <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          T-state: T{cpu.tState} ({cpu.tState < fetchLength(cpu.ramSize) ? "FETCH" : "EXECUTE"})
        </Typography>
        {cpu.halted && (
          <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "#ef4444" }}>
            HALTED
          </Typography>
        )}
      </Stack>
    </>
  );
}

function OutputPanel({ cpu }: { cpu: CpuState }) {
  const cw = cpu.controlWord;

  return (
    <>
      <Label>OUTPUT REGISTER</Label>
      <LedRow label="OUT" value={cpu.regOut} />
      <Typography sx={{ fontFamily: MONO, fontSize: 14, color: SECONDARY, mt: 0.5 }}>
        = {cpu.regOut}
      </Typography>

      <Sep />
      <Label>HISTORY ({cpu.outputHistory.length} values)</Label>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
        {cpu.outputHistory.length === 0 ? (
          <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            No output yet
          </Typography>
        ) : (
          cpu.outputHistory.map((val, i) => (
            <Chip
              key={i}
              label={`${val}`}
              size="small"
              sx={{
                height: 18, fontSize: 9, fontFamily: MONO,
                bgcolor: i === cpu.outputHistory.length - 1 ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.03)",
                color: i === cpu.outputHistory.length - 1 ? SECONDARY : "rgba(255,255,255,0.35)",
              }}
            />
          ))
        )}
      </Stack>

      <Sep />
      <Label>SIGNALS</Label>
      <SignalChip name="OI" active={!!(cw & CS.OI)} />
    </>
  );
}

function KeyboardPanel() {
  return (
    <>
      <Label>KEYBOARD INPUT</Label>
      <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.35)", mt: 0.5 }}>
        Keyboard input is not yet connected in this simulator.
      </Typography>
      <Typography sx={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.2)", mt: 1 }}>
        The physical build used a disassembled Logitech MK270R with LM339 comparator-based
        analog/digital decoding and a 3D-printed wire guide.
      </Typography>
    </>
  );
}

// ── Module titles ───────────────────────────────────────────────

const MODULE_TITLES: Record<ModuleId, string> = {
  regA: "Register A",
  regB: "Register B",
  alu: "ALU",
  ram: "RAM",
  pc: "Program Counter",
  mar: "Memory Address Register",
  ir: "Instruction Register",
  control: "Control Logic",
  clock: "Clock",
  keyboard: "Keyboard Input",
  output: "Output Display",
};

const MODULE_EXPLANATIONS: Record<ModuleId, string> = {
  regA: "The primary accumulator. Stores one operand for ALU operations. Built from 8 D flip-flops that latch data from the bus on the AI signal\u2019s rising edge.",
  regB: "The secondary operand register. Feeds directly into the ALU\u2019s B input. Unlike Register A, it cannot output back to the bus.",
  alu: "Arithmetic Logic Unit. Combines Register A and B using addition or subtraction (two\u2019s complement). The EO signal puts the result on the bus. Also sets the Carry and Zero flags.",
  ram: "Random Access Memory. Stores both program instructions and data in the same address space. The MAR selects which address to read (RO) or write (RI).",
  pc: "Tracks the address of the next instruction to fetch. Increments each fetch cycle (CE) and can be loaded directly from the bus for jumps (J).",
  mar: "Memory Address Register. Holds the address that RAM reads from or writes to. Loaded from the bus via MI \u2014 acts as the bridge between the data bus and the address bus.",
  ir: "Holds the current instruction being executed. The upper 4 bits (opcode) feed into Control Logic to determine which signals to activate. The lower 4 bits (operand) can be output to the bus via IO.",
  control: "The brain of the CPU. Takes the opcode from IR and the current T-state, then looks up the control word in microcode ROM. Each bit of the 16-bit control word activates a specific signal (MI, RO, AI, etc.).",
  clock: "Generates the timing signal that drives each T-state step. Each instruction takes multiple T-states: a fetch cycle followed by an execute cycle.",
  keyboard: "Input peripheral (placeholder). Would allow external data to be loaded onto the bus.",
  output: "Latches a value from the bus when the OI signal is active and displays it as a decimal number. This is how the computer communicates results to the user.",
};

// ── Main panel ──────────────────────────────────────────────────

interface ModuleDetailPanelProps {
  moduleId: ModuleId;
  cpu: CpuState;
  onClose: () => void;
}

const MODULE_CIRCUITS: Record<ModuleId, React.ComponentType> = {
  regA: RegisterCircuit,
  regB: RegisterCircuit,
  alu: AluCircuit,
  ram: RamCircuit,
  pc: PcCircuit,
  mar: RegisterCircuit,
  ir: IrCircuit,
  control: ControlCircuit,
  clock: ClockCircuit,
  keyboard: KeyboardCircuit,
  output: OutputCircuit,
};

export function ModuleDetailPanel({ moduleId, cpu, onClose }: ModuleDetailPanelProps) {
  const [showInfo, setShowInfo] = useState(true);
  const [showCircuit, setShowCircuit] = useState(true);

  const CircuitDiagram = MODULE_CIRCUITS[moduleId];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{ fontFamily: MONO, fontSize: 12, color: SECONDARY, fontWeight: 600 }}>
            {MODULE_TITLES[moduleId]}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setShowInfo((v) => !v)}
            sx={{
              p: 0.25,
              color: showInfo ? SECONDARY : "rgba(255,255,255,0.25)",
              "&:hover": { color: SECONDARY },
            }}
            title="Module description"
          >
            <InfoOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setShowCircuit((v) => !v)}
            sx={{
              p: 0.25,
              color: showCircuit ? "#fbbf24" : "rgba(255,255,255,0.25)",
              "&:hover": { color: "#fbbf24" },
            }}
            title="Circuit schematic"
          >
            <ElectricalServicesIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: "rgba(255,255,255,0.3)", p: 0.25 }}>
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>

      <Collapse in={showInfo}>
        <Box
          sx={{
            mb: 1.5,
            pl: 1,
            borderLeft: `2px solid ${SECONDARY}40`,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
            }}
          >
            {MODULE_EXPLANATIONS[moduleId]}
          </Typography>
        </Box>
      </Collapse>

      <Collapse in={showCircuit}>
        <Box
          sx={{
            mb: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: "rgba(251,191,36,0.04)",
            border: "1px solid rgba(251,191,36,0.15)",
          }}
        >
          <Typography
            sx={{
              fontSize: 9,
              color: "rgba(251,191,36,0.6)",
              fontFamily: MONO,
              mb: 0.75,
            }}
          >
            CIRCUIT SCHEMATIC
          </Typography>
          <CircuitDiagram />
        </Box>
      </Collapse>

      {moduleId === "regA" && <RegisterPanel cpu={cpu} reg="A" />}
      {moduleId === "regB" && <RegisterPanel cpu={cpu} reg="B" />}
      {moduleId === "alu" && <AluPanel cpu={cpu} />}
      {moduleId === "ram" && <RamPanel cpu={cpu} />}
      {moduleId === "pc" && <PcMarPanel cpu={cpu} />}
      {moduleId === "mar" && <PcMarPanel cpu={cpu} />}
      {moduleId === "ir" && <IrPanel cpu={cpu} />}
      {moduleId === "control" && <ControlLogicPanel cpu={cpu} />}
      {moduleId === "clock" && <ClockPanel cpu={cpu} />}
      {moduleId === "keyboard" && <KeyboardPanel />}
      {moduleId === "output" && <OutputPanel cpu={cpu} />}
    </Box>
  );
}
