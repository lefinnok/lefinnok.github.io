import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  TextField,
  Stack,
  Alert,
  IconButton,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export interface SetupResult {
  model: string;
  apiKey: string | null;
  apiEndpoint: string | null;
}

interface SetupDialogProps {
  open: boolean;
  onComplete: (result: SetupResult) => void;
}

const DEFAULT_ENDPOINT = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export function SetupDialog({ open, onComplete }: SetupDialogProps) {
  const [customApiKey, setCustomApiKey] = useState("");
  const [customModel, setCustomModel] = useState(DEFAULT_MODEL);
  const [customEndpoint, setCustomEndpoint] = useState(DEFAULT_ENDPOINT);
  const [showKey, setShowKey] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = () => {
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The shared free-model proxy is retired. The live demo now runs
          against your own OpenAI-compatible endpoint.
        </Typography>

        <Alert severity="info" sx={{ mb: 2.5, py: 0.5, "& .MuiAlert-message": { fontSize: 12 } }}>
          Your key stays in this browser session. Requests go directly from
          this page to the endpoint you specify, then to PlantUML&rsquo;s
          public renderer. Nothing is proxied through this site.
        </Alert>

        <Stack spacing={1.75}>
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
                  sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12 },
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
              placeholder="e.g. openai/gpt-4o-mini, anthropic/claude-sonnet-4"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              slotProps={{
                input: { sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12 } },
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
                input: { sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12 } },
              }}
            />
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, lineHeight: 1.5 }}>
          Need a key? Create one at{" "}
          <Link href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" sx={{ color: "#D97757" }}>
            openrouter.ai/keys
          </Link>
          , or point the endpoint at any compatible service.
        </Typography>

        <Button
          variant="outlined"
          size="small"
          onClick={handleSubmit}
          disabled={!customApiKey.trim() || !customModel.trim()}
          sx={{
            mt: 2.5,
            color: "#D97757",
            borderColor: "#D97757",
            "&:hover": { borderColor: "#D97757", bgcolor: "rgba(217,119,87,0.08)" },
          }}
        >
          Start with my model
        </Button>
      </DialogContent>
    </Dialog>
  );
}
