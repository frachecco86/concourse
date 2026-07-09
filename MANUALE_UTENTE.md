# 📖 Manuale Utente — ConCourse

> Guida pratica per ogni tipo di utente della piattaforma di preparazione ai concorsi pubblici.

---

## 👤 Guida per Ospite (Utente Non Registrato)

### Come accedere
Nessuna registrazione necessaria. Visita il sito all'indirizzo:
**https://concourse-omega.vercel.app**

### Pagine e sezioni visibili
| Pagina | Cosa trovi |
|--------|------------|
| **Homepage** (`/`) | Hero section con descrizione della piattaforma e griglia dei concorsi attivi |
| **Dettaglio concorso** (`/concorsi/[slug]`) | Informazioni complete su un concorso: ente, scadenza, posti, bando, materie incluse, corsi disponibili con prezzi |
| **Login** (`/login`) | Modulo per accedere con email/password o magic link |
| **Registrazione** (`/register`) | Modulo per creare un nuovo account |

### Azioni principali

#### Sfogliare i concorsi
1. Dalla homepage, scorri la sezione **"Concorsi attivi"**
2. Clicca su un concorso per vedere tutti i dettagli
3. Scopri le materie incluse, la scadenza, il numero di posti e i corsi disponibili con i prezzi

#### Registrarsi
1. Clicca **"Registrati"** in alto a destra
2. Compila: Nome, Cognome, Email, Password (almeno 6 caratteri)
3. Clicca **"Registrati"**
4. Controlla la tua email e clicca il link di conferma
5. Torna al sito e clicca **"Accedi"** per entrare

#### Accedere
1. Clicca **"Accedi"** in alto a destra
2. Inserisci email e password e clicca **"Accedi"**
3. Oppure usa il **magic link**: inserisci la tua email e clicca **"Invia magic link"** — riceverai una email con un link di accesso istantaneo

---

## 👤 Guida per Utente Autenticato

### Come accedere
Dalla homepage, clicca **"Accedi"** ed entra con le tue credenziali.

### Pagine e sezioni visibili
| Pagina | Cosa trovi |
|--------|------------|
| **I miei corsi** (`/miei-corsi`) | Elenco dei corsi che hai acquistato con barra del progresso |
| **Player corso** (`/corsi/[id]/player`) | Lettore slide con navigazione capitoli |
| **Dettaglio concorso** (`/concorsi/[slug]`) | Pagina pubblica con possibilità di acquistare corsi |
| **Logout** (`/logout`) | Esce dalla sessione |

### Azioni principali

#### Acquistare un corso
1. Dalla homepage o dal dettaglio di un concorso, individua il corso che ti interessa
2. Clicca **"Acquista ora"** o seleziona il corso dal menu a tendina e clicca **"Acquista"**
3. Verrai reindirizzato alla pagina di pagamento Stripe
4. Dopo il pagamento, riceverai una email di conferma con la ricevuta
5. Il corso apparirà nella sezione **"I miei corsi"**

#### Studiare un corso
1. Vai su **"I miei corsi"** dal menu in alto
2. Clicca sul corso che vuoi studiare
3. Si apre il **player** con:
   - **Sidebar sinistra**: elenco dei capitoli con stato (✅ completato, ▶ in corso, numero non iniziato)
   - **Barra progresso**: quanti capitoli hai completato
   - **Area centrale**: contenuto della slide corrente
4. Naviga tra le slide con i pulsanti **"← Precedente"** e **"Successiva →"**
5. Quando arrivi all'ultima slide di un capitolo, clicca **"Segna capitolo come completato"** per passare al successivo

#### Tornare ai corsi
- In qualsiasi momento, clicca **"← I miei corsi"** nella sidebar del player per tornare all'elenco

#### Uscire
- Clicca **"Esci"** nel menu in alto per terminare la sessione

---

## 🛠️ Guida per Amministratore

### Come accedere
1. Registrati come utente normale (vedi guida sopra)
2. Un amministratore esistente deve impostare il tuo ruolo su **admin** nel database
3. Accedi con le tue credenziali — verrai reindirizzato automaticamente al pannello admin

### Pannello Admin — Struttura
Il pannello admin ha una **sidebar** sulla sinistra con 6 sezioni:

| Sezione | Icona | Descrizione |
|---------|-------|-------------|
| **Dashboard** | 📊 | Riepilogo statistiche (concorsi, materie, corsi, acquisti, utenti) |
| **Concorsi** | 🏛️ | Gestione concorsi pubblici |
| **Materie** | 📚 | Gestione materie didattiche |
| **Corsi** | 🎓 | Gestione corsi, capitoli e slide |
| **Materiali** | 📄 | Upload PDF e gestione pipeline AI |
| **Vendite** | 🛒 | Report acquisti e fatture |

### Azioni principali

#### Gestire i Concorsi

**Creare un nuovo concorso:**
1. Vai su **Concorsi** nella sidebar
2. Clicca **"Nuovo concorso"**
3. Compila: Titolo, Ente, Descrizione, Scadenza bando, Numero posti, Link bando ufficiale
4. Clicca **"Crea concorso"**

