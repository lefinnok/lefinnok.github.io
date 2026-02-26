import { useRef, useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  Paper,
  Chip,
  Alert,
  Link,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  type Landmark,
  type ReferenceGesture,
  type MatchResult,
  HAND_CONNECTIONS,
  ANALYSIS_EDGES,
  FINGERTIP_INDICES,
  landmarksToSpectrum,
  findBestMatch,
  spectralSimilarity,
} from "./graphAlgorithm";
import { AlgorithmExplanation } from "./AlgorithmExplanation";
import { SpectrumBars } from "./ExplanationVisuals";

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

const REFERENCES = [
  {
    text: 'Reuter, M., Wolter, F.-E., & Peinecke, N. (2006). Laplace-Beltrami Spectra as "Shape-DNA" of Surfaces and Solids. Computer-Aided Design, 38(4), 342\u2013366.',
    url: "https://doi.org/10.1016/j.cad.2005.10.011",
    tag: "doi:10.1016/j.cad.2005.10.011",
  },
  {
    text: "Wilson, R. C. & Zhu, P. (2008). A Study of Graph Spectra for Comparing Graphs and Trees. Pattern Recognition, 41(9), 2833\u20132841.",
    url: "https://doi.org/10.1016/j.patcog.2008.03.011",
    tag: "doi:10.1016/j.patcog.2008.03.011",
  },
  {
    text: "von Luxburg, U. (2007). A Tutorial on Spectral Clustering. Statistics and Computing, 17(4), 395\u2013416.",
    url: "https://arxiv.org/abs/0711.0189",
    tag: "arXiv:0711.0189",
  },
  {
    text: "Zhang, F., Bazarevsky, V., et al. (2020). MediaPipe Hands: On-device Real-time Hand Tracking. CVPR Workshop on CV for AR/VR.",
    url: "https://arxiv.org/abs/2006.10214",
    tag: "arXiv:2006.10214",
  },
  {
    text: "Yan, S., Xiong, Y., & Lin, D. (2018). Spatial Temporal Graph Convolutional Networks for Skeleton-Based Action Recognition. AAAI 2018.",
    url: "https://arxiv.org/abs/1801.07455",
    tag: "arXiv:1801.07455",
  },
];

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
  const [showExplanation, setShowExplanation] = useState(false);
  const [liveSpectrum, setLiveSpectrum] = useState<number[] | null>(null);

  // Refs for the animation loop (avoids stale closures)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const currentLandmarksRef = useRef<Landmark[] | null>(null);
  const refsRef = useRef<ReferenceGesture[]>([]);
  const recognizingRef = useRef(false);
  const nextIdRef = useRef(1);
  const frameCountRef = useRef(0);

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
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
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
    setLiveSpectrum(null);
    currentLandmarksRef.current = null;
    frameCountRef.current = 0;
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

      // Compute spectrum every frame for recognition;
      // push to React state throttled (~10fps) for the live panel
      const spectrum = landmarksToSpectrum(landmarks);

      frameCountRef.current++;
      if (frameCountRef.current % 6 === 0) {
        setLiveSpectrum(spectrum);
      }

      if (recognizingRef.current && refsRef.current.length > 0) {
        const match = findBestMatch(spectrum, refsRef.current);
        if (match) {
          setCurrentMatch(match);
          drawMatchLabel(ctx, match, canvas.width, canvas.height);
        }
      }
    } else {
      currentLandmarksRef.current = null;
      setHandDetected(false);
      setLiveSpectrum(null);
      if (recognizingRef.current) setCurrentMatch(null);
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, []);

  const captureGesture = useCallback(() => {
    const landmarks = currentLandmarksRef.current;
    if (!landmarks || !captureLabel.trim()) return;

    const spectrum = landmarksToSpectrum(landmarks);

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
    <Stack spacing={4}>
      {/* Demo */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        {/* Header with How It Works button */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <Typography variant="h5">Gesture Recognition Demo</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<InfoOutlinedIcon />}
            onClick={() => setShowExplanation(true)}
            sx={{
              color: ACCENT,
              borderColor: ACCENT,
              "&:hover": {
                borderColor: ACCENT,
                bgcolor: "rgba(0,229,255,0.06)",
              },
              flexShrink: 0,
            }}
          >
            How It Works
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Teach the algorithm your hand gestures, then watch it recognize them
          in real time using graph spectral analysis.
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
          <video ref={videoRef} playsInline muted style={{ display: "none" }} />
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

        {/* Controls */}
        {cameraActive && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Step 1 — Capture Reference Gestures
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
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

            {references.length > 0 && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Saved References ({references.length})
                </Typography>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1}
                  sx={{ mt: 0.5 }}
                >
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
                          recognizing && currentMatch?.referenceId === ref.id
                            ? ACCENT
                            : "divider",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Capture at least one reference gesture to enable recognition.
              </Typography>
            )}
          </Stack>
        )}
      </Paper>

      {/* Live spectral analysis panel */}
      {cameraActive && (
        <LiveAnalysisPanel
          liveSpectrum={liveSpectrum}
          references={references}
          currentMatchId={recognizing ? currentMatch?.referenceId ?? null : null}
        />
      )}

      {/* References — always visible on page */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          References
        </Typography>
        <Box component="ol" sx={{ pl: 2.5, m: 0, "& li": { mb: 1.5 } }}>
          {REFERENCES.map((r) => (
            <Typography
              key={r.tag}
              component="li"
              variant="body2"
              color="text.secondary"
            >
              {r.text}{" "}
              <Link
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: ACCENT }}
              >
                {r.tag}
              </Link>
            </Typography>
          ))}
        </Box>
      </Paper>

      {/* Explanation modal */}
      <AlgorithmExplanation
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </Stack>
  );
}

