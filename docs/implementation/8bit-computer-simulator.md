# 8-Bit Computer Interactive Simulator

**Document Type**: Implementation Plan
**Status**: Planned
**Date**: 2026-02-26
**Last Updated**: 2026-02-26
**Audience**: Developers
**Tags**: #implementation #demo #8bit-computer #SAP-1

---

## Executive Summary

Interactive simulator of the 8-bit transistor breadboard computer (April-July 2020), a modified SAP-1 architecture built from NPN transistors. Inspired by Ben Eater's video series and Malvino & Brown's "Digital Computer Electronics." The physical build validated individual modules but stopped at final assembly due to breadboard resistance. This demo brings the full architecture to life — users explore the fetch-decode-execute cycle at the T-state level, click into modules for detailed explanations, and write/run assembly programs.

---

## Architecture (Modified SAP-1)

Faithful to the report's Figure 2.2. Ten modules connected via an 8-bit bus:

| Module | Width | Control Signals | Design from Report |
|--------|-------|-----------------|--------------------|
| Register A | 8-bit | LA, OA, CLK, CLR | D flip-flop (NOR SR latch + edge detector + enabler) |
| Register B | 8-bit | LB, OB, CLK, CLR | Same as Register A |
| ALU | 8-bit | FUL, OAI, ZER | Novel 11-transistor voltage-dependent full adder |
| RAM | 16x8 | OR | 16 addresses, 8-bit data |
| Address/PC | 4-bit | CO, CE, J | Program counter + memory address register |
| Logic Control | — | All signals | EEPROM-based microcode sequencer (AT28C16-15PC) |
| Clock | — | CLK | Astable multivibrator ~2Hz, SR latch + relay |
| Keyboard Input | 8-bit | KCLK, EK | Analog/digital decoding (LM339 comparators) |
| Output Display | 8-bit | R/W, KCLK, EK, ENT | With internal RAM |

---

## Instruction Set

4-bit opcode (upper nibble) + 4-bit operand (lower nibble) = 8-bit instruction word.

| Opcode | Mnemonic | Operation |
|--------|----------|-----------|
| `0000` | `NOP` | No operation |
| `0001` | `LDA addr` | A = RAM[addr] |
| `0010` | `ADD addr` | A = A + RAM[addr] |
| `0011` | `SUB addr` | A = A - RAM[addr] |
| `0100` | `STA addr` | RAM[addr] = A |
| `0101` | `LDI val` | A = val (immediate, 4-bit) |
| `0110` | `JMP addr` | PC = addr |
| `0111` | `JC addr` | if carry: PC = addr |
| `1000` | `JZ addr` | if zero: PC = addr |
| `1110` | `OUT` | Output register = A |
| `1111` | `HLT` | Halt clock |

---

## Microcode

Each instruction executes over T0–T4 clock ticks. T0–T1 form the universal **fetch cycle**:

- **T0**: `CO | MI` — Program counter out to bus, MAR loads from bus
- **T1**: `RO | II | CE` — RAM out to bus, instruction register loads, PC increments

T2–T4 are instruction-specific:

| Instruction | T2 | T3 | T4 |
|-------------|----|----|-----|
| `LDA` | `IO \| MI` | `RO \| AI` | — |
| `ADD` | `IO \| MI` | `RO \| BI` | `EO \| AI \| FI` |
| `SUB` | `IO \| MI` | `RO \| BI` | `EO \| AI \| SU \| FI` |
| `STA` | `IO \| MI` | `AO \| RI` | — |
| `LDI` | `IO \| AI` | — | — |
| `JMP` | `IO \| J` | — | — |
| `JC` | `IO \| J` (if carry) | — | — |
| `JZ` | `IO \| J` (if zero) | — | — |
| `OUT` | `AO \| OI` | — | — |
| `HLT` | `HLT` | — | — |

### Control Signals (16-bit bitmask)

```
Bit:  15  14  13  12  11  10   9   8   7   6   5   4   3   2   1   0
Sig:  FI   J  CO  CE  OI  BI  SU  EO  AO  AI  II  IO  RO  RI  MI HLT
```

---

## File Structure

