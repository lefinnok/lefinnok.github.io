import { Box, Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import type { SampleProgram } from "../engine/programs";

const MONO = "'Fira Code', monospace";
const SECONDARY = "#00e5ff";

interface GuidedDemoPanelProps {
  program: SampleProgram;
  narrationIndex: number;
  running: boolean;
  halted: boolean;
  onContinue: () => void;
  onExit: () => void;
}

export function GuidedDemoPanel({
  program,
  narrationIndex,
  running,
  halted,
  onContinue,
  onExit,
}: GuidedDemoPanelProps) {
  const narration = program.narration!;
  const step = narration[narrationIndex];
  const total = narration.length;
  const isLast = narrationIndex >= total - 1;
  const progress = ((narrationIndex + 1) / total) * 100;

  return (
    <Paper
      sx={{
        bgcolor: "#141414",
        border: "1px solid",
        borderColor: `${SECONDARY}30`,
        borderRadius: 1,
        p: 1.5,
        mt: 1.5,
      }}
    >
      <Stack spacing={1.2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontSize: 10,
              fontFamily: MONO,
              fontWeight: 600,
              color: SECONDARY,
              letterSpacing: 0.5,
            }}
          >
            GUIDED DEMO
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              sx={{
                fontSize: 9,
                fontFamily: MONO,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              {narrationIndex + 1} / {total}
            </Typography>
            <Button
              size="small"
              onClick={onExit}
              sx={{
                minWidth: 0,
                p: 0.3,
                color: "rgba(255,255,255,0.3)",
                "&:hover": { color: "rgba(255,255,255,0.6)" },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </Button>
          </Stack>
        </Stack>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 2,
            borderRadius: 1,
            bgcolor: "rgba(255,255,255,0.05)",
            "& .MuiLinearProgress-bar": { bgcolor: SECONDARY },
          }}
        />

        {/* Program name */}
        <Typography
          sx={{
            fontSize: 11,
            fontFamily: MONO,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {program.name}
          <Box component="span" sx={{ color: "rgba(255,255,255,0.2)", ml: 0.5 }}>
            ({program.ramSize}B)
          </Box>
        </Typography>

        {/* Narration text */}
        <Typography
          sx={{
            fontSize: 12,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.7,
            py: 0.5,
          }}
        >
          {step.text}
        </Typography>

        {/* Module hint */}
        {step.highlight && (
          <Typography
            sx={{
              fontSize: 10,
              fontFamily: MONO,
              color: `${SECONDARY}80`,
            }}
          >
            Watch: {step.highlight}
          </Typography>
        )}

        {/* Continue button */}
        <Box>
          <Button
            size="small"
            variant="contained"
            onClick={onContinue}
            disabled={(isLast && halted) || running}
            startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 11,
              textTransform: "none",
              bgcolor: SECONDARY,
              color: "#000",
              fontWeight: 600,
              "&:hover": { bgcolor: "#00b8d4" },
              "&.Mui-disabled": {
                bgcolor: "rgba(0,229,255,0.1)",
                color: "rgba(0,229,255,0.3)",
              },
            }}
          >
            {running
              ? "Running\u2026"
              : isLast
                ? halted
                  ? "Complete"
                  : "Run to End"
                : "Continue"}
          </Button>
        </Box>

        {/* Step dots */}
        <Stack direction="row" spacing={0.4} sx={{ pt: 0.25 }}>
          {narration.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor:
                  i < narrationIndex
                    ? `${SECONDARY}60`
                    : i === narrationIndex
                      ? SECONDARY
                      : "rgba(255,255,255,0.08)",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
