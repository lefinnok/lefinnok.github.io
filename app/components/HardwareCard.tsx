import {
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  Button,
  IconButton,
} from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import TimelineIcon from "@mui/icons-material/Timeline";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { HARDWARE_STAGES } from "~/data/hardware";
import { HardwarePipelineDiagram } from "./HardwarePipelineDiagram";

interface HardwareCardProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function HardwareCard({
  expanded,
  onToggleExpanded,
}: HardwareCardProps) {
  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 1,
          }}
        >
          <Box sx={{ color: "text.secondary" }}>
            <MemoryIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              Hardware & Embedded
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
            ? "Hover a stage to see details."
            : "Full product lifecycle from schematic to deployment."}
        </Typography>

        {/* Collapsed: stage list */}
        {!expanded && (
          <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {HARDWARE_STAGES.map((stage) => (
                <Box
                  key={stage.id}
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
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: stage.color,
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{ minWidth: 0, whiteSpace: "nowrap" }}
                  >
                    {stage.label}
                  </Typography>

                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 0.75,
                      overflow: "hidden",
                    }}
                  >
                    {stage.icons.map((Icon, i) => (
                      <Box
                        key={i}
                        component={Icon}
                        sx={{
                          fontSize: "0.8rem",
                          color: stage.color,
                          flexShrink: 0,
                        }}
                      />
                    ))}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {stage.tool}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Button
              size="small"
              variant="outlined"
              startIcon={<TimelineIcon />}
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
              See full product lifecycle
            </Button>
          </>
        )}

        {/* Expanded: pipeline diagram */}
        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: 1 }}>
            <HardwarePipelineDiagram />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
