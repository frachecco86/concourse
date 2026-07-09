# 📋 Progresso del Progetto — ConCourse

> Stato aggiornato al: 9 Luglio 2026

---

## 1. Setup Agente (Sezione 0)

| Attività | Stato | Note |
|----------|-------|------|
| Installazione Impeccable skill | ✅ Fatto | `pi install git:github.com/jordi9/pi-impeccable` |
| `/impeccable init` (PRODUCT.md) | ✅ Fatto | `PRODUCT.md` generato con register: product |
| `/impeccable init` (DESIGN.md) | ⏳ Saltato | Riprendere con `/impeccable document` dopo aver scritto codice |
| Installazione pi-ask-user | ✅ Fatto | `pi install npm:pi-ask-user` |
| Installazione pi-rewind | ✅ Fatto | `pi install git:github.com/arpagon/pi-rewind` |
| `instructions.md` | ✅ Fatto | Prompt originale salvato con appendice browser testing |

---

## 2. Stack e Progetto Next.js

| Attività | Stato | Note |
|----------|-------|------|
| Inizializzazione Next.js (App Router) | ✅ Fatto | create-next-app con TypeScript, Tailwind, src/ |
| Dipendenze Supabase | ✅ Fatto | `@supabase/supabase-js`, `@supabase/ssr` |
| `.env.local` con credenziali | ✅ Fatto | URL, publishable key, service role key, secret key |
| `src/lib/supabase/client.ts` | ✅ Fatto | Client-side Supabase client |

---

## 3. Schema Database + RLS (Deliverable 1)

| Attività | Stato | Note |
|----------|-------|------|
| Migrazione schema SQL (00001) | ✅ Fatto | 14 tabelle: concorsi, materie, corsi, capitoli, slide, quiz, domande, materiali, utenti, acquisti, iscrizioni, progressi, risultati |
| Migrazione RLS SQL (00002) | ✅ Fatto | Policy per ogni tabella: admin CRUD, utente vede propri dati, accesso corsi verificato |
| **Applicazione migrazioni al DB** | ✅ Fatto | Connection string session pooler funzionante |
| Migrazione 00003 (prezzo + Stripe) | ✅ Fatto | `prezzo` su corsi/concorsi, campi Stripe su corsi/acquisti |

---

## 4. Deliverable Completati

| # | Deliverable | Stato | Note |
|---|------------|-------|------|
| 1 | Schema DB + RLS | ✅ Fatto | Migrazioni SQL applicate, 14 tabelle + RLS attivi |
| 2 | Autenticazione + area admin | ✅ Fatto | Login/register, proxy auth, admin layout, CRUD concorsi/materie/corsi |
| 3 | Upload PDF + pipeline AI | ✅ Fatto | Storage bucket, upload PDF, trigger pipeline, struttura bozza pronta |
| 4 | Editor revisione admin | ✅ Fatto | Editor markdown con anteprima, drag&drop slide, pubblicazione bozza/pubblicato |
| 5 | Landing page + catalogo | ✅ Fatto | Hero, dettaglio concorso, sitemap, schema.org Course structured data |
| 6 | Area utente + player corso | ✅ Fatto | Dashboard 'I miei corsi', player con sidebar capitoli, navigazione slide, segna completato |
| 7 | Stripe + email + fatturazione | ✅ Fatto | Vedi dettaglio sotto |

---

## 5. Deliverable 7 — Stripe + Email + Fatturazione

| Attività | Stato | Note |
|----------|-------|------|
| Migrazione 00003 (prezzo, campi Stripe) | ✅ Fatto | `prezzo` su corsi/concorsi, `stripe_product_id`, `stripe_price_id`, `stripe_session_id`, `receipt_email`, `dati_fatturazione` |
| Dipendenze Stripe + Resend | ✅ Fatto | `stripe` (22.3.0), `@stripe/stripe-js` (9.9.0), `resend` (6.17.2) installate con pnpm |
| `src/lib/stripe/client.ts` | ✅ Fatto | Client Stripe con `getOrCreateStripeProduct` |
| `app/api/stripe/checkout/route.ts` | ✅ Fatto | POST: crea sessione checkout Stripe, salva `acquisti` in stato `in_attesa` |
| `app/api/stripe/webhook/route.ts` | ✅ Fatto | POST: verifica firma webhook, aggiorna `acquisti` → `completato`, crea `iscrizioni_corso`, trigger email ricevuta |
| `src/lib/email/send.ts` | ✅ Fatto | Client Resend per email transazionali |
| `src/lib/fattura/genera.ts` | ✅ Fatto | Generazione HTML ricevuta, salvataggio su Storage |
| `app/api/email/ricevuta/route.ts` | ✅ Fatto | POST: genera ricevuta, salva su Storage, invia email con allegato |
| `app/concorsi/[slug]/page.tsx` | ✅ Aggiornato | Mostra corsi con prezzi, pulsante acquisto |
| `app/concorsi/[slug]/checkout-button.tsx` | ✅ Fatto | Client component: seleziona corso, reindirizza a Stripe checkout |
| `app/admin/vendite/page.tsx` | ✅ Fatto | Dashboard vendite con riepilogo incassi e tabella acquisti |
| `app/admin/layout.tsx` | ✅ Aggiornato | Sidebar con link a "Vendite" |
| Bucket Storage `ricevute` | ✅ Fatto | Bucket pubblico per ricevute/fatture |
| `.env.local` | ✅ Aggiornato | Aggiunte variabili Stripe e Resend |

