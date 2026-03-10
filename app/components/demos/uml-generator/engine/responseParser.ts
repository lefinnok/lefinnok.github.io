import type { LLMResponse } from "./types";

function cleanPlantUmlCode(code: string): string {
  const lines = code.split("\n");
  const cleaned: string[] = [];

  for (const line of lines) {
    if (line.trim().toLowerCase() === "plantuml") continue;
    cleaned.push(line);
  }

  if (!cleaned.some((l) => l.trim() === "@startuml")) {
    cleaned.unshift("@startuml");
  }

  const lastNonEmpty = [...cleaned]
    .reverse()
    .find((l) => l.trim().length > 0);
  if (lastNonEmpty?.trim() !== "@enduml") {
    cleaned.push("@enduml");
  }

  return cleaned.join("\n");
}

export function parseLLMResponse(rawResponse: string): LLMResponse {
  if (rawResponse.includes("NEED_CLARIFICATION")) {
    const questions =
      rawResponse.split("NEED_CLARIFICATION:")[1]?.trim() ??
      "Please provide more details.";
    return {
      status: "need_clarification",
      clarificationQuestions: questions,
      rawResponse,
    };
  }

  // Try extracting code from triple backticks
  const codeBlockPattern = /```(?:plantuml)?\s*([\s\S]*?)```/;
  const codeMatch = rawResponse.match(codeBlockPattern);
  if (codeMatch) {
    return {
      status: "success",
      plantumlCode: cleanPlantUmlCode(codeMatch[1].trim()),
      rawResponse,
    };
  }

  // Fallback: try to find @startuml...@enduml block
  const startumlMatch = rawResponse.match(/@startuml[\s\S]*?@enduml/);
  if (startumlMatch) {
    return {
      status: "success",
      plantumlCode: cleanPlantUmlCode(startumlMatch[0]),
      rawResponse,
    };
  }

  return {
    status: "error",
    errorMessage: "Could not extract PlantUML diagram from the response.",
    rawResponse,
  };
}
