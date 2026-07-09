---
name: "ConCourse"
description: "Piattaforma per la vendita e fruizione di corsi di preparazione ai concorsi pubblici italiani"
colors:
  primary: "#171717"
  primary-hover: "#1a1a1a"
  neutral-bg: "#fafafa"
  neutral-surface: "#ffffff"
  neutral-border: "#e4e4e7"
  neutral-muted: "#a1a1aa"
  neutral-ink: "#171717"
  success: "#059669"
  success-bg: "#ecfdf5"
  info: "#2563eb"
  info-bg: "#eff6ff"
  warning: "#d97706"
  warning-bg: "#fffbeb"
  danger: "#dc2626"
  danger-bg: "#fef2f2"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
    textTransform: "uppercase"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary-hover:
    borderColor: "{colors.neutral-border}"
    backgroundColor: "{colors.neutral-bg}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "24px"
  chip:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: ConCourse

## 1. Overview

**Creative North Star: "The Studio Cattedra"**

Una piattaforma che sembra un'aula di studio ben organizzata — non un portale burocratico, non una app gamificata. Ogni schermo è costruito attorno al contenuto: la navigazione è strumento, non protagonista. Le palette è trattenuta (neutri caldi con un accento single — il nero profondo dei titoli e dei CTA primari). Il bianco e lo zinco creano strati sottili senza ombre invasive. I tocchi di colore (verde per completato, blu per materie, ambra per avvisi) sono semantici, non decorativi.

Il sistema rifiuta esplicitamente: clutter, sidebar affollate, gamification aggressiva, stile PA italiana classica (tritonali, stemmi, burocrazia visiva), gradienti decorativi, vetro glassmorphism, e card nidificate.

**Key Characteristics:**
- **Calma visiva** — molto spazio bianco, gerarchia chiara, niente elementi che competono per attenzione
- **Mobile-first** — ogni pagina funziona su schermo piccolo, la densità aumenta su desktop
- **Semantica coi colori** — ogni colore ha un significato (verde=completato, blu=materia, ambra=attenzione, rosso=errore)
- **Contenuto al centro** — player, slide, quiz: tutto è costruito attorno al materiale di studio
- **Admin tool-like** — dashboard, tabelle, CRUD con vocabolario coerente: stessi bottoni, stesse form, stessi tag

## 2. Colors: The Studio Zinc Palette

La palette è **Restrained**: neutri tinti al brand (zinco caldo) con un accento singolo (nero profondo) che porta ≤10% della superficie. I colori secondari (verde, blu, ambra, rosso) sono puramente semantici — appaiono solo per stati, badge e indicatori.

### Primary
- **Deep Ink** (`#171717` / oklch(0.12 0 0)): Testo corpo principale, titoli, bottoni primari, link attivi. È l'unico accento strutturale. La sua rarità su schermo (mai più del 10% della superficie) è intenzionale: quando appare, comunica azione o attenzione.

### Neutral
- **Paper** (`#ffffff`): Sfondo principale del contenuto. Card, form, tabelle, sidebar.
- **Studio** (`#fafafa` / zinc-50): Sfondo secondario della pagina. Crea stratificazione senza ombre.
- **Line** (`#e4e4e7` / zinc-200): Bordi di card, input, tabelle, divisori. Sottile (1px), mai in evidenza.
- **Muted** (`#a1a1aa` / zinc-400): Testo secondario, placeholder, icone disabilitate.
- **Ink** (`#171717` / zinc-900): Testo primario. Stessa famiglia del primary, ma usato come colore di testo generale.
- **Soft Ink** (`#52525b` / zinc-600): Testo descrittivo, label, metadati. Leggermente più chiaro dell'ink per gerarchia.
- **Cloud** (`#e4e4e7` / zinc-200): Sfondo di stati inattivi, badge "chiuso", tag disabilitati.
- **Elevated** (`#f4f4f5` / zinc-100): Hover su righe tabella, hover su link sidebar.

### Semantic Colors
- **Success Emerald** (`#059669` / emerald-600): Badge completato, barra di progresso, stato pagamento ok. Usato solo per conferma visiva.
- **Success Pale** (`#ecfdf5` / emerald-50): Sfondo badge completato, sfondo notifica successo.
- **Info Blue** (`#2563eb` / blue-700): Badge materia, tag "slide", link esterni.
- **Info Pale** (`#eff6ff` / blue-50): Sfondo badge materia.
- **Warning Amber** (`#d97706` / amber-700): Badge "in attesa", stato pagamento pending, tag "riassunto".
- **Warning Pale** (`#fffbeb` / amber-50): Sfondo badge warning.
- **Danger Red** (`#dc2626` / red-600): Testo errore, bottone elimina, badge fallito.
- **Danger Pale** (`#fef2f2` / red-50): Sfondo badge danger, hover su azioni distruttive.

