-- Migrazione 00004: Tabella settings per configurazione LLM
-- Permette all'admin di configurare provider, API key e modello AI

CREATE TABLE IF NOT EXISTS settings (
  id text primary key default 'llm',
  provider text not null default 'openai',
  api_key text not null default '',
  model text not null default 'gpt-4o',
  updated_at timestamptz default now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Solo admin può leggere/scrivere settings
CREATE POLICY "admin_gestisce_settings"
  ON settings FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Inserisce record default se non esiste
INSERT INTO settings (id, provider, api_key, model)
VALUES ('llm', 'openai', '', 'gpt-4o')
ON CONFLICT (id) DO NOTHING;
