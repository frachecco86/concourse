"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import QuizPanel, { type QuizData } from "@/components/quiz-panel";

interface Capitolo {
  id: string;
  titolo: string;
  ordine: number;
  stato: "non_iniziato" | "in_corso" | "completato";
  quiz?: QuizData;
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
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      if (cancelled) return;

      const { data: corsoData } = await supabase
        .from("corsi")
        .select("*")
        .eq("id", corsoId)
        .single();
      if (cancelled) return;
      setCorso(corsoData);

      // Se il corso è gratuito (prezzo = 0), permetti accesso senza login
      const isFree = corsoData && (corsoData.prezzo === 0 || corsoData.prezzo === null);

      if (!uid && !isFree) {
        // Corso a pagamento: richiede login
        setLoading(false);
        return;
      }

      setUserId(uid);

      const { data: capData } = await supabase
        .from("capitoli")
        .select("id, titolo, ordine")
        .eq("corso_id", corsoId)
        .order("ordine", { ascending: true });

      if (!capData || cancelled) { setLoading(false); return; }

      let capitoliConStato: any[];

      if (uid) {
        // Utente autenticato: carica progresso
        const capIds = capData.map((c: any) => c.id);
        const { data: progData } = await supabase
          .from("progressi")
          .select("capitolo_id, stato")
          .eq("utente_id", uid)
          .in("capitolo_id", capIds);

        const progressMap: Record<string, string> = {};
        if (progData) {
          for (const p of progData) {
            progressMap[p.capitolo_id] = p.stato;
          }
        }

        capitoliConStato = capData.map((c: any) => ({
          ...c,
          stato: (progressMap[c.id] ?? "non_iniziato") as "non_iniziato" | "in_corso" | "completato",
        }));
      } else {
        // Utente anonimo (corso gratuito): mostra tutto come non_iniziato
        capitoliConStato = capData.map((c: any) => ({
          ...c,
          stato: "non_iniziato" as const,
        }));
      }

      if (cancelled) return;
      setCapitoli(capitoliConStato);

      const primoNonCompletato = capitoliConStato.find(
        (c) => c.stato !== "completato"
      ) ?? capitoliConStato[0];

      if (primoNonCompletato) {
        setCapitoloCorrente(primoNonCompletato);
        await caricaSlide(primoNonCompletato.id, uid);
      }

      // Carica quiz per tutti i capitoli
      const quizPerCapitoli: Record<string, QuizData> = {};
      for (const cap of capitoliConStato) {
        const { data: quizData } = await supabase
          .from("quiz")
          .select("id, titolo")
          .eq("capitolo_id", cap.id)
          .single();

        if (quizData) {
          const { data: domande } = await supabase
            .from("domande")
            .select("id, testo, tipo, opzioni, risposta_corretta, spiegazione")
            .eq("quiz_id", quizData.id)
            .order("id", { ascending: true });

          if (domande && domande.length > 0) {
            quizPerCapitoli[cap.id] = {
              id: quizData.id,
              titolo: quizData.titolo,
              domande: domande.map((d: any) => ({
                ...d,
                opzioni: typeof d.opzioni === "string" ? JSON.parse(d.opzioni) : d.opzioni,
              })),
            };
          }
        }
      }

      // Aggiorna i capitoli con il quiz associato (crea nuova copia)
      const capitoliConQuiz = JSON.parse(JSON.stringify(capitoliConStato)).map((c: any) => {
        if (quizPerCapitoli[c.id]) {
          c.quiz = quizPerCapitoli[c.id];
        }
        return c;
      });

      console.log('DEBUG: quizPerCapitoli =', Object.keys(quizPerCapitoli));
      console.log('DEBUG: capitoliConQuiz =', capitoliConQuiz.map((c: any) => c.titolo));
      console.log('DEBUG: capitoliConQuiz has quiz =', capitoliConQuiz.map((c: any) => ({ titolo: c.titolo, hasQuiz: !!c.quiz })));

