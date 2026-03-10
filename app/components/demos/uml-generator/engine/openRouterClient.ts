const PROXY_URL =
  "https://bmpxvfzmimirmtakiuas.supabase.co/functions/v1/openrouter-proxy";

export async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userMessage: string,
  apiKey: string | null,
  apiEndpoint: string | null,
): Promise<string> {
  const useProxy = apiEndpoint === "supabase-proxy" || (!apiKey && !apiEndpoint);

  const url = useProxy
    ? PROXY_URL
    : `${apiEndpoint || "https://openrouter.ai/api/v1"}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!useProxy && apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "UML Diagram Generator Demo";
  }

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
