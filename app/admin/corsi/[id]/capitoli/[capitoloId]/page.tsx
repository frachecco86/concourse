"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

interface Slide {
  id: string;
  ordine: number;
  tipo: "slide" | "riassunto";
  contenuto: string;
}

export default function CapitoloSlidePage() {
  const router = useRouter();
  const params = useParams();
  const corsoId = params.id as string;
  const capitoloId = params.capitoloId as string;

  const [capitolo, setCapitolo] = useState<any>(null);
  const [slide, setSlide] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContenuto, setNewContenuto] = useState("");
  const [newTipo, setNewTipo] = useState<"slide" | "riassunto">("slide");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: capData } = await supabase
        .from("capitoli")
        .select("*")
        .eq("id", capitoloId)
        .single();

      setCapitolo(capData);

      const { data: slideData } = await supabase
        .from("slide")
        .select("id, ordine, tipo, contenuto")
        .eq("capitolo_id", capitoloId)
        .order("ordine", { ascending: true });

      setSlide(slideData ?? []);
      setLoading(false);
    }
    load();
  }, [capitoloId]);

  async function addSlide() {
    if (!newContenuto.trim()) return;
    setError("");
    const maxOrdine = Math.max(...slide.map((s) => s.ordine), 0);
    const { error: err } = await supabase.from("slide").insert({
      capitolo_id: capitoloId,
      ordine: maxOrdine + 1,
      contenuto: newContenuto.trim(),
      tipo: newTipo,
    } as any);
    if (err) {
      setError(err.message);
      return;
    }
    setNewContenuto("");
    window.location.reload();
  }

  async function deleteSlide(id: string) {
    await supabase.from("slide").delete().eq("id", id);
    window.location.reload();
  }

  async function moveUp(s: Slide, index: number) {
    if (index === 0) return;
    const prev = slide[index - 1];
    await supabase.from("slide").update({ ordine: s.ordine } as any).eq("id", prev.id);
    await supabase.from("slide").update({ ordine: prev.ordine } as any).eq("id", s.id);
    window.location.reload();
  }

  async function moveDown(s: Slide, index: number) {
    if (index === slide.length - 1) return;
    const next = slide[index + 1];
    await supabase.from("slide").update({ ordine: s.ordine } as any).eq("id", next.id);
    await supabase.from("slide").update({ ordine: next.ordine } as any).eq("id", s.id);
    window.location.reload();
  }

  if (loading) {
    return <div className="py-12 text-center text-zinc-400">Caricamento...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <a
          href={`/admin/corsi/${corsoId}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 underline"
        >
          ← Torna al corso
        </a>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {capitolo?.titolo ?? "Capitolo"}
        </h1>
      </div>

      {/* Aggiungi slide */}
      <div className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addSlide();
          }}
          className="space-y-3"
        >
          <div className="flex gap-3">
            <select
              value={newTipo}
              onChange={(e) => setNewTipo(e.target.value as "slide" | "riassunto")}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="slide">Slide</option>
              <option value="riassunto">Riassunto</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Aggiungi slide
            </button>
          </div>
          <textarea
            value={newContenuto}
            onChange={(e) => setNewContenuto(e.target.value)}
            placeholder="Contenuto della slide in markdown..."
            rows={6}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 font-mono"
          />
        </form>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Lista slide */}
      <div className="space-y-3">
        {slide.length === 0 ? (
          <p className="text-zinc-400">Nessuna slide. Aggiungine una!</p>
        ) : (
          slide.map((s, i) => (
            <div
              key={s.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">#{s.ordine}</span>
                  <span
                    className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.tipo === "slide"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {s.tipo === "slide" ? "Slide" : "Riassunto"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(s, i)}
                    disabled={i === 0}
                    className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(s, i)}
                    disabled={i === slide.length - 1}
                    className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <a
                    href={`/admin/corsi/${corsoId}/capitoli/${capitoloId}/slide/${s.id}/edit`}
                    className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                  >
                    Modifica
                  </a>
                  <button
                    onClick={() => deleteSlide(s.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Elimina
                  </button>
                </div>
              </div>
              <div className="max-h-40 overflow-hidden text-xs text-zinc-600">
                <pre className="whitespace-pre-wrap font-mono">{s.contenuto.slice(0, 200)}...</pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
