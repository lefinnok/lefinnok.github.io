import { useRef, useCallback, type CSSProperties } from "react";
import { Box } from "@mui/material";
import { tokenizeSource } from "../engine/highlighter";

// ── Shared font constants (must match exactly between textarea & overlay) ──

const FONT_FAMILY = "'Fira Code', monospace";
const FONT_SIZE = 11;
const LINE_HEIGHT = 1.6;
const PADDING = 10;
const GUTTER_WIDTH = 36;
const MIN_ROWS = 8;
const MAX_HEIGHT = 12 * FONT_SIZE * LINE_HEIGHT + PADDING * 2;

const ERROR_BG = "rgba(239,68,68,0.08)";
const ERROR_DOT = "#ef4444";

// ── Component ───────────────────────────────────────────────────

interface AssemblyEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors: { line: number; message: string }[];
}

export function AssemblyEditor({ value, onChange, errors }: AssemblyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const errorMap = new Map<number, string>();
  for (const e of errors) errorMap.set(e.line, e.message);

  const lines = value.split("\n");
  const tokenized = tokenizeSource(value);

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = ta.scrollTop;
      overlayRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  }, []);

  // Shared text style for perfect alignment
  const textStyle: CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    padding: PADDING,
    margin: 0,
    border: "none",
    whiteSpace: "pre",
    wordWrap: "normal",
    overflowWrap: "normal",
    letterSpacing: "normal",
    tabSize: 2,
  };

  const minHeight = MIN_ROWS * FONT_SIZE * LINE_HEIGHT + PADDING * 2;

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#141414",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 1,
        overflow: "hidden",
        maxHeight: MAX_HEIGHT,
        minHeight,
      }}
    >
      {/* ── Gutter (line numbers + error dots) ── */}
      <Box
        ref={gutterRef}
        sx={{
          width: GUTTER_WIDTH,
          flexShrink: 0,
          overflow: "hidden",
          userSelect: "none",
          bgcolor: "#0f0f0f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          pt: `${PADDING}px`,
          pb: `${PADDING}px`,
        }}
      >
        {lines.map((_, i) => {
          const lineNum = i + 1;
          const err = errorMap.get(lineNum);
          return (
            <Box
              key={i}
              title={err ?? undefined}
              sx={{
                height: FONT_SIZE * LINE_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                pr: "6px",
                fontFamily: FONT_FAMILY,
                fontSize: 10,
                color: err ? ERROR_DOT : "rgba(255,255,255,0.2)",
                cursor: err ? "help" : "default",
              }}
            >
              {err && (
                <Box
                  component="span"
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    bgcolor: ERROR_DOT,
                    mr: 0.5,
                    flexShrink: 0,
                  }}
                />
              )}
              {lineNum}
            </Box>
          );
        })}
      </Box>

      {/* ── Editor area (textarea + overlay) ── */}
      <Box sx={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {/* Syntax-highlighted overlay */}
        <pre
          ref={overlayRef}
          aria-hidden
          style={{
            ...textStyle,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            overflow: "hidden",
            color: "transparent",
            background: "transparent",
          }}
        >
          {tokenized.map((lineTokens, i) => {
            const lineNum = i + 1;
            const hasError = errorMap.has(lineNum);
            return (
              <div
                key={i}
                style={{
                  height: FONT_SIZE * LINE_HEIGHT,
                  backgroundColor: hasError ? ERROR_BG : "transparent",
                }}
              >
                {lineTokens.length > 0
                  ? lineTokens.map((tok, j) => (
                      <span key={j} style={{ color: tok.color }}>
                        {tok.text}
                      </span>
                    ))
                  : "\n"}
              </div>
            );
          })}
        </pre>

        {/* Actual textarea (invisible text, visible caret) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{
            ...textStyle,
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight,
            maxHeight: MAX_HEIGHT,
            resize: "none",
            outline: "none",
            background: "transparent",
            color: "transparent",
            caretColor: "rgba(255,255,255,0.8)",
            overflow: "auto",
            boxSizing: "border-box",
          }}
        />
      </Box>
    </Box>
  );
}
