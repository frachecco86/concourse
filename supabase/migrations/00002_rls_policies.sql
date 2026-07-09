-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security: ConCourse
-- ─────────────────────────────────────────────────────────────────────

-- Abilita RLS su tutte le tabelle
ALTER TABLE concorsi            ENABLE ROW LEVEL SECURITY;
ALTER TABLE materie             ENABLE ROW LEVEL SECURITY;
ALTER TABLE concorsi_materie    ENABLE ROW LEVEL SECURITY;
ALTER TABLE corsi               ENABLE ROW LEVEL SECURITY;
ALTER TABLE capitoli            ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide               ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz                ENABLE ROW LEVEL SECURITY;
ALTER TABLE domande             ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiali_origine   ENABLE ROW LEVEL SECURITY;
ALTER TABLE utenti_profili      ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisti            ENABLE ROW LEVEL SECURITY;
ALTER TABLE iscrizioni_corso    ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressi           ENABLE ROW LEVEL SECURITY;
ALTER TABLE risultati_quiz      ENABLE ROW LEVEL SECURITY;

-- ─── Helper: admin check ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM utenti_profili
    WHERE id = auth.uid() AND ruolo = 'admin'
  );
$$;

-- ─── Helper: utente ha accesso al corso ────────────────────────────
CREATE OR REPLACE FUNCTION has_corso_access(pid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM iscrizioni_corso
    WHERE utente_id = auth.uid() AND corso_id = pid
  );
$$;

-- ─── 1. Concorsi ───────────────────────────────────────────────────
-- Pubblico: tutti leggono i concorsi aperti
CREATE POLICY "pubblico_legge_concorsi_aperti"
  ON concorsi FOR SELECT USING (
    stato = 'aperto' OR is_admin()
  );

-- Admin: full CRUD
CREATE POLICY "admin_gestisce_concorsi"
  ON concorsi FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 2. Materie ────────────────────────────────────────────────────
-- Pubblico: tutti leggono
CREATE POLICY "pubblico_legge_materie"
  ON materie FOR SELECT USING (true);

-- Admin: full CRUD
CREATE POLICY "admin_gestisce_materie"
  ON materie FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 3. Concorsi-Materie ───────────────────────────────────────────
CREATE POLICY "pubblico_legge_concorsi_materie"
  ON concorsi_materie FOR SELECT USING (true);

CREATE POLICY "admin_gestisce_concorsi_materie"
  ON concorsi_materie FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 4. Corsi ──────────────────────────────────────────────────────
-- Pubblico: vede solo corsi pubblicati (o bozza se admin)
CREATE POLICY "pubblico_legge_corsi_pubblicati"
  ON corsi FOR SELECT USING (
    stato = 'pubblicato' OR is_admin()
  );

CREATE POLICY "admin_gestisce_corsi"
  ON corsi FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 5. Capitoli ──────────────────────────────────────────────────
-- Accesso: utente con iscrizione al corso o admin
CREATE POLICY "accesso_capitoli"
  ON capitoli FOR SELECT USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM iscrizioni_corso ic
      JOIN corsi ON ic.corso_id = corsi.id
      WHERE ic.utente_id = auth.uid()
        AND corsi.id = capitoli.corso_id
    )
  );

CREATE POLICY "admin_gestisce_capitoli"
  ON capitoli FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 6. Slide ──────────────────────────────────────────────────────
CREATE POLICY "accesso_slide"
  ON slide FOR SELECT USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM capitoli c
      JOIN iscrizioni_corso ic ON ic.corso_id = c.corso_id
      WHERE c.id = slide.capitolo_id AND ic.utente_id = auth.uid()
    )
  );

CREATE POLICY "admin_gestisce_slide"
  ON slide FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 7. Quiz ───────────────────────────────────────────────────────
CREATE POLICY "accesso_quiz"
  ON quiz FOR SELECT USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM capitoli c
      JOIN iscrizioni_corso ic ON ic.corso_id = c.corso_id
      WHERE c.id = quiz.capitolo_id AND ic.utente_id = auth.uid()
    )
  );

CREATE POLICY "admin_gestisce_quiz"
  ON quiz FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 8. Domande ────────────────────────────────────────────────────
CREATE POLICY "accesso_domande"
  ON domande FOR SELECT USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM quiz q
      JOIN capitoli c ON c.id = q.capitolo_id
      JOIN iscrizioni_corso ic ON ic.corso_id = c.corso_id
      WHERE q.id = domande.quiz_id AND ic.utente_id = auth.uid()
    )
  );

CREATE POLICY "admin_gestisce_domande"
  ON domande FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 9. Materiali origine ──────────────────────────────────────────
CREATE POLICY "admin_gestisce_materiali"
  ON materiali_origine FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 10. Utenti profili ────────────────────────────────────────────
-- Ogni utente vede/modifica solo il proprio profilo
CREATE POLICY "utente_legge_proprio_profilo"
  ON utenti_profili FOR SELECT USING (id = auth.uid());

CREATE POLICY "utente_modifica_proprio_profilo"
  ON utenti_profili FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin vede tutti i profili
CREATE POLICY "admin_legge_tutti_profili"
  ON utenti_profili FOR SELECT USING (is_admin());

-- ─── 11. Acquisti ──────────────────────────────────────────────────
-- Utente vede solo i propri acquisti
CREATE POLICY "utente_legge_propri_acquisti"
  ON acquisti FOR SELECT USING (utente_id = auth.uid());

-- Admin vede tutti gli acquisti
CREATE POLICY "admin_legge_tutti_acquisti"
  ON acquisti FOR SELECT USING (is_admin());

-- Solo admin può inserire acquisti (webhook Stripe)
CREATE POLICY "admin_inserisce_acquisti"
  ON acquisti FOR INSERT WITH CHECK (is_admin());

-- ─── 12. Iscrizioni corso ──────────────────────────────────────────
-- Utente vede solo le proprie iscrizioni
CREATE POLICY "utente_legge_proprie_iscrizioni"
  ON iscrizioni_corso FOR SELECT USING (utente_id = auth.uid());

-- Admin vede e gestisce tutte le iscrizioni
CREATE POLICY "admin_gestisce_iscrizioni"
  ON iscrizioni_corso FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 13. Progressi ─────────────────────────────────────────────────
-- Utente vede/modifica solo i propri progressi
CREATE POLICY "utente_gestisce_propri_progressi"
  ON progressi FOR ALL USING (utente_id = auth.uid())
  WITH CHECK (utente_id = auth.uid());

-- ─── 14. Risultati quiz ────────────────────────────────────────────
-- Utente vede/inserisce solo i propri risultati
CREATE POLICY "utente_gestisce_propri_risultati"
  ON risultati_quiz FOR ALL USING (utente_id = auth.uid())
  WITH CHECK (utente_id = auth.uid());
