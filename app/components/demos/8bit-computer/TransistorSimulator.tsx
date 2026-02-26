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
} from "@mui/material";
import { createInitialState, stepCpu, stepInstruction, disassemble } from "./engine/cpu";
import { assemble } from "./engine/assembler";
import { type CpuState, type ModuleId, CS_NAMES, tStateLabel } from "./engine/types";
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
}

type SimAction =
  | { type: "STEP" }
  | { type: "STEP_INSTRUCTION" }
  | { type: "RESET" }
  | { type: "LOAD"; program: number[]; errors: { line: number; message: string }[] }
  | { type: "SET_SOURCE"; source: string };

const DEFAULT_SOURCE = `; Add two numbers
LDA 14     ; Load value at addr 14
ADD 15     ; Add value at addr 15
OUT        ; Display result
HLT        ; Stop

ORG 14     ; Place data at addr 14
DB 28      ; First number
DB 14      ; Second number`;

function createInitialSimState(): SimState {
  const result = assemble(DEFAULT_SOURCE);
  return {
    cpu: createInitialState(result.program),
    source: DEFAULT_SOURCE,
    assembleErrors: result.errors,
  };
}

function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "STEP":
      return { ...state, cpu: stepCpu(state.cpu) };
    case "STEP_INSTRUCTION":
      return { ...state, cpu: stepInstruction(state.cpu) };
    case "RESET": {
      const result = assemble(state.source);
      return {
        ...state,
        cpu: createInitialState(result.program),
        assembleErrors: result.errors,
      };
    }
    case "LOAD":
      return {
        ...state,
        cpu: createInitialState(action.program),
        assembleErrors: action.errors,
      };
    case "SET_SOURCE":
      return { ...state, source: action.source };
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function toHex(val: number): string {
  return val.toString(16).toUpperCase().padStart(2, "0");
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
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const { cpu, source, assembleErrors } = state;

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
    const result = assemble(source);
    dispatch({ type: "LOAD", program: result.program, errors: result.errors });
    setRunning(false);
  }, [source]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    setRunning(false);
  }, []);

  const signals = activeSignalNames(cpu.controlWord);

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
      {/* Header */}
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 14,
          mb: 1.5,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        8-Bit Computer Simulator
      </Typography>

      {/* Control bar */}
      <Box sx={{ mb: 2 }}>
        <ControlBar
          tState={cpu.tState}
          halted={cpu.halted}
          running={running}
          speed={speed}
          onTick={() => dispatch({ type: "STEP" })}
          onStep={() => dispatch({ type: "STEP_INSTRUCTION" })}
          onRunToggle={() => setRunning((r) => !r)}
          onReset={handleReset}
          onSpeedChange={setSpeed}
        />
      </Box>

      {/* Main content: architecture + side panel */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* Architecture diagram */}
        <Box sx={{ flex: 3, minWidth: 0 }}>
          <ArchitectureSvg
            cpu={cpu}
            selectedModule={selectedModule}
            onSelectModule={setSelectedModule}
          />

          {/* Active signals bar */}
          {signals.length > 0 && (
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              sx={{ mt: 1 }}
            >
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
        </Box>

        {/* Side panel: Assembly editor + RAM + Output */}
        <Box sx={{ flex: 2, minWidth: 0, maxWidth: { lg: 340 } }}>
          {/* Assembly editor */}
          <Typography
            sx={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              mb: 0.5,
              fontFamily: "'Fira Code', monospace",
            }}
          >
            ASSEMBLY
          </Typography>
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
                <Box key={i}>
                  Line {e.line}: {e.message}
                </Box>
              ))}
            </Alert>
          )}

          {/* RAM grid */}
          <Typography
            sx={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              mt: 2,
              mb: 0.5,
              fontFamily: "'Fira Code', monospace",
            }}
          >
            RAM (16 x 8)
          </Typography>
          <Paper sx={{ bgcolor: "#141414", p: 1, borderRadius: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 0.25,
              }}
            >
              {cpu.ram.map((val, i) => (
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
                    color:
                      i === cpu.mar ? ACCENT : "rgba(255,255,255,0.5)",
                  }}
                >
                  <Box
                    component="span"
                    sx={{ color: "rgba(255,255,255,0.25)", mr: 0.5 }}
                  >
                    {i.toString(16).toUpperCase()}:
                  </Box>
                  {toHex(val)}
                  <Box
                    component="span"
                    sx={{
                      color: "rgba(255,255,255,0.2)",
                      ml: 0.5,
                      fontSize: 9,
                    }}
                  >
                    {disassemble(val)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Output history */}
          {cpu.outputHistory.length > 0 && (
            <>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  mt: 2,
                  mb: 0.5,
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                OUTPUT
              </Typography>
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
        {tStateLabel(cpu.tState)}
        {cpu.halted && (
          <Box component="span" sx={{ color: "#ef4444", ml: 1 }}>
            HALTED
          </Box>
        )}
      </Typography>
    </Paper>
  );
}
