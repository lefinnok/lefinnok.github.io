import { Opcode } from "./types";

const RAM_SIZE = 16;
const BYTE_MASK = 0xff;
const NIBBLE_MASK = 0x0f;

// ── Mnemonic -> opcode lookup ───────────────────────────────────

const MNEMONICS: Record<string, number> = {
  NOP: Opcode.NOP,
  LDA: Opcode.LDA,
  ADD: Opcode.ADD,
  SUB: Opcode.SUB,
  STA: Opcode.STA,
  LDI: Opcode.LDI,
  JMP: Opcode.JMP,
  JC: Opcode.JC,
  JZ: Opcode.JZ,
  OUT: Opcode.OUT,
  HLT: Opcode.HLT,
};

// Instructions that take no operand
const NO_OPERAND = new Set(["NOP", "OUT", "HLT"]);

// ── Result types ────────────────────────────────────────────────

export interface AssemblerError {
  line: number; // 1-based line number
  message: string;
}

export interface AssemblerResult {
  success: boolean;
  program: number[]; // 16-byte array (always returned, may be partial on error)
  errors: AssemblerError[];
  labels: Map<string, number>;
}

// ── Number parsing ──────────────────────────────────────────────

function parseNumber(token: string): number | null {
  // Binary: 0b1010
  if (/^0b[01]+$/i.test(token)) {
    return parseInt(token.slice(2), 2);
  }
  // Hex: 0xF or 0xFF
  if (/^0x[0-9a-f]+$/i.test(token)) {
    return parseInt(token.slice(2), 16);
  }
  // Decimal
  if (/^-?\d+$/.test(token)) {
    return parseInt(token, 10);
  }
  return null;
}

// ── Assembler ───────────────────────────────────────────────────

/**
 * Two-pass assembler.
 *
 * Pass 1: Collect labels and determine addresses.
 * Pass 2: Resolve operands (including label references) and emit bytes.
 *
 * Syntax:
 *   label: MNEMONIC operand   ; comment
 *   DB value                  ; raw data byte
 *   ORG address               ; set address counter
 *   ; comment line
 *   // also a comment
 *
 * Operands can be decimal (14), hex (0xE), binary (0b1110), or a label name.
 */
export function assemble(source: string): AssemblerResult {
  const lines = source.split("\n");
  const errors: AssemblerError[] = [];
  const labels = new Map<string, number>();
  const program = new Array<number>(RAM_SIZE).fill(0);

  // Intermediate representation from pass 1
  interface ParsedLine {
    lineNum: number;
    mnemonic: string; // uppercase mnemonic or "DB"
    operandToken: string | null; // raw operand string (may be label)
  }

  const parsed: ParsedLine[] = [];

  // ── Pass 1: parse lines, collect labels, assign addresses ─────

  let addr = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    let line = lines[i];

    // Strip comments (everything after ; or //)
    const commentIdx = Math.min(
      line.indexOf(";") === -1 ? Infinity : line.indexOf(";"),
      line.indexOf("//") === -1 ? Infinity : line.indexOf("//"),
    );
    if (commentIdx !== Infinity) {
      line = line.slice(0, commentIdx);
    }

    line = line.trim();
    if (line === "") continue;

    // Check for label (word followed by colon)
    const labelMatch = line.match(/^([a-zA-Z_]\w*)\s*:\s*(.*)/);
    if (labelMatch) {
      const labelName = labelMatch[1].toLowerCase();
      if (labels.has(labelName)) {
        errors.push({ line: lineNum, message: `Duplicate label "${labelMatch[1]}"` });
      } else {
        labels.set(labelName, addr);
      }
      line = labelMatch[2].trim();
      if (line === "") continue; // label-only line
    }

    // Split into tokens
    const tokens = line.split(/\s+/);
    const mnemonic = tokens[0].toUpperCase();
    const operandToken = tokens[1] ?? null;

    // ORG directive — set address counter
    if (mnemonic === "ORG") {
      if (operandToken === null) {
        errors.push({ line: lineNum, message: "ORG requires an address" });
        continue;
      }
      const orgAddr = parseNumber(operandToken);
      if (orgAddr === null || orgAddr < 0 || orgAddr >= RAM_SIZE) {
        errors.push({ line: lineNum, message: `ORG address must be 0–${RAM_SIZE - 1}` });
        continue;
      }
      addr = orgAddr;
      parsed.push({ lineNum, mnemonic, operandToken });
      continue;
    }

    // Validate mnemonic
    if (mnemonic !== "DB" && !(mnemonic in MNEMONICS)) {
      errors.push({ line: lineNum, message: `Unknown mnemonic "${tokens[0]}"` });
      continue;
    }

    // Check address overflow
    if (addr >= RAM_SIZE) {
      errors.push({ line: lineNum, message: `Program exceeds ${RAM_SIZE} bytes of RAM` });
      break;
    }

    parsed.push({ lineNum, mnemonic, operandToken });
    addr++;
  }

  // ── Pass 2: resolve operands, emit bytes ──────────────────────

  addr = 0;

  for (const { lineNum, mnemonic, operandToken } of parsed) {
    // ORG directive — set address counter
    if (mnemonic === "ORG") {
      const orgAddr = parseNumber(operandToken!);
      if (orgAddr !== null) addr = orgAddr;
      continue;
    }

    if (addr >= RAM_SIZE) break;

    // DB directive — raw byte
    if (mnemonic === "DB") {
      if (operandToken === null) {
        errors.push({ line: lineNum, message: "DB requires a value" });
        addr++;
        continue;
      }
      const val = resolveOperand(operandToken, labels, lineNum, errors, true);
      if (val !== null) {
        program[addr] = val & BYTE_MASK;
      }
      addr++;
      continue;
    }

    const opcode = MNEMONICS[mnemonic];

    if (NO_OPERAND.has(mnemonic)) {
      // No operand expected
      if (operandToken !== null) {
        errors.push({ line: lineNum, message: `${mnemonic} takes no operand` });
      }
      program[addr] = (opcode << 4) & BYTE_MASK;
    } else {
      // Operand required
      if (operandToken === null) {
        errors.push({ line: lineNum, message: `${mnemonic} requires an operand` });
        program[addr] = (opcode << 4) & BYTE_MASK;
      } else {
        const val = resolveOperand(operandToken, labels, lineNum, errors, false);
        if (val !== null) {
          program[addr] = ((opcode << 4) | (val & NIBBLE_MASK)) & BYTE_MASK;
        } else {
          program[addr] = (opcode << 4) & BYTE_MASK;
        }
      }
    }

    addr++;
  }

  return {
    success: errors.length === 0,
    program,
    errors,
    labels,
  };
}

/**
 * Resolve an operand token to a numeric value.
 * Can be a number literal or a label reference.
 */
function resolveOperand(
  token: string,
  labels: Map<string, number>,
  lineNum: number,
  errors: AssemblerError[],
  fullByte: boolean, // true for DB (0-255), false for operand (0-15)
): number | null {
  // Try numeric literal first
  const num = parseNumber(token);
  if (num !== null) {
    const max = fullByte ? 255 : 15;
    if (num < 0 || num > max) {
      errors.push({
        line: lineNum,
        message: `Value ${num} out of range (0–${max})`,
      });
    }
    return num;
  }

  // Try label reference
  const labelAddr = labels.get(token.toLowerCase());
  if (labelAddr !== undefined) {
    return labelAddr;
  }

  errors.push({ line: lineNum, message: `Unknown operand "${token}"` });
  return null;
}
