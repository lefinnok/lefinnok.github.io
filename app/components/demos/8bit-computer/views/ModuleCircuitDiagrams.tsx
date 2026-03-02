/**
 * Simplified circuit schematics for each module, based on the original
 * 8-bit breadboard computer project report (April–July 2020).
 * These are block-level diagrams showing the key sub-circuits.
 */

const ACCENT = "#00e5ff";
const ORANGE = "#f97316";
const DIM = "rgba(255,255,255,0.35)";
const WIRE = "rgba(255,255,255,0.25)";
const BG = "rgba(255,255,255,0.03)";
const MONO = "'Fira Code', monospace";

// ── Shared helpers ──────────────────────────────────────────────

function Block({
  x, y, w, h, label, color = ACCENT, sublabel,
}: {
  x: number; y: number; w: number; h: number;
  label: string; color?: string; sublabel?: string;
}) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx={3}
        fill={BG} stroke={color} strokeWidth={0.75} opacity={0.8}
      />
      <text
        x={x + w / 2} y={y + h / 2 + (sublabel ? -2 : 3)}
        textAnchor="middle" fill={color} fontSize={7} fontFamily={MONO}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={x + w / 2} y={y + h / 2 + 9}
          textAnchor="middle" fill={DIM} fontSize={5.5} fontFamily={MONO}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Wire({ x1, y1, x2, y2, color = WIRE }: {
  x1: number; y1: number; x2: number; y2: number; color?: string;
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.75} />;
}

function Arrow({ x1, y1, x2, y2, color = WIRE }: {
  x1: number; y1: number; x2: number; y2: number; color?: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 4;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.75} />
      <path
        d={`M${x2},${y2} L${x2 - headLen * Math.cos(angle - 0.4)},${y2 - headLen * Math.sin(angle - 0.4)} M${x2},${y2} L${x2 - headLen * Math.cos(angle + 0.4)},${y2 - headLen * Math.sin(angle + 0.4)}`}
        stroke={color} strokeWidth={0.75} fill="none"
      />
    </g>
  );
}

function SigLabel({ x, y, text, color = DIM }: {
  x: number; y: number; text: string; color?: string;
}) {
  return (
    <text x={x} y={y} fill={color} fontSize={6} fontFamily={MONO} textAnchor="middle">
      {text}
    </text>
  );
}

function Caption({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} fill="rgba(255,255,255,0.2)" fontSize={5.5} fontFamily={MONO} textAnchor="middle" fontStyle="italic">
      {text}
    </text>
  );
}

function Transistor({ x, y, label, color = DIM }: {
  x: number; y: number; label?: string; color?: string;
}) {
  return (
    <g>
      {/* Base line */}
      <line x1={x - 6} y1={y} x2={x} y2={y} stroke={color} strokeWidth={0.75} />
      {/* Vertical bar */}
      <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={color} strokeWidth={1} />
      {/* Collector */}
      <line x1={x} y1={y - 4} x2={x + 8} y2={y - 8} stroke={color} strokeWidth={0.75} />
      {/* Emitter with arrow */}
      <line x1={x} y1={y + 4} x2={x + 8} y2={y + 8} stroke={color} strokeWidth={0.75} />
      <path
        d={`M${x + 6},${y + 5} L${x + 8},${y + 8} L${x + 4},${y + 7}`}
        fill={color} stroke="none"
      />
      {label && (
        <text x={x + 10} y={y + 2} fill={color} fontSize={4.5} fontFamily={MONO}>
          {label}
        </text>
      )}
    </g>
  );
}

// ── Register A/B Circuit ────────────────────────────────────────

