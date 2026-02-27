import type { Route } from "./+types/project-detail";

export const meta: Route.MetaFunction = () => [
  { title: "Project — Lefinno Kwok" },
];

import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GitHubIcon from "@mui/icons-material/GitHub";
import DescriptionIcon from "@mui/icons-material/Description";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useParams, Link } from "react-router";
import { ScrollReveal } from "~/components/ScrollReveal";
import { FbxModelViewer } from "~/components/FbxModelViewer";
import { InteractiveDemoSlot } from "~/components/InteractiveDemoSlot";
import { useProject } from "~/hooks/useProject";

const LINK_ICONS: Record<string, React.ReactNode> = {
  github: <GitHubIcon fontSize="small" />,
  demo: <OpenInNewIcon fontSize="small" />,
  report: <DescriptionIcon fontSize="small" />,
  play: <SportsEsportsIcon fontSize="small" />,
  external: <OpenInNewIcon fontSize="small" />,
};

export default function ProjectDetail() {
  const { slug } = useParams();
  const { project } = useProject(slug ?? "");

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4">Project not found</Typography>
        <Button component={Link} to="/projects" sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <ScrollReveal>
        <Button
          component={Link}
          to="/projects"
          size="small"
          sx={{ mb: 3, color: "text.secondary" }}
        >
          &larr; All Projects
        </Button>
      </ScrollReveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "stretch",
          gap: 6,
          mb: 6,
        }}
      >
        {project.model && (
          <ScrollReveal sx={{ height: "100%" }}>
            <Box
              sx={{
                height: { xs: 300, md: "100%" },
                minHeight: { md: 300 },
                bgcolor: "background.paper",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <FbxModelViewer
                config={project.model}
                height="100%"
                rotationSpeed={0.004}
                followMouse
              />
            </Box>
          </ScrollReveal>
        )}

        <ScrollReveal delay={100}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h3" component="h1">
              {project.title}
            </Typography>
            {project.ongoing && (
              <Chip label="Ongoing" variant="outlined" />
            )}
          </Stack>

          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            sx={{ mb: 3 }}
          >
            {project.date}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            {project.longDescription}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 4 }}>
            {project.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ borderColor: "divider" }}
              />
            ))}
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {project.hasInteractiveDemo && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayCircleOutlineIcon />}
                onClick={() =>
                  document
                    .getElementById("interactive-demo")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                sx={{
                  color: "#f97316",
                  borderColor: "#f97316",
                  "&:hover": {
                    borderColor: "#ea580c",
                    bgcolor: "rgba(249,115,22,0.08)",
                  },
                }}
              >
                Try Demo
              </Button>
            )}
            {project.links.map((link) => (
              <Button
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                startIcon={LINK_ICONS[link.type]}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        </ScrollReveal>
      </Box>

      {(project.steamAppId || project.itchEmbed) && (
        <ScrollReveal>
          <Stack spacing={2} sx={{ mb: 6 }}>
            {project.steamAppId && (
              <Box>
                <iframe
                  frameBorder="0"
                  src={`https://store.steampowered.com/widget/${project.steamAppId}/`}
                  width="646"
                  height="190"
                  style={{ maxWidth: "100%" }}
                />
              </Box>
            )}
            {project.itchEmbed && (
              <Box>
                <iframe
                  frameBorder="0"
                  src={`https://itch.io/embed/${project.itchEmbed.id}?dark=true`}
                  width="552"
                  height="167"
                  style={{ maxWidth: "100%" }}
                >
                  <a href={project.itchEmbed.url}>
                    {project.itchEmbed.title}
                  </a>
                </iframe>
              </Box>
            )}
          </Stack>
        </ScrollReveal>
      )}

      <Box id="interactive-demo">
        <InteractiveDemoSlot
          available={project.hasInteractiveDemo}
          componentName={project.demoComponentName}
        />
      </Box>
    </Container>
  );
}
