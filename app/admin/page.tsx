import { createAdminServerClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getStats() {
  const supabase = await createAdminServerClient();

  const [
    { count: concorsiCount },
    { count: materieCount },
    { count: corsiCount },
    { count: acquistiCount },
    { count: utentiCount },
  ] = await Promise.all([
    supabase.from("concorsi").select("*", { count: "exact", head: true }),
    supabase.from("materie").select("*", { count: "exact", head: true }),
    supabase.from("corsi").select("*", { count: "exact", head: true }),
    supabase.from("acquisti").select("*", { count: "exact", head: true }),
    supabase.from("utenti_profili").select("*", { count: "exact", head: true }),
  ]);

  return { concorsi: concorsiCount ?? 0, materie: materieCount ?? 0, corsi: corsiCount ?? 0, acquisti: acquistiCount ?? 0, utenti: utentiCount ?? 0 };
}

export default async function AdminPage() {
  const stats = await getStats();

  const cards = [
    { label: "Concorsi", value: stats.concorsi, href: "/admin/concorsi", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "Materie", value: stats.materie, href: "/admin/materie", color: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "Corsi", value: stats.corsi, href: "/admin/corsi", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { label: "Acquisti", value: stats.acquisti, href: "#", color: "bg-violet-50 text-violet-700 border-violet-100" },
    { label: "Utenti", value: stats.utenti, href: "#", color: "bg-rose-50 text-rose-700 border-rose-100" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${card.color}`}
          >
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="mt-1 text-sm">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
