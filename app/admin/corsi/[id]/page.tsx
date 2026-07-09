"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

interface Capitolo {
  id: string;
  titolo: string;
  ordine: number;
  slide_count: number;
}

export default function CorsoEditorPage() {
  const router = useRouter();
  const params = useParams();
  const corsoId = params.id as string;

  const [corso, setCorso] = useState<any>(null);
  const [capitoli, setCapitoli] = useState<Capitolo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitolo, setNewTitolo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: corsoData } = await supabase
        .from("corsi")
        .select("*")
        .eq("id", corsoId)
        .single();

      if (!corsoData) {
        setLoading(false);
        return;
      }
      setCorso(corsoData);

      const { data: capData } = await supabase
        .from("capitoli")
        .select("id, titolo, ordine")
        .eq("corso_id", corsoId)
        .order("ordine", { ascending: true });

      // Conta slide per capitolo
      const slideCounts: Record<string, number> = {};
      if (capData && capData.length > 0) {
        const capIds = capData.map((c: any) => c.id);
        const { data: slideData } = await supabase
          .from("slide")
          .select("capitolo_id")
          .in("capitolo_id", capIds);

        if (slideData) {
          for (const s of slideData) {
            slideCounts[s.capitolo_id] = (slideCounts[s.capitolo_id] || 0) + 1;
          }
        }
      }

      setCapitoli(
        (capData ?? []).map((c: any) => ({
          ...c,
          slide_count: slideCounts[c.id] || 0,
        }))
      );
      setLoading(false);
    }
    load();
  }, [corsoId]);

  async function addCapitolo() {
    if (!newTitolo.trim()) return;
    setError("");
    const maxOrdine = Math.max(...capitoli.map((c) => c.ordine), 0);
    const { error: err } = await supabase.from("capitoli").insert({
      corso_id: corsoId,
      titolo: newTitolo.trim(),
      ordine: maxOrdine + 1,
    } as any);
    if (err) {
      setError(err.message);
      return;
    }
    setNewTitolo("");
    // Ricarica
    window.location.reload();
  }

  async function deleteCapitolo(id: string) {
    const { error: err } = await supabase.from("capitoli").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    window.location.reload();
  }

  async function togglePublish() {
    if (!corso) return;
    const newStato = corso.stato === "pubblicato" ? "bozza" : "pubblicato";
    const { error: err } = await supabase
      .from("corsi")
      .update({ stato: newStato } as any)
      .eq("id", corsoId);
    if (err) {
      setError(err.message);
      return;
    }
    setCorso({ ...corso, stato: newStato });
  }

  if (loading) {
    return <div className="py-12 text-center text-zinc-400">Caricamento...</div>;
  }

  if (!corso) {
    return <div className="py-12 text-center text-zinc-400">Corso non trovato.</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{corso.titolo}</h1>
          <p className="text-sm text-zinc-500">
            Stato:{" "}
            <span
              className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                corso.stato === "pubblicato"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {corso.stato === "pubblicato" ? "Pubblicato" : "Bozza"}
            </span>
          </p>
        </div>
        <button
          onClick={togglePublish}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {corso.stato === "pubblicato" ? "Metti in bozza" : "Pubblica"}
        </button>
      </div>

      {/* Aggiungi capitolo */}
      <div className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCapitolo();
          }}
          className="flex gap-3"
        >
          <input
            value={newTitolo}
            onChange={(e) => setNewTitolo(e.target.value)}
            placeholder="Nuovo capitolo..."
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Aggiungi
          </button>
        </form>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Lista capitoli */}
      <div className="space-y-3">
        {capitoli.length === 0 ? (
          <p className="text-zinc-400">Nessun capitolo. Aggiungine uno!</p>
        ) : (
          capitoli.map((cap) => (
            <div
              key={cap.id}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-400 text-xs font-mono">#{cap.ordine}</span>
                <span className="font-medium">{cap.titolo}</span>
                <span className="text-xs text-zinc-400">({cap.slide_count} slide)</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/corsi/${corsoId}/capitoli/${cap.id}`}
                  className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Slide
                </a>
                <button
                  onClick={() => deleteCapitolo(cap.id)}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
