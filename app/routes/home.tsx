import { lazy, Suspense } from "react";
import type { Route } from "./+types/home";
import { Container, Typography, Box, Button, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router";
import { ScrollReveal } from "~/components/ScrollReveal";
import { HeroShowcase, type ShowcaseSlide } from "~/components/homepage/HeroShowcase";
import { SkillDomains } from "~/components/homepage/SkillDomains";
import { LanguagesDiagram } from "~/components/LanguagesDiagram";
import { HardwarePipelineDiagram } from "~/components/HardwarePipelineDiagram";

export const meta: Route.MetaFunction = () => [
  { title: "Lefinno Kwok — Portfolio" },
];

// Direct import for lightweight components
import GestureSkeletonPreview from "~/components/homepage/GestureSkeletonPreview";
import ComputerAutoDemo from "~/components/homepage/ComputerAutoDemo";

// Lazy-load heavier demo components (Three.js)
const CnnViz3D = lazy(() =>
  import("~/components/demos/ml-playground/views/CnnViz3D").then((m) => ({
    default: m.CnnViz3D,
  }))
);

function SlideLoading() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
        fontFamily: "'Fira Code', monospace",
        fontSize: "0.7rem",
      }}
    >
      Loading...
    </Box>
  );
}

const SLIDES: ShowcaseSlide[] = [
  {
    content: <ComputerAutoDemo />,
    tagline: "How my custom CPU executes",
    linkTo: "/projects/8-bit-transistor-computer",
  },
  {
    content: <GestureSkeletonPreview />,
    tagline: "How I approach gesture recognition",
    linkTo: "/projects/gesture-recognition",
  },
  {
    content: (
      <Box sx={{ width: "100%", height: "100%", p: 1, overflow: "hidden" }}>
        <LanguagesDiagram />
      </Box>
    ),
    tagline: "How I architect full-stack apps",
    linkTo: "/about",
  },
  {
    content: (
      <Box sx={{ width: "100%", height: "100%", p: 1, overflow: "hidden" }}>
        <HardwarePipelineDiagram />
      </Box>
    ),
    tagline: "How I design hardware products",
    linkTo: "/projects/retro-handheld",
  },
  {
    content: (
      <Suspense fallback={<SlideLoading />}>
        <CnnViz3D height={280} />
      </Suspense>
    ),
    tagline: "How I visualize neural inference",
    linkTo: "/about",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          py: { xs: 4, md: 0 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
              gap: { xs: 4, md: 6 },
              alignItems: "center",
            }}
          >
            {/* Left: Name + tagline */}
            <ScrollReveal>
              <Typography
                variant="overline"
                color="text.secondary"
                display="block"
                sx={{ mb: 2, fontSize: "0.9rem" }}
              >
                Portfolio
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
                  mb: 2,
                  lineHeight: 1.1,
                }}
              >
                Lefinno Kwok
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  mb: 4,
                  maxWidth: 480,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  fontSize: { xs: "1rem", md: "1.15rem" },
                }}
              >
                Building things that bridge hardware and software — from 8-bit
                computers to AI-powered web applications.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  to="/projects"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                >
                  View Projects
                </Button>
                <Button
                  component={Link}
                  to="/about"
                  variant="text"
                  sx={{ color: "text.secondary" }}
                >
                  About Me
                </Button>
              </Stack>
            </ScrollReveal>

            {/* Right: Cycling showcase */}
            <ScrollReveal delay={200}>
              <Box sx={{ px: { xs: 0, md: 4 } }}>
                <HeroShowcase slides={SLIDES} />
              </Box>
            </ScrollReveal>
          </Box>
        </Container>
      </Box>

      {/* Skill Domains */}
      <Box sx={{ py: 8, borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <SkillDomains />
          </ScrollReveal>
        </Container>
      </Box>
    </>
  );
}
