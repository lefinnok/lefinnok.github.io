import { useEffect, useCallback } from "react";
import { Button, Stack, Slider, Divider, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { TStateIndicator } from "./TStateIndicator";

const ACCENT = "#f97316";

interface ControlBarProps {
  tState: number;
  halted: boolean;
  running: boolean;
  speed: number;
  tStateCount: number;
  fetchLen: number;
  onTick: () => void;
  onStep: () => void;
  onRunToggle: () => void;
  onReset: () => void;
  onSpeedChange: (ms: number) => void;
}

export function ControlBar({
  tState,
  halted,
  running,
  speed,
  tStateCount,
  fetchLen,
  onTick,
  onStep,
  onRunToggle,
  onReset,
  onSpeedChange,
}: ControlBarProps) {
  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (!halted) onTick();
          break;
        case "Enter":
          e.preventDefault();
          if (!halted) onStep();
          break;
        case "r":
        case "R":
          e.preventDefault();
          if (!halted) onRunToggle();
          break;
        case "Escape":
          e.preventDefault();
          onReset();
          break;
      }
    },
    [halted, onTick, onStep, onRunToggle, onReset],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const btnSx = {
    fontSize: 11,
    borderColor: "rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.7)",
    textTransform: "none" as const,
    minWidth: 0,
    px: 1.5,
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ flexWrap: "wrap", gap: 1 }}
    >
      <Button
        size="small"
        variant="outlined"
        onClick={onTick}
        disabled={halted}
        startIcon={<NavigateNextIcon sx={{ fontSize: 16 }} />}
        sx={btnSx}
      >
        Tick
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={onStep}
        disabled={halted}
        startIcon={<SkipNextIcon sx={{ fontSize: 16 }} />}
        sx={btnSx}
        data-tutorial="step-btn"
      >
        Step
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={onRunToggle}
        disabled={halted}
        startIcon={
          running ? (
            <PauseIcon sx={{ fontSize: 16 }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: 16 }} />
          )
        }
        sx={{
          ...btnSx,
          borderColor: running ? ACCENT : "rgba(255,255,255,0.2)",
          color: running ? ACCENT : "rgba(255,255,255,0.7)",
        }}
        data-tutorial="run-btn"
      >
        {running ? "Pause" : "Run"}
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={onReset}
        startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
        sx={btnSx}
      >
        Reset
      </Button>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Typography
        sx={{
          fontSize: 10,
          color: "rgba(255,255,255,0.4)",
          minWidth: 36,
          fontFamily: "'Fira Code', monospace",
        }}
      >
        {speed >= 1000
          ? `${(speed / 1000).toFixed(1)}s`
          : `${speed}ms`}
      </Typography>
      <Slider
        size="small"
        min={50}
        max={2000}
        step={50}
        value={speed}
        onChange={(_, v) => onSpeedChange(v as number)}
        sx={{
          width: 80,
          color: "rgba(255,255,255,0.3)",
          "& .MuiSlider-thumb": { width: 12, height: 12 },
        }}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <TStateIndicator tState={tState} halted={halted} count={tStateCount} fetchLen={fetchLen} />
    </Stack>
  );
}
