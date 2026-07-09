/**
 * Provider-agnostic LLM client.
 * Usa la variabile d'ambiente LLM_PROVIDER per scegliere il provider:
 *   - "anthropic" → Anthropic API (claude-sonnet-4)
 *   - "openai"    → OpenAI API (gpt-4o)
 *   - "generic"   → endpoint OpenAI-compatible generico
 *
 * Configura con:
 *   LLM_PROVIDER=anthropic
 *   LLM_API_KEY=sk-...
 *   LLM_MODEL=claude-sonnet-4-20250523  (opzionale, default per provider)
 */

export type LLMProvider = "anthropic" | "openai" | "generic";

interface LLMResponse {
  content: string;
  model: string;
}

function getConfig() {
  const provider = (process.env.LLM_PROVIDER || "openai") as LLMProvider;
  const apiKey = process.env.LLM_API_KEY || "";
  const model = process.env.LLM_MODEL || "";

  return { provider, apiKey, model };
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const { provider, apiKey, model } = getConfig();

  if (!apiKey) {
    // Se nessuna API key configurata, restituisce un placeholder
    console.warn("LLM: nessuna API key configurata (LLM_API_KEY), uso modalità placeholder");
    return {
      content: `[PLACEHOLDER] Contenuto generato per "${userPrompt.slice(0, 50)}..." — configura LLM_API_KEY per contenuti reali.`,
      model: "placeholder",
    };
  }

  switch (provider) {
    case "anthropic": {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-sonnet-4-20250523",
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature ?? 0.7,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!resp.ok) {
        throw new Error(`Anthropic API error: ${resp.status} ${await resp.text()}`);
      }

      const data = await resp.json();
      return {
        content: data.content[0].text,
        model: data.model,
      };
    }

    case "openai":
    case "generic": {
      const baseUrl = provider === "generic"
        ? process.env.LLM_BASE_URL || "https://api.openai.com/v1"
        : "https://api.openai.com/v1";

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o",
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature ?? 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!resp.ok) {
        throw new Error(`OpenAI API error: ${resp.status} ${await resp.text()}`);
      }

      const data = await resp.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
      };
    }

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
