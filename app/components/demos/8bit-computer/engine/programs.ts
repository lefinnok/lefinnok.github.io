import type { RamSize } from "./types";

// ── Narration for guided demos ──────────────────────────────────

export interface NarrationStep {
  /** Pause auto-run when tState===0 and pc matches this value. */
  pc: number;
  /** Explanation text shown in the narration bar. */
  text: string;
  /** Optional ModuleId to highlight in the diagram. */
  highlight?: string;
}

// ── Program definition ──────────────────────────────────────────

export interface SampleProgram {
  id: string;
  name: string;
  description: string;
  source: string;
  ramSize: RamSize;
  /** If present, this program is a guided demo with step-by-step narration. */
  narration?: NarrationStep[];
}

// ── 16B Classic Mode Programs ───────────────────────────────────

export const PROGRAMS_16: SampleProgram[] = [
  {
    id: "add-16",
    name: "Add Two Numbers",
    description: "28 + 14 = 42. The simplest program — load, add, output.",
    ramSize: 16,
    source: `; Add two numbers: 28 + 14 = 42
LDA 14     ; Load first number
ADD 15     ; Add second number
OUT        ; Display result
HLT        ; Stop

ORG 14
DB 28      ; First number
DB 14      ; Second number`,
    narration: [
      {
        pc: 0,
        text: "LDA 14 — Fetches the instruction, reads the operand (14), then loads the value at RAM[14] (which is 28) into Register A. Watch the fetch cycle: PC\u2192MAR, RAM\u2192IR, then the execute cycle: operand\u2192MAR, RAM\u2192A.",
        highlight: "regA",
      },
      {
        pc: 1,
        text: "ADD 15 — Loads the value at RAM[15] (which is 14) into Register B. Then the ALU computes A + B = 28 + 14 = 42 and stores the result back in Register A.",
        highlight: "alu",
      },
      {
        pc: 2,
        text: "OUT — Copies Register A\u2019s value (42) to the Output register. The answer appears in the output display!",
        highlight: "output",
      },
      {
        pc: 3,
        text: "HLT — The halt signal stops the clock. Program complete \u2014 the output is 42.",
        highlight: "clock",
      },
    ],
  },
  {
    id: "count-up-16",
    name: "Count Up",
    description: "Counts from 1 to 255, halts on carry overflow.",
    ramSize: 16,
    source: `; Count from 1 to 255
  LDI 1       ; Start at 1
loop: OUT     ; Display current value
  ADD 15      ; Add 1
  JC done     ; Carry means overflow
  JMP loop    ; Keep counting
done: HLT

ORG 15
DB 1          ; Increment`,
    narration: [
      {
        pc: 0,
        text: "LDI 1 — Loads the immediate value 1 directly into Register A. No memory lookup is needed for immediate instructions.",
        highlight: "regA",
      },
      {
        pc: 1,
        text: "OUT — Displays the current value of Register A (1). This is the top of the counting loop.",
        highlight: "output",
      },
      {
        pc: 2,
        text: "ADD 15 — Adds 1 (from RAM[15]) to Register A. The ALU computes the sum and updates the flags.",
        highlight: "alu",
      },
      {
        pc: 3,
        text: "JC 5 — Checks the Carry flag. The addition didn\u2019t overflow past 255, so the jump is NOT taken.",
        highlight: "pc",
      },
      {
        pc: 4,
        text: "JMP 1 — Unconditional jump back to the loop start (OUT at address 1). The counter increments each pass.",
        highlight: "pc",
      },
      {
        pc: 1,
        text: "Back in the loop! Each iteration: output the value, add 1, check for carry overflow. When A reaches 255 and wraps past it, the Carry flag will trigger JC to halt. Press Continue or Run to watch it count.",
      },
    ],
  },
  {
    id: "fibonacci-16",
    name: "Fibonacci",
    description: "Generates fibonacci sums: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233.",
    ramSize: 16,
    source: `; Fibonacci sequence
  LDA 14      ; A = fib_a
  ADD 15      ; A = fib_a + fib_b
  JC 10       ; Overflow → halt
  STA 13      ; temp = new value
  OUT         ; Display it
  LDA 14      ; A = old fib_a
  STA 15      ; fib_b = old fib_a
  LDA 13      ; A = temp
  STA 14      ; fib_a = new value
  JMP 0       ; Loop
  HLT         ; addr 10

ORG 13
DB 0          ; temp
DB 1          ; fib_a (starts at 1)
DB 0          ; fib_b (starts at 0)`,
    narration: [
      {
        pc: 0,
        text: "LDA 14 — Loads fib_a (initially 1) into Register A. Each Fibonacci number is the sum of the previous two: F(n) = F(n-1) + F(n-2).",
        highlight: "regA",
      },
      {
        pc: 1,
        text: "ADD 15 — Adds fib_b (initially 0) to A. The ALU computes 1 + 0 = 1, the first Fibonacci output.",
        highlight: "alu",
      },
      {
        pc: 3,
        text: "STA 13 — Saves the new sum into temp (RAM[13]) so we can shuffle the two Fibonacci variables.",
        highlight: "ram",
      },
      {
        pc: 4,
        text: "OUT — Displays the new Fibonacci number. First output: 1.",
        highlight: "output",
      },
      {
        pc: 5,
        text: "Now we shift: the old fib_a becomes new fib_b, and the computed sum becomes new fib_a. Three LDA/STA operations perform this swap using RAM.",
        highlight: "ram",
      },
      {
        pc: 9,
        text: "JMP 0 — Loop back to compute the next term. The sequence grows: 1, 2, 3, 5, 8, 13, 21... When a sum exceeds 255, the Carry flag triggers JC to halt.",
        highlight: "pc",
      },
      {
        pc: 0,
        text: "Next iteration begins. fib_a and fib_b have been updated in RAM. Press Continue or Run to watch the full Fibonacci sequence.",
      },
    ],
  },
  {
    id: "countdown-16",
    name: "Count Down by 3",
    description: "Counts down from 12 by 3s: 12, 9, 6, 3, 0. Demonstrates SUB and JZ.",
    ramSize: 16,
    source: `; Count down from 12 by 3
  LDA 14       ; A = 12
loop: OUT      ; Display
  JZ done      ; Zero → stop
  SUB 15       ; A = A - 3
  JMP loop     ; Repeat
done: HLT

ORG 14
DB 12          ; Start value
DB 3           ; Decrement`,
    narration: [
      {
        pc: 0,
        text: "LDA 14 — Loads the starting value 12 from RAM[14] into Register A.",
        highlight: "regA",
      },
      {
        pc: 1,
        text: "OUT — Displays the current value of A (12). This is the top of the countdown loop.",
        highlight: "output",
      },
      {
        pc: 2,
        text: "JZ 5 — Tests the Zero flag. A = 12 \u2260 0, so the jump is NOT taken. Execution continues to SUB.",
        highlight: "pc",
      },
      {
        pc: 3,
        text: "SUB 15 — Subtracts 3 (from RAM[15]) from A. The ALU uses two\u2019s complement subtraction: 12 \u2212 3 = 9.",
        highlight: "alu",
      },
      {
        pc: 4,
        text: "JMP 1 — Jumps back to the loop. The sequence will be: 12, 9, 6, 3, 0.",
        highlight: "pc",
      },
      {
        pc: 1,
        text: "The loop continues counting down by 3. When A reaches 0, the Zero flag will be set and JZ will jump to HLT. Press Continue or Run to watch.",
      },
    ],
  },
];

