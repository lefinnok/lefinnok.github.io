import { useEffect, useState, useRef, useCallback } from "react";
import { Box, Paper, Typography, Button, Stack, Portal } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { TutorialStep } from "./useTutorial";

const ACCENT = "#00e5ff";
const MONO = "'Fira Code', monospace";
const OVERLAY_COLOR = "rgba(0,0,0,0.7)";
const TRANSITION_MS = 350;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Props {
  steps: TutorialStep[];
  stepIndex: number;
  onNext: () => void;
  onExit: () => void;
}

function getClipPath(rect: Rect | null, padding: number): string {
  if (!rect) return "none";
  const t = rect.top - padding;
  const l = rect.left - padding;
  const r = rect.left + rect.width + padding;
  const b = rect.top + rect.height + padding;
  // Polygon covering viewport with rectangular hole
  return `polygon(
    0% 0%, 0% 100%,
    ${l}px 100%, ${l}px ${t}px,
    ${r}px ${t}px, ${r}px ${b}px,
    ${l}px ${b}px, ${l}px 100%,
    100% 100%, 100% 0%
  )`;
}

function computeTooltipPosition(
  rect: Rect | null,
  placement: "top" | "bottom" | "left" | "right",
  padding: number,
  tooltipWidth: number,
  tooltipHeight: number,
): { top: number; left: number } {
  if (!rect) {
    // Bottom-right corner — stays out of the way of main content
    const margin = 24;
    return {
      top: window.innerHeight - tooltipHeight - margin,
      left: window.innerWidth - tooltipWidth - margin,
    };
  }

  const gap = 12;
  let top = 0;
  let left = 0;

  switch (placement) {
    case "bottom":
      top = rect.top + rect.height + padding + gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case "top":
      top = rect.top - padding - gap - tooltipHeight;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case "right":
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left + rect.width + padding + gap;
      break;
    case "left":
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - padding - gap - tooltipWidth;
      break;
  }

  // Clamp to viewport
  const margin = 12;
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));

  return { top, left };
}

