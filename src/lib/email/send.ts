import type { Resend } from "resend";

let _resend: Resend | null = null;

async function getResend(): Promise<Resend> {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn("RESEND_API_KEY non configurata — le email non verranno inviate");
      // Restituisce un oggetto finto per non crashare a build time
      return null as unknown as Resend;
    }
    const { Resend: ResendLib } = await import("resend");
    _resend = new ResendLib(key);
  }
  return _resend;
}

/**
 * Invia una email transazionale di conferma acquisto con ricevuta allegata.
 */
export async function sendRicevutaAcquisto({
  to,
  oggetto,
  testo,
  allegatoBase64,
  allegatoFilename,
}: {
  to: string;
  oggetto: string;
  testo: string;
  allegatoBase64?: string;
  allegatoFilename?: string;
}) {
  const attachments = allegatoBase64
    ? [
        {
          filename: allegatoFilename ?? "ricevuta.pdf",
          content: allegatoBase64,
        },
      ]
    : undefined;

  const resend = await getResend();
  if (!resend) {
    console.warn("Resend non configurato — email non inviata");
    return;
  }

  const { error } = await resend.emails.send({
    from: "ConCourse <noreply@concourse.app>",
    to,
    subject: oggetto,
    html: testo,
    attachments: attachments as any,
  });

  if (error) {
    console.error("Errore invio email Resend:", error);
    throw error;
  }
}
