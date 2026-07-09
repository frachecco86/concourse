# User Stories — ConCourse

> Reverse engineering del codice sorgente. Ruoli identificati: **Guest/Anonimo**, **Utente Autenticato**, **Amministratore (Admin)**.

---

## Modulo 1 — Autenticazione e Accesso

### 1.1 Login via email/password
- **Come** Guest/Anonimo
- **Voglio** accedere con email e password
- **Affinché** possa usare le funzionalità riservate agli utenti autenticati

**Criteri di accettazione:**
- **Given** che non sono autenticato e sono sulla pagina `/login`
- **When** inserisco email e password validi e clicco "Accedi"
- **Then** vengo reindirizzato a `/admin` e la sessione viene creata
- **Given** che inserisco credenziali errate
- **When** clicco "Accedi"
- **Then** vedo un messaggio di errore e rimango sulla pagina di login

### 1.2 Login via Magic Link
- **Come** Guest/Anonimo
- **Voglio** ricevere un magic link via email per accedere senza password
- **Affinché** possa autenticarmi velocemente senza ricordare una password

**Criteri di accettazione:**
- **Given** che sono sulla pagina `/login` e ho inserito la mia email
- **When** clicco "Invia magic link"
- **Then** vedo un messaggio di conferma "Email inviata!" con istruzioni per controllare la posta
- **Given** che non ho inserito una email
- **When** clicco "Invia magic link"
- **Then** vedo un errore "Inserisci la tua email"

### 1.3 Registrazione
- **Come** Guest/Anonimo
- **Voglio** registrarmi con nome, cognome, email e password
- **Affinché** possa creare un account e acquistare corsi

**Criteri di accettazione:**
- **Given** che sono sulla pagina `/register`
- **When** compilo tutti i campi e clicco "Registrati"
- **Then** vedo una schermata di successo con il messaggio "Controlla la tua email per confermare la registrazione"
- **Given** che la registrazione fallisce
- **When** clicco "Registrati"
- **Then** vedo un messaggio di errore nel ruolo alert

### 1.4 Logout
- **Come** Utente Autenticato
- **Voglio** uscire dalla sessione
- **Affinché** possa terminare la mia sessione in sicurezza

**Criteri di accettazione:**
- **Given** che sono autenticato
- **When** clicco "Esci" nella sidebar admin o nel link di navigazione
- **Then** vengo reindirizzato a `/login` e la sessione viene distrutta

### 1.5 Proxy (Middleware) — Protezione rotte admin
- **Come** Amministratore
- **Voglio** che le rotte `/admin/*` siano protette da autenticazione e controllo ruolo
- **Affinché** solo gli admin possano accedere alla gestione dei contenuti

**Criteri di accettazione:**
- **Given** che non sono autenticato
- **When** provo ad accedere a una rotta `/admin/*`
- **Then** vengo reindirizzato a `/login` con parametro `redirect` per tornare dopo il login
- **Given** che sono autenticato ma non ho ruolo admin
- **When** provo ad accedere a una rotta `/admin/*`
- **Then** vengo reindirizzato alla homepage `/`
- **Given** che sono autenticato
- **When** provo ad accedere a `/login` o `/register`
- **Then** vengo reindirizzato a `/admin`

### 1.6 Auth Callback
- **Come** Utente Autenticato
- **Voglio** essere reindirizzato dopo la conferma email o magic link
- **Affinché** possa completare il flusso di autenticazione

**Criteri di accettazione:**
- **Given** che clicco un link di conferma via email
- **When** vengo reindirizzato a `/auth/callback?code=...`
- **Then** vengo reindirizzato a `/admin`

---

## Modulo 2 — Landing Page e Catalogo Pubblico

### 2.1 Hero Section
- **Come** Guest/Anonimo
- **Voglio** vedere la hero section con il titolo "Preparati ai concorsi pubblici" e la CTA "Inizia ora"
- **Affinché** possa capire il valore della piattaforma e iniziare la registrazione