export function RegisterCircuit() {
  return (
    <svg viewBox="0 0 280 170" width="100%" style={{ display: "block" }}>
      {/* Title */}
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        1-Bit D Flip-Flop (×8 = Register)
      </text>

      {/* Input signals */}
      <SigLabel x={10} y={55} text="CLK" color={ORANGE} />
      <SigLabel x={10} y={85} text="D" color={ACCENT} />
      <SigLabel x={10} y={115} text="EN" color={DIM} />

      {/* Edge Detector block */}
      <Block x={30} y={38} w={55} h={30} label="Edge" sublabel="Detector" color="#fbbf24" />
      <Caption x={57} y={80} text="C + R + diode" />

      {/* AND Gate enable block */}
      <Block x={100} y={45} w={45} h={35} label="AND" sublabel="Gate ×2" color="#a78bfa" />

      {/* Data AND path */}
      <Arrow x1={20} y1={85} x2={100} y2={68} color={WIRE} />
      {/* CLK path */}
      <Arrow x1={20} y1={55} x2={30} y2={53} color={WIRE} />
      {/* Edge detector → AND */}
      <Arrow x1={85} y1={53} x2={100} y2={57} color={WIRE} />
      {/* Enable path */}
      <Wire x1={20} y1={115} x2={65} y2={115} />
      <Wire x1={65} y1={115} x2={65} y2={80} />
      <Arrow x1={65} y1={80} x2={100} y2={75} color={WIRE} />

      {/* NOR SR Latch */}
      <Block x={160} y={40} w={55} h={42} label="NOR SR" sublabel="Latch" color={ACCENT} />
      <Caption x={187} y={93} text="2× NOR gate" />
      <Caption x={187} y={100} text="(4 transistors)" />

      {/* AND → NOR */}
      <Arrow x1={145} y1={57} x2={160} y2={55} color={WIRE} />
      <Arrow x1={145} y1={68} x2={160} y2={70} color={WIRE} />

      {/* Outputs */}
      <Arrow x1={215} y1={53} x2={255} y2={53} color={ACCENT} />
      <Arrow x1={215} y1={72} x2={255} y2={72} color={DIM} />
      <SigLabel x={267} y={55} text="Q" color={ACCENT} />
      <SigLabel x={267} y={74} text="Q'" color={DIM} />

      {/* Load enabler block */}
      <Block x={160} y={110} w={55} h={28} label="Load Out" sublabel="AND ×8" color="#4ade80" />
      <Arrow x1={187} y1={82} x2={187} y2={110} color={WIRE} />
      <Arrow x1={215} y1={124} x2={255} y2={124} color={WIRE} />
      <SigLabel x={267} y={126} text="BUS" color={ORANGE} />

      {/* 5V and GND labels */}
      <SigLabel x={57} y={35} text="+5V" color="#fbbf24" />
      <SigLabel x={187} y={150} text="GND" color={DIM} />

      {/* Note */}
      <Caption x={140} y={165} text="Report §4, Appendix 1 — BC548B NPN transistors" />
    </svg>
  );
}

// ── ALU Circuit ─────────────────────────────────────────────────

