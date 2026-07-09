import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutButton } from "./checkout-button";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function getConcorso(slug: string) {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => ({} as any), setAll: () => {} },
  });

  const { data } = await supabase
    .from("concorsi")
    .select("*, concorsi_materie!inner(materie(id, nome, descrizione))")
    .eq("slug", slug)
    .single();

  return data as any;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concorso = await getConcorso(slug);

  if (!concorso) return { title: "Concorso non trovato — ConCourse" };

  return {
    title: `${concorso.titolo} — ${concorso.ente} | ConCourse`,
    description: concorso.descrizione?.slice(0, 160) ?? `Preparati al concorso ${concorso.titolo} con ConCourse.`,
  };
}

export default async function ConcorsoDetailPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concorso = await getConcorso(slug);

  if (!concorso) notFound();

  const materie = concorso.concorsi_materie?.map((cm: any) => cm.materie) ?? [];

  // Recupera i corsi associati a questo concorso (per prezzo)
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => ({} as any), setAll: () => {} },
  });
  const { data: corsiConcorso } = await supabase
    .from("corsi")
    .select("id, titolo, prezzo")
    .eq("concorso_id", concorso.id)
    .eq("stato", "pubblicato");

  const prezzoMin = corsiConcorso?.reduce(
    (min, c) => (c.prezzo && c.prezzo < min ? c.prezzo : min),
    Infinity,
  ) ?? null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight transition-colors hover:text-zinc-700">ConCourse</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/login" className="text-zinc-600 transition-colors hover:text-zinc-900">Accedi</Link>
            <Link href="/register" className="rounded-lg bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800">Registrati</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-zinc-500">
            <Link href="/" className="underline transition-colors hover:text-zinc-800">Concorsi</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-zinc-700">{concorso.ente}</span>
          </nav>

          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-wrap:balance">{concorso.titolo}</h1>
            <p className="mb-6 text-lg text-zinc-500">{concorso.ente}</p>

            {concorso.descrizione && (
              <div className="mb-8 text-zinc-700 leading-relaxed max-w-prose">{concorso.descrizione}</div>
            )}

            {/* Info boxes */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {concorso.data_scadenza_bando && (
                <div className="rounded-lg border border-zinc-100 bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">Scadenza</div>
                  <div className="mt-1.5 text-sm font-medium">
                    {new Date(concorso.data_scadenza_bando).toLocaleDateString("it-IT", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </div>
                </div>
              )}
              {concorso.numero_posti && (
                <div className="rounded-lg border border-zinc-100 bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">Posti</div>
                  <div className="mt-1.5 text-sm font-medium">{concorso.numero_posti}</div>
                </div>
              )}
              {concorso.link_bando_ufficiale && (
                <div className="rounded-lg border border-zinc-100 bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">Bando</div>
                  <a href={concorso.link_bando_ufficiale} target="_blank" rel="noopener noreferrer"
                    className="mt-1.5 inline-block text-sm font-medium text-zinc-900 underline transition-colors hover:text-zinc-600">Leggi il bando</a>
                </div>
              )}
            </div>

            {/* Materie incluse */}
            {materie.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-semibold">Materie incluse</h2>
                <div className="flex flex-wrap gap-2">
                  {materie.map((m: any) => (
                    <span key={m.id} className="inline rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {m.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Corsi associati con prezzi */}
            {corsiConcorso && corsiConcorso.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-semibold">Corsi disponibili</h2>
                <div className="space-y-3">
                  {corsiConcorso.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-4 transition-colors hover:border-zinc-200">
                      <span className="font-medium">{c.titolo}</span>
                      <span className="text-sm font-semibold">
                        {c.prezzo ? `€${c.prezzo.toFixed(2)}` : <span className="text-zinc-400">Prezzo da definire</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prezzo e CTA acquisto */}
            {prezzoMin !== null && (
              <div className="flex items-center justify-between rounded-lg bg-zinc-900 px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">A partire da</span>
                  <span className="text-lg font-bold">€{prezzoMin.toFixed(2)}</span>
                  <span className="text-xs text-zinc-400">per corso</span>
                </div>
                <CheckoutButton concorsoId={concorso.id} corsi={corsiConcorso ?? []} />
              </div>
            )}
          </div>

          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Course",
                name: concorso.titolo,
                description: concorso.descrizione,
                provider: { "@type": "Organization", name: "ConCourse" },
                audience: { "@type": "Audience", audienceType: "Concorsisti pubblici" },
              }),
            }}
          />
        </div>
      </main>

      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-3 text-center text-sm text-zinc-500">
            <span className="text-sm font-semibold tracking-tight text-zinc-900">ConCourse</span>
            <span>Preparazione ai concorsi pubblici italiani.</span>
            <span className="text-xs text-zinc-400">© {new Date().getFullYear()} ConCourse</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
