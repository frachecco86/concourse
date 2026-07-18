-- ═══════════════════════════════════════════════════════════════
-- RLS Policies — Accesso pubblico in lettura per tabelle pubbliche
-- Esegui questo SQL nel Supabase Dashboard SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Abilita RLS (se non già attivo)
ALTER TABLE public.corsi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capitoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slide ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concorsi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concorsi_materie ENABLE ROW LEVEL SECURITY;

-- Permette SELECT anonimo su corsi (solo pubblicati)
CREATE POLICY "corsi_select_anon"
  ON public.corsi
  FOR SELECT
  TO anon
  USING (stato = 'pubblicato');

-- Permette SELECT anonimo su capitoli (per corsi pubblicati)
CREATE POLICY "capitoli_select_anon"
  ON public.capitoli
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.corsi
      WHERE corsi.id = capitoli.corso_id
      AND corsi.stato = 'pubblicato'
    )
  );

-- Permette SELECT anonimo su slide (per capitoli di corsi pubblicati)
CREATE POLICY "slide_select_anon"
  ON public.slide
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.capitoli
      JOIN public.corsi ON corsi.id = capitoli.corso_id
      WHERE capitoli.id = slide.capitolo_id
      AND corsi.stato = 'pubblicato'
    )
  );

-- Permette SELECT anonimo su concorsi (solo aperti)
CREATE POLICY "concorsi_select_anon"
  ON public.concorsi
  FOR SELECT
  TO anon
  USING (stato = 'aperto');

-- Permette SELECT anonimo su materie
CREATE POLICY "materie_select_anon"
  ON public.materie
  FOR SELECT
  TO anon
  USING (true);

-- Permette SELECT anonimo su concorsi_materie
CREATE POLICY "concorsi_materie_select_anon"
  ON public.concorsi_materie
  FOR SELECT
  TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- Nota: per l'accesso in scrittura (admin), usa la service_role key
-- o crea policy separate per utenti autenticati con ruolo admin.
-- ═══════════════════════════════════════════════════════════════
