import { CS, Opcode, type RamSize, tStateCount, fetchLength } from "./types";

// ── Microcode ROM ───────────────────────────────────────────────
// Maps (opcode, tState) -> control word bitmask.
//
// T0–T1 (classic) or T0–T3 (extended) are the universal FETCH cycle.
// Remaining T-states are instruction-specific EXECUTE steps.
// Unused T-states return 0 (no signals active = NOP tick).
//
// Conditional jumps (JC, JZ) check flags at lookup time —
// matching how the physical EEPROM has separate pages for each
// flag combination.

// Fetch cycle — classic mode (1-byte instructions)
const FETCH_CLASSIC: number[] = [
  CS.CO | CS.MI, // T0: PC out -> MAR in
  CS.RO | CS.II | CS.CE, // T1: RAM out -> IR in, increment PC
];

// Fetch cycle — extended mode (2-byte instructions)
// T0-T1: fetch opcode byte into IR
// T2-T3: fetch operand byte (loaded into regOperand by CPU step fn)
const FETCH_EXTENDED: number[] = [
  CS.CO | CS.MI, // T0: PC out -> MAR in
  CS.RO | CS.II | CS.CE, // T1: RAM out -> IR in, increment PC
  CS.CO | CS.MI, // T2: PC out -> MAR in (for operand byte)
  CS.RO | CS.CE, // T3: RAM out (operand on bus), increment PC
];

// Per-instruction execute microcode (T2, T3, T4)
const EXECUTE: Record<number, number[]> = {
  [Opcode.NOP]: [],
  [Opcode.LDA]: [
    CS.IO | CS.MI, // T2: IR operand out -> MAR in
    CS.RO | CS.AI, // T3: RAM out -> A in
  ],
  [Opcode.ADD]: [
    CS.IO | CS.MI, // T2: IR operand out -> MAR in
    CS.RO | CS.BI, // T3: RAM out -> B in
    CS.EO | CS.AI | CS.FI, // T4: ALU out -> A in, update flags
  ],
  [Opcode.SUB]: [
    CS.IO | CS.MI, // T2: IR operand out -> MAR in
    CS.RO | CS.BI, // T3: RAM out -> B in
    CS.EO | CS.AI | CS.SU | CS.FI, // T4: ALU out (subtract) -> A in, flags
  ],
  [Opcode.STA]: [
    CS.IO | CS.MI, // T2: IR operand out -> MAR in
    CS.AO | CS.RI, // T3: A out -> RAM in
  ],
  [Opcode.LDI]: [
    CS.IO | CS.AI, // T2: IR operand out -> A in (immediate load)
  ],
  [Opcode.JMP]: [
    CS.IO | CS.J, // T2: IR operand out -> PC (jump)
  ],
  // JC and JZ are handled dynamically based on flags (see getMicrocode)
  [Opcode.OUT]: [
    CS.AO | CS.OI, // T2: A out -> Output register in
  ],
  [Opcode.HLT]: [
    CS.HLT, // T2: Halt
  ],
};

/**
 * Look up the control word for a given opcode, T-state, and flag state.
 *
 * This mirrors the EEPROM lookup in the physical build — the address
 * is formed from (flags, opcode, tState) and the data output is the
 * 16-bit control word.
 */
export function getMicrocode(
  opcode: number,
  tState: number,
  flags: { carry: boolean; zero: boolean },
  ramSize: RamSize = 16,
): number {
  const tCount = tStateCount(ramSize);
  const fetch = ramSize === 256 ? FETCH_EXTENDED : FETCH_CLASSIC;

  // Bounds check
  if (tState < 0 || tState >= tCount) return 0;

  // Fetch cycle
  if (tState < fetch.length) {
    return fetch[tState];
  }

  // Execute steps (offset by fetch length)
  const execIdx = tState - fetch.length;

  // Conditional jumps — only jump if the relevant flag is set
  if (opcode === Opcode.JC) {
    if (flags.carry) {
      const steps = [CS.IO | CS.J];
      return steps[execIdx] ?? 0;
    }
    return 0; // flag not set — NOP this T-state
  }

  if (opcode === Opcode.JZ) {
    if (flags.zero) {
      const steps = [CS.IO | CS.J];
      return steps[execIdx] ?? 0;
    }
    return 0;
  }

  const steps = EXECUTE[opcode];
  if (!steps) return 0; // unknown opcode — treat as NOP

  return steps[execIdx] ?? 0;
}

/**
 * Get the full microcode sequence for an instruction (for display in
 * the control logic detail panel).
 */
export function getInstructionMicrocode(
  opcode: number,
  flags: { carry: boolean; zero: boolean },
  ramSize: RamSize = 16,
): number[] {
  const tCount = tStateCount(ramSize);
  const result: number[] = [];
  for (let t = 0; t < tCount; t++) {
    result.push(getMicrocode(opcode, t, flags, ramSize));
  }
  return result;
}
