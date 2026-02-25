import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
  { title: "Lefinno Kwok — Portfolio" },
];

import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router";
import { ScrollReveal } from "~/components/ScrollReveal";
import { FbxModelViewer } from "~/components/FbxModelViewer";
import { projects } from "~/data/projects";

const featuredProject = projects.find((p) => p.featured) ?? projects[0];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
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
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
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
                maxWidth: 600,
                fontWeight: 400,
                lineHeight: 1.5,
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
        </Container>
      </Box>

      {/* Featured Project */}
      <Box sx={{ py: 8, borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography
              variant="overline"
              color="text.secondary"
              display="block"
              sx={{ mb: 1, fontSize: "0.85rem" }}
            >
              {featuredProject.ongoing ? "Ongoing Project" : "Featured Project"}
            </Typography>
          </ScrollReveal>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 6,
              mt: 2,
            }}
          >
            <ScrollReveal delay={100}>
              <Box
                sx={{
                  height: { xs: 250, md: 350 },
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <FbxModelViewer
                  config={featuredProject.model}
                  height="100%"
                  rotationSpeed={0.004}
                />
              </Box>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="h4" component="h2">
                  {featuredProject.title}
                </Typography>
                {featuredProject.ongoing && (
                  <Chip label="Ongoing" size="small" variant="outlined" />
                )}
              </Stack>
              <Typography
                variant="overline"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                {featuredProject.date}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.7 }}
              >
                {featuredProject.longDescription}
              </Typography>
              <Button
                component={Link}
                to={`/projects/${featuredProject.slug}`}
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon />}
              >
                Learn More
              </Button>
            </ScrollReveal>
          </Box>
        </Container>
      </Box>

      {/* Quick Links */}
      <Box sx={{ py: 8, borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                gap: 3,
              }}
            >
              <Box
                component={Link}
                to="/projects"
                sx={{
                  p: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  textDecoration: "none",
                  color: "text.primary",
                  transition:
                    "border-color 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Projects
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Explore the full catalogue of things I've built.
                </Typography>
              </Box>
              <Box
                component={Link}
                to="/about"
                sx={{
                  p: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  textDecoration: "none",
                  color: "text.primary",
                  transition:
                    "border-color 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  About
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Skills, experience, and what drives me.
                </Typography>
              </Box>
              <Box
                component="a"
                href="https://linktr.ee/lefinno"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  p: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  textDecoration: "none",
                  color: "text.primary",
                  transition:
                    "border-color 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.3)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Contact
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get in touch via Linktree.
                </Typography>
              </Box>
            </Box>
          </ScrollReveal>
        </Container>
      </Box>
    </>
  );
}
