import { useEffect, useState, Fragment } from "react";
import {
  Box,
  Typography,
  Divider,
  Link,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  ACCENT,
  Latex,
  KatexStyles,
  SlidePair,
  HandDiagram,
  GraphDiagram,
  MatrixGrid,
  SpectrumBars,
} from "./ExplanationVisuals";

// ─── Pipeline steps & slide mapping ──────────────────────────────

const PIPELINE = [
  { key: "detect", label: "Detect" },
  { key: "graph", label: "Graph" },
  { key: "spectrum", label: "Spectrum" },
  { key: "compare", label: "Compare" },
  { key: "refs", label: "Refs" },
] as const;

interface SlideInfo {
  step: number; // pipeline step index
  title: string;
}

const SLIDES: SlideInfo[] = [
  { step: 0, title: "21 Hand Landmarks" },
  { step: 0, title: "6 Key Points" },
  { step: 1, title: "Graph Structure" },
  { step: 1, title: "Edge Weights" },
  { step: 2, title: "Graph Laplacian" },
  { step: 2, title: "Eigenvalue Fingerprint" },
  { step: 3, title: "Spectral Distance" },
  { step: 4, title: "References" },
];

// ─── Sample data ─────────────────────────────────────────────────

const LABELS = ["W", "T", "I", "M", "R", "P"];

const ADJ = [
  [0, 100, 195, 198, 85, 82],
  [100, 0, 130, 150, 90, 105],
  [195, 130, 0, 40, 0, 0],
  [198, 150, 40, 0, 140, 0],
  [85, 90, 0, 140, 0, 50],
  [82, 105, 0, 0, 50, 0],
];

const DEG = [660, 575, 365, 528, 365, 237];

const LAP = ADJ.map((row, r) =>
  row.map((v, c) => (r === c ? DEG[r] : -v)),
);

const PEACE_SPECTRUM = [0, 195, 340, 505, 720, 970];
const FIST_SPECTRUM = [0, 310, 410, 510, 680, 820];

// ─── Pipeline indicator ──────────────────────────────────────────

