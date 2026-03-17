import { Box, Typography } from "@mui/material";
import { Link } from "react-router";
import CodeIcon from "@mui/icons-material/Code";
import MemoryIcon from "@mui/icons-material/Memory";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const FONT = "'Fira Code', monospace";

const DOMAINS = [
  {
    icon: <CodeIcon sx={{ fontSize: 28, color: "#38bdf8" }} />,
    title: "Software",
    description:
      "Full-stack development with React, TypeScript, and modern web tooling.",
  },
  {
    icon: <MemoryIcon sx={{ fontSize: 28, color: "#4ade80" }} />,
    title: "Hardware",
    description:
      "PCB design, embedded systems, and computer architecture.",
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 28, color: "#f97316" }} />,
    title: "AI / ML",
    description:
      "Computer vision, neural networks, and machine learning pipelines.",
  },
] as const;

export function SkillDomains() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
        gap: 3,
      }}
    >
      {DOMAINS.map((d) => (
        <Box
          key={d.title}
          component={Link}
          to="/about"
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            textDecoration: "none",
            color: "text.primary",
            transition: "border-color 0.2s ease, transform 0.2s ease",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.3)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            {d.icon}
            <Typography
              variant="h6"
              sx={{ fontFamily: FONT, fontSize: "0.95rem" }}
            >
              {d.title}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, lineHeight: 1.6 }}
          >
            {d.description}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: FONT,
              fontSize: "0.7rem",
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            Learn more <ArrowForwardIcon sx={{ fontSize: 12 }} />
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
