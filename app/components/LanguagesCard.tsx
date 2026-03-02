import {
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  Button,
  IconButton,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { LANGUAGE_DOMAINS } from "~/data/languages";
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
    <Card>
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
          {expanded && (
            <IconButton
              size="small"
              onClick={onToggleExpanded}
              sx={{ color: "text.secondary" }}
            >
              <CloseFullscreenIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {expanded
            ? "Hover a component to highlight its language domain."
            : "Languages I use most commonly and what I reach for them for."}
        </Typography>

        {/* Collapsed: language list */}
        {!expanded && (
          <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {LANGUAGE_DOMAINS.map((domain) => (
                <Box
                  key={domain.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 0.5,
                    px: 0.75,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  }}
                >
                  {/* Language icon */}
                  <Box
                    component={domain.icon}
                    sx={{
                      fontSize: 16,
                      color: domain.color,
                      flexShrink: 0,
                    }}
                  />

                  {/* Language name */}
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 0, whiteSpace: "nowrap" }}
                  >
                    {domain.label}
                  </Typography>

                  {/* Use case */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flex: 1,
                      fontSize: "0.75rem",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {domain.useCase}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Expand button */}
            <Button
              size="small"
              variant="outlined"
              startIcon={<AccountTreeIcon />}
              onClick={onToggleExpanded}
              sx={{
                mt: 2,
                width: "100%",
                fontSize: 12,
                textTransform: "none",
                color: "text.secondary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "text.secondary",
                  bgcolor: "rgba(255,255,255,0.03)",
                },
              }}
            >
              How I'd use them in a project
            </Button>
          </>
        )}

        {/* Expanded: full architecture diagram */}
        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: 1 }}>
            <LanguagesDiagram />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
