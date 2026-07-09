import { createAdminServerClient } from "@/lib/supabase/server";

async function getVendite() {
  const supabase = await createAdminServerClient();

  const { data: acquisti } = await supabase
    .from("acquisti")
    .select(
      `*, corsi!inner(titolo), utenti_profili!inner(nome, cognome)`
    )
    .order("created_at", { ascending: false })
    .limit(100);

  // Statistiche
  const { data: stats } = await supabase
    .from("acquisti")
    .select("stato_pagamento, importo");

  const totali = (stats ?? []).reduce(
    (acc, a) => {
      acc[a.stato_pagamento] = (acc[a.stato_pagamento] ?? 0) + Number(a.importo);
      acc._totale += Number(a.importo);
      return acc;
    },
    { completato: 0, in_attesa: 0, _totale: 0 } as Record<string, number>,
  );

  return { acquisti: acquisti ?? [], totali };
}

export default async function VenditePage() {
  const { acquisti, totali } = await getVendite();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Vendite</h1>

      {/* Riepilogo */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">Totale incasso</div>
          <div className="mt-2 text-2xl font-bold">
            €{totali._totale.toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">Completati</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            €{totali.completato.toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">In attesa</div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            €{totali.in_attesa.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tabella acquisti */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left">
              <th className="px-4 py-3 font-medium text-zinc-500">Data</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Utente</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Corso</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Importo</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Stato</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Fattura</th>
            </tr>
          </thead>
          <tbody>
            {acquisti.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  Nessun acquisto ancora.
                </td>
              </tr>
            ) : (
              acquisti.map((a: any) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-600">
                    {new Date(a.created_at).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-4 py-3">
                    {a.utenti_profili?.nome} {a.utenti_profili?.cognome}
                  </td>
                  <td className="px-4 py-3">{a.corsi?.titolo}</td>
                  <td className="px-4 py-3 font-medium">€{Number(a.importo).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.stato_pagamento === "completato"
                          ? "bg-emerald-50 text-emerald-700"
                          : a.stato_pagamento === "in_attesa"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {a.stato_pagamento === "completato"
                        ? "Completato"
                        : a.stato_pagamento === "in_attesa"
                          ? "In attesa"
                          : a.stato_pagamento}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.fattura_url ? (
                      <a
                        href={a.fattura_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-600 underline hover:text-zinc-900"
                      >
                        Ricevuta
                      </a>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
