"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Capitolo {
  id: string;
  titolo: string;
  ordine: number;
  stato: "non_iniziato" | "in_corso" | "completato";
}

interface Slide {
  id: string;
  ordine: number;
  tipo: "slide" | "riassunto";
  contenuto: string;
}

export default function PlayerPage() {
  const params = useParams();
  const corsoId = params.corsoId as string;

  const [corso, setCorso] = useState<any>(null);
  const [capitoli, setCapitoli] = useState<Capitolo[]>([]);
  const [capitoloCorrente, setCapitoloCorrente] = useState<Capitolo | null>(null);
  const [slide, setSlide] = useState<Slide[]>([]);
  const [slideCorrente, setSlideCorrente] = useState<Slide | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (cancelled) return;
      setUserId(user.id);

      const { data: corsoData } = await supabase
        .from("corsi")
        .select("*")
        .eq("id", corsoId)
        .single();
      if (cancelled) return;
      setCorso(corsoData);

      const { data: capData } = await supabase
        .from("capitoli")
        .select("id, titolo, ordine")
        .eq("corso_id", corsoId)
        .order("ordine", { ascending: true });

      if (!capData || cancelled) { setLoading(false); return; }

      const capIds = capData.map((c: any) => c.id);
      const { data: progData } = await supabase
        .from("progressi")
        .select("capitolo_id, stato")
        .eq("utente_id", user.id)
        .in("capitolo_id", capIds);

      const progressMap: Record<string, string> = {};
      if (progData) {
        for (const p of progData) {
          progressMap[p.capitolo_id] = p.stato;
        }
      }

      const capitoliConStato = capData.map((c: any) => ({
        ...c,
        stato: (progressMap[c.id] ?? "non_iniziato") as "non_iniziato" | "in_corso" | "completato",
      }));

      if (cancelled) return;
      setCapitoli(capitoliConStato);

      const primoNonCompletato = capitoliConStato.find(
        (c) => c.stato !== "completato"
      ) ?? capitoliConStato[0];

      if (primoNonCompletato) {
        setCapitoloCorrente(primoNonCompletato);
        await caricaSlide(primoNonCompletato.id, user.id);
      }

      setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [corsoId]);

  async function caricaSlide(capitoloId: string, uid: string) {
    const { data: slideData } = await supabase
      .from("slide")
      .select("id, ordine, tipo, contenuto")
      .eq("capitolo_id", capitoloId)
      .order("ordine", { ascending: true });

    setSlide(slideData ?? []);
    setSlideIndex(0);
    setSlideCorrente(slideData?.[0] ?? null);

    await supabase.from("progressi").upsert(
      { utente_id: uid, capitolo_id: capitoloId, stato: "in_corso" },
      { onConflict: "utente_id" }
    );
  }

  const selezionaCapitolo = useCallback(async (cap: Capitolo) => {
    if (!userId) return;
    setCapitoloCorrente(cap);
    await caricaSlide(cap.id, userId);
  }, [userId]);

  async function completaCapitolo() {
    if (!userId || !capitoloCorrente) return;
    await supabase.from("progressi").upsert(
      {
        utente_id: userId,
        capitolo_id: capitoloCorrente.id,
        stato: "completato",
        data_completamento: new Date().toISOString(),
      },
      { onConflict: "utente_id" }
    );

    setCapitoli((prev) =>
      prev.map((c) =>
        c.id === capitoloCorrente.id ? { ...c, stato: "completato" } : c
      )
    );

    const prossimoIdx = capitoli.findIndex(
      (c) => c.id === capitoloCorrente.id
    ) + 1;
    if (prossimoIdx < capitoli.length) {
      selezionaCapitolo(capitoli[prossimoIdx]);
    }
  }

  function slidePrecedente() {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
      setSlideCorrente(slide[slideIndex - 1]);
    }
  }

  function slideSuccessiva() {
    if (slideIndex < slide.length - 1) {
      setSlideIndex(slideIndex + 1);
      setSlideCorrente(slide[slideIndex + 1]);
    }
  }

  /** Render markdown → HTML semplice */
  function renderMarkdown(md: string): string {
    let html = md
      .replace(/^### (.+)$/gm, "<h3 id=\"slide-h3\">$1</h3>")
      .replace(/^## (.+)$/gm, "<h2 id=\"slide-h2\">$1</h2>")
      .replace(/^# (.+)$/gm, "<h1 id=\"slide-h1\">$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<em>$1</em>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(?:^|\n)(<li>[\s\S]*?<\/li>)/gm, "<ul>$1</ul>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/```(\w*)\n([\s\S]*?)```/gm, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");
    return `<div class="prose max-w-none"><p>${html}</p></div>`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-48 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
          <span className="text-sm text-zinc-400">Caricamento corso...</span>
        </div>
      </div>
    );
  }

  if (!corso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mb-2 text-3xl">📚</div>
          <p className="text-zinc-400">Corso non trovato.</p>
          <Link href="/miei-corsi" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
            Torna ai tuoi corsi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar capitoli */}
      <aside className="flex w-72 flex-col border-r bg-white">
        <div className="border-b px-5 py-4">
          <Link href="/miei-corsi" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 underline">
            ← I miei corsi
          </Link>
          <h2 className="mt-1 text-sm font-semibold">{corso?.titolo}</h2>
        </div>

        {/* Progresso complessivo */}
        {capitoli.length > 0 && (
          <div className="border-b px-5 py-3">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
              <span>Progresso</span>
              <span>{capitoli.filter(c => c.stato === "completato").length}/{capitoli.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(capitoli.filter(c => c.stato === "completato").length / capitoli.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" role="navigation" aria-label="Capitoli del corso">
          {capitoli.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-400">Nessun capitolo disponibile.</p>
          ) : (
            capitoli.map((cap) => (
              <button
                key={cap.id}
                onClick={() => selezionaCapitolo(cap)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  cap.id === capitoloCorrente?.id
                    ? "bg-zinc-900 text-white"
                    : cap.stato === "completato"
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <span className="text-xs font-mono" aria-hidden="true">
                  {cap.stato === "completato" ? "✅" : cap.id === capitoloCorrente?.id ? "▶" : `${cap.ordine}.`}
                </span>
                {cap.titolo}
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* Area contenuto */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-wrap:balance">
            {capitoloCorrente?.titolo ?? "Seleziona un capitolo"}
          </h1>

          {slideCorrente ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                    slideCorrente.tipo === "slide"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {slideCorrente.tipo === "slide" ? "Slide" : "Riassunto"}
                </span>
                <span className="text-xs text-zinc-400">
                  {slideIndex + 1} / {slide.length}
                </span>
              </div>

              <div
                className="prose prose-zinc max-w-none rounded-xl border bg-white p-8 shadow-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(slideCorrente.contenuto) }}
              />

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={slidePrecedente}
                  disabled={slideIndex === 0}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-30"
                >
                  ← Precedente
                </button>
                <span className="text-xs text-zinc-400">
                  Slide {slideIndex + 1} di {slide.length}
                </span>
                <button
                  onClick={slideSuccessiva}
                  disabled={slideIndex === slide.length - 1}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-30"
                >
                  Successiva →
                </button>
              </div>

              {slideIndex === slide.length - 1 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={completaCapitolo}
                    className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                  >
                    Segna capitolo come completato
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
              <div className="mb-2 text-3xl">📖</div>
              <p className="text-zinc-400">Nessuna slide in questo capitolo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
