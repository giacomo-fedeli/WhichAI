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
| 35 | Claude | 2026-09-08 | 77dd828 | `api/_live-core.js`+`api/live.js`+`js/live-data.js` (integrati da Jack), `tests/live-data-tests.mjs` (NUOVO), `index.html`/`js/app.js`/`sw.js` (vista `#live` montata), `api/health.js`, `api/_lib.js`, `tools/api-dev.mjs`, i tre file di test | v0.34: il feed OpenRouter serve `/api/live`. **L'indice AA relayato da OpenRouter e' su una scala diversa dal mirror citato nel catalogo** (Opus 5: 50.7 vs 63.0): i due numeri non si toccano mai, e un test lo impone. 435 test verdi. |
| 30 | Claude | 2026-07-30 | (vedi git log) | topics NUOVO, config/support NUOVI, welcome.js (solo aggiunta show()), footer/about, dati K3+rumor, wiki regen | v0.29: AI Debates con fonti, contatore GoatCounter reale (config-driven, niente numeri finti), donate config-driven, brand→welcome. 194/194 verdi. Morph/brands NON toccati oltre show(). |
| 29 | Claude | 2026-07-26 | (vedi git log) | dati modelli/benchmark/radar, js/arena.js NUOVO, community files (.github, CONTRIBUTING), wiki regen | v0.28: Opus 5 pubblico #1 (AA 60.7, snapshot 24/7), Gemini 3.6 Flash nuovo default BYOK, Blind Arena con Elo locale, 177/177 test verdi. NON toccati: welcome.js, brands.js, morph. |
| 28 | GPT-5.6 | 2026-07-21 | 2507f34 | morph fade-out, wordmark dark mode | v0.27: dissolvenza finale del morph e wordmark SVG chiari nel tema dark; 103 test funzionali + 60 smoke test verdi, verifica visiva desktop completata. |
| 27 | GPT-5.6 | 2026-07-20 | 879fe57 | welcome page, morph transition, branding | v0.26 completata: welcome/morph nativi, 76 asset locali, branding app+wiki; 161/161 test verdi e QA browser su 3 temi/breakpoint. Jack deve pubblicare v0.22→v0.26. |
| 26 | Claude | 2026-07-20 | 0d17fd4 | Solo meta/coordinamento: creati questo file, `AGENTS.md`; aggiornato `HANDOVER.md` (sezione E). Nessun codice app toccato. | Lock obsoleto rimosso da GPT-5.6; 94 test statici + 57 smoke verdi prima del commit richiesto da Jack. |
| 25 | Claude | 2026-07-20 | a454b96 | accordion scheda modello, More-menu, link ufficiali, compare default, Model Radar, share card | Jack deve pubblicare v0.22→v0.25 insieme. 151/151 test verdi. |

---

## Nota per Jack

Non serve fare nulla di manuale per "passare" da un'AI all'altra oltre a: aprire la sessione nell'altro strumento (Claude Cowork o l'agente GPT-5.6) puntato sulla stessa cartella. Ogni AI legge da sola lo stato tramite questo file + STATUS.md + git. Se un giorno vuoi che lavorino nella stessa giornata, evita di farle toccare la stessa area (colonna "Area" sopra) finché non hai controllato tu il risultato della prima.

---

### 2026-09-08 - Claude - sessione 34 (v0.33)

**Aree toccate**: `src/scene3d.src.js` (NUOVO), `js/scene3d.js` (NUOVO, generato), `js/stage.js` (NUOVO), `js/journey.js` (NUOVO), `tools/bundle-3d.mjs` (NUOVO), `index.html` (welcome ristrutturata in contenitore scorrevole + 4 atti), `styles.css` (blocco v0.33 in coda), `js/models-db.js`, `js/benchmarks.js`, `js/app.js`, `js/finder.js`, `js/modelcompare.js`, `js/welcome.js` (aggiunto `leaveTo`), `js/i18n.js` (+12 chiavi x11), `tools/build-seo.mjs`, `sw.js`, i tre file di test.

