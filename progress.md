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
| `src/types/database.ts` | ✅ Fatto | TypeScript types per tutte le tabelle |

---

## 3. Schema Database + RLS (Deliverable 1)

| Attività | Stato | Note |
|----------|-------|------|
| Migrazione schema SQL (00001) | ✅ Fatto | 14 tabelle: concorsi, materie, corsi, capitoli, slide, quiz, domande, materiali, utenti, acquisti, iscrizioni, progressi, risultati |
| Migrazione RLS SQL (00002) | ✅ Fatto | Policy per ogni tabella: admin CRUD, utente vede propri dati, accesso corsi verificato |
| **Applicazione migrazioni al DB** | ✅ Fatto | Connection string session pooler funzionante |

---

## 🚧 Criticità e Blocchi

### ✅ Criticità #1: Risolta — Connessione al Database Supabase

### ✅ Criticità #1: Risolta — Connessione al Database Supabase

**Soluzione:** Connection string session pooler fornita dall'utente:
`postgresql://postgres.qpclzfyehhzotqmqqwqe:DB_PASSWORD_PLACEHOLDER@aws-0-eu-north-1.pooler.supabase.com:5432/postgres`

**Risultato:** Schema e RLS applicati con successo (14 tabelle, tutte le policies).

**Nota:** La service role key rimane malformata — da rigenerare dal dashboard per uso futuro.

---

### 🟡 Criticità #2: Service Role Key Malformata

**Problema:** La service role key fornita ha un errore nel payload JWT. La chiave:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwY2x6ZnllaGh6b3RxbXFxd3FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUyMTkxOCwiZXhwOjIwOTkwOTc5MTh9.5AaPmnddMDSQeDO3Y7zAnrh_r7JmjjqPP6EI3qQvkw0
```

Ha il campo `exp` scritto come `"exp:2099097918}` (due punti dentro le virgolette) invece di `"exp":2099097918`. Il JWT viene quindi rifiutato da Supabase.

**Soluzione:** Generare una nuova service role key dal dashboard Supabase.

---

### 🟢 Note e Informazioni

- `sb_secret_xxx_placeholder` → funziona per chiamate REST API
- `sb_publishable_Lr17z2TU2F7y5z-34xXO-g_SckF8mdp` → anon key per client-side
- Password DB: `DB_PASSWORD_PLACEHOLDER` → probabilmente corretta ma manca host pooler giusto

---

## 4. Deliverable Ancora da Fare

| # | Deliverable | Stato | Note |
|---|------------|-------|------|
| 1 | Schema DB + RLS | ✅ Fatto | Migrazioni SQL applicate, 14 tabelle + RLS attivi |
| 2 | Autenticazione + area admin | ✅ Fatto | Login/register, proxy auth, admin layout, CRUD concorsi/materie/corsi |
| 3 | Upload PDF + pipeline AI | ✅ Fatto | Storage bucket, upload PDF, trigger pipeline, struttura bozza pronta |
| 4 | Editor revisione admin | ✅ Fatto | Editor markdown con anteprima, drag&drop slide, pubblicazione bozza/pubblicato |
| 5 | Landing page + catalogo | ✅ Fatto | Hero, dettaglio concorso, sitemap, schema.org Course structured data |
| 6 | Area utente + player corso | ✅ Fatto | Dashboard 'I miei corsi', player con sidebar capitoli, navigazione slide, segna completato |
| 7 | Stripe + email + fatturazione | ❌ Da fare | Checkout, webhook, fatture, email transazionali |

---

## 5. File Creati (nuovi)

| File | Descrizione |
|-----|-------------|
| `proxy.ts` | Auth proxy (Next.js 16 middleware) |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `app/actions/auth.ts` | Server actions auth |
| `app/(pubblico)/page.tsx` | Landing page pubblica |
| `app/login/page.tsx` | Pagina login |
| `app/register/page.tsx` | Pagina registrazione |
| `app/auth/callback/route.ts` | OAuth callback |
| `app/logout/route.ts` | Logout route |
| `app/admin/layout.tsx` | Admin layout con sidebar |
| `app/admin/page.tsx` | Admin dashboard |
| `app/admin/concorsi/page.tsx` | Lista concorsi |
| `app/admin/concorsi/new/page.tsx` | Nuovo concorso |
| `app/admin/concorsi/[id]/edit/page.tsx` | Modifica concorso |
| `app/admin/materie/page.tsx` | Lista materie |
| `app/admin/materie/new/page.tsx` | Nuova materia |
| `app/admin/corsi/page.tsx` | Lista corsi |
| `app/admin/corsi/new/page.tsx` | Nuovo corso |
| `app/admin/corsi/[id]/page.tsx` | Editor corso (capitoli, pubblicazione) |
| `app/admin/corsi/[id]/capitoli/[capitoloId]/page.tsx` | Slide list con drag&drop ordine |
| `app/admin/corsi/[id]/capitoli/[capitoloId]/slide/[slideId]/edit/page.tsx` | Editor markdown con anteprima |
| `app/admin/materiali/page.tsx` | Lista materiali origine |
| `app/admin/materiali/upload/page.tsx` | Upload PDF + trigger AI |
| `app/api/generazione/trigger/route.ts` | API route pipeline AI |
| `supabase/storage bucket` | Bucket 'materiali' creato |



| File | Descrizione |
|-----|-------------|
| `PRODUCT.md` | Product design document (register: product) |
| `instructions.md` | Prompt originale + appendice browser testing |
| `src/lib/supabase/client.ts` | Client Supabase per browser |
| `src/types/database.ts` | TypeScript types per tutte le tabelle |
| `supabase/migrations/00001_schema.sql` | Schema DB (14 tabelle) |
| `supabase/migrations/00002_rls_policies.sql` | Row Level Security policies |
| `.env.local` | Credenziali Supabase |
| `app/` | Next.js App Router base |
| `package.json` | Dipendenze Next.js + Supabase |
| `app/concorsi/[slug]/page.tsx` | Pagina dettaglio concorso pubblico + SEO |
| `app/sitemap.ts` | Sitemap dinamica per SEO |
| `app/miei-corsi/page.tsx` | Dashboard utente con barre progresso |
| `app/corsi/[corsoId]/player/page.tsx` | Player corso con sidebar e navigazione |
| `src/lib/ai/provider.ts` | Client LLM provider-agnostic |
| `src/lib/ai/generazione.ts` | Pipeline AI completa (PDF → LLM → bozza) |
| `app/admin/materiali/page.tsx` | Lista materiali origine |
| `app/admin/materiali/upload/page.tsx` | Upload PDF + trigger AI |
| `app/admin/corsi/[id]/page.tsx` | Editor corso con capitoli |
| `app/admin/corsi/[id]/capitoli/[capitoloId]/page.tsx` | Slide list con riordino |
| `app/admin/corsi/[id]/capitoli/[capitoloId]/slide/[slideId]/edit/page.tsx` | Editor markdown con anteprima |
| `app/api/generazione/trigger/route.ts` | API route pipeline AI |
