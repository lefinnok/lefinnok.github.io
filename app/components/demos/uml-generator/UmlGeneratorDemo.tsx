import { useReducer, useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SettingsIcon from "@mui/icons-material/Settings";
import type { Diagram, ChatMessage } from "./engine/types";
import { plantumlEncode } from "./engine/plantumlEncoding";
import { callOpenRouter } from "./engine/openRouterClient";
import { buildSystemPrompt, buildUserPrompt } from "./engine/promptBuilder";
import { parseLLMResponse } from "./engine/responseParser";
import { SAMPLE_DIAGRAMS } from "./engine/sampleDiagrams";
import { ChatPanel } from "./views/ChatPanel";
import { DiagramPanel } from "./views/DiagramPanel";
import { CodeEditorPanel } from "./views/CodeEditorPanel";
import { DiagramTabs } from "./views/DiagramTabs";
import { SetupDialog, type SetupResult } from "./views/SetupDialog";
import { PipelineExplanation } from "./explanation/PipelineExplanation";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createEmptyDiagram(title = "Untitled"): Diagram {
  return {
    id: generateId(),
    title,
    messages: [],
    plantumlCode: "",
    encodedDiagram: null,
    diagramType: "class",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ── State ──────────────────────────────────────────────────────

interface DemoState {
  diagrams: Diagram[];
  activeDiagramId: string;
  showCodeEditor: boolean;
  isProcessing: boolean;
}

type DemoAction =
  | { type: "SET_PROCESSING"; value: boolean }
  | { type: "TOGGLE_CODE_VIEW" }
  | { type: "SELECT_DIAGRAM"; id: string }
  | { type: "CREATE_DIAGRAM" }
  | { type: "DELETE_DIAGRAM"; id: string }
  | { type: "RENAME_DIAGRAM"; id: string; title: string }
  | { type: "ADD_MESSAGE"; diagramId: string; message: ChatMessage }
  | {
      type: "UPDATE_DIAGRAM_CODE";
      diagramId: string;
      plantumlCode: string;
      encoded: string | null;
    }
  | { type: "LOAD_SAMPLE"; plantumlCode: string; title: string };

function createInitialState(): DemoState {
  const initial = createEmptyDiagram("Diagram 1");
  return {
    diagrams: [initial],
    activeDiagramId: initial.id,
    showCodeEditor: false,
    isProcessing: false,
  };
}

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.value };

    case "TOGGLE_CODE_VIEW":
      return { ...state, showCodeEditor: !state.showCodeEditor };

    case "SELECT_DIAGRAM":
      return { ...state, activeDiagramId: action.id };

    case "CREATE_DIAGRAM": {
      const d = createEmptyDiagram(`Diagram ${state.diagrams.length + 1}`);
      return {
        ...state,
        diagrams: [...state.diagrams, d],
        activeDiagramId: d.id,
      };
    }

    case "DELETE_DIAGRAM": {
      const remaining = state.diagrams.filter((d) => d.id !== action.id);
      if (remaining.length === 0) return state;
      const newActiveId =
        state.activeDiagramId === action.id
          ? remaining[0].id
          : state.activeDiagramId;
      return { ...state, diagrams: remaining, activeDiagramId: newActiveId };
    }

    case "RENAME_DIAGRAM":
      return {
        ...state,
        diagrams: state.diagrams.map((d) =>
          d.id === action.id ? { ...d, title: action.title } : d,
        ),
      };

    case "ADD_MESSAGE":
      return {
        ...state,
        diagrams: state.diagrams.map((d) =>
          d.id === action.diagramId
            ? { ...d, messages: [...d.messages, action.message], updatedAt: Date.now() }
            : d,
        ),
      };

    case "UPDATE_DIAGRAM_CODE":
      return {
        ...state,
        diagrams: state.diagrams.map((d) =>
          d.id === action.diagramId
            ? {
                ...d,
                plantumlCode: action.plantumlCode,
                encodedDiagram: action.encoded,
                updatedAt: Date.now(),
              }
            : d,
        ),
      };

    case "LOAD_SAMPLE": {
      const encoded = plantumlEncode(action.plantumlCode);
      const sample = createEmptyDiagram(action.title);
      sample.plantumlCode = action.plantumlCode;
      sample.encodedDiagram = encoded;
      sample.messages = [
        {
          id: generateId(),
          role: "system",
          content: `Loaded sample: ${action.title}`,
          timestamp: Date.now(),
          plantumlCode: action.plantumlCode,
        },
      ];
      return {
        ...state,
        diagrams: [...state.diagrams, sample],
        activeDiagramId: sample.id,
      };
    }

    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────

export default function UmlGeneratorDemo() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [config, setConfig] = useState<SetupResult | null>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const activeDiagram = state.diagrams.find(
    (d) => d.id === state.activeDiagramId,
  )!;

  // Fullscreen: lock body scroll
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isFullscreen]);

  const handleSetupComplete = useCallback((result: SetupResult) => {
    setConfig(result);
    setShowSetup(false);
  }, []);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (state.isProcessing || !config) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_MESSAGE", diagramId: activeDiagram.id, message: userMsg });
      dispatch({ type: "SET_PROCESSING", value: true });

      try {
        const conversationContext = activeDiagram.messages
          .filter((m) => m.role !== "system")
          .map((m) => `${m.role}: ${m.content}`);

        const systemPrompt = buildSystemPrompt();
        const userPrompt = buildUserPrompt(
          message,
          activeDiagram.plantumlCode || null,
          activeDiagram.diagramType,
          conversationContext,
        );

        const rawResponse = await callOpenRouter(
          config.model,
          systemPrompt,
          userPrompt,
          config.apiKey,
          config.apiEndpoint,
        );

        const parsed = parseLLMResponse(rawResponse);

        if (parsed.status === "success" && parsed.plantumlCode) {
          const encoded = plantumlEncode(parsed.plantumlCode);
          dispatch({
            type: "UPDATE_DIAGRAM_CODE",
            diagramId: activeDiagram.id,
            plantumlCode: parsed.plantumlCode,
            encoded,
          });
          dispatch({
            type: "ADD_MESSAGE",
            diagramId: activeDiagram.id,
            message: {
              id: generateId(),
              role: "assistant",
              content: "Diagram updated successfully.",
              timestamp: Date.now(),
              plantumlCode: parsed.plantumlCode,
            },
          });
        } else if (parsed.status === "need_clarification") {
          dispatch({
            type: "ADD_MESSAGE",
            diagramId: activeDiagram.id,
            message: {
              id: generateId(),
              role: "assistant",
              content: parsed.clarificationQuestions ?? "Could you provide more details?",
              timestamp: Date.now(),
              isClarification: true,
            },
          });
        } else {
          dispatch({
            type: "ADD_MESSAGE",
            diagramId: activeDiagram.id,
            message: {
              id: generateId(),
              role: "assistant",
              content: parsed.errorMessage ?? "Failed to generate diagram.",
              timestamp: Date.now(),
              isError: true,
            },
          });
        }
      } catch (err) {
        dispatch({
          type: "ADD_MESSAGE",
          diagramId: activeDiagram.id,
          message: {
            id: generateId(),
            role: "assistant",
            content: `Error: ${err instanceof Error ? err.message : "Unknown error occurred."}`,
            timestamp: Date.now(),
            isError: true,
          },
        });
      } finally {
        dispatch({ type: "SET_PROCESSING", value: false });
      }
    },
    [state.isProcessing, config, activeDiagram],
  );

  const handleCodeChange = useCallback(
    (code: string) => {
      try {
        const encoded = plantumlEncode(code);
        dispatch({
          type: "UPDATE_DIAGRAM_CODE",
          diagramId: activeDiagram.id,
          plantumlCode: code,
          encoded,
        });
      } catch {
        dispatch({
          type: "UPDATE_DIAGRAM_CODE",
          diagramId: activeDiagram.id,
          plantumlCode: code,
          encoded: activeDiagram.encodedDiagram,
        });
      }
    },
    [activeDiagram.id, activeDiagram.encodedDiagram],
  );

  const handleLoadSample = useCallback(
    (sampleId: string) => {
      const sample = SAMPLE_DIAGRAMS.find((s) => s.id === sampleId);
      if (sample) {
        dispatch({ type: "LOAD_SAMPLE", plantumlCode: sample.plantumlCode, title: sample.title });
      }
    },
    [],
  );

  return (
    <>
      <SetupDialog open={showSetup} onComplete={handleSetupComplete} />

      <Paper
        ref={demoRef}
        elevation={0}
        sx={{
          p: isFullscreen ? 2 : 3,
          border: isFullscreen ? "none" : "1px solid",
          borderColor: "divider",
          borderRadius: isFullscreen ? 0 : 3,
          bgcolor: "#0a0a0a",
          ...(!isFullscreen && {
            maxHeight: 1820,
            display: "flex",
            flexDirection: "column",
          }),
          ...(isFullscreen && {
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }),
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1, flexShrink: 0 }}
        >
          <Box>
            <Typography variant={isFullscreen ? "h6" : "h5"}>
              UML Diagram Generator
            </Typography>
            {!isFullscreen && (
              <Typography variant="caption" color="text.secondary">
                Generate UML diagrams from natural language using AI
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {config && (
              <Chip
                label={config.model.split("/").pop()?.replace(":free", "")}
                size="small"
                onClick={() => setShowSetup(true)}
                icon={<SettingsIcon sx={{ fontSize: "14px !important" }} />}
                sx={{
                  height: 24,
                  fontSize: 10,
                  fontFamily: "'Fira Code', monospace",
                  bgcolor: "rgba(255,255,255,0.03)",
                  border: "1px solid",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={<InfoOutlinedIcon />}
              onClick={() => setShowExplanation(true)}
              sx={{
                color: "#00e5ff",
                borderColor: "#00e5ff",
                "&:hover": {
                  borderColor: "#00e5ff",
                  bgcolor: "rgba(0,229,255,0.06)",
                },
                flexShrink: 0,
              }}
            >
              How It Works
            </Button>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen((prev) => !prev)}
              sx={{ color: "text.secondary" }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Sample diagrams (when empty state) */}
        {activeDiagram.messages.length === 0 && (
          <Box sx={{ mb: 1, flexShrink: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                Load a sample diagram:
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {SAMPLE_DIAGRAMS.map((s) => (
                <Chip
                  key={s.id}
                  label={s.title}
                  size="small"
                  onClick={() => handleLoadSample(s.id)}
                  sx={{
                    height: 22,
                    fontSize: 10,
                    fontFamily: "'Fira Code', monospace",
                    bgcolor: "rgba(255,255,255,0.03)",
                    border: "1px solid",
                    borderColor: "rgba(255,255,255,0.08)",
                    "&:hover": { bgcolor: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.3)" },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Diagram tabs */}
        {state.diagrams.length > 1 && (
          <Box sx={{ flexShrink: 0 }}>
            <DiagramTabs
              diagrams={state.diagrams}
              activeId={state.activeDiagramId}
              onSelect={(id) => dispatch({ type: "SELECT_DIAGRAM", id })}
              onCreate={() => dispatch({ type: "CREATE_DIAGRAM" })}
              onDelete={(id) => dispatch({ type: "DELETE_DIAGRAM", id })}
              onRename={(id, title) => dispatch({ type: "RENAME_DIAGRAM", id, title })}
            />
            <Divider sx={{ mb: 1, opacity: 0.3 }} />
          </Box>
        )}

        {/* Main content: Chat + Diagram */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flex: 1,
            minHeight: 0,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Chat panel */}
          <Box
            sx={{
              flex: { xs: undefined, md: 2 },
              minWidth: 0,
              minHeight: { xs: 200, md: 0 },
              height: { xs: 280, md: "auto" },
              display: "flex",
              flexDirection: "column",
              borderRight: { xs: "none", md: "1px solid" },
              borderBottom: { xs: "1px solid", md: "none" },
              borderColor: "divider",
              pr: { xs: 0, md: 1.5 },
              pb: { xs: 1, md: 0 },
            }}
          >
            <ChatPanel
              messages={activeDiagram.messages}
              isProcessing={state.isProcessing}
              hasApiKey={!!config}
              onSendMessage={handleSendMessage}
              onRequestSetup={() => setShowSetup(true)}
            />
          </Box>

          {/* Diagram / Code panel */}
          <Box
            sx={{
              flex: { xs: undefined, md: 3 },
              minWidth: 0,
              minHeight: { xs: 250, md: 0 },
              height: { xs: 350, md: "auto" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            {state.showCodeEditor ? (
              <CodeEditorPanel
                plantumlCode={activeDiagram.plantumlCode}
                onCodeChange={handleCodeChange}
                onToggleDiagramView={() => dispatch({ type: "TOGGLE_CODE_VIEW" })}
              />
            ) : (
              <DiagramPanel
                encodedDiagram={activeDiagram.encodedDiagram}
                onToggleCodeView={() => dispatch({ type: "TOGGLE_CODE_VIEW" })}
                showingCode={state.showCodeEditor}
              />
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "right",
            mt: 1,
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            flexShrink: 0,
          }}
        >
          Rendered by PlantUML
        </Typography>

        {/* Explanation modal */}
        <PipelineExplanation
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      </Paper>
    </>
  );
}
