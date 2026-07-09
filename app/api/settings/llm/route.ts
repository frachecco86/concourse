import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/settings/llm
 * Restituisce la configurazione LLM corrente (senza API key in chiaro)
 */
export async function GET() {
  // Usa la service key per bypassare RLS (solo admin via proxy)
  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const { data, error } = await supabase
    .from("settings")
    .select("provider, api_key, model")
    .eq("id", "llm")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Impostazioni LLM non trovate" },
      { status: 404 }
    );
  }

  // Maschera la chiave API per sicurezza
  const apiKeyMasked = data.api_key
    ? data.api_key.slice(0, 8) + "..." + data.api_key.slice(-4)
    : "";

  return NextResponse.json({
    provider: data.provider,
    api_key: apiKeyMasked,
    api_key_configured: !!data.api_key,
    model: data.model,
  });
}

/**
 * POST /api/settings/llm
 * Aggiorna la configurazione LLM
 * Body: { provider?: string, api_key?: string, model?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, api_key, model } = body;

    // Usa service key per bypassare RLS — la protezione è gestita dal proxy
    const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });

    // Verifica che l'utente sia admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { data: profilo } = await supabase
      .from("utenti_profili")
      .select("ruolo")
      .eq("id", user.id)
      .single();

    if (profilo?.ruolo !== "admin") {
      return NextResponse.json({ error: "Solo admin" }, { status: 403 });
    }

    // Costruisce update con solo i campi forniti
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (provider) update.provider = provider;
    if (api_key !== undefined) update.api_key = api_key;
    if (model) update.model = model;

    const { error: updateError } = await supabase
      .from("settings")
      .update(update as any)
      .eq("id", "llm");

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Errore interno" },
      { status: 500 }
    );
  }
}