```
app/components/demos/8bit-computer/
│
├── TransistorSimulator.tsx              Main component (entry, layout, useReducer)
│
├── engine/
│   ├── types.ts                         CpuState, ControlSignal enum, Opcode enum
│   ├── microcode.ts                     getMicrocode(opcode, tState, flags) -> controlWord
│   ├── cpu.ts                           createInitialState(), stepCpu(state) -> state
│   ├── assembler.ts                     assemble(source) -> { program, errors }
│   └── programs.ts                      Guided demo definitions + narration steps
│
├── views/
│   ├── ArchitectureSvg.tsx              SVG block diagram (Figure 2.2)
│   ├── BusAnimation.tsx                 Animated data packets on bus lines
│   ├── ModuleBlock.tsx                  Reusable SVG module (rect + label + LEDs + signals)
│   ├── LedStrip.tsx                     8-bit or 4-bit LED binary display
│   ├── RegisterDetailPanel.tsx          Side panel: Register A/B internals
│   ├── AluDetailPanel.tsx               Side panel: ALU internals
│   ├── RamDetailPanel.tsx               Side panel: RAM grid (16 rows)
│   ├── ClockDetailPanel.tsx             Side panel: clock waveform
│   ├── ProgramCounterDetailPanel.tsx    Side panel: PC + MAR
│   ├── ControlLogicDetailPanel.tsx      Side panel: microcode table
│   ├── KeyboardDetailPanel.tsx          Side panel: virtual numpad
│   └── OutputDisplayDetailPanel.tsx     Side panel: output history
│
├── explanation/
│   ├── ModuleExplanation.tsx            Dialog modal (follows AlgorithmExplanation pattern)
│   ├── ExplanationVisuals.tsx           SVG schematics per module
│   └── explanationData.ts              Slide definitions per module
│
└── controls/
    ├── AssemblyEditor.tsx               Textarea + assembler + error display
    ├── ControlBar.tsx                   Step, Run, Reset, Speed, Fullscreen
    ├── GuidedDemoPanel.tsx              Program selector + narration
    └── TStateIndicator.tsx              T0–T4 cycle indicator
```

**Existing files modified:**

| File | Change |
|------|--------|
| `app/components/InteractiveDemoSlot.tsx` | Add lazy import for `TransistorSimulator` |
| `app/data/projects.ts` | Set `hasInteractiveDemo: true` on `8-bit-transistor-computer` |

---

## Simulation Engine

### CPU State

```typescript
interface CpuState {
  // Registers
  regA: number;            // 8-bit accumulator
  regB: number;            // 8-bit B register
  regIR: number;           // 8-bit instruction register
  regOut: number;          // 8-bit output register

  // Counters/addressing
  pc: number;              // 4-bit program counter
  mar: number;             // 4-bit memory address register

  // Flags
  flagCarry: boolean;
  flagZero: boolean;

  // Memory
  ram: number[];           // 16 x 8-bit

  // Execution state
  tState: number;          // 0–4 (current microcode step)
  halted: boolean;

  // Visualization (set during step, not inputs)
  bus: number;             // 8-bit bus value after last step
  controlWord: number;     // bitmask of active control signals

  // Output
  outputHistory: number[];
  cycleCount: number;
}
```

### Core Step Function

`stepCpu(prev: CpuState) -> CpuState`

- **Pure function** — no side effects, no DOM, no React.
- Advances exactly one T-state per call.
- Determines bus value from whichever module has its output signal active.
- Applies inputs to whichever modules have their input signals active.
- `bus` and `controlWord` stored in state purely for visualization.
- Convenience: `stepInstruction(state)` loops `stepCpu` until `tState` wraps to 0.

### Assembler

`assemble(source: string) -> { success: boolean; program: number[]; errors: { line: number; message: string }[] }`

Supports:
- Mnemonic lookup (NOP, LDA, ADD, SUB, STA, LDI, JMP, JC, JZ, OUT, HLT)
- Numeric operands: decimal (`14`), hex (`0xE`), binary (`0b1110`)
- Labels (`loop: ADD 15` / `JMP loop`)
- Data directive (`DB 42`)
- Comments (`;` or `//`)
- Error reporting with line numbers

---

## Visual Design