export function AluCircuit() {
  return (
    <svg viewBox="0 0 280 200" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        Voltage-Dependent 11T Full Adder
      </text>

      {/* Three input transistors in parallel */}
      <SigLabel x={40} y={38} text="A" color={ACCENT} />
      <SigLabel x={80} y={38} text="B" color={ACCENT} />
      <SigLabel x={120} y={38} text="Cin" color={ACCENT} />

      <Block x={20} y={42} w={120} h={30} label="Variable Resistance" sublabel="3× parallel BC548B" color="#a78bfa" />

      {/* Arrows from inputs */}
      <Wire x1={40} y1={40} x2={40} y2={42} />
      <Wire x1={80} y1={40} x2={80} y2={42} />
      <Wire x1={120} y1={40} x2={120} y2={42} />

      {/* Down to voltage divider */}
      <Arrow x1={80} y1={72} x2={80} y2={88} color={WIRE} />

      {/* Voltage Divider */}
      <Block x={40} y={88} w={80} h={24} label="Voltage Divider" sublabel="2× resistor" color="#fbbf24" />

      {/* Down to output inverters */}
      <Arrow x1={60} y1={112} x2={60} y2={130} color={WIRE} />
      <Arrow x1={100} y1={112} x2={100} y2={130} color={WIRE} />

      {/* Output transistor 1 (Current/Sum) */}
      <Block x={30} y={130} w={60} h={24} label="Inverter 1" sublabel="Sum thresh." color={ACCENT} />

      {/* Output transistor 2 (Carry) */}
      <Block x={110} y={130} w={60} h={24} label="Inverter 2" sublabel="Carry thresh." color={ORANGE} />

      {/* NAND gate for 3-input case */}
      <Block x={190} y={42} w={60} h={30} label="NAND" sublabel="3-input" color="#f472b6" />
      {/* NAND inputs from A, B, C */}
      <Wire x1={140} y1={55} x2={190} y2={55} />

      {/* NAND → affects Current output */}
      <Arrow x1={220} y1={72} x2={220} y2={130} color={WIRE} />
      <Block x={190} y={130} w={60} h={24} label="Output" sublabel="NAND gate" color="#f472b6" />

      {/* Final outputs */}
      <Arrow x1={60} y1={154} x2={60} y2={178} color={ACCENT} />
      <SigLabel x={60} y={188} text="Sum" color={ACCENT} />

      <Arrow x1={140} y1={154} x2={140} y2={178} color={ORANGE} />
      <SigLabel x={140} y={188} text="Carry" color={ORANGE} />

      <Wire x1={220} y1={154} x2={220} y2={164} />
      <Wire x1={220} y1={164} x2={140} y2={164} />

      {/* ×8 note */}
      <Caption x={240} y={188} text="×8 bits" />
      <Caption x={140} y={198} text="Report §7 — Novel 11-transistor design" />

      {/* +5V */}
      <SigLabel x={80} y={30} text="+5V" color="#fbbf24" />
    </svg>
  );
}

// ── Clock Circuit ───────────────────────────────────────────────

export function ClockCircuit() {
  return (
    <svg viewBox="0 0 280 180" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        Astable Multivibrator + SR Latch + Relay
      </text>

      {/* +5V rail */}
      <Wire x1={20} y1={28} x2={260} y2={28} color="rgba(251,191,36,0.3)" />
      <SigLabel x={14} y={30} text="+5V" color="#fbbf24" />

      {/* Left transistor */}
      <Block x={30} y={45} w={40} h={28} label="Q190" sublabel="BC548B" color="#a78bfa" />
      {/* Right transistor */}
      <Block x={110} y={45} w={40} h={28} label="Q189" sublabel="BC548B" color="#a78bfa" />

      {/* Capacitors between them */}
      <Block x={72} y={34} w={36} h={14} label="33µF" color="#fbbf24" />
      {/* Cross-coupling wires */}
      <Wire x1={70} y1={52} x2={72} y2={41} color={WIRE} />
      <Wire x1={108} y1={41} x2={110} y2={52} color={WIRE} />

      {/* Resistors from +5V */}
      <SigLabel x={39} y={40} text="10k" color={DIM} />
      <Wire x1={50} y1={28} x2={50} y2={45} color={WIRE} />
      <SigLabel x={80} y={27} text="390Ω" color={DIM} />
      <SigLabel x={130} y={40} text="10k" color={DIM} />
      <Wire x1={130} y1={28} x2={130} y2={45} color={WIRE} />

      {/* GND */}
      <Wire x1={50} y1={73} x2={50} y2={82} color={WIRE} />
      <Wire x1={130} y1={73} x2={130} y2={82} color={WIRE} />
      <SigLabel x={90} y={87} text="GND" color={DIM} />

      {/* Arrow to SR Latch */}
      <Arrow x1={150} y1={59} x2={170} y2={59} color={WIRE} />

      {/* SR Latch block */}
      <Block x={170} y={45} w={50} h={28} label="SR Latch" sublabel="NOR ×2" color={ACCENT} />

      {/* Arrow to Relay */}
      <Arrow x1={220} y1={55} x2={240} y2={105} color={WIRE} />
      <Arrow x1={220} y1={63} x2={240} y2={125} color={WIRE} />

      {/* Relay output stages */}
      <Block x={170} y={95} w={90} h={24} label="Relay (5V out)" sublabel="Q195+Q197" color="#4ade80" />
      <Block x={170} y={122} w={90} h={24} label="Relay (GND clamp)" sublabel="Q196+Q200" color="#4ade80" />

      {/* Outputs */}
      <Arrow x1={260} y1={107} x2={270} y2={107} color={ACCENT} />
      <SigLabel x={277} y={109} text="Q" color={ACCENT} />
      <Arrow x1={260} y1={134} x2={270} y2={134} color={DIM} />
      <SigLabel x={277} y={136} text="Q'" color={DIM} />

      {/* Frequency annotation */}
      <rect x={30} y={100} rx={2} width={110} height={30} fill="rgba(249,115,22,0.06)" stroke={ORANGE} strokeWidth={0.5} />
      <text x={85} y={113} textAnchor="middle" fill={ORANGE} fontSize={6} fontFamily={MONO}>
        T ≈ 0.507s → f ≈ 1.97 Hz
      </text>
      <text x={85} y={123} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        RC = 10kΩ × 33µF
      </text>

      {/* Waveform hint */}
      <polyline
        points="30,155 40,155 40,142 55,142 55,155 70,155 70,142 85,142 85,155 100,155"
        fill="none" stroke={ORANGE} strokeWidth={1} opacity={0.5}
      />
      <SigLabel x={65} y={165} text="~2 Hz square wave" color={DIM} />

      <Caption x={140} y={178} text="Report §5, Appendix 3 — Astable Multivibrator" />
    </svg>
  );
}

