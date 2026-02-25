import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import { Link } from "react-router";
import { useState } from "react";
import { FbxModelViewer } from "./FbxModelViewer";
import type { Project } from "~/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardActionArea
        component={Link}
        to={`/projects/${project.slug}`}
        sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box sx={{ height: 220, bgcolor: "background.default" }}>
          <FbxModelViewer
            config={project.model}
            height={220}
            rotationSpeed={0.003}
            hovered={hovered}
          />
        </Box>
        <CardContent sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
              {project.title}
            </Typography>
            {project.ongoing && (
              <Chip label="Ongoing" size="small" variant="outlined" />
            )}
          </Stack>
          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            sx={{ mb: 1 }}
          >
            {project.date}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {project.shortDescription}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {project.tags.slice(0, 4).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ borderColor: "divider" }}
              />
            ))}
            {project.tags.length > 4 && (
              <Chip
                label={`+${project.tags.length - 4}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: "divider" }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
