import { useReducer, useCallback, useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
  Chip,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MemoryIcon from "@mui/icons-material/Memory";
import { createInitialState, stepCpu, stepInstruction, disassemble } from "./engine/cpu";
import { assemble } from "./engine/assembler";
import {
  type CpuState,
  type ModuleId,
  type RamSize,
  CS_NAMES,
  tStateLabel,
  tStateCount,
  fetchLength,
} from "./engine/types";
import { ArchitectureSvg } from "./views/ArchitectureSvg";
import { ControlBar } from "./controls/ControlBar";

// ── Colors ──────────────────────────────────────────────────────

const ACCENT = "#f97316";
const SECONDARY = "#00e5ff";

// ── State management ────────────────────────────────────────────

interface SimState {
  cpu: CpuState;
  source: string;
  assembleErrors: { line: number; message: string }[];
  ramSize: RamSize;
}

type SimAction =
  | { type: "STEP" }
  | { type: "STEP_INSTRUCTION" }
  | { type: "RESET" }
  | { type: "LOAD"; program: number[]; errors: { line: number; message: string }[] }
  | { type: "SET_SOURCE"; source: string }
  | { type: "SET_RAM_SIZE"; ramSize: RamSize };

const DEFAULT_SOURCE_16 = `; Add two numbers
LDA 14     ; Load value at addr 14
ADD 15     ; Add value at addr 15
OUT        ; Display result
HLT        ; Stop

ORG 14     ; Place data at addr 14
DB 28      ; First number
DB 14      ; Second number`;

const DEFAULT_SOURCE_256 = `; Add two numbers (256B mode)
LDA data1  ; Load first number
ADD data2  ; Add second number
OUT        ; Display result
HLT        ; Stop

data1: DB 28   ; First number
data2: DB 14   ; Second number`;

function createInitialSimState(): SimState {
  const ramSize: RamSize = 16;
  const result = assemble(DEFAULT_SOURCE_16, ramSize);
  return {
    cpu: createInitialState(result.program, ramSize),
    source: DEFAULT_SOURCE_16,
    assembleErrors: result.errors,
    ramSize,
  };
}

function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "STEP":
      return { ...state, cpu: stepCpu(state.cpu) };
    case "STEP_INSTRUCTION":
      return { ...state, cpu: stepInstruction(state.cpu) };
    case "RESET": {
      const result = assemble(state.source, state.ramSize);
      return {
        ...state,
        cpu: createInitialState(result.program, state.ramSize),
        assembleErrors: result.errors,
      };
    }
    case "LOAD":
      return {
        ...state,
        cpu: createInitialState(action.program, state.ramSize),
        assembleErrors: action.errors,
      };
    case "SET_SOURCE":
      return { ...state, source: action.source };
    case "SET_RAM_SIZE": {
      const newSource =
        action.ramSize === 256 ? DEFAULT_SOURCE_256 : DEFAULT_SOURCE_16;
      const result = assemble(newSource, action.ramSize);
      return {
        cpu: createInitialState(result.program, action.ramSize),
        source: newSource,
        assembleErrors: result.errors,
        ramSize: action.ramSize,
      };
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function toHex(val: number, pad = 2): string {
  return val.toString(16).toUpperCase().padStart(pad, "0");
}

function activeSignalNames(controlWord: number): string[] {
  const names: string[] = [];
  for (let i = 0; i < 16; i++) {
    if (controlWord & (1 << i)) names.push(CS_NAMES[i]);
  }
  return names;
}

// ── Component ───────────────────────────────────────────────────

export default function TransistorSimulator() {
  const [state, dispatch] = useReducer(simReducer, null, createInitialSimState);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null);
  const [viewMode, setViewMode] = useState<"diagram" | "dashboard">("diagram");
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const { cpu, source, assembleErrors, ramSize } = state;

  // Auto-run
  useEffect(() => {
    if (running && !cpu.halted) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "STEP" });
      }, speed);
      return () => clearInterval(intervalRef.current);
    }
    if (cpu.halted && running) setRunning(false);
    return () => clearInterval(intervalRef.current);
  }, [running, speed, cpu.halted]);

  const handleAssemble = useCallback(() => {
    const result = assemble(source, ramSize);
    dispatch({ type: "LOAD", program: result.program, errors: result.errors });
    setRunning(false);
  }, [source, ramSize]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    setRunning(false);
  }, []);

  const signals = activeSignalNames(cpu.controlWord);
  const tCount = tStateCount(ramSize);
  const fLen = fetchLength(ramSize);

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#0a0a0a",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: { xs: 1.5, md: 3 },
        overflow: "hidden",
      }}
    >
      {/* Header + view toggle + RAM mode */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 14,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          8-Bit Computer Simulator
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* RAM size toggle */}
          <ToggleButtonGroup
            value={ramSize}
            exclusive
            onChange={(_, v) => {
              if (v) {
                dispatch({ type: "SET_RAM_SIZE", ramSize: v });
                setRunning(false);
              }
            }}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 1,
                py: 0.3,
                fontSize: 10,
                fontFamily: "'Fira Code', monospace",
                color: "rgba(255,255,255,0.4)",
                borderColor: "rgba(255,255,255,0.1)",
                textTransform: "none",
                "&.Mui-selected": {
                  color: SECONDARY,
                  bgcolor: "rgba(0,229,255,0.1)",
                  borderColor: "rgba(0,229,255,0.3)",
                  "&:hover": { bgcolor: "rgba(0,229,255,0.15)" },
                },
              },
            }}
          >
            <ToggleButton value={16}>
              <MemoryIcon sx={{ fontSize: 12, mr: 0.5 }} /> 16B
            </ToggleButton>
            <ToggleButton value={256}>
              <MemoryIcon sx={{ fontSize: 12, mr: 0.5 }} /> 256B
            </ToggleButton>
          </ToggleButtonGroup>

          {/* View mode toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => { if (v) setViewMode(v); }}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 1.2,
                py: 0.3,
                fontSize: 10,
                fontFamily: "'Fira Code', monospace",
                color: "rgba(255,255,255,0.4)",
                borderColor: "rgba(255,255,255,0.1)",
                textTransform: "none",
                "&.Mui-selected": {
                  color: ACCENT,
                  bgcolor: "rgba(249,115,22,0.1)",
                  borderColor: "rgba(249,115,22,0.3)",
                  "&:hover": { bgcolor: "rgba(249,115,22,0.15)" },
                },
              },
            }}
          >
            <ToggleButton value="diagram">
              <AccountTreeIcon sx={{ fontSize: 14, mr: 0.5 }} /> Diagram
            </ToggleButton>
            <ToggleButton value="dashboard">
              <DashboardIcon sx={{ fontSize: 14, mr: 0.5 }} /> Dashboard
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Control bar */}
      <Box sx={{ mb: 2 }}>
        <ControlBar
          tState={cpu.tState}
          halted={cpu.halted}
          running={running}
          speed={speed}
          tStateCount={tCount}
          fetchLen={fLen}
          onTick={() => dispatch({ type: "STEP" })}
          onStep={() => dispatch({ type: "STEP_INSTRUCTION" })}
          onRunToggle={() => setRunning((r) => !r)}
          onReset={handleReset}
          onSpeedChange={setSpeed}
        />
      </Box>

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* Primary view — diagram or dashboard */}
        <Box sx={{ flex: 3, minWidth: 0 }}>
          {viewMode === "diagram" ? (
            <>
              <ArchitectureSvg
                cpu={cpu}
                selectedModule={selectedModule}
                onSelectModule={setSelectedModule}
              />
              {signals.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                  {signals.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 9,
                        fontFamily: "'Fira Code', monospace",
                        bgcolor: "rgba(249,115,22,0.15)",
                        color: ACCENT,
                        border: "1px solid rgba(249,115,22,0.3)",
                      }}
                    />
                  ))}
                </Stack>
              )}
            </>
          ) : (
            <DashboardView cpu={cpu} />
          )}
        </Box>

        {/* Side panel: Assembly editor + RAM + Output */}
        <Box sx={{ flex: 2, minWidth: 0, maxWidth: { lg: 340 } }}>
          {/* Assembly editor */}
          <SectionLabel>ASSEMBLY {ramSize === 256 && "(2-byte instructions)"}</SectionLabel>
          <TextField
            multiline
            minRows={8}
            maxRows={12}
            value={source}
            onChange={(e) =>
              dispatch({ type: "SET_SOURCE", source: e.target.value })
            }
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                fontFamily: "'Fira Code', monospace",
                fontSize: 11,
                lineHeight: 1.6,
                bgcolor: "#141414",
                color: "rgba(255,255,255,0.8)",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.1)",
              },
            }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={handleAssemble}
            sx={{
              mt: 1,
              fontSize: 11,
              bgcolor: ACCENT,
              color: "#000",
              "&:hover": { bgcolor: "#ea580c" },
              textTransform: "none",
            }}
          >
            Assemble & Load
          </Button>
          {assembleErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 1, fontSize: 11, py: 0 }}>
              {assembleErrors.map((e, i) => (
                <Box key={i}>Line {e.line}: {e.message}</Box>
              ))}
            </Alert>
          )}

          {/* RAM grid */}
          <SectionLabel sx={{ mt: 2 }}>
            RAM ({ramSize === 256 ? "256" : "16"} x 8)
          </SectionLabel>
          <RamGrid cpu={cpu} />

          {/* Output history */}
          {cpu.outputHistory.length > 0 && (
            <>
              <SectionLabel sx={{ mt: 2 }}>OUTPUT</SectionLabel>
              <Paper sx={{ bgcolor: "#141414", p: 1, borderRadius: 1 }}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {cpu.outputHistory.map((val, i) => (
                    <Chip
                      key={i}
                      label={`${val} (0x${toHex(val)})`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontFamily: "'Fira Code', monospace",
                        bgcolor: "rgba(0,229,255,0.1)",
                        color: SECONDARY,
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            </>
          )}
        </Box>
      </Box>

      {/* Footer status */}
      <Typography
        sx={{
          mt: 2,
          fontSize: 10,
          color: "rgba(255,255,255,0.25)",
          fontFamily: "'Fira Code', monospace",
          textAlign: "right",
        }}
      >
        Cycle {cpu.cycleCount} &middot; T{cpu.tState} &middot;{" "}
        {tStateLabel(cpu.tState, ramSize)}
        {cpu.halted && (
          <Box component="span" sx={{ color: "#ef4444", ml: 1 }}>
            HALTED
          </Box>
        )}
      </Typography>
    </Paper>
  );
}

// ── RAM grid ────────────────────────────────────────────────────

function RamGrid({ cpu }: { cpu: CpuState }) {
  const { ramSize } = cpu;
  const extended = ramSize === 256;
  // In extended mode, show a scrollable grid; in classic, show all 16 rows
  // For 256B, show 16 rows at a time around the current area of interest
  const [ramPage, setRamPage] = useState(0);

  const pageSize = 16;
  const totalPages = ramSize / pageSize;
  const startAddr = ramPage * pageSize;

  // Auto-follow MAR to relevant page in extended mode
  useEffect(() => {
    if (extended) {
      const marPage = Math.floor(cpu.mar / pageSize);
      setRamPage(marPage);
    }
  }, [cpu.mar, extended]);

  return (
    <Paper sx={{ bgcolor: "#141414", p: 1, borderRadius: 1 }}>
      {extended && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
          <Button
            size="small"
            disabled={ramPage === 0}
            onClick={() => setRamPage((p) => Math.max(0, p - 1))}
            sx={{ minWidth: 24, fontSize: 10, color: "rgba(255,255,255,0.4)", p: 0 }}
          >
            &lt;
          </Button>
          <Typography
            sx={{
              fontSize: 9,
              fontFamily: "'Fira Code', monospace",
              color: "rgba(255,255,255,0.4)",
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {toHex(startAddr)}-{toHex(startAddr + pageSize - 1)} ({ramPage + 1}/{totalPages})
          </Typography>
          <Button
            size="small"
            disabled={ramPage >= totalPages - 1}
            onClick={() => setRamPage((p) => Math.min(totalPages - 1, p + 1))}
            sx={{ minWidth: 24, fontSize: 10, color: "rgba(255,255,255,0.4)", p: 0 }}
          >
            &gt;
          </Button>
        </Stack>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0.25 }}>
        {Array.from({ length: pageSize }, (_, idx) => {
          const i = startAddr + idx;
          if (i >= ramSize) return null;
          const val = cpu.ram[i];
          // In extended mode, show 2-byte instruction disassembly on even addresses
          let decoded: string;
          if (extended && i % 2 === 0 && i + 1 < ramSize) {
            decoded = disassemble(val, cpu.ram[i + 1], ramSize);
          } else if (extended && i % 2 === 1) {
            decoded = `(${toHex(val)})`;
          } else {
            decoded = disassemble(val);
          }
          return (
            <Box
              key={i}
              sx={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                bgcolor:
                  i === cpu.mar
                    ? "rgba(249,115,22,0.12)"
                    : i === cpu.pc && cpu.tState === 0
                      ? "rgba(0,229,255,0.08)"
                      : "transparent",
                color: i === cpu.mar ? ACCENT : "rgba(255,255,255,0.5)",
              }}
            >
              <Box component="span" sx={{ color: "rgba(255,255,255,0.25)", mr: 0.5 }}>
                {i.toString(16).toUpperCase().padStart(extended ? 2 : 1, "0")}:
              </Box>
              {toHex(val)}
              <Box component="span" sx={{ color: "rgba(255,255,255,0.2)", ml: 0.5, fontSize: 9 }}>
                {decoded}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

// ── Section label ───────────────────────────────────────────────

function SectionLabel({ children, sx: sxProp }: { children: React.ReactNode; sx?: object }) {
  return (
    <Typography
      sx={{
        fontSize: 10,
        color: "rgba(255,255,255,0.4)",
        mb: 0.5,
        fontFamily: "'Fira Code', monospace",
        ...sxProp,
      }}
    >
      {children}
    </Typography>
  );
}

// ── Dashboard view (register / signal text readout) ─────────────

const MONO = "'Fira Code', monospace";

function DashboardView({ cpu }: { cpu: CpuState }) {
  const signals = activeSignalNames(cpu.controlWord);
  const extended = cpu.ramSize === 256;
  const addrBits = extended ? 8 : 4;

  return (
    <Paper sx={{ bgcolor: "#141414", p: 2, borderRadius: 1 }}>
      <Stack spacing={1.5}>
        {/* Registers */}
        <Box>
          <SectionLabel>REGISTERS</SectionLabel>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <RegRow label="A" value={cpu.regA} />
            <RegRow label="B" value={cpu.regB} />
            <RegRow
              label="IR"
              value={cpu.regIR}
              extra={disassemble(cpu.regIR, extended ? cpu.regOperand : undefined, cpu.ramSize)}
            />
            {extended && <RegRow label="OPR" value={cpu.regOperand} />}
            <RegRow label="OUT" value={cpu.regOut} />
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Addressing */}
        <Box>
          <SectionLabel>ADDRESSING</SectionLabel>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <RegRow label="PC" value={cpu.pc} bits={addrBits} />
            <RegRow label="MAR" value={cpu.mar} bits={addrBits} />
            <RegRow label="BUS" value={cpu.bus} highlight />
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Flags */}
        <Box>
          <SectionLabel>FLAGS</SectionLabel>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <FlagChip label="Carry" active={cpu.flagCarry} />
            <FlagChip label="Zero" active={cpu.flagZero} />
            {cpu.halted && (
              <Chip
                label="HALTED"
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontFamily: MONO,
                  bgcolor: "#ef4444",
                  color: "#fff",
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Active signals */}
        {signals.length > 0 && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
            <Box>
              <SectionLabel>ACTIVE SIGNALS</SectionLabel>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                {signals.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 9,
                      fontFamily: MONO,
                      bgcolor: "rgba(249,115,22,0.15)",
                      color: ACCENT,
                      border: "1px solid rgba(249,115,22,0.3)",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}

function RegRow({
  label,
  value,
  bits = 8,
  extra,
  highlight,
}: {
  label: string;
  value: number;
  bits?: number;
  extra?: string;
  highlight?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography
        sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.5)", width: 30, textAlign: "right" }}
      >
        {label}
      </Typography>
      {/* LED dots */}
      <Box sx={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: bits }, (_, i) => {
          const on = (value >> (bits - 1 - i)) & 1;
          return (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: on ? ACCENT : "rgba(255,255,255,0.06)",
                boxShadow: on ? `0 0 4px ${ACCENT}` : "none",
                transition: "background-color 0.15s, box-shadow 0.15s",
              }}
            />
          );
        })}
      </Box>
      <Typography sx={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.6)", minWidth: 24 }}>
        {value.toString(16).toUpperCase().padStart(bits <= 4 ? 1 : 2, "0")}
      </Typography>
      <Typography sx={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
        {value}
      </Typography>
      {extra && (
        <Typography sx={{ fontFamily: MONO, fontSize: 10, color: SECONDARY, ml: 0.5 }}>
          {extra}
        </Typography>
      )}
    </Box>
  );
}

function FlagChip({ label, active }: { label: string; active: boolean }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        fontSize: 10,
        fontFamily: MONO,
        bgcolor: active ? ACCENT : "rgba(255,255,255,0.05)",
        color: active ? "#000" : "rgba(255,255,255,0.3)",
        transition: "background-color 0.15s, color 0.15s",
      }}
    />
  );
}