**Criteri di accettazione:**
- **Given** che visito la homepage `/`
- **Then** vedo la hero section con titolo, descrizione e link "Inizia ora" che porta a `/register`

### 2.2 Lista concorsi attivi
- **Come** Guest/Anonimo
- **Voglio** vedere una griglia di concorsi attivi con ente, titolo, scadenza e numero posti
- **Affinché** possa sfogliare i concorsi disponibili senza autenticarmi

**Criteri di accettazione:**
- **Given** che visito la homepage
- **Then** vedo una sezione "Concorsi attivi" con card cliccabili per ogni concorso in stato `aperto`
- **Given** che non ci sono concorsi attivi
- **Then** vedo un empty state con messaggio "Nessun concorso attivo al momento"
- **Given** che clicco su un concorso
- **Then** vengo reindirizzato a `/concorsi/[slug]`

### 2.3 Dettaglio concorso
- **Come** Guest/Anonimo
- **Voglio** vedere i dettagli di un concorso: descrizione, scadenza, posti, bando, materie e corsi disponibili
- **Affinché** possa valutare l'acquisto di un corso

**Criteri di accettazione:**
- **Given** che visito `/concorsi/[slug]`
- **Then** vedo breadcrumb, titolo, ente, descrizione, info box (scadenza/posti/bando), materie incluse e corsi disponibili con prezzo
- **Given** che il concorso ha un prezzo minimo
- **Then** vedo una CTA "Acquista ora" con il prezzo a partire da
- **Given** che il concorso non esiste
- **Then** ricevo una risposta 404

### 2.4 Structured Data (SEO)
- **Come** Motore di ricerca
- **Voglio** trovare i dati strutturati schema.org Course nel dettaglio concorso
- **Affinché** i concorsi siano indicizzati correttamente nei risultati di ricerca

**Criteri di accettazione:**
- **Given** che visito `/concorsi/[slug]`
- **Then** la pagina contiene un tag `<script type="application/ld+json">` con dati Course di schema.org

### 2.5 Sitemap XML
- **Come** Motore di ricerca
- **Voglio** una sitemap XML con tutti i concorsi aperti
- **Affinché** i contenuti siano scopribili dai crawler

**Criteri di accettazione:**
- **Given** che visito `/sitemap.xml`
- **Then** ricevo una sitemap XML con URL della homepage e di tutti i concorsi in stato `aperto`

---

## Modulo 3 — Dashboard Amministratore

### 3.1 Statistiche dashboard
- **Come** Amministratore
- **Voglio** vedere il riepilogo di concorsi, materie, corsi, acquisti e utenti
- **Affinché** possa monitorare rapidamente lo stato della piattaforma

**Criteri di accettazione:**
- **Given** che sono autenticato come admin e visito `/admin`
- **Then** vedo card con conteggi per concorsi, materie, corsi, acquisti e utenti

### 3.2 Sidebar navigazione admin
- **Come** Amministratore
- **Voglio** una sidebar con link a Dashboard, Concorsi, Materie, Corsi, Materiali e Vendite
- **Affinché** possa navigare rapidamente tra le sezioni di amministrazione

**Criteri di accettazione:**
- **Given** che sono nell'area admin
- **Then** vedo la sidebar con 6 link, evidenziato quello attivo in base al path corrente
- **Given** che clicco "Esci"
- **Then** vengo reindirizzato a `/logout`

---

## Modulo 4 — Gestione Concorsi (CRUD Admin)

### 4.1 Lista concorsi
- **Come** Amministratore
- **Voglio** vedere la tabella di tutti i concorsi con titolo, ente, stato, scadenza
- **Affinché** possa gestire i concorsi della piattaforma

**Criteri di accettazione:**
- **Given** che visito `/admin/concorsi`
- **Then** vedo una tabella con colonne Titolo, Ente, Stato (Aperto/Chiuso con badge), Scadenza e Azioni (Modifica/Elimina)
- **Given** che non ci sono concorsi
- **Then** vedo un empty state "Nessun concorso. Creane uno nuovo!"