// ── Program Counter Circuit ─────────────────────────────────────

export function PcCircuit() {
  return (
    <svg viewBox="0 0 280 140" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        4-Bit Binary Counter (JK Flip-Flops)
      </text>

      {/* CLK input */}
      <SigLabel x={10} y={55} text="CLK" color={ORANGE} />
      <Arrow x1={22} y1={53} x2={38} y2={53} color={ORANGE} />

      {/* 4 JK flip-flops chained */}
      {[0, 1, 2, 3].map((i) => {
        const x = 40 + i * 58;
        return (
          <g key={i}>
            <Block x={x} y={35} w={48} h={40} label={`JK-FF`} sublabel={`Bit ${i}`} color={ACCENT} />
            {/* J and K tied HIGH for toggle mode */}
            <SigLabel x={x + 5} y={46} text="J" color={DIM} />
            <SigLabel x={x + 5} y={68} text="K" color={DIM} />
            {/* CLK input on left */}
            <SigLabel x={x + 5} y={57} text=">" color={ORANGE} />
            {/* Q output */}
            <text x={x + 43} y={48} fill={ACCENT} fontSize={5} fontFamily={MONO}>Q</text>
            {/* Chain Q → next CLK */}
            {i < 3 && (
              <Arrow x1={x + 48} y1={53} x2={x + 58} y2={53} color={WIRE} />
            )}
          </g>
        );
      })}

      {/* Output bits */}
      {[0, 1, 2, 3].map((i) => {
        const x = 64 + i * 58;
        return (
          <g key={`out-${i}`}>
            <Arrow x1={x} y1={75} x2={x} y2={92} color={ACCENT} />
            <SigLabel x={x} y={100} text={`b${3 - i}`} color={ACCENT} />
          </g>
        );
      })}

      {/* Control signals */}
      <rect x={38} y={105} rx={2} width={200} height={18} fill="rgba(249,115,22,0.06)" stroke={ORANGE} strokeWidth={0.5} />
      <text x={138} y={116} textAnchor="middle" fill={ORANGE} fontSize={6} fontFamily={MONO}>
        CE (count enable) · J (jump/load from bus) · CO (output to bus)
      </text>

      {/* Bus output */}
      <Arrow x1={250} y1={55} x2={270} y2={55} color={ORANGE} />
      <SigLabel x={277} y={57} text="BUS" color={ORANGE} />

      <Caption x={140} y={137} text="Master-Slave JK Flip-Flop — BC548B" />
    </svg>
  );
}

