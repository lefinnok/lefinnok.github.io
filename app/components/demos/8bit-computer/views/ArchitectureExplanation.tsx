import { useEffect, useState, Fragment } from "react";
import {
  Box,
  Typography,
  Divider,
  Link,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// ── Colors ──────────────────────────────────────────────────────

const ACCENT = "#00e5ff";
const ORANGE = "#f97316";
const MONO = "'Fira Code', monospace";

// ── Pipeline steps & slide mapping ──────────────────────────────

const PIPELINE = [
  { key: "overview", label: "Overview" },
  { key: "gates", label: "Gates" },
  { key: "modules", label: "Modules" },
  { key: "execution", label: "Execution" },
  { key: "refs", label: "Refs" },
] as const;

interface SlideInfo {
  step: number;
  title: string;
}

const SLIDES: SlideInfo[] = [
  { step: 0, title: "Project Abstract" },
  { step: 0, title: "Modified SAP-1 Architecture" },
  { step: 1, title: "Transistor Logic Gates" },
  { step: 1, title: "D Flip-Flop & Edge Detection" },
  { step: 2, title: "Clock Circuit" },
  { step: 2, title: "Registers & ALU" },
  { step: 2, title: "Keyboard & Output" },
  { step: 3, title: "Control Logic & Microcode" },
  { step: 3, title: "Fetch-Execute Cycle" },
  { step: 3, title: "Instruction Set" },
  { step: 4, title: "References" },
];

// ── Shared layout ───────────────────────────────────────────────

function SlidePair({
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
        alignItems: "start",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {visual}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="code"
      sx={{
        fontFamily: MONO,
        fontSize: 11,
        bgcolor: "rgba(255,255,255,0.06)",
        px: 0.75,
        py: 0.25,
        borderRadius: 0.5,
        color: ACCENT,
      }}
    >
      {children}
    </Box>
  );
}

function SignalChip({ label }: { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: MONO,
        fontSize: 10,
        bgcolor: "rgba(249,115,22,0.15)",
        color: ORANGE,
        border: "1px solid rgba(249,115,22,0.3)",
        px: 0.75,
        py: 0.15,
        borderRadius: 0.5,
        display: "inline-block",
        mx: 0.25,
      }}
    >
      {label}
    </Box>
  );
}

// ── Pipeline indicator ──────────────────────────────────────────