### 4.2 Creazione concorso
- **Come** Amministratore
- **Voglio** creare un nuovo concorso con titolo, ente, descrizione, scadenza, posti e link bando
- **Affinché** possa aggiungere concorsi alla piattaforma

**Criteri di accettazione:**
- **Given** che visito `/admin/concorsi/new`
- **When** compilo il form e clicco "Crea concorso"
- **Then** vengo reindirizzato alla lista concorsi e il nuovo concorso appare
- **Given** che la creazione fallisce
- **Then** vedo un messaggio di errore

### 4.3 Modifica concorso
- **Come** Amministratore
- **Voglio** modificare un concorso esistente (titolo, ente, stato, scadenza, posti, bando)
- **Affinché** possa aggiornare le informazioni di un concorso

**Criteri di accettazione:**
- **Given** che visito `/admin/concorsi/[id]/edit`
- **Then** il form è precompilato con i dati esistenti
- **When** modifico i campi e clicco "Salva modifiche"
- **Then** vengo reindirizzato alla lista e le modifiche sono applicate
- **Given** che il concorso non esiste
- **Then** vedo "Concorso non trovato"

### 4.4 Eliminazione concorso
- **Come** Amministratore
- **Voglio** eliminare un concorso
- **Affinché** possa rimuovere concorsi non più validi

**Criteri di accettazione:**
- **Given** che sono nella lista concorsi
- **When** clicco "Elimina" su un concorso
- **Then** il concorso viene rimosso e la lista si aggiorna

---

## Modulo 5 — Gestione Materie (CRUD Admin)

### 5.1 Lista materie
- **Come** Amministratore
- **Voglio** vedere la tabella delle materie con nome e descrizione
- **Affinché** possa gestire le materie della piattaforma

**Criteri di accettazione:**
- **Given** che visito `/admin/materie`
- **Then** vedo una tabella con colonne Nome, Descrizione e Azioni (Elimina)
- **Given** che non ci sono materie
- **Then** vedo un empty state "Nessuna materia. Creane una nuova!"

### 5.2 Creazione materia
- **Come** Amministratore
- **Voglio** creare una nuova materia con nome e descrizione
- **Affinché** possa aggiungere materie alla piattaforma

**Criteri di accettazione:**
- **Given** che visito `/admin/materie/new`
- **When** compilo il form e clicco "Crea materia"
- **Then** vengo reindirizzato alla lista e la nuova materia appare

### 5.3 Eliminazione materia
- **Come** Amministratore
- **Voglio** eliminare una materia
- **Affinché** possa rimuovere materie non più utilizzate

**Criteri di accettazione:**
- **Given** che sono nella lista materie
- **When** clicco "Elimina" su una materia
- **Then** la materia viene rimossa

---

## Modulo 6 — Gestione Corsi (CRUD Admin)

### 6.1 Lista corsi
- **Come** Amministratore
- **Voglio** vedere la tabella dei corsi con titolo e stato (Bozza/Pubblicato)
- **Affinché** possa gestire i corsi della piattaforma

**Criteri di accettazione:**
- **Given** che visito `/admin/corsi`
- **Then** vedo una tabella con colonne Titolo, Stato (Bozza/Pubblicato con badge), Azioni (Modifica/Elimina)
- **Given** che non ci sono corsi
- **Then** vedo un empty state "Nessun corso. Creane uno nuovo!"

### 6.2 Creazione corso
- **Come** Amministratore
- **Voglio** creare un nuovo corso con titolo, descrizione, materia e concorso opzionale
- **Affinché** possa organizzare i contenuti didattici

**Criteri di accettazione:**
- **Given** che visito `/admin/corsi/new`
- **When** seleziono materia, compilo titolo/descrizione e clicco "Crea corso"
- **Then** vengo reindirizzato alla lista e il nuovo corso appare in stato `bozza`

### 6.3 Editor corso — capitoli
- **Come** Amministratore
- **Voglio** gestire i capitoli di un corso: aggiungere, eliminare e vedere il conteggio slide
- **Affinché** possa strutturare il corso in sezioni

