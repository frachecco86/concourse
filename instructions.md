# Prompt per Pi Agent — Piattaforma Corsi Concorsi Pubblici

## 0. Setup dell'agente (Pi)

Prima di iniziare lo sviluppo, installa la skill di design **Impeccable**, da usare per ogni componente/pagina di interfaccia:

```
pi install git:github.com/jordi9/pi-impeccable
```

Dopo l'installazione, esegui `/impeccable init` per generare `PRODUCT.md` e `DESIGN.md` di progetto (pubblico target, tono di voce, palette, componenti). Usa `/impeccable polish` e `/impeccable audit` sulle pagine principali (landing, catalogo, player del corso) prima di considerarle concluse.
install anche pi install npm:pi-ask-user.


## 1. Contesto e obiettivo

Sviluppa una web app per la vendita e fruizione di corsi di preparazione ai concorsi pubblici italiani. La piattaforma ha due lati:

- **Pubblico/utente**: landing page con elenco dei concorsi attivi, acquisto corsi, fruizione contenuti (slide, riassunti, quiz), tracciamento avanzamento.
- **Admin (back office)**: creazione concorsi, materie, upload di bandi/PDF/questionari, generazione automatica via AI del materiale didattico (slide, riassunti, quiz), revisione e pubblicazione.

Stack richiesto: **Next.js (App Router) + Supabase** (Postgres, Auth, Storage, Row Level Security). Deploy previsto su Vercel.

---

## 2. Modello dati (schema Supabase/Postgres)

Tabelle principali (adatta i nomi ma mantieni le relazioni):

- `concorsi` — id, titolo, ente, descrizione, stato (aperto/chiuso), data_scadenza_bando, numero_posti, link_bando_ufficiale, slug, cover_image, created_at
- `materie` — id, nome, descrizione (es. "Diritto Amministrativo", "Diritto Penale") — sono riutilizzabili tra più concorsi (many-to-many)
- `concorsi_materie` — join table concorso_id, materia_id
- `corsi` — id, materia_id, concorso_id (nullable se la materia è condivisa), titolo, descrizione, stato (bozza/pubblicato)
- `capitoli` — id, corso_id, ordine, titolo
- `slide` — id, capitolo_id, ordine, contenuto (markdown/JSON), tipo (slide/riassunto)
- `quiz` — id, capitolo_id, titolo
- `domande` — id, quiz_id, testo, tipo (scelta_multipla), opzioni (JSONB), risposta_corretta, spiegazione
- `materiali_origine` — id, concorso_id/materia_id, file_url (Storage), tipo (bando/questionario/dispensa), stato_elaborazione (in_coda/elaborato/errore)
- `utenti_profili` — id (fk auth.users), nome, cognome, dati_fatturazione (JSONB: ragione sociale/CF/P.IVA/indirizzo)
- `acquisti` — id, utente_id, corso_id o concorso_id (pacchetto), importo, stato_pagamento, provider, provider_payment_id, fattura_url, created_at
- `iscrizioni_corso` — utente_id, corso_id, data_acquisto (deriva da acquisti, ma serve per accesso rapido)
- `progressi` — utente_id, capitolo_id, stato (non_iniziato/in_corso/completato), data_completamento
- `risultati_quiz` — utente_id, quiz_id, punteggio, risposte (JSONB), data

Applica **Row Level Security**: un utente vede solo i propri dati (`acquisti`, `progressi`, `risultati_quiz`), i contenuti dei corsi (`slide`, `quiz`) sono leggibili solo se esiste una riga in `iscrizioni_corso` corrispondente. L'admin ha ruolo separato (`utenti_profili.ruolo = 'admin'`) con policy dedicate.

---

## 3. Backend / Pannello Admin

Funzionalità richieste:

