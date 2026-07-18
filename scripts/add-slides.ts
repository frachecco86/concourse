/**
 * Aggiunge slide extra ai capitoli del corso gratuito "Diritto Amministrativo"
 * Aumenta da 14 a ~24 slide totali
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere impostate');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Contenuto extra slide per i capitoli
const EXTRA_CONTENT: Record<string, string[]> = {
  'Principi del Diritto Amministrativo': [
    `### Ruolo della Giurisprudenza

La giurisprudenza svolge un ruolo fondamentale nell'interpretazione e applicazione dei principi del diritto amministrativo.

- **Sentenze della Corte Costituzionale**: stabiliscono i limiti costituzionali
- **Sentenze del Consiglio di Stato**: forniscono orientamenti interpretativi
- **Sentenze dei TAR**: applicano i principi ai casi concreti`,
    `### Principi Comunitari e Internazionali

I principi dell'Unione Europea influenzano direttamente il diritto amministrativo nazionale.

- **Principio di leale collaborazione**: Stato e UE cooperano reciprocamente
- **Principio di sussidiarietà**: intervento solo se necessario a livello UE
- **Principio di proporzionalità**: misure adeguate e necessarie`,
  ],
      'Atti Amministrativi': [
    `### Atti Normativi vs Atti Individuali

Distinzione fondamentale tra atti che creano norme e atti che si applicano a casi concreti.

- **Attini normativi**: creano regole generali (decreti, regolamenti)
- **Attivà individuali**: si applicano a situazioni specifiche (provvedimenti)`,
    `### Efficacia dell'Atto Amministrativo

L'atto amministrativo produce effetti giuridici solo dopo essere divenuto efficace.

- **Efficacia interina**: effetti provvisori
- **Efficacia permanente**: effetti definitivi
- **Efficacia ex tunc**: retroattività in caso di annullamento`,
  ],
  'Procedimento Amministrativo': [
    `### Scienza e Volontà nell'Atto Amministrativo

L'atto amministrativo può basarsi su:
- **Scienza**: constatazione di fatti oggettivi (es. rilevamento tecniche)
- **Volontà**: scelta discrezionale dell'amministrazione`,
    `### Principio del Contraddittorio

Fondamentale per la tutela dei diritti degli interessati.

- **Preavviso**: comunicazione all'interessato dell'intenzione di adottare l'atto
- **Diritto di difesa**: possibilità di presentare osservazioni e prove
- **Decisione motivata**: spiegazione delle ragioni della decisione finale`,
  ],
  'Giustizia Amministrativa': [
    `### Principio del Giudice Naturale

Nessuno può essere privato del giudice naturalmente preposto.

- **Vincolo alla competenza**: non si può deviare dalla competenza legale
- **Divieto di giudice straordinario**: non si istituiscono tribunali speciali`,
    `### Tutela Cautionale

La giurisdizione amministrativa garantisce anche con misure cautelari.

- **Interdizione**: sospende gli effetti dell'atto impugnato
- **Inibitoria**: vieta l'esecuzione dell'atto
- **Conservativa**: mantiene lo status quo`,
  ],
  'Organizzazione degli Enti Locali': [
    `### Forme di Democrazia Partecipativa

Oltre al voto, i cittadini possono partecipare alla vita pubblica.

- **Consultazioni popolari**: richiesta di pareri all'elettorato
- **Iniziative legislative popolari**: proposta di legge da parte dei cittadini
- **Referendum consultivi**: consultazione sull'importanza di una decisione`,
    `### Controllo di Legittimità sugli Atti Locali

L'amministrazione locale è soggetta a controllo giuridico.

- **Controllo di legittimità ex art. 120 Cost.**: verifica compatibilità con la legge
- **Ricorso gerarchico**: verso l'autorità superiore
- **Tutela giurisdizionale**: dinanzi al TAR`,
  ],
};

async function addExtraSlides() {
  console.log('🔍 Ricerca corso gratuito...');
  
  const { data: corsi, error: corsiError } = await supabase
    .from('corsi')
    .select('id, titolo')
    .eq('prezzo', 0)
    .single();

  if (corsiError || !corsi) {
    console.error('❌ Errore ricerca corso:', corsiError?.message);
    process.exit(1);
  }

  console.log(`✓ Corso trovato: ${corsi.titolo} (ID: ${corsi.id})\n`);

  const { data: capitoli, error: capError } = await supabase
    .from('capitoli')
    .select('id, titolo, ordine')
    .eq('corso_id', corsi.id)
    .order('ordine', { ascending: true });

  if (capError || !capitoli) {
    console.error('❌ Errore ricerca capitoli:', capError?.message);
    process.exit(1);
  }

  console.log(`📊 Trovati ${capitoli.length} capitoli\n`);

  for (const cap of capitoli) {
    const extra = EXTRA_CONTENT[cap.titolo];
    
    if (!extra || extra.length === 0) {
      console.log(`⏭️  Nessuna slide extra per: ${cap.titolo}`);
      continue;
    }

    console.log(`📝 Aggiungo ${extra.length} slide extra per: ${cap.titolo}`);

    for (let i = 0; i < extra.length; i++) {
      const { error } = await supabase
        .from('slide')
        .insert({
          capitolo_id: cap.id,
          ordine: 100 + i, // Slide extra alla fine
          contenuto: extra[i],
          tipo: 'slide'
        });

      if (error) {
        console.error(`  ❌ Errore inserimento slide ${i + 1}:`, error.message);
      } else {
        console.log(`  ✓ Slide ${i + 1}/${extra.length} aggiunta`);
      }
    }

    console.log();
  }

  // Verifica finale
  const { count, error: countError } = await supabase
    .from('slide')
    .select('*', { count: 'exact', head: true })
    .eq('capitolo_id', capitoli[0]?.id);

  if (!countError && count) {
    console.log(`✅ Totale slide nel primo capitolo: ${count}`);
  }
}

addExtraSlides();
