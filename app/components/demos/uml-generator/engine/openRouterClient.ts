export async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string | null,
  apiEndpoint: string | null,
): Promise<string> {
  if (!apiKey) {
    throw new Error("An API key is required. The shared free-model proxy is retired.");
  }

  const url = `${apiEndpoint || "https://openrouter.ai/api/v1"}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": window.location.origin,
    "X-Title": "UML Diagram Generator Demo",
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message ?? JSON.stringify(data.error));
  }
  return data.choices[0].message.content;
}
