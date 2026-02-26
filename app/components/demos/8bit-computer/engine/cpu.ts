import {
  type CpuState,
  type RamSize,
  CS,
  tStateCount,
  fetchLength,
  addrMask as getAddrMask,
} from "./types";
import { getMicrocode } from "./microcode";

const BYTE_MASK = 0xff;
const NIBBLE_MASK = 0x0f;

/**
 * Create a fresh CPU state, optionally pre-loaded with a program in RAM.
 */
export function createInitialState(
  program?: number[],
  ramSize: RamSize = 16,
): CpuState {
  const ram = new Array<number>(ramSize).fill(0);
  if (program) {
    for (let i = 0; i < Math.min(program.length, ramSize); i++) {
      ram[i] = program[i] & BYTE_MASK;
    }
  }

  return {
    regA: 0,
    regB: 0,
    regIR: 0,
    regOut: 0,
    regOperand: 0,
    pc: 0,
    mar: 0,
    flagCarry: false,
    flagZero: false,
    ram,
    ramSize,
    tState: 0,
    halted: false,
    bus: 0,
    controlWord: 0,
    outputHistory: [],
    cycleCount: 0,
  };
}

/**
 * Advance the CPU by exactly one T-state (one clock tick).
 *
 * Pure function — returns a new state object, never mutates `prev`.
 *
 * The order of operations mirrors the hardware:
 * 1. Look up the control word from the microcode ROM
 * 2. Determine the bus value (who is outputting?)
 * 3. Apply inputs (who is loading from the bus?)
 * 4. Advance the T-state counter
 */
export function stepCpu(prev: CpuState): CpuState {
  if (prev.halted) return prev;

  const { ramSize } = prev;
  const mask = getAddrMask(ramSize);

  // Decode current instruction (upper nibble of IR)
  const opcode = (prev.regIR >> 4) & NIBBLE_MASK;

  // 1. Microcode lookup
  const controlWord = getMicrocode(
    opcode,
    prev.tState,
    { carry: prev.flagCarry, zero: prev.flagZero },
    ramSize,
  );

  // Clone state (shallow copy + new arrays)
  const s: CpuState = {
    ...prev,
    ram: [...prev.ram],
    outputHistory: [...prev.outputHistory],
  };

  // 2. Determine bus value — only one output signal should be active
  let bus = 0;

  if (controlWord & CS.CO) {
    bus = s.pc & mask;
  } else if (controlWord & CS.AO) {
    bus = s.regA & BYTE_MASK;
  } else if (controlWord & CS.EO) {
    // ALU computes on the fly
    const result =
      controlWord & CS.SU ? s.regA - s.regB : s.regA + s.regB;
    bus = result & BYTE_MASK;
  } else if (controlWord & CS.RO) {
    bus = s.ram[s.mar & mask] & BYTE_MASK;
  } else if (controlWord & CS.IO) {
    // Classic mode: output lower 4 bits of IR (operand nibble)
    // Extended mode: output full 8-bit operand register
    bus =
      ramSize === 256
        ? s.regOperand & BYTE_MASK
        : s.regIR & NIBBLE_MASK;
  }

  // 3. Apply inputs — load from bus into registers/memory
  if (controlWord & CS.MI) {
    s.mar = bus & mask;
  }
  if (controlWord & CS.II) {
    s.regIR = bus & BYTE_MASK;
  }
  if (controlWord & CS.AI) {
    s.regA = bus & BYTE_MASK;
  }
  if (controlWord & CS.BI) {
    s.regB = bus & BYTE_MASK;
  }
  if (controlWord & CS.RI) {
    s.ram[s.mar & mask] = bus & BYTE_MASK;
  }
  if (controlWord & CS.OI) {
    s.regOut = bus & BYTE_MASK;
    s.outputHistory.push(bus & BYTE_MASK);
  }
  if (controlWord & CS.CE) {
    s.pc = (s.pc + 1) & mask;
  }
  if (controlWord & CS.J) {
    s.pc = bus & mask;
  }

  // Extended mode: at T3 of fetch cycle, load bus value into operand register
  if (ramSize === 256 && prev.tState === 3) {
    s.regOperand = bus & BYTE_MASK;
  }

  // Flags — only latched when FI is active (matches hardware)
  if (controlWord & CS.FI) {
    // Use the pre-latch regA/regB values (ALU inputs haven't changed
    // even though AI may also be active this tick — in hardware, the register
    // loads on the clock edge while the ALU is combinational).
    const aluResult =
      controlWord & CS.SU ? prev.regA - prev.regB : prev.regA + prev.regB;
    s.flagCarry = aluResult > BYTE_MASK || aluResult < 0;
    s.flagZero = (aluResult & BYTE_MASK) === 0;
  }

  // Halt
  if (controlWord & CS.HLT) {
    s.halted = true;
  }

  // 4. Advance T-state
  const tCount = tStateCount(ramSize);
  const nextT = (prev.tState + 1) % tCount;
  s.tState = nextT;
  if (nextT === 0) {
    s.cycleCount = prev.cycleCount + 1;
  }

  // Store visualization data
  s.bus = bus;
  s.controlWord = controlWord;

  return s;
}

/**
 * Step until the current instruction completes (T-state wraps to 0).
 * Returns the state after the full instruction, or earlier if halted.
 * If already at T0, executes a full instruction.
 */
export function stepInstruction(state: CpuState): CpuState {
  let s = state;

  // If at T0, step at least once so we don't immediately return
  if (s.tState === 0) {
    s = stepCpu(s);
  }

  // Keep stepping until we wrap back to T0 or halt
  while (s.tState !== 0 && !s.halted) {
    s = stepCpu(s);
  }

  return s;
}

/**
 * Decode a byte into its mnemonic + operand for display.
 *
 * In extended mode (ramSize=256), pass the operand byte separately
 * since instructions are 2 bytes wide.
 */
export function disassemble(
  byte: number,
  operandByte?: number,
  ramSize: RamSize = 16,
): string {
  const opcode = (byte >> 4) & NIBBLE_MASK;
  const operand =
    ramSize === 256 && operandByte !== undefined
      ? operandByte & BYTE_MASK
      : byte & NIBBLE_MASK;

  const names: Record<number, string> = {
    0x0: "NOP",
    0x1: "LDA",
    0x2: "ADD",
    0x3: "SUB",
    0x4: "STA",
    0x5: "LDI",
    0x6: "JMP",
    0x7: "JC",
    0x8: "JZ",
    0xe: "OUT",
    0xf: "HLT",
  };

  const name = names[opcode] ?? `??? (${opcode.toString(16)})`;

  // Instructions without operand
  if (opcode === 0x0 || opcode === 0xe || opcode === 0xf) {
    return name;
  }

  return `${name} ${operand}`;
}
