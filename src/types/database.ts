// ─────────────────────────────────────────────────────────────────────
// Tipi per il database Supabase — conformi al formato atteso da
// @supabase/supabase-js (Tables.Row / Tables.Insert / Tables.Update)
// ─────────────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      concorsi: { Row: ConcorsoRow; Insert: ConcorsoInsert; Update: ConcorsoUpdate };
      materie: { Row: MateriaRow; Insert: MateriaInsert; Update: MateriaUpdate };
      concorsi_materie: { Row: ConcorsiMaterieRow; Insert: ConcorsiMaterieInsert; Update: ConcorsiMaterieUpdate };
      corsi: { Row: CorsoRow; Insert: CorsoInsert; Update: CorsoUpdate };
      capitoli: { Row: CapitoloRow; Insert: CapitoloInsert; Update: CapitoloUpdate };
      slide: { Row: SlideRow; Insert: SlideInsert; Update: SlideUpdate };
      quiz: { Row: QuizRow; Insert: QuizInsert; Update: QuizUpdate };
      domande: { Row: DomandaRow; Insert: DomandaInsert; Update: DomandaUpdate };
      materiali_origine: { Row: MaterialeOrigineRow; Insert: MaterialeOrigineInsert; Update: MaterialeOrigineUpdate };
      utenti_profili: { Row: UtenteProfiloRow; Insert: UtenteProfiloInsert; Update: UtenteProfiloUpdate };
      acquisti: { Row: AcquistoRow; Insert: AcquistoInsert; Update: AcquistoUpdate };
      iscrizioni_corso: { Row: IscrizioneCorsoRow; Insert: IscrizioneCorsoInsert; Update: IscrizioneCorsoUpdate };
      progressi: { Row: ProgressoRow; Insert: ProgressoInsert; Update: ProgressoUpdate };
      risultati_quiz: { Row: RisultatoQuizRow; Insert: RisultatoQuizInsert; Update: RisultatoQuizUpdate };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// ─── Row types (SELECT) ────────────────────────────────────────────

export interface ConcorsoRow {
  id: string;
  titolo: string;
  ente: string;
  descrizione: string | null;
  stato: string;
  data_scadenza_bando: string | null;
  numero_posti: number | null;
  link_bando_ufficiale: string | null;
  slug: string;
  cover_image: string | null;
  created_at: string;
  prezzo: number | null;
}

export interface MateriaRow {
  id: string;
  nome: string;
  descrizione: string | null;
}

export interface ConcorsiMaterieRow {
  concorso_id: string;
  materia_id: string;
}

export interface CorsoRow {
  id: string;
  materia_id: string;
  concorso_id: string | null;
  titolo: string;
  descrizione: string | null;
  stato: string;
  prezzo: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

export interface CapitoloRow {
  id: string;
  corso_id: string;
  ordine: number;
  titolo: string;
}

export interface SlideRow {
  id: string;
  capitolo_id: string;
  ordine: number;
  contenuto: string;
  tipo: string;
}

export interface QuizRow {
  id: string;
  capitolo_id: string;
  titolo: string;
}

export interface DomandaRow {
  id: string;
  quiz_id: string;
  testo: string;
  tipo: string;
  opzioni: Record<string, unknown>;
  risposta_corretta: string;
  spiegazione: string | null;
}

export interface MaterialeOrigineRow {
  id: string;
  concorso_id: string;
  materia_id: string | null;
  file_url: string;
  tipo: string;
  stato_elaborazione: string;
}

export interface UtenteProfiloRow {
  id: string;
  nome: string;
  cognome: string;
  dati_fatturazione: Record<string, unknown> | null;
  ruolo: string;
}

export interface AcquistoRow {
  id: string;
  utente_id: string;
  corso_id: string | null;
  concorso_id: string | null;
  importo: number;
  stato_pagamento: string;
  provider: string;
  provider_payment_id: string | null;
  fattura_url: string | null;
  created_at: string;
  stripe_session_id: string | null;
  receipt_email: string | null;
  dati_fatturazione: Record<string, unknown> | null;
}

export interface IscrizioneCorsoRow {
  utente_id: string;
  corso_id: string;
  data_acquisto: string;
}

export interface ProgressoRow {
  utente_id: string;
  capitolo_id: string;
  stato: string;
  data_completamento: string | null;
}

export interface RisultatoQuizRow {
  utente_id: string;
  quiz_id: string;
  punteggio: number;
  risposte: Record<string, unknown>;
  data: string;
}

// ─── Insert types (INSERT) ─────────────────────────────────────────

export type ConcorsoInsert = Omit<ConcorsoRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type MateriaInsert = Omit<MateriaRow, "id"> & { id?: string };

export type ConcorsiMaterieInsert = ConcorsiMaterieRow;

export type CorsoInsert = Omit<CorsoRow, "id"> & { id?: string };

export type CapitoloInsert = Omit<CapitoloRow, "id"> & { id?: string };

export type SlideInsert = Omit<SlideRow, "id"> & { id?: string };

export type QuizInsert = Omit<QuizRow, "id"> & { id?: string };

export type DomandaInsert = Omit<DomandaRow, "id"> & { id?: string };

export type MaterialeOrigineInsert = Omit<MaterialeOrigineRow, "id"> & { id?: string };

export type UtenteProfiloInsert = Omit<UtenteProfiloRow, "id"> & { id?: string };

export type AcquistoInsert = Omit<AcquistoRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type IscrizioneCorsoInsert = IscrizioneCorsoRow;

export type ProgressoInsert = ProgressoRow;

export type RisultatoQuizInsert = Omit<RisultatoQuizRow, "data"> & { data?: string };

// ─── Update types (UPDATE) ─────────────────────────────────────────

export type ConcorsoUpdate = Partial<ConcorsoInsert>;
export type MateriaUpdate = Partial<MateriaInsert>;
export type ConcorsiMaterieUpdate = Partial<ConcorsiMaterieInsert>;
export type CorsoUpdate = Partial<CorsoInsert>;
export type CapitoloUpdate = Partial<CapitoloInsert>;
export type SlideUpdate = Partial<SlideInsert>;
export type QuizUpdate = Partial<QuizInsert>;
export type DomandaUpdate = Partial<DomandaInsert>;
export type MaterialeOrigineUpdate = Partial<MaterialeOrigineInsert>;
export type UtenteProfiloUpdate = Partial<UtenteProfiloInsert>;
export type AcquistoUpdate = Partial<AcquistoInsert>;
export type IscrizioneCorsoUpdate = Partial<IscrizioneCorsoInsert>;
export type ProgressoUpdate = Partial<ProgressoInsert>;
export type RisultatoQuizUpdate = Partial<RisultatoQuizInsert>;
