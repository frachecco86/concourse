"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Concorso {
  id: string;
  titolo: string;
}

interface Materia {
  id: string;
  nome: string;
}

export default function UploadMaterialePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<"bando" | "questionario" | "dispensa">("bando");
  const [concorsoId, setConcorsoId] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [concorsi, setConcorsi] = useState<Concorso[]>([]);
  const [materie, setMaterie] = useState<Materia[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [cRes, mRes] = await Promise.all([
        supabase.from("concorsi").select("id, titolo").order("titolo"),
        supabase.from("materie").select("id, nome").order("nome"),
      ]);
      setConcorsi(cRes.data ?? []);
      setMaterie(mRes.data ?? []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Seleziona un file PDF");
      return;
    }

    setLoading(true);
    setError("");

    // 1. Upload file to Supabase Storage
    const fileName = `${concorsoId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("materiali")
      .upload(fileName, file, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    // 2. Get public URL
    const { data: publicUrl } = supabase.storage
      .from("materiali")
      .getPublicUrl(fileName);

    // 3. Insert record in materiali_origine
    const { error: insertError } = await supabase.from("materiali_origine").insert({
      concorso_id: concorsoId,
      materia_id: materiaId || null,
      file_url: publicUrl.publicUrl,
      tipo,
      stato_elaborazione: "in_coda",
    } as any);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // 4. Trigger AI pipeline (asincrono, non bloccante)
    await fetch("/api/generazione/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concorsoId, materiaId: materiaId || null }),
    });

    router.push("/admin/materiali");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Carica materiale</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Concorso</label>
          <select
            value={concorsoId}
            onChange={(e) => setConcorsoId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            required
          >
            <option value="">Seleziona concorso</option>
            {concorsi.map((c) => (
              <option key={c.id} value={c.id}>{c.titolo}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Materia (opzionale)
          </label>
          <select
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          >
            <option value="">Seleziona materia</option>
            {materie.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Tipo materiale</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "bando" | "questionario" | "dispensa")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          >
            <option value="bando">Bando</option>
            <option value="questionario">Questionario</option>
            <option value="dispensa">Dispensa</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">File PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Caricamento..." : "Carica e avvia generazione"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/materiali")}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
