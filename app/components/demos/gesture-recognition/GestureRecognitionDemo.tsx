import { useRef, useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  IconButton,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import {
  type Landmark,
  type ReferenceGesture,
  type MatchResult,
  HAND_CONNECTIONS,
  ANALYSIS_EDGES,
  FINGERTIP_INDICES,
  landmarksToSpectrum,
  findBestMatch,
} from "./graphAlgorithm";

type HandLandmarker = Awaited<
  ReturnType<
    typeof import("@mediapipe/tasks-vision") extends { HandLandmarker: infer T }
      ? T extends { createFromOptions: (...args: unknown[]) => infer R }
        ? () => R
        : never
      : never
  >
>;

const ACCENT = "#00e5ff";
const ACCENT_DIM = "rgba(0, 229, 255, 0.4)";

export default function GestureRecognitionDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [references, setReferences] = useState<ReferenceGesture[]>([]);
  const [recognizing, setRecognizing] = useState(false);
  const [captureLabel, setCaptureLabel] = useState("");
  const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(null);
  const [handDetected, setHandDetected] = useState(false);

  // Refs for the animation loop (avoids stale closures)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const currentLandmarksRef = useRef<Landmark[] | null>(null);
  const refsRef = useRef<ReferenceGesture[]>([]);
  const recognizingRef = useRef(false);
  const nextIdRef = useRef(1);

  useEffect(() => {
    refsRef.current = references;
  }, [references]);
  useEffect(() => {
    recognizingRef.current = recognizing;
  }, [recognizing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      handLandmarkerRef.current?.close();
    };
  }, []);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Dynamic import to avoid SSR/bundle issues
      const { HandLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm",
      );

      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        numHands: 1,
        runningMode: "VIDEO",
      });

      handLandmarkerRef.current = landmarker;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      setCameraActive(true);
      setLoading(false);

      detect();
    } catch (e) {
      setLoading(false);
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : "Failed to start camera. Make sure your device has a webcam.",
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    handLandmarkerRef.current?.close();
    handLandmarkerRef.current = null;
    setCameraActive(false);
    setRecognizing(false);
    setCurrentMatch(null);
    setHandDetected(false);
    currentLandmarksRef.current = null;
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = handLandmarkerRef.current;

    if (!video || !canvas || !landmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw mirrored video
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    const results = landmarker.detectForVideo(video, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks: Landmark[] = results.landmarks[0];
      currentLandmarksRef.current = landmarks;
      setHandDetected(true);

      drawHand(ctx, landmarks, canvas.width, canvas.height);

      // Run recognition
      if (recognizingRef.current && refsRef.current.length > 0) {
        const spectrum = landmarksToSpectrum(landmarks);
        const match = findBestMatch(spectrum, refsRef.current);
        if (match) {
          setCurrentMatch(match);
          drawMatchLabel(ctx, match, canvas.width, canvas.height);
        }
      }
    } else {
      currentLandmarksRef.current = null;
      setHandDetected(false);
      if (recognizingRef.current) setCurrentMatch(null);
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, []);

  const captureGesture = useCallback(() => {
    const landmarks = currentLandmarksRef.current;
    if (!landmarks || !captureLabel.trim()) return;

    const spectrum = landmarksToSpectrum(landmarks);

    // Grab thumbnail from canvas
    let thumbnail: string | null = null;
    if (canvasRef.current) {
      thumbnail = canvasRef.current.toDataURL("image/jpeg", 0.5);
    }

    const gesture: ReferenceGesture = {
      id: nextIdRef.current++,
      label: captureLabel.trim(),
      spectrum,
      thumbnail,
    };

    setReferences((prev) => [...prev, gesture]);
    setCaptureLabel("");
  }, [captureLabel]);

  const removeReference = useCallback((id: number) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Gesture Recognition Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Teach the algorithm your hand gestures, then watch it recognize them in
        real time using graph spectral analysis.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Camera viewport */}
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          bgcolor: "#000",
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ display: "none" }}
        />
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: cameraActive ? "block" : "none",
            objectFit: "cover",
          }}
        />

        {!cameraActive && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <VideocamIcon sx={{ fontSize: 48, color: "text.secondary" }} />
            <Button
              variant="outlined"
              startIcon={<VideocamIcon />}
              onClick={startCamera}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Camera"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Controls — only show when camera is active */}
      {cameraActive && (
        <Stack spacing={3}>
          {/* Step 1: Capture references */}
          <Box>
            <Typography variant="overline" color="text.secondary">
              Step 1 — Capture Reference Gestures
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Hold a hand gesture in view, type a label, and click Capture.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder='e.g. "Peace", "Fist"'
                value={captureLabel}
                onChange={(e) => setCaptureLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") captureGesture();
                }}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<CameraAltIcon />}
                onClick={captureGesture}
                disabled={!handDetected || !captureLabel.trim()}
              >
                Capture
              </Button>
            </Stack>
          </Box>

          {/* Reference list */}
          {references.length > 0 && (
            <Box>
              <Typography variant="overline" color="text.secondary">
                Saved References ({references.length})
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                {references.map((ref) => (
                  <Chip
                    key={ref.id}
                    label={ref.label}
                    variant="outlined"
                    onDelete={() => removeReference(ref.id)}
                    deleteIcon={<DeleteIcon fontSize="small" />}
                    avatar={
                      ref.thumbnail ? (
                        <Box
                          component="img"
                          src={ref.thumbnail}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : undefined
                    }
                    sx={{
                      borderColor:
                        recognizing &&
                        currentMatch?.referenceId === ref.id
                          ? ACCENT
                          : "divider",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Step 2: Recognition toggle */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant={recognizing ? "contained" : "outlined"}
              startIcon={recognizing ? <StopIcon /> : <PlayArrowIcon />}
              onClick={() => {
                setRecognizing(!recognizing);
                if (recognizing) setCurrentMatch(null);
              }}
              disabled={references.length === 0}
              color={recognizing ? "primary" : "inherit"}
            >
              {recognizing ? "Stop Recognition" : "Start Recognition"}
            </Button>

            {recognizing && currentMatch && (
              <Chip
                label={`Match: ${currentMatch.label} (${Math.round(currentMatch.similarity)})`}
                sx={{
                  borderColor: ACCENT,
                  color: ACCENT,
                  fontFamily: "'Fira Code', monospace",
                }}
                variant="outlined"
              />
            )}

            <Box sx={{ flex: 1 }} />

            <Button
              size="small"
              startIcon={<VideocamOffIcon />}
              onClick={stopCamera}
              color="inherit"
              sx={{ color: "text.secondary" }}
            >
              Stop Camera
            </Button>
          </Stack>

          {references.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Capture at least one reference gesture to enable recognition.
            </Typography>
          )}
        </Stack>
      )}
    </Paper>
  );
}

/** Draw hand skeleton, analysis graph, and landmarks on the canvas. */
function drawHand(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  w: number,
  h: number,
) {
  const lx = (l: Landmark) => (1 - l.x) * w; // mirrored
  const ly = (l: Landmark) => l.y * h;

  // Standard hand connections (dim white)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1;
  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(lx(landmarks[a]), ly(landmarks[a]));
    ctx.lineTo(lx(landmarks[b]), ly(landmarks[b]));
    ctx.stroke();
  }

  // Analysis graph edges (bright accent)
  ctx.strokeStyle = ACCENT_DIM;
  ctx.lineWidth = 2;
  for (const [a, b] of ANALYSIS_EDGES) {
    ctx.beginPath();
    ctx.moveTo(lx(landmarks[a]), ly(landmarks[a]));
    ctx.lineTo(lx(landmarks[b]), ly(landmarks[b]));
    ctx.stroke();
  }

  // Regular landmarks
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (let i = 0; i < landmarks.length; i++) {
    if (i === 0 || FINGERTIP_INDICES.includes(i)) continue;
    ctx.beginPath();
    ctx.arc(lx(landmarks[i]), ly(landmarks[i]), 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wrist
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(lx(landmarks[0]), ly(landmarks[0]), 5, 0, Math.PI * 2);
  ctx.fill();

  // Fingertips (accent color)
  ctx.fillStyle = ACCENT;
  for (const idx of FINGERTIP_INDICES) {
    ctx.beginPath();
    ctx.arc(lx(landmarks[idx]), ly(landmarks[idx]), 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Draw the current match label on the canvas. */
function drawMatchLabel(
  ctx: CanvasRenderingContext2D,
  match: MatchResult,
  w: number,
  _h: number,
) {
  const text = match.label;
  const score = Math.round(match.similarity);

  ctx.save();
  ctx.font = "bold 28px Inter, sans-serif";
  ctx.textAlign = "center";

  // Shadow for readability
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 8;

  ctx.fillStyle = ACCENT;
  ctx.fillText(text, w / 2, 40);

  ctx.font = "14px 'Fira Code', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText(`similarity: ${score}`, w / 2, 60);

  ctx.restore();
}
