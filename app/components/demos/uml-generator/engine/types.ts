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

