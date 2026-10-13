# PromptCompass — HANDOVER (trasferimento su nuovo computer)

Data: 2026-10-13 · Versione in cartella: **v0.36.0** · Live: https://whichai.wiki (alias https://promptcompass.vercel.app)

Questo file serve a riprendere il progetto su un altro computer con Claude Cowork **senza ricominciare da capo**. Il nuovo Claude deve leggere PRIMA questo file e STATUS.md, poi agire.

**Lavori anche con GPT-5.6 sullo STESSO pc?** Questo non è il file giusto (questo è per il cambio computer). Vedi `AI-SYNC.md` — coordina Claude e GPT-5.6 quando lavorano a sessioni alternate sulla stessa cartella (regole di commit, review, anti-sovrapposizione).

---

## A. Checklist per Jack (l'umano) — trasferimento

1. **Metodo consigliato: GitHub (è già il tuo backup!)**
   - Su QUESTO pc: pubblica l'ultima versione (git push su github.com/giacomo-fedeli/WhichAI). Così il repo contiene tutto e Vercel va live.
   - Sul NUOVO pc: vai sul repo → Code → Download ZIP → estrai in `C:\dev\PromptCompassFolder`. Fine.
2. **Metodo alternativo: Drive** — carica l'intera cartella `C:\dev\PromptCompassFolder` su Drive (tasto destro → comprimi in .zip prima, così non perdi nulla), scaricala sul nuovo pc ed estraila in `C:\dev\PromptCompassFolder`.
3. Sul nuovo pc, in Claude Cowork: crea un progetto (es. "PromptCompass"), incolla le **Project instructions** (sezione B), avvia una chat, collega la cartella `C:\dev\PromptCompassFolder` quando Claude la chiede (o scrivi il percorso nel primo messaggio), e incolla il **Primo prompt** (sezione C).
4. Account che devi avere a portata: GitHub (giacomo-fedeli), Vercel (jackfdl / promptcompass), GoatCounter (contatore visite). Dalla v0.36 il sito non usa più chiavi API.
5. Se PowerShell blocca `npx`: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` da amministratore, conferma con S.

## B. Project instructions per Cowork (copia-incolla)

```
Sei il Chief AI Architect & Build Partner del progetto PromptCompass (https://promptcompass.vercel.app).

STATO: progetto attivo e avanzato (v0.36+, ~37 sessioni di lavoro). NON ricominciare da capo: la cartella di progetto contiene tutto. Prima di qualsiasi azione leggi HANDOVER.md e STATUS.md nella cartella — STATUS.md è la memoria del progetto (fase corrente, cose fatte, da fare, note tecniche critiche).

MISSIONE: piattaforma a pagina unica in 6 capitoli collegati (niente copertina, niente menu): (1) Ranking a tier calcolato dai punteggi ufficiali Artificial Analysis, con scatter prezzo/intelligenza, (2) Compare testa a testa, (3) Model Radar con lanci, prezzi e news automatiche, (4) Market (prezzi, valore, free route, calcolatore), (5) AI Debates + glossario, (6) Tools: Find your AI (prioritario), Prompt generator per 13 famiglie di modelli, Prompt Doctor, Stack Optimizer. Dati e news si aggiornano da soli; wiki SEO statica; PWA installabile, 11 lingue (arabo RTL), responsive, tema chiaro/scuro.

REGOLE FISSE:
- Budget zero: mai servizi a pagamento senza ok esplicito di Jack.
- Stack: HTML/CSS/JS vanilla, nessun framework, librerie solo se necessarie. Un file per modulo in js/. (tools/build.mjs minifica per la produzione, ma il sito funziona anche senza build.)
- Privacy by design: niente account, nessuna chiave API, nessun tracciamento; le API del sito (api/) sono in sola lettura.
- Contenuti (prompt, benchmark, DB) in inglese; UI tradotta via js/i18n.js (11 lingue, chiavi identiche in tutte — c'è un test).
- Ad OGNI release: bump di APP_VERSION in js/app.js, badge+footer in index.html, costante CACHE in sw.js. Aggiorna STATUS.md a fine sessione.
- Deploy: lo fa Jack (upload GitHub → Vercel auto-deploy, o npx vercel). La sandbox non raggiunge Vercel/GitHub.
- Test in sandbox prima di consegnare: `npm test` (6 suite offline: statici, smoke DOM, API, live data, catalog, news).
- ATTENZIONE bug di sync noto: file modificati lato host possono apparire troncati nella sandbox. Se succede, modifica i file DALLA SANDBOX (python3/heredoc) — vedi nota in STATUS.md.
- Dati (dalla v0.35): punteggi ufficiali Artificial Analysis, prezzi, nuovi modelli misurati e route :free si aggiornano DA SOLI (api/catalog.js + js/live-catalog.js, e ogni deploy li ricuoce nel bundle). Nessun refresh manuale dei numeri. Resta umano solo il lavoro editoriale: recensioni dei modelli marcati "auto-added", voci rumored, AI Debates, glossario. NON reintrodurre punteggi scritti a mano in models-db.js: per i modelli con misura ufficiale il valore viene dalla fonte.
- Separa sempre: "cosa faccio io (Claude)" vs "cosa devi fare tu (Jack)", con passi semplici.
- Spiegazioni a Jack in italiano, semplici e dirette.

CONTATTI/LINK: GitHub github.com/giacomo-fedeli/WhichAI · Vercel project "promptcompass" (team jackfdls-projects) · Autore: Giacomo Fedeli, linkedin.com/in/giacomo-fedeli-277765239.
```

## C. Primo prompt per la prima chat sul nuovo pc (copia-incolla)

```
Riprendiamo PromptCompass su questo nuovo computer. La cartella di progetto è C:\dev\PromptCompassFolder (chiedimi l'accesso se ti serve).

1. Leggi HANDOVER.md e STATUS.md nella cartella e dimmi in 5 righe: versione attuale, cosa è live, cosa manca da pubblicare, prossimi passi aperti.
2. Verifica l'integrità dei file (sintassi js, test integrità come da STATUS) e dimmi se il trasferimento è andato a buon fine.
3. NON modificare nulla finché non confermo. Poi proponimi le 3 cose a maggior valore da fare in questa sessione.

Contesto extra: [SE HAI COMPRATO IL DOMINIO SCRIVILO QUI, es. "ho comprato whichai.wiki su Porkbun" — così Claude prepara il rebranding e i record DNS da impostare].
```

## D. Stato sintetico (per il nuovo Claude)

- v0.36 (sessione 37): il sito è UNA pagina con 6 capitoli in ordine (ranking, compare, radar, market, debates, tools) collegati da animazioni "morph"; niente copertina, niente menu di viste; Chains, Merge, Blind Arena, Output comparison e chiavi API (BYOK) rimossi.
- Dati automatici: `/api/catalog` (punteggi ufficiali, prezzi, modelli nuovi, free route) e `/api/news` (news del Radar); `/api/refresh` è l'audit giornaliero.
- Architettura: vedi "Come riprendere il lavoro" in fondo a STATUS.md (mappa file per capitolo).
- Docs: README.md (pubblico, inglese), STATUS.md (memoria progetto), CHANGELOG.md, AI-SYNC.md (coordinamento tra AI), docs/API.md, docs/SETUP-JACK.md (deploy), docs/DECISIONS.md.

## E. Sviluppo in parallelo con GPT-5.6 (stesso pc, non un trasferimento)

Da sessione 26: il progetto può essere lavorato anche da GPT-5.6 (agente con accesso file, es. Codex CLI/Cursor) in sessioni alternate a Claude, sulla stessa cartella `C:\dev\PromptCompassFolder`. Le regole operative (chi legge cosa a inizio/fine sessione, formato dei commit, test obbligatori prima di committare, anti-sovrapposizione sulle stesse aree, gestione del bug di sync noto) sono TUTTE in `AI-SYNC.md` — non duplicarle qui. In sintesi: git locale è la fonte di verità, ogni sessione (di qualunque AI) committa da sola dopo aver passato `npm test`, e la sessione successiva rivede il diff prima di agire. Jack non deve fare nulla di manuale per "passare il testimone" oltre ad aprire la sessione nello strumento giusto.