1. **Gestione concorsi**: CRUD concorso (titolo, ente, stato aperto/chiuso, scadenza, materie collegate).
2. **Gestione materie**: catalogo materie riutilizzabile (es. "Diritto Amministrativo" usato in più concorsi contemporaneamente, con contenuti condivisi o specifici).
3. **Upload materiale**: form per caricare PDF (bandi, questionari ufficiali, dispense, programmi d'esame) collegati a un concorso/materia, salvati su Supabase Storage.
4. **Pipeline di generazione AI** (asincrona, con coda di elaborazione):
   - Estrazione testo dai PDF caricati.
   - Chiamata a un modello LLM (a scelta: Anthropic, OpenAI, o altro provider — configurabile tramite variabile d'ambiente/chiave API, senza legare il codice a un provider specifico) con prompt strutturato per generare: struttura capitoli, slide/riassunti in markdown, quiz a risposta multipla con spiegazione.
   - Output salvato **in stato bozza**, mai pubblicato automaticamente.
5. **Editor di revisione**: interfaccia per l'admin per rivedere/modificare slide e quiz generati prima della pubblicazione (editor markdown con anteprima, drag&drop per riordinare capitoli/slide).
6. **Dashboard vendite**: elenco acquisti, stato pagamenti, export fatture.
7. **Gestione utenti**: elenco iscritti, corsi acquistati, possibilità di rimborso/revoca accesso.

⚠️ Indica esplicitamente al Pi Agent di **non pubblicare mai automaticamente** contenuti generati da AI senza approvazione umana — è un requisito di qualità/compliance per materiale usato ai fini di un concorso pubblico.

---

## 4. Frontend pubblico (non autenticato)

- **Landing page**: hero con value proposition, elenco concorsi attivi in evidenza (card con ente, scadenza, materie incluse, CTA "Scopri il corso").
- **Pagina catalogo concorsi**: filtri per ente/stato/categoria, ricerca.
- **Pagina dettaglio concorso**: descrizione, materie incluse, anteprima gratuita di un capitolo campione, prezzo, CTA acquisto.
- SEO: meta tag dinamici, sitemap, dati strutturati (schema.org Course) per ogni corso.

---

## 5. Area utente autenticata (learning experience)

Ispirazione: Udemy, ma **minimal** — pulita, senza distrazioni, focus sul contenuto.

- **Dashboard "I miei corsi"**: card corso con barra di avanzamento percentuale.
- **Player del corso**: sidebar con elenco capitoli/slide (checkbox stato completato), area centrale con contenuto slide, navigazione avanti/indietro.
- **Segna capitolo come completato**: bottone esplicito a fine capitolo (non solo automatico da scroll, per dare controllo all'utente).
- **Quiz di fine capitolo**: risposta multipla, feedback immediato con spiegazione, punteggio salvato, possibilità di ripetere.
- **Statistiche personali**: percentuale completamento per materia, quiz medi, capitoli da ripassare (punteggio basso).
- **Elementi di engagement leggeri** (coerenti con lo stile minimal, da valutare insieme):
  - Barra di progresso per corso e per materia.
  - Indicatore "ultimo capitolo visto, riprendi da qui".
  - Streak di giorni di studio consecutivi (opzionale, discreto, non invasivo).
  - Nessuna gamification aggressiva (no badge vistosi/leaderboard pubbliche) per mantenere il tono professionale adatto a un pubblico da concorso.

---

## 6. Autenticazione

- Supabase Auth: email/password + magic link. Valuta login social (Google) per ridurre attrito.
- Conferma email obbligatoria prima dell'accesso ai contenuti a pagamento.
- Recupero password standard.

---

## 7. Pagamenti e fatturazione

Requisiti per il mercato italiano:

- **Provider consigliato**: Stripe — supporta carte, Apple Pay/Google Pay, e ha buona copertura per l'Italia; gestisce webhook affidabili per attivare l'accesso al corso solo dopo pagamento confermato.
- Valuta come opzione aggiuntiva **Satispay** se rilevante per il tuo pubblico (molto diffuso in Italia per pagamenti da mobile), da integrare in seconda fase.
- **Fatturazione**: raccogli in fase di checkout i dati fiscali (nome/cognome o ragione sociale, codice fiscale/P.IVA, indirizzo). Genera una ricevuta/fattura PDF (anche semplice, non fattura elettronica SDI a meno che non serva per obbligo fiscale — chiarisci con il tuo commercialista se serve integrazione con Sistema di Interscambio) e inviala via email automaticamente dopo l'acquisto.
- Invio email transazionali: conferma acquisto, ricevuta, credenziali/accesso al corso (usa Resend o servizio email transazionale di Supabase).
- Attivazione accesso al corso **solo** dopo conferma webhook di pagamento andato a buon fine (evita accessi anticipati o doppi addebiti).

---

## 8. Linee guida di design

- Stile: **minimal, in stile Udemy semplificato** — palette neutra (1-2 colori accento), tipografia leggibile, molto spazio bianco, card pulite per i corsi.
- Componenti: preferisci un design system coerente (es. shadcn/ui + Tailwind) per velocità e uniformità.
- Priorità a leggibilità e gerarchia visiva chiara (i contenuti sono spesso tecnici/giuridici, serve calma visiva, non un sito "gamificato" colorato).
- Mobile-first: molti utenti studieranno da smartphone tra un impegno e l'altro.

---

## 9. Requisiti non funzionali

- Sicurezza: RLS su tutte le tabelle sensibili, validazione lato server di ogni acquisto/accesso.
- Performance: caricamento lazy delle slide, immagini ottimizzate.
- Scalabilità: pipeline di generazione AI asincrona (coda, non bloccante per l'admin).
- Osservabilità: log degli errori nella pipeline di generazione contenuti (fallimenti di estrazione PDF, errori API).

---

## 10. Deliverable attesi in prima iterazione

Chiedi al Pi Agent di procedere in quest'ordine, confermando ogni step prima di passare al successivo:

1. Schema database completo (migrazioni Supabase) + RLS policies.
2. Autenticazione + area admin base (CRUD concorsi/materie/corsi).
3. Upload PDF + pipeline generazione AI (slide/quiz in bozza).
4. Editor di revisione admin.
5. Landing page + catalogo pubblico.
6. Area utente + player corso + progressi + quiz.
7. Integrazione Stripe + email transazionali + fatturazione.

---

## Nota su skill/estensioni Pi aggiuntive

Oltre a **Impeccable** (design, già installata in sezione 0), questi sono altri pacchetti/skill Pi utili da valutare durante lo sviluppo (installabili allo stesso modo con `pi install npm:...` o `pi install git:...`, se esiste un pacchetto adatto):

- Skill/estensione per parsing PDF ed estrazione testo (per l'ingestione dei bandi/questionari).
- Skill/estensione per integrazione pagamenti (Stripe: creazione checkout, gestione webhook, fatturazione).
- Skill/estensione per schema e migrazioni Supabase (tabelle + RLS).

Se per queste aree non trovi pacchetti Pi già pronti, non è un problema: sono comunque coperte in dettaglio nelle sezioni 2, 3 e 7 di questo documento, che puoi usare direttamente come istruzioni di progetto (es. tramite `AGENTS.md` o `SYSTEM.md` nella cartella del progetto).

---

## Appendice — Ambiente di Testing del Browser e Istruzioni

Hai accesso a `agent-browser` di Vercel Labs installato tramite `npx skills`. Utilizzalo per eseguire test End-to-End (E2E), validazione dell'interfaccia utente (UI) e verifica dei flussi utente sulla nostra applicazione web.

### Linee Guida Principali:
1. **Non scrivere script personalizzati Playwright/Puppeteer** a meno che non ti venga richiesto esplicitamente. Usa sempre la CLI di `agent-browser` per ottimizzare l'uso dei token.
2. **Flusso Deterministico**: Per ogni interazione, segui rigorosamente questa sequenza:
   - Esegui `agent-browser open <url>` per navigare sulla pagina.
   - Esegui `agent-browser snapshot -i` per ottenere gli ID degli elementi interattivi (es. `@e1`, `@e2`).
   - Interagisci con gli elementi usando il loro ID di riferimento esatto (es. `agent-browser click @e1`).
   - Richiedi *sempre* un nuovo snapshot dopo qualsiasi azione che modifichi lo stato della pagina o causi una navigazione.

### Gestione del Server e delle Porte (Cruciale):
- Se per eseguire i test devi avviare il server di sviluppo locale (es. `npm run dev`), fallo in un processo separato o in background.
- **Termina tassativamente il processo del server e chiudi la sessione del browser al completamento dei test.** Non lasciare processi appesi in background, altrimenti le esecuzioni successive falliranno a causa della porta di rete occupata.

### Esempio di Task - Testare il Flusso di Autenticazione:
1. Avvia il server di sviluppo locale (se non è già attivo).
2. Apri la pagina di login (es. `http://localhost:5173/login`).
3. Fai uno snapshot, individua i campi email, password e il pulsante di invio.
4. Compila il modulo con dati di test e clicca su invia.
5. Verifica che la navigazione sia andata a buon fine facendo un nuovo snapshot della dashboard o della home page.
6. **Chiudi il server locale e rilascia la porta.**
7. Segnala i risultati, inclusi eventuali problemi di layout visivo o azioni fallite.