### Named Rules
**The One Voice Rule.** Il nero profondo (`#171717`) è usato su ≤10% di ogni schermo. Bottoni primari, titoli, CTA. La sua rarità è il punto.

**The Semantic Color Rule.** I colori (verde, blu, ambra, rosso) appaiono SOLO come badge, sfondo badge, barra di progresso, o testo di stato. Mai come decorazione, mai come colore primario di un componente.

## 3. Typography

**Display Font:** Geist (system-ui, sans-serif) — un geometric sans progettato per schermo. Leggero tracking negativo per titoli.
**Body Font:** Geist (system-ui, sans-serif) — stessa famiglia, nessun pairing. Un family basta.
**Label/Mono Font:** Geist Mono (monospace) — per codice, metadati numerici, percorsi.

**Character:** Pulito, moderno, senza ornamenti. La gerarchia è ottenuta con peso e dimensione, non con font diversi. Leggibile su mobile, confortevole su desktop.

### Hierarchy
- **Display** (600, clamp(1.5rem, 4vw, 3rem), 1.1): Titoli di pagina hero e dettaglio concorso. `text-wrap: balance`. Tracking -0.03em.
- **Headline** (600, 1.25rem, 1.2): Titoli di sezione, dashboard card title, sidebar admin. `text-wrap: balance`.
- **Title** (600, 1rem, 1.4): Titoli di card corso, nomi concorso in tabelle, link navigazione.
- **Body** (400, 0.875rem, 1.6): Testo descrittivo, contenuto slide, paragrafi. Line length 65–75ch per la prosa, denso per dati/tabelle. `text-wrap: pretty` su paragrafi lunghi.
- **Label** (500, 0.75rem, 1.4, 0.05em tracking, uppercase): Etichette di campo, intestazioni tabella, badge, metadati, "uppercase tracking" riservato a label funzionali — mai per sezioni decorative.

### Named Rules
**The One Family Rule.** Geist per tutto. Nessuna eccezione per display/body pairing su pagine pubbliche. Un font, ben pesato, basta.

**The No Eyebrow Rule.** Mai usare testo uppercase con tracking largo come "kicker" decorativo sopra le sezioni. Le label uppercase esistono solo per intestazioni di tabella, label di form, e badge — mai come decorazione di sezione.

## 4. Elevation

Il sistema è **flat-first**: le superfici sono piatte a riposo. La profondità è creata da stratificazione di sfondi (bianco su zinc-50) e da bordi sottili (1px), non da ombre. Le ombre sono un'eccezione, usate solo come risposta a stato.

### Shadow Vocabulary
- **`shadow-sm`** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)`): Card a riposo, tabelle. Leggerissimo, appena percettibile.
- **`shadow-md`** (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)`): Hover su card cliccabili. Unico shadow che appare come risposta a interazione.

### Named Rules
**The Flat-By-Default Rule.** Le superfici sono piatte a riposo. Le ombre appaiono solo come risposta a stato (hover su card). Per stratificazione, usa sfondi diversi (bianco su zinc-50) prima di ricorrere a ombre.

## 5. Components

### Buttons
- **Shape:** Leggermente arrotondati (8px), mai pill. Padding orizzontale generoso (16px) per touch target.
- **Primary:** Sfondo `#171717`, testo bianco. Hover: `#1a1a1a` (leggermente più chiaro). Transizione: 150ms ease. Disabilitato: opacità 50%.
- **Secondary (ghost):** Bordo `#e4e4e7`, testo `#171717`. Hover: sfondo `#f4f4f5`. Usato per "Annulla", "Precedente", azioni secondarie.
- **Destructive:** Testo rosso (`#dc2626`), nessun bordo o sfondo. Hover: sfondo `#fef2f2`. Usato per "Elimina".
- **CTA Hero:** Invertito su sfondo scuro: sfondo bianco, testo nero. Hover: `bg-zinc-100`.

### Chips / Tags
- **Style:** Pill (9999px), sfondo semantico (info-bg, success-bg, warning-bg, danger-bg), testo semantico scuro. Padding 4px 12px.
- **Stato badge:** Pill piccolo con sfondo semantico. "Aperto" = success-pale, "Chiuso" = cloud. "Completato" = success-pale, "In attesa" = warning-pale.
- **Materia tag:** Pill blu-info su sfondo info-pale. Testo `#2563eb`.

### Cards / Containers
- **Corner Style:** 12px (rounded-xl). Mai pill, mai 24px+.
- **Background:** Bianco (`#ffffff`) su sfondo pagina (`#fafafa`). La stratificazione è il punto.
- **Shadow Strategy:** `shadow-sm` a riposo, `shadow-md` su hover per card navigabili. Vedi sezione Elevation.
- **Border:** 1px solid `#e4e4e7`. Mai bordo sinistro colorato come accento.
- **Internal Padding:** 24px (p-6). Su mobile scende a 16px.
- **Card cliccabile:** Hover fa salire lo shadow a `shadow-md`. Transizione 150ms ease.

