const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SECRET_KEY=(.+)/)?.[1]?.trim();

if (!key) {
  key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
}

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Create materia
  const { data: mat, error: me } = await sb
    .from("materie")
    .insert({
      nome: "Diritto Amministrativo",
      descrizione:
        "Principi e nozioni fondamentali del diritto amministrativo italiano",
    })
    .select("id")
    .single();
  if (me) {
    console.error("Materia error:", me);
    return;
  }
  console.log("✅ Materia creata:", mat.id);

  // 2. Create concorso
  const { data: conc, error: ce } = await sb
    .from("concorsi")
    .insert({
      titolo: "Concorso Comune di Milano",
      ente: "Comune di Milano",
      descrizione:
        "Concorso pubblico per assunzioni presso il Comune di Milano. Prove su diritto amministrativo, costituzionale e organizzazione degli enti locali.",
      stato: "aperto",
      slug: "concorso-comune-di-milano",
      data_scadenza_bando: "2026-09-30",
      numero_posti: 25,
      link_bando_ufficiale: "https://www.comune.milano.it/concorsi",
    })
    .select("id")
    .single();
  if (ce) {
    console.error("Concorso error:", ce);
    return;
  }
  console.log("✅ Concorso creato:", conc.id);

  // 3. Create corso
  const { data: corso, error: coe } = await sb
    .from("corsi")
    .insert({
      titolo: "Diritto Amministrativo \u2014 Concorso Comune di Milano",
      descrizione:
        "Corso completo di diritto amministrativo: principi, procedimenti, atti, giustizia amministrativa e organizzazione degli enti locali.",
      materia_id: mat.id,
      concorso_id: conc.id,
      stato: "pubblicato",
      prezzo: 29.90,
    })
    .select("id")
    .single();
  if (coe) {
    console.error("Corso error:", coe);
    return;
  }
  console.log("✅ Corso creato:", corso.id);

  // 4. Create capitoli
  const capitoliData = [
    { titolo: "Principi del Diritto Amministrativo", ordine: 1 },
    { titolo: "Atti Amministrativi", ordine: 2 },
    { titolo: "Procedimento Amministrativo", ordine: 3 },
    { titolo: "Giustizia Amministrativa", ordine: 4 },
    { titolo: "Organizzazione degli Enti Locali", ordine: 5 },
  ];

  const capitoli = [];
  for (const cap of capitoliData) {
    const { data: c, error: ce2 } = await sb
      .from("capitoli")
      .insert({ corso_id: corso.id, ...cap })
      .select("id")
      .single();
    if (ce2) {
      console.error("Capitolo error:", ce2);
      return;
    }
    capitoli.push(c);
    console.log("  Capitolo creato:", c.id, cap.titolo);
  }

  // 5. Create slides per capitolo
  const slideContent = {
    1: [
      {
        tipo: "slide",
        contenuto:
          "## Principi del Diritto Amministrativo\n\n### Definizione\n\nIl diritto amministrativo \u00e8 la branca del diritto pubblico che regola l\u2019organizzazione, l\u2019attivit\u00e0 e i rapporti della pubblica amministrazione.\n\n### Principi fondamentali\n\n- **Principio di legalit\u00e0**: ogni azione amministrativa deve trovare fondamento nella legge\n- **Principio di trasparenza**: l\u2019attivit\u00e0 amministrativa deve essere conoscibile dai cittadini\n- **Principio di imparzialit\u00e0**: la PA deve trattare tutti i cittadini in modo equo\n- **Principio di buon andamento**: efficacia, efficienza ed economicit\u00e0 dell\u2019azione amministrativa",
      },
      {
        tipo: "riassunto",
        contenuto:
          "### Riassunto \u2014 Principi\n\n- Il diritto amministrativo regola l\u2019organizzazione e l\u2019attivit\u00e0 della PA\n- Principi chiave: legalit\u00e0, trasparenza, imparzialit\u00e0, buon andamento\n- La legge \u00e8 il fondamento di ogni azione amministrativa\n- La PA deve operare con efficacia, efficienza ed economicit\u00e0",
      },
    ],
    2: [
      {
        tipo: "slide",
        contenuto:
          "## Atti Amministrativi\n\n### Definizione\n\nL\u2019atto amministrativo \u00e8 la manifestazione di volont\u00e0 della pubblica amministrazione produttiva di effetti giuridici.\n\n### Caratteristiche\n\n- **Unilaterale**: proviene da un solo soggetto (la PA)\n- **Imperativo**: produce effetti indipendentemente dalla volont\u00e0 del destinatario\n- **Tipico**: corrisponde a uno schema legale prestabilito\n\n### Classificazione\n\n- Atti **vincolati**: la PA deve agire in un unico modo previsto dalla legge\n- Atti **discrezionali**: la PA ha margini di scelta tra pi\u00f9 opzioni legittime",
      },
      {
        tipo: "slide",
        contenuto:
          "## Elementi dell\u2019Atto Amministrativo\n\n1. **Soggetto**: l\u2019organo della PA competente\n2. **Contenuto**: la volont\u00e0 o la dichiarazione di scienza\n3. **Oggetto**: la situazione giuridica su cui l\u2019atto incide\n4. **Forma**: di regola scritta (forma libera salvo diversa previsione)\n5. **Motivazione**: obbligatoria ex art. 3 L. 241/1990",
      },
      {
        tipo: "riassunto",
        contenuto:
          "### Riassunto \u2014 Atti Amministrativi\n\n- Atto amministrativo = manifestazione di volont\u00e0 della PA\n- Caratteristiche: unilaterale, imperativo, tipico\n- Vincolati vs discrezionali\n- Elementi: soggetto, contenuto, oggetto, forma, motivazione\n- Motivazione obbligatoria per legge",
      },
    ],
    3: [
      {
        tipo: "slide",
        contenuto:
          "## Procedimento Amministrativo\n\n### Definizione\n\nIl procedimento amministrativo \u00e8 la sequenza di atti e operazioni volti all\u2019adozione di un provvedimento finale.\n\n### Fasi del Procedimento\n\n1. **Fase di iniziativa**: avvio del procedimento (istanza di parte o d\u2019ufficio)\n2. **Fase istruttoria**: acquisizione di documenti, pareri, valutazioni\n3. **Fase decisoria**: adozione del provvedimento finale\n4. **Fase integrativa dell\u2019efficacia**: controlli, pubblicit\u00e0, comunicazioni",
      },
      {
        tipo: "slide",
        contenuto:
          "## Legge 241/1990 \u2014 Garanzie Procedimentali\n\n- **Obbligo di procedere**: la PA deve concludere il procedimento\n- **Termini**: ogni procedimento ha un termine (30/90 giorni)\n- **Diritto di accesso**: i cittadini possono accedere ai documenti\n- **Silenzio**: decorsi i termini, il silenzio equivale a inadempimento\n- **Obbligo di motivazione**: ogni provvedimento deve essere motivato\n- **Diritto di partecipazione**: gli interessati possono presentare osservazioni",
      },
      {
        tipo: "riassunto",
        contenuto:
          "### Riassunto \u2014 Procedimento\n\n- Il procedimento \u00e8 una sequenza di atti che porta al provvedimento\n- Fasi: iniziativa, istruttoria, decisoria, integrativa\n- L. 241/1990: garanzie di trasparenza e partecipazione\n- Termini obbligatori, diritto di accesso, obbligo di motivazione",
      },
    ],
    4: [
      {
        tipo: "slide",
        contenuto:
          "## Giustizia Amministrativa\n\n### Definizione\n\nLa giustizia amministrativa \u00e8 il sistema di tutela dei cittadini avverso gli atti della pubblica amministrazione.\n\n### Strumenti di Tutela\n\n1. **Ricorso amministrativo**: ricorso al superiore gerarchico (Ricorso Gerarchico)\n2. **Ricorso straordinario al Presidente della Repubblica**: per atti definitivi\n3. **Ricorso giurisdizionale**: dinanzi al Giudice Amministrativo (TAR e Consiglio di Stato)",
      },
      {
        tipo: "slide",
        contenuto:
          "## TAR e Consiglio di Stato\n\n### TAR (Tribunale Amministrativo Regionale)\n- Giudice di primo grado per controversie con la PA\n- Competenza territoriale (sede della PA che ha emesso l\u2019atto)\n\n### Consiglio di Stato\n- Giudice di appello avverso le sentenze del TAR\n- Funzione consultiva (pareri su atti normativi e contratti)\n\n### Adunanza Plenaria\n- Risolve i contrasti giurisprudenziali\n- Massime di particolare importanza",
      },
      {
        tipo: "riassunto",
        contenuto:
          "### Riassunto \u2014 Giustizia Amministrativa\n\n- Tre livelli di tutela: ricorso amministrativo, straordinario, giurisdizionale\n- TAR = giudice di primo grado\n- Consiglio di Stato = giudice d\u2019appello + funzione consultiva\n- Principali rimedi: annullamento, risarcimento del danno",
      },
    ],
    5: [
      {
        tipo: "slide",
        contenuto:
          "## Organizzazione degli Enti Locali\n\n### Comune\n\nOrgani del Comune:\n- **Consiglio Comunale**: organo di indirizzo e controllo\n- **Giunta Comunale**: organo esecutivo\n- **Sindaco**: capo dell\u2019amministrazione comunale\n\n### Province e Citt\u00e0 Metropolitane\n\n- Funzioni di programmazione e coordinamento\n- Gestione di servizi sovracomunali (trasporti, rifiuti, istruzione)",
      },
      {
        tipo: "slide",
        contenuto:
          "## Atti degli Enti Locali\n\n### Deliberazioni\n- Delibere del Consiglio (atti di indirizzo)\n- Delibere della Giunta (atti esecutivi)\n- Determinazioni dei dirigenti (atti gestionali)\n\n### Requisiti\n- Pubblicazione all\u2019Albo Pretorio online\n- Termine di pubblicazione: 15 giorni\n- Diritto di accesso agli atti\n- Controllo di legittimit\u00e0 (eventuale)",
      },
      {
        tipo: "riassunto",
        contenuto:
          "### Riassunto \u2014 Enti Locali\n\n- Comune: Consiglio, Giunta, Sindaco\n- Province: funzioni di coordinamento\n- Atti: deliberazioni del Consiglio/Giunta, determinazioni\n- Obbligo di pubblicazione all\u2019Albo Pretorio\n- Diritto di accesso agli atti",
      },
    ],
  };

  for (let i = 0; i < capitoli.length; i++) {
    const capId = capitoli[i].id;
    const slides = slideContent[i + 1] || [];
    for (let j = 0; j < slides.length; j++) {
      const { error: se } = await sb.from("slide").insert({
        capitolo_id: capId,
        ordine: j + 1,
        contenuto: slides[j].contenuto,
        tipo: slides[j].tipo,
      });
      if (se) {
        console.error("Slide error:", se);
        return;
      }
    }
    console.log(
      "  Slide create per capitolo",
      i + 1,
      ":",
      slides.length,
      "slide"
    );
  }

  // 6. Link concorso-materia
  await sb
    .from("concorsi_materie")
    .insert({ concorso_id: conc.id, materia_id: mat.id });

  console.log("\n✅ Demo corso creato con successo!");
  console.log(
    "\nConcorso: https://concourse-omega.vercel.app/concorsi/" + conc.slug
  );
  console.log(
    "Corso: https://concourse-omega.vercel.app/corsi/" + corso.id + "/player"
  );
}

main().catch(console.error);
