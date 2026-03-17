import { lazy, Suspense } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ScienceIcon from "@mui/icons-material/Science";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { ML_CAPABILITIES } from "~/data/mlai";

const MlPlaygroundDemo = lazy(
  () => import("~/components/demos/ml-playground/MlPlaygroundDemo")
);

interface MlaiCardProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function MlaiCard({ expanded, onToggleExpanded }: MlaiCardProps) {
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
            <PsychologyIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem" }}>
              AI / ML & Computer Vision
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
            ? "Train a model live in your browser."
            : "Machine learning, computer vision, and neural networks."}
        </Typography>

        {/* Collapsed: capabilities list */}
        {!expanded && (
          <>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
            >
              {ML_CAPABILITIES.map((cap) => (
                <Box
                  key={cap.id}
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
                    component={cap.icon}
                    sx={{
                      fontSize: 16,
                      color: cap.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 0, whiteSpace: "nowrap" }}
                  >
                    {cap.label}
                  </Typography>
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
                    {cap.useCase}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button
              size="small"
              variant="outlined"
              startIcon={<ScienceIcon />}
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
              Try the live demos
            </Button>
          </>
        )}

        {/* Expanded: lazy-loaded ML playground */}
        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: 1 }}>
            <Suspense
              fallback={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    py: 8,
                    color: "text.secondary",
                  }}
                >
                  <CircularProgress size={20} color="inherit" />
                  <Typography variant="body2">
                    Loading ML playground...
                  </Typography>
                </Box>
              }
            >
              <MlPlaygroundDemo />
            </Suspense>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