// ── Instruction Register Circuit ────────────────────────────────

export function IrCircuit() {
  return (
    <svg viewBox="0 0 280 150" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        Instruction Register (8-bit split output)
      </text>

      {/* Bus input */}
      <SigLabel x={12} y={52} text="BUS" color={ORANGE} />
      <Arrow x1={24} y1={50} x2={40} y2={50} color={ORANGE} />
      <SigLabel x={12} y={68} text="II" color={ORANGE} />

      {/* 8-bit register */}
      <Block x={40} y={30} w={80} h={48} label="8-bit Register" sublabel="8× D Flip-Flop" color={ACCENT} />

      {/* Split into upper and lower */}
      <Arrow x1={120} y1={42} x2={145} y2={42} color={WIRE} />
      <Arrow x1={120} y1={66} x2={145} y2={66} color={WIRE} />

      {/* Upper 4 bits → Control Logic */}
      <Block x={145} y={28} w={75} h={26} label="Upper 4 bits" sublabel="Opcode [7:4]" color="#a78bfa" />
      <Arrow x1={220} y1={41} x2={260} y2={41} color="#a78bfa" />
      <SigLabel x={272} y={38} text="To" color="#a78bfa" />
      <SigLabel x={272} y={46} text="Control" color="#a78bfa" />

      {/* Lower 4 bits → Bus via IO */}
      <Block x={145} y={56} w={75} h={26} label="Lower 4 bits" sublabel="Operand [3:0]" color="#4ade80" />
      <Arrow x1={220} y1={69} x2={260} y2={69} color="#4ade80" />
      <SigLabel x={272} y={66} text="IO →" color="#4ade80" />
      <SigLabel x={272} y={74} text="BUS" color={ORANGE} />

      {/* Signal labels */}
      <rect x={40} y={95} rx={2} width={190} height={30} fill="rgba(0,229,255,0.04)" stroke={ACCENT} strokeWidth={0.5} />
      <text x={135} y={106} textAnchor="middle" fill={DIM} fontSize={5.5} fontFamily={MONO}>
        II: Latch instruction from bus on clock edge
      </text>
      <text x={135} y={115} textAnchor="middle" fill={DIM} fontSize={5.5} fontFamily={MONO}>
        IO: Output operand (lower nibble) to bus
      </text>

      <Caption x={140} y={145} text="Report §4 — Same D-FF design as registers" />
    </svg>
  );
}

// ── RAM Circuit ─────────────────────────────────────────────────

export function RamCircuit() {
  return (
    <svg viewBox="0 0 280 140" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        RAM (16×8 / 256×8)
      </text>

      {/* MAR address input */}
      <SigLabel x={15} y={50} text="MAR" color="#fbbf24" />
      <Arrow x1={28} y1={48} x2={60} y2={48} color="#fbbf24" />

      {/* Address decoder */}
      <Block x={60} y={32} w={60} h={30} label="Address" sublabel="Decoder" color="#fbbf24" />

      {/* Memory array */}
      <Arrow x1={120} y1={47} x2={140} y2={47} color={WIRE} />
      <Block x={140} y={24} w={80} h={56} label="Memory Array" sublabel="16×8 cells" color={ACCENT} />

      {/* Data bus I/O */}
      <Arrow x1={220} y1={47} x2={255} y2={47} color={ORANGE} />
      <SigLabel x={267} y={49} text="BUS" color={ORANGE} />

      {/* Control signals */}
      <SigLabel x={180} y={20} text="RO" color={ORANGE} />
      <SigLabel x={200} y={20} text="RI" color={ORANGE} />

      {/* Note about physical build */}
      <rect x={40} y={95} rx={2} width={200} height={30} fill="rgba(255,255,255,0.02)" stroke={DIM} strokeWidth={0.5} />
      <text x={140} y={106} textAnchor="middle" fill={DIM} fontSize={5.5} fontFamily={MONO}>
        Physical RAM design was not completed due to
      </text>
      <text x={140} y={115} textAnchor="middle" fill={DIM} fontSize={5.5} fontFamily={MONO}>
        bus resistance issues at final assembly stage
      </text>

      <Caption x={140} y={137} text="Report §9 — Planned but not physically built" />
    </svg>
  );
}