### Architecture View (SVG)

SVG `viewBox="0 0 900 750"` recreating the Figure 2.2 layout. Vertical bus on the left, modules arranged around it.

Each **ModuleBlock** renders:
- Rounded rectangle, border glows **orange** (`#f97316`) when active in current T-state, **cyan** (`#00e5ff`) when user-selected
- Module label in Fira Code
- LED strip: 8 circles (orange = 1, dim `#2a2a2a` = 0), showing current register value
- Signal labels on edges with active/inactive indicators
- CSS `transition` for smooth state changes

### Bus Animation

- Small SVG circles (8 bits) travel along bus path from source to destination module
- Orange (`#f97316`) for 1-bits, gray for 0-bits
- CSS transitions on position, staggered delay per bit
- Bus line pulses brighter during active transfer
- Respects `prefers-reduced-motion`

### Color Palette

| Element | Color |
|---------|-------|
| Background | `#0a0a0a` |
| Paper/panels | `#141414` |
| Active module glow / LEDs on / bus active | `#f97316` (orange primary) |
| Selected module border | `#00e5ff` (cyan secondary) |
| LEDs off / module borders | `#2a2a2a` |
| LED glow | `drop-shadow(0 0 4px #f97316)` |
| Code/values font | Fira Code |
| Labels/narration font | Inter |

---

## Module Detail System

Clicking a module in the architecture diagram opens a **side panel** (layout shifts to 3:1 flex).

### Detail Panels

| Module | Panel Content |
|--------|---------------|
| Register A/B | 8 D flip-flop cells, load-in animation, OA/LA signal state |
| ALU | Inputs A + B as LEDs, result, carry/zero flags, simplified 11T schematic |
| RAM | 16-row x 8-col grid, MAR row highlighted, read/write indicator |
| Clock | Animated square wave, T-state position, multivibrator concept |
| PC/MAR | 4-bit counter value, increment/jump behavior |
| Control Logic | Control word row with named signals, microcode table with active row highlighted |
| Keyboard | Virtual numpad for loading values (free-run mode) |
| Output Display | Current output value + full history |

### Explanation Modals

Each panel has an **"Explain"** button opening a Dialog (follows `AlgorithmExplanation.tsx` pattern):
- Pipeline indicator at top
- Slide navigation (arrows + keyboard)
- KaTeX for math formulas
- SVG schematics (simplified from report figures)

| Module | Slides | Key Content |
|--------|--------|-------------|
| Logic Gates | 3 | Buffer vs inverter problem, NAND from inverters, truth tables |
| Register A/B | 4 | NOR SR latch, edge detector (capacitor + diode), enabler, D flip-flop schematic |
| ALU | 5 | Full adder truth table, XOR reduction attempt, 11T voltage-dependent design, variable resistance, voltage divider |
| Clock | 4 | Astable multivibrator, RC time constant (V_c = V_s(1 - e^(-t/RC))), period T ~0.507s, SR latch improvement |
| Keyboard | 3 | Key matrix decoding, LM339 analog/digital circuit, 3D-printed wire guide iterations |
| Control Logic | 3 | EEPROM concept, fetch-decode-execute cycle, control word table |

---

## Execution Modes

### Free-Run Mode

- Assembly editor: styled `<textarea>`, Fira Code, line number gutter, basic syntax coloring (mnemonics orange, operands cyan, comments gray)
- "Assemble & Load" button
- Error display with line numbers
- RAM sidebar showing decoded contents
- Controls: Step (T-state), Step (instruction), Run/Pause, Reset, Speed slider

### Guided Demo Mode

- Program selector (dropdown or cards)
- Assembly source shown read-only in editor
- Narration panel: educational text per instruction step
- Auto-run with pauses at narration checkpoints
- Module highlight hints in narration text

**Pre-built programs:**

| Program | Concepts Demonstrated |
|---------|----------------------|
| "Add Two Numbers" | LDA, ADD, OUT, HLT — simplest program |
| "Subtraction & Zero Flag" | SUB, JZ — conditional branching |
| "Count Up" | LDI, ADD, OUT, JMP, JC — loops and overflow |
| "Fibonacci" | STA, LDA, ADD — memory usage, loops, flags |

