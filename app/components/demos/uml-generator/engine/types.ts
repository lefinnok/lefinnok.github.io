export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  plantumlCode?: string;
  isError?: boolean;
  isClarification?: boolean;
}

export interface Diagram {
  id: string;
  title: string;
  messages: ChatMessage[];
  plantumlCode: string;
  encodedDiagram: string | null;
  diagramType: DiagramType;
  createdAt: number;
  updatedAt: number;
}

export type DiagramType =
  | "class"
  | "sequence"
  | "activity"
  | "usecase"
  | "component"
  | "state"
  | "object";

export interface LLMResponse {
  status: "success" | "need_clarification" | "error";
  plantumlCode?: string;
  clarificationQuestions?: string;
  errorMessage?: string;
  rawResponse: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
}

export const FREE_MODELS: OpenRouterModel[] = [
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B" },
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B" },
  { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small 3.1" },
  { id: "qwen/qwen3-235b-a22b-thinking-2507", name: "Qwen3 235B" },
];

export const DEFAULT_MODEL = FREE_MODELS[0].id;