// ── Control Logic Circuit ───────────────────────────────────────

export function ControlCircuit() {
  return (
    <svg viewBox="0 0 280 160" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        EEPROM-Based Control Logic
      </text>

      {/* Inputs */}
      <SigLabel x={15} y={40} text="Opcode" color="#a78bfa" />
      <SigLabel x={15} y={55} text="(4-bit)" color={DIM} />
      <Arrow x1={35} y1={38} x2={70} y2={38} color="#a78bfa" />

      <SigLabel x={15} y={72} text="T-state" color={ORANGE} />
      <SigLabel x={15} y={84} text="(3-bit)" color={DIM} />
      <Arrow x1={35} y1={70} x2={70} y2={70} color={ORANGE} />

      <SigLabel x={15} y={105} text="Flags" color="#4ade80" />
      <SigLabel x={15} y={115} text="C, Z" color={DIM} />
      <Arrow x1={35} y1={103} x2={70} y2={103} color="#4ade80" />

      {/* EEPROM block */}
      <Block x={70} y={26} w={100} h={92} label="AT28C16" sublabel="EEPROM" color={ACCENT} />
      <text x={120} y={62} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        2K addresses
      </text>
      <text x={120} y={72} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        8-bit data out
      </text>
      <text x={120} y={105} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        Addr = opcode|T|flags
      </text>

      {/* Output: 16-bit control word (2 EEPROMs) */}
      <Arrow x1={170} y1={72} x2={195} y2={72} color={WIRE} />
      <Block x={195} y={45} w={70} h={55} label="16-bit" sublabel="Control Word" color={ORANGE} />

      {/* Signal names */}
      <text x={230} y={65} textAnchor="middle" fill={DIM} fontSize={4.5} fontFamily={MONO}>
        HLT MI RI RO
      </text>
      <text x={230} y={73} textAnchor="middle" fill={DIM} fontSize={4.5} fontFamily={MONO}>
        IO II AI AO
      </text>
      <text x={230} y={81} textAnchor="middle" fill={DIM} fontSize={4.5} fontFamily={MONO}>
        EO SU BI OI
      </text>
      <text x={230} y={89} textAnchor="middle" fill={DIM} fontSize={4.5} fontFamily={MONO}>
        CE CO J FI
      </text>

      {/* Arrow to all modules */}
      <Arrow x1={265} y1={72} x2={278} y2={72} color={ORANGE} />
      <SigLabel x={278} y={62} text="To all" color={DIM} />
      <SigLabel x={278} y={80} text="modules" color={DIM} />

      {/* Programming note */}
      <rect x={60} y={125} rx={2} width={170} height={18} fill="rgba(249,115,22,0.06)" stroke={ORANGE} strokeWidth={0.5} />
      <text x={145} y={137} textAnchor="middle" fill={DIM} fontSize={5.5} fontFamily={MONO}>
        Programmed via Arduino + shift register
      </text>

      <Caption x={140} y={157} text="Report §8 — AT28C16-15PC EEPROM" />
    </svg>
  );
}

// ── Keyboard Circuit ────────────────────────────────────────────

