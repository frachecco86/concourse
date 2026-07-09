"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Inserisci la tua email");
      return;
    }
    setLoading(true);
    setError("");

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (magicError) {
      setError(magicError.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-2 text-center">
          <div className="mb-1 text-lg font-bold tracking-tight">ConCourse</div>
        </div>
        <h1 className="mb-6 text-xl font-semibold tracking-tight">Accedi</h1>

        {magicLinkSent ? (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-medium">Email inviata!</p>
            <p className="mt-1">Controlla la tua posta per il link di accesso. Se non lo trovi, controlla la cartella spam.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-0"
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
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-0"
                autoComplete="current-password"
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
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>

            <div className="relative my-4" role="separator" aria-label="oppure">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs text-zinc-400">
                <span className="bg-white px-2">oppure</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              Invia magic link
            </button>

            <p className="text-center text-xs text-zinc-500">
              Non hai un account?{" "}
              <a href="/register" className="font-medium text-zinc-900 underline hover:text-zinc-700 transition-colors">
                Registrati
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
