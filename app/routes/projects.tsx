import type { Route } from "./+types/projects";

export const meta: Route.MetaFunction = () => [
  { title: "Projects — Lefinno Kwok" },
];

import { Container, Typography, Box } from "@mui/material";
import { ScrollReveal } from "~/components/ScrollReveal";
import { ProjectCard } from "~/components/ProjectCard";
import { useProjects } from "~/hooks/useProjects";

export default function Projects() {
  const { projects } = useProjects();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <ScrollReveal>
        <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
          Projects
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          A collection of things I've built — spanning hardware, software, and
          everything in between.
        </Typography>
      </ScrollReveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "1fr 1fr 1fr",
          },
          gap: 3,
        }}
      >
        {projects.map((project, i) => (
          <ScrollReveal key={project.slug} delay={i * 100}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </Box>
    </Container>
  );
}
