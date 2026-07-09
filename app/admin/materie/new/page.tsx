"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NuovaMateriaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("materie").insert({
      nome,
      descrizione: descrizione || null,
    } as any);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/materie");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nuova materia</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Descrizione</label>
          <textarea
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Creazione..." : "Crea materia"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/materie")}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
