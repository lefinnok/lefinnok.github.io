import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  type Landmark,
  HAND_CONNECTIONS,
  ANALYSIS_EDGES,
  FINGERTIP_INDICES,
  landmarksToSpectrum,
} from "~/components/demos/gesture-recognition/graphAlgorithm";
import { VerticalSpectrum } from "~/components/demos/gesture-recognition/ExplanationVisuals";

// ── Synthetic hand poses (21 landmarks each, x/y in 0..1 space) ──

function lm(x: number, y: number): Landmark {
  return { x, y, z: 0 };
}

// Centered hand — landmarks in ~0.3..0.7 range
const OPEN_HAND: Landmark[] = [
  lm(0.50, 0.82), // 0  wrist
  lm(0.40, 0.71), // 1  thumb CMC
  lm(0.33, 0.62), // 2  thumb MCP
  lm(0.28, 0.52), // 3  thumb IP
  lm(0.25, 0.43), // 4  thumb tip
  lm(0.42, 0.55), // 5  index MCP
  lm(0.40, 0.41), // 6  index PIP
  lm(0.39, 0.30), // 7  index DIP
  lm(0.38, 0.20), // 8  index tip
  lm(0.49, 0.52), // 9  middle MCP
  lm(0.49, 0.37), // 10 middle PIP
  lm(0.49, 0.26), // 11 middle DIP
  lm(0.49, 0.16), // 12 middle tip
  lm(0.56, 0.55), // 13 ring MCP
  lm(0.57, 0.41), // 14 ring PIP
  lm(0.58, 0.31), // 15 ring DIP
  lm(0.58, 0.22), // 16 ring tip
  lm(0.62, 0.60), // 17 pinky MCP
  lm(0.64, 0.50), // 18 pinky PIP
  lm(0.65, 0.41), // 19 pinky DIP
  lm(0.66, 0.34), // 20 pinky tip
];

const FIST: Landmark[] = [
  lm(0.50, 0.82),
  lm(0.40, 0.71),
  lm(0.36, 0.65),
  lm(0.40, 0.60),
  lm(0.45, 0.57),
  lm(0.42, 0.56),
  lm(0.43, 0.53),
  lm(0.46, 0.56),
  lm(0.48, 0.60),
  lm(0.49, 0.53),
  lm(0.50, 0.51),
  lm(0.52, 0.54),
  lm(0.52, 0.58),
  lm(0.56, 0.56),
  lm(0.56, 0.53),
  lm(0.56, 0.56),
  lm(0.55, 0.60),
  lm(0.62, 0.60),
  lm(0.61, 0.58),
  lm(0.60, 0.62),
  lm(0.58, 0.64),
];

const POINTING: Landmark[] = [
  lm(0.50, 0.82),
  lm(0.40, 0.71),
  lm(0.36, 0.65),
  lm(0.40, 0.60),
  lm(0.45, 0.57),
  lm(0.42, 0.55),
  lm(0.40, 0.41),
  lm(0.39, 0.30),
  lm(0.38, 0.20),
  lm(0.49, 0.53),
  lm(0.50, 0.51),
  lm(0.52, 0.54),
  lm(0.52, 0.58),
  lm(0.56, 0.56),
  lm(0.56, 0.53),
  lm(0.56, 0.56),
  lm(0.55, 0.60),
  lm(0.62, 0.60),
  lm(0.61, 0.58),
  lm(0.60, 0.62),
  lm(0.58, 0.64),
];

const PEACE: Landmark[] = [
  lm(0.50, 0.82),
  lm(0.40, 0.71),
  lm(0.36, 0.65),
  lm(0.40, 0.60),
  lm(0.45, 0.57),
  lm(0.42, 0.55),
  lm(0.39, 0.41),
  lm(0.37, 0.30),
  lm(0.35, 0.20),
  lm(0.49, 0.52),
  lm(0.50, 0.37),
  lm(0.52, 0.26),
  lm(0.54, 0.16),
  lm(0.56, 0.56),
  lm(0.56, 0.53),
  lm(0.56, 0.56),
  lm(0.55, 0.60),
  lm(0.62, 0.60),
  lm(0.61, 0.58),
  lm(0.60, 0.62),
  lm(0.58, 0.64),
];

const POSES = [OPEN_HAND, FIST, POINTING, PEACE];
const POSE_LABELS = ["Open Hand", "Fist", "Pointing", "Peace"];
const HOLD_MS = 1800;
const TRANSITION_MS = 1200;

const ACCENT = "#00e5ff";
const SKELETON_COLOR = "rgba(255,255,255,0.25)";
const ANALYSIS_COLOR = "rgba(0,229,255,0.12)";
const JOINT_COLOR = "rgba(255,255,255,0.5)";
const FINGERTIP_COLOR = "rgba(0,229,255,0.7)";

// ── Animation helpers ────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPose(from: Landmark[], to: Landmark[], t: number): Landmark[] {
  return from.map((f, i) => ({
    x: lerp(f.x, to[i].x, t),
    y: lerp(f.y, to[i].y, t),
    z: 0,
  }));
}

