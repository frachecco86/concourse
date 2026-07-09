"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

export default function EditConcorsoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [titolo, setTitolo] = useState("");
  const [ente, setEnte] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [stato, setStato] = useState<"aperto" | "chiuso">("aperto");
  const [dataScadenza, setDataScadenza] = useState("");
  const [numeroPosti, setNumeroPosti] = useState("");
  const [linkBando, setLinkBando] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("concorsi")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const d = data as any;
      setTitolo(d.titolo);
      setEnte(d.ente);
      setDescrizione(d.descrizione ?? "");
      setStato(d.stato as "aperto" | "chiuso");
      setDataScadenza(d.data_scadenza_bando?.split("T")[0] ?? "");
      setNumeroPosti(d.numero_posti?.toString() ?? "");
      setLinkBando(d.link_bando_ufficiale ?? "");
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const slug = titolo
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100);

    const { error: updateError } = await supabase
      .from("concorsi")
      .update({
        titolo,
        ente,
        descrizione: descrizione || null,
        stato,
        data_scadenza_bando: dataScadenza || null,
        numero_posti: numeroPosti ? parseInt(numeroPosti, 10) : null,
        link_bando_ufficiale: linkBando || null,
        slug,
      } as any)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/concorsi");
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-zinc-400">Caricamento...</div>;
  }

  if (notFound) {
    return <div className="py-12 text-center text-zinc-400">Concorso non trovato.</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Modifica concorso</h1>

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

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Stato</label>
          <select
            value={stato}
            onChange={(e) => setStato(e.target.value as "aperto" | "chiuso")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          >
            <option value="aperto">Aperto</option>
            <option value="chiuso">Chiuso</option>
          </select>
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
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
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
