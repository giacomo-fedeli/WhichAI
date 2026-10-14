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
| 38 | Claude | 2026-10-14 | (vedi git log) | `js/dotfield.js` (NUOVO), `js/motion.js` (morph rimosso, `onFrame`), `index.html` (canvas, niente `data-morph-*`), `styles.css`, `js/finder.js`, `js/topics.js`, `js/app.js`, `sw.js`, `tests/api-tests.mjs` (ermetico), `tests/run-tests.mjs`, `tests/smoke-dom.mjs` | v0.37: sfondo a puntini guidato dallo scroll al posto dei riquadri volanti; CI rossa riparata (api-tests dipendeva dalla rete); terza card nel footer con la pagina personale di Jack. 557 test verdi, anche con Node 24 su clone pulito. |
| 37 | Claude | 2026-10-13 | (vedi git log) | **Ristrutturazione completa**: `index.html` + `styles.css` + `js/app.js` riscritti (una pagina, 6 capitoli); NUOVI `js/motion.js`, `js/ranking.js`, `js/market.js`, `js/generator.js`, `api/news.js`, `api/_news-core.js`, `tests/news-tests.mjs`; riscritti `js/modelcompare.js`, `js/radar.js`, `js/topics.js` (render), `js/i18n.js` (373 chiavi x11), `tests/run-tests.mjs`, `tests/smoke-dom.mjs`; RIMOSSI welcome/journey/stage/scene3d/chains/merge/arena/live-data | v0.36: niente copertina né menu, capitoli collegati da morph, Chains/Merge/Arena/BYOK/Output comparison tolti, scatter su scala log, news automatiche. 541 test verdi. |
| 36 | Claude | 2026-10-03 | (vedi git log) | `api/_catalog-core.js`+`api/catalog.js`+`js/live-catalog.js`+`js/live-seed.js`+`js/wiki-live.js` (NUOVI), `js/models-db.js` (migrato alla scala ufficiale + liste `or`), `js/benchmarks.js` (riscritto), `api/_lib.js` (catalogo live per tutti gli endpoint), `tools/build.mjs` (seed + wiki rigenerato), finder/journey/radar/changes/app, `tests/catalog-tests.mjs` (NUOVO) | v0.35: **il sito si aggiorna da solo**. Punteggi = indice AA UFFICIALE relayato da OpenRouter (non più il mirror BenchLM). La regola della sessione 35 "due scale, mai mescolarle" è SUPERATA: ora c'è una scala sola. 521 test verdi. |
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

---

### 2026-10-03 - Claude - sessione 36 (v0.35)

**Aree toccate**: vedi riga 36 della tabella. In più: `src/scene3d.src.js` + `js/scene3d.js` (rigenerato: i valori `~` non salgono sulla scala 3D), `js/charts.js` (etichette solo sulla frontiera), `api/_refresh-core.js` (audit), `api/models|stats|recommend|health.js` (async, catalogo live), `index.html` (badge Live, About/Methodology/FAQ), `js/i18n.js` (5 chiavi x11 + radarSub x11), `styles.css` (blocco v0.35 in coda), i workflow e `package.json` (nuova suite).

