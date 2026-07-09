/**
 * Pipeline di generazione AI:
 * 1. Download PDF da Supabase Storage
 * 2. Estrazione testo
 * 3. Chiamata LLM con prompt strutturato
 * 4. Salvataggio capitoli, slide, quiz in bozza
 */

import { createServerClient } from "@supabase/ssr";
import { callLLM } from "./provider";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

// Usa secret key per operazioni admin (bypassa RLS)
function createAdminClient() {
  return createServerClient(supabaseUrl, supabaseSecretKey, {
    cookies: { getAll: () => ({} as any), setAll: () => {} },
  });
}

/**
 * Estrae il testo da un file PDF usando pdf-parse.
 */
async function extractTextFromPDF(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);

  const arrayBuffer = await response.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);

  // pdf-parse è ESM-only, usiamo dynamic import
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: pdfBuffer });
  const data = await parser.getText();

  return data.text;
}

/**
 * Prompt strutturato per generare materiale didattico.
 */
function buildGenerationPrompt(
  materiaNome: string,
  testoEstratto: string,
  tipo: string
): { system: string; user: string } {
  const systemPrompt = `Sei un docente specializzato nella preparazione ai concorsi pubblici italiani.

Genera materiale didattico strutturato in formato JSON. Non inventare informazioni — usa solo il contenuto del documento fornito.

Il JSON deve avere questa struttura:
{
  "capitoli": [
    {
      "titolo": "Titolo capitolo",
      "slide": [
        {
          "ordine": 1,
          "tipo": "slide",
          "contenuto": "Contenuto della slide in markdown, con titolo ## e paragrafi"
        },
        {
          "ordine": 2,
          "tipo": "riassunto",
          "contenuto": "Riassunto dei punti chiave in markdown, stile bullet points"
        }
      ],
      "quiz": {
        "titolo": "Quiz capitolo",
        "domande": [
          {
            "testo": "Domanda a scelta multipla",
            "opzioni": ["A) Opzione 1", "B) Opzione 2", "C) Opzione 3", "D) Opzione 4"],
            "risposta_corretta": "A",
            "spiegazione": "Spiegazione della risposta corretta"
          }
        ]
      }
    }
  ]
}

Regole:
- Ogni capitolo deve avere 3-8 slide (alternando slide e riassunto)
- Ogni capitolo deve avere 3-5 domande a scelta multipla
- Il contenuto didattico deve essere accurato e basato sul documento
- Usa markdown per il contenuto delle slide
- La spiegazione delle domande deve essere didattica e utile
- Scrivi tutto in italiano`;

  const userPrompt = `Documento tipo "${tipo}" per la materia "${materiaNome}".

Testo estratto dal documento:
${testoEstratto.slice(0, 50000)}

Genera il materiale didattico seguendo la struttura JSON specificata.`;

  return { system: systemPrompt, user: userPrompt };
}

/**
 * Avvia la pipeline completa per un concorso.
 * Cerca materiali_origine in stato 'in_coda', estrae il testo,
 * chiama LLM, salva capitoli/slide/quiz in bozza.
 */