function PipelineIndicator({
  active,
  onStep,
}: {
  active: number;
  onStep: (i: number) => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      sx={{ mb: 3, gap: { xs: 0.5, sm: 0.75 } }}
    >
      {PIPELINE.map((step, i) => (
        <Fragment key={step.key}>
          <Box
            onClick={() => {
              const idx = SLIDES.findIndex((s) => s.step === i);
              if (idx >= 0) onStep(idx);
            }}
            sx={{
              px: { xs: 1, sm: 1.5 },
              py: 0.75,
              border: "1px solid",
              borderColor: i === active ? ACCENT : "divider",
              borderRadius: 1,
              cursor: "pointer",
              bgcolor: i === active ? "rgba(0,229,255,0.08)" : "transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: ACCENT,
                bgcolor: "rgba(0,229,255,0.04)",
              },
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: i === active ? ACCENT : "text.secondary",
                fontSize: { xs: "0.6rem", sm: "0.7rem" },
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </Typography>
          </Box>
          {i < PIPELINE.length - 1 && (
            <Typography
              sx={{
                color: i < active ? ACCENT : "divider",
                mx: 0.25,
                fontSize: "0.75rem",
                userSelect: "none",
              }}
            >
              {"\u2192"}
            </Typography>
          )}
        </Fragment>
      ))}
    </Stack>
  );
}

// ── SVG: SAP-1 Architecture Diagram ─────────────────────────────

function ArchDiagram() {
  const modules = [
    { label: "Register A", y: 10, color: "#00e5ff" },
    { label: "ALU", y: 60, color: "#f97316" },
    { label: "Register B", y: 110, color: "#00e5ff" },
    { label: "RAM (16\u00d78)", y: 10, color: "#4ade80", col: 1 },
    { label: "MAR / PC", y: 60, color: "#fbbf24", col: 1 },
    { label: "Instruction Reg", y: 110, color: "#a78bfa", col: 1 },
    { label: "Control Logic", y: 160, color: "#f472b6", col: 1 },
    { label: "Clock", y: 160, color: "#94a3b8", col: 0 },
    { label: "Output", y: 210, color: "#00e5ff", col: 0 },
    { label: "Keyboard", y: 210, color: "#94a3b8", col: 1 },
  ];

  return (
    <svg viewBox="0 0 320 260" width="100%" style={{ maxWidth: 320 }}>
      {/* Bus backbone */}
      <line x1={160} y1={5} x2={160} y2={255} stroke={ORANGE} strokeWidth={2} opacity={0.4} />
      <text x={160} y={4} fill={ORANGE} fontSize={8} fontFamily={MONO} textAnchor="middle" opacity={0.7}>
        8-BIT BUS
      </text>

      {modules.map((m, i) => {
        const col = m.col ?? 0;
        const x = col === 0 ? 30 : 190;
        const w = 100;
        const h = 36;
        return (
          <g key={i}>
            <rect
              x={x}
              y={m.y}
              width={w}
              height={h}
              rx={4}
              fill="rgba(255,255,255,0.04)"
              stroke={m.color}
              strokeWidth={1}
              opacity={0.8}
            />
            <text
              x={x + w / 2}
              y={m.y + h / 2 + 4}
              fill={m.color}
              fontSize={9}
              fontFamily={MONO}
              textAnchor="middle"
            >
              {m.label}
            </text>
            {/* Bus connection line */}
            <line
              x1={col === 0 ? x + w : x}
              y1={m.y + h / 2}
              x2={160}
              y2={m.y + h / 2}
              stroke={m.color}
              strokeWidth={0.75}
              opacity={0.3}
              strokeDasharray="3,2"
            />
          </g>
        );
      })}
    </svg>
  );
}

// ── SVG: Logic gate diagrams ────────────────────────────────────

function InverterDiagram() {
  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      <text x={100} y={14} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily={MONO} textAnchor="middle">
        NPN Inverter (NOT gate)
      </text>
      {/* Transistor symbol simplified */}
      <line x1={40} y1={60} x2={80} y2={60} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
      <text x={30} y={64} fill={ACCENT} fontSize={10} fontFamily={MONO} textAnchor="end">D</text>
      {/* Base */}
      <line x1={80} y1={40} x2={80} y2={80} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
      {/* Collector */}
      <line x1={80} y1={45} x2={110} y2={30} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
      <line x1={110} y1={30} x2={110} y2={20} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
      <text x={116} y={22} fill="#fbbf24" fontSize={9} fontFamily={MONO}>5V+</text>
      {/* Emitter */}
      <line x1={80} y1={75} x2={110} y2={90} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
      <line x1={110} y1={90} x2={110} y2={105} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
      <text x={116} y={108} fill="rgba(255,255,255,0.4)" fontSize={9} fontFamily={MONO}>GND</text>
      {/* Resistor to output */}
      <line x1={110} y1={30} x2={140} y2={30} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
      <rect x={140} y={26} width={20} height={8} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.75} rx={1} />
      <text x={150} y={48} fill="rgba(255,255,255,0.3)" fontSize={7} fontFamily={MONO} textAnchor="middle">R</text>
      <line x1={160} y1={30} x2={180} y2={30} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
      <text x={185} y={34} fill={ACCENT} fontSize={10} fontFamily={MONO}>Q</text>
      {/* Truth table */}
      <text x={30} y={105} fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily={MONO}>D=0 → Q=1</text>
      <text x={30} y={115} fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily={MONO}>D=1 → Q=0</text>
    </svg>
  );
}

// ── SVG: Fetch-Execute cycle ────────────────────────────────────

