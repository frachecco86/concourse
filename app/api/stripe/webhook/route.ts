import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { headers } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/stripe/webhook
 *
 * Gestisce eventi Stripe: checkout.session.completed → attiva accesso corso
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    let event;
    try {
      const stripe = await getStripe();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Errore verifica webhook Stripe:", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Gestisce solo checkout completato
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const corsoId = session.metadata?.corso_id;
      const utenteId = session.metadata?.utente_id;

      if (!corsoId || !utenteId) {
        console.warn("Webhook: metadata mancanti", session.id);
        return NextResponse.json({ received: true });
      }

      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: { getAll: () => [], setAll: () => {} },
      });

      // 1. Aggiorna stato acquisto
      await supabase
        .from("acquisti")
        .update({
          stato_pagamento: "completato",
          provider_payment_id: session.payment_intent as string ?? session.id,
        } as any)
        .eq("stripe_session_id", session.id);

      // 2. Crea iscrizione_corso (accesso al corso)
      const { data: existing } = await supabase
        .from("iscrizioni_corso")
        .select("utente_id")
        .eq("utente_id", utenteId)
        .eq("corso_id", corsoId)
        .maybeSingle();

      if (!existing) {
        await supabase.from("iscrizioni_corso").insert({
          utente_id: utenteId,
          corso_id: corsoId,
          data_acquisto: new Date().toISOString(),
        } as any);
      }

      // 3. Invia email di conferma (opzionale — chiama API interna)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/email/ricevuta`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            utenteId,
            corsoId,
            sessionId: session.id,
          }),
        });
      } catch (emailErr) {
        console.warn("Webhook: errore invio email (non bloccante)", emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Errore webhook Stripe:", error);
    return NextResponse.json(
      { error: error.message ?? "Errore interno" },
      { status: 500 },
    );
  }
}
