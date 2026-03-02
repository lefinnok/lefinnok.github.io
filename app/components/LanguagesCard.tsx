import {
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  IconButton,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { LanguagesDiagram } from "./LanguagesDiagram";

interface LanguagesCardProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function LanguagesCard({
  expanded,
  onToggleExpanded,
}: LanguagesCardProps) {
  return (
    <Card
      sx={{ cursor: expanded ? "default" : "pointer" }}
      onClick={expanded ? undefined : onToggleExpanded}
    >
      <CardContent>
        {/* Header — matches SkillCard layout */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 1,
          }}
        >
          <Box sx={{ color: "text.secondary" }}>
            <CodeIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              Languages & Frameworks
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded();
            }}
            sx={{ color: "text.secondary" }}
          >
            {expanded ? (
              <CloseFullscreenIcon fontSize="small" />
            ) : (
              <OpenInFullIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {expanded
            ? "Hover a component to highlight its language domain."
            : "What I use each language for, shown as a project architecture."}
        </Typography>

        {/* Collapsed preview */}
        {!expanded && (
          <Box
            sx={{
              position: "relative",
              maxHeight: 160,
              overflow: "hidden",
            }}
          >
            <LanguagesDiagram />
            {/* Fade-out gradient at bottom */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                background:
                  "linear-gradient(transparent, #141414)",
                pointerEvents: "none",
              }}
            />
          </Box>
        )}

        {/* Expanded full diagram */}
        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: 1 }}>
            <LanguagesDiagram />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