**Cose da NON rifare / da sapere prima di toccare**:
1. **La regola della sessione 35 è SUPERATA.** Si diceva che l'indice relayato da OpenRouter e quello del catalogo erano due scale da non mescolare mai. Verificato il 3 ottobre: il numero di OpenRouter **è** l'indice ufficiale di Artificial Analysis (coincide con quanto pubblicato dall'AA e riportato da OfficeChai il 22 set); quello del catalogo veniva dal mirror BenchLM, su un'altra scala. Ora c'è **una scala sola, quella ufficiale**, e `tests/live-data-tests.mjs` sezione 8 lo verifica contro una risposta OpenRouter vera. Non tornare al mirror.
2. **Il campo `score.src` dice da dove viene il numero**: `"aa"` = ufficiale (est:false); `"converted"` = misurato solo sulla vecchia scala, convertito, `est:true`, originale in `was`, mostrato con "~", **mai in classifica**; `"guess"` = rumored/mai misurato. Ogni classifica (liveRank, journey, scene3d, grafici, finder, API) filtra `!m.score.est`. Non scrivere a mano un `aa` "ufficiale": per i modelli misurati il valore arriva dalla fonte da solo.
3. **Il campo `or`** (lista di route OpenRouter) è la chiave di aggancio catalogo ↔ fonte. Se si aggiunge una voce editoriale per un modello che oggi è "auto-added" (es. scrivere la recensione di Claude Opus 5.5), **mettere `or: ["anthropic/claude-opus-5.5"]`**: così il delta smette di aggiungerlo da solo e lo aggiorna come voce editoriale. Senza `or` resta il fallback per nome esatto + vendor.
4. **`tools/migrations/2026-10-03-official-aa-scale.mjs` NON va rilanciato**: rifiuta da solo (cerca `scaleVersion: "aa-official"`). È lì per provenienza.
5. **Test ancorati a una data**: `tests/catalog-tests.mjs` usa la fixture del 3 ottobre e un orologio fissato (`PinnedDate`), quindi non scade. Se un giorno si aggiorna la fixture, aggiornare le aspettative specifiche (Opus 5.5 = 57.6, route qwen3.8-27b:free, ecc.). Non scrivere test che dipendono dalla data di oggi.
6. **Mai scrivere nel repo durante il build**: `tools/build.mjs` scrive seed e wiki rigenerato solo in `dist/`. `js/live-seed.js` nel repo deve restare `window.WhichAILiveSeed = null;` (c'è un test).
7. **Route rinominate**: se nessuna delle route in `or` esiste più upstream (es. "-preview" tolto al rilascio), il delta riaggancia la voce per nome esatto + vendor invece di aggiungerla una seconda volta (test dedicato). Limite noto: se cambia il prefisso del vendor nell'id OpenRouter (es. `x-ai/` → altro), il nome-vendor non combacia e il modello comparirebbe doppio: in quel caso aggiornare le liste `or`.
8. **Prosa senza numeri**: `js/benchmarks.js` ora è editoriale (carattere delle app) + live (cifre calcolate). Non rimettere cifre, date o rank nelle note: si contraddirebbero con i numeri live entro settimane. Stesso discorso per le recensioni in models-db.js (test v33 attivi).

**Aperto per la prossima sessione**: Jack deve fare un push (uno solo) per mettere online la v0.35. Poi verificare dal vivo `https://whichai.wiki/api/catalog` (status "fresh", counts) e il badge "Live data" in home. Restano i punti editoriali di `docs/AUDIT-2026-09.md`.

---

### 2026-10-13 - Claude - sessione 37 (v0.36)

**Aree toccate**: vedi riga 37 della tabella. In più: `js/charts.js` (scatter log + frontiera + corsia free), `js/finder.js` (risposta rapida, teaser), `js/stack.js`, `js/glossary.js`, `js/changes.js`, `js/models-db.js` (tag auto-run tolto, free route ritirate), `js/api.js` (`opts.fresh`), `js/support.js`, `api/_refresh-core.js` + `api/refresh.js` + `tools/refresh-data.mjs` (free route citate dal catalogo), `api/stats.js`, `api/health.js`, `api/_lib.js`, `vercel.json` (tolto includeFiles), `tools/build-seo.mjs` + wiki rigenerato, `tools/api-dev.mjs`, `sw.js`, `package.json` (via `three`), i due workflow (news-tests), `docs/API.md`.

**Cose da NON rifare / da sapere prima di toccare**:
1. **Non esistono più "viste".** C'è una pagina con 6 capitoli (`data-chapter`) in ordine fisso: ranking, compare, radar, market, debates, tools. L'ordine sta in `CHAPTERS` di app.js e un test lo verifica. Per aggiungere un capitolo: sezione in index.html con `data-chapter` + `data-accent`, voce in `CHAPTERS`/`CHAPTER_KEYS`/`MOUNTS`, precache in sw.js.
2. **I capitoli si montano tardi** (`Motion.mount`, 900px prima del viewport). Prima di saltare a un'ancora si chiama `mountThrough(id)`, così niente sopra il bersaglio cresce durante lo scroll. Un deep link usa `behavior: "instant"` (non "auto", che segue lo smooth del CSS).
3. **I morph** si dichiarano solo nel markup: `data-morph-from="chiave"` (fondo di un capitolo) e `data-morph-to="chiave"` (dentro il successivo, anche creato via JS: finder.js mette `task`, topics.js mette `debate`). motion.js ricerca gli estremi a ogni misura. Un test verifica partenza e arrivo per ogni chiave.
4. **Indirizzi vecchi**: la mappa `LEGACY` in app.js deve coprire ogni hash pubblicato in passato (link condivisi, wiki, Google). Test attivi sia statici sia nello smoke.
5. **Niente più chiavi API nel browser.** `forgetRetiredKeys()` cancella quelle vecchie. Non reintrodurre BYOK senza una decisione di Jack.
6. **i18n**: test che ogni chiave usata (`data-i18n*`, `T("...")`, `tr("...")`) esista in 11 lingue e che non ci siano chiavi morte (eccezioni: nomi calcolati `task_*`, `tier*`, `topics<Kind>`). Le traduzioni sorgente stavano in scratchpad di sessione: per aggiungere chiavi si edita direttamente `js/i18n.js` in tutte e 11 le sezioni.
7. **`[hidden]` vince sempre** (`display:none !important` globale): non serve più ripetere `[hidden]` per ogni componente.
8. **/api/news**: ogni fonte fallisce da sola; se cambia un feed, si sistema in `SOURCES` di `api/_news-core.js` e si aggiorna la fixture inline in `tests/news-tests.mjs`.

**Aperto per la prossima sessione**: Jack deve fare il push della v0.36. Poi verificare dal vivo il Radar (news), i morph su telefono e il wiki. Restano i punti editoriali di `docs/AUDIT-2026-09.md` (debates regulation/copyright, recensioni dei modelli auto-added più importanti).

---

### 2026-10-14 - Claude - sessione 38 (v0.37)

**Aree toccate**: vedi riga 38 della tabella.

**Cose da NON rifare / da sapere prima di toccare**:
1. **Niente animazioni che "si sistemano da sole" quando lo scroll si ferma.** Jack le ha trovate a scatti. Tutto ciò che si muove con lo scroll deve essere una funzione della posizione di scroll (più al massimo un inseguimento critico di ~85 ms, che non va oltre). `js/dotfield.js` → `storyAt()` è la mappa; un test la verifica monotona e pura.
2. **Lo sfondo è un canvas sotto tutto**: `main` e `.site-footer` hanno `position: relative; z-index: 1`. Un nuovo blocco fuori da `main` va messo sopra allo stesso modo, o i puntini gli passano davanti.
3. **Testi puliti**: i selettori in `MASK_SEL` (titoli, sottotitoli, intestazioni) tengono i puntini deboli dietro il testo. Un nuovo tipo di titolo fuori dalle card va aggiunto lì.
4. **Disegni**: uno per capitolo in `FIELDS` (`prep(phi, W, H)` + `at(x, y, P)` → 0..1). Un capitolo nuovo senza disegno usa la bussola. L'ordine dei disegni deve seguire `CHAPTERS` (test).
5. **I test non devono dipendere dalla rete.** `tests/api-tests.mjs` ora intercetta `fetch`: ogni host esterno risponde con la fixture del 3 ottobre o fallisce. Il controllo rosso del 13 ottobre era proprio questo: la CI ha rete, la sandbox no.

**Aperto per la prossima sessione**: push della v0.37 da parte di Jack, poi verificare la CI verde su GitHub e lo sfondo su telefono vero. Restano i punti editoriali di `docs/AUDIT-2026-09.md`.

