-- ─────────────────────────────────────────────────────────────────────
-- Migrazione 00005: Quiz demo per corso gratuito "Diritto Amministrativo"
-- ─────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    v_corso_id UUID;
    q1_id UUID;
    q2_id UUID;
    q3_id UUID;
    q4_id UUID;
    q5_id UUID;
    c1_id UUID;
    c2_id UUID;
    c3_id UUID;
    c4_id UUID;
    c5_id UUID;
BEGIN
    -- Trova il corso gratuito
    SELECT id INTO v_corso_id FROM corsi WHERE prezzo = 0 LIMIT 1;
    
    IF v_corso_id IS NULL THEN
        RAISE EXCEPTION 'Nessun corso gratuito trovato';
    END IF;

    -- Trova i capitoli
    SELECT id INTO c1_id FROM capitoli WHERE corso_id = v_corso_id AND ordine = 1 LIMIT 1;
    SELECT id INTO c2_id FROM capitoli WHERE corso_id = v_corso_id AND ordine = 2 LIMIT 1;
    SELECT id INTO c3_id FROM capitoli WHERE corso_id = v_corso_id AND ordine = 3 LIMIT 1;
    SELECT id INTO c4_id FROM capitoli WHERE corso_id = v_corso_id AND ordine = 4 LIMIT 1;
    SELECT id INTO c5_id FROM capitoli WHERE corso_id = v_corso_id AND ordine = 5 LIMIT 1;

    -- Crea i quiz
    INSERT INTO quiz (id, capitolo_id, titolo) VALUES
        (gen_random_uuid(), c1_id, 'Principi generali del diritto amministrativo')
        RETURNING id INTO q1_id;
        
    INSERT INTO quiz (id, capitolo_id, titolo) VALUES
        (gen_random_uuid(), c2_id, 'Gli atti amministrativi')
        RETURNING id INTO q2_id;
        
    INSERT INTO quiz (id, capitolo_id, titolo) VALUES
        (gen_random_uuid(), c3_id, 'Il procedimento amministrativo')
        RETURNING id INTO q3_id;
        
    INSERT INTO quiz (id, capitolo_id, titolo) VALUES
        (gen_random_uuid(), c4_id, 'La giustizia amministrativa')
        RETURNING id INTO q4_id;
        
    INSERT INTO quiz (id, capitolo_id, titolo) VALUES
        (gen_random_uuid(), c5_id, 'Gli enti locali')
        RETURNING id INTO q5_id;

    -- Quiz 1: Principi generali
    INSERT INTO domande (id, quiz_id, testo, tipo, opzioni, risposta_corretta, spiegazione) VALUES
        (gen_random_uuid(), q1_id, 'Quale principio fissa i limiti dell''azione amministrativa?', 'scelta_multipla', '["Principio di legalità", "Principio di efficienza", "Principio di economicità", "Principio di trasparenza"]'::jsonb, 'Principio di legalità', 'L''amministrazione può agire solo nei limiti e coi mezzi previsti dalla legge.'),
        (gen_random_uuid(), q1_id, 'Cosa intendersi per "pubblica amministrazione"?', 'scelta_multipla', '["Solo il governo centrale", "L''insieme degli organi che perseguono interessi pubblici", "Esclusivamente gli enti territoriali", "Solo la funzione pubblica dipendente"]'::jsonb, 'L''insieme degli organi che perseguono interessi pubblici', 'La P.A. comprende tutti gli organismi incaricati di soddisfare interessi pubblici.'),
        (gen_random_uuid(), q1_id, 'Quale principio garantisce la neutralità dell''azione amministrativa?', 'scelta_multipla', '["Principio di imparzialità", "Principio di sussidiarietà", "Principio di autonomia", "Principio di responsabilità"]'::jsonb, 'Principio di imparzialità', 'L''amministrazione deve trattare tutti i cittadini in modo equo e senza discriminazioni.'),
        (gen_random_uuid(), q1_id, 'Cosa prevede il principio di trasparenza?', 'scelta_multipla', '["Divulgazione dei dati e documenti amministrativi", "Segreto sugli atti amministrativi", "Accesso limitato solo agli enti superiori", "Niente documentazione scritta"]'::jsonb, 'Divulgazione dei dati e documenti amministrativi', 'I documenti amministrativi sono accessibili ai soggetti interessati salvo casi di eccezione.'),
        (gen_random_uuid(), q1_id, 'Quale principio regola la ripartizione delle funzioni tra Stato e Regioni?', 'scelta_multipla', '["Principio di autonomia regionale", "Principio di federalismo fiscale", "Principio di sussidiarietà orizzontale", "Principio di uniformità nazionale"]'::jsonb, 'Principio di autonomia regionale', 'Le Regioni hanno competenza legislativa esclusiva, concorrente o di supporto secondo la Costituzione.');

    -- Quiz 2: Atti amministrativi
    INSERT INTO domande (id, quiz_id, testo, tipo, opzioni, risposta_corretta, spiegazione) VALUES
        (gen_random_uuid(), q2_id, 'Quale elemento NON è essenziale per l''esistenza di un atto amministrativo?', 'scelta_multipla', '["La volontà dell''organo", "Il contenuto", "La forma scritta", "La motivazione"]'::jsonb, 'La forma scritta', 'L''atto amministrativo può essere formale o informale; la forma scritta non è sempre obbligatoria.'),
        (gen_random_uuid(), q2_id, 'Cosa distingue un atto amministrativo da un atto privato?', 'scelta_multipla', '["La natura giuridica dell''organo che lo emette", "Il valore probatorio", "La firma del titolare", "La registrazione catastale"]'::jsonb, 'La natura giuridica dell''organo che lo emette', 'Gli atti amministrativi sono emessi da organi pubblici nell''esercizio di poteri pubblici.'),
        (gen_random_uuid(), q2_id, 'Quale atto amministrativo crea un rapporto giuridico obbligatorio?', 'scelta_multipla', '["Un atto autorizzativo", "Un contratto amministrativo", "Un provvedimento", "Un atto di conteggio"]'::jsonb, 'Un contratto amministrativo', 'Il contratto amministrativo crea obbligazioni reciproche tra amministrazione e contraente.'),
        (gen_random_uuid(), q2_id, 'Cosa è un provvedimento?', 'scelta_multipla', '["Un atto amministrativo che produce effetti giuridici verso l''esterno", "Un atto interno all''amministrazione", "Una delibera consiliare", "Un atto normativo"]'::jsonb, 'Un atto amministrativo che produce effetti giuridici verso l''esterno', 'Il provvedimento è l''atto con cui l''amministrazione agisce nei confronti dei cittadini.'),
        (gen_random_uuid(), q2_id, 'Quale vizio rende annullabile un atto amministrativo?', 'scelta_multipla', '["Vizio di competenza", "Vizio di forma", "Vizio di merito", "Tutti i precedenti"]'::jsonb, 'Tutti i precedenti', 'Vizi di competenza, forma e merito possono rendere l''atto annullabile o nullo a seconda della gravità.');

    -- Quiz 3: Procedimento amministrativo
    INSERT INTO domande (id, quiz_id, testo, tipo, opzioni, risposta_corretta, spiegazione) VALUES
        (gen_random_uuid(), q3_id, 'Fase preliminare del procedimento amministrativo:', 'scelta_multipla', '["La richiesta di autorizzazione", "L''iscrizione a ruolo", "Il decreto finale", "La notifica dell''atto"]'::jsonb, 'La richiesta di autorizzazione', 'Il procedimento può iniziare con istanza di parte o d''ufficio.'),
        (gen_random_uuid(), q3_id, 'Cosa succede se l''amministrazione decade in inerzia?', 'scelta_multipla', '["Il ricorso è ammissibile presso il TAR", "L''atto è nullo di diritto", "La parte deve rivolgersi al Giudice Ordinario", "Nessuna conseguenza giuridica"]'::jsonb, 'Il ricorso è ammissibile presso il TAR', 'L''inerzia pregiudizievole permette alla parte di ricorrere al TAR per obbligare l''amministrazione a decidere.'),
        (gen_random_uuid(), q3_id, 'Quale principio regola il contraddittorio nel procedimento?', 'scelta_multipla', '["Principio del silenzio assenso", "Principio del contraddittorio preventivo", "Principio della difesa", "Principio della pubblicità"]'::jsonb, 'Principio del contraddittorio preventivo', 'La parte deve essere messa in grado di esporre le proprie ragioni prima dell''adozione dell''atto.'),
        (gen_random_uuid(), q3_id, 'Il termine per la decisione nel procedimento amministrativo:', 'scelta_multipla', '["È sempre di 90 giorni", "È stabilito dalla legge o dal regolamento", " È a discrezione dell''amministrazione", "Non esiste termine legale"]'::jsonb, 'È stabilito dalla legge o dal regolamento', 'I termini sono stabiliti dalla normativa di riferimento (es. 120 giorni per le autorizzazioni).'),
        (gen_random_uuid(), q3_id, 'Cosa è la deliberazione di istruttoria?', 'scelta_multipla', '["L''atto con cui l''amministrazione accerta i fatti e raccoglie le prove", "La decisione finale sul merito", "L''atto che avvia il procedimento", "La notifica all''interessato"]'::jsonb, 'L''atto con cui l''amministrazione accerta i fatti e raccoglie le prove', 'L''istruttoria è la fase preparatoria in cui si raccolgono dati e prove.');

    -- Quiz 4: Giustizia amministrativa
    INSERT INTO domande (id, quiz_id, testo, tipo, opzioni, risposta_corretta, spiegazione) VALUES
        (gen_random_uuid(), q4_id, 'Chi è competente per il giudizio sugli atti amministrativi?', 'scelta_multipla', '["Il Giudice Ordinario", "Il Tar (Tribunale Amministrativo Regionale)", "La Corte di Cassazione", "Il Giudice Tutelare"]'::jsonb, 'Il Tar (Tribunale Amministrativo Regionale)', 'I TAR sono competenti in primo grado per le controversie amministrative.'),
        (gen_random_uuid(), q4_id, 'Quale ricorso si presenta contro un provvedimento amministrativo?', 'scelta_multipla', '["Ricorso per cassazione", "Ricorso straordinario al Presidente della Repubblica", "Ricorso al TAR entro 60 giorni", "Ricorso in materia civile"]'::jsonb, 'Ricorso al TAR entro 60 giorni', 'Il ricorso al TAR deve essere proposto entro 60 giorni dalla notifica dell''atto.'),
        (gen_random_uuid(), q4_id, 'Cosa intendersi per giurisdizione piena?', 'scelta_multipla', '["Possibilità del giudice di riformare l''atto amministrativo", "Possibilità solo di annullare l''atto", "Giurisdizione esclusivamente cautelare", "Giudizio dinanzi alla Corte Costituzionale"]'::jsonb, 'Possibilità del giudice di riformare l''atto amministrativo', 'La giurisdizione piena permette al giudice di decidere anche sul merito e sostituire l''amministrazione.'),
        (gen_random_uuid(), q4_id, 'Quale istituto permette di sospendere gli effetti di un atto impugnato?', 'scelta_multipla', '["Sospensione preventiva", "Interdizione cautelare", "Esecutività differita", "Rinvio della decisione"]'::jsonb, 'Interdizione cautelare', 'L''interdizione cautelare sospende gli effetti dell''atto fino al giudicato.'),
        (gen_random_uuid(), q4_id, 'Chi può ricorrere in cassazione contro le sentenze del TAR?', 'scelta_multipla', '["Solo il cittadino", "Solo l''amministrazione", "Entrambi, per questioni di legge", "Nessuno, le sentenze del TAR sono insindacabili"]'::jsonb, 'Entrambi, per questioni di legge', 'La cassazione è ammissibile contro le sentenze del TAR per vizi di legge.');

    -- Quiz 5: Enti locali
    INSERT INTO domande (id, quiz_id, testo, tipo, opzioni, risposta_corretta, spiegazione) VALUES
        (gen_random_uuid(), q5_id, 'Quale ente locale ha personalità giuridica propria?', 'scelta_multipla', '["Il Comune", "La Provincia", "La Città metropolitana", "Tutti i precedenti"]'::jsonb, 'Tutti i precedenti', 'Comuni, Province, Città metropolitane e Regioni hanno personalità giuridica propria.'),
        (gen_random_uuid(), q5_id, 'Chi elegge il sindaco?', 'scelta_multipla', '["Il Consiglio Comunale", "Il Popolo sovrano con voto diretto", "Il Prefetto", "La Giunta Regionale"]'::jsonb, 'Il Popolo sovrano con voto diretto', 'Da R.D.L. 2014, il sindaco è eletto direttamente dai cittadini.'),
        (gen_random_uuid(), q5_id, 'Che cos''è l''autonomia finanziaria degli enti locali?', 'scelta_multipla', '["Possibilità di fissare le proprie entrate e spese senza vincoli", "Dipendenza dal bilancio statale", "Autonomia solo per le entrate tributarie", "Vincolo al pareggio di bilancio"]'::jsonb, 'Possibilità di fissare le proprie entrate e spese senza vincoli', 'Gli enti locali hanno autonomia finanziaria per perseguire le proprie funzioni.'),
        (gen_random_uuid(), q5_id, 'Qual è l''organo deliberante del Comune?', 'scelta_multipla', '["La Giunta Comunale", "Il Consiglio Comunale", "Il Sindaco", "Il Prefetto"]'::jsonb, 'Il Consiglio Comunale', 'Il Consiglio Comunale è l''organo deliberante e di indirizzo politico.'),
        (gen_random_uuid(), q5_id, 'Cosa sono le forme di democrazia diretta a livello locale?', 'scelta_multipla', '["Referendum, iniziativa legislativa, consulenza popolare", "Elezione diretta del sindaco", "Nomina dei consiglieri da parte del Prefetto", "Deleghe al presidente della provincia"]'::jsonb, 'Referendum, iniziativa legislative consulenza popolare', 'La Costituzione prevede referendum e iniziativa legislativa anche a livello locale.');

END $$;
