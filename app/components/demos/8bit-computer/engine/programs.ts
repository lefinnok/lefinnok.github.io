import type { RamSize } from "./types";

export interface SampleProgram {
  id: string;
  name: string;
  description: string;
  source: string;
  ramSize: RamSize;
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
