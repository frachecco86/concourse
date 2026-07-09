/**
 * Genera una ricevuta/fattura semplice in HTML (poi convertita in PDF via
 * puppeteer in produzione, o salvata come HTML per ora).
 *
 * In una prima versione generiamo HTML che può essere inviato via email
 * e/o salvato su Storage come PDF.
 */

export interface DatiFattura {
  numero: string;
  data: string;
  cliente: {
    nome: string;
    cognome: string;
    email: string;
    ragioneSociale?: string | null;
    cf?: string | null;
    pIva?: string | null;
    indirizzo?: string | null;
  };
  corso: {
    titolo: string;
    prezzo: number;
  };
  pagamento: {
    metodo: string;
    idTransazione: string;
  };
}

export function generaHtmlRicevuta(dati: DatiFattura): string {
  const prezzoFormattato = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(dati.corso.prezzo);

  const dataFormattata = new Date(dati.data).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; color: #1a1a1a; margin: 40px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .header { border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; margin-bottom: 20px; }
    .header img { width: 120px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f5f5f5; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
    .totale { font-size: 18px; font-weight: bold; text-align: right; padding-top: 16px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #e5e5e5; padding-top: 16px; }
    .info { margin: 12px 0; }
    .info strong { display: inline-block; width: 140px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ConCourse</h1>
    <p style="color:#666;font-size:14px;">Preparazione ai concorsi pubblici italiani</p>
  </div>

  <h1>Ricevuta di Acquisto</h1>
  <p style="color:#666;">N. ${dati.numero} — ${dataFormattata}</p>

  <div class="info">
    <p><strong>Cliente:</strong> ${dati.cliente.nome} ${dati.cliente.cognome}</p>
    <p><strong>Email:</strong> ${dati.cliente.email}</p>
    ${
      dati.cliente.ragioneSociale
        ? `<p><strong>Ragione sociale:</strong> ${dati.cliente.ragioneSociale}</p>`
        : ""
    }
    ${
      dati.cliente.cf
        ? `<p><strong>Codice fiscale:</strong> ${dati.cliente.cf}</p>`
        : ""
    }
    ${
      dati.cliente.pIva
        ? `<p><strong>P.IVA:</strong> ${dati.cliente.pIva}</p>`
        : ""
    }
  </div>

  <table>
    <thead>
      <tr>
        <th>Descrizione</th>
        <th>Importo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Corso: ${dati.corso.titolo}</td>
        <td>${prezzoFormattato}</td>
      </tr>
    </tbody>
  </table>

  <div class="totale">Totale pagato: ${prezzoFormattato}</div>

  <div class="info">
    <p><strong>Pagamento:</strong> ${dati.pagamento.metodo}</p>
    <p><strong>ID transazione:</strong> ${dati.pagamento.idTransazione}</p>
  </div>

  <div class="footer">
    <p>ConCourse — Preparazione ai concorsi pubblici italiani</p>
    <p>Questa ricevuta è valida come documento di avvenuto pagamento.</p>
  </div>
</body>
</html>`;
}

/**
 * Salva la ricevuta su Supabase Storage come PDF.
 * Nota: in produzione si può usare puppeteer/html-pdf o un servizio esterno.
 * Per ora salviamo l'HTML su Storage (convertibile in PDF lato server).
 */
export async function salvaRicevutaSuStorage(
  html: string,
  percorso: string,
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

  // Salva come HTML sul bucket 'ricevute'
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/ricevute/${percorso}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "x-upsert": "true",
      },
      body: html,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Errore salvataggio ricevuta: ${response.status} ${response.statusText}`,
    );
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/ricevute/${percorso}`;
  return publicUrl;
}
