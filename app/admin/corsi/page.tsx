import { createAdminServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getCorsi() {
  const supabase = await createAdminServerClient();

  const { data } = await supabase
    .from("corsi")
    .select("id, titolo, descrizione, stato")
    .order("titolo");

  return data ?? [];
}

export default async function CorsiPage() {
  const corsi = await getCorsi();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Corsi</h1>
        <Link
          href="/admin/corsi/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nuovo corso
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Titolo</th>
              <th className="px-4 py-3 font-medium">Stato</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {corsi.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-zinc-400">
                  Nessun corso. Creane uno nuovo!
                </td>
              </tr>
            ) : (
              corsi.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{c.titolo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.stato === "pubblicato"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {c.stato === "pubblicato" ? "Pubblicato" : "Bozza"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/corsi/${c.id}`}
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
        const { createAdminServerClient } = await import("@/lib/supabase/server");
        const supabase = await createAdminServerClient();
        await supabase.from("corsi").delete().eq("id", id);
        redirect("/admin/corsi");
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