**Cose da NON rifare / da sapere prima di toccare**:
1. `js/scene3d.js` e' **generato**. Non modificarlo a mano: si edita `src/scene3d.src.js` e si rilancia `node tools/bundle-3d.mjs`. Un test verifica che il banner "generated by" sia presente.
2. **I modelli rumored/private hanno `score.aa === null`** e la stima in `score.guess`. E' voluto e c'e' un test che lo impone: serve a rendere impossibile per costruzione che un modello non misurato finisca in una classifica. Non "sistemarlo" rimettendo un numero in `aa`.
3. **Vietato scrivere rank o punteggi indice dentro le stringhe `review`**. Due test falliscono se torna un `#N` o un numero che non coincide col punteggio del modello stesso. Il rank si calcola con `liveRank()` in app.js.
4. **Vietato hardcodare date di snapshot**: si legge `DB.updated`. Test attivo su app.js, finder.js, modelcompare.js, build-seo.mjs.
5. Il contenitore che scorre nella welcome e' `#welcome`, non `#welcome-scroll`. La posizione degli atti si misura con `getBoundingClientRect`, non con `offsetTop` (sistemi di riferimento diversi).
6. `js/stage.js` puo' legittimamente decidere di non montare nulla (`kind === "none"`) se il canvas non da' un contesto. Chi lo usa deve reggerlo.

**Aperto per la prossima sessione**: `docs/AUDIT-2026-09.md` contiene un audit contenuti completo, ordinato per impatto, con le correzioni gia' scritte. I tre pezzi grossi non ancora fatti: il filo narrativo *tra le viste dell'app* (dentro la journey c'e', tra le pagine no), il restyle vista per vista, e i punti 3-6 dell'audit (Prompt Doctor che classifica al contrario, Stack Optimizer che non puo' consigliare Grok e Copilot, Generator con 13 famiglie e 5 prompt, due AI Debates fattualmente sbagliati).

---

### 2026-09-08 - Claude - sessione 35 (v0.34)

**Aree toccate**: `api/_live-core.js` (NUOVO, versione di Jack), `api/live.js` (NUOVO, versione di Jack), `js/live-data.js` (NUOVO, versione di Jack), `tests/live-data-tests.mjs` (NUOVO, 53 test), `index.html` + `js/app.js` + `sw.js` (vista `#live` montata), `api/health.js` (endpoint elencato), `api/_lib.js` (APP_VERSION v0.34), `api/_refresh-core.js` + `api/refresh.js` (tenute le versioni di Jack), `tools/api-dev.mjs`, `tests/run-tests.mjs`, `tests/smoke-dom.mjs`, `package.json`, i due workflow.

**Cose da NON rifare / da sapere prima di toccare**:
1. **Due storie git divergenti sono state riunite.** Jack aveva lavorato in parallelo (`bd2f39b`) mentre io ero su `b04107d`. Dove i due lavori si sovrapponevano ho tenuto **la versione di Jack** (`_refresh-core.js`, `refresh.js`): il suo `sameModel` e' un confronto esatto e non fa passare "GLM-5" per "GLM 5.3". Non riportare indietro la mia.
2. **L'indice Artificial Analysis esiste in due scale diverse sul sito.** Quello relayato da OpenRouter (`benchmarks.artificial_analysis`) e quello del mirror citato nel catalogo (`score.aa`) non sono lo stesso numero: Claude Opus 5 e' **50.7** nel primo e **63.0** nel secondo. Vivono in namespace separati e **nessun modulo live puo' scrivere nel catalogo editoriale**. Due test lo impongono (sezione 8 di `live-data-tests.mjs`): uno verifica che i due numeri restino distinti, l'altro fa grep del sorgente per `\.score =`, `score.aa =`, `models.push(`. Se un giorno sembrano "sbagliati" perche' diversi: sono diversi apposta.
3. **`tests/live-data-tests.mjs` era gia' chiamato da entrambi i workflow ma non esisteva.** I workflow fallivano a prescindere dal problema di billing. Ora c'e' un test in `run-tests.mjs` ("v34: every workflow step points at a file that exists") che impedisce che succeda di nuovo: se un workflow chiama un file inesistente, la suite locale fallisce prima di GitHub.
4. **`js/live-data.js` era finito ma non montato da nessuna parte.** Ora e' la vista `#live`, raggiungibile dal menu More. Se si tocca la lista delle viste, aggiornare anche `sw.js` (precache) e i test smoke.
5. **Regola ricorrente, terza volta che mi costa una sessione**: non scrivere test che fissano un valore di snapshot (un punteggio di agosto, il minuto di un cron, il numero di voci di un menu). Si scrivono **invarianti** ("il punteggio esiste", "il cron gira una volta a settimana", "ogni voce del menu ha una vista"). I test che fissano valori falliscono al primo aggiornamento dei dati e sembrano bug del sito.

**Aperto per la prossima sessione**: invariato rispetto alla 34 - `docs/AUDIT-2026-09.md` resta la coda di lavoro, in ordine di impatto: due AI Debates fattualmente sbagliati (`regulation`, `copyright`), `buildReasoning` nell'engine, Prompt Doctor che classifica al contrario, Stack Optimizer che non puo' consigliare Grok e Copilot, filo narrativo tra le viste, restyle vista per vista.
