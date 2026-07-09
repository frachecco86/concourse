import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function getConcorsi() {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => ({} as any), setAll: () => {} },
  });

  const { data } = await supabase
    .from("concorsi")
    .select("id, titolo, ente, stato, data_scadenza_bando, slug")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function ConcorsiPage() {
  const concorsi = await getConcorsi();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Concorsi</h1>
        <Link
          href="/admin/concorsi/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nuovo concorso
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Titolo</th>
              <th className="px-4 py-3 font-medium">Ente</th>
              <th className="px-4 py-3 font-medium">Stato</th>
              <th className="px-4 py-3 font-medium">Scadenza</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {concorsi.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                  Nessun concorso. Creane uno nuovo!
                </td>
              </tr>
            ) : (
              concorsi.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{c.titolo}</td>
                  <td className="px-4 py-3 text-zinc-600">{c.ente}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.stato === "aperto"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {c.stato === "aperto" ? "Aperto" : "Chiuso"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {c.data_scadenza_bando
                      ? new Date(c.data_scadenza_bando).toLocaleDateString("it-IT")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/concorsi/${c.id}/edit`}
                        className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                      >
                        Modifica
                      </Link>
                      <DeleteButton id={c.id} />
                    </div>
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

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: { getAll: () => ({} as any), setAll: () => {} },
        });
        await supabase.from("concorsi").delete().eq("id", id);
        redirect("/admin/concorsi");
      }}
    >
      <button
        type="submit"
        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Elimina
      </button>
    </form>
  );
}
