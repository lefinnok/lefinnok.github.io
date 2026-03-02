import type { Route } from "./+types/about";

export const meta: Route.MetaFunction = () => [
  { title: "About — Lefinno Kwok" },
];

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkIcon from "@mui/icons-material/Link";
import { ScrollReveal } from "~/components/ScrollReveal";
import { SkillCard } from "~/components/SkillCard";
import { LanguagesCard } from "~/components/LanguagesCard";
import { bio } from "~/data/bio";
import { skillGroups } from "~/data/skills";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  GitHub: <GitHubIcon fontSize="small" />,
  Link: <LinkIcon fontSize="small" />,
};

export default function About() {
  const [languagesExpanded, setLanguagesExpanded] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Bio Section */}
      <ScrollReveal>
        <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
          {bio.name}
        </Typography>
        <Typography
          variant="overline"
          color="text.secondary"
          display="block"
          sx={{ mb: 3, fontSize: "0.9rem" }}
        >
          {bio.title}
        </Typography>
        <Box sx={{ maxWidth: 700, mb: 3 }}>
          {bio.paragraphs.map((p, i) => (
            <Typography
              key={i}
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.8 }}
            >
              {p}
            </Typography>
          ))}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mb: 6 }}>
          {bio.socialLinks.map((link) => (
            <Button
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              startIcon={SOCIAL_ICONS[link.icon] ?? <LinkIcon fontSize="small" />}
            >
              {link.platform}
            </Button>
          ))}
        </Stack>
      </ScrollReveal>

      {/* Skills Grid */}
      <ScrollReveal delay={100}>
        <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
          Skills & Experience
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Click a category to expand and see details.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {/* Languages card — spans full width when expanded */}
          <ScrollReveal
            delay={150}
            sx={{
              gridColumn: languagesExpanded ? "1 / -1" : undefined,
            }}
          >
            <LanguagesCard
              expanded={languagesExpanded}
              onToggleExpanded={() =>
                setLanguagesExpanded((prev) => !prev)
              }
            />
          </ScrollReveal>

          {/* Other skill categories */}
          {skillGroups
            .filter((g) => g.id !== "languages-frameworks")
            .map((group, i) => (
              <ScrollReveal key={group.id} delay={230 + i * 80}>
                <SkillCard group={group} />
              </ScrollReveal>
            ))}
        </Box>
      </ScrollReveal>
    </Container>
  );
}
