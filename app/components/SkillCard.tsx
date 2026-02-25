import {
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeIcon from "@mui/icons-material/Code";
import MemoryIcon from "@mui/icons-material/Memory";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessIcon from "@mui/icons-material/Business";
import { useState } from "react";
import { SkillVisual } from "./SkillVisual";
import type { SkillGroup } from "~/lib/types";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Code: <CodeIcon />,
  Memory: <MemoryIcon />,
  Psychology: <PsychologyIcon />,
  SportsEsports: <SportsEsportsIcon />,
  Groups: <GroupsIcon />,
  Business: <BusinessIcon />,
};

interface SkillCardProps {
  group: SkillGroup;
}

export function SkillCard({ group }: SkillCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{
        cursor: "pointer",
        "&:hover": expanded
          ? {}
          : { borderColor: "rgba(255,255,255,0.2)" },
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box sx={{ color: "text.secondary" }}>
            {CATEGORY_ICONS[group.icon] ?? <CodeIcon />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {group.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.skills.length} skills
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              color: "text.secondary",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {group.description}
            </Typography>
            {group.skills.map((skill) => (
              <SkillVisual
                key={skill.name}
                name={skill.name}
                proficiency={skill.proficiency}
              />
            ))}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
