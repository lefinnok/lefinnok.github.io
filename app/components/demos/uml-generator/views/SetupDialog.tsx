import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  TextField,
  Stack,
  Divider,
  Chip,
  Alert,
  IconButton,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { FREE_MODELS, type OpenRouterModel } from "../engine/types";

export interface SetupResult {
  model: string;
  apiKey: string | null;
  apiEndpoint: string | null;
}

interface SetupDialogProps {
  open: boolean;
  onComplete: (result: SetupResult) => void;
}

const PROXY_ENDPOINT = "supabase-proxy";

export function SetupDialog({ open, onComplete }: SetupDialogProps) {
  const [mode, setMode] = useState<"choose" | "custom">("choose");
  const [selectedFreeModel, setSelectedFreeModel] = useState(FREE_MODELS[0].id);
  const [customApiKey, setCustomApiKey] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("https://openrouter.ai/api/v1");
  const [showKey, setShowKey] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleFreeModelSelect = () => {
    onComplete({
      model: selectedFreeModel,
      apiKey: null,
      apiEndpoint: PROXY_ENDPOINT,
    });
  };

  const handleCustomSubmit = () => {
    if (!customApiKey.trim() || !customModel.trim()) return;
    onComplete({
      model: customModel.trim(),
      apiKey: customApiKey.trim(),
      apiEndpoint: customEndpoint.trim() || null,
    });
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          backgroundImage: "none",
          border: fullScreen ? "none" : "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          UML Diagram Generator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose how to power the AI diagram generation.
        </Typography>

        {/* Free models option */}
        <Box
          onClick={() => setMode("choose")}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: mode === "choose" ? "#f97316" : "divider",
            bgcolor: mode === "choose" ? "rgba(249,115,22,0.04)" : "transparent",
            cursor: "pointer",
            mb: 1.5,
            transition: "all 0.15s",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Use free models (via proxy)
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 13, color: "#f97316" }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              Free models may produce lower quality diagrams compared to
              commercial models. Results may be inconsistent.
            </Typography>
          </Stack>

          {mode === "choose" && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontSize: 10 }}>
                Select a model:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {FREE_MODELS.map((m) => (
                  <Chip
                    key={m.id}
                    label={m.name}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFreeModel(m.id);
                    }}
                    sx={{
                      height: 24,
                      fontSize: 11,
                      fontFamily: "'Fira Code', monospace",
                      bgcolor: selectedFreeModel === m.id ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: selectedFreeModel === m.id ? "#f97316" : "rgba(255,255,255,0.1)",
                      color: selectedFreeModel === m.id ? "#f97316" : "text.secondary",
                    }}
                  />
                ))}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                onClick={handleFreeModelSelect}
                sx={{
                  mt: 1.5,
                  color: "#f97316",
                  borderColor: "#f97316",
                  "&:hover": { borderColor: "#ea580c", bgcolor: "rgba(249,115,22,0.08)" },
                }}
              >
                Start with free model
              </Button>
            </>
          )}
        </Box>

        {/* Custom API key option */}
        <Box
          onClick={() => setMode("custom")}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: mode === "custom" ? "#00e5ff" : "divider",
            bgcolor: mode === "custom" ? "rgba(0,229,255,0.04)" : "transparent",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Use your own API key &amp; model
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, lineHeight: 1.4 }}>
            Provide your own OpenRouter or OpenAI-compatible API key for
            higher quality results. Recommended for best experience.
          </Typography>

          {mode === "custom" && (
            <Stack spacing={1.5} onClick={(e) => e.stopPropagation()}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mb: 0.25, display: "block" }}>
                  API Key
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="sk-..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  type={showKey ? "text" : "password"}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton size="small" onClick={() => setShowKey(!showKey)} edge="end">
                          {showKey ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      ),
                      sx: { fontFamily: "'Fira Code', monospace", fontSize: 12 },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mb: 0.25, display: "block" }}>
                  Model ID
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="e.g. openai/gpt-4o, anthropic/claude-sonnet-4"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  slotProps={{
                    input: { sx: { fontFamily: "'Fira Code', monospace", fontSize: 12 } },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mb: 0.25, display: "block" }}>
                  API Endpoint (OpenAI-compatible)
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  slotProps={{
                    input: { sx: { fontFamily: "'Fira Code', monospace", fontSize: 12 } },
                  }}
                />
              </Box>

              <Alert severity="info" sx={{ py: 0.25, "& .MuiAlert-message": { fontSize: 11 } }}>
                Your API key is only stored in this browser session and is sent
                directly to the endpoint you specify. It is never stored or sent
                to this website&rsquo;s servers.
              </Alert>

              <Button
                variant="outlined"
                size="small"
                onClick={handleCustomSubmit}
                disabled={!customApiKey.trim() || !customModel.trim()}
                sx={{
                  color: "#00e5ff",
                  borderColor: "#00e5ff",
                  "&:hover": { borderColor: "#00e5ff", bgcolor: "rgba(0,229,255,0.08)" },
                }}
              >
                Start with custom model
              </Button>
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