**Criteri di accettazione:**
- **Given** che visito `/admin/corsi/[id]`
- **Then** vedo il titolo del corso, lo stato (Bozza/Pubblicato), la lista dei capitoli con conteggio slide
- **When** inserisco un titolo e clicco "Aggiungi"
- **Then** il capitolo viene creato con ordine progressivo
- **When** clicco "Elimina" su un capitolo
- **Then** il capitolo viene rimosso

### 6.4 Pubblicazione corso
- **Come** Amministratore
- **Voglio** pubblicare o mettere in bozza un corso
- **Affinché** possa controllare la visibilità del corso sul catalogo

**Criteri di accettazione:**
- **Given** che visito `/admin/corsi/[id]`
- **When** clicco "Pubblica" o "Metti in bozza"
- **Then** lo stato del corso cambia e il badge si aggiorna

---

## Modulo 7 — Gestione Slide e Capitoli

### 7.1 Lista slide per capitolo
- **Come** Amministratore
- **Voglio** vedere la lista delle slide in un capitolo con ordine, tipo e anteprima contenuto
- **Affinché** possa gestire i contenuti del corso

**Criteri di accettazione:**
- **Given** che visito `/admin/corsi/[id]/capitoli/[capitoloId]`
- **Then** vedo la lista slide con badge tipo (Slide/Riassunto), ordine, anteprima contenuto e azioni (Modifica/Elimina/Sposta su/Sposta giù)

### 7.2 Aggiunta slide
- **Come** Amministratore
- **Voglio** aggiungere una slide o riassunto in markdown a un capitolo
- **Affinché** possa popolare il corso di contenuti

**Criteri di accettazione:**
- **Given** che visito la pagina capitolo
- **When** seleziono il tipo (Slide/Riassunto), scrivo il contenuto in markdown e clicco "Aggiungi slide"
- **Then** la slide viene creata con ordine progressivo

### 7.3 Riordino slide (drag alternativo)
- **Come** Amministratore
- **Voglio** spostare le slide su o giù per cambiarne l'ordine
- **Affinché** possa riorganizzare la sequenza didattica

**Criteri di accettazione:**
- **Given** che sono nella lista slide
- **When** clicco ↑ o ↓ su una slide
- **Then** la slide scambia l'ordine con la precedente/successiva

### 7.4 Modifica slide
- **Come** Amministratore
- **Voglio** modificare il contenuto markdown e il tipo di una slide
- **Affinché** possa correggere o migliorare il materiale

**Criteri di accettazione:**
- **Given** che visito `/admin/corsi/[id]/capitoli/[capitoloId]/slide/[slideId]/edit`
- **Then** vedo editor con contenuto precompilato e anteprima markdown
- **When** modifico il contenuto e clicco "Salva modifiche"
- **Then** vengo reindirizzato alla lista slide del capitolo

### 7.5 Anteprima markdown
- **Come** Amministratore
- **Voglio** vedere l'anteprima HTML del contenuto markdown durante la modifica
- **Affinché** possa verificare il risultato visivo prima di salvare

**Criteri di accettazione:**
- **Given** che sono nell'editor slide
- **When** clicco "Anteprima"
- **Then** vedo il contenuto renderizzato in HTML (headings, bold, list, code)
- **When** clicco "Editor"
- **Then** torno alla vista textarea

---

## Modulo 8 — Upload PDF e Pipeline AI

### 8.1 Upload materiale PDF
- **Come** Amministratore
- **Voglio** caricare un file PDF associato a un concorso e materia
- **Affinché** possa importare bandi, questionari o dispense per la generazione AI

**Criteri di accettazione:**
- **Given** che visito `/admin/materiali/upload`
- **When** seleziono concorso, materia opzionale, tipo (Bando/Questionario/Dispensa), scelgo un file PDF e clicco "Carica e avvia generazione"
- **Then** il PDF viene caricato su Supabase Storage e un record viene creato in `materiali_origine` con stato `in_coda`