---

## Layout

```
+-------------------------------------------------------------------+
| "8-Bit Computer Simulator"            [How It Works] [Fullscreen] |
+-------------------------------------------------------------------+
| [Guided/Free]  [T0 T1 T2 T3 T4]  [Step] [Run] [Reset]  [Speed]  |
+-------------------------------------------------------------------+
|                                    |                              |
|   Architecture SVG Diagram         |  Module Detail Panel         |
|   (clickable modules, animated     |  (or Assembly Editor when    |
|    bus, LED values)                 |   no module selected)        |
|                                    |                              |
+-------------------------------------------------------------------+
| Narration / Output History                                        |
+-------------------------------------------------------------------+
```

---

## Implementation Phases

### Phase 1: Engine + Minimal UI

**Files:** `engine/types.ts`, `engine/microcode.ts`, `engine/cpu.ts`, `engine/assembler.ts`, `TransistorSimulator.tsx`

- All type definitions and enums
- Complete microcode ROM
- Pure `stepCpu` function
- Assembler with label support
- Main component with `useReducer`, raw state display, Step/Reset buttons
- Register in `InteractiveDemoSlot.tsx`, set `hasInteractiveDemo: true`

**Verify:** Assemble `LDA 14 / ADD 15 / OUT / HLT / DB 28 / DB 14`, step through all T-states, output = 42.

### Phase 2: Architecture SVG + LEDs

**Files:** `views/LedStrip.tsx`, `views/ModuleBlock.tsx`, `views/ArchitectureSvg.tsx`, `controls/ControlBar.tsx`, `controls/TStateIndicator.tsx`

- SVG block diagram matching Figure 2.2
- LED strips on each module showing current values
- Active module highlighting from `controlWord`
- Full control bar with step/run/reset/speed

**Verify:** Block diagram updates on each step, active modules glow orange.

### Phase 3: Bus Animation

**Files:** `views/BusAnimation.tsx`

- Data packet circles traveling along bus
- Source-to-destination animation per T-state
- `prefers-reduced-motion` support

**Verify:** Data visibly flows from RAM to Register A during `LDA`.

### Phase 4: Module Detail Panels

**Files:** All `views/*DetailPanel.tsx` files

- Side panel container with click-to-select
- Each module shows live internals updating per tick

**Verify:** Click any module, see its detail panel with correct live state.

### Phase 5: Assembly Editor

**Files:** `controls/AssemblyEditor.tsx`

- Styled textarea with line numbers and syntax coloring
- Assemble & Load button wired to engine
- Error display, RAM sidebar

**Verify:** Write custom assembly, assemble, load, step through.

### Phase 6: Explanation Modals

**Files:** `explanation/ModuleExplanation.tsx`, `ExplanationVisuals.tsx`, `explanationData.ts`

- Dialog with slides per module
- SVG schematics from report (simplified)
- Truth tables, formulas (KaTeX), design rationale

**Verify:** Each module "Explain" button opens educational slides.

### Phase 7: Guided Demos

**Files:** `engine/programs.ts`, `controls/GuidedDemoPanel.tsx`

- 4 guided programs with narration steps
- Auto-step with narration pauses
- Module highlight hints

**Verify:** Select "Add Two Numbers", auto-run, narration explains each step.

### Phase 8: Polish

- Fullscreen (vendor-prefixed, same pattern as gesture demo)
- Keyboard shortcuts: Space = step T-state, Enter = step instruction, R = run, Escape = reset
- Responsive layout (stack on mobile)
- MatrixLoader during lazy load
- References section

**Verify:** Fullscreen works, shortcuts work, reduced motion respected.

---

## Dependencies

No new npm packages required. Uses existing:
- `react`, `@mui/material`, `@mui/icons-material` (UI)
- `katex` (math formulas in explanation modals — already installed)

---

## References

- Malvino, A. P., & Brown, J. A. (1999). *Digital Computer Electronics* (3rd ed.). McGraw-Hill. pp. 140-141.
- Eater, B. (2016). *Build an 8-bit computer from scratch*. https://eater.net/8bit
- Project Report: 8-Bit Breadboard Computer (Chak Lai Kwok, April-July 2020)