**Modificare un concorso:**
1. Dalla lista concorsi, clicca **"Modifica"** sul concorso che vuoi aggiornare
2. Modifica i campi necessari
3. Clicca **"Salva modifiche"**

**Eliminare un concorso:**
1. Dalla lista, clicca **"Elimina"** sul concorso — attenzione: azione irreversibile

#### Gestire le Materie

**Creare una nuova materia:**
1. Vai su **Materie** nella sidebar
2. Clicca **"Nuova materia"**
3. Inserisci Nome e Descrizione
4. Clicca **"Crea materia"**

#### Gestire i Corsi

**Creare un nuovo corso:**
1. Vai su **Corsi** nella sidebar
2. Clicca **"Nuovo corso"**
3. Seleziona la **Materia** (obbligatoria) e il **Concorso** (opzionale)
4. Inserisci Titolo e Descrizione
5. Clicca **"Crea corso"** — il corso viene creato in stato **Bozza**

**Aggiungere capitoli al corso:**
1. Dalla lista corsi, clicca **"Modifica"** sul corso
2. Nella sezione "Aggiungi capitolo", scrivi il titolo e clicca **"Aggiungi"**
3. I capitoli appaiono in ordine numerico

**Pubblicare il corso:**
1. Dalla pagina del corso, clicca **"Pubblica"** in alto a destra
2. Il corso diventa visibile nel catalogo pubblico
3. Per nasconderlo, clicca **"Metti in bozza"**

#### Gestire Slide e Capitoli

**Aggiungere slide a un capitolo:**
1. Dalla pagina del corso, clicca **"Slide"** sul capitolo che vuoi popolare
2. Scegli il tipo (Slide = contenuto didattico / Riassunto = punti chiave)
3. Scrivi il contenuto in **markdown** (puoi usare titoli ##, grassetto **, elenchi -, codice ``)
4. Clicca **"Aggiungi slide"**

**Riordinare le slide:**
- Usa i pulsanti **↑** e **↓** per spostare le slide nella sequenza desiderata

**Modificare una slide:**
1. Clicca **"Modifica"** sulla slide
2. Usa l'editor per cambiare il contenuto markdown
3. Clicca **"Anteprima"** per vedere il risultato visivo
4. Clicca **"Salva modifiche"** quando sei soddisfatto

**Eliminare una slide:**
- Clicca **"Elimina"** sulla slide che vuoi rimuovere

#### Caricare PDF e usare la Pipeline AI

**Caricare un PDF:**
1. Vai su **Materiali** nella sidebar
2. Clicca **"Carica PDF"**
3. Seleziona il **Concorso** di riferimento
4. Seleziona la **Materia** (opzionale)
5. Scegli il **Tipo** (Bando, Questionario o Dispensa)
6. Carica il file PDF
7. Clicca **"Carica e avvia generazione"**

**Cosa succede dopo:**
1. Il PDF viene archiviato su Supabase Storage
2. La pipeline AI parte automaticamente:
   - Estrae il testo dal PDF
   - Chiama l'intelligenza artificiale (OpenAI/Anthropic)
   - Genera capitoli, slide e quiz in bozza
3. Nella tabella **Materiali**, lo stato passa da "In coda" a "Elaborato" (o "Errore" in caso di fallimento)
4. I contenuti generati appaiono nei corsi in stato **Bozza** — pronti per essere revisionati e pubblicati

**Stati dei materiali:**
- 🟡 **In coda**: in attesa di elaborazione
- 🟢 **Elaborato**: pipeline completata con successo
- 🔴 **Errore**: la pipeline ha fallito (controlla la chiave API LLM)

#### Monitorare le Vendite

**Vedere gli incassi:**
1. Vai su **Vendite** nella sidebar
2. Nella parte superiore vedi 3 card riepilogo: **Totale incasso**, **Completati**, **In attesa**
3. Sotto, una tabella mostra tutti gli acquisti con:
   - Data, Utente, Corso, Importo, Stato del pagamento, Link alla ricevuta

**Scaricare una ricevuta:**
- Clicca sul link **"Ricevuta"** nella colonna Fattura per visualizzare/scaricare il documento HTML

---

## ⚙️ Impostazioni e Consigli

### Requisiti tecnici
- Browser moderno (Chrome, Firefox, Safari, Edge)
- Connessione internet (per caricare i contenuti del corso)
- Email valida per la registrazione

### Cosa fare se...
- **Non arriva l'email di conferma**: controlla la cartella spam, attendi qualche minuto
- **Non riesco ad accedere**: usa la funzione "Invia magic link" per ricevere un link via email
- **Il pagamento non va a buon fine**: contatta il supporto Stripe o riprova con un'altra carta
- **Il corso non appare dopo l'acquisto**: attendi qualche secondo e ricarica la pagina "I miei corsi"
- **La pipeline AI fallisce**: verifica che `LLM_API_KEY` sia configurata nelle impostazioni Vercel

### Suggerimenti per l'admin
- Pubblica i corsi **solo dopo aver revisionato** i contenuti generati dall'AI
- Usa l'anteprima markdown per verificare la formattazione prima di salvare
- Carica PDF di qualità (testo ben strutturato) per ottenere migliori risultati dall'AI
- I corsi in bozza **non sono visibili** agli utenti — puoi lavorarci senza preoccupazioni