export function TutorialSpotlight({ steps, stepIndex, onNext, onExit }: Props) {
  const step = steps[stepIndex];
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ w: 320, h: 200 });

  const padding = step?.spotlightPadding ?? 8;
  const placement = step?.placement ?? "bottom";

  // Find and track the target element
  const updateRect = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-tutorial="${step.target}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    } else {
      setTargetRect(null);
    }
  }, [step?.target]);

  useEffect(() => {
    updateRect();

    // Track resize and scroll
    const handleUpdate = () => updateRect();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    // Poll briefly to catch elements that appear after render
    const pollId = setInterval(updateRect, 300);
    const stopPoll = setTimeout(() => clearInterval(pollId), 3000);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      clearInterval(pollId);
      clearTimeout(stopPoll);
    };
  }, [updateRect]);

  // Measure tooltip
  useEffect(() => {
    if (tooltipRef.current) {
      const r = tooltipRef.current.getBoundingClientRect();
      setTooltipSize({ w: r.width, h: r.height });
    }
  }, [stepIndex]);

  // Scroll target into view, or scroll to demo container for free-action steps
  useEffect(() => {
    if (step?.target) {
      const el = document.querySelector(`[data-tutorial="${step.target}"]`);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        setTimeout(updateRect, 400);
      }
    } else {
      // No target — scroll the demo container into view so it's centered
      const demo = document.querySelector("[data-tutorial-demo]");
      if (demo) {
        demo.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [step?.target, updateRect]);

  // Escape key to exit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onExit]);

  if (!step) return null;

  const clipPath = step.target ? getClipPath(targetRect, padding) : "none";
  const tooltipPos = computeTooltipPosition(
    targetRect,
    placement,
    padding,
    tooltipSize.w,
    tooltipSize.h,
  );

  const isLast = stepIndex >= steps.length - 1;

  const hasTarget = !!(step.target && targetRect);
  // When there's no target and the step is auto-advance, the user needs to
  // interact freely with the UI underneath — make the overlay non-blocking.
  const overlayPassThrough = !hasTarget && step.advance === "auto";

  return (
    <Portal>
      {/* Dark overlay — clip-path punches a clickable hole for the target */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          bgcolor: overlayPassThrough ? "rgba(0,0,0,0.35)" : OVERLAY_COLOR,
          // When there's a target, clip-path creates a hole. Clicks in the hole
          // pass through because clip-path excludes both visual and hit-test area.
          clipPath: hasTarget ? clipPath : "none",
          transition: hasTarget ? `clip-path ${TRANSITION_MS}ms ease` : "none",
          pointerEvents: overlayPassThrough ? "none" : "auto",
        }}
      />

      {/* Spotlight glow ring around target */}
      {hasTarget && (
        <Box
          sx={{
            position: "fixed",
            top: targetRect!.top - padding,
            left: targetRect!.left - padding,
            width: targetRect!.width + padding * 2,
            height: targetRect!.height + padding * 2,
            border: `1.5px solid ${ACCENT}`,
            borderRadius: 1,
            boxShadow: `0 0 20px ${ACCENT}40, inset 0 0 20px ${ACCENT}10`,
            pointerEvents: "none",
            transition: `all ${TRANSITION_MS}ms ease`,
            zIndex: 1301,
          }}
        />
      )}

      {/* Tooltip */}
      <Paper
        ref={tooltipRef}
        elevation={8}
        sx={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 320,
          maxWidth: "calc(100vw - 24px)",
          zIndex: 1302,
          bgcolor: "#1a1a1a",
          border: "1px solid",
          borderColor: `${ACCENT}40`,
          borderRadius: 2,
          p: 2.5,
          transition: `top ${TRANSITION_MS}ms ease, left ${TRANSITION_MS}ms ease`,
        }}
      >
        {/* Step counter */}
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: "0.6rem",
            color: ACCENT,
            mb: 0.5,
            letterSpacing: 0.5,
          }}
        >
          STEP {stepIndex + 1} / {steps.length}
        </Typography>

        {/* Title */}
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            mb: 1,
          }}
        >
          {step.title}
        </Typography>

        {/* Content */}
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.7,
            mb: 2,
          }}
        >
          {step.content}
        </Typography>

        {/* Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            size="small"
            onClick={onExit}
            sx={{
              fontSize: "0.65rem",
              fontFamily: MONO,
              color: "rgba(255,255,255,0.3)",
              textTransform: "none",
              p: 0,
              minWidth: 0,
              "&:hover": { color: "rgba(255,255,255,0.6)", bgcolor: "transparent" },
            }}
          >
            Skip Tutorial
          </Button>

          {step.advance === "manual" ? (
            <Button
              size="small"
              variant="contained"
              onClick={onNext}
              endIcon={!isLast ? <ArrowForwardIcon sx={{ fontSize: 14 }} /> : undefined}
              sx={{
                fontSize: "0.7rem",
                fontFamily: MONO,
                textTransform: "none",
                bgcolor: ACCENT,
                color: "#000",
                fontWeight: 600,
                px: 2,
                "&:hover": { bgcolor: "#00b8d4" },
              }}
            >
              {isLast ? "Finish" : "Next"}
            </Button>
          ) : (
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: "0.65rem",
                color: `${ACCENT}80`,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: ACCENT,
                  animation: "tutorialPulse 1.5s ease infinite",
                  "@keyframes tutorialPulse": {
                    "0%, 100%": { opacity: 0.3 },
                    "50%": { opacity: 1 },
                  },
                }}
              />
              Waiting for action...
            </Typography>
          )}
        </Stack>

        {/* Progress dots */}
        <Stack direction="row" spacing={0.4} sx={{ mt: 1.5, justifyContent: "center" }}>
          {steps.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor:
                  i < stepIndex
                    ? `${ACCENT}60`
                    : i === stepIndex
                      ? ACCENT
                      : "rgba(255,255,255,0.1)",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </Stack>
      </Paper>
    </Portal>
  );
}