### 8.2 Trigger pipeline AI
- **Come** Amministratore
- **Voglio** che dopo l'upload venga automaticamente avviata la pipeline di generazione AI
- **Affinché** il sistema estragga il testo e generi capitoli, slide e quiz in bozza

**Criteri di accettazione:**
- **Given** che ho caricato un PDF
- **When** la pipeline viene triggerata via `/api/generazione/trigger`
- **Then** il sistema risponde con `{ status: "accepted" }` e la pipeline parte in background

### 8.3 Lista materiali con stato
- **Come** Amministratore
- **Voglio** vedere lo stato di elaborazione dei materiali caricati
- **Affinché** possa monitorare l'avanzamento della pipeline AI

**Criteri di accettazione:**
- **Given** che visito `/admin/materiali`
- **Then** vedo una tabella con Tipo (badge Bando/Questionario/Dispensa), Stato (badge In coda/Elaborato/Errore), link al file e stato elaborazione

### 8.4 Pipeline AI — estrazione testo
- **Come** Sistema
- **Voglio** estrarre il testo dal PDF caricato usando pdf-parse
- **Affinché** possa inviare il contenuto al LLM per la generazione

**Criteri di accettazione:**
- **Given** che la pipeline viene eseguita
- **When** viene chiamata `extractTextFromPDF`
- **Then** restituisce il testo estratto dal PDF

### 8.5 Pipeline AI — generazione materiale
- **Come** Sistema
- **Voglio** chiamare il LLM con un prompt strutturato per generare capitoli, slide e quiz
- **Affinché** possa produrre materiale didattico automaticamente

**Criteri di accettazione:**
- **Given** che la pipeline ha il testo estratto
- **When** viene chiamato `callLLM` con system prompt e user prompt strutturati
- **Then** la risposta viene parsata come JSON con capitoli, slide e quiz

### 8.6 Pipeline AI — salvataggio risultati
- **Come** Sistema
- **Voglio** salvare capitoli, slide e quiz generati nel database in stato bozza
- **Affinché** l'admin possa revisionarli e pubblicarli

**Criteri di accettazione:**
- **Given** che la pipeline ha ricevuto la risposta LLM parsata
- **When** salva i dati in `capitoli`, `slide`, `quiz`, `domande`
- **Then** il materiale viene aggiornato a stato `elaborato`
- **Given** che la pipeline fallisce
- **Then** il materiale viene aggiornato a stato `errore`

### 8.7 Provider LLM configurabile
- **Come** Sistema
- **Voglio** supportare provider LLM diversi (OpenAI, Anthropic, endpoint generico)
- **Affinché** possa scegliere il modello più adatto in base a costo e qualità

**Criteri di accettazione:**
- **Given** che `LLM_PROVIDER` è impostato su `openai`
- **When** viene chiamato `callLLM`
- **Then** usa l'API OpenAI con il modello configurato
- **Given** che `LLM_PROVIDER` è impostato su `anthropic`
- **When** viene chiamato `callLLM`
- **Then** usa l'API Anthropic con Claude
- **Given** che `LLM_API_KEY` non è configurata
- **When** viene chiamato `callLLM`
- **Then** restituisce un contenuto placeholder senza errori

---

## Modulo 9 — Area Utente e Player Corso

### 9.1 Lista "I miei corsi"
- **Come** Utente Autenticato
- **Voglio** vedere la lista dei corsi che ho acquistato con barra di progresso
- **Affinché** possa monitorare il mio avanzamento formativo

**Criteri di accettazione:**
- **Given** che sono autenticato e visito `/miei-corsi`
- **Then** vedo una griglia di card con titolo corso, descrizione, conteggio capitoli completati/totali e barra di progresso percentuale
- **Given** che non ho corsi acquistati
- **Then** vedo un empty state con messaggio "Nessun corso acquistato" e CTA "Sfoglia concorsi"

### 9.2 Player corso — sidebar capitoli
- **Come** Utente Autenticato
- **Voglio** vedere la sidebar con i capitoli del corso e il loro stato (non iniziato/in corso/completato)
- **Affinché** possa navigare tra i capitoli e vedere il progresso