export function KeyboardCircuit() {
  return (
    <svg viewBox="0 0 280 170" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        Keyboard Matrix Decoder
      </text>

      {/* Key matrix */}
      <Block x={15} y={28} w={60} h={40} label="Key Matrix" sublabel="11×12 pins" color="#94a3b8" />

      {/* Two output paths */}
      <Arrow x1={75} y1={40} x2={95} y2={40} color={WIRE} />
      <Arrow x1={75} y1={56} x2={95} y2={75} color={WIRE} />

      {/* Layer 3 (analog) path */}
      <SigLabel x={85} y={35} text="L3" color={DIM} />
      <Block x={95} y={26} w={65} h={26} label="Potentiometers" sublabel="Voltage divider" color="#fbbf24" />
      <Arrow x1={160} y1={39} x2={175} y2={39} color={WIRE} />

      {/* LM339 comparators */}
      <Block x={175} y={24} w={60} h={34} label="LM339 ×3" sublabel="Comparators" color={ORANGE} />
      <text x={205} y={68} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        11 comparators
      </text>

      {/* Layer 1 (digital) path */}
      <SigLabel x={85} y={78} text="L1" color={DIM} />
      <Block x={95} y={67} w={65} h={22} label="Digital Pins" sublabel="12 lines" color="#4ade80" />

      {/* Cumulative decoder */}
      <Arrow x1={235} y1={41} x2={250} y2={68} color={WIRE} />
      <Arrow x1={160} y1={78} x2={250} y2={78} color={WIRE} />

      {/* Output register */}
      <Block x={170} y={95} w={80} h={26} label="Decoder" sublabel="Cumulative → binary" color="#a78bfa" />
      <Arrow x1={250} y1={73} x2={250} y2={95} color={WIRE} />
      <Wire x1={250} y1={95} x2={250} y2={108} />
      <Wire x1={250} y1={108} x2={210} y2={108} />

      {/* Final register */}
      <Arrow x1={210} y1={121} x2={210} y2={135} color={WIRE} />
      <Block x={170} y={135} w={80} h={20} label="8-bit Output" sublabel="To bus" color={ACCENT} />

      {/* Wire guide note */}
      <rect x={15} y={80} rx={2} width={65} height={40} fill="rgba(255,255,255,0.02)" stroke={DIM} strokeWidth={0.5} />
      <text x={47} y={93} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        3D-printed
      </text>
      <text x={47} y={101} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        wire guide
      </text>
      <text x={47} y={109} textAnchor="middle" fill={DIM} fontSize={5} fontFamily={MONO}>
        (Blender)
      </text>

      <Caption x={140} y={167} text="Report §6 — Logitech MK270R matrix decode" />
    </svg>
  );
}

// ── Output Circuit ──────────────────────────────────────────────

export function OutputCircuit() {
  return (
    <svg viewBox="0 0 280 120" width="100%" style={{ display: "block" }}>
      <text x={140} y={12} textAnchor="middle" fill={DIM} fontSize={7} fontFamily={MONO}>
        Output Display
      </text>

      {/* Bus input */}
      <SigLabel x={15} y={50} text="BUS" color={ORANGE} />
      <Arrow x1={28} y1={48} x2={55} y2={48} color={ORANGE} />

      {/* OI signal */}
      <SigLabel x={15} y={68} text="OI" color={ORANGE} />
      <Arrow x1={24} y1={66} x2={55} y2={66} color={ORANGE} />

      {/* Register */}
      <Block x={55} y={32} w={70} h={44} label="8-bit Register" sublabel="D Flip-Flop ×8" color={ACCENT} />

      {/* Output to display */}
      <Arrow x1={125} y1={54} x2={155} y2={54} color={WIRE} />

      {/* LED display */}
      <Block x={155} y={32} w={70} h={44} label="LED Array" sublabel="Binary display" color="#4ade80" />

      {/* LED dots */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle
          key={i}
          cx={163 + i * 8} cy={62}
          r={2.5}
          fill={i % 3 === 0 ? ORANGE : "rgba(255,255,255,0.06)"}
          opacity={i % 3 === 0 ? 0.8 : 1}
        />
      ))}

      {/* CLK */}
      <SigLabel x={90} y={28} text="CLK" color={DIM} />

      {/* Note */}
      <rect x={55} y={88} rx={2} width={170} height={18} fill="rgba(0,229,255,0.04)" stroke={ACCENT} strokeWidth={0.5} />
      <text x={140} y={100} textAnchor="middle" fill={DIM} fontSize={5.5} fontFamily={MONO}>
        Latches bus value on OI signal, displays as decimal
      </text>

      <Caption x={140} y={118} text="Same register design — output to LED array" />
    </svg>
  );
}
