"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface CorsoConProgresso {
  id: string;
  titolo: string;
  descrizione: string | null;
  capitoli_totali: number;
  capitoli_completati: number;
}

export default function MieiCorsiPage() {
  const [corsi, setCorsi] = useState<CorsoConProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Legge i corsi acquistati dall'utente corrente
      const { data: iscrizioni } = await supabase
        .from("iscrizioni_corso")
        .select("corso_id, corsi!inner(id, titolo, descrizione)")
        .eq("utente_id", (await supabase.auth.getUser()).data.user?.id ?? "");

      if (!iscrizioni) { setLoading(false); return; }

      const corsiList = iscrizioni.map((i: any) => ({
        id: i.corsi.id,
        titolo: i.corsi.titolo,
        descrizione: i.corsi.descrizione,
        capitoli_totali: 0,
        capitoli_completati: 0,
      }));

      // Per ogni corso, conta capitoli e progressi
      for (const corso of corsiList) {
        const { data: capitoli } = await supabase
          .from("capitoli")
          .select("id")
          .eq("corso_id", corso.id);

        const capIds = capitoli?.map((c: any) => c.id) ?? [];
        corso.capitoli_totali = capIds.length;

        if (capIds.length > 0) {
          const { data: progressi } = await supabase
            .from("progressi")
            .select("capitolo_id")
            .eq("utente_id", (await supabase.auth.getUser()).data.user?.id ?? "")
            .in("capitolo_id", capIds)
            .eq("stato", "completato");

          corso.capitoli_completati = progressi?.length ?? 0;
        }
      }

      setCorsi(corsiList);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-400">Caricamento...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">ConCourse</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/miei-corsi" className="font-medium text-zinc-900">I miei corsi</Link>
            <Link href="/logout" className="text-zinc-600 hover:text-zinc-900">Esci</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">I miei corsi</h1>

        {corsi.length === 0 ? (
          <p className="text-zinc-400">Non hai ancora acquistato corsi.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {corsi.map((corso) => {
              const percent = corso.capitoli_totali > 0
                ? Math.round((corso.capitoli_completati / corso.capitoli_totali) * 100)
                : 0;

              return (
                <Link
                  key={corso.id}
                  href={`/corsi/${corso.id}/player`}
                  className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <h3 className="mb-2 text-lg font-semibold">{corso.titolo}</h3>
                  {corso.descrizione && (
                    <p className="mb-4 text-sm text-zinc-600 line-clamp-2">{corso.descrizione}</p>
                  )}

                  {/* Progress bar */}
                  <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                    <span>{corso.capitoli_completati}/{corso.capitoli_totali} capitoli</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
