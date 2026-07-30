# AI-SYNC — coordinamento Claude ↔ GPT-5.6 (stesso PC, stessa cartella)

Questo file NON serve per cambiare computer (per quello vedi HANDOVER.md). Serve a far lavorare **due AI diverse in sessioni alternate, sulla stessa cartella `C:\dev\PromptCompassFolder`**, senza che una sovrascriva o ignori il lavoro dell'altra. Le due AI non si vedono tra loro: l'unico canale di comunicazione è la cartella + git + questo file.

Regola d'oro: **git locale è la fonte di verità**. Ogni sessione, di qualunque AI, finisce con un commit locale (anche senza push su GitHub — quello resta una scelta di Jack). Il commit è anche il meccanismo di revisione: la sessione successiva (dell'altra AI) legge il diff prima di agire.

---

## 1. Cosa fa OGNI AI a inizio sessione (obbligatorio)

1. Legge `HANDOVER.md`, `STATUS.md` e questo file (`AI-SYNC.md`).
2. Esegue `git log --oneline -10` e `git status` per vedere se ci sono commit recenti o modifiche non committate lasciate dall'altra AI.
3. Se l'ultimo commit non è taggato con il proprio nome (vedi log sotto), legge `git diff <commit precedente>..HEAD` prima di toccare qualsiasi file, per capire davvero cosa è cambiato — non fidarsi solo del riassunto in STATUS.md.
4. Se trova modifiche non committate o incoerenze con STATUS.md, si ferma e chiede conferma a Jack invece di procedere o sovrascrivere.

## 2. Cosa fa OGNI AI a fine sessione (obbligatorio)

1. Esegue `node tests/run-tests.mjs` e `node tests/smoke-dom.mjs` dalla root del progetto. **Commit solo se entrambi passano.**
2. Fa un commit git locale con messaggio nel formato:
   `[Claude] sessione N: <riassunto>` oppure `[GPT-5.6] sessione N: <riassunto>`
3. Aggiorna `STATUS.md` (nuova voce "Fatto (sessione N)", stesso stile delle precedenti) taggando chi l'ha fatta, es. `## Fatto (sessione 26, 2026-07-21 — GPT-5.6)`.
4. Aggiorna la tabella di log qui sotto (riga nuova in cima).
5. Bump versione se richiesto dalle regole fisse del progetto (APP_VERSION, badge, footer, CACHE in sw.js).

## 3. Regola anti-sovrapposizione

A inizio sessione, dichiarare (nella riga di log sotto, colonna "Area") su quali file/funzionalità si lavorerà. Se l'altra AI ha lavorato sulla STESSA area nella sessione precedente e non è ancora stata rivista/testata da Jack dal vivo, fermarsi e chiedere a Jack come procedere invece di editare sopra.

## 4. Bug di sync noto (vedi anche STATUS.md)

File modificati "host-side" possono apparire troncati lato sandbox di Claude. Se GPT-5.6 lavora con accesso diretto ai file e la sessione successiva è di Claude: **prima di assumere che un file sia integro, confrontarlo con l'ultimo commit git** (`git diff`, `git show HEAD:percorso/file`) invece di fidarsi solo della lettura in sandbox. Se risulta troncato, ricostruire il file lato sandbox (vedi workaround già documentato in STATUS.md, sessione 22).

## 5. Log passaggi (aggiungere una riga in cima ad ogni sessione)

| Sessione | AI | Data | Commit | Area toccata | Nota per la prossima AI |
|---|---|---|---|---|---|
| 30 | Claude | 2026-07-30 | (vedi git log) | topics NUOVO, config/support NUOVI, welcome.js (solo aggiunta show()), footer/about, dati K3+rumor, wiki regen | v0.29: AI Debates con fonti, contatore GoatCounter reale (config-driven, niente numeri finti), donate config-driven, brand→welcome. 194/194 verdi. Morph/brands NON toccati oltre show(). |
| 29 | Claude | 2026-07-26 | (vedi git log) | dati modelli/benchmark/radar, js/arena.js NUOVO, community files (.github, CONTRIBUTING), wiki regen | v0.28: Opus 5 pubblico #1 (AA 60.7, snapshot 24/7), Gemini 3.6 Flash nuovo default BYOK, Blind Arena con Elo locale, 177/177 test verdi. NON toccati: welcome.js, brands.js, morph. |
| 28 | GPT-5.6 | 2026-07-21 | 2507f34 | morph fade-out, wordmark dark mode | v0.27: dissolvenza finale del morph e wordmark SVG chiari nel tema dark; 103 test funzionali + 60 smoke test verdi, verifica visiva desktop completata. |
| 27 | GPT-5.6 | 2026-07-20 | 879fe57 | welcome page, morph transition, branding | v0.26 completata: welcome/morph nativi, 76 asset locali, branding app+wiki; 161/161 test verdi e QA browser su 3 temi/breakpoint. Jack deve pubblicare v0.22→v0.26. |
| 26 | Claude | 2026-07-20 | 0d17fd4 | Solo meta/coordinamento: creati questo file, `AGENTS.md`; aggiornato `HANDOVER.md` (sezione E). Nessun codice app toccato. | Lock obsoleto rimosso da GPT-5.6; 94 test statici + 57 smoke verdi prima del commit richiesto da Jack. |
| 25 | Claude | 2026-07-20 | a454b96 | accordion scheda modello, More-menu, link ufficiali, compare default, Model Radar, share card | Jack deve pubblicare v0.22→v0.25 insieme. 151/151 test verdi. |

---

## Nota per Jack

Non serve fare nulla di manuale per "passare" da un'AI all'altra oltre a: aprire la sessione nell'altro strumento (Claude Cowork o l'agente GPT-5.6) puntato sulla stessa cartella. Ogni AI legge da sola lo stato tramite questo file + STATUS.md + git. Se un giorno vuoi che lavorino nella stessa giornata, evita di farle toccare la stessa area (colonna "Area" sopra) finché non hai controllato tu il risultato della prima.
