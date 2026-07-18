/**
 * Script per generare quiz automaticamente usando LLM
 * Endpoint: http://alessandros-macbook-pro-4.tailc9d047.ts.net:8000/v1/chat/completions
 * 
 * Uso: pnpm tsx scripts/generate-quiz.ts <capitolo_id> <titolo_capitolo>
 */

import { createClient } from '@supabase/supabase-js';

// ─── Configurazione LLM (local) ──────────────────────────────────────
const LLM_ENDPOINT = 'http://alessandros-macbook-pro-4.tailc9d047.ts.net:8000/v1/chat/completions';
const LLM_MODEL = 'llama-3.2-3b-instruct'; // Modifica se necessario

// ─── Configurazione Supabase ────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere impostate');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Tipi ─────────────────────────────────────────────────────────────

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: LLMMessage;
    finish_reason: string;
  }[];
}

interface Quiz {
  id?: string;
  capitolo_id: string;
  titolo: string;
}

interface Domanda {
  id?: string;
  quiz_id?: string;
  testo: string;
  tipo: 'scelta_multipla';
  opzioni: string[];
  risposta_corretta: string;
  spiegazione: string;
}

// ─── Funzioni helper ─────────────────────────────────────────────────

async function generateQuizWithLLM(
  titoloCapitolo: string,
  contenutoSlide: string[]
): Promise<{ quiz: Quiz; domande: Domanda[] }> {
  const prompt = `
Sei un esperto di diritto amministrativo e devi creare un quiz da 5 domande a scelta multipla per verificare la comprensione di un capitolo didattico.

CAPITOLO: ${titoloCapitolo}

CONTENUTO DELLE SLIDE:
${contenutoSlide.map((c, i) => `--- Slide ${i + 1} ---\n${c}`).join('\n\n')}

REQUISITI DEL QUIZ:
1. Crea UN TITOLO per il quiz (max 60 caratteri)
2. Genera ESATTAMENTE 5 domande
3. Ogni domanda deve avere:
   - TESTO della domanda chiaro e conciso
   - 4 OPZIONI (A, B, C, D) come array di stringhe
   - RISPOSTA_CORRETTA: esattamente una delle 4 opzioni
   - SPIEGAZIONE: spiegazione dettagliata (2-3 righe)

FORMATO DI RISPOSTA:
Restituisci SOLO JSON valido con questa struttura:
{
  "titolo": "Titolo del quiz",
  "domande": [
    {
      "testo": "Domanda?",
      "opzioni": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
      "risposta_corretta": "Opzione A",
      "spiegazione": "Spiegazione dettagliata..."
    }
  ]
}

IMPORTANTE: Non aggiungere testo extra oltre il JSON.
`;

  const request: LLMRequest = {
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: 'Sei un assistente specializzato nella creazione di quiz didattici. Restituisci solo JSON valido.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };

  try {
    console.log('📤 Invio richiesta all\'LLM...');
    const response = await fetch(LLM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`LLM error: ${response.status} ${response.statusText}`);
    }

    const data: LLMResponse = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Nessuna risposta dall\'LLM');
    }

    // Parse JSON (potrebbe essere racchiuso in markdown ```json ... ```)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Impossibile parsare la risposta JSON dall\'LLM');
    }

    const quizData = JSON.parse(jsonMatch[1]);
    
    return {
      quiz: { titolo: quizData.titolo, capitolo_id: '' },
      domande: quizData.domande.map((d: any) => ({
        testo: d.testo,
        tipo: 'scelta_multipla',
        opzioni: d.opzioni,
        risposta_corretta: d.risposta_corretta,
        spiegazione: d.spiegazione
      }))
    };

  } catch (error) {
    console.error('❌ Errore durante la generazione LLM:', error);
    throw error;
  }
}

async function saveQuizToDatabase(
  capitoloId: string,
  quizData: { quiz: Quiz; domande: Domanda[] }
) {
  const { quiz, domande } = quizData;

  // Insert quiz
  const { data: quizResult, error: quizError } = await supabase
    .from('quiz')
    .insert([{ capitolo_id: capitoloId, titolo: quiz.titolo }])
    .select()
    .single();

  if (quizError) {
    console.error('❌ Errore inserimento quiz:', quizError);
    throw quizError;
  }

  console.log(`✓ Quiz creato: ${quizResult.titolo} (ID: ${quizResult.id})`);

  // Insert domande
  const domandeConQuizId = domande.map(d => ({
    quiz_id: quizResult.id,
    testo: d.testo,
    tipo: d.tipo,
    opzioni: JSON.stringify(d.opzioni),
    risposta_corretta: d.risposta_corretta,
    spiegazione: d.spiegazione
  }));

  const { error: domandeError } = await supabase
    .from('domande')
    .insert(domandeConQuizId);

  if (domandeError) {
    console.error('❌ Errore inserimento domande:', domandeError);
    throw domandeError;
  }

  console.log(`✓ ${domande.length} domande inserite`);
}

// ─── Funzione principale ─────────────────────────────────────────────

async function main() {
  const capitoloId = process.argv[2];
  const titoloCapitolo = process.argv[3];

  if (!capitoloId || !titoloCapitolo) {
    console.error('Uso: pnpm tsx scripts/generate-quiz.ts <capitolo_id> <titolo_capitolo>');
    console.error('Esempio: pnpm tsx scripts/generate-quiz.ts "123e...456" "Principi generali del diritto amministrativo"');
    process.exit(1);
  }

  console.log(`\n🔍 Generazione quiz per capitolo: ${titoloCapitolo} (ID: ${capitoloId})\n`);

  // Load slides content
  const { data: slides, error: slideError } = await supabase
    .from('slide')
    .select('contenuto, ordine')
    .eq('capitolo_id', capitoloId)
    .order('ordine', { ascending: true });

  if (slideError) {
    console.error('❌ Errore caricamento slide:', slideError);
    process.exit(1);
  }

  if (slides.length === 0) {
    console.error('❌ Nessuna slide trovata per questo capitolo');
    process.exit(1);
  }

  const contenutoSlide = slides.map((s: any) => s.contenuto);

  console.log(`📊 Caricate ${slides.length} slide\n`);

  try {
    // Generate quiz with LLM
    const quizData = await generateQuizWithLLM(titoloCapitolo, contenutoSlide);
    console.log('\n✅ Quiz generato dall\'LLM');
    console.log(`   Titolo: ${quizData.quiz.titolo}`);
    console.log(`   Domande: ${quizData.domande.length}\n`);

    // Save to database
    await saveQuizToDatabase(capitoloId, quizData);

    console.log('\n🎉 Quiz salvato nel database!\n');

  } catch (error) {
    console.error('\n❌ Errore durante la generazione del quiz:', error);
    process.exit(1);
  }
}

main();