// ─── Live analysis panel ─────────────────────────────────────────

function LiveAnalysisPanel({
  liveSpectrum,
  references,
  currentMatchId,
}: {
  liveSpectrum: number[] | null;
  references: ReferenceGesture[];
  currentMatchId: number | null;
}) {
  // Extract only the 5 non-trivial eigenvalues (last 5 of the 21)
  const liveVals = liveSpectrum?.slice(-5) ?? null;

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
      <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Live Spectral Analysis
      </Typography>

      {!liveVals ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          Show your hand to the camera to see the live eigenvalue fingerprint.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {/* Live hand spectrum */}
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Current Hand
            </Typography>
            <SpectrumBars values={liveVals} label="Live eigenvalues" />
          </Box>

          {/* Per-reference comparison */}
          {references.length > 0 && (
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Reference Comparison
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(auto-fill, minmax(260px, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {references.map((ref) => {
                  const refVals = ref.spectrum.slice(-5);
                  const dist = spectralSimilarity(liveSpectrum!, ref.spectrum);
                  const isMatch = ref.id === currentMatchId;

                  return (
                    <Box
                      key={ref.id}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: isMatch ? ACCENT : "divider",
                        borderRadius: 1.5,
                        bgcolor: isMatch
                          ? "rgba(0,229,255,0.04)"
                          : "transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1.5 }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {ref.label}
                          {isMatch && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ color: ACCENT, ml: 1 }}
                            >
                              MATCH
                            </Typography>
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isMatch ? ACCENT : "text.secondary",
                            fontFamily: "'Fira Code', monospace",
                          }}
                        >
                          d = {Math.round(dist).toLocaleString()}
                        </Typography>
                      </Stack>
                      <SpectrumBars
                        values={liveVals}
                        label="Live"
                        compare={refVals}
                        compareLabel={ref.label}
                        compareColor={isMatch ? ACCENT : "#666"}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
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

  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1;
  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(lx(landmarks[a]), ly(landmarks[a]));
    ctx.lineTo(lx(landmarks[b]), ly(landmarks[b]));
    ctx.stroke();
  }

  ctx.strokeStyle = ACCENT_DIM;
  ctx.lineWidth = 2;
  for (const [a, b] of ANALYSIS_EDGES) {
    ctx.beginPath();
    ctx.moveTo(lx(landmarks[a]), ly(landmarks[a]));
    ctx.lineTo(lx(landmarks[b]), ly(landmarks[b]));
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (let i = 0; i < landmarks.length; i++) {
    if (i === 0 || FINGERTIP_INDICES.includes(i)) continue;
    ctx.beginPath();
    ctx.arc(lx(landmarks[i]), ly(landmarks[i]), 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(lx(landmarks[0]), ly(landmarks[0]), 5, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 8;

  ctx.fillStyle = ACCENT;
  ctx.fillText(text, w / 2, 40);

  ctx.font = "14px 'Fira Code', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText(`similarity: ${score}`, w / 2, 60);

  ctx.restore();
}
