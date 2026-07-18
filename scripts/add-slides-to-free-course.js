const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
let key = env.match(/SUPABASE_SECRET_KEY=(.+)/)?.[1]?.trim();
if (!key) key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Contenuti slide (almeno 10 slide totali su 5 capitoli) ──────────

const slideContent = {
  1: [
    {
      tipo: "slide",
      contenuto:
        "## Principi del Diritto Amministrativo\n\n### Definizione\n\nIl diritto amministrativo è la branca del diritto pubblico che regola l'organizzazione, l'attività e i rapporti della pubblica amministrazione.\n\n### Principi fondamentali\n\n- **Principio di legalità**: ogni azione amministrativa deve trovare fondamento nella legge\n- **Principio di trasparenza**: l'attività amministrativa deve essere conoscibile dai cittadini\n- **Principio di imparzialità**: la PA deve trattare tutti i cittadini in modo equo\n- **Principio di buon andamento**: efficacia, efficienza ed economicità dell'azione amministrativa",
    },
    {
      tipo: "riassunto",
      contenuto:
        "### Riassunto — Principi\n\n- Il diritto amministrativo regola l'organizzazione e l'attività della PA\n- Principi chiave: legalità, trasparenza, imparzialità, buon andamento\n- La legge è il fondamento di ogni azione amministrativa\n- La PA deve operare con efficacia, efficienza ed economicità",
    },
  ],
  2: [
    {
      tipo: "slide",
      contenuto:
        "## Atti Amministrativi\n\n### Definizione\n\nL'atto amministrativo è la manifestazione di volontà della pubblica amministrazione produttiva di effetti giuridici.\n\n### Caratteristiche\n\n- **Unilaterale**: proviene da un solo soggetto (la PA)\n- **Imperativo**: produce effetti indipendentemente dalla volontà del destinatario\n- **Tipico**: corrisponde a uno schema legale prestabilito\n\n### Classificazione\n\n- Atti **vincolati**: la PA deve agire in un unico modo previsto dalla legge\n- Atti **discrezionali**: la PA ha margini di scelta tra più opzioni legittime",
    },
    {
      tipo: "slide",
      contenuto:
        "## Elementi dell'Atto Amministrativo\n\n1. **Soggetto**: l'organo della PA competente\n2. **Contenuto**: la volontà o la dichiarazione di scienza\n3. **Oggetto**: la situazione giuridica su cui l'atto incide\n4. **Forma**: di regola scritta (forma libera salvo diversa previsione)\n5. **Motivazione**: obbligatoria ex art. 3 L. 241/1990",
    },
    {
      tipo: "riassunto",
      contenuto:
        "### Riassunto — Atti Amministrativi\n\n- Atto amministrativo = manifestazione di volontà della PA\n- Caratteristiche: unilaterale, imperativo, tipico\n- Vincolati vs discrezionali\n- Elementi: soggetto, contenuto, oggetto, forma, motivazione\n- Motivazione obbligatoria per legge",
    },
  ],
  3: [
    {
      tipo: "slide",
      contenuto:
        "## Procedimento Amministrativo\n\n### Definizione\n\nIl procedimento amministrativo è la sequenza di atti e operazioni volti all'adozione di un provvedimento finale.\n\n### Fasi del Procedimento\n\n1. **Fase di iniziativa**: avvio del procedimento (istanza di parte o d'ufficio)\n2. **Fase istruttoria**: acquisizione di documenti, pareri, valutazioni\n3. **Fase decisoria**: adozione del provvedimento finale\n4. **Fase integrativa dell'efficacia**: controlli, pubblicità, comunicazioni",
    },
    {
      tipo: "slide",
      contenuto:
        "## Legge 241/1990 — Garanzie Procedimentali\n\n- **Obbligo di procedere**: la PA deve concludere il procedimento\n- **Termini**: ogni procedimento ha un termine (30/90 giorni)\n- **Diritto di accesso**: i cittadini possono accedere ai documenti\n- **Silenzio**: decorsi i termini, il silenzio equivale a inadempimento\n- **Obbligo di motivazione**: ogni provvedimento deve essere motivato\n- **Diritto di partecipazione**: gli interessati possono presentare osservazioni",
    },
    {
      tipo: "riassunto",
      contenuto:
        "### Riassunto — Procedimento\n\n- Il procedimento è una sequenza di atti che porta al provvedimento\n- Fasi: iniziativa, istruttoria, decisoria, integrativa\n- L. 241/1990: garanzie di trasparenza e partecipazione\n- Termini obbligatori, diritto di accesso, obbligo di motivazione",
    },
  ],
  4: [
    {
      tipo: "slide",
      contenuto:
        "## Giustizia Amministrativa\n\n### Definizione\n\nLa giustizia amministrativa è il sistema di tutela dei cittadini avverso gli atti della pubblica amministrazione.\n\n### Strumenti di Tutela\n\n1. **Ricorso amministrativo**: ricorso al superiore gerarchico (Ricorso Gerarchico)\n2. **Ricorso straordinario al Presidente della Repubblica**: per atti definitivi\n3. **Ricorso giurisdizionale**: dinanzi al Giudice Amministrativo (TAR e Consiglio di Stato)",
    },
    {
      tipo: "slide",
      contenuto:
        "## TAR e Consiglio di Stato\n\n### TAR (Tribunale Amministrativo Regionale)\n- Giudice di primo grado per controversie con la PA\n- Competenza territoriale (sede della PA che ha emesso l'atto)\n\n### Consiglio di Stato\n- Giudice di appello avverso le sentenze del TAR\n- Funzione consultiva (pareri su atti normativi e contratti)\n\n### Adunanza Plenaria\n- Risolve i contrasti giurisprudenziali\n- Massime di particolare importanza",
    },
    {
      tipo: "riassunto",
      contenuto:
        "### Riassunto — Giustizia Amministrativa\n\n- Tre livelli di tutela: ricorso amministrativo, straordinario, giurisdizionale\n- TAR = giudice di primo grado\n- Consiglio di Stato = giudice d'appello + funzione consultiva\n- Principali rimedi: annullamento, risarcimento del danno",
    },
  ],
  5: [
    {
      tipo: "slide",
      contenuto:
        "## Organizzazione degli Enti Locali\n\n### Comune\n\nOrgani del Comune:\n- **Consiglio Comunale**: organo di indirizzo e controllo\n- **Giunta Comunale**: organo esecutivo\n- **Sindaco**: capo dell'amministrazione comunale\n\n### Province e Città Metropolitane\n\n- Funzioni di programmazione e coordinamento\n- Gestione di servizi sovracomunali (trasporti, rifiuti, istruzione)",
    },
    {
      tipo: "slide",
      contenuto:
        "## Atti degli Enti Locali\n\n### Deliberazioni\n- Delibere del Consiglio (atti di indirizzo)\n- Delibere della Giunta (atti esecutivi)\n- Determinazioni dei dirigenti (atti gestionali)\n\n### Requisiti\n- Pubblicazione all'Albo Pretorio online\n- Termine di pubblicazione: 15 giorni\n- Diritto di accesso agli atti\n- Controllo di legittimità (eventuale)",
    },
    {
      tipo: "riassunto",
      contenuto:
        "### Riassunto — Enti Locali\n\n- Comune: Consiglio, Giunta, Sindaco\n- Province: funzioni di coordinamento\n- Atti: deliberazioni del Consiglio/Giunta, determinazioni\n- Obbligo di pubblicazione all'Albo Pretorio\n- Diritto di accesso agli atti",
    },
  ],
};

