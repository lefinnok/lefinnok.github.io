import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import type { Diagram } from "../engine/types";

interface DiagramTabsProps {
  diagrams: Diagram[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function DiagramTabs({
  diagrams,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: DiagramTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.25}
      sx={{
        overflow: "auto",
        flexShrink: 0,
        pb: 0.5,
        "&::-webkit-scrollbar": { height: 3 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 },
      }}
    >
      {diagrams.map((d) => {
        const isActive = d.id === activeId;
        const isEditing = editingId === d.id;

        return (
          <Box
            key={d.id}
            onClick={() => onSelect(d.id)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              cursor: "pointer",
              bgcolor: isActive ? "rgba(249,115,22,0.1)" : "transparent",
              border: "1px solid",
              borderColor: isActive ? "rgba(249,115,22,0.3)" : "transparent",
              "&:hover": {
                bgcolor: isActive ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.03)",
              },
              flexShrink: 0,
            }}
          >
            {isEditing ? (
              <TextField
                size="small"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                slotProps={{
                  input: {
                    sx: {
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 10,
                      py: 0,
                      px: 0.5,
                      height: 20,
                    },
                  },
                }}
                sx={{ width: 100 }}
              />
            ) : (
              <Typography
                variant="caption"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startRename(d.id, d.title);
                }}
                sx={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 10,
                  color: isActive ? "#f97316" : "text.secondary",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {d.title}
              </Typography>
            )}

            {diagrams.length > 1 && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(d.id);
                }}
                sx={{ p: 0, color: "rgba(255,255,255,0.2)", "&:hover": { color: "#ef4444" } }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </IconButton>
            )}
          </Box>
        );
      })}

      <Tooltip title="New diagram" arrow>
        <IconButton size="small" onClick={onCreate} sx={{ color: "text.secondary", flexShrink: 0 }}>
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
