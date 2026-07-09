import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/settings/llm/test
 * Verifica la connessione al provider LLM configurato.
 * Invia un messaggio di test e verifica la risposta.
 */
export async function POST() {
  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const { data: settings, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "llm")
    .single();

  if (error || !settings) {
    return NextResponse.json(
      { error: "Impostazioni LLM non trovate" },
      { status: 404 }
    );
  }

  if (!settings.api_key) {
    return NextResponse.json(
      { status: "no_key", message: "Nessuna API key configurata" },
      { status: 200 }
    );
  }

  try {
    let testResult: { success: boolean; model?: string; latency?: string; error?: string };

    switch (settings.provider) {
      case "anthropic": {
        const start = Date.now();
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": settings.api_key,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: settings.model || "claude-sonnet-4-20250523",
            max_tokens: 100,
            messages: [
              { role: "user", content: "Rispondi solo con OK" },
            ],
          }),
        });
        const latency = Date.now() - start;

        if (!resp.ok) {
          testResult = {
            success: false,
            error: `Errore API Anthropic: ${resp.status} ${await resp.text()}`,
            latency: `${latency}ms`,
          };
        } else {
          const data = await resp.json();
          testResult = {
            success: true,
            model: data.model,
            latency: `${latency}ms`,
          };
        }
        break;
      }

      case "openai":
      case "generic": {
        const baseUrl =
          settings.provider === "generic"
            ? process.env.LLM_BASE_URL || "https://api.openai.com/v1"
            : "https://api.openai.com/v1";

        const start = Date.now();
        const resp = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.api_key}`,
          },
          body: JSON.stringify({
            model: settings.model || "gpt-4o",
            max_tokens: 100,
            messages: [
              { role: "system", content: "Rispondi solo con OK" },
              { role: "user", content: "Dimmi OK" },
            ],
          }),
        });
        const latency = Date.now() - start;

        if (!resp.ok) {
          testResult = {
            success: false,
            error: `Errore API OpenAI: ${resp.status} ${await resp.text()}`,
            latency: `${latency}ms`,
          };
        } else {
          const data = await resp.json();
          testResult = {
            success: true,
            model: data.model || data.choices?.[0]?.message?.content,
            latency: `${latency}ms`,
          };
        }
        break;
      }

      default:
        testResult = {
          success: false,
          error: `Provider non supportato: ${settings.provider}`,
        };
    }

    return NextResponse.json({
      status: testResult.success ? "ok" : "error",
      ...testResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        success: false,
        error: error.message ?? "Errore di connessione",
      },
      { status: 200 }
    );
  }
}
