import { useEffect, useState, Fragment } from "react";
import {
  Box,
  Typography,
  Divider,
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
  SlidePair,
  PipelineDiagram,
  PromptDiagram,
  ResponseFormatDiagram,
  EncodingDiagram,
} from "./ExplanationVisuals";

const PIPELINE = [
  { key: "input", label: "Input" },
  { key: "prompt", label: "Prompt" },
  { key: "llm", label: "LLM" },
  { key: "parse", label: "Parse" },
  { key: "encode", label: "Encode" },
  { key: "render", label: "Render" },
] as const;

interface SlideInfo {
  step: number;
  title: string;
}

const SLIDES: SlideInfo[] = [
  { step: 0, title: "Overview" },
  { step: 0, title: "Natural Language Input" },
  { step: 1, title: "Prompt Construction" },
  { step: 2, title: "LLM Processing" },
  { step: 3, title: "Response Parsing" },
  { step: 4, title: "PlantUML Encoding" },
  { step: 5, title: "Server-Side Rendering" },
];

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
              bgcolor: i === active ? "rgba(0,229,255,0.08)" : "transparent",
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

function Slide0() {
  return (
    <SlidePair visual={<PipelineDiagram activeStep={-1} />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This demo converts <strong>natural language descriptions</strong> into
        UML diagrams through a multi-stage pipeline. Each step transforms the
        input closer to a rendered diagram.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The pipeline runs entirely in your browser — no backend server is
        needed. The only external calls are to{" "}
        <strong>OpenRouter</strong> (for the LLM) and{" "}
        <strong>PlantUML&rsquo;s public server</strong> (for rendering).
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Use the pipeline indicator above or the arrow keys to step through each
        stage.
      </Typography>
    </SlidePair>
  );
}

function Slide1() {
  return (
    <SlidePair visual={<PipelineDiagram activeStep={0} />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        You describe your diagram in plain English, for example:{" "}
        <em>
          &ldquo;Create a class diagram with User, Product, and Order
          classes&rdquo;
        </em>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The system maintains <strong>conversation context</strong> so you can
        refine iteratively:{" "}
        <em>&ldquo;Add an email attribute to User&rdquo;</em>,{" "}
        <em>&ldquo;Create a relationship between Order and Product&rdquo;</em>.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Each message is combined with the current diagram state to form the
        prompt for the LLM.
      </Typography>
    </SlidePair>
  );
}

function Slide2() {
  return (
    <SlidePair visual={<PromptDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The prompt sent to the LLM has two parts:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2, "& li": { mb: 0.5 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>System prompt</strong> — defines the assistant&rsquo;s role,
          output format rules, and PlantUML conventions
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>User prompt</strong> — includes the diagram type, current
          PlantUML code (if any), recent conversation context, and the new
          request
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        By including the full current diagram in each prompt, the LLM can
        make targeted modifications while preserving existing elements.
      </Typography>
    </SlidePair>
  );
}

function Slide3() {
  return (
    <SlidePair visual={<PipelineDiagram activeStep={2} />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The prompt is sent to a free LLM via{" "}
        <strong>OpenRouter</strong>, which routes requests to models like Gemma
        2, Llama 3.1, or Mistral 7B.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The model is instructed to respond in one of two formats:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2, "& li": { mb: 0.5 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong style={{ color: ACCENT }}>CODE:</strong> followed by PlantUML
          code in a fenced code block
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong style={{ color: "#f97316" }}>NEED_CLARIFICATION:</strong>{" "}
          followed by questions when the request is ambiguous
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Temperature is set to <strong>0.2</strong> for consistent, predictable
        diagram output.
      </Typography>
    </SlidePair>
  );
}

function Slide4() {
  return (
    <SlidePair visual={<ResponseFormatDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The parser extracts the PlantUML code from the LLM&rsquo;s response
        using pattern matching on fenced code blocks.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A cleanup step handles common LLM quirks:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2, "& li": { mb: 0.5 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          Removes stray &ldquo;plantuml&rdquo; lines that break rendering
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Ensures <code>@startuml</code> / <code>@enduml</code> delimiters are
          present
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Falls back to searching for <code>@startuml...@enduml</code> blocks if
          the standard format isn&rsquo;t found
        </Typography>
      </Box>
    </SlidePair>
  );
}

function Slide5() {
  return (
    <SlidePair visual={<EncodingDiagram />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        PlantUML&rsquo;s server expects diagram source encoded in a URL. The
        encoding process:
      </Typography>
      <Box component="ol" sx={{ pl: 2, mb: 2, "& li": { mb: 0.5 } }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>UTF-8 encode</strong> the PlantUML text
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>zlib deflate</strong> (raw, no headers) to compress
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>Base64 encode</strong> the compressed bytes
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>Translate</strong> from standard Base64 alphabet to
          PlantUML&rsquo;s custom URL-safe alphabet
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        The custom alphabet replaces <code>+/</code> with <code>-_</code> and
        reorders characters for URL safety. This is done in the browser using
        the <strong>pako</strong> library.
      </Typography>
    </SlidePair>
  );
}

function Slide6() {
  return (
    <SlidePair visual={<PipelineDiagram activeStep={5} />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The encoded string is appended to PlantUML&rsquo;s public server URL:
      </Typography>
      <Box
        sx={{
          p: 1,
          bgcolor: "rgba(0,0,0,0.3)",
          borderRadius: 1,
          mb: 2,
          fontFamily: "'Fira Code', monospace",
          fontSize: 10,
          wordBreak: "break-all",
          color: "text.secondary",
        }}
      >
        https://www.plantuml.com/plantuml/svg/
        <span style={{ color: ACCENT }}>&#123;encoded&#125;</span>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The server decompresses and renders the diagram to <strong>SVG</strong>,
        which is loaded directly as an image. No CORS issues since it&rsquo;s
        used via an <code>&lt;img&gt;</code> tag.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        You can also export as <strong>PNG</strong> or open the diagram in
        PlantUML&rsquo;s online editor for further modification.
      </Typography>
    </SlidePair>
  );
}

const SLIDE_COMPONENTS = [Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];

export function PipelineExplanation({
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
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 4 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5">How It Works</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Natural language to UML diagram pipeline.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <PipelineIndicator
          active={slide.step}
          onStep={(slideIdx) => setIdx(slideIdx)}
        />

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
            onClick={() =>
              idx === SLIDES.length - 1
                ? onClose()
                : setIdx((s) => s + 1)
            }
            endIcon={idx < SLIDES.length - 1 ? <ArrowForwardIcon /> : null}
            size="small"
            sx={{ color: idx === SLIDES.length - 1 ? ACCENT : "text.secondary" }}
          >
            {idx === SLIDES.length - 1 ? "Done" : "Next"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
