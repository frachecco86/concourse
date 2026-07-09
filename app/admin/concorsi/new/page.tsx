"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NuovoConcorsoPage() {
  const router = useRouter();
  const [titolo, setTitolo] = useState("");
  const [ente, setEnte] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [dataScadenza, setDataScadenza] = useState("");
  const [numeroPosti, setNumeroPosti] = useState("");
  const [linkBando, setLinkBando] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const slug = titolo
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100);

    const { error: insertError } = await supabase.from("concorsi").insert({
      titolo,
      ente,
      descrizione: descrizione || null,
      stato: "aperto",
      data_scadenza_bando: dataScadenza || null,
      numero_posti: numeroPosti ? parseInt(numeroPosti, 10) : null,
      link_bando_ufficiale: linkBando || null,
      slug,
    } as any);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/concorsi");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nuovo concorso</h1>

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
          <label className="mb-1 block text-sm font-medium text-zinc-700">Ente</label>
          <input
            value={ente}
            onChange={(e) => setEnte(e.target.value)}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Scadenza bando</label>
            <input
              type="date"
              value={dataScadenza}
              onChange={(e) => setDataScadenza(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Numero posti</label>
            <input
              type="number"
              value={numeroPosti}
              onChange={(e) => setNumeroPosti(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Link bando ufficiale</label>
          <input
            type="url"
            value={linkBando}
            onChange={(e) => setLinkBando(e.target.value)}
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
            {loading ? "Creazione..." : "Crea concorso"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/concorsi")}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