### Inputs / Fields
- **Style:** Bordo 1px `#e4e4e7`, sfondo bianco, 8px radius. Padding 8px 12px.
- **Focus:** Bordo `#171717` (ink), nessun glow. Outline-none con focus-visible rimesso via CSS nativo.
- **Error:** Bordo rosso (`#dc2626`), testo errore sotto il campo.
- **Disabled:** Sfondo `#f4f4f5`, testo `#a1a1aa`, opacità ridotta.

### Tables
- **Style:** Bordo 1px `#e4e4e7`, sfondo bianco, `shadow-sm`. Intestazioni con label uppercase e colore muted.
- **Row hover:** `bg-zinc-50`.
- **Empty state:** Testo muted centrato, colonna estesa.
- **Responsive:** Overflow-x-auto su mobile. Mai denso a rottura di riga.

### Navigation (Admin Sidebar)
- **Style:** Sidebar fissa 240px, sfondo bianco, bordo destro. Logo in alto (badge CC su bg-zinc-900).
- **Link:** Rounded 8px, padding 8px 12px, icona 16px + label. Default: `text-zinc-600`. Hover: `bg-zinc-100`, `text-zinc-900`. Attivo: da implementare con `bg-zinc-900 text-white`.
- **Bottom:** Link "Esci" con hover rosso-bg.

### Navigation (Pubblica)
- **Top bar:** Sfondo bianco, bordo sotto, max-w-6xl centrato. Logo a sinistra, link a destra. Mobile: hamburger (da implementare).

### Progress Bar
- **Style:** 8px height, `rounded-full` bg `#e4e4e7`. Fill `#059669` (success) con `transition-all`. Label numerica a sinistra, percentuale a destra.
- **Usato in:** Card "I miei corsi", dettaglio concorso (sezione corsi).

### Player Sidebar
- **Style:** Sidebar 288px fissa, sfondo bianco, bordo destro. Elenco capitoli con stato.
- **Capitolo attivo:** `bg-zinc-900 text-white`.
- **Capitolo completato:** `bg-success-pale text-success`.
- **Capitolo inattivo:** `text-zinc-600 hover:bg-zinc-100`.

## 6. Do's and Don'ts

### Do:
- **Do** usare la stratificazione di sfondi (bianco su zinc-50) per profondità, non ombre.
- **Do** riservare i colori semantici (verde, blu, ambra, rosso) esclusivamente per stati, badge, e indicatori.
- **Do** mantenere i bottoni primari in nero profondo su tutta la piattaforma — stesso componente, stesso colore, stesso comportamento.
- **Do** usare `shadow-sm` per card a riposo e `shadow-md` solo per hover su card cliccabili.
- **Do** testare ogni pagina a 320px viewport — molte card e tabelle devono funzionare su mobile.
- **Do** usare `text-wrap: balance` su titoli e `text-wrap: pretty` su paragrafi lunghi.
- **Do** mettere lo stato "vuoto" per ogni lista/tabella con messaggio chiaro e testuale.
- **Do** mostrare scheletri (skeleton) per il caricamento, non spinner generici.
- **Do** supportare `prefers-reduced-motion` disattivando ogni transizione/animazione non essenziale.

### Don't:
- **Don't** usare clutter, sidebar affollate, elementi superflui. Il contenuto è al centro — nessuna pubblicità, nessuna distrazione.
- **Don't** usare gamification aggressiva — niente badge vistosi, leaderboard, o elementi "gioco". Il tono deve rimanere professionale.
- **Don't** usare stile PA italiana classica — niente tritonali, stemmi, burocrazia visiva. L'aspetto deve essere moderno e pulito.
- **Don't** usare gradienti decorativi (`background-clip: text` con gradient, sfondi gradienti su card).
- **Don't** usare glassmorphism (blur e vetro) come default decorativo.
- **Don't** usare bordo sinistro colorato maggiore di 1px come accento su card, list item, o callout.
- **Don't** usare il pattern "eyebrow" (testo uppercase con tracking sopra ogni sezione) — non è un kicker decorativo.
- **Don't** usare numerazione di sezione 01/02/03 come scaffolding su ogni sezione — solo per sequenze reali.
- **Don't** usare `border-radius` maggiore di 12px su card, sezioni, input — 24px+ è over-rounding.
- **Don't** usare ombra e bordo insieme sullo stesso elemento — scegli uno solo.
- **Don't** nidificare card — una card non deve mai contenere un'altra card.
- **Don't** usare display font in UI label, bottoni, o dati — Geist basta per tutto.
- **Don't** usare la modale come prima soluzione — esaurisci alternative inline/progressive prima.
- **Don't** pubblicare automaticamente contenuti AI in produzione — tutto passa per revisione admin (bozza → revisione → pubblicato).