      if (cancelled) return;
      setCapitoli(capitoliConQuiz);
      setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [corsoId]);

  async function caricaSlide(capitoloId: string, uid: string | null) {
    const { data: slideData } = await supabase
      .from("slide")
      .select("id, ordine, tipo, contenuto")
      .eq("capitolo_id", capitoloId)
      .order("ordine", { ascending: true });

    setSlide(slideData ?? []);
    setSlideIndex(0);
    setSlideCorrente(slideData?.[0] ?? null);
    setShowQuiz(false);
    setQuiz(null);

    // Carica quiz per questo capitolo
    const { data: quizData } = await supabase
      .from("quiz")
      .select("id, titolo")
      .eq("capitolo_id", capitoloId)
      .single();

    if (quizData) {
      const { data: domande } = await supabase
        .from("domande")
        .select("id, testo, tipo, opzioni, risposta_corretta, spiegazione")
        .eq("quiz_id", quizData.id)
        .order("id", { ascending: true });

      if (domande && domande.length > 0) {
        setQuiz({
          id: quizData.id,
          titolo: quizData.titolo,
          domande: domande.map((d: any) => ({
            ...d,
            opzioni: typeof d.opzioni === "string" ? JSON.parse(d.opzioni) : d.opzioni,
          })),
        });
      }
    }

    // Solo utenti autenticati possono salvare progresso
    if (uid) {
      await supabase.from("progressi").upsert(
        { utente_id: uid, capitolo_id: capitoloId, stato: "in_corso" },
        { onConflict: "utente_id" }
      );
    }
  }

  const selezionaCapitolo = useCallback(async (cap: Capitolo) => {
    setCapitoloCorrente(cap);
    await caricaSlide(cap.id, userId);
  }, [userId]);

  async function completaCapitolo() {
    if (!capitoloCorrente) return;

    if (userId) {
      await supabase.from("progressi").upsert(
        {
          utente_id: userId,
          capitolo_id: capitoloCorrente.id,
          stato: "completato",
          data_completamento: new Date().toISOString(),
        },
        { onConflict: "utente_id" }
      );
    }

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

  async function handleQuizComplete(punteggio: number, risposte: Record<string, string>) {
    if (!capitoloCorrente || !quiz || !userId) return;

    // Salva risultato quiz
    await supabase.from("risultati_quiz").upsert(
      {
        utente_id: userId,
        quiz_id: quiz.id,
        punteggio,
        risposte,
        data: new Date().toISOString(),
      },
      { onConflict: "utente_id" }
    );

    // Segna capitolo come completato
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
      setTimeout(() => selezionaCapitolo(capitoli[prossimoIdx]), 1500);
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

  function mostraQuiz() {
    setShowQuiz(true);
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
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
            Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  // Corso a pagamento ma utente non autenticato
  const isFree = corso.prezzo === 0 || corso.prezzo === null;
  if (!isFree && !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mb-2 text-3xl">🔒</div>
          <p className="text-zinc-500 mb-4">Devi essere autenticato per accedere a questo corso.</p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Accedi o registrati
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

        {/* Link ai quiz */}
        <div className="border-t p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Quiz</h3>
          {capitoli.some((c) => (c as any).quiz) ? (
            <div className="space-y-2">
              {capitoli.map((cap) => {
                const quizData = (cap as any).quiz;
                if (!quizData) return null;
                return (
                  <button
                    key={cap.id}
                    onClick={() => {
                      selezionaCapitolo(cap);
                      setTimeout(mostraQuiz, 300);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:bg-zinc-50"
                  >
                    <span className="text-zinc-600">Quiz: {cap.titolo}</span>
                    <span className="text-zinc-400">{quizData.domande.length} domande</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Nessun quiz disponibile.</p>
          )}
        </div>
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
                  {quiz && !showQuiz ? (
                    <button
                      onClick={mostraQuiz}
                      className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                      Vai al quiz del capitolo →
                    </button>
                  ) : (
                    <button
                      onClick={completaCapitolo}
                      className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                    >
                      Segna capitolo come completato
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
              <div className="mb-2 text-3xl">📖</div>
              <p className="text-zinc-400">Nessuna slide in questo capitolo.</p>
            </div>
          )}

          {/* Quiz del capitolo */}
          {showQuiz && quiz && (
            <QuizPanel
              quiz={quiz}
              capitoloId={capitoloCorrente?.id ?? ""}
              onComplete={handleQuizComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