export async function eseguiPipeline(
  concorsoId: string,
  materiaId?: string | null
): Promise<void> {
  const supabase = createAdminClient();

  // Trova materiali in coda
  let query = supabase
    .from("materiali_origine")
    .select("*, concorsi!inner(titolo), materie!inner(nome)")
    .eq("concorso_id", concorsoId)
    .eq("stato_elaborazione", "in_coda");

  if (materiaId) {
    query = query.eq("materia_id", materiaId);
  }

  const { data: materiali, error } = await query;

  if (error || !materiali || materiali.length === 0) {
    console.log(`Nessun materiale in coda per concorso ${concorsoId}`);
    return;
  }

  // Prendi il primo materiale (o merge di tutti)
  const materiale = materiali[0] as any;
  const materiaNome = materiale.materie?.nome ?? "Materia";
  const concorsoTitolo = materiale.concorsi?.titolo ?? "Concorso";

  try {
    // 1. Estrai testo dal PDF
    console.log(`Estraendo testo da: ${materiale.file_url}`);
    const testoEstratto = await extractTextFromPDF(materiale.file_url);
    console.log(`Testo estratto: ${testoEstratto.length} caratteri`);

    // 2. Genera materiale con LLM
    const prompt = buildGenerationPrompt(materiaNome, testoEstratto, materiale.tipo);
    const llmResponse = await callLLM(prompt.system, prompt.user, {
      temperature: 0.7,
      maxTokens: 8192,
    });

    // 3. Parsa il JSON dalla risposta LLM
    const parsed = parseLLMResponse(llmResponse.content);

    if (!parsed) {
      throw new Error("Impossibile parsare la risposta LLM");
    }

    // 4. Trova o crea corso
    const corsoId = await trovaOCreaCorso(supabase, concorsoId, materiaId, concorsoTitolo, materiaNome);

    // 5. Salva capitoli, slide, quiz
    for (const capitolo of parsed.capitoli) {
      const { data: capRow } = await supabase
        .from("capitoli")
        .insert({ corso_id: corsoId, ordine: 1, titolo: capitolo.titolo } as any)
        .select("id")
        .single();

      if (!capRow) continue;
      const capitoloId = capRow.id;

      for (const slide of capitolo.slide) {
        await supabase.from("slide").insert({
          capitolo_id: capitoloId,
          ordine: slide.ordine,
          contenuto: slide.contenuto,
          tipo: slide.tipo,
        } as any);
      }

      // Crea quiz
      if (capitolo.quiz) {
        const { data: quizRow } = await supabase
          .from("quiz")
          .insert({ capitolo_id: capitoloId, titolo: capitolo.quiz.titolo } as any)
          .select("id")
          .single();

        if (quizRow) {
          for (const domanda of capitolo.quiz.domande) {
            await supabase.from("domande").insert({
              quiz_id: quizRow.id,
              testo: domanda.testo,
              tipo: "scelta_multipla",
              opzioni: domanda.opzioni,
              risposta_corretta: domanda.risposta_corretta,
              spiegazione: domanda.spiegazione,
            } as any);
          }
        }
      }
    }

    // 6. Segna materiale come elaborato
    await supabase
      .from("materiali_origine")
      .update({ stato_elaborazione: "elaborato" } as any)
      .eq("id", materiale.id);

    console.log(`Pipeline completata per materiale ${materiale.id}`);
  } catch (err) {
    console.error(`Errore pipeline materiale ${materiale.id}:`, err);

    await supabase
      .from("materiali_origine")
      .update({ stato_elaborazione: "errore" } as any)
      .eq("id", materiale.id);
  }
}

/**
 * Trova un corso esistente per concorso+materia, o crealo.
 */
async function trovaOCreaCorso(
  supabase: ReturnType<typeof createServerClient>,
  concorsoId: string,
  materiaId: string | null | undefined,
  concorsoTitolo: string,
  materiaNome: string
): Promise<string> {
  // Cerca corso esistente
  const { data: corsi } = await supabase
    .from("corsi")
    .select("id")
    .eq("concorso_id", concorsoId)
    .eq("materia_id", materiaId ?? "")
    .limit(1);

  if (corsi && corsi.length > 0) {
    return corsi[0].id;
  }

  // Crea nuovo corso in bozza
  const titolo = materiaId
    ? `${materiaNome} — ${concorsoTitolo}`
    : concorsoTitolo;

  const { data: corso } = await supabase
    .from("corsi")
    .insert({
      materia_id: materiaId ?? "",
      concorso_id: concorsoId,
      titolo,
      stato: "bozza",
    } as any)
    .select("id")
    .single();

  return corso!.id;
}

/**
 * Prova a parsare JSON dalla risposta LLM, gestendo markdown code block.
 */
function parseLLMResponse(content: string): {
  capitoli: Array<{
    titolo: string;
    slide: Array<{ ordine: number; tipo: string; contenuto: string }>;
    quiz: { titolo: string; domande: Array<{ testo: string; opzioni: string[]; risposta_corretta: string; spiegazione: string }> } | null;
  }>;
} | null {
  // Cerca blocco JSON (```json ... ``` o {...})
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : content;

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Prova a trovare un oggetto JSON nel testo
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {}
    }
    return null;
  }
}
