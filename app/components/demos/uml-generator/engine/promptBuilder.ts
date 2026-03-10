import type { DiagramType } from "./types";

export function buildSystemPrompt(): string {
  return `You are an expert UML and technical diagram generator. Given a natural language request, generate or modify a PlantUML diagram.

Rules:
1. Always start with @startuml and end with @enduml
2. Use proper PlantUML syntax for the requested diagram type
3. When modifying an existing diagram, preserve existing elements unless explicitly asked to remove them
4. Use camelCase for element IDs when not explicitly specified
5. Do NOT include "plantuml" on any line by itself
6. Always specify the diagram type declaration after @startuml when appropriate

Response format:
- If you can generate the diagram, respond with:
  CODE: \`\`\`plantuml
  <your PlantUML code here>
  \`\`\`
- If you need more information, respond with:
  NEED_CLARIFICATION: <your specific questions>
- Never include explanations outside of these two formats`;
}

export function buildUserPrompt(
  command: string,
  currentCode: string | null,
  diagramType: DiagramType,
  conversationContext: string[],
): string {
  const stateSection = currentCode
    ? `Current diagram:\n${currentCode}`
    : "No existing diagram. Create a new one.";

  const contextSection =
    conversationContext.length > 0
      ? `\nPrevious conversation:\n${conversationContext.slice(-6).join("\n")}`
      : "";

  return `Diagram type: ${diagramType}

${stateSection}
${contextSection}

User request: "${command}"`;
}