**Criteri di accettazione:**
- **Given** che visito `/corsi/[corsoId]/player`
- **Then** vedo la sidebar con capitoli, badge di stato (✅ completato, ▶ in corso, numero non iniziato) e barra di progresso complessiva
- **Given** che non ci sono capitoli
- **Then** vedo "Nessun capitolo disponibile"

### 9.3 Player corso — navigazione slide
- **Come** Utente Autenticato
- **Voglio** navigare tra le slide di un capitolo con pulsanti Precedente/Successiva
- **Affinché** possa studiare i contenuti in sequenza

**Criteri di accettazione:**
- **Given** che ho selezionato un capitolo
- **Then** vedo la slide corrente renderizzata in HTML dal markdown, con badge tipo (Slide/Riassunto) e indicatore "N / totale"
- **When** clicco "Successiva" o "Precedente"
- **Then** la slide cambia e l'indice si aggiorna

### 9.4 Completamento capitolo
- **Come** Utente Autenticato
- **Voglio** segnare un capitolo come completato quando arrivo all'ultima slide
- **Affinché** possa tracciare il mio progresso e passare al capitolo successivo

**Criteri di accettazione:**
- **Given** che sono all'ultima slide di un capitolo
- **Then** vedo il pulsante "Segna capitolo come completato"
- **When** clicco "Segna capitolo come completato"
- **Then** il capitolo viene segnato come `completato` con data, la sidebar si aggiorna e passo automaticamente al prossimo capitolo non completato

### 9.5 Progresso automatico
- **Come** Utente Autenticato
- **Voglio** che il capitolo corrente venga segnato come "in corso" appena lo apro
- **Affinché** il sistema tracci automaticamente lo stato di avanzamento

**Criteri di accettazione:**
- **Given** che apro un capitolo
- **Then** viene creato/aggiornato un record in `progressi` con stato `in_corso`

### 9.6 Skeleton loading e empty state
- **Come** Utente Autenticato
- **Voglio** vedere uno scheletro di caricamento mentre il player si carica
- **Affinché** l'esperienza non sembri bloccata

**Criteri di accettazione:**
- **Given** che il player è in fase di caricamento
- **Then** vedo skeleton animation con placeholder
- **Given** che il corso non esiste
- **Then** vedo empty state "Corso non trovato" con link "Torna ai tuoi corsi"

---

## Modulo 10 — Checkout e Pagamenti Stripe

### 10.1 Pulsante acquisto su concorso
- **Come** Utente Autenticato
- **Voglio** vedere il prezzo e un pulsante per acquistare un corso
- **Affinché** possa comprare l'accesso al corso

**Criteri di accettazione:**
- **Given** che visito `/concorsi/[slug]`
- **Then** vedo il prezzo a partire da e il pulsante "Acquista ora"
- **Given** che ho più corsi disponibili
- **Then** vedo un selettore dropdown per scegliere il corso e il pulsante "Acquista"

### 10.2 Reindirizzamento a Stripe Checkout
- **Come** Utente Autenticato
- **Voglio** essere reindirizzato a Stripe Checkout dopo aver cliccato "Acquista"
- **Affinché** possa pagare in modo sicuro con carta

**Criteri di accettazione:**
- **Given** che clicco "Acquista ora"
- **Then** vengo reindirizzato alla pagina di checkout Stripe
- **Given** che non sono autenticato
- **When** clicco "Acquista ora"
- **Then** vengo reindirizzato a `/login`

### 10.3 API Checkout Stripe
- **Come** Sistema
- **Voglio** creare una sessione di checkout Stripe e salvare l'acquisto in stato `in_attesa`
- **Affinché** il pagamento possa essere processato e tracciato

**Criteri di accettazione:**
- **Given** che l'API `/api/stripe/checkout` riceve una richiesta valida con `corsoId`
- **When** viene processata
- **Then** restituisce `{ url, sessionId }` e crea un record in `acquisti` con stato `in_attesa`
- **Given** che l'utente non è autenticato
- **Then** restituisce errore 401
- **Given** che il corso non ha prezzo
- **Then** restituisce errore 400