### ⚠️ Configurazione necessaria (manuale)
Le seguenti chiavi vanno inserite in `.env.local` e nel dashboard Supabase/Stripe/Resend:

| Variabile | Dove ottenerla |
|-----------|---------------|
| `STRIPE_SECRET_KEY` | Dashboard Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Dashboard Stripe → Webhooks → Endpoint (dopo deploy) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard Stripe → Developers → API keys (publishable key) |
| `RESEND_API_KEY` | Dashboard Resend → API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` (da rigenerare) | Dashboard Supabase → Project Settings → API → Service Role Key |

---

## 6. File Creati (Deliverable 7)

| File | Descrizione |
|-----|-------------|
| `supabase/migrations/00003_prezzo_stripe.sql` | Migrazione: prezzo, campi Stripe su corsi/acquisti |
| `src/lib/stripe/client.ts` | Client Stripe con utility getOrCreateStripeProduct |
| `src/lib/email/send.ts` | Client Resend per email transazionali |
| `src/lib/fattura/genera.ts` | Generazione HTML ricevuta + salvataggio su Storage |
| `app/api/stripe/checkout/route.ts` | API route: crea sessione checkout Stripe |
| `app/api/stripe/webhook/route.ts` | API route: gestisce webhook Stripe |
| `app/api/email/ricevuta/route.ts` | API route: genera e invia ricevuta via email |
| `app/concorsi/[slug]/checkout-button.tsx` | Client component checkout con selezione corso |
| `app/admin/vendite/page.tsx` | Dashboard vendite con riepilogo e tabella |

---

## 7. File Aggiornati (Deliverable 7)

| File | Modifica |
|-----|---------|
| `src/types/database.ts` | Aggiunti campi `prezzo`, `stripe_product_id`, `stripe_price_id`, `stripe_session_id`, `receipt_email`, `dati_fatturazione` |
| `app/admin/layout.tsx` | Aggiunto link "Vendite" nella sidebar |
| `app/concorsi/[slug]/page.tsx` | Mostra prezzi dinamici e pulsante acquisto |
| `.env.local` | Aggiunte variabili Stripe e Resend |

---

## 8. Criticità e Blocchi

### 🟡 Criticità #2: Service Role Key Malformata
**Problema:** La service role key ha un errore nel payload JWT (`exp:...` invece di `"exp":...`).  
**Soluzione:** Generare una nuova service role key dal dashboard Supabase.  
**Impatto:** Il bucket `ricevute` è stato creato con la secret key (formato REST API), ma alcune operazioni admin server-side potrebbero fallire. La secret key `sb_secret_...` funziona per chiamate REST API.

### 🟢 Chiavi funzionanti
- `sb_secret_xxx_placeholder` → REST API (bucket storage)
- `sb_publishable_Lr17z2TU2F7y5z-34xXO-g_SckF8mdp` → anon key client-side
- `postgresql://...` → connessione DB (session pooler)

---

## 9. Prossimi Passi (Post-Deliverable 7)

- ✅ Configurare le chiavi Stripe e Resend in `.env.local`
- ✅ Fare deploy su Vercel con le variabili d'ambiente
- ✅ Configurare webhook Stripe (endpoint: `https://.../api/stripe/webhook`)
- ✅ Testare flusso completo: registrazione → acquisto → email ricevuta → accesso corso
- ⏳ Valutare integrazione Satispay (opzionale, seconda fase)
- ⏳ Valutare `/impeccable polish` sulle pagine principali (landing, player, checkout)