/**
 * Spring-like ease: fast start, gentle overshoot, smooth settle.
 * Creates the organic momentum feel of a real hand moving.
 */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

/** Smooth ease-in-out with stronger deceleration. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// ── Canvas dimensions ────────────────────────────────────────────

const CANVAS_W = 320;
const CANVAS_H = 400;
const DPR = 2;

export default function GestureSkeletonPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<number[]>([]);
  const labelRef = useRef(POSE_LABELS[0]);
  const [, forceRender] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Drawing space
    const w = CANVAS_W / DPR;
    const h = CANVAS_H / DPR;

    let startTime = performance.now();
    let cancelled = false;
    let lastSpecFrame = -1;

    // Per-joint velocity for subtle trailing effect
    let prevLandmarks: Landmark[] | null = null;
    const velocities: { vx: number; vy: number }[] = Array.from(
      { length: 21 },
      () => ({ vx: 0, vy: 0 })
    );

    function draw(now: number) {
      if (cancelled) return;

      const elapsed = now - startTime;
      const cycleLen = HOLD_MS + TRANSITION_MS;
      const totalLoop = cycleLen * POSES.length;
      const loopTime = elapsed % totalLoop;

      const poseIdx = Math.floor(loopTime / cycleLen) % POSES.length;
      const poseElapsed = loopTime % cycleLen;

      let baseLandmarks: Landmark[];
      if (poseElapsed < HOLD_MS) {
        baseLandmarks = POSES[poseIdx];
      } else {
        const nextIdx = (poseIdx + 1) % POSES.length;
        const raw = (poseElapsed - HOLD_MS) / TRANSITION_MS;
        // Use back-ease for organic overshoot on finger movements
        const t = easeOutBack(Math.min(raw, 1));
        baseLandmarks = lerpPose(POSES[poseIdx], POSES[nextIdx], t);
      }

      // Apply per-joint momentum lag (heavier joints = more lag)
      const landmarks: Landmark[] = baseLandmarks.map((target, i) => {
        if (!prevLandmarks) return target;

        const isFingertip = FINGERTIP_INDICES.includes(i);
        // Fingertips have more inertia (slower catch-up)
        const stiffness = isFingertip ? 0.08 : 0.14;
        const damping = 0.85;

        const prev = prevLandmarks[i];
        const v = velocities[i];

        // Spring force toward target
        const fx = (target.x - prev.x) * stiffness;
        const fy = (target.y - prev.y) * stiffness;

        v.vx = (v.vx + fx) * damping;
        v.vy = (v.vy + fy) * damping;

        return {
          x: prev.x + v.vx,
          y: prev.y + v.vy,
          z: 0,
        };
      });

      prevLandmarks = landmarks;

      // Update label + spectrum at ~5fps
      labelRef.current = POSE_LABELS[poseIdx];
      const specFrame = Math.floor(elapsed / 200);
      if (specFrame !== lastSpecFrame) {
        lastSpecFrame = specFrame;
        try {
          spectrumRef.current = landmarksToSpectrum(landmarks);
        } catch {
          /* ignore */
        }
        forceRender((n) => n + 1);
      }

      // ── Draw ──
      ctx.clearRect(0, 0, w, h);

      // Analysis edges (very faint)
      ctx.strokeStyle = ANALYSIS_COLOR;
      ctx.lineWidth = 0.5;
      for (const [a, b] of ANALYSIS_EDGES) {
        ctx.beginPath();
        ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
        ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
        ctx.stroke();
      }

      // Skeleton connections
      ctx.strokeStyle = SKELETON_COLOR;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
        ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
        ctx.stroke();
      }

      // Joints
      for (let i = 0; i < landmarks.length; i++) {
        const isFingertip = FINGERTIP_INDICES.includes(i);
        const isWrist = i === 0;
        ctx.fillStyle =
          isFingertip || isWrist ? FINGERTIP_COLOR : JOINT_COLOR;
        ctx.beginPath();
        ctx.arc(
          landmarks[i].x * w,
          landmarks[i].y * h,
          isFingertip || isWrist ? 3 : 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        px: 1,
      }}
    >
      {/* Canvas: hand skeleton */}
      <Box sx={{ flex: "0 0 auto", position: "relative", maxWidth: 140 }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 2,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "'Fira Code', monospace",
            fontSize: "0.55rem",
            color: ACCENT,
            opacity: 0.6,
            transition: "opacity 0.3s",
          }}
        >
          {labelRef.current}
        </Box>
      </Box>

      {/* Spectrum bars */}
      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            fontFamily: "'Fira Code', monospace",
            fontSize: "0.5rem",
            color: "text.secondary",
            textAlign: "center",
            opacity: 0.6,
          }}
        >
          Eigenvalue Spectrum
        </Box>
        {spectrumRef.current.length > 0 && (
          <VerticalSpectrum
            values={spectrumRef.current}
            height={100}
            color={ACCENT}
          />
        )}
      </Box>
    </Box>
  );
}
