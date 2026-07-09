import Link from "next/link";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function getConcorsiInEvidenza() {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => ({} as any), setAll: () => {} },
  });

  const { data } = await supabase
    .from("concorsi")
    .select("titolo, ente, slug, data_scadenza_bando, numero_posti, cover_image")
    .eq("stato", "aperto")
    .order("created_at", { ascending: false })
    .limit(6);

  return data ?? [];
}

export default async function HomePage() {
  const concorsi = await getConcorsiInEvidenza();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ConCourse
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
              Accedi
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
            >
              Registrati
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-zinc-900 py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Preparati ai concorsi pubblici
          </h1>
          <p className="mb-8 text-lg text-zinc-400">
            Corsi strutturati per materia, slide, riassunti e quiz. Studia al tuo ritmo, senza
            distrazioni.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
          >
            Inizia ora
          </Link>
        </div>
      </section>

      {/* Concorsi in evidenza */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Concorsi attivi</h2>

          {concorsi.length === 0 ? (
            <p className="text-zinc-400">Nessun concorso attivo al momento.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {concorsi.map((c) => (
                <div
                  key={c.slug}
                  className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {c.ente}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{c.titolo}</h3>
                  <div className="space-y-1 text-sm text-zinc-600">
                    {c.data_scadenza_bando && (
                      <p>
                        📅 Scadenza:{" "}
                        {new Date(c.data_scadenza_bando).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {c.numero_posti && <p>👥 Posti: {c.numero_posti}</p>}
                  </div>
                  <Link
                    href={`/concorsi/${c.slug}`}
                    className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Scopri il corso
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-zinc-500">
          ConCourse — Preparazione ai concorsi pubblici italiani.
        </div>
      </footer>
    </div>
  );
}