function FetchExecuteDiagram() {
  const steps = [
    { label: "T0: CO|MI", desc: "PC → MAR", color: "#00e5ff" },
    { label: "T1: RO|II|CE", desc: "RAM → IR, PC++", color: "#00e5ff" },
    { label: "T2", desc: "Execute step 1", color: ORANGE },
    { label: "T3", desc: "Execute step 2", color: ORANGE },
    { label: "T4", desc: "Execute step 3", color: ORANGE },
  ];

  const boxW = 64;
  const spacing = 78;

  return (
    <svg viewBox="0 0 400 100" width="100%" style={{ maxWidth: 400 }}>
      {steps.map((s, i) => {
        const x = i * spacing + 10;
        const isFetch = i < 2;
        return (
          <g key={i}>
            <rect
              x={x}
              y={10}
              width={boxW}
              height={50}
              rx={4}
              fill={isFetch ? "rgba(0,229,255,0.08)" : "rgba(249,115,22,0.08)"}
              stroke={s.color}
              strokeWidth={1}
              opacity={0.8}
            />
            <text x={x + boxW / 2} y={32} fill={s.color} fontSize={8} fontFamily={MONO} textAnchor="middle">
              {s.label}
            </text>
            <text x={x + boxW / 2} y={50} fill="rgba(255,255,255,0.5)" fontSize={7} fontFamily={MONO} textAnchor="middle">
              {s.desc}
            </text>
            {i < steps.length - 1 && (
              <text x={x + boxW + 3} y={38} fill="rgba(255,255,255,0.3)" fontSize={10}>→</text>
            )}
          </g>
        );
      })}
      {/* Labels */}
      <rect x={10} y={70} width={142} height={18} rx={3} fill="rgba(0,229,255,0.06)" stroke={ACCENT} strokeWidth={0.5} />
      <text x={81} y={83} fill={ACCENT} fontSize={8} fontFamily={MONO} textAnchor="middle">FETCH (universal)</text>
      <rect x={166} y={70} width={220} height={18} rx={3} fill="rgba(249,115,22,0.06)" stroke={ORANGE} strokeWidth={0.5} />
      <text x={276} y={83} fill={ORANGE} fontSize={8} fontFamily={MONO} textAnchor="middle">EXECUTE (per instruction)</text>
    </svg>
  );
}

// ── SVG: Instruction set table ──────────────────────────────────

function InstructionTable() {
  const instrs = [
    { op: "0000", mn: "NOP", desc: "No operation" },
    { op: "0001", mn: "LDA", desc: "A = RAM[addr]" },
    { op: "0010", mn: "ADD", desc: "A = A + RAM[addr]" },
    { op: "0011", mn: "SUB", desc: "A = A - RAM[addr]" },
    { op: "0100", mn: "STA", desc: "RAM[addr] = A" },
    { op: "0101", mn: "LDI", desc: "A = immediate" },
    { op: "0110", mn: "JMP", desc: "PC = addr" },
    { op: "0111", mn: "JC", desc: "Jump if carry" },
    { op: "1000", mn: "JZ", desc: "Jump if zero" },
    { op: "1110", mn: "OUT", desc: "Display A" },
    { op: "1111", mn: "HLT", desc: "Halt clock" },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto auto 1fr",
        gap: 0.25,
        fontFamily: MONO,
        fontSize: 11,
      }}
    >
      {/* Header */}
      <Box sx={{ color: "rgba(255,255,255,0.3)", fontSize: 9, pb: 0.5 }}>OPCODE</Box>
      <Box sx={{ color: "rgba(255,255,255,0.3)", fontSize: 9, pb: 0.5 }}>MNEM</Box>
      <Box sx={{ color: "rgba(255,255,255,0.3)", fontSize: 9, pb: 0.5 }}>OPERATION</Box>
      {instrs.map((inst) => (
        <Fragment key={inst.mn}>
          <Box sx={{ color: "rgba(255,255,255,0.4)", pr: 1.5 }}>{inst.op}</Box>
          <Box sx={{ color: ACCENT, pr: 1.5, fontWeight: 600 }}>{inst.mn}</Box>
          <Box sx={{ color: "rgba(255,255,255,0.6)" }}>{inst.desc}</Box>
        </Fragment>
      ))}
    </Box>
  );
}

// ── Slides ──────────────────────────────────────────────────────

function Slide0() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This project documents the design and construction of an <strong>8-bit breadboard computer</strong> built
        primarily from <strong>NPN bipolar junction transistors</strong> (BC548B), completed between April and July 2020.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Inspired by Ben Eater's "Build an 8-bit computer from scratch" video series and the
        SAP-1 (Simple As Possible) architecture from Malvino & Brown's{" "}
        <em>Digital Computer Electronics</em>, the project set out to build a working computer using the
        fewest integrated circuits possible — constructing logic gates, registers, and an ALU from
        individual transistors.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The primary goal was to <strong>deeply understand how a computer works</strong> at the most
        fundamental electronic level. The physical build validated each module individually, but stopped
        at final assembly due to breadboard resistance limitations on the data bus.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This interactive simulator brings the full architecture to life — letting you explore
        the fetch-decode-execute cycle at the T-state level, inspect each module's live state,
        and write and run assembly programs.
      </Typography>
    </Box>
  );
}