### 10.4 Webhook Stripe — completamento acquisto
- **Come** Sistema
- **Voglio** ricevere l'evento `checkout.session.completed` da Stripe e attivare l'accesso al corso
- **Affinché** l'utente possa accedere al corso dopo il pagamento

**Criteri di accettazione:**
- **Given** che Stripe invia un evento `checkout.session.completed` a `/api/stripe/webhook`
- **When** il webhook viene processato con firma valida
- **Then** l'acquisto viene aggiornato a stato `completato` e viene creata una `iscrizioni_corso`
- **Given** che la firma non è valida
- **Then** restituisce errore 400
- **Given** che l'iscrizione esiste già
- **Then** non viene duplicata

### 10.5 Notifica email dopo acquisto
- **Come** Sistema
- **Voglio** che dopo il completamento del checkout venga inviata una email di conferma con ricevuta
- **Affinché** l'utente riceva la documentazione dell'acquisto

**Criteri di accettazione:**
- **Given** che il webhook Stripe ha processato un pagamento completato
- **When** viene chiamata l'API `/api/email/ricevuta`
- **Then** genera ricevuta HTML, la salva su Storage, invia email con ricevuta allegata
- **Given** che l'invio email fallisce
- **Then** il webhook non si blocca (errore non bloccante)

---

## Modulo 11 — Vendite e Report Admin

### 11.1 Dashboard vendite
- **Come** Amministratore
- **Voglio** vedere il riepilogo degli incassi: totale, completati e in attesa
- **Affinché** possa monitorare le entrate della piattaforma

**Criteri di accettazione:**
- **Given** che visito `/admin/vendite`
- **Then** vedo 3 card riepilogo: Totale incasso, Completati, In attesa

### 11.2 Tabella acquisti
- **Come** Amministratore
- **Voglio** vedere la tabella cronologica degli acquisti con utente, corso, importo, stato e link fattura
- **Affinché** possa tracciare ogni transazione

**Criteri di accettazione:**
- **Given** che visito `/admin/vendite`
- **Then** vedo una tabella con Data, Utente, Corso, Importo, Stato (badge Completato/In attesa), Fattura (link se disponibile)
- **Given** che non ci sono acquisti
- **Then** vedo "Nessun acquisto ancora"

---

## Modulo 12 — Email Transazionali e Fatturazione

### 12.1 Invio email ricevuta
- **Come** Sistema
- **Voglio** inviare una email di conferma acquisto con ricevuta HTML allegata via Resend
- **Affinché** l'utente riceva la documentazione ufficiale

**Criteri di accettazione:**
- **Given** che l'API `/api/email/ricevuta` riceve parametri validi
- **When** genera HTML ricevuta e chiama `sendRicevutaAcquisto`
- **Then** l'email viene inviata con oggetto "✅ Ricevuta d'acquisto — [titolo corso]"
- **Given** che `RESEND_API_KEY` non è configurata
- **Then** il sistema logga un warning ma non crasha

### 12.2 Generazione ricevuta HTML
- **Come** Sistema
- **Voglio** generare una ricevuta HTML strutturata con dati cliente, corso, pagamento e importi
- **Affinché** l'utente abbia un documento di avvenuto pagamento

**Criteri di accettazione:**
- **Given** che `generaHtmlRicevuta` viene chiamata con dati fattura
- **Then** restituisce HTML completo con header ConCourse, dati cliente, tabella corso, totale, dettagli pagamento e footer

### 12.3 Salvataggio ricevuta su Storage
- **Come** Sistema
- **Voglio** salvare la ricevuta HTML su Supabase Storage nel bucket `ricevute`
- **Affinché** l'admin possa visualizzarla dalla dashboard vendite

**Criteri di accettazione:**
- **Given** che la ricevuta è generata
- **When** viene chiamata `salvaRicevutaSuStorage`
- **Then** l'HTML viene salvato su Storage e l'URL pubblico viene aggiornato nel record `acquisti.fattura_url`
