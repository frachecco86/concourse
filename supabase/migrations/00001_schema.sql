-- ─────────────────────────────────────────────────────────────────────
-- Schema completo: ConCourse — Piattaforma Corsi Concorsi Pubblici
-- ─────────────────────────────────────────────────────────────────────

-- Abilita UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Concorsi ──────────────────────────────────────────────────────
CREATE TABLE concorsi (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titolo      TEXT NOT NULL,
  ente        TEXT NOT NULL,
  descrizione TEXT,
  stato       TEXT NOT NULL DEFAULT 'aperto' CHECK (stato IN ('aperto', 'chiuso')),
  data_scadenza_bando TIMESTAMPTZ,
  numero_posti        INT,
  link_bando_ufficiale TEXT,
  slug        TEXT NOT NULL UNIQUE,
  cover_image TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Materie ───────────────────────────────────────────────────────
CREATE TABLE materie (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  descrizione TEXT
);

-- ─── Concorsi <-> Materie (many-to-many) ──────────────────────────
CREATE TABLE concorsi_materie (
  concorso_id UUID NOT NULL REFERENCES concorsi(id) ON DELETE CASCADE,
  materia_id  UUID NOT NULL REFERENCES materie(id) ON DELETE CASCADE,
  PRIMARY KEY (concorso_id, materia_id)
);

-- ─── Corsi ─────────────────────────────────────────────────────────
CREATE TABLE corsi (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id  UUID NOT NULL REFERENCES materie(id) ON DELETE CASCADE,
  concorso_id UUID REFERENCES concorsi(id) ON DELETE SET NULL,
  titolo      TEXT NOT NULL,
  descrizione TEXT,
  stato       TEXT NOT NULL DEFAULT 'bozza' CHECK (stato IN ('bozza', 'pubblicato'))
);

-- ─── Capitoli ──────────────────────────────────────────────────────
CREATE TABLE capitoli (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corso_id UUID NOT NULL REFERENCES corsi(id) ON DELETE CASCADE,
  ordine   INT  NOT NULL CHECK (ordine > 0),
  titolo   TEXT NOT NULL
);

CREATE INDEX idx_capitoli_corso_ordine ON capitoli(corso_id, ordine);

-- ─── Slide ─────────────────────────────────────────────────────────
CREATE TABLE slide (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capitolo_id UUID NOT NULL REFERENCES capitoli(id) ON DELETE CASCADE,
  ordine     INT  NOT NULL CHECK (ordine > 0),
  contenuto  TEXT NOT NULL,                        -- markdown / JSON
  tipo       TEXT NOT NULL DEFAULT 'slide' CHECK (tipo IN ('slide', 'riassunto'))
);

CREATE INDEX idx_slide_capitolo_ordine ON slide(capitolo_id, ordine);

-- ─── Quiz ──────────────────────────────────────────────────────────
CREATE TABLE quiz (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capitolo_id UUID NOT NULL REFERENCES capitoli(id) ON DELETE CASCADE,
  titolo     TEXT NOT NULL
);

-- ─── Domande ───────────────────────────────────────────────────────
CREATE TABLE domande (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  testo           TEXT NOT NULL,
  tipo            TEXT NOT NULL DEFAULT 'scelta_multipla' CHECK (tipo IN ('scelta_multipla')),
  opzioni         JSONB NOT NULL,
  risposta_corretta TEXT NOT NULL,
  spiegazione     TEXT
);

-- ─── Materiali origine (PDF bandi/questionari) ─────────────────────
CREATE TABLE materiali_origine (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concorso_id       UUID NOT NULL REFERENCES concorsi(id) ON DELETE CASCADE,
  materia_id        UUID REFERENCES materie(id) ON DELETE SET NULL,
  file_url          TEXT NOT NULL,
  tipo              TEXT NOT NULL CHECK (tipo IN ('bando', 'questionario', 'dispensa')),
  stato_elaborazione TEXT NOT NULL DEFAULT 'in_coda'
                     CHECK (stato_elaborazione IN ('in_coda', 'elaborato', 'errore'))
);

-- ─── Utenti profili (esteso da auth.users) ─────────────────────────
CREATE TABLE utenti_profili (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome              TEXT NOT NULL,
  cognome           TEXT NOT NULL,
  dati_fatturazione JSONB,  -- { ragione_sociale, cf, p_iva, indirizzo }
  ruolo             TEXT NOT NULL DEFAULT 'utente' CHECK (ruolo IN ('utente', 'admin'))
);

-- ─── Acquisti ──────────────────────────────────────────────────────
CREATE TABLE acquisti (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utente_id           UUID NOT NULL REFERENCES utenti_profili(id) ON DELETE CASCADE,
  corso_id            UUID REFERENCES corsi(id) ON DELETE SET NULL,
  concorso_id         UUID REFERENCES concorsi(id) ON DELETE SET NULL,
  importo             DECIMAL(10,2) NOT NULL,
  stato_pagamento     TEXT NOT NULL DEFAULT 'in_attesa',
  provider            TEXT NOT NULL,
  provider_payment_id TEXT,
  fattura_url         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Iscrizioni corso (derivate da acquisti) ───────────────────────
CREATE TABLE iscrizioni_corso (
  utente_id    UUID NOT NULL REFERENCES utenti_profili(id) ON DELETE CASCADE,
  corso_id     UUID NOT NULL REFERENCES corsi(id) ON DELETE CASCADE,
  data_acquisto TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (utente_id, corso_id)
);

-- ─── Progressi ─────────────────────────────────────────────────────
CREATE TABLE progressi (
  utente_id         UUID NOT NULL REFERENCES utenti_profili(id) ON DELETE CASCADE,
  capitolo_id       UUID NOT NULL REFERENCES capitoli(id) ON DELETE CASCADE,
  stato             TEXT NOT NULL DEFAULT 'non_iniziato'
                    CHECK (stato IN ('non_iniziato', 'in_corso', 'completato')),
  data_completamento TIMESTAMPTZ,
  PRIMARY KEY (utente_id, capitolo_id)
);

-- ─── Risultati quiz ────────────────────────────────────────────────
CREATE TABLE risultati_quiz (
  utente_id UUID NOT NULL REFERENCES utenti_profili(id) ON DELETE CASCADE,
  quiz_id   UUID NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
  punteggio INT  NOT NULL,
  risposte  JSONB NOT NULL,
  data      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (utente_id, quiz_id)
);
