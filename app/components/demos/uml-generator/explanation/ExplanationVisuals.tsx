import { Box, Typography, Stack } from "@mui/material";

export const ACCENT = "#00e5ff";
const ORANGE = "#f97316";

export function SlidePair({
  visual,
  children,
}: {
  visual: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 3, md: 4 },
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {visual}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

export function PipelineArrow() {
  return (
    <Typography sx={{ color: ACCENT, mx: 0.5, fontSize: 18, userSelect: "none" }}>
      {"\u2192"}
    </Typography>
  );
}

export function PipelineDiagram({ activeStep }: { activeStep: number }) {
  const steps = [
    { label: "NL Input", icon: "\u270D" },
    { label: "Prompt", icon: "\u{1F4DD}" },
    { label: "LLM", icon: "\u{1F916}" },
    { label: "Parse", icon: "\u{1F50D}" },
    { label: "Encode", icon: "\u{1F510}" },
    { label: "Render", icon: "\u{1F5BC}" },
  ];

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "rgba(0,0,0,0.3)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        sx={{ gap: 0.5 }}
      >
        {steps.map((step, i) => (
          <Stack key={step.label} direction="row" alignItems="center">
            <Box
              sx={{
                px: 1.5,
                py: 1,
                border: "1px solid",
                borderColor: i === activeStep ? ACCENT : "rgba(255,255,255,0.15)",
                borderRadius: 1,
                bgcolor: i === activeStep ? "rgba(0,229,255,0.08)" : "transparent",
                textAlign: "center",
                minWidth: 60,
              }}
            >
              <Typography sx={{ fontSize: 16, mb: 0.25 }}>{step.icon}</Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 9,
                  color: i === activeStep ? ACCENT : "text.secondary",
                  fontFamily: "'Fira Code', monospace",
                }}
              >
                {step.label}
              </Typography>
            </Box>
            {i < steps.length - 1 && <PipelineArrow />}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export function PromptDiagram() {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "rgba(0,0,0,0.3)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        fontFamily: "'Fira Code', monospace",
        fontSize: 10,
      }}
    >
      <Typography sx={{ color: ORANGE, fontSize: 10, fontFamily: "inherit", mb: 1 }}>
        System Prompt:
      </Typography>
      <Typography
        sx={{ color: "text.secondary", fontSize: 9, fontFamily: "inherit", mb: 1.5, pl: 1 }}
      >
        &quot;You are an expert UML diagram generator...&quot;
      </Typography>
      <Typography sx={{ color: ORANGE, fontSize: 10, fontFamily: "inherit", mb: 1 }}>
        User Prompt:
      </Typography>
      <Box sx={{ pl: 1 }}>
        <Typography sx={{ color: ACCENT, fontSize: 9, fontFamily: "inherit" }}>
          Diagram type: class
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 9, fontFamily: "inherit" }}>
          Current diagram: @startuml...@enduml
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 9, fontFamily: "inherit" }}>
          User request: &quot;Add a User class&quot;
        </Typography>
      </Box>
    </Box>
  );
}

export function ResponseFormatDiagram() {
  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          p: 1.5,
          bgcolor: "rgba(0,229,255,0.05)",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "rgba(0,229,255,0.2)",
        }}
      >
        <Typography
          sx={{ color: ACCENT, fontSize: 10, fontFamily: "'Fira Code', monospace", mb: 0.5 }}
        >
          Success response:
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 9, fontFamily: "'Fira Code', monospace" }}>
          CODE: ```plantuml
          <br />
          @startuml
          <br />
          class User &#123; ... &#125;
          <br />
          @enduml
          <br />
          ```
        </Typography>
      </Box>
      <Box
        sx={{
          p: 1.5,
          bgcolor: "rgba(249,115,22,0.05)",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "rgba(249,115,22,0.2)",
        }}
      >
        <Typography
          sx={{ color: ORANGE, fontSize: 10, fontFamily: "'Fira Code', monospace", mb: 0.5 }}
        >
          Clarification response:
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 9, fontFamily: "'Fira Code', monospace" }}>
          NEED_CLARIFICATION: What relationship
          <br />
          should exist between User and Order?
        </Typography>
      </Box>
    </Stack>
  );
}

export function EncodingDiagram() {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "rgba(0,0,0,0.3)",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1} alignItems="center">
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 9, color: "text.secondary", fontFamily: "'Fira Code', monospace" }}>
            PlantUML Text
          </Typography>
          <Typography sx={{ fontSize: 10, color: ACCENT, fontFamily: "'Fira Code', monospace" }}>
            &quot;@startuml\nclass User\n@enduml&quot;
          </Typography>
        </Box>
        <Typography sx={{ color: ACCENT, fontSize: 14 }}>{"\u2193"}</Typography>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 9, color: "text.secondary", fontFamily: "'Fira Code', monospace" }}>
            zlib deflate (raw)
          </Typography>
          <Typography sx={{ fontSize: 10, color: ORANGE, fontFamily: "'Fira Code', monospace" }}>
            [compressed bytes]
          </Typography>
        </Box>
        <Typography sx={{ color: ACCENT, fontSize: 14 }}>{"\u2193"}</Typography>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 9, color: "text.secondary", fontFamily: "'Fira Code', monospace" }}>
            Base64 + alphabet swap
          </Typography>
          <Typography sx={{ fontSize: 10, color: ACCENT, fontFamily: "'Fira Code', monospace" }}>
            &quot;SoWkIImgAStDuN...&quot;
          </Typography>
        </Box>
        <Typography sx={{ color: ACCENT, fontSize: 14 }}>{"\u2193"}</Typography>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 9, color: "text.secondary", fontFamily: "'Fira Code', monospace" }}>
            Append to URL
          </Typography>
          <Typography
            sx={{
              fontSize: 9,
              color: "text.secondary",
              fontFamily: "'Fira Code', monospace",
              wordBreak: "break-all",
            }}
          >
            plantuml.com/plantuml/svg/
            <span style={{ color: ACCENT }}>SoWkIImgAStDuN...</span>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
