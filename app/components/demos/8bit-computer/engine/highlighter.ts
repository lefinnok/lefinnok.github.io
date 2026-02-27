/**
 * Simple line-by-line tokenizer for SAP-1 assembly syntax highlighting.
 * Returns spans with CSS color strings — no external dependencies.
 */

// ── Token colors ────────────────────────────────────────────────

const C_MNEMONIC = "#00e5ff"; // cyan — instructions
const C_DIRECTIVE = "#f97316"; // orange — ORG, DB
const C_LABEL_DEF = "#4ade80"; // green — label definitions (word:)
const C_LABEL_REF = "#86efac"; // light green — label references (operands)
const C_COMMENT = "rgba(255,255,255,0.3)"; // dim — comments
const C_NUMBER = "#fbbf24"; // amber — numeric literals
const C_DEFAULT = "rgba(255,255,255,0.8)"; // default text

// ── Known tokens ────────────────────────────────────────────────

const MNEMONICS = new Set([
  "NOP", "LDA", "ADD", "SUB", "STA", "LDI",
  "JMP", "JC", "JZ", "OUT", "HLT",
]);

const DIRECTIVES = new Set(["ORG", "DB"]);

const NUMBER_RE = /^(?:0x[0-9a-fA-F]+|0b[01]+|-?\d+)$/;

// ── Public types ────────────────────────────────────────────────

export interface Token {
  text: string;
  color: string;
}

// ── Tokenizer ───────────────────────────────────────────────────

/** Tokenize a single line of assembly into colored spans. */
export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];

  if (line.length === 0) return tokens;

  // Find comment start (; or //)
  let commentIdx = -1;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ";") { commentIdx = i; break; }
    if (line[i] === "/" && line[i + 1] === "/") { commentIdx = i; break; }
  }

  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : "";

  // Tokenize the code portion
  if (codePart.length > 0) {
    tokenizeCode(codePart, tokens);
  }

  // Comment as a single token
  if (commentPart.length > 0) {
    tokens.push({ text: commentPart, color: C_COMMENT });
  }

  return tokens;
}

function tokenizeCode(code: string, tokens: Token[]): void {
  // Split into whitespace and non-whitespace chunks, preserving order
  const chunks = code.match(/\s+|[^\s]+/g);
  if (!chunks) return;

  let seenMnemonic = false;
  let seenDirective = false;

  for (const chunk of chunks) {
    // Whitespace — pass through with default color
    if (/^\s+$/.test(chunk)) {
      tokens.push({ text: chunk, color: C_DEFAULT });
      continue;
    }

    const upper = chunk.toUpperCase();

    // Label definition (ends with colon)
    if (chunk.endsWith(":")) {
      tokens.push({ text: chunk, color: C_LABEL_DEF });
      continue;
    }

    // Mnemonic
    if (!seenMnemonic && !seenDirective && MNEMONICS.has(upper)) {
      tokens.push({ text: chunk, color: C_MNEMONIC });
      seenMnemonic = true;
      continue;
    }

    // Directive
    if (!seenMnemonic && !seenDirective && DIRECTIVES.has(upper)) {
      tokens.push({ text: chunk, color: C_DIRECTIVE });
      seenDirective = true;
      continue;
    }

    // Number literal (operand position)
    if (NUMBER_RE.test(chunk)) {
      tokens.push({ text: chunk, color: C_NUMBER });
      continue;
    }

    // Label reference (operand position after mnemonic/directive)
    if ((seenMnemonic || seenDirective) && /^[a-zA-Z_]\w*$/.test(chunk)) {
      tokens.push({ text: chunk, color: C_LABEL_REF });
      continue;
    }

    // Default
    tokens.push({ text: chunk, color: C_DEFAULT });
  }
}

/** Tokenize all lines at once (convenience). */
export function tokenizeSource(source: string): Token[][] {
  return source.split("\n").map(tokenizeLine);
}
