"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

export default function EditSlidePage() {
  const router = useRouter();
  const params = useParams();
  const corsoId = params.id as string;
  const capitoloId = params.capitoloId as string;
  const slideId = params.slideId as string;

  const [contenuto, setContenuto] = useState("");
  const [tipo, setTipo] = useState<"slide" | "riassunto">("slide");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("slide")
        .select("*")
        .eq("id", slideId)
        .single();

      if (data) {
        const d = data as any;
        setContenuto(d.contenuto);
        setTipo(d.tipo);
      }
      setLoading(false);
    }
    load();
  }, [slideId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("slide")
      .update({ contenuto, tipo } as any)
      .eq("id", slideId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push(`/admin/corsi/${corsoId}/capitoli/${capitoloId}`);
  }

  /** Simple markdown to HTML preview (senza dipendenze esterne) */
  function renderMarkdown(md: string): string {
    let html = md
      // Headings
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/__(.+?)__/g, "<em>$1</em>")
      // Bullet list
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>[\s\S]*?<\/li>)/gm, "<ul>$1</ul>")
      // Numbered list
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Code block
      .replace(/```(\w*)\n([\s\S]*?)```/gm, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`(.+?)`/g, "<code>$1</code>")
      // Paragraphs
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");

    return `<div class="prose max-w-none text-sm leading-relaxed"><p>${html}</p></div>`;
  }

  if (loading) {
    return <div className="py-12 text-center text-zinc-400">Caricamento...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <a
          href={`/admin/corsi/${corsoId}/capitoli/${capitoloId}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 underline"
        >
          ← Torna al capitolo
        </a>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Modifica slide</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "slide" | "riassunto")}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="slide">Slide</option>
            <option value="riassunto">Riassunto</option>
          </select>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-zinc-700">
              Contenuto (markdown)
            </label>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline"
            >
              {preview ? "Editor" : "Anteprima"}
            </button>
          </div>

          {preview ? (
            <div
              className="min-h-64 rounded-lg border bg-white p-4 shadow-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(contenuto) }}
            />
          ) : (
            <textarea
              value={contenuto}
              onChange={(e) => setContenuto(e.target.value)}
              rows={20}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 font-mono"
            />
          )}
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
            onClick={() => router.push(`/admin/corsi/${corsoId}/capitoli/${capitoloId}`)}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