const capitoliData = [
  { titolo: "Principi del Diritto Amministrativo", ordine: 1 },
  { titolo: "Atti Amministrativi", ordine: 2 },
  { titolo: "Procedimento Amministrativo", ordine: 3 },
  { titolo: "Giustizia Amministrativa", ordine: 4 },
  { titolo: "Organizzazione degli Enti Locali", ordine: 5 },
];

async function main() {
  // Trova il concorso "Concorso Comune di Milano"
  const { data: concorso } = await sb
    .from("concorsi")
    .select("id")
    .eq("slug", "concorso-comune-di-milano")
    .single();

  if (!concorso) {
    console.log("❌ Concorso 'Concorso Comune di Milano' non trovato.");
    console.log("   Esegui prima node scripts/seed-demo.js");
    process.exit(1);
  }

  const { data: corsi } = await sb
    .from("corsi")
    .select("id, titolo, prezzo")
    .eq("concorso_id", concorso.id)
    .eq("stato", "pubblicato");

  if (!corsi || corsi.length === 0) {
    console.log("❌ Nessun corso pubblicato trovato per questo concorso.");
    process.exit(1);
  }

  // Prendi il corso gratuito (prezzo = 0), oppure il primo corso
  let corso = null;
  for (var i = 0; i < corsi.length; i++) {
    if (corsi[i].prezzo === 0) { corso = corsi[i]; break; }
  }
  if (!corso) {
    console.log("⚠️  Nessun corso gratuito trovato. Uso il primo corso disponibile.");
    corso = corsi[0];
  }

  console.log('📚 Corso target: "' + corso.titolo + '" (ID: ' + corso.id + ")");
  console.log("💰 Prezzo: " + (corso.prezzo ?? 0));

  // Conta slide esistenti
  const { data: capitoliEsistenti } = await sb
    .from("capitoli")
    .select("id")
    .eq("corso_id", corso.id);

  if (capitoliEsistenti && capitoliEsistenti.length > 0) {
    var capIds = capitoliEsistenti.map(function(c) { return c.id; });
    const { count: slideCount } = await sb
      .from("slide")
      .select("id", { count: "exact", head: true })
      .in("capitolo_id", capIds);

    if (slideCount && slideCount >= 10) {
      console.log("✅ Il corso ha già " + slideCount + " slide — nessuna aggiunta necessaria.");
      process.exit(0);
    }
  }

  // Crea capitoli se non esistono
  var capitoli = [];
  if (!capitoliEsistenti || capitoliEsistenti.length === 0) {
    console.log("📝 Creazione di 5 capitoli...");
    for (var ci = 0; ci < capitoliData.length; ci++) {
      var cap = capitoliData[ci];
      const { data: c, error: ce } = await sb
        .from("capitoli")
        .insert({ corso_id: corso.id, titolo: cap.titolo, ordine: cap.ordine })
        .select("id")
        .single();
      if (ce) {
        console.error("❌ Errore creazione capitolo:", ce.message);
        process.exit(1);
      }
      capitoli.push(c);
      console.log('   ✅ Capitolo creato: "' + cap.titolo + '" (ID: ' + c.id + ")");
    }
  } else {
    // Usa i capitoli esistenti in ordine
    const { data: caps } = await sb
      .from("capitoli")
      .select("id")
      .eq("corso_id", corso.id)
      .order("ordine", { ascending: true });
    capitoli = caps ?? [];
    console.log("📝 Riuso " + capitoli.length + " capitoli esistenti");
  }

  // Per ogni capitolo, conta slide esistenti e aggiungi quelle mancanti
  var totaliAggiunte = 0;
  for (var ci = 0; ci < capitoli.length; ci++) {
    var capId = capitoli[ci].id;
    var slidesDaCreare = slideContent[ci + 1] || [];

    // Conta slide esistenti in questo capitolo
    const { data: slideEsistenti } = await sb
      .from("slide")
      .select("id")
      .eq("capitolo_id", capId);

    var esistenti = slideEsistenti ? slideEsistenti.length : 0;

    if (esistenti >= slidesDaCreare.length) {
      console.log("   Capitolo " + (ci + 1) + ": già " + esistenti + " slide, salta");
      continue;
    }

    // Aggiungi solo le slide mancanti
    for (var sj = esistenti; sj < slidesDaCreare.length; sj++) {
      var slide = slidesDaCreare[sj];
      const { error: se } = await sb.from("slide").insert({
        capitolo_id: capId,
        ordine: sj + 1,
        contenuto: slide.contenuto,
        tipo: slide.tipo,
      });
      if (se) {
        console.error("❌ Errore creazione slide:", se.message);
      } else {
        totaliAggiunte++;
      }
    }

    console.log("   Capitolo " + (ci + 1) + ": aggiunte " + (slidesDaCreare.length - esistenti) + " slide (totale: " + Math.max(esistenti, slidesDaCreare.length) + ")");
  }

  console.log("\n✅ Totale slide aggiunte: " + totaliAggiunte);
  console.log("   Corso: /corsi/" + corso.id + "/player");
}

main().catch(console.error);