// ── 256B Extended Mode Programs ─────────────────────────────────

export const PROGRAMS_256: SampleProgram[] = [
  {
    id: "add-256",
    name: "Add Two Numbers",
    description: "28 + 14 = 42. Same logic, now with labels and 8-bit addresses.",
    ramSize: 256,
    source: `; Add two numbers: 28 + 14 = 42
LDA data1    ; Load first number
ADD data2    ; Add second number
OUT          ; Display result
HLT

data1: DB 28
data2: DB 14`,
  },
  {
    id: "fibonacci-256",
    name: "Fibonacci",
    description: "Generates the fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, ... until overflow.",
    ramSize: 256,
    source: `; Fibonacci sequence with labels
  LDI 1
  STA fib_a     ; fib_a = 1
  OUT           ; Output first 1
  LDI 0
  STA fib_b     ; fib_b = 0

loop:
  LDA fib_a
  ADD fib_b     ; A = fib_a + fib_b
  JC done       ; Overflow → halt
  OUT           ; Display new term
  STA temp
  LDA fib_a
  STA fib_b     ; fib_b = old fib_a
  LDA temp
  STA fib_a     ; fib_a = new sum
  JMP loop

done: HLT

temp:  DB 0
fib_a: DB 0
fib_b: DB 0`,
  },
  {
    id: "multiply-256",
    name: "Multiply (6 x 7)",
    description: "Computes 6 x 7 = 42 via repeated addition. Demonstrates loops with a counter.",
    ramSize: 256,
    source: `; Multiply 6 x 7 = 42
; Uses repeated addition
  LDI 0
  STA result     ; result = 0
  LDA count      ; A = multiplier

loop:
  JZ done        ; count == 0 → done
  LDA result
  ADD value      ; result += multiplicand
  STA result
  LDA count
  SUB one        ; count--
  STA count
  JMP loop

done:
  LDA result
  OUT            ; Display 42
  HLT

value:  DB 6     ; Multiplicand
count:  DB 7     ; Multiplier
one:    DB 1
result: DB 0`,
    narration: [
      {
        pc: 0,
        text: "LDI 0 — Initializes Register A to 0. In 256B mode, each instruction is 2 bytes: an opcode byte and an operand byte. The fetch cycle takes 4 T-states instead of 2.",
        highlight: "regA",
      },
      {
        pc: 4,
        text: "LDA count — Loads the multiplier (7) into Register A. We\u2019ll use this as a loop counter, decrementing it each iteration.",
        highlight: "regA",
      },
      {
        pc: 6,
        text: "JZ done — Checks if A (the counter) is zero. Since count = 7, the Zero flag is not set, so we enter the loop body.",
        highlight: "pc",
      },
      {
        pc: 8,
        text: "LDA result + ADD value — Loads the running result (0) and adds the multiplicand (6). First pass: 0 + 6 = 6.",
        highlight: "alu",
      },
      {
        pc: 14,
        text: "LDA count + SUB one — Loads the counter and decrements it by 1. count goes from 7 to 6.",
        highlight: "alu",
      },
      {
        pc: 20,
        text: "JMP loop — Jumps back to check the counter. Each iteration adds 6 to result and decrements count by 1.",
        highlight: "pc",
      },
      {
        pc: 6,
        text: "Loop continues! The process repeats 7 times total: result accumulates 6 + 6 + 6 + 6 + 6 + 6 + 6 = 42. Press Continue or Run to watch.",
      },
      {
        pc: 22,
        text: "count reached 0! JZ jumps to \u2018done\u2019. LDA result loads 42 into A, then OUT displays the final answer: 6 \u00d7 7 = 42.",
        highlight: "output",
      },
    ],
  },
  {
    id: "powers-256",
    name: "Powers of 2",
    description: "Outputs 1, 2, 4, 8, 16, 32, 64, 128 by doubling A each iteration.",
    ramSize: 256,
    source: `; Powers of 2: double until overflow
  LDI 1          ; A = 1

loop:
  OUT            ; Display current power
  STA temp       ; Save A
  ADD temp       ; A = A + A (double)
  JC done        ; Overflow → halt
  JMP loop

done: HLT

temp: DB 0`,
  },
  {
    id: "triangles-256",
    name: "Triangle Numbers",
    description: "Computes 1, 3, 6, 10, 15, 21, ... (cumulative sums 1+2+3+...).",
    ramSize: 256,
    source: `; Triangle numbers: sum of 1+2+3+...
  LDI 0
  STA sum        ; sum = 0
  LDI 1
  STA n          ; n = 1

loop:
  LDA sum
  ADD n          ; sum += n
  JC done        ; Overflow → halt
  STA sum
  OUT            ; Display sum
  LDA n
  ADD one        ; n++
  STA n
  JMP loop

done: HLT

sum: DB 0
n:   DB 0
one: DB 1`,
  },
  {
    id: "countdown-256",
    name: "Count Down",
    description: "Counts from 10 to 0. Simple demonstration of SUB and JZ.",
    ramSize: 256,
    source: `; Count down from 10 to 0
  LDA start      ; A = 10

loop:
  OUT            ; Display
  JZ done        ; Zero → stop
  SUB one        ; A = A - 1
  JMP loop

done: HLT

start: DB 10
one:   DB 1`,
  },
];

/** Get programs for a given RAM size. */
export function getPrograms(ramSize: RamSize): SampleProgram[] {
  return ramSize === 256 ? PROGRAMS_256 : PROGRAMS_16;
}
