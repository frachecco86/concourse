"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, cognome },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Crea profilo utente nella tabella utenti_profili
    if (data.user) {
      const { error: profileError } = await supabase.from("utenti_profili").insert({
        id: data.user.id,
        nome,
        cognome,
        ruolo: "utente",
      } as any);

      if (profileError) {
        console.error("Errore creazione profilo:", profileError);
      }
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="w-full max-w-sm rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-3xl" aria-hidden="true">📧</div>
          <h1 className="mb-2 text-xl font-semibold">Registrazione completata</h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Controlla la tua email per confermare la registrazione. Se non trovi l'email, controlla la cartella spam.
          </p>
          <a href="/login" className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
            Torna al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-2 text-center">
          <div className="mb-1 text-lg font-bold tracking-tight">ConCourse</div>
        </div>
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Registrati</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Nome
              </label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900"
                placeholder="Mario"
                autoComplete="given-name"
                required
              />
            </div>
            <div>
              <label htmlFor="cognome" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Cognome
              </label>
              <input
                id="cognome"
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900"
                placeholder="Rossi"
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900"
              placeholder="nome@email.it"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900"
              minLength={6}
              placeholder="Almeno 6 caratteri"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Registrazione in corso..." : "Registrati"}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Hai già un account?{" "}
            <a href="/login" className="font-medium text-zinc-900 underline hover:text-zinc-700 transition-colors">
              Accedi
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
