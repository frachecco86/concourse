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

## 9. Deploy su Vercel

| Attività | Stato | Note |
|----------|-------|------|
| Configurare chiavi Stripe/Resend in `.env.local` | ✅ Fatto | Tutte inserite, manca `STRIPE_WEBHOOK_SECRET` |
| `vercel.json` | ✅ Fatto | framework nextjs + pnpm |
| Repo GitHub creato | ✅ Fatto | `github.com/frachecco86/concourse` |
| Git history sanitizzata | ✅ Fatto | Secrets rimossi da commit history |
| Deploy su Vercel | ✅ Fatto | `https://concourse-omega.vercel.app` |
| Env vars su Vercel | ✅ Fatto | Tutte le variabili configurate come project env |
| `NEXT_PUBLIC_BASE_URL` aggiornata | ✅ Fatto | `https://concourse-omega.vercel.app` |
| Configurare webhook Stripe | ⏳ **Da fare** | Stripe Dashboard → Webhooks → Add endpoint |
| Configurare `LLM_API_KEY` | ⏳ **Da fare** | Chiave OpenAI per pipeline AI |
| Configurare `STRIPE_WEBHOOK_SECRET` | ⏳ **Da fare** | Dopo creazione webhook |
| Testare flusso completo | ⏳ **Da fare** | Registrazione → acquisto → email → accesso corso |
| Integrazione Satispay (opzionale) | ⏳ Rinviato | Seconda fase |

## 10. USER_STORIES.md generato

| Attività | Stato | Note |
|----------|-------|------|
| Reverse engineering codice | ✅ Fatto | Analizzati tutti i file sorgente |
| `USER_STORIES.md` creato | ✅ Fatto | 12 moduli, 627 linee, ruoli Guest/Utente/Admin |
| Formato standard user stories | ✅ Fatto | Come/Voglio/Affinché + Given/When/Then |

## 11. MANUALE_UTENTE.md generato

| Attività | Stato | Note |
|----------|-------|------|
| Guida Guest | ✅ Fatto | Accesso, navigazione, registrazione |
| Guida Utente Autenticato | ✅ Fatto | Acquisto, player, progresso |
| Guida Amministratore | ✅ Fatto | CRUD, pipeline AI, vendite |

## 12. Fix Cookie SSR + Supabase Site URL

| Attività | Stato | Note |
|----------|-------|------|
| Fix `getAll: () => ({} as any)` → `[]` | ✅ Fatto | Bug `@supabase/ssr` causava 404 su pagine dinamiche |
| Aggiornato `site_url` Supabase | ✅ Fatto | `http://localhost:3000` → `https://concourse-omega.vercel.app` |
| Token Management API salvato | ✅ Fatto | In `API_KEYS.md` (escluso da git) |

## 13. Demo Corso "Diritto Amministrativo"

| Attività | Stato | Note |
|----------|-------|------|
| Materia "Diritto Amministrativo" | ✅ Fatto | Con descrizione |
| Concorso "Comune di Milano" | ✅ Fatto | Stato aperto, 25 posti, slug configurato |
| Corso "Diritto Amministrativo" | ✅ Fatto | Ora gratuito (prezzo = 0), stato pubblicato |
| 5 capitoli | ✅ Fatto | Principi, Atti, Procedimento, Giustizia, Enti Locali |
| 14 slide totali | ✅ Fatto | Slide + riassunti in markdown |
| Link concorso-materia | ✅ Fatto | `concorsi_materie` creato |
| Accesso gratuito | ✅ Fatto | Checkout bypassa Stripe per corsi a prezzo 0 |
| Badge "Gratuito" su frontend | ✅ Fatto | Mostra Gratuito invece del prezzo |

## 14. Admin Account

| Attività | Stato | Note |
|----------|-------|------|
| Account admin creato | ✅ Fatto | `admin@concourse.app` / `Admin123!` |
| Ruolo admin assegnato | ✅ Fatto | `utenti_profili.ruolo = admin` |

## 15. Gestione LLM in Dashboard

| Attività | Stato | Note |
|----------|-------|------|
| Tabella `settings` creata | ✅ Fatto | Con RLS per admin |
| Migrazione 00004 | ✅ Fatto | `supabase/migrations/00004_settings_llm.sql` |
| Pagina admin `/admin/llm` | ✅ Fatto | Configura provider, modello, chiave API |
| API `/api/settings/llm` | ✅ Fatto | GET (legge) + POST (aggiorna) |
| API `/api/settings/llm/test` | ✅ Fatto | Testa connessione al provider LLM |
| Sidebar aggiornata | ✅ Fatto | Link "AI — LLM" con icona BrainCircuit |

## 16. Polish Completi (Impeccable)

| Pagina | Modifiche |
|--------|----------|
| `app/globals.css` | Focus ring globale, riduzione movimento, font-family corretto |
| `app/(pubblico)/page.tsx` | Hero spaziatura, card hover con translate, empty state, footer strutturato, transition-colors |
| `app/login/page.tsx` | Placeholder input, autoComplete, ruolo alert, separatore accessibile, transition-colors |
| `app/register/page.tsx` | Placeholder input, autoComplete, ruolo alert, success CTA button, transition-colors |
| `app/concorsi/[slug]/page.tsx` | Breadcrumb nav semantico, info box con bordi, prezzo display, footer, transition-colors |
| `app/corsi/[corsoId]/player/page.tsx` | Skeleton loading, empty state, progresso sidebar, useCallback, abort cleanup, prose typography |
| `app/miei-corsi/page.tsx` | Skeleton loading, empty state con CTA, cleanup cancelled flag, transition-colors |
| `app/admin/layout.tsx` | Active link detection con usePathname, transition-colors, icone stato attivo |

## 17. URL e Risorse

| Risorsa | URL |
|---------|-----|
| GitHub | `https://github.com/frachecco86/concourse` |
| Vercel (production) | `https://concourse-omega.vercel.app` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/qpclzfyehhzotqmqqwqe` |
| Stripe Dashboard | `https://dashboard.stripe.com/test/` |
| Resend Dashboard | `https://resend.com` |

## 18. Chiavi Stripe Configurate

| Variabile | Stato | Note |
|-----------|-------|------|
| `STRIPE_SECRET_KEY` | ✅ Inserita | `sk_test_...` (test mode) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Inserita | `pk_test_...` (test mode) |
| `STRIPE_WEBHOOK_SECRET` | ⏳ Manca | Da generare dopo deploy webhook |
| `API_KEYS.md` | ✅ Creato | Escluso da git, contiene tutte le chiavi |
| `src/lib/stripe/client.ts` | ✅ Refactoring | Lazy initialization per evitare crash a build time |
| `app/api/stripe/*/route.ts` | ✅ Aggiornato | Usano `getStripe()` lazy |
| `src/lib/email/send.ts` | ✅ Refactoring | Lazy initialization Resend |
| Build | ✅ Passa | 26 route, TypeScript OK |
| `RESEND_API_KEY` | ✅ Inserita | Email transazionali attive |
| Git commit `dd53cdf` | ✅ Fatto | Polish + DESIGN.md + sidecar + lazy init + chiavi |

