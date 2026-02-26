import { useEffect, useRef, useState } from "react";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";

const ACCENT = "#f97316";
const TYPE_SPEED = 90; // ms per character
const PAUSE_END = 1200; // pause when fully typed
const PAUSE_CLEAR = 400; // pause after clearing before restarting

interface MatrixLoaderProps {
  message?: string;
  height?: number | string;
  width?: number | string;
  sx?: SxProps<Theme>;
  density?: "sparse" | "normal";
}

export function MatrixLoader({
  message = "Loading...",
  height = 200,
  width = "100%",
  sx: sxProp,
}: MatrixLoaderProps) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const posRef = useRef(0);
  const phaseRef = useRef<"typing" | "paused" | "clearing">("typing");

  useEffect(() => {
    function step() {
      const phase = phaseRef.current;

      if (phase === "typing") {
        posRef.current++;
        if (posRef.current > message.length) {
          phaseRef.current = "paused";
          timerRef.current = setTimeout(step, PAUSE_END);
          return;
        }
        setDisplayed(message.slice(0, posRef.current));
        timerRef.current = setTimeout(step, TYPE_SPEED);
      } else if (phase === "paused") {
        phaseRef.current = "clearing";
        setDisplayed("");
        timerRef.current = setTimeout(step, PAUSE_CLEAR);
      } else {
        posRef.current = 0;
        phaseRef.current = "typing";
        timerRef.current = setTimeout(step, TYPE_SPEED);
      }
    }

    posRef.current = 0;
    phaseRef.current = "typing";
    setDisplayed("");
    timerRef.current = setTimeout(step, TYPE_SPEED);

    return () => clearTimeout(timerRef.current);
  }, [message]);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      role="status"
      aria-label={message}
      sx={[
        {
          position: "relative",
          overflow: "hidden",
          bgcolor: "#0a0a0a",
          borderRadius: 2,
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        ...(Array.isArray(sxProp) ? sxProp : sxProp ? [sxProp] : []),
      ]}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 13,
          letterSpacing: "0.04em",
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        {displayed}
        <Box
          component="span"
          sx={{
            color: ACCENT,
            opacity: showCursor ? 0.8 : 0,
            transition: "opacity 0.08s",
          }}
        >
          _
        </Box>
      </Typography>
    </Box>
  );
}
