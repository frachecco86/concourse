"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Materia {
  id: string;
  nome: string;
}

interface Concorso {
  id: string;
  titolo: string;
}

export default function NuovoCorsoPage() {
  const router = useRouter();
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [concorsoId, setConcorsoId] = useState("");
  const [materie, setMaterie] = useState<Materia[]>([]);
  const [concorsi, setConcorsi] = useState<Concorso[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [materieRes, concorsiRes] = await Promise.all([
        supabase.from("materie").select("id, nome").order("nome"),
        supabase.from("concorsi").select("id, titolo").order("titolo"),
      ]);
      setMaterie(materieRes.data ?? []);
      setConcorsi(concorsiRes.data ?? []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("corsi").insert({
      titolo,
      descrizione: descrizione || null,
      materia_id: materiaId,
      concorso_id: concorsoId || null,
      stato: "bozza",
    } as any);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/corsi");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nuovo corso</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Titolo</label>
          <input
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
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

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Materia</label>
          <select
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            required
          >
            <option value="">Seleziona materia</option>
            {materie.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Concorso (opzionale)
          </label>
          <select
            value={concorsoId}
            onChange={(e) => setConcorsoId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          >
            <option value="">Nessun concorso specifico</option>
            {concorsi.map((c) => (
              <option key={c.id} value={c.id}>{c.titolo}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Creazione..." : "Crea corso"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/corsi")}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
