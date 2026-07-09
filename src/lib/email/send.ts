import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

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
