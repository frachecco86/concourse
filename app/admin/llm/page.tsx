"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

type TestStatus = "idle" | "testing" | "ok" | "error" | "no_key";

export default function LlmSettingsPage() {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testResult, setTestResult] = useState("");
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "llm")
        .single();

      if (data) {
        const d = data as any;
        setProvider(d.provider || "openai");
        setModel(d.model || "gpt-4o");
        setApiKeyConfigured(!!d.api_key);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/settings/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          api_key: apiKey || undefined,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Errore salvataggio");
        return;
      }

      setSuccess("Configurazione LLM salvata");
      if (apiKey) setApiKeyConfigured(true);
      setApiKey("");
    } catch (err: any) {
      setError(err.message || "Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTestStatus("testing");
    setTestResult("");

    try {
      const response = await fetch("/api/settings/llm/test", {
        method: "POST",
      });
      const data = await response.json();

      if (data.status === "no_key") {
        setTestStatus("no_key");
        setTestResult(data.message);
      } else if (data.success) {
        setTestStatus("ok");
        setTestResult(
          `✅ Connessione OK — Modello: ${data.model || "sconosciuto"}, Latenza: ${data.latency || "N/A"}`
        );
      } else {
        setTestStatus("error");
        setTestResult(`❌ ${data.error || "Errore sconosciuto"}`);
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestResult(`❌ Errore di connessione: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-zinc-400">Caricamento...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Intelligenza Artificiale — LLM
      </h1>

      <p className="mb-6 text-sm text-zinc-500 leading-relaxed">
        Configura il provider LLM per la pipeline di generazione automatica dei corsi.
        Le impostazioni vengono salvate nel database e usate dalla pipeline AI.
      </p>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Provider */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          >
            <option value="openai">OpenAI (gpt-4o, gpt-4o-mini, ...)</option>
            <option value="anthropic">Anthropic (claude-sonnet-4, ...)</option>
            <option value="generic">Endpoint OpenAI-compatible (generico)</option>
          </select>
        </div>

        {/* Modello */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Modello
          </label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="es. gpt-4o, claude-sonnet-4-20250523"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Lascia il nome del modello. Se vuoto, viene usato il default del provider.
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Chiave API
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                apiKeyConfigured
                  ? "Lascia vuoto per mantenere la chiave esistente"
                  : "sk-... (inserisci la chiave API)"
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 font-mono"
            />
            {apiKeyConfigured && (
              <span className="inline rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Configurata
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Inserisci solo se vuoi cambiare la chiave. Lascia vuoto per mantenere quella esistente.
          </p>
        </div>

        {/* Messaggi */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Pulsanti */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Salvataggio..." : "Salva configurazione"}
          </button>

          <button
            type="button"
            onClick={handleTest}
            disabled={testStatus === "testing"}
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            {testStatus === "testing" ? "Test in corso..." : "Testa connessione"}
          </button>
        </div>
      </form>

      {/* Risultato test */}
      {testStatus !== "idle" && (
        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold">Risultato test</h3>
          <p
            className={`text-sm ${
              testStatus === "ok"
                ? "text-emerald-700"
                : testStatus === "no_key"
                  ? "text-amber-700"
                  : "text-red-700"
            }`}
          >
            {testResult}
          </p>
          {testStatus === "ok" && (
            <p className="mt-2 text-xs text-zinc-400">
              La pipeline AI è pronta per generare contenuti dai PDF caricati.
            </p>
          )}
          {testStatus === "no_key" && (
            <p className="mt-2 text-xs text-zinc-400">
              Configura una chiave API per attivare la generazione automatica dei corsi.
            </p>
          )}
          {testStatus === "error" && (
            <p className="mt-2 text-xs text-zinc-400">
              Verifica la chiave API, il modello e il provider. Se il problema persiste,
              controlla che la chiave sia ancora valida.
            </p>
          )}
        </div>
      )}

      {/* Info provider */}
      <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold">Provider supportati</h3>
        <div className="space-y-3 text-sm text-zinc-600">
          <div>
            <strong className="text-zinc-900">OpenAI</strong> — Modelli: gpt-4o,
            gpt-4o-mini, gpt-4.1. Chiave: <code className="rounded bg-zinc-100 px-1 font-mono text-xs">
              sk-proj-...
            </code>
          </div>
          <div>
            <strong className="text-zinc-900">Anthropic</strong> — Modelli:
            claude-sonnet-4, claude-3-haiku. Chiave:{" "}
            <code className="rounded bg-zinc-100 px-1 font-mono text-xs">sk-ant-...</code>
          </div>
          <div>
            <strong className="text-zinc-900">Generico</strong> — Endpoint
            OpenAI-compatible. Imposta <code className="rounded bg-zinc-100 px-1 font-mono text-xs">
              LLM_BASE_URL
            </code> nelle env vars Vercel per endpoint personalizzati.
          </div>
        </div>
      </div>
    </div>
  );
}
