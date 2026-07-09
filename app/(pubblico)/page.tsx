import Link from "next/link";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function getConcorsiInEvidenza() {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
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
            <Link href="/login" className="text-zinc-600 hover:text-zinc-900 transition-colors">
              Accedi
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 transition-colors"
            >
              Registrati
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-zinc-900 py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl text-wrap:balance">
            Preparati ai concorsi pubblici
          </h1>
          <p className="mb-10 text-lg text-zinc-400 leading-relaxed">
            Corsi strutturati per materia, slide, riassunti e quiz. Studia al tuo ritmo, senza
            distrazioni.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Inizia ora
          </Link>
        </div>
      </section>

      {/* Concorsi in evidenza */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-2xl font-semibold tracking-tight">Concorsi attivi</h2>

          {concorsi.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4 text-4xl">📋</div>
              <p className="text-zinc-400">Nessun concorso attivo al momento.</p>
              <p className="mt-2 text-sm text-zinc-300">Torna a trovarci presto per nuove opportunità.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {concorsi.map((c) => (
                <Link
                  key={c.slug}
                  href={`/concorsi/${c.slug}`}
                  className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    {c.ente}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold group-hover:text-zinc-900 transition-colors">{c.titolo}</h3>
                  <div className="space-y-1.5 text-sm text-zinc-600">
                    {c.data_scadenza_bando && (
                      <p className="flex items-center gap-1.5">
                        <span className="text-zinc-400" aria-hidden="true">📅</span>
                        Scadenza:{" "}
                        {new Date(c.data_scadenza_bando).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {c.numero_posti && (
                      <p className="flex items-center gap-1.5">
                        <span className="text-zinc-400" aria-hidden="true">👥</span>
                        Posti: {c.numero_posti}
                      </p>
                    )}
                  </div>
                  <span className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-zinc-800">
                    Scopri il corso
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-sm font-semibold tracking-tight">ConCourse</div>
            <div className="text-center text-sm text-zinc-500">
              Preparazione ai concorsi pubblici italiani.
            </div>
            <div className="text-xs text-zinc-400">
              © {new Date().getFullYear()} ConCourse
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