function Slide1() {
  return (
    <SlidePair visual={<ArchDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The architecture is a <strong>modified SAP-1</strong> with 10 modules connected via a shared
        8-bit data bus. Each instruction is encoded as a single byte: <strong>4-bit opcode</strong> (upper nibble)
        + <strong>4-bit operand</strong> (lower nibble).
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Key modifications from the standard SAP-1 include a custom keyboard input using LM339 comparators
        for analog decoding of a key matrix, and an innovative <strong>11-transistor ALU</strong> that uses
        voltage-dependent analog behavior instead of pure digital logic.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The simulator also supports a <strong>256-byte extended mode</strong> with 8-bit addressing
        and 2-byte instructions, enabling more complex programs like multiplication via loops.
      </Typography>
    </SlidePair>
  );
}

function Slide2() {
  return (
    <SlidePair visual={<InverterDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Every logic gate in the physical computer is built from <strong>NPN transistors</strong>.
        The fundamental building block is the <strong>inverter</strong> (NOT gate) — a single transistor
        with a pull-up resistor.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        When the base receives a HIGH signal, the transistor saturates and shorts the output to ground (Q=0).
        When LOW, no current flows and the resistor pulls the output HIGH (Q=1).
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Initial attempts used <strong>buffers</strong>, but voltage from one input could bleed
        through to the output regardless of the other — making AND gates impossible.
        Switching to inverters solved this: two inverters in series form a <strong>NAND gate</strong>,
        add one more inverter to get an AND gate.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        A 2-input NOR gate requires only <strong>2 transistors</strong> (vs. 3 for an AND gate),
        making it the preferred choice for building SR latches in the register design.
      </Typography>
    </SlidePair>
  );
}

function Slide3() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each 1-bit register is a <strong>D flip-flop</strong> composed of three sub-circuits:
      </Typography>
      <Box component="ol" sx={{ pl: 2.5, mb: 2, "& li": { mb: 1 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong style={{ color: ACCENT }}>NOR SR Latch</strong> — stores one bit using
          two cross-coupled NOR gates (2 transistors each). SET and RESET inputs control the state.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong style={{ color: ACCENT }}>Edge Detector</strong> — generates a brief pulse on
          the rising clock edge using a capacitor + resistor + diode circuit. This was the first
          original circuit design in the project, requiring custom modifications to handle capacitor
          discharge issues.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong style={{ color: ACCENT }}>Enable Circuit</strong> — two AND gates that gate
          the data and clock signals. A solid-state relay enables/disables clock pulses for load control.
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Eight D flip-flops in parallel, with shared CLK and load-enable signals, form one
        8-bit register. Load-out enablers (AND gate arrays) control when the register outputs to the bus.
      </Typography>
    </Box>
  );
}

function Slide4() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The <strong>clock circuit</strong> is based on an <strong>astable multivibrator</strong> —
        two transistors cross-coupled through capacitors that alternate charging and discharging,
        producing a continuous square wave at approximately <strong>2 Hz</strong>.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The period is determined by the RC time constant. With 10k{"\u2126"} resistors and 33{"\u00b5"}F
        capacitors, the charging time from -0.670V to the 0.675V base-emitter threshold gives{" "}
        <strong>T {"\u2248"} 0.507s</strong>, yielding <strong>f {"\u2248"} 1.97 Hz</strong>.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        An early problem: the clock worked with discrete transistor circuits but failed with IC
        components. Investigation revealed the output wasn't cleanly switching — voltage fluctuated
        0.5-1V instead of reaching true 0V. Borrowing from the 555 timer design, an{" "}
        <strong>SR latch</strong> was added to produce discrete HIGH/LOW output, and a{" "}
        <strong>grounding transistor</strong> ensured clean 0V when LOW.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        In this simulator, the clock is abstracted as a step button or an adjustable-speed auto-run timer.
      </Typography>
    </Box>
  );
}

function Slide5() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <strong>Registers A & B</strong> are identical 8-bit registers built from D flip-flops.
        Register A serves as the primary accumulator, while Register B feeds directly into the ALU.
      </Typography>
      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The <strong>ALU</strong> is the most innovative module — a novel <strong>11-transistor
        voltage-dependent full adder</strong>. Instead of building a conventional full adder from
        XOR gates (which would need 7+ inverters each), it exploits the analog properties of
        transistors:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2, "& li": { mb: 0.75 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Three input transistors wired in <strong>parallel</strong> act as a variable resistance
          circuit — more HIGH inputs = lower resistance
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          A <strong>voltage divider</strong> separates the four possible input-count states
          (0, 1, 2, or 3 HIGH inputs) into distinct voltage levels
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Downstream transistors saturate only when their threshold is exceeded, producing the
          correct sum and carry outputs
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        An 8-input NAND gate detects when the result is zero (Zero flag), and the carry output
        of the last full adder serves as the Carry flag. Subtraction uses two's complement.
      </Typography>
    </Box>
  );
}

