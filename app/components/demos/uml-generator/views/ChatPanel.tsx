import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import type { ChatMessage } from "../engine/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  hasApiKey: boolean;
  onSendMessage: (message: string) => void;
  onRequestSetup?: () => void;
}

export function ChatPanel({
  messages,
  isProcessing,
  hasApiKey,
  onSendMessage,
  onRequestSetup,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing || !hasApiKey) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Message list */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          px: 1,
          py: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 },
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic", textAlign: "center", px: 2 }}
            >
              Describe a UML diagram to generate. e.g. &ldquo;Create a class diagram
              for a library system with Book, Author, and Member classes&rdquo;
            </Typography>
          </Box>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isProcessing && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 1 }}>
            <CircularProgress size={14} sx={{ color: "#00e5ff" }} />
            <Typography
              variant="caption"
              sx={{ color: "#00e5ff", fontFamily: "'Fira Code', monospace", fontSize: 11 }}
            >
              Generating diagram...
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Input area */}
      <Box sx={{ flexShrink: 0, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={0.5} alignItems="flex-end">
          <TextField
            size="small"
            fullWidth
            multiline
            maxRows={3}
            placeholder={
              hasApiKey
                ? "Describe your diagram..."
                : "Click here to configure a model..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            onFocus={() => {
              if (!hasApiKey && onRequestSetup) onRequestSetup();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!hasApiKey && onRequestSetup) {
                  onRequestSetup();
                } else {
                  handleSend();
                }
              }
            }}
            slotProps={{
              input: {
                sx: { fontFamily: "'Fira Code', monospace", fontSize: 12 },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isProcessing || !hasApiKey}
            sx={{
              color: "#f97316",
              "&.Mui-disabled": { color: "rgba(249,115,22,0.3)" },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isError = message.isError;
  const isClarification = message.isClarification;

  return (
    <Stack
      direction="row"
      spacing={0.5}
      justifyContent={isUser ? "flex-end" : "flex-start"}
      alignItems="flex-start"
    >
      {!isUser && (
        <Box sx={{ pt: 0.5 }}>
          {isError ? (
            <ErrorOutlineIcon sx={{ fontSize: 14, color: "#ef4444" }} />
          ) : isClarification ? (
            <HelpOutlineIcon sx={{ fontSize: 14, color: "#f97316" }} />
          ) : (
            <SmartToyIcon sx={{ fontSize: 14, color: "#00e5ff" }} />
          )}
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 0.75,
          maxWidth: "85%",
          bgcolor: isUser
            ? "rgba(249,115,22,0.1)"
            : isError
              ? "rgba(239,68,68,0.08)"
              : isClarification
                ? "rgba(249,115,22,0.06)"
                : "rgba(255,255,255,0.03)",
          borderRadius: 2,
          border: "1px solid",
          borderColor: isUser
            ? "rgba(249,115,22,0.2)"
            : isError
              ? "rgba(239,68,68,0.2)"
              : "rgba(255,255,255,0.06)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 11,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </Typography>
        {message.plantumlCode && (
          <Chip
            label="Diagram updated"
            size="small"
            sx={{
              mt: 0.5,
              height: 18,
              fontSize: 9,
              bgcolor: "rgba(0,229,255,0.1)",
              color: "#00e5ff",
              border: "1px solid rgba(0,229,255,0.2)",
            }}
          />
        )}
      </Paper>

      {isUser && (
        <Box sx={{ pt: 0.5 }}>
          <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
        </Box>
      )}
    </Stack>
  );
}
