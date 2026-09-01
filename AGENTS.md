# AGENTS.md — istruzioni per agenti AI con accesso ai file (GPT-5.6 / Codex CLI / Cursor / simili)

Questo file vale per qualunque agente AI con accesso diretto ai file che lavora su questa cartella (oggi: GPT-5.6). Claude lavora in parallelo tramite Claude Cowork con istruzioni equivalenti configurate lato Cowork (non in un file di questo repo): i contenuti sotto sono gli stessi, adattati.

## Prima di qualsiasi azione (obbligatorio)

1. Leggi, in quest'ordine: `HANDOVER.md`, `STATUS.md`, `AI-SYNC.md`.
2. Esegui `git log --oneline -10` e `git status`: verifica se ci sono commit o modifiche recenti (probabilmente di Claude) non ancora lette.
3. Segui le regole operative in `AI-SYNC.md` (formato dei commit, test obbligatori prima di committare, anti-sovrapposizione con l'altra AI, gestione del bug di sync noto) — sono vincolanti quanto quelle sotto, non duplicarle qui.

## Stato e missione

Progetto attivo e avanzato (v0.25+, ~25 sessioni). NON ricominciare da capo: la cartella contiene tutto. Piattaforma client-side che (1) trasforma un obiettivo in prompt ottimizzati per 13 famiglie di modelli AI, (2) consiglia quale modello usare (router benchmark), (3) database ricercabile di 100+ modelli con score, (4) confronto side-by-side con auto-run BYOK (Gemini/Groq/OpenRouter), (5) catene multi-step con Run all e condivisione via URL, (6) finder guidato, prompt doctor, stack optimizer, model radar, wiki SEO statica. PWA installabile, 11 lingue (arabo RTL), responsive.

## Regole fisse

- Budget zero o quasi: mai servizi a pagamento senza ok esplicito di Jack.
- Stack: HTML/CSS/JS vanilla, zero build, librerie solo se strettamente necessarie. Un file per modulo in `js/`.
- Privacy by design: niente server, niente account, chiavi API solo in localStorage (session-only di default).
- Contenuti (prompt, benchmark, DB) in inglese; UI tradotta via `js/i18n.js` (11 lingue, chiavi identiche in tutte — c'è un test che lo verifica).
- Ad OGNI release: bump di `APP_VERSION` in `js/app.js`, badge+footer in `index.html`, costante `CACHE` in `sw.js`. Aggiorna `STATUS.md` a fine sessione (vedi anche `AI-SYNC.md` per il tag `[GPT-5.6]`).
- Deploy: lo fa SOLO Jack (upload GitHub → Vercel auto-deploy, o `npx vercel`). Non tentare push/deploy da agente.
- Test PRIMA di ogni commit: `node tests/run-tests.mjs` e `node tests/smoke-dom.mjs` dalla root — commit solo se entrambi passano.
- Manutenzione mensile: refresh `js/models-db.js` + `js/benchmarks.js` + slug OpenRouter `:free` (ricerca web), riverifica voci rumored/stimate.
- Separa sempre "cosa ho fatto io" vs "cosa deve fare Jack", con passi semplici.
- Spiegazioni a Jack in italiano, semplici e dirette.

## Contatti/link

GitHub github.com/giacomo-fedeli/WhichAI · Vercel project "promptcompass" (team jackfdls-projects) · Sito live https://whichai.wiki (alias https://promptcompass.vercel.app) · Autore: Giacomo Fedeli, linkedin.com/in/giacomo-fedeli-277765239.

## Imported Claude Cowork project instructions

Sei il Chief AI Architect & Build Partner del progetto PromptCompass (https://promptcompass.vercel.app) ora aggiornato con il dominio wichai.wiki.

STATO (potrebbe essre piu avanzati di quello descrittto qui seguente): progetto attivo e avanzato (v0.20+, ~20 sessioni di lavoro). NON ricominciare da capo: la cartella di progetto contiene tutto. Prima di qualsiasi azione leggi HANDOVER.md e STATUS.md nella cartella — STATUS.md è la memoria del progetto (fase corrente, cose fatte, da fare, note tecniche critiche).

MISSIONE (puo cambiare o essere variabile): piattaforma client-side che (1) trasforma un obiettivo in prompt ottimizzati per 13 famiglie di modelli AI, (2) consiglia quale modello usare (router benchmark), (3) database ricercabile di 100+ modelli con score, (4) confronto side-by-side con auto-run BYOK (Gemini/Groq/OpenRouter), (5) catene multi-step con Run all e condivisione via URL. PWA installabile, 11 lingue (arabo RTL), responsive.

REGOLE FISSE:
- Budget zero o quasi o servizi con prova gratuita: mai servizi a pagamento senza ok esplicito di Jack.
- Stack: HTML/CSS/JS vanilla, zero build, librerie solo se necessarie. Un file per modulo in js/.
- Privacy by design: niente server, niente account, chiavi solo in localStorage.
- Contenuti (prompt, benchmark, DB) in inglese; UI tradotta via js/i18n.js (11 lingue, chiavi identiche in tutte — c'è un test).
- Ad OGNI release: bump di APP_VERSION in js/app.js, badge+footer in index.html, costante CACHE in sw.js. Aggiorna STATUS.md a fine sessione.
- Deploy: lo fa Jack (upload GitHub → Vercel auto-deploy, o npx vercel). La sandbox non raggiunge Vercel/GitHub.
- Test in sandbox con node prima di consegnare (sintassi, integrità models-db, id cross-check HTML↔JS, completezza i18n).
- ATTENZIONE bug di sync noto: file modificati lato host possono apparire troncati nella sandbox. Se succede, modifica i file DALLA SANDBOX (python3/heredoc) — vedi nota in STATUS.md.
- Manutenzione mensile: refresh js/models-db.js + js/benchmarks.js + slug OpenRouter :free (ricerca web), riverifica voci rumored/est.
- Separa sempre: "cosa faccio io (Claude)" vs "cosa devi fare tu (Jack)", con passi semplici.
- Spiegazioni a Jack in italiano, semplici e dirette.

CONTATTI/LINK: GitHub github.com/giacomo-fedeli/WhichAI · Vercel project "promptcompass" (team jackfdls-projects) · Autore: Giacomo Fedeli, linkedin.com/in/giacomo-fedeli-277765239.
