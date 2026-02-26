// ── Control signals as a 16-bit bitmask ──────────────────────────
// Mirrors the physical EEPROM output lines on the SAP-1 build.
// Each bit corresponds to one control line active-high.

export const CS = {
  HLT: 1 << 0, // Halt clock
  MI: 1 << 1, // Memory address register in (load MAR from bus)
  RI: 1 << 2, // RAM in (write bus value to RAM[MAR])
  RO: 1 << 3, // RAM out (put RAM[MAR] on bus)
  IO: 1 << 4, // Instruction register operand out (lower 4 bits)
  II: 1 << 5, // Instruction register in (load IR from bus)
  AI: 1 << 6, // A register in
  AO: 1 << 7, // A register out
  EO: 1 << 8, // ALU out (sum/difference to bus)
  SU: 1 << 9, // ALU subtract mode
  BI: 1 << 10, // B register in
  OI: 1 << 11, // Output register in
  CE: 1 << 12, // Counter enable (increment PC)
  CO: 1 << 13, // Counter out (PC to bus)
  J: 1 << 14, // Jump (load PC from bus)
  FI: 1 << 15, // Flags register in
} as const;

/** Human-readable names for each control signal bit, indexed by bit position. */
export const CS_NAMES: string[] = [
  "HLT",
  "MI",
  "RI",
  "RO",
  "IO",
  "II",
  "AI",
  "AO",
  "EO",
  "SU",
  "BI",
  "OI",
  "CE",
  "CO",
  "J",
  "FI",
];

// ── Opcodes ─────────────────────────────────────────────────────

export const Opcode = {
  NOP: 0x0,
  LDA: 0x1,
  ADD: 0x2,
  SUB: 0x3,
  STA: 0x4,
  LDI: 0x5,
  JMP: 0x6,
  JC: 0x7,
  JZ: 0x8,
  OUT: 0xe,
  HLT: 0xf,
} as const;

export type OpcodeValue = (typeof Opcode)[keyof typeof Opcode];

/** Mnemonic string for each opcode value. */
export const OPCODE_NAMES: Record<number, string> = {
  [Opcode.NOP]: "NOP",
  [Opcode.LDA]: "LDA",
  [Opcode.ADD]: "ADD",
  [Opcode.SUB]: "SUB",
  [Opcode.STA]: "STA",
  [Opcode.LDI]: "LDI",
  [Opcode.JMP]: "JMP",
  [Opcode.JC]: "JC",
  [Opcode.JZ]: "JZ",
  [Opcode.OUT]: "OUT",
  [Opcode.HLT]: "HLT",
};

/** Whether the instruction uses its operand (lower nibble). */
export function opcodeHasOperand(op: number): boolean {
  return op !== Opcode.NOP && op !== Opcode.OUT && op !== Opcode.HLT;
}

// ── CPU state ───────────────────────────────────────────────────

export type RamSize = 16 | 256;

export interface CpuState {
  // Registers
  regA: number; // 8-bit accumulator
  regB: number; // 8-bit B register
  regIR: number; // 8-bit instruction register
  regOut: number; // 8-bit output register
  regOperand: number; // 8-bit operand register (extended mode: 2nd instruction byte)

  // Counters / addressing
  pc: number; // 4-bit (classic) or 8-bit (extended) program counter
  mar: number; // 4-bit (classic) or 8-bit (extended) memory address register

  // Flags
  flagCarry: boolean;
  flagZero: boolean;

  // Memory
  ram: number[]; // 16 x 8-bit (classic) or 256 x 8-bit (extended)
  ramSize: RamSize; // RAM size mode

  // Execution state
  tState: number; // 0–4 (classic) or 0–7 (extended)
  halted: boolean;

  // Set during step for visualization
  bus: number; // 8-bit bus value after last step
  controlWord: number; // bitmask of active control signals

  // Output history (every OUT instruction appends here)
  outputHistory: number[];

  // How many full instructions have completed (tState wrapped to 0)
  cycleCount: number;
}

// ── Module IDs (for UI selection / highlighting) ────────────────

export type ModuleId =
  | "regA"
  | "regB"
  | "alu"
  | "ram"
  | "pc"
  | "mar"
  | "ir"
  | "control"
  | "clock"
  | "keyboard"
  | "output";

/** Maps control signal bits to the module(s) they affect. */
export const SIGNAL_TO_MODULE: Record<number, ModuleId[]> = {
  [CS.AI]: ["regA"],
  [CS.AO]: ["regA"],
  [CS.BI]: ["regB"],
  [CS.EO]: ["alu"],
  [CS.SU]: ["alu"],
  [CS.FI]: ["alu"],
  [CS.RO]: ["ram"],
  [CS.RI]: ["ram"],
  [CS.MI]: ["mar"],
  [CS.CO]: ["pc"],
  [CS.CE]: ["pc"],
  [CS.J]: ["pc"],
  [CS.II]: ["ir"],
  [CS.IO]: ["ir"],
  [CS.OI]: ["output"],
  [CS.HLT]: ["clock"],
};

/** Derive which modules are active given a control word. */
export function activeModules(controlWord: number): Set<ModuleId> {
  const set = new Set<ModuleId>();
  for (const [bitStr, modules] of Object.entries(SIGNAL_TO_MODULE)) {
    const bit = Number(bitStr);
    if (controlWord & bit) {
      for (const m of modules) set.add(m);
    }
  }
  return set;
}

// ── T-state configuration ───────────────────────────────────────

/** Classic: 5 T-states (2 fetch + 3 execute). Extended: 8 (4 fetch + 4 execute). */
export function tStateCount(ramSize: RamSize): number {
  return ramSize === 256 ? 8 : 5;
}

/** Number of T-states in the fetch cycle. */
export function fetchLength(ramSize: RamSize): number {
  return ramSize === 256 ? 4 : 2;
}

/** Backward-compat constant for classic mode. */
export const T_STATE_COUNT = 5;

export function tStateLabel(t: number, ramSize: RamSize = 16): string {
  const fl = fetchLength(ramSize);
  if (t < fl) return "FETCH";
  return "EXECUTE";
}

/** Address mask: 0x0F for classic, 0xFF for extended. */
export function addrMask(ramSize: RamSize): number {
  return ramSize === 256 ? 0xff : 0x0f;
}
