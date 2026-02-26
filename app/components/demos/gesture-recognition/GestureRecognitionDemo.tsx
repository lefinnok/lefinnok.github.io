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
  IconButton,
  Divider,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
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
import { VerticalSpectrum } from "./ExplanationVisuals";
import { MatrixLoader } from "~/components/MatrixLoader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandLandmarker = any;

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
  const demoRef = useRef<HTMLDivElement>(null);

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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Track fullscreen state
  useEffect(() => {
    const handler = () =>
      setIsFullscreen(
        !!(document.fullscreenElement ?? (document as any).webkitFullscreenElement),
      );
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const el = demoRef.current;
        if (el) {
          await (
            el.requestFullscreen?.() ??
            (el as any).webkitRequestFullscreen?.() ??
            (el as any).msRequestFullscreen?.()
          );
        }
      } else {
        await (
          document.exitFullscreen?.() ??
          (document as any).webkitExitFullscreen?.() ??
          (document as any).msExitFullscreen?.()
        );
      }
    } catch {
      // Fullscreen not supported or denied
    }
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
          drawMatchLabel(ctx, match, landmarks, canvas.width, canvas.height);
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

  const liveVals = liveSpectrum?.slice(-5) ?? null;

  return (
    <Stack spacing={4}>
      {/* Main demo container (fullscreen target) */}
      <Paper
        ref={demoRef}
        elevation={0}
        sx={{
          p: isFullscreen ? 2 : 3,
          border: isFullscreen ? "none" : "1px solid",
          borderColor: "divider",
          borderRadius: isFullscreen ? 0 : 3,
          bgcolor: isFullscreen ? "#0a0a0a" : undefined,
          ...(isFullscreen && {
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }),
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1, flexShrink: 0 }}
        >
          <Box>
            <Typography variant={isFullscreen ? "h6" : "h5"}>
              Gesture Recognition Demo
            </Typography>
            {!isFullscreen && (
              <Typography variant="caption" color="text.secondary">
                Teach the algorithm your gestures, then watch it recognize them
                live.
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.5}>
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
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              sx={{ color: "text.secondary" }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }}>
            {error}
          </Alert>
        )}

        {/* Main area: camera + analysis sidebar */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flex: isFullscreen ? 1 : undefined,
            minHeight: isFullscreen ? 0 : undefined,
          }}
        >
          {/* Camera viewport — 4 parts */}
          <Box
            sx={{
              flex: 4,
              position: "relative",
              bgcolor: "#000",
              borderRadius: 2,
              overflow: "hidden",
              ...(!isFullscreen && { aspectRatio: "4 / 3" }),
              ...(isFullscreen && { minHeight: 0 }),
            }}
          >
            <video ref={videoRef} playsInline muted style={{ display: "none" }} />
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                display: cameraActive ? "block" : "none",
                objectFit: "contain",
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
                {loading && (
                  <MatrixLoader
                    message="Initializing WASM..."
                    height="100%"
                    width="100%"
                    density="normal"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 0,
                      borderRadius: 0,
                    }}
                  />
                )}
                <VideocamIcon
                  sx={{ fontSize: 48, color: "text.secondary", zIndex: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<VideocamIcon />}
                  onClick={startCamera}
                  disabled={loading}
                  sx={{ zIndex: 1 }}
                >
                  {loading ? "Starting..." : "Start Camera"}
                </Button>
              </Box>
            )}
          </Box>

          {/* Analysis sidebar — 1 part */}
          {cameraActive && (
            <Box
              sx={{
                flex: 1,
                minWidth: 120,
                maxWidth: { xs: 160, md: 220 },
                display: { xs: "none", sm: "flex" },
                flexDirection: "column",
                gap: 1,
                overflow: "auto",
                borderLeft: "1px solid",
                borderColor: "divider",
                pl: 1.5,
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontSize: 9, color: "text.secondary", lineHeight: 1.2 }}
              >
                Spectral Analysis
              </Typography>

              {!liveVals ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", fontSize: 10 }}
                >
                  Show your hand to the camera.
                </Typography>
              ) : (
                <>
                  {/* Live hand spectrum */}
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ fontSize: 10, display: "block", mb: 0.5 }}
                    >
                      Current Hand
                    </Typography>
                    <VerticalSpectrum values={liveVals} height={60} />
                  </Box>

                  {/* Per-reference comparisons */}
                  {references.length > 0 && (
                    <>
                      <Divider sx={{ opacity: 0.3 }} />
                      {references.map((ref) => {
                        const refVals = ref.spectrum.slice(-5);
                        const dist = spectralSimilarity(
                          liveSpectrum!,
                          ref.spectrum,
                        );
                        const isMatch =
                          recognizing && currentMatch?.referenceId === ref.id;

                        return (
                          <Box
                            key={ref.id}
                            sx={{
                              p: 0.75,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: isMatch ? ACCENT : "transparent",
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
                              sx={{ mb: 0.5 }}
                            >
                              <Typography
                                variant="caption"
                                fontWeight={600}
                                sx={{ fontSize: 10 }}
                              >
                                {ref.label}
                                {isMatch && (
                                  <Typography
                                    component="span"
                                    sx={{
                                      color: ACCENT,
                                      fontSize: 8,
                                      ml: 0.5,
                                      fontWeight: 700,
                                    }}
                                  >
                                    MATCH
                                  </Typography>
                                )}
                              </Typography>
                              <Typography
                                sx={{
                                  color: isMatch ? ACCENT : "text.secondary",
                                  fontFamily: "'Fira Code', monospace",
                                  fontSize: 8,
                                }}
                              >
                                d={Math.round(dist).toLocaleString()}
                              </Typography>
                            </Stack>
                            <VerticalSpectrum
                              values={liveVals}
                              compare={refVals}
                              compareColor={isMatch ? "#666" : "#444"}
                              height={45}
                            />
                          </Box>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Controls */}
        {cameraActive && (
          <Stack spacing={1} sx={{ mt: 1.5, flexShrink: 0 }}>
            {/* Capture row */}
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder='Label, e.g. "Peace"'
                value={captureLabel}
                onChange={(e) => setCaptureLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") captureGesture();
                }}
                sx={{ flex: 1, maxWidth: 220 }}
                slotProps={{
                  input: { sx: { fontSize: 13, height: 34 } },
                }}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<CameraAltIcon />}
                onClick={captureGesture}
                disabled={!handDetected || !captureLabel.trim()}
                sx={{ height: 34, fontSize: 12 }}
              >
                Capture
              </Button>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              <Button
                size="small"
                variant={recognizing ? "contained" : "outlined"}
                startIcon={recognizing ? <StopIcon /> : <PlayArrowIcon />}
                onClick={() => {
                  setRecognizing(!recognizing);
                  if (recognizing) setCurrentMatch(null);
                }}
                disabled={references.length === 0}
                sx={{
                  height: 34,
                  fontSize: 12,
                  bgcolor: recognizing ? "transparent" : "#22c55e",
                  color: recognizing ? "#ef4444" : "#fff",
                  borderColor: recognizing ? "#ef4444" : "#22c55e",
                  "&:hover": {
                    bgcolor: recognizing ? "rgba(239,68,68,0.08)" : "#16a34a",
                    borderColor: recognizing ? "#ef4444" : "#16a34a",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(34,197,94,0.15)",
                    color: "rgba(255,255,255,0.3)",
                    borderColor: "transparent",
                  },
                }}
              >
                {recognizing ? "Stop" : "Recognize"}
              </Button>

              {recognizing && currentMatch && (
                <Chip
                  size="small"
                  label={`${currentMatch.label} (${Math.round(currentMatch.similarity)})`}
                  sx={{
                    borderColor: ACCENT,
                    color: ACCENT,
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 11,
                    height: 26,
                  }}
                  variant="outlined"
                />
              )}

              <Box sx={{ flex: 1 }} />

              <IconButton
                size="small"
                onClick={stopCamera}
                sx={{ color: "text.secondary" }}
                title="Stop Camera"
              >
                <VideocamOffIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Saved references */}
            {references.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 10, mr: 0.5 }}
                >
                  Saved:
                </Typography>
                {references.map((ref) => (
                  <Chip
                    key={ref.id}
                    label={ref.label}
                    size="small"
                    variant="outlined"
                    onDelete={() => removeReference(ref.id)}
                    deleteIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                    avatar={
                      ref.thumbnail ? (
                        <Box
                          component="img"
                          src={ref.thumbnail}
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : undefined
                    }
                    sx={{
                      height: 24,
                      fontSize: 11,
                      borderColor:
                        recognizing && currentMatch?.referenceId === ref.id
                          ? ACCENT
                          : "divider",
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic", fontSize: 11 }}
              >
                Capture at least one reference gesture to enable recognition.
              </Typography>
            )}
          </Stack>
        )}
      </Paper>

      {/* References — always visible on page below demo */}
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

/** Draw the current match label anchored to the wrist with a connecting line. */
function drawMatchLabel(
  ctx: CanvasRenderingContext2D,
  match: MatchResult,
  landmarks: Landmark[],
  w: number,
  h: number,
) {
  const wrist = landmarks[0];
  const wx = (1 - wrist.x) * w;
  const wy = wrist.y * h;

  const above = wy > 120;
  const ty = above ? wy - 90 : wy + 100;
  // Push label to whichever side has more room
  const offsetX = wx < w / 2 ? -120 : 120;
  const tx = Math.max(60, Math.min(w - 60, wx + offsetX));

  ctx.save();

  // Thin connecting line
  ctx.beginPath();
  ctx.moveTo(wx, wy);
  ctx.lineTo(tx, above ? ty + 14 : ty - 14);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Label
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 6;

  ctx.font = "500 16px Inter, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(match.label, tx, ty);

  ctx.font = "11px 'Fira Code', monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fillText(`${Math.round(match.similarity)}`, tx, ty + 14);

  ctx.restore();
}
