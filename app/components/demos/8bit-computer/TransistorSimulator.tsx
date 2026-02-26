import { useReducer, useCallback, useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  TextField,
  Alert,
  Slider,
  Divider,
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { createInitialState, stepCpu, stepInstruction, disassemble } from "./engine/cpu";
import { assemble } from "./engine/assembler";
import { type CpuState, CS_NAMES, T_STATE_COUNT, tStateLabel } from "./engine/types";

// ── Accent colors (matching site theme) ─────────────────────────

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

function toBin(val: number, bits: number): string {
  return val.toString(2).padStart(bits, "0");
}

function toHex(val: number): string {
  return val.toString(16).toUpperCase().padStart(2, "0");
}

function activeSignalNames(controlWord: number): string[] {
  const names: string[] = [];
  for (let i = 0; i < 16; i++) {
    if (controlWord & (1 << i)) {
      names.push(CS_NAMES[i]);
    }
  }
  return names;
}

// ── Component ───────────────────────────────────────────────────

export default function TransistorSimulator() {
  const [state, dispatch] = useReducer(simReducer, null, createInitialSimState);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per tick
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
    if (cpu.halted && running) {
      setRunning(false);
    }
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
        p: 3,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Typography
        variant="h6"
        sx={{ fontFamily: "'Fira Code', monospace", fontSize: 14, mb: 2, color: "rgba(255,255,255,0.7)" }}
      >
        8-Bit Computer Simulator
      </Typography>

      {/* Control bar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => dispatch({ type: "STEP" })}
          disabled={cpu.halted}
          startIcon={<NavigateNextIcon />}
          sx={{ fontSize: 11, borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
        >
          Tick
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => dispatch({ type: "STEP_INSTRUCTION" })}
          disabled={cpu.halted}
          startIcon={<SkipNextIcon />}
          sx={{ fontSize: 11, borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
        >
          Step
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setRunning((r) => !r)}
          disabled={cpu.halted}
          startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}
          sx={{
            fontSize: 11,
            borderColor: running ? ACCENT : "rgba(255,255,255,0.2)",
            color: running ? ACCENT : "rgba(255,255,255,0.7)",
          }}
        >
          {running ? "Pause" : "Run"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleReset}
          startIcon={<RestartAltIcon />}
          sx={{ fontSize: 11, borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
        >
          Reset
        </Button>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Speed slider */}
        <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", minWidth: 40 }}>
          {speed >= 1000 ? `${(speed / 1000).toFixed(1)}s` : `${speed}ms`}
        </Typography>
        <Slider
          size="small"
          min={50}
          max={2000}
          step={50}
          value={speed}
          onChange={(_, v) => setSpeed(v as number)}
          sx={{ width: 100, color: "rgba(255,255,255,0.3)", "& .MuiSlider-thumb": { width: 12, height: 12 } }}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* T-state indicator */}
        <TStateIndicator tState={cpu.tState} halted={cpu.halted} />
      </Stack>

      {/* Main content: 2 columns */}
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
        {/* Left: Assembly editor */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
            ASSEMBLY
          </Typography>
          <TextField
            multiline
            minRows={10}
            maxRows={16}
            value={source}
            onChange={(e) => dispatch({ type: "SET_SOURCE", source: e.target.value })}
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                fontFamily: "'Fira Code', monospace",
                fontSize: 12,
                lineHeight: 1.6,
                bgcolor: "#141414",
                color: "rgba(255,255,255,0.8)",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleAssemble}
              sx={{
                fontSize: 11,
                bgcolor: ACCENT,
                color: "#000",
                "&:hover": { bgcolor: "#ea580c" },
                textTransform: "none",
              }}
            >
              Assemble & Load
            </Button>
          </Stack>
          {assembleErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 1, fontSize: 11, py: 0 }}>
              {assembleErrors.map((e, i) => (
                <Box key={i}>
                  Line {e.line}: {e.message}
                </Box>
              ))}
            </Alert>
          )}
        </Box>

        {/* Right: CPU state */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
            CPU STATE
          </Typography>
          <Paper sx={{ bgcolor: "#141414", p: 1.5, borderRadius: 1 }}>
            {/* Registers */}
            <Stack spacing={0.5}>
              <RegisterRow label="A" value={cpu.regA} />
              <RegisterRow label="B" value={cpu.regB} />
              <RegisterRow label="IR" value={cpu.regIR} extra={disassemble(cpu.regIR)} />
              <RegisterRow label="OUT" value={cpu.regOut} />
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 0.5 }} />
              <RegisterRow label="PC" value={cpu.pc} bits={4} />
              <RegisterRow label="MAR" value={cpu.mar} bits={4} />
              <RegisterRow label="BUS" value={cpu.bus} highlight />
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 0.5 }} />
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography sx={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "rgba(255,255,255,0.5)", width: 30 }}>
                  FLAGS
                </Typography>
                <Chip
                  label="C"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontFamily: "'Fira Code', monospace",
                    bgcolor: cpu.flagCarry ? ACCENT : "rgba(255,255,255,0.05)",
                    color: cpu.flagCarry ? "#000" : "rgba(255,255,255,0.3)",
                  }}
                />
                <Chip
                  label="Z"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontFamily: "'Fira Code', monospace",
                    bgcolor: cpu.flagZero ? ACCENT : "rgba(255,255,255,0.05)",
                    color: cpu.flagZero ? "#000" : "rgba(255,255,255,0.3)",
                  }}
                />
                {cpu.halted && (
                  <Chip
                    label="HALTED"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: 10,
                      fontFamily: "'Fira Code', monospace",
                      bgcolor: "#ef4444",
                      color: "#fff",
                    }}
                  />
                )}
              </Box>
            </Stack>

            {/* Active signals */}
            {signals.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
                  SIGNALS
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
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
                        borderColor: "rgba(249,115,22,0.3)",
                        border: "1px solid",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>

          {/* RAM */}
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", mt: 1.5, mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
            RAM (16 x 8)
          </Typography>
          <Paper sx={{ bgcolor: "#141414", p: 1, borderRadius: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
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
                      i === cpu.mar
                        ? ACCENT
                        : "rgba(255,255,255,0.5)",
                  }}
                >
                  <Box component="span" sx={{ color: "rgba(255,255,255,0.25)", mr: 0.5 }}>
                    {i.toString(16).toUpperCase()}:
                  </Box>
                  {toHex(val)}
                  <Box component="span" sx={{ color: "rgba(255,255,255,0.2)", ml: 0.5, fontSize: 9 }}>
                    {disassemble(val)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Output history */}
          {cpu.outputHistory.length > 0 && (
            <>
              <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", mt: 1.5, mb: 0.5, fontFamily: "'Fira Code', monospace" }}>
                OUTPUT
              </Typography>
              <Paper sx={{ bgcolor: "#141414", p: 1, borderRadius: 1 }}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {cpu.outputHistory.map((val, i) => (
                    <Chip
                      key={i}
                      label={`${val} (${toHex(val)})`}
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

      {/* Cycle counter */}
      <Typography sx={{ mt: 2, fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Fira Code', monospace", textAlign: "right" }}>
        Cycle {cpu.cycleCount} &middot; T{cpu.tState} &middot; {tStateLabel(cpu.tState)}
      </Typography>
    </Paper>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function RegisterRow({
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
        sx={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          width: 30,
          textAlign: "right",
        }}
      >
        {label}
      </Typography>
      {/* LED strip */}
      <Box sx={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: bits }, (_, i) => {
          const bitVal = (value >> (bits - 1 - i)) & 1;
          return (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: bitVal
                  ? highlight
                    ? ACCENT
                    : ACCENT
                  : "rgba(255,255,255,0.06)",
                boxShadow: bitVal ? `0 0 4px ${ACCENT}` : "none",
                transition: "background-color 0.15s, box-shadow 0.15s",
              }}
            />
          );
        })}
      </Box>
      <Typography sx={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "rgba(255,255,255,0.6)", minWidth: 24 }}>
        {toHex(value)}
      </Typography>
      <Typography sx={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
        {value}
      </Typography>
      {extra && (
        <Typography sx={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: SECONDARY, ml: 0.5 }}>
          {extra}
        </Typography>
      )}
    </Box>
  );
}

function TStateIndicator({ tState, halted }: { tState: number; halted: boolean }) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {Array.from({ length: T_STATE_COUNT }, (_, i) => (
        <Box
          key={i}
          sx={{
            width: 22,
            height: 18,
            borderRadius: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            bgcolor:
              halted
                ? "rgba(239,68,68,0.15)"
                : i === tState
                  ? ACCENT
                  : "rgba(255,255,255,0.04)",
            color:
              halted
                ? "rgba(239,68,68,0.6)"
                : i === tState
                  ? "#000"
                  : "rgba(255,255,255,0.25)",
            transition: "background-color 0.15s, color 0.15s",
          }}
        >
          T{i}
        </Box>
      ))}
    </Stack>
  );
}
