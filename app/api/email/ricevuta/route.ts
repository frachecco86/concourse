import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendRicevutaAcquisto } from "@/lib/email/send";
import { generaHtmlRicevuta, salvaRicevutaSuStorage, DatiFattura } from "@/lib/fattura/genera";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * POST /api/email/ricevuta
 *
 * Genera e invia la ricevuta di acquisto per un pagamento completato.
 * Body: { utenteId, corsoId, sessionId }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { utenteId, corsoId, sessionId } = body;

    if (!utenteId || !corsoId) {
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });

    // Recupera dati
    const { data: profilo } = await supabase
      .from("utenti_profili")
      .select("nome, cognome, dati_fatturazione, email")
      .eq("id", utenteId)
      .single();

    const { data: corso } = await supabase
      .from("corsi")
      .select("titolo, prezzo")
      .eq("id", corsoId)
      .single();

    const { data: acquisto } = await supabase
      .from("acquisti")
      .select("provider_payment_id, receipt_email")
      .eq("stripe_session_id", sessionId)
      .single();

    if (!profilo || !corso || !acquisto) {
      return NextResponse.json({ error: "Dati non trovati" }, { status: 404 });
    }

    // Recupera email utente da auth.users
    const { data: user } = await supabase.auth.admin.getUserById(utenteId);
    const email = user?.user?.email ?? acquisto.receipt_email ?? "";

    if (!email) {
      return NextResponse.json({ error: "Email non trovata" }, { status: 400 });
    }

    // Prepara dati fattura
    const df = profilo.dati_fatturazione as Record<string, any> | null;
    const datiFattura: DatiFattura = {
      numero: `INV-${new Date().toISOString().slice(0, 10)}-${sessionId.slice(-8)}`,
      data: new Date().toISOString(),
      cliente: {
        nome: profilo.nome,
        cognome: profilo.cognome,
        email,
        ragioneSociale: df?.ragione_sociale as string | null ?? null,
        cf: df?.cf as string | null ?? null,
        pIva: df?.p_iva as string | null ?? null,
        indirizzo: df?.indirizzo as string | null ?? null,
      },
      corso: {
        titolo: corso.titolo,
        prezzo: corso.prezzo ?? 0,
      },
      pagamento: {
        metodo: "Stripe",
        idTransazione: acquisto.provider_payment_id ?? sessionId,
      },
    };

    // Genera HTML ricevuta
    const html = generaHtmlRicevuta(datiFattura);

    // Salva su Storage
    const percorso = `ricevute/${utenteId}/${sessionId}.html`;
    let fatturaUrl = "";
    try {
      fatturaUrl = await salvaRicevutaSuStorage(html, percorso);
    } catch (storageErr) {
      console.warn("Errore salvataggio ricevuta su storage (non bloccante):", storageErr);
    }

    // Aggiorna acquisto con URL fattura
    if (fatturaUrl) {
      await supabase
        .from("acquisti")
        .update({ fattura_url: fatturaUrl } as any)
        .eq("stripe_session_id", sessionId);
    }

    // Invia email con ricevuta
    try {
      await sendRicevutaAcquisto({
        to: email,
        oggetto: `✅ Ricevuta d'acquisto — ${corso.titolo}`,
        testo: `
          <h1>Grazie per l'acquisto!</h1>
          <p>Ciao ${profilo.nome}, hai acquistato il corso <strong>${corso.titolo}</strong>.</p>
          <p>Importo pagato: €${corso.prezzo?.toFixed(2) ?? "0.00"}</p>
          <p>Puoi accedere al corso dalla tua area personale:</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/miei-corsi"
             style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:white;text-decoration:none;border-radius:8px;margin:16px 0;">
            Vai ai tuoi corsi
          </a>
          <p>La ricevuta è disponibile nella tua area personale.</p>
          <p style="color:#666;font-size:12px;">ConCourse — Preparazione ai concorsi pubblici</p>
        `,
        allegatoBase64: Buffer.from(html).toString("base64"),
        allegatoFilename: `ricevuta-${sessionId.slice(-8)}.html`,
      });
    } catch (emailErr) {
      console.warn("Errore invio email ricevuta (non bloccante):", emailErr);
    }

    return NextResponse.json({ success: true, fatturaUrl });
  } catch (error: any) {
    console.error("Errore API ricevuta:", error);
    return NextResponse.json(
      { error: error.message ?? "Errore interno" },
      { status: 500 },
    );
  }
}