function PipelineIndicator({
  active,
  onStep,
}: {
  active: number;
  onStep: (i: number) => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      sx={{ mb: 3, gap: { xs: 0.5, sm: 0.75 } }}
    >
      {PIPELINE.map((step, i) => (
        <Fragment key={step.key}>
          <Box
            onClick={() => {
              // Jump to the first slide in this step
              const idx = SLIDES.findIndex((s) => s.step === i);
              if (idx >= 0) onStep(idx);
            }}
            sx={{
              px: { xs: 1, sm: 1.5 },
              py: 0.75,
              border: "1px solid",
              borderColor: i === active ? ACCENT : "divider",
              borderRadius: 1,
              cursor: "pointer",
              bgcolor:
                i === active ? "rgba(0,229,255,0.08)" : "transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: ACCENT,
                bgcolor: "rgba(0,229,255,0.04)",
              },
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: i === active ? ACCENT : "text.secondary",
                fontSize: { xs: "0.6rem", sm: "0.7rem" },
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </Typography>
          </Box>
          {i < PIPELINE.length - 1 && (
            <Typography
              sx={{
                color: i < active ? ACCENT : "divider",
                mx: 0.25,
                fontSize: "0.75rem",
                userSelect: "none",
              }}
            >
              {"\u2192"}
            </Typography>
          )}
        </Fragment>
      ))}
    </Stack>
  );
}

// ─── Slides ──────────────────────────────────────────────────────

function Slide0() {
  return (
    <SlidePair visual={<HandDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        MediaPipe Hands detects <strong>21 key points</strong> on the hand
        in real time — the wrist, each knuckle joint, and every fingertip.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each landmark carries 3D
        coordinates <Latex math="(x, y, z)" /> normalized to the image
        frame. The full skeleton has 21 numbered points connected by the
        lines shown here.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Most recognition systems would feed all 21 points into a neural
        network. This algorithm takes a different approach — it only needs
        <strong> 6 of them</strong>.
      </Typography>
    </SlidePair>
  );
}

function Slide1() {
  return (
    <SlidePair
      visual={
        <HandDiagram
          highlight={[0, 4, 8, 12, 16, 20]}
          dimOthers
          showAnalysis
        />
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        We keep only the <strong>wrist</strong> (0) and the five{" "}
        <strong style={{ color: ACCENT }}>fingertips</strong> (4, 8, 12,
        16, 20). The other 15 landmarks are discarded.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The{" "}
        <strong style={{ color: ACCENT }}>
          cyan lines
        </strong>{" "}
        show the analysis connections drawn between these 6 key points.
        This sparse graph captures the essential geometric shape of the
        hand — how spread or curled the fingers are.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Why these 6? Fingertips move the most between gestures. Knuckle
        joints mostly follow their fingertips, adding noise without new
        information.
      </Typography>
    </SlidePair>
  );
}

function Slide2() {
  return (
    <SlidePair visual={<GraphDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Extracted as a graph, the 6 landmarks form the structure shown on
        the left. The connection rule:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2, "& li": { mb: 0.5 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>Wrist (W)</strong> connects to all 5 fingertips
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>Thumb (T)</strong> connects to all other tips
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>Consecutive tips</strong> connect to their neighbor
          (I-M, M-R, R-P)
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        This gives <strong>11 edges</strong> across 6 nodes — a compact
        encoding that captures finger spread, curl, and opposition.
      </Typography>
    </SlidePair>
  );
}

function Slide3() {
  return (
    <SlidePair
      visual={<GraphDiagram highlightEdge={[0, 8]} showWeights />}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each edge is weighted by the <strong>normalized Euclidean
        distance</strong> between its two landmarks:
      </Typography>
      <Latex
        display
        math="w(i,j) = \frac{\| \mathbf{p}_i - \mathbf{p}_j \|_2}{\| \mathbf{p}_0 - \mathbf{p}_5 \|_2} \cdot 100"
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Division by <Latex math="\|\mathbf{p}_0 - \mathbf{p}_5\|" /> (wrist
        to index base) makes the weights{" "}
        <strong>scale-invariant</strong> — a small hand and a large hand
        producing the same gesture get the same weights.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The highlighted edge <strong>W–I</strong> has weight{" "}
        <strong>195</strong> in this sample "peace sign" pose — the index
        finger is fully extended.
      </Typography>
    </SlidePair>
  );
}

function Slide4() {
  return (
    <SlidePair
      visual={
        <Stack spacing={2} alignItems="center">
          <MatrixGrid matrix={ADJ} labels={LABELS} title="Adjacency  A" compact />
          <Typography sx={{ color: ACCENT, fontSize: 18 }}>{"\u2193"}</Typography>
          <MatrixGrid matrix={LAP} labels={LABELS} title="Laplacian  L = D \u2212 A" highlightDiag compact />
        </Stack>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The edge weights fill a <strong>6×6 adjacency
        matrix</strong> <Latex math="A" />. From it we compute the{" "}
        <strong>graph Laplacian</strong>:
      </Typography>
      <Latex display math="L = D - A" />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        where <Latex math="D" /> is the diagonal degree matrix — each{" "}
        <strong style={{ color: ACCENT }}>highlighted diagonal
        entry</strong> is the sum of that row's edge weights:
      </Typography>
      <Latex
        display
        math="D_{WW} = 100+195+198+85+82 = 660"
      />
      <Typography variant="body2" color="text.secondary">
        Off-diagonal entries are negated weights. The Laplacian encodes
        both <em>connectivity</em> and <em>geometry</em> in one matrix.
      </Typography>
    </SlidePair>
  );
}

function Slide5() {
  return (
    <SlidePair
      visual={<SpectrumBars values={PEACE_SPECTRUM} label="Peace sign" />}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The eigenvalues of the Laplacian — its{" "}
        <strong>spectrum</strong> — form a geometric fingerprint:
      </Typography>
      <Latex
        display
        math="\operatorname{spec}(L) = [\,\lambda_1 \leq \lambda_2 \leq \cdots \leq \lambda_6\,]"
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This idea comes from the{" "}
        <strong>"Shape-DNA"</strong> concept (Reuter et al., 2006):
        Laplacian eigenvalues are <strong>isometry invariants</strong>.
        They stay the same regardless of the hand's position, rotation, or
        scale in the camera frame.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        For this sample peace sign, the spectrum is:
      </Typography>
      <Latex
        display
        math="[0,\; 195,\; 340,\; 505,\; 720,\; 970]"
      />
      <Typography variant="body2" color="text.secondary">
        <Latex math="\lambda_1 = 0" /> always — it reflects the single
        connected component. The remaining 5 values encode the hand's
        shape.
      </Typography>
    </SlidePair>
  );
}

function Slide6() {
  const diffs = PEACE_SPECTRUM.map((v, i) => (v - FIST_SPECTRUM[i]) ** 2);
  const total = diffs.reduce((a, b) => a + b, 0);

  return (
    <SlidePair
      visual={
        <SpectrumBars
          values={PEACE_SPECTRUM}
          label="Peace sign"
          compare={FIST_SPECTRUM}
          compareLabel="Fist"
        />
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        To match a live hand against references, we compare spectra using
        the <strong>squared spectral distance</strong>:
      </Typography>
      <Latex
        display
        math="d = \sum_{i=1}^{k} \left( \lambda_i^{\text{live}} - \lambda_i^{\text{ref}} \right)^2"
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Comparing <strong>Peace</strong> vs <strong>Fist</strong>:
      </Typography>
      <Latex
        display
        math={`d = ${diffs.map((d) => d.toLocaleString()).join(" + ")} = ${total.toLocaleString()}`}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A repeated peace sign might score <Latex math="d \approx 125" />.
        The reference with the <strong>smallest</strong>{" "}
        <Latex math="d" /> wins.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Because the fingerprint is position- and scale-independent, only
        the <em>shape</em> of the gesture matters — not where the hand is
        in the frame.
      </Typography>
    </SlidePair>
  );
}

function Slide7() {
  const refs = [
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

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The algorithm draws on established work in spectral graph theory,
        hand tracking, and skeleton-based recognition.
      </Typography>
      <Box component="ol" sx={{ pl: 2.5, m: 0, "& li": { mb: 1.5 } }}>
        {refs.map((r) => (
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
    </Box>
  );
}

const SLIDE_COMPONENTS = [
  Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7,
];

// ─── Main dialog ─────────────────────────────────────────────────

export function AlgorithmExplanation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open) setIdx(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setIdx((s) => Math.min(s + 1, SLIDES.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setIdx((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const SlideContent = SLIDE_COMPONENTS[idx];
  const slide = SLIDES[idx];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          backgroundImage: "none",
          border: fullScreen ? "none" : "1px solid",
          borderColor: "divider",
          maxHeight: fullScreen ? "100%" : "90vh",
        },
      }}
    >
      <KatexStyles />

      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 4 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5">How It Works</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Single-reference gesture recognition via spectral graph
              theory.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Pipeline indicator */}
        <PipelineIndicator
          active={slide.step}
          onStep={(slideIdx) => setIdx(slideIdx)}
        />

        {/* Slide title */}
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontSize: "0.8rem" }}
          >
            {idx + 1}/{SLIDES.length}
          </Typography>
          <Typography variant="h6">{slide.title}</Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Slide content */}
        <Box
          key={idx}
          sx={{
            flex: 1,
            overflow: "auto",
            animation: "slideIn 0.25s ease",
            "@keyframes slideIn": {
              from: { opacity: 0, transform: "translateY(6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <SlideContent />
        </Box>

        {/* Navigation */}
        <Divider sx={{ mt: 3, mb: 2 }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            onClick={() => setIdx((s) => s - 1)}
            disabled={idx === 0}
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Back
          </Button>

          <Stack direction="row" spacing={0.75}>
            {SLIDES.map((_, i) => (
              <Box
                key={i}
                onClick={() => setIdx(i)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: i === idx ? ACCENT : "divider",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </Stack>

          <Button
            onClick={() => setIdx((s) => s + 1)}
            disabled={idx === SLIDES.length - 1}
            endIcon={<ArrowForwardIcon />}
            size="small"
            sx={{
              color:
                idx < SLIDES.length - 1 ? ACCENT : "text.secondary",
            }}
          >
            Next
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
