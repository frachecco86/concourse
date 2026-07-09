import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * POST /api/stripe/checkout
 *
 * Crea una sessione di checkout Stripe per l'acquisto di un corso.
 * Body: { corsoId: string, successUrl: string, cancelUrl: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { corsoId, successUrl, cancelUrl } = body;

    if (!corsoId) {
      return NextResponse.json(
        { error: "corsoId richiesto" },
        { status: 400 },
      );
    }

    // Legge l'utente autenticato dai cookie
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => ({} as any),
        setAll: () => {},
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Utente non autenticato" },
        { status: 401 },
      );
    }

    // Recupera il corso
    const { data: corso } = await supabase
      .from("corsi")
      .select("*")
      .eq("id", corsoId)
      .single();

    if (!corso) {
      return NextResponse.json(
        { error: "Corso non trovato" },
        { status: 404 },
      );
    }

    if (!corso.prezzo || corso.prezzo <= 0) {
      return NextResponse.json(
        { error: "Corso senza prezzo" },
        { status: 400 },
      );
    }

    // Recupera profilo utente per dati fatturazione
    const { data: profilo } = await supabase
      .from("utenti_profili")
      .select("nome, cognome, dati_fatturazione")
      .eq("id", user.id)
      .single();

    // Crea sessione di checkout Stripe
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: corso.titolo,
              description: corso.descrizione ?? undefined,
            },
            unit_amount: Math.round(corso.prezzo * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        corso_id: corsoId,
        utente_id: user.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Salva la sessione nel DB
    await supabase.from("acquisti").insert({
      utente_id: user.id,
      corso_id: corsoId,
      importo: corso.prezzo,
      stato_pagamento: "in_attesa",
      provider: "stripe",
      stripe_session_id: session.id,
      receipt_email: user.email,
      dati_fatturazione: profilo?.dati_fatturazione ?? null,
    } as any);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Errore checkout Stripe:", error);
    return NextResponse.json(
      { error: error.message ?? "Errore interno" },
      { status: 500 },
    );
  }
}
