-- Migrazione 00003: Aggiunta prezzo a corsi/concorsi + campi Stripe
-- Deliverable 7 — Stripe, email, fatturazione

ALTER TABLE concorsi ADD COLUMN prezzo DECIMAL(10,2);
ALTER TABLE corsi ADD COLUMN prezzo DECIMAL(10,2);

ALTER TABLE corsi ADD COLUMN stripe_product_id TEXT;
ALTER TABLE corsi ADD COLUMN stripe_price_id TEXT;

ALTER TABLE acquisti ADD COLUMN stripe_session_id TEXT;
ALTER TABLE acquisti ADD COLUMN receipt_email TEXT;
ALTER TABLE acquisti ADD COLUMN dati_fatturazione JSONB;

CREATE INDEX IF NOT EXISTS idx_acquisti_stripe_session ON acquisti(stripe_session_id);
