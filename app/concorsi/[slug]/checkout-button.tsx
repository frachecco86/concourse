"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Corso {
  id: string;
  titolo: string;
  prezzo: number | null;
}

export function CheckoutButton({
  concorsoId,
  corsi,
}: {
  concorsoId: string;
  corsi: Corso[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAcquisto(corsoId: string) {
    setLoading(true);
    setError("");

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corsoId,
          successUrl: `${window.location.origin}/miei-corsi?acquisto=ok`,
          cancelUrl: `${window.location.origin}/concorsi/${window.location.pathname.split("/").pop()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Errore durante il checkout");
        return;
      }

      // Reindirizza a Stripe
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message ?? "Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  if (corsi.length === 0) return null;

  if (corsi.length === 1) {
    return (
      <div>
        <button
          onClick={() => handleAcquisto(corsi[0].id)}
          disabled={loading}
          className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
        >
          {loading ? "Reindirizzamento..." : "Acquista ora"}
        </button>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // Multipli corsi: mostra selezione
  const [selectedCorso, setSelectedCorso] = useState(corsi[0]?.id ?? "");

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedCorso}
        onChange={(e) => setSelectedCorso(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
      >
        {corsi.map((c) => (
          <option key={c.id} value={c.id}>
            {c.titolo} — {c.prezzo ? `€${c.prezzo.toFixed(2)}` : "N/D"}
          </option>
        ))}
      </select>
      <button
        onClick={() => handleAcquisto(selectedCorso)}
        disabled={loading || !selectedCorso}
        className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
      >
        {loading ? "Reindirizzamento..." : "Acquista"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
