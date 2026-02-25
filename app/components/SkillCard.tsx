import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import MemoryIcon from "@mui/icons-material/Memory";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessIcon from "@mui/icons-material/Business";
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
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 1,
          }}
        >
          <Box sx={{ color: "text.secondary" }}>
            {CATEGORY_ICONS[group.icon] ?? <CodeIcon />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              {group.label}
            </Typography>
          </Box>
        </Box>

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
      </CardContent>
    </Card>
  );
}
