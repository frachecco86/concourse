import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function getMaterie() {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });

  const { data } = await supabase.from("materie").select("id, nome, descrizione").order("nome");
  return data ?? [];
}

export default async function MateriePage() {
  const materie = await getMaterie();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Materie</h1>
        <Link
          href="/admin/materie/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nuova materia
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Descrizione</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {materie.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-zinc-400">
                  Nessuna materia. Creane una nuova!
                </td>
              </tr>
            ) : (
              materie.map((m: any) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{m.nome}</td>
                  <td className="px-4 py-3 text-zinc-600">{m.descrizione ?? "—"}</td>
                  <td className="px-4 py-3">
                    <DeleteButton id={m.id} />
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
          cookies: { getAll: () => [], setAll: () => {} },
        });
        await supabase.from("materie").delete().eq("id", id);
        redirect("/admin/materie");
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
