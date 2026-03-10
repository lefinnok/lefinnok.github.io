import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import UndoIcon from "@mui/icons-material/Undo";
import CodeIcon from "@mui/icons-material/Code";

interface CodeEditorPanelProps {
  plantumlCode: string;
  onCodeChange: (code: string) => void;
  onToggleDiagramView: () => void;
}

export function CodeEditorPanel({
  plantumlCode,
  onCodeChange,
  onToggleDiagramView,
}: CodeEditorPanelProps) {
  const [localCode, setLocalCode] = useState(plantumlCode);
  const [hasChanges, setHasChanges] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync when external code changes (e.g., from LLM response)
  useEffect(() => {
    setLocalCode(plantumlCode);
    setHasChanges(false);
  }, [plantumlCode]);

  const handleChange = (value: string) => {
    setLocalCode(value);
    setHasChanges(value !== plantumlCode);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onCodeChange(value);
    }, 600);
  };

  const handleRevert = () => {
    setLocalCode(plantumlCode);
    setHasChanges(false);
    onCodeChange(plantumlCode);
  };

  const lineCount = localCode.split("\n").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ flexShrink: 0, pb: 0.5 }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CodeIcon sx={{ fontSize: 14, color: "#f97316" }} />
          <Typography
            variant="caption"
            sx={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "text.secondary" }}
          >
            PlantUML Source
          </Typography>
          {hasChanges && (
            <Typography
              variant="caption"
              sx={{ fontSize: 9, color: "#f97316", fontStyle: "italic" }}
            >
              (modified)
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={0.25}>
          {hasChanges && (
            <Tooltip title="Revert changes" arrow>
              <IconButton size="small" onClick={handleRevert}>
                <UndoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Show diagram" arrow>
            <IconButton size="small" onClick={onToggleDiagramView}>
              <ImageIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Editor */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          bgcolor: "#111",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* Line numbers */}
        <Box
          sx={{
            flexShrink: 0,
            py: 1,
            px: 0.5,
            textAlign: "right",
            borderRight: "1px solid",
            borderColor: "divider",
            userSelect: "none",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <Typography
              key={i}
              variant="caption"
              sx={{
                display: "block",
                fontFamily: "'Fira Code', monospace",
                fontSize: 11,
                lineHeight: "18px",
                color: "rgba(255,255,255,0.2)",
                pr: 0.5,
              }}
            >
              {i + 1}
            </Typography>
          ))}
        </Box>

        {/* Textarea */}
        <Box
          component="textarea"
          value={localCode}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
          spellCheck={false}
          sx={{
            flex: 1,
            resize: "none",
            border: "none",
            outline: "none",
            bgcolor: "transparent",
            color: "#e0e0e0",
            fontFamily: "'Fira Code', monospace",
            fontSize: 11,
            lineHeight: "18px",
            p: 1,
            overflow: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 },
          }}
        />
      </Box>
    </Box>
  );
}