function Slide6() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The <strong>keyboard input</strong> was the most challenging module. A Logitech MK270R
        Bluetooth keyboard was disassembled to access its key matrix — two layers of etched
        plastic sheets (11 + 12 pins) separated by a spacer layer.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The key insight: one axis uses <strong>analog signals</strong> via precision voltage dividers
        (potentiometers), while the other uses digital. <strong>LM339 quad op-amp comparators</strong> decode
        the analog axis, producing a cumulative output that identifies which row was pressed.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A custom <strong>3D-printed wire guide</strong> (modeled in Blender) was manufactured through
        multiple iterations to connect bare copper wires to the plastic sheets with the required
        micrometer-level precision.
      </Typography>
      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
      <Typography variant="body2" color="text.secondary">
        The <strong>output display</strong> latches a value from the bus when the OI signal activates.
        In the physical computer, this drives LED arrays. In the simulator, output values are shown
        in both decimal and hexadecimal with a history log.
      </Typography>
    </Box>
  );
}

function Slide7() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <strong>Control Logic</strong> is implemented using <strong>AT28C16-15PC EEPROM</strong> chips
        (2K addresses, 8-bit data). Rather than building a complex combinational logic circuit from
        transistors, the microcode is stored as a lookup table in the EEPROM — input the opcode and
        T-state, get back the control word.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each control word is a <strong>16-bit bitmask</strong> where each bit activates a specific
        signal:
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {["HLT", "MI", "RI", "RO", "IO", "II", "AI", "AO", "EO", "SU", "BI", "OI", "CE", "CO", "J", "FI"].map((s) => (
          <SignalChip key={s} label={s} />
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        To program the EEPROMs, a D flip-flop register was converted into a shift register and
        connected to an Arduino. Timing issues with breadboard components caused data bits to jump
        randomly, so a 4-bit counter with a binary-to-decimal decoder was added to clock each
        flip-flop sequentially.
      </Typography>
    </Box>
  );
}

function Slide8() {
  return (
    <SlidePair visual={<FetchExecuteDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Every instruction executes over <strong>5 clock cycles</strong> (T-states).
        The first two are the universal <strong>fetch cycle</strong>:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2, "& li": { mb: 0.75 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>T0</strong>: <SignalChip label="CO" /> <SignalChip label="MI" /> —
          Program Counter outputs its address, MAR latches it
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>T1</strong>: <SignalChip label="RO" /> <SignalChip label="II" /> <SignalChip label="CE" /> —
          RAM outputs the instruction byte, IR latches it, PC increments
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        T2-T4 form the <strong>execute cycle</strong>, determined by the opcode now stored in IR.
        For example, <Code>LDA 9</Code> (load from address 9):
      </Typography>
      <Box component="ul" sx={{ pl: 2, "& li": { mb: 0.5 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>T2</strong>: <SignalChip label="IO" /> <SignalChip label="MI" /> — IR outputs operand (9) to MAR
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>T3</strong>: <SignalChip label="RO" /> <SignalChip label="AI" /> — RAM[9] outputs to Register A
        </Typography>
      </Box>
    </SlidePair>
  );
}

function Slide9() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The instruction set uses a <strong>4-bit opcode</strong> (upper nibble) with a 4-bit operand
        (lower nibble), giving 16 possible instructions:
      </Typography>
      <Box sx={{ mb: 2, overflow: "auto" }}>
        <InstructionTable />
      </Box>
      <Typography variant="body2" color="text.secondary">
        In the <strong>256-byte extended mode</strong>, the instruction format changes to two bytes:
        the first byte is the opcode (full 8 bits), and the second byte is the operand (8-bit address).
        This extends the address space from 16 to 256 bytes and the fetch cycle from 2 to 4 T-states.
      </Typography>
    </Box>
  );
}

function Slide10() {
  const refs = [
    {
      text: 'Malvino, A. P. & Brown, J. A. (1999). Digital Computer Electronics. 3rd Edition. McGraw-Hill.',
      note: "SAP-1 architecture (p.140-141)",
    },
    {
      text: 'Eater, B. (2016). "Build an 8-bit computer from scratch." YouTube video series.',
      url: "https://www.youtube.com/playlist?list=PLowKtXNTBypGqImE405J2565dvjafglHU",
      tag: "YouTube",
    },
    {
      text: "Kwok, C. L. (2020). 8-Bit Breadboard Computer Project Report. April\u2013July 2020.",
      note: "Original project report",
    },
    {
      text: "Fairchild Semiconductor (1997). BC548B NPN Transistor Datasheet.",
      note: "Base-emitter voltage 580\u2013770 mV",
    },
    {
      text: "Sangosanya, Belton, & Bigwood (2005). Digital logic gate design using transistors.",
      note: "Inverter and buffer circuits",
    },
  ];

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This project and simulator draw on the following references:
      </Typography>
      <Box component="ol" sx={{ pl: 2.5, m: 0, "& li": { mb: 1.5 } }}>
        {refs.map((r, i) => (
          <Typography key={i} component="li" variant="body2" color="text.secondary">
            {r.text}{" "}
            {r.url ? (
              <Link href={r.url} target="_blank" rel="noopener noreferrer" sx={{ color: ACCENT }}>
                {r.tag}
              </Link>
            ) : r.note ? (
              <Box component="span" sx={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                — {r.note}
              </Box>
            ) : null}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

const SLIDE_COMPONENTS = [
  Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10,
];

// ── Main dialog ─────────────────────────────────────────────────

export function ArchitectureExplanation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open) setIdx(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setIdx((s) => Math.min(s + 1, SLIDES.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setIdx((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const SlideContent = SLIDE_COMPONENTS[idx];
  const slide = SLIDES[idx];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          backgroundImage: "none",
          border: fullScreen ? "none" : "1px solid",
          borderColor: "divider",
          maxHeight: fullScreen ? "100%" : "90vh",
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 4 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5">How It Works</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              8-bit breadboard computer — transistor-level SAP-1 architecture
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Pipeline indicator */}
        <PipelineIndicator
          active={slide.step}
          onStep={(slideIdx) => setIdx(slideIdx)}
        />

        {/* Slide title */}
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontSize: "0.8rem" }}
          >
            {idx + 1}/{SLIDES.length}
          </Typography>
          <Typography variant="h6">{slide.title}</Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Slide content */}
        <Box
          key={idx}
          sx={{
            flex: 1,
            overflow: "auto",
            animation: "slideIn 0.25s ease",
            "@keyframes slideIn": {
              from: { opacity: 0, transform: "translateY(6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <SlideContent />
        </Box>

        {/* Navigation */}
        <Divider sx={{ mt: 3, mb: 2 }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            onClick={() => setIdx((s) => s - 1)}
            disabled={idx === 0}
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Back
          </Button>

          <Stack direction="row" spacing={0.75}>
            {SLIDES.map((_, i) => (
              <Box
                key={i}
                onClick={() => setIdx(i)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: i === idx ? ACCENT : "divider",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </Stack>

          <Button
            onClick={() => setIdx((s) => s + 1)}
            disabled={idx === SLIDES.length - 1}
            endIcon={<ArrowForwardIcon />}
            size="small"
            sx={{
              color: idx < SLIDES.length - 1 ? ACCENT : "text.secondary",
            }}
          >
            Next
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
