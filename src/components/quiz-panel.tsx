"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Tipi ──────────────────────────────────────────────────────────

export interface Domanda {
  id: string;
  testo: string;
  tipo: string;
  opzioni: string[] | Record<string, unknown>;
  risposta_corretta: string;
  spiegazione: string | null;
}

export interface QuizData {
  id: string;
  titolo: string;
  domande: Domanda[];
}

interface QuizPanelProps {
  quiz: QuizData;
  capitoloId: string;
  onComplete: (punteggio: number, risposte: Record<string, string>) => void;
}

// ─── Varianti di animazione ────────────────────────────────────────

const variants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};

interface OptionVariant {
  initial: { opacity: number; x: number; };
  animate: (i: number) => { opacity: number; x: number; transition: any };
}

const optionVariants: OptionVariant = {
  initial: { opacity: 0, x: -20 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.05 * i, type: 'spring' as any, stiffness: 200 },
  }),
};

// ─── Componente ────────────────────────────────────────────────────

export default function QuizPanel({ quiz, capitoloId, onComplete }: QuizPanelProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [risposte, setRisposte] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    domandaId: string;
    scelta: string;
    corretta: boolean;
  } | null>(null);
  const [completato, setCompletato] = useState(false);
  const [punteggio, setPunteggio] = useState(0);
  const [showSpiegazione, setShowSpiegazione] = useState(false);

  const domanda = quiz.domande[currentQ];
  const isLast = currentQ === quiz.domande.length - 1;
  const progresso = ((currentQ + (feedback ? 1 : 0)) / quiz.domande.length) * 100;

  const opzioni = Array.isArray(domanda?.opzioni)
    ? domanda.opzioni
    : typeof domanda?.opzioni === "object" && domanda.opzioni
      ? Object.values(domanda.opzioni)
      : [];

  const handleRispondi = useCallback(
    (scelta: string) => {
      if (feedback) return; // già risposto

      const corretta = scelta === domanda.risposta_corretta;
      setFeedback({ domandaId: domanda.id, scelta, corretta });

      if (corretta) {
        setPunteggio((prev) => prev + 1);
      }

      // Mostra spiegazione dopo breve pausa
      setTimeout(() => setShowSpiegazione(true), 600);

      // Salva risposta
      setRisposte((prev) => ({ ...prev, [domanda.id]: scelta }));
    },
    [domanda, feedback],
  );

  const handleAvanti = useCallback(() => {
    if (isLast) {
      // Quiz completato
      setCompletato(true);
      onComplete(punteggio, risposte);
      return;
    }
    setCurrentQ((prev) => prev + 1);
    setFeedback(null);
    setShowSpiegazione(false);
  }, [isLast, punteggio, risposte, onComplete]);

  const handleRiprova = useCallback(() => {
    setCurrentQ(0);
    setRisposte({});
    setFeedback(null);
    setCompletato(false);
    setPunteggio(0);
    setShowSpiegazione(false);
  }, []);

  // ─── Schermata finale ─────────────────────────────────────────
  if (completato) {
    const totale = quiz.domande.length;
    const percent = Math.round((punteggio / totale) * 100);
    const colore = percent >= 80 ? "text-emerald-600" : percent >= 50 ? "text-amber-600" : "text-red-600";

    return (
      <motion.div
        key="risultato"
        variants={variants}
        initial="initial"
        animate="animate"
        className="mt-8 rounded-xl border bg-white p-8 shadow-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mb-4 text-5xl"
        >
          {percent >= 80 ? "🎉" : percent >= 50 ? "👏" : "💪"}
        </motion.div>

        <h3 className="mb-2 text-lg font-semibold">Quiz completato!</h3>
        <p className="mb-2 text-sm text-zinc-500">{quiz.titolo}</p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-3xl font-bold ${colore}`}
        >
          {punteggio} / {totale}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-sm text-zinc-400"
        >
          {percent >= 80
            ? "Ottimo! Padroneggi la materia."
            : percent >= 50
              ? "Buono, ma puoi migliorare. Rivedi i punti chiave."
              : "Ripassa il capitolo e riprova."}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRiprova}
          className="mt-6 rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Riprova il quiz
        </motion.button>
      </motion.div>
    );
  }

  if (!domanda) return null;

  return (
    <div className="mt-8">
      {/* Barra di progresso animata */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
          <span>Quiz: {quiz.titolo}</span>
          <span>
            {currentQ + 1} / {quiz.domande.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <motion.div
            className="h-full rounded-full bg-zinc-900"
            initial={{ width: 0 }}
            animate={{ width: `${progresso}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </motion.div>

      {/* Domanda corrente */}
      <AnimatePresence mode="wait">
        <motion.div
          key={domanda.id}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <h3 className="mb-4 text-base font-semibold leading-relaxed text-zinc-900">
            {domanda.testo}
          </h3>

          {/* Opzioni */}
          <div className="space-y-2">
            {opzioni.map((opzione, idx) => {
              const isSelected = feedback?.scelta === opzione;
              const isCorretta = opzione === domanda.risposta_corretta;
              let stile =
                "w-full rounded-lg border px-4 py-3 text-sm text-left transition-colors ";

              if (feedback) {
                if (isCorretta) {
                  stile +=
                    "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
                } else if (isSelected) {
                  stile +=
                    "border-red-500 bg-red-50 text-red-800 font-medium";
                } else {
                  stile +=
                    "border-zinc-200 bg-zinc-50 text-zinc-400";
                }
              } else {
                stile +=
                  "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer";
              }

              return (
                <motion.button
                  key={String(opzione)}
                  whileHover={!feedback ? { scale: 1.01 } : undefined}
                  whileTap={!feedback ? { scale: 0.98 } : undefined}
                  onClick={() => handleRispondi(String(opzione))}
                  disabled={!!feedback}
                  className={stile}
                >
                  {String(opzione)}
                </motion.button>
              );
            })}
          </div>

          {/* Spiegazione */}
          <AnimatePresence>
            {showSpiegazione && domanda.spiegazione && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className="mt-4 overflow-hidden"
              >
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
                  <strong className="block mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Spiegazione
                  </strong>
                  {domanda.spiegazione}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottone avanti */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAvanti}
                className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                {isLast ? "Vedi risultato" : "Prossima domanda →"}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
