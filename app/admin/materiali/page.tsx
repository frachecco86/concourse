import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function getMateriali() {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const { data } = await supabase
    .from("materiali_origine")
    .select("id, concorso_id, materia_id, file_url, tipo, stato_elaborazione")
    .order("id", { ascending: false });

  return data ?? [];
}

export default async function MaterialiPage() {
  const materiali = await getMateriali();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Materiali origine</h1>
        <Link
          href="/admin/materiali/upload"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Carica PDF
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Stato</th>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {materiali.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-zinc-400">
                  Nessun materiale caricato.
                </td>
              </tr>
            ) : (
              materiali.map((m: any) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <span className="inline rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {m.tipo === "bando" ? "Bando" : m.tipo === "questionario" ? "Questionario" : "Dispensa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.stato_elaborazione === "elaborato"
                          ? "bg-emerald-50 text-emerald-700"
                          : m.stato_elaborazione === "errore"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {m.stato_elaborazione === "in_coda"
                        ? "In coda"
                        : m.stato_elaborazione === "elaborato"
                          ? "Elaborato"
                          : "Errore"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-900 underline"
                    >
                      Vedi file
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {m.stato_elaborazione === "in_coda" && (
                      <span className="text-xs text-zinc-400">In attesa di elaborazione</span>
                    )}
                    {m.stato_elaborazione === "elaborato" && (
                      <span className="text-xs text-emerald-600">Pronto</span>
                    )}
                    {m.stato_elaborazione === "errore" && (
                      <span className="text-xs text-red-600">Fallito</span>
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
