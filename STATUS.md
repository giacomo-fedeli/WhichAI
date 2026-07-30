# WhichAI (ex PromptCompass) — STATUS

Ultimo aggiornamento: 2026-07-30 (sessione 30 - Claude)
Versione app: v0.29.0 (in cartella; live ancora v0.21: il primo push porta v0.22→v0.29 insieme)
Sito live: https://whichai.wiki · https://promptcompass.vercel.app resta come alias

## Fase corrente: Growth - fase 1 del piano brainstorming (SEO statico, sicurezza, retention di base)

## Fatto (sessione 30, 2026-07-30 - Claude)

- **AI DEBATES (richiesta Jack)**: nuova sezione `#topics` (menu More) + 7 pagine wiki statiche `/topics/`: i 6 grandi dibattiti AI-società (energia/data center, lavoro, bolla, copyright, regolamentazione, open vs closed) riassunti con onestà: numeri citati, preoccupazione E contro-tesi, "a che punto siamo", 2-4 fonti linkate ciascuno (IEA, Stanford HAI, WEF, Goldman, US Copyright Office, Commissione UE...). Contenuto EN, chrome tradotto ×11, disclaimer esplicito. Predisposto per diventare interattivo in futuro.
- **CONTATORE VISITE REALE (richiesta Jack, con paletto)**: integrazione GoatCounter (gratuito, open source, zero cookie) via `js/config.js` + `js/support.js`: quando Jack imposta il site code, il sito conta le visite vere e mostra il TOTALE PUBBLICO REALE nel footer e nella welcome (pallino "live" pulsante). NIENTE numero finto di partenza (384): in conflitto diretto con l'asset "honest data"/methodology del sito; il contatore resta nascosto finché non esiste un valore vero. Spiegato a Jack nel report. CSP estesa solo a gc.zgo.at e *.goatcounter.com.
- **DONAZIONI (richiesta Jack)**: link "Support ♥" nel footer (caldo ma discreto) + card in About con pitch onesto e nota "le donazioni non influenzano i ranking". Nascosti finché `donateUrl` è vuoto in config. NIENTE IBAN personale pubblico (rischio frodi SDD + privacy): consigliati Ko-fi (0% fee su PayPal) o PayPal.Me; guida nel report.
- **LOGO → WELCOME (richiesta Jack)**: click/tastiera sul brand nell'header riporta alla welcome minimale. Implementato AGGIUNGENDO `show()` all'API pubblica di welcome.js (modulo di GPT-5.6): modifica minima e coordinata, morph intatto; round-trip testato in smoke.
- **Refresh dati 30/7**: pesi Kimi K3 CONFERMATI live su Hugging Face (27/7, Modified MIT) → tag open-weights+free, voce radar da promessa a fatto (fonte kimi.com/blog); **Gemini 3.5 Pro aggiunto come RUMOR dichiarato** (info-only, stima) dai report di timing attorno al lancio K3; DB e router riverificati (109 modelli); wiki rigenerata: 169 pagine, sitemap 170 URL.
- **Versioni**: v0.29 ovunque (badge, footer, APP_VERSION, SW cache whichai-v0.29.0 con config/support/topics nel precache).
- **TEST**: 127 statici + 67 smoke = **194/194 PASSATI**.
- [ ] **Jack (guida completa nel report della sessione)**: (1) `git push origin main` da PowerShell (primo push: `gh auth login`); (2) crea account GoatCounter e metti il code in js/config.js; (3) crea pagina Ko-fi/PayPal.Me e metti l'URL in js/config.js; (4) prima GitHub Release (docs/RELEASE-NOTES-v0.28.md, usa tag v0.29.0); (5) Search Console: sitemap 170 URL; (6) marketing settimana 1 (docs/MARKETING.md).

## Fatto (sessione 29, 2026-07-26 - Claude)

- **Protocollo AI-SYNC rispettato**: letto il diff delle sessioni 27-28 di GPT-5.6 (welcome/morph/brands) prima di toccare qualsiasi cosa; aree di questa sessione (dati, arena, community) senza sovrapposizioni; entrambe le suite verdi prima del commit.
- **REFRESH DATI 26/7 (settimana pazza)**: **Claude Opus 5 è uscito il 24/7** e passa da rumored a public col nuovo snapshot AA del 24/7 (mirror BenchLM, 167 modelli): **nuovo #1 a 60.7**, Agentic Index 55.3, 1M ctx, $5/$25 invariato (Fast mode $10/$50, cache $0.50/M); ora è la scelta Claude a pagamento in finder e Stack Optimizer. Anthropic occupa i primi due posti (Fable 5 59.9). **+3 modelli → 108**: Gemini 3.6 Flash (21/7, $1.50/$7.50, 1M ctx, free tier day one → nuovo default BYOK gemini-3.6-flash), Gemini 3.5 Flash-Lite ($0.30/$2.50), Qwen3.8 Max preview (stima dichiarata). Correzioni coda tabella: Mercury 2 21.4, K-Exaone 22.1, Trinity Large 18.2, Gemma 4 12B 21.8. Router/catalogo aggiornati; route OpenRouter :free riverificate (Nemotron+Qwen3 Coder ok). Radar: +5 voci con fonti (Opus 5, snapshot, FLUX 3, Gemini 3.6, settimana Qwen); pesi K3 restano "In arrivo" (27/7). Wiki rigenerata: 161 pagine, sitemap 162 URL, nuovi testa-a-testa con Opus 5.
- **BLIND ARENA** (`js/arena.js`, `#arena`, nel menu More, 8 voci): sfide A/B alla cieca sui prompt dell'utente tra i modelli che le SUE chiavi gratuite possono eseguire (Gemini, Llama via Groq, open via OpenRouter); voto → reveal → **Elo personale locale** (pc_elo_v1, K=32, pareggio 0.5) con classifica e reset. Framing onesto ovunque: misura la preferenza personale, non la qualità globale; senza 2 chiavi mostra spiegazione + link Settings; round con errori non contati. 18 chiavi i18n ×11 (=293).
- **COMMUNITY KIT**: `CONTRIBUTING.md` (regole, schema del DB, comandi test), `.github/ISSUE_TEMPLATE/` (bug, correzione dati con fonte obbligatoria, feature request, config), `docs/RELEASE-NOTES-v0.28.md` pronto da incollare nella prima GitHub Release (con mini-guida in italiano). README: sezione Contributing.
- **Versioni**: v0.28 ovunque (badge, footer, APP_VERSION, SW cache whichai-v0.28.0 con arena.js nel precache).
- **TEST**: 115 statici + 62 smoke = **177/177 PASSATI**.
- **PENDING invariati**: demo GIF per README (serve una registrazione dal vivo, la fa Jack o GPT-5.6 con accesso al browser); Personal Benchmark completo/Council/Consensus (limite BYOK documentato); pipeline CI.
- [ ] **Jack**: (1) pubblica su GitHub (live fermo a v0.21 → questo deploy porta v0.22→v0.28; file NUOVI di oggi: `js/arena.js`, `CONTRIBUTING.md`, cartella `.github/`, `docs/RELEASE-NOTES-v0.28.md`); (2) crea la prima GitHub Release seguendo docs/RELEASE-NOTES-v0.28.md; (3) Search Console: reinvia la sitemap (ora 162 URL); (4) test live: #arena con le tue chiavi (2+ modelli), scheda Claude Opus 5 in guida, radar con le novità, wiki /models/claude-opus-5.html.

## Fatto (sessione 28, 2026-07-21 - GPT-5.6)

- **FINALE MORPH SENZA TAGLIO**: i clone ora completano prima movimento e ridimensionamento, poi sfumano rapidamente nello stesso punto fino a opacità zero. Il layer welcome dissolve negli ultimi 240 ms e viene rimosso solo quando anche l'ultimo bottone è già trasparente; eliminato lo stacco tra riquadro animato e menu reale.
- **WORDMARK LEGGIBILI IN DARK**: i logotipi SVG monocromatici caricati come immagini (il cui `currentColor` restava nero) ricevono ora una variante chiara via filtro solo sul wordmark. Le icone a colori non vengono alterate; restano disponibili le etichette testuali con font compatibili per i nomi modello.
- **VERSIONE**: v0.27 in badge/footer/`APP_VERSION`, cache PWA `whichai-v0.27.0`.
- **TEST E QA**: 103 statici + 60 smoke DOM = **163/163 PASSATI**; morph e wordmark ricontrollati in browser reale con tema dark.
- [ ] **Jack pubblica v0.27** (include tutte le release non ancora pubblicate da v0.22).

## Fatto (sessione 27, 2026-07-20 - GPT-5.6)

- **WELCOME MINIMALE NATIVA**: nuova prima schermata full-screen con solo logo WhichAI, value proposition e quattro azioni centrali. Logo/testo entrano con respiro, i bottoni arrivano in sequenza dai lati; nessun video o dipendenza runtime. Layout verificato a 1440×1000, 768×1024 e 390×844, nei temi light/dark/sepia; supporto `prefers-reduced-motion` e deep link che saltano correttamente la welcome.
- **MORPH VERSO L'APP** (`js/welcome.js`): al click logo e quattro pulsanti diventano shared-element clone e si ridimensionano verso brand/menu dell'header; insieme, i blocchi della vista scelta entrano da sinistra/destra/basso. Route Generator/Model guide/Compare/More, focus accessibile e header mobile verificati nel browser reale.
- **BRANDING AI STANDARDIZZATO** (`js/brands.js`, `assets/brands/`): registro unico per 13 famiglie e 34 provider, 76 asset SVG locali/offline, altezza e peso ottico normalizzati. Nome modello resta testo leggibile; logo/wordmark ufficiale del prodotto o provider funge da fallback quando il font proprietario non è disponibile. Fonti/licenze documentate in `assets/brands/README.md`; corretto anche il caso dei modelli che riusano una famiglia di prompt ma devono mostrare il proprio vero provider (es. MiniMax/Inkling).
- **COPERTURA COMPLETA**: marchi integrati in Generator, router, finder, Model guide, Compare, Chains, Stack Optimizer, Prompt Doctor, Merge e Model Radar. `tools/build-seo.mjs` aggiornato e wiki rigenerata: tutte le 156 pagine statiche usano gli stessi asset locali, senza immagini rotte.
- **i18n/PWA/versione**: +6 chiavi welcome ×11 lingue (=275 chiavi allineate); v0.26 in badge/footer/`APP_VERSION`, cache `whichai-v0.26.0`, nuovi script e 24 asset core nel precache.
- **TEST E QA**: 101 statici + 60 smoke DOM = **161/161 PASSATI**; controllo browser senza errori/immagini rotte su 3 temi e 3 breakpoint.
- [ ] **Jack pubblica v0.26** (live fermo a v0.21: questo deploy porta v0.22→v0.26). File NUOVI principali: `js/welcome.js`, `js/brands.js`, `assets/brands/`; wiki statica rigenerata.

## Fatto (sessione 25, 2026-07-20)

- **Scheda modello a tendina (richiesta Jack)**: il dettaglio si apre ORA subito sotto la riga cliccata (accordion con slide morbido, freccia che ruota, riga evidenziata; secondo click richiude). Prima compariva in fondo alla lista e con tanti risultati sembrava che non succedesse nulla.
- **Fix leggibilità menu More (richiesta Jack)**: le voci del pannello ereditavano lo stile "pill attiva" della nav (sfondo chiaro + testo accento = contrasto scarso). Ora stato attivo dedicato: sfondo tenue, barretta laterale accento, testo normale.
- **LINK UFFICIALI OVUNQUE (richiesta Jack)**: nuova mappa `links` (13 famiglie → app ufficiali: claude.ai, chatgpt.com, gemini.google.com, perplexity.ai, grok.com, copilot.microsoft.com, meta.ai, chat.z.ai, kimi.com, build.nvidia.com, chat.deepseek.com, chat.qwen.ai) + `vendorLinks` (34 vendor) in models-db.js. Bottone "apri app ufficiale ↗" in: scheda modello, OGNI pannello prompt generato (copi e vai a incollare), colonne del Compare output, card del finder, card dello stack, pagine wiki statiche (modelli + best-ai-for, rigenerate). Test: tutti i 105 modelli risolvono un link.
- **Compare: default su Model comparison (richiesta Jack)**: `#compare` apre il confronto su carta, a meno che ci sia già un confronto output attivo; `#compare-outputs` lo forza esplicitamente.
- **MODEL RADAR (fase 3, retention)**: `js/changes.js` = feed curato e datato con fonti (13 voci reali di luglio: K3, Inkling, GPT-5.6, Grok 4.5, snapshot AA, route free, + "In arrivo": pesi K3 il 27/7, fine prezzo intro Sonnet 5 il 31/8). `js/radar.js` = vista `#radar` (prima voce del menu More): filtri per tipo, badge NEW rispetto all'ultima visita (pc_radar_seen), watchlist ★ per modello (pc_watch_v1, attivabile anche dalla scheda modello) con filtro "Seguiti", fonte linkata su ogni voce. **Pallino blu sul bottone More** quando ci sono novità non viste; sparisce visitando il radar. Il feed va aggiornato col refresh mensile (2 minuti: si aggiungono le voci in cima a changes.js).
- **SHARE CARD (viralità)**: `js/sharecard.js` disegna una PNG 1200x630 (canvas puro, design scuro con aurora, zero librerie) con i risultati di finder e stack; share sheet nativo su mobile, download su desktop.
- **i18n**: +20 chiavi ×11 (=269). **Versioni**: v0.25 ovunque, SW cache v0.25.0 con changes/radar/sharecard nel precache. Wiki rigenerata (156 pagine con link ufficiali).
- **TEST**: 94 statici + 57 smoke = **151/151 PASSATI**.
- [ ] **Jack pubblica v0.25** (live fermo a v0.21: questo deploy porta v0.22→v0.25). File NUOVI: `js/changes.js`, `js/radar.js`, `js/sharecard.js`.

## Fatto (sessione 24, 2026-07-20)

- **AI STACK OPTIMIZER** (`js/stack.js`, vista `#stack`, nel menu More): 4 scelte (attività, abbonamenti attuali, budget, esigenze) → stack consigliato rule-based e trasparente: quale UNICO abbonamento pagare (budget $20), cosa coprire coi piani gratuiti, costo stimato vs spesa attuale, risparmio stimato, abbonamenti "forse ridondanti". Esigenze privacy/API fanno emergere opzioni locali/open e route gratuite. Profilo persistito (pc_stack_v1), export .md. Prezzi da pagine vendor (snapshot luglio 2026), ranking dal router; tutto etichettato come stima.
- **PROMPT DOCTOR** (`js/doctor.js`, vista `#doctor` + scorciatoia accanto a "Refine with AI" nel Generator): incolli un prompt → punteggio 0-100 da 10 check pesati e bilingue (EN+IT), checklist di cosa manca con suggerimento, e vista prima/dopo dove la versione ottimizzata è generata dall'engine esistente per una delle 13 famiglie, con lista "cosa è cambiato e perché". 100% statico, zero API.
- **HOMEPAGE A DUE PERCORSI (6.1+6.2)**: l'empty state ora apre con un risultato di esempio già completo (goal, best pick e alternativa gratuita presi LIVE dal router benchmark, quindi sempre aggiornati) e due azioni: "Prova questo esempio" (genera davvero) o "Il tuo in 30 secondi" (finder). Il valore si vede prima di compilare qualsiasi form.
- **NAV RAGGRUPPATA (richiesta Jack)**: 3 voci primarie (Generator, Model guide, Compare) + menu "More ▾" a comparsa con 6 voci descritte (Chains, Stack Optimizer, Prompt Doctor, Glossary, About, Settings), chiusura con Esc/click fuori, stato attivo, foglio a tutta larghezza su mobile, RTL ok. Meno dispersione al primo arrivo, stessa profondità per chi la cerca.
- **i18n**: +39 chiavi ×11 (=249). **Versioni**: v0.24 ovunque (badge, footer, APP_VERSION, SW cache whichai-v0.24.0 con stack.js e doctor.js nel precache).
- **TEST**: 83 statici + 46 smoke DOM = **129/129 PASSATI** (scenari stack, scoring doctor EN+IT, flussi completi in jsdom).
- [ ] **Jack pubblica v0.24** (include v0.22 e v0.23 mai pubblicate). File NUOVI di questa sessione: `js/stack.js`, `js/doctor.js`. Modificati: index.html, styles.css, js/app.js, js/i18n.js, sw.js, tests/, README/STATUS/CHANGELOG.

## Fatto (sessione 23, 2026-07-20)

- **Fix tema scuro (richiesta Jack)**: causa reale trovata: `--focus` non era mai ridefinito in dark, quindi ogni link/azione/anello di focus restava blu scurissimo (#2563eb) su grigio scuro, quasi illeggibile. Ora dark usa #60a5fa; aggiunto `color-scheme: light/dark` per tema (controlli nativi, tendine e scrollbar seguono il tema).
- **Tipografia (richiesta Jack)**: eliminati TUTTI i 497 trattini lunghi dai testi visibili (i18n ×11 lingue, review DB, note benchmark, prompt engine, HTML, manifest). Separatori diventati "·", prosa con virgole/trattino semplice, simbolo dato-mancante ora "n/a" ovunque. Test automatico che ne impedisce il ritorno.
- **Raggi unificati (richiesta Jack)**: token unici `--r-card: 14px` (superfici) e `--r-ctl: 10px` (controlli); pillole/chip restano 999 by design (linguaggio "filtro/stato").
- **BRAINSTORMING FASE 1**:
  - **Wiki statica SEO (P0)**: nuovo `tools/build-seo.mjs` (rieseguibile: `node tools/build-seo.mjs`) genera 156 pagine HTML pure dal database: 106 schede modello in `/models/`, 8 classifiche `/best-ai-for/`, 26 voci `/glossary/`, 12 testa-a-testa `/compare/` + indici + `sitemap.xml` (157 URL, prima 1!). Pagine senza JS, canonical/OG, data snapshot, "n/a" e "~" onesti, CTA verso l'app. Nuovo deep link `/#model=<id>`.
  - **Dataset aperto**: `data/models.json` (CC BY 4.0), 105 modelli.
  - **Sicurezza chiavi (P0)**: default SESSION-ONLY; salvataggio su dispositivo solo opt-in con spiegazione onesta; "Clear all API keys"; CSP restrittiva (script self+hash, connect solo ai 3 provider BYOK); chi aveva già chiavi salvate resta in modalità dispositivo (migrazione automatica).
  - **Backup dati (6.4)**: Settings > "Your data": export JSON, import, "Delete all data". 16 chiavi i18n ×11 (=210 totali).
  - **PWA offline vera (7.4)**: precache della shell all'install, navigazione offline, toast "nuova versione pronta".
  - **Methodology v1.0 (7.2)**: card versionata in About (#about-methodology).
- **TEST**: 69 statici + 39 smoke DOM = **108/108 PASSATI**.
- **PENDING (con motivo)**: (1) Personal Benchmark / Blind Arena / Council / Consensus Map: servono output multi-provider ma il BYOK copre solo Gemini/Groq/OpenRouter, risultati distorti; fattibile versione ridotta "arena tra modelli auto-run" se si accetta il limite. (2) Homepage a due percorsi + demo precompilata: decisione prodotto+copy, da fare insieme. (3) AI Stack Optimizer: fattibile client-side, PROSSIMO step consigliato. (4) Prompt Doctor: fattibile in versione statica (checklist+score+diff), step dopo. (5) Model Radar: serve un feed curato dei cambiamenti col refresh mensile. (6) Evals Lite, Local AI Advisor, estensione browser, CI: sforzo alto, fasi 2-4.
- [ ] **Jack pubblica v0.23** (include la v0.22 mai pubblicata). NUOVE CARTELLE: `models/`, `best-ai-for/`, `glossary/`, `compare/`, `data/`, `tools/`, `tests/`.

## Fatto (sessione 22, 2026-07-19: nuovo PC/profilo, ripresa progetto)

- **Ripresa su nuovo profilo**: HANDOVER/STATUS letti, integrità verificata, **branch git di backup `backup-v0.21`** creato prima di toccare qualsiasi cosa (working tree pulito al commit v0.21). **Bug di sync RICONFERMATO** con test controllato (edit host invisibile in sandbox) → TUTTE le modifiche a file esistenti fatte sandbox-side (script python/node in `_patches/`, poi rimossi); file nuovi via Write (sincronizzano ok).
- **1) Fix clipping bottoni**: causa trovata — `.site-nav` è scroll container `overflow-x:auto` (header a una riga) che clippa anche in verticale: pill tagliate sopra in hover (translateY(-1px)) e sotto a riposo. Fix: respiro interno al container (`padding-block:5px; margin-block:-5px` + inline) senza rimuovere le animazioni; aggiunti **:focus-visible ring** coerenti ovunque, hover lift uniforme sui `.btn-copy` (solo transform, zero layout shift), wrap dei nomi lunghi.
- **2) Footer su tutte le viste**: FAQ · Similar tools · Contribute (deep-link `#about-faq/-similar/-contribute` con scroll all'ancora) · Glossary. Routing hash esteso a prefissi; click sul link già attivo forza comunque la navigazione. i18n ×11.
- **3) Refresh dati (fonti registrate, recupero 19/7)**: snapshot **AA 16 luglio** (mirror BenchLM) → 7 score corretti (Fable 5 59.9, Sol 58.9, Opus 4.8 55.7, Muse Spark 1.1 50.6, Hy3 41.2, Kimi K2.5 35.4, Step 3.7 30.3); **+2 modelli → 105/34 vendor**: **Kimi K3** (16/7: 2.8T MoE, 1M ctx, vision, AA 57.1 #3, $3/$15, pesi il 27/7 Modified MIT) e **Inkling** (Thinking Machines, 15/7: 975B/41B, multimodale, Apache 2.0, AA 40.7). Nuovo campo **`spec`** (released/ctx/modal/priceIn/priceOut/speed/note) su 17 modelli da pagine vendor (Anthropic 10/50, 5/25, 2/10 intro; Gemini 2/12 e 1.5/9; GPT-5.6 5/30, 2.5/15, 1/6; Grok 4.5 2/6 ~80 tok/s). benchmarks.js: LMArena 16/7 (top-10 in ~28 Elo, Fable 5 guida il coding board, K3 #1 Frontend Arena), note catalogo riallineate alla scala rebased, +3 fonti. **Route OpenRouter :free riverificate** — default invariati validi; DeepSeek/Mistral ancora senza free; Hy3 free scade il 21/7 (non usato come default). Prezzo GPT-5.5 non pubblicato → lasciato vuoto.
- **4) Model guide potenziata**: scheda modello con specs (uscita, context, modalità, prezzo, velocità) + riga di provenienza dati + bottone "Compare →"; sezione **"Market at a glance"** con 2 grafici SVG senza librerie (`js/charts.js`, theme-aware, tooltip nativi, reduced-motion ok): top-12 score misurati e **prezzo vs prestazioni** (solo modelli con prezzo pubblicato E score misurato — 10 punti). Grafico context window NON fatto di proposito: tutti i frontier attuali sono a 1M → zero informazione.
- **5) Compare in 2 modalità** (subtab): *Output comparison* = flusso esistente intatto; *Model comparison* = nuovo `js/modelcompare.js` (`#compare-specs`): 2-3 modelli a scelta tra i 105, barre AA sovrapposte, profili per categoria, tabella specs con "—" per i non pubblicati e "~" per le stime + avviso esplicito di non confrontare stime e misure. Selezione persistita.
- **6) Chains col roadmap visuale**: striscia di nodi numerati e collegati (frecce, RTL-aware, verticale su mobile) sopra gli step — modello, scopo, In/Out per nodo; nodo verde quando l'output c'è; click → scroll allo step. **Riordino ↑/↓, rimozione ✕, "+ Add step"** (step custom con istruzione editabile, `{goal}` supportato). I prompt restano sempre calcolati freschi → il riordino è consistente. Limite noto: gli share link non trasportano gli step custom (URL corto by design).
- **7) Sepia più distinto**: palette crema/marroni caldi (#f1e5cd bg), accenti ambra, aurora e grafici caldi; contrasti verificati (testo ~9.7:1, muted ~4.9:1, link scuriti a #7a4d20 ~5:1); niente gialli saturi né claim medici.
- **8+11) Mobile & low-effort**: mode switch e subtab full-width, finder a colonna singola, griglia confronto compatta, roadmap verticale con ↓, insights impilati, target touch ≥40px, testi brevi con progressive disclosure ovunque; reduced-motion copre tutte le animazioni nuove.
- **9) FINDER GUIDATO** (novità grossa, `js/finder.js`, tab "Guided finder" nel Generator, hash `#finder`): 4-5 domande adattive (task → uso → budget → esigenze multi-scelta → domanda specifica per coding/research/writing) → raccomandazione **rule-based trasparente**: top match + 2 alternative, ognuna con "Why this pick" (le regole scattate, citando router/benchmark), best-for, limite onesto, accesso/prezzo (presi dal DB, mai duplicati), link alla scheda in Model guide e "Write a prompt for it" che preseleziona famiglia+task. Dev mode propone modelli API/open (Qwen3 Coder free, Kimi K3, Nemotron free); privacy fa emergere Inkling (pesi locali). Contenuto domande in inglese (policy contenuti), chrome tradotto ×11.
- **10) GLOSSARIO** (`js/glossary.js`, vista `#glossary` dal footer): 26 termini in una frase semplicissima + esempio quotidiano + link alla feature collegata; ricerca live; tutto collassato di default (faq-style).
- **12) Qualità**: nessuna libreria aggiunta all'app (grafici SVG a mano); logica dati/UI separata nei moduli; stati empty/errore per finder/compare/glossario; escaping difensivo nei grafici; versioni coerenti (badge+footer+APP_VERSION+SW `whichai-v0.22.0`).
- **i18n**: +56 chiavi ×11 lingue (=193 totali) + compareTitle/compareSub aggiornate; test completezza verde.
- **TEST**: nuova suite persistente `tests/run-tests.mjs` (**57 check statici, senza dipendenze**: sintassi ×12, integrità DB, benchmark, i18n ×11, regressioni engine/chains, charts+escaping, glossario, 7 scenari del finder, id cross-check HTML↔JS, coerenza versioni, graffe CSS, manifest) e `tests/smoke-dom.mjs` (**32 check con jsdom**: boot reale dell'app e percorso completo di ogni vista — finder end-to-end, generate, glossario, guide+insights+scheda K3, compare specs 2→3 modelli, chains build/add/riordino/rimozione, ancore About, cambio lingua IT+AR RTL, ciclo temi). **89/89 PASSATI.**
- **Docs**: nuovo `CHANGELOG.md` (fonti con date di recupero), README riscritto, questo STATUS. Script one-shot `_patches/` rimossi a fine sessione. Commit git di checkpoint `v0.22` creato (oltre al branch `backup-v0.21`).
- [ ] **Jack — per pubblicare v0.22**: (1) upload su GitHub → Vercel auto-deploy. **FILE NUOVI**: `js/charts.js`, `js/finder.js`, `js/glossary.js`, `js/modelcompare.js`, `tests/` (2 file), `CHANGELOG.md`. **MODIFICATI**: `index.html`, `styles.css`, `js/app.js`, `js/i18n.js`, `js/models-db.js`, `js/benchmarks.js`, `sw.js`, `README.md`, `STATUS.md`. (2) Test live: hover sulle pill del nav (niente tagli, anello focus col Tab), footer 4 link da ogni vista, Generator → "Guided finder" percorso completo, Compare → tab "Model comparison" con 3 modelli, Chains → roadmap + riordino + step custom, Model guide → "Market at a glance" + scheda Kimi K3, tema sepia, lingua araba RTL, telefono (roadmap verticale, finder, tabella confronto). (3) Dopo il deploy: hard refresh / attesa SW (cache v0.22.0).

## Fatto (sessione 21, 2026-07-13 — nuovo PC)

- **Trasferimento verificato e riparato**: il primo ZIP era un mix di versioni vecchie (app/i18n/models-db pre-v0.16, icons/ mancante); confrontato coi file live (v0.20 corretta), Jack ha riscaricato lo ZIP → cartella OK. Live e repo erano sempre stati integri.
- **Dominio whichai.wiki**: comprato su Porkbun e collegato a Vercel da Jack ✓. Oggi l'apex reindirizza a www — TODO Jack: in Vercel → Domains impostare whichai.wiki (senza www) come primary. Rinnovo 2027 ~$26 (auto-renew ON, decidere nel 2027).
- **REBRANDING → WhichAI (v0.21)**: nome ovunque (title, meta, og/twitter, JSON-LD con alternateName "PromptCompass", manifest, footer, About/FAQ, README, i18n ×11); canonical/og:url/sitemap/robots → https://whichai.wiki; og-image.png rigenerata (PIL: bussola + "WhichAI" + tagline, verificata visivamente); bussola e stile grafico invariati. Identificatori JS interni (PromptCompassEngine/I18n/…​) NON rinominati, solo stringhe visibili. Export .md e X-Title → WhichAI; filename whichai-*.md.
- **Temi**: (1) fade morbido al cambio tema (classe .theme-fade su <html>, transition 0.35s su colori, rimossa dopo 450ms; disattivata con prefers-reduced-motion); (2) NUOVO tema sepia/warm ([data-theme="sepia"]: palette carta calda, aurora ambrata, override input/prompt/badge); (3) toggle a 3 stati ☀→☾→◐ con tooltip i18n (themeTip) e meta theme-color dinamico. Persistenza pc_theme invariata.
- **Header una riga (≥681px)**: header-inner/site-nav nowrap con overflow-x auto senza scrollbar; pill compattate a 681-1024px. Lang select + theme toggle restano in riga.
- **Mobile tabs**: i tab dei prompt nel Generator ora vanno A CAPO come chip pillola (niente più scroll orizzontale); attivo = pieno. Override del blocco 680 in coda al css.
- **Settings API potenziati**: guida collassabile "How to get free API keys" (3 passi con link diretti aistudio/console.groq/openrouter); bottone **Test key** per Gemini/Groq/OpenRouter con esito verde/rosso (endpoint: models list per Gemini/Groq, /auth/key per OpenRouter — messaggio "Key works — N models reachable" / label chiave).
- **Engine v0.21 — prompt decomposti**: nuovo goalMeta() estrae audience ("aimed at/targeting/rivolto a...") e vincoli hard (must/under/entro/numeri+unità, max 3) SOLO se presenti nel goal (zero invenzioni); WORKFLOWS (3 fasi per ciascuno degli 8 task) iniettate come sezione Approach in tutti e 5 i builder (XML per Claude, ## per GPT/Llama, lista per Gemini, inline per Perplexity); self-check finale "Before finalizing, re-read the requirements...". Export: Engine.WORKFLOWS, Engine.goalMeta. Chains eredita automaticamente.
- **Refine goal con AI (BYOK)**: bottone "✦ Refine with AI" sotto il campo Goal → usa la prima chiave disponibile (gemini→groq→openrouter nemotron/qwen) con meta-prompt che riscrive il goal (stessa lingua/intento, <120 parole, solo testo); risultato in box modificabile con "Use this version"/"Keep mine" — revisione umana sempre. Senza chiave → messaggio che rimanda a Settings.
- **MERGE STUDIO (novità grossa, #merge)**: dal Compare il bottone "Merge studio →" porta gli output in una vista editor: sorgenti per modello (Use as base / Add selection / Append all / ×), bozza a destra (sticky su desktop), evidenziazione opzionale delle FRASI COMUNI a 2+ modelli (split frasi + normalizzazione, tooltip "N×"), aggiunta manuale di output esterni (label+testo), copy/export .md/clear, conteggio parole, persistenza pc_merge_v1. Tutto manuale by design (richiesta Jack: revisione umana). Nuovo modulo js/merge.js (window.WhichAIMerge), routing hash #merge (nav Compare resta attiva), i18n completa.
- **Benchmark/DB refresh (13 luglio)**: GPT-5.6 PUBBLICO confermato; AA rebased: Fable 5 = 60 (max effort) #1, Sol max = 59 (−1), Opus 4.8 = 56, Terra 55, Luna 51; Sol guida il Coding Agent Index (80) a ~1/3 del costo per task. Aggiornati benchmarks.js (updated, note router/catalogo) e models-db.js (aa Sol 59, Opus 56; updated). Fonti: artificialanalysis.ai (articoli GPT-5.6 e Fable 5), benchlm.ai, officechai.
- **i18n**: +33 chiavi (test chiavi, refine, merge, themeTip) × 11 lingue = 138 chiavi totali, test completezza OK; brand swap in tutte le stringhe.
- **Versioni**: v0.21 ovunque (badge, footer, APP_VERSION, SW CACHE "whichai-v0.21.0"). **Suite test completa PASSATA** (31 check: moduli, engine, chains regression, DB 103, benchmark, i18n, id cross-check 101, css graffe, manifest, merge).
- **Bug di sync RICONFERMATO sul nuovo PC**: js/merge.js editato host-side è apparso troncato in sandbox → ricostruito col workaround documentato (Write su file nuovo → cp da sandbox → rm). Le patch grosse sono state fatte tutte sandbox-side (python heredoc), zero problemi.
- **Marketing**: nuovo docs/MARKETING.md (piano completo costo zero: canali, testi pronti, calendario 4 settimane, direttive) + 2 automazioni Cowork programmate: post settimanali (lun 9:00) e manutenzione DB mensile (1° del mese 9:30).
- **Nota deploy**: ora esiste un MCP Vercel collegato a Cowork (list/get project, deployments, docs) — la sandbox resta bloccata ma l'MCP passa. Il deploy diretto via MCP però richiede l'upload inline di tutti i file (payload troppo grande) → si continua con GitHub upload di Jack.
- [ ] Jack: (1) Vercel → Domains → whichai.wiki "Set as primary" (redirect www→apex); (2) pubblica v0.21 su GitHub (NUOVO FILE: js/merge.js; og-image.png SOSTITUITA; modificati: index.html, styles.css, sw.js, manifest, robots, sitemap, README, STATUS, tutti i js tranne chains.js); (3) test live checklist: ciclo tema con fade, sepia, header 1 riga desktop, tabs mobile a capo, Refine with AI, Test key ×3, Merge studio, lingua araba RTL, PWA; (4) Google Search Console: proprietà whichai.wiki (TXT su Porkbun) + submit sitemap; (5) via col piano marketing settimana 1.

## Fatto (sessione 20, 2026-07-12)

- **Fix leggibilità dark (richiesta Jack)**: audit colori hardcoded → 2 bug reali corretti: `.step-n` (numeri 1-2-3 dell'empty state) era bianco-su-quasi-bianco in dark (ora testo scuro); `--error` era un rosso scuro illeggibile su fondo scuro (ora #f87171 in dark). Verificati ok: prompt-text/prompt-edit/btn-copy/badge-privacy/chip/cat-bars.
- **Glass design brand-aware**: variabili `--glass`/`--glass-border` per tema; router-card, scheda modello, empty-state, lang-note e card About ora in vetro (backdrop-blur 14px + saturate) con l'aurora che traspare; aurora leggermente più ricca in light; fallback `@supports not (backdrop-filter)` → superficie solida.
- **Nav mobile auto-scroll (richiesta Jack)**: la nav dell'header scorre da sola lentissima (16px/s) avanti-indietro con pausa di 1.4s ai bordi, così su mobile si capisce che c'è altro; si ferma DEFINITIVAMENTE al primo tocco/scroll/tasto dell'utente; disattivata con prefers-reduced-motion; inattiva su desktop (dove la nav non trabocca).
- **Kit trasferimento PC**: nuovo `HANDOVER.md` (checklist umana; Project instructions pronte da incollare nel nuovo progetto Cowork; primo prompt per la prima chat; stato sintetico per il nuovo Claude) + `PromptCompass-Trasferimento.docx` (guida umana 1 pagina, verificata visivamente). Metodo consigliato: pubblicare v0.20 su GitHub e scaricare lo ZIP dal repo sul nuovo PC (Drive come alternativa).
- **Domini verificati (34 check totali)**: whichai.wiki $2.99 DISPONIBILE (scelta di Jack, probabilmente); quasi tutti gli altri whichai.* presi (segnale che il nome è forte); alternative libere: rightmodel.pro/choosemodel.pro/aiforthis.pro/whichllm.pro $4.99, bestmodel.wiki/promptlab.wiki/promptcompass.wiki $2.99, promptcompass.pro $4.99. **.claude non è un TLD esistente.**
- **Versioni**: v0.20 ovunque (badge, footer, APP_VERSION, SW cache). Test passati.
- [ ] Jack pubblica v0.20 PRIMA di cambiare PC (così GitHub = trasferimento), compra il dominio su Porkbun (WHOIS privacy on), e sul nuovo PC segue HANDOVER.md.
- [ ] Prossima sessione (nuovo PC): verifica trasferimento; se dominio comprato → collegarlo a Vercel (2 record DNS su Porkbun) + eventuale rebranding se il nome scelto ≠ PromptCompass (nome, logo, meta, og-image, README, manifest).

## Fatto (sessione 19, 2026-07-12)

- **Review tools con fix**: (1) share link — riaprire un SECONDO link condiviso nella stessa sessione ora funziona (guard per-parametro invece del flag one-shot `chainImportDone`); (2) aggiunto meta moderno `mobile-web-app-capable` (l'apple-only è deprecato, tenuto per iOS); (3) barre categoria ora animate da 0 al valore (rAF doppio + transition).
- **Icone vettoriali coerenti (stroke 1.8, stile brand)**: set di 8 icone SVG inline per i task della Model guide (penna, code brackets, bar chart, lente, lampadina, cappello laurea, valigetta, sparkle) — test impone un'icona per ogni task dell'engine.
- **Micro-animazioni interattive** (blocco CSS v0.19, tutte disattivate con prefers-reduced-motion):
  - ago della bussola nell'empty state che oscilla (needle-sway 3.4s);
  - ago del logo che ruota di 315° all'hover sul brand;
  - guide-card: lift all'hover + icona che si colora (--focus) e scala 1.12;
  - model-check: lift hover + pop quando spuntato; chip filtro: pop all'attivazione;
  - bottoni: press scale (primary 0.985, copy/link/chip 0.96); stelle: pop 1.18; nav pills: lift;
  - risultati ricerca modelli: freccia → che scivola dentro all'hover (← in RTL);
  - FAQ: chevron ▾ che ruota all'apertura; theme toggle: spin 360° al click.
- **Versioni**: v0.19 ovunque (badge, footer, APP_VERSION, SW cache). Test suite completa passata.
- Ricerca dominio in corso (Porkbun): nomi alternativi + check disponibilità. NB: **.claude non è un TLD esistente**.
- [ ] Jack pubblica v0.19 (= v0.14→v0.19).

## Fatto (sessione 18, 2026-07-12)

- **3 nuove lingue → 11 totali**: Русский, 日本語, العربية — tutte le 105 chiavi UI tradotte, test completezza passato. **RTL per l'arabo**: `dir="rtl"` automatico su `<html>` quando lang=ar; CSS dedicato che tiene SEMPRE in LTR prompt generati, textarea output e campi chiave API (unicode-bidi plaintext), flip di padding/margini direzionali.
- **Bug fix footer versionato**: i dizionari i18n contenevano "PromptCompass v0.12 — Growth · ..." hardcoded (il cambio lingua riportava il footer a v0.12). Ora: costante `APP_VERSION` in app.js + footerText nei dizionari ridotto alla sola coda tradotta; il footer si compone a runtime. Prefisso rimosso da tutte le 8 lingue esistenti via regex (n=8 verificato).
- **SEO**: `og-image.png` 1200×630 generata con PIL (bussola brand + tagline, verificata visivamente); meta og:image/type + twitter:card summary_large_image; canonical; JSON-LD schema.org WebApplication (price 0, author Giacomo Fedeli + LinkedIn); `robots.txt` + `sitemap.xml`.
- **Chains — "Share link"**: bottone che copia un URL `#chains?d=<base64>` con goal, context, task type e modello per step (SENZA output — l'URL resta corto e non trasporta dati privati). All'apertura del link la catena si ricostruisce dai template (campi precompilati, modelli rispettati se validi, fallback al router; input troncati a 4000 char; link malformati ignorati in silenzio). Routing hash aggiornato: `#chains` ora match per prefisso.
- **Versioni**: badge/footer v0.18, APP_VERSION v0.18, SW cache `promptcompass-v0.18.0` (bump fatto ✓).
- **Test**: sintassi 6 js + sw; roundtrip encode/decode share (payload con em-dash e accenti); completezza i18n 11 lingue; footerText non versionato; RTL presente (js+css); SEO (og/twitter/ld+json/canonical + 3 file); id cross-check; DB invariato (103); graffe CSS — TUTTI PASSATI.
- [ ] Jack pubblica v0.18 (= v0.14→v0.18; NUOVI FILE: manifest.webmanifest, sw.js, og-image.png, robots.txt, sitemap.xml, cartella icons/).

## Fatto (sessione 17, 2026-07-12)

- **Chains — "Run all steps"**: nuovo bottone accanto a "Save chain". Esegue gli step in sequenza (l'output di uno alimenta il prompt del successivo, sempre costruito fresco); salta gli step con output già presente (→ ripresa naturale); si ferma con messaggio chiaro se uno step non ha auto-run (modello manual-paste), se manca la chiave, o su errore API — "premi Run all di nuovo per continuare". Progresso visibile ("Running step 2 of 3…", status per provider).
- **Chains — "Export .md"**: scarica la catena completa (goal, context, task type, data; per ogni step: nome, modello, prompt in code-block, output o "(not filled)") come promptcompass-chain.md. Stesso pattern Blob dell'export Compare.
- **PWA installabile (telefono/desktop)**:
  - `manifest.webmanifest` (standalone, theme #17181c) + icone PNG generate con PIL dalla bussola del brand: 192, 512, 512-maskable (full-bleed, safe zone 80%), apple-touch-icon 180 in `icons/`.
  - `sw.js`: service worker **network-first** con fallback cache SOLO offline — mai contenuti stale dopo un deploy; ignora richieste cross-origin (le chiamate API Gemini/Groq/OpenRouter NON passano dal SW). Cache versionata `promptcompass-v0.17.0` con pulizia delle vecchie in activate. **REGOLA: bump della costante CACHE a ogni release.**
  - Head: link manifest, theme-color, apple-mobile-web-app-*, apple-touch-icon. Registrazione SW in app.js solo su https/localhost, non-bloccante.
- **Test**: sintassi (6 js + sw.js), manifest JSON valido + icone esistenti, wiring PWA (manifest/theme/apple/SW register), SW cross-origin-skip + cache versionata, id cross-check, bottoni chains presenti, simulazione logica run-all (stop su step manuale), DB invariato (103) — TUTTI PASSATI.
- [ ] Jack pubblica v0.17 (= v0.14+v0.15+v0.16+v0.17) e prova: da telefono "Aggiungi a schermata Home"; Chains → Run all con chiavi Gemini/OpenRouter.

## Fatto (sessione 16, 2026-07-11)

- **Runner OpenRouter (BYOK, 3° provider)**: sezione in Settings con chiave (sk-or-...) + 5 campi modello per famiglia. Default GRATUITI verificati (costgoat/openrouter, 11 luglio): `nvidia/nemotron-3-ultra-550b-a55b:free` e `qwen/qwen3-coder:free` (limiti free: ~20 req/min, 200/giorno). GLM/Kimi/DeepSeek: NESSUNA route free su OpenRouter a oggi → campi vuoti di default (messaggio guida se si preme Run), l'utente può inserire un ID a pagamento sui propri crediti. Fetch diretto dal browser a openrouter.ai/api/v1/chat/completions (OpenAI-compatible, header X-Title). RUNNERS ora: gemini (Google), llama (Groq), nemotron/qwen/glm/kimi/deepseek (OpenRouter). Compare e Chains ereditano automaticamente ("(auto-run)" nel select degli step).
- **models-db**: +1 voce **Qwen3 Coder** (free su OpenRouter, 1M ctx, auto-run) → 103 modelli; tag auto-run + slug espliciti su Nemotron 3 Ultra/Super. Nota "PromptCompass default runner" sull'Ultra.
- **benchmarks.js allineato all'indice AA rebased**: updated 11 luglio; note riscritte dove c'erano numeri stali (61.4 → Fable 5 = 60 max effort / Opus 4.8 = 55.7; menzione GPT-5.6 Sol 58.9 leader dello snapshot default-config; nota GPT-5.6 series nel catalogo frontier).
- **Responsive completo (richiesta Jack: phone/tablet/desktop)**, blocco v0.16 in styles.css:
  - ≤1024px: layout a 1 colonna, padding ridotti.
  - ≤680px: header a wrap con nav a UNA riga scorrevole (scrollbar nascosta), tabs dei prompt scorrevoli, form a 1 colonna, bottone Generate full-width, input/select/textarea a 16px (anti-zoom iOS), card/padding compatti, steps-strip verticale, footer ridotto.
  - ≤480px: badge privacy solo icona (#privacy-text nascosto), brand ridotto.
  - `pointer: coarse` (touch): target ≥40-44px per nav/bottoni/db-hit, stelle più grandi, chip filtro più comodi.
- **Settings/About aggiornati**: FAQ chiavi menziona OpenRouter; riga "Get free keys" con openrouter.ai/keys.
- **Test**: sintassi 6 file; integrità DB (103, auto-run solo su famiglie con runner); RUNNERS coverage (7 famiglie); nuovi id HTML (openrouter-key, or-model-×5); id cross-check completo; CSS graffe bilanciate + 4 media query presenti; simulazioni precedenti invariate — TUTTI PASSATI.
- Modifiche fatte interamente sandbox-side (python3/heredoc) per evitare il bug di sync della sessione 15. Nessun problema.
- [ ] Jack pubblica v0.16 (include v0.14 e v0.15 mai pubblicate) e testa da telefono.

## Fatto (sessione 15, 2026-07-11)

- **Contesto**: chat precedente persa (PC spento durante la sessione). Screening completo: file v0.14 integri (nessuna corruzione), live fermo a v0.13.
- **Database modelli riscritto (`js/models-db.js`, v0.15)**: **102 modelli, 33 vendor** — pubblici, privati (Mythos 5), preview (Kimi K2.7 Code), legacy (20) e **5 rumored dichiarati** (GPT-6, Claude Opus 5, Gemini 3 Ultra, Grok 5, Llama 5 — sempre est:true + info-only, copy con hedging esplicito).
- **Score riallineati all'AA Intelligence Index 2026 rebased** (snapshot 10 luglio via mirror BenchLM, 162 modelli): 80 score reali, 22 stime dichiarate. Top: Fable 5 = 60 (max effort), GPT-5.6 Sol 58.9, Opus 4.8 55.7, Terra 55, GPT-5.5 54.8, Grok 4.5 53.8, Sonnet 5 53.4, GLM-5.2 51.1 (top open).
- **Novità di luglio verificate via ricerca**: GPT-5.6 Sol/Terra/Luna PUBBLICI dal 9 luglio ($5/$30, $2.5/$15, $1/$6); Grok 4.5 uscito l'8 luglio (coding/agents, $2/$6, no EU); **Muse Spark 1.1 = Meta Superintelligence Labs, primo modello a pagamento di Meta** (9 luglio); Hunyuan 3.0 open Apache (6 luglio); nuovi vendor censiti: Xiaomi MiMo, ByteDance Doubao, Baidu ERNIE, Ant Ling, StepFun, Inception Mercury (diffusion), LG, Upstage, Arcee, Sarvam, TII, Reka, Ai2, Liquid, IBM, AI21.
- **Score per categoria (richiesta Jack)**: ogni modello ha `cat` = 4 rating 0-100 (Coding, Reasoning, Writing, Agents & tools) — "PromptCompass blended ratings" dichiarati come tali nella scheda; barre orizzontali nel dettaglio + disclaimer.
- **Nuovo campo `labels`** (strengths ricercabili/filtrabili): coding, reasoning, writing, research, agents, speed, value, multilingual, vision, long-context, local, enterprise.
- **Filtri a chip cliccabili** sotto la barra di ricerca: 9 chip stato/accesso (In Generator, Auto-run, Free, Open weights, API, Private, Preview, Legacy, Rumored) + 12 chip strengths; combinabili tra loro e col testo (AND); i soli chip senza testo mostrano la lista filtrata; max 20 risultati + contatore.
- **Marker "✦ In Generator"** nei risultati di ricerca (tooltip); nel dettaglio il tag prompt-target è mostrato come "in Generator".
- **FAQ**: aggiunta 8ª domanda "What do the category scores and labels mean?"; ritoccata quella sull'affidabilità (include rumored). README aggiornato (102 modelli, v0.15).
- **Test**: sintassi 6 file, integrità DB (id unici, tag/label validi, private+rumored→info-only, family→Generator, cat 0-100, review non deboli), wiring UI (#db-filters, buildFilters, cat-bars), id cross-check getElementById→HTML, simulazione ricerca+filtri (myth→Mythos/Fable, Rumored→5, Free+coding→11, In Generator→61) — TUTTI PASSATI.
- **NB bug di sync RICONFERMATO** (vedi nota tecnica): i 3 file modificati lato host apparivano troncati in sandbox; ricostruiti con strip-ultima-riga-parziale + append della coda via heredoc (sandbox-side), poi ritestati. styles.css era stato appeso direttamente sandbox-side (ok).
- [ ] Pubblicazione v0.15 (tentativo deploy diretto via Vercel MCP in corso; altrimenti Jack)

## Fatto (sessione 14, 2026-07-08)

- **Ricerca modelli ridisegnata (search-first, richiesta Jack)**: barra di ricerca grande e ben visibile IN CIMA alla Model guide; la pagina non renderizza più l'elenco completo (niente rallentamenti) — digiti (anche nomi parziali: "myth" trova Mythos 5 e Fable 5) e appare la lista dei risultati cliccabili (max 15 + contatore "refine"); il click apre la **scheda di dettaglio**: punteggio (con nota se stimato), chip di stato/tag, accesso/prezzo, review, bottone **"Use in Generator →"** (spunta la famiglia del modello e ti porta al Generator) e Close. Hint sotto la barra: "43 models tracked — start typing".
- **Nuova vista About (#about, sesta voce in nav)**:
  - Manifesto: progetto open, gratuito, sincero.
  - **FAQ** (7 domande): davvero gratis?, dove vanno dati e chiavi?, perché i prompt in inglese?, quanto sono affidabili i benchmark?, servono chiavi API?, come funziona la raccomandazione?, come contribuire.
  - **Servizi simili con onestà** (da ricerca luglio 2026): PromptPerfect (ottimizzazione one-click di prompt esistenti, anche immagini), AIPRM (5.400+ template in ChatGPT, da $20/mese), PromptBase (marketplace di prompt verificati $1.99-9.99), PromptLayer (versioning Git-style per team dev), Anthropic Console/OpenAI Playground (tool ufficiali dei vendor) — per ognuno "better at" esplicito, poi cosa offre PromptCompass in cambio.
  - **Contribute & contact**: link GitHub (github.com/Jackfdl/promptcompass- — issues e PR benvenute) e LinkedIn di Giacomo Fedeli.
- i18n: navAbout + dbHint in 8 lingue (contenuto About in inglese, coerente con la policy contenuti).
- Test: simulazione ricerca (parziali, tag, no-match), family→engine per Use-in-Generator, i18n, id cross-check — passati.
- [ ] Jack pubblica v0.14 (include anche v0.13 mai pubblicata).

## Fatto (sessione 13, 2026-07-07)

- **Nuovo database modelli** (`js/models-db.js`): 43 modelli — pubblici, privati, preview e legacy — con vendor, accesso/prezzo, review di una-due righe, punteggio AA (reale dove pubblicato, altrimenti **stima dichiarata** con "~" e "est.") e **tag d'uso**: free / paid / api / open-weights / prompt-target (usabile nel Generator) / auto-run (eseguibile in Compare/Chains con chiave gratuita) / info-only / private / preview / legacy.
- **Modelli privati inclusi a scopo informativo** (verificati via ricerca): GPT-5.6 Sol/Terra (preview limitata ~20 aziende da giugno 2026, "ultra mode" con subagenti), Claude Mythos 5 (org. approvate, Project Glasswing, infrastrutture critiche in 15+ paesi), Kimi K2.7 Code (early access). Test automatico impone che i privati siano info-only.
- **Barra di ricerca**: nella Model guide, sezione "Model database" con input che filtra live su nome/vendor/tag/review; chip colorati per stato e tag (verde=free/auto-run, blu=open-weights, viola=private, ambra=preview); messaggio no-results tradotto.
- i18n: 4 nuove chiavi (titolo, sottotitolo, placeholder ricerca, no-results) in tutte le 8 lingue. Dark theme per i chip.
- Copertura: OpenAI (9), Anthropic (7), Google (6), xAI (2), Microsoft, Meta (3), Perplexity (2), open frontier (GLM/Kimi/Nemotron/DeepSeek/Qwen/Mistral Large 3/MiniMax), enterprise (Cohere Command A, Amazon Nova 2).
- Test: integrità DB (id unici, tag validi, family→engine, privati=info-only, review non deboli), i18n, sintassi, id cross-check — passati.
- [ ] Jack pubblica v0.13.

## Fatto (sessione 12, 2026-07-07)

- **Multilingua (8 lingue)**: nuovo `js/i18n.js` con 99 chiavi UI × EN/IT/FR/ES/DE/PT/中文/हिन्दी. Selettore lingua nell'header, scelta persistita (localStorage `pc_lang`). Traduzione via selettori DOM (`applyLanguage`): nav, form completo (etichette, opzioni dei select, placeholder, tipi di task), empty state, router card, guide, compare, chains, settings, footer.
- **Trasparenza linguistica (richiesta esplicita)**: quando la lingua ≠ inglese appare un banner sotto l'header che spiega che prompt generati, note benchmark e auto-detect del task sono ottimizzati per l'inglese (i modelli rendono meglio con istruzioni EN), ma l'obiettivo si può scrivere in qualsiasi lingua e l'AI risponde in quella lingua. I CONTENUTI (prompt, note benchmark, catalogo, istruzioni step) restano volutamente in inglese.
- **Tema scuro/chiaro**: toggle ☾/☀ nell'header; default = preferenza di sistema (prefers-color-scheme); persistito (`pc_theme`); script inline nell'head evita il flash al caricamento. Palette dark completa via `[data-theme="dark"]` (variabili + override mirati: bottone primario in gradiente blu, aurora più luminosa, vetro scuro, badge privacy verde chiaro).
- Test: completezza dizionario (stesse chiavi in tutte le lingue, nessuna vuota, task key per ogni tipo, fallback en), sintassi, id cross-check — passati.
- Nota nota bene: il rilevamento automatico del task resta EN+IT (keyword) — spiegato nel banner.
- [ ] Jack pubblica v0.12.

## Fatto (sessione 11, 2026-07-07)

- **Pacchetto AI esteso a 13 target di prompt** in 3 gruppi nel Generator: AI assistants (Claude✓, ChatGPT✓, Gemini✓, Perplexity), Ecosystem assistants (Grok, Copilot, Meta AI — nuovi, con why-notes da ricerca: Grok 4.1 con Think mode/2M context/X data, Copilot su GPT-5 family dentro M365, Meta AI su Llama gratis in WhatsApp/IG), Open models (Llama, GLM, Kimi, Nemotron + nuovi DeepSeek e Qwen).
- **Catalogo a 22 modelli in 5 categorie**: aggiunta "Ecosystem assistants" (Grok 4.1, Copilot, Meta AI) e Qwen 3.6 tra gli open.
- **UI futuristic-minimal (richieste Jack)**:
  - Fiducia dati: pill verde "Private by design" nell'header (tooltip esplicativo) + riga trust "No account · No server · Nothing leaves your browser" nell'empty state.
  - Flusso guidato: strip 1-2-3 nell'empty state (describe → copy → compare).
  - Wow: sfondo aurora animato (gradienti radiali blu/viola/ciano a bassa opacità in lento movimento), header sticky in vetro (backdrop-blur), wordmark con sfumatura, bottone primario con glow blu all'hover, card che si sollevano all'hover, caret ▍ nell'animazione typewriter. Tutto in CSS puro, prefers-reduced-motion rispettato, zero librerie (efficienza invariata).
  - Tabs con wrap (reggono 13 modelli).
- Test: 13 modelli engine (stili corretti per gruppo), catalogo integro, ranking router invariati, id cross-check — passati.
- [ ] Jack pubblica v0.11.

## Fatto (sessione 10, 2026-07-07)

- **Ricerca aggiornata (luglio 2026)**: Perplexity (free Sonar illimitato + 5 Pro/day; Pro $20 con Deep Research 20/day e GPT-5.4/Opus/Gemini 3.1 Pro inclusi; citazioni best-in-class), GLM-5.2 (Z.ai, top open coder: SWE Pro 62.1%, #4 assoluto su AA), Kimi K2.6 (Moonshot, top open intelligence ~54 AA, SWE Verified 80.2%), Nemotron 3 Ultra (NVIDIA, AA 47.7, GRATIS su OpenRouter, 400+ tok/s), linea Claude (Opus 4.8/Fable 5/Sonnet 5/Sonnet 4.6/Haiku 4.5), GPT-5.5/5.4, prezzi abbonamenti (Plus/Pro/Go, Claude Pro/Max, Google AI Plus/Pro/Ultra).
- **Engine: 8 target di prompt** — aggiunti Perplexity (builder search-first: task in testa, citazioni, fonti recenti, gestione disaccordi tra fonti) e GLM/Kimi/Nemotron (stile open-Markdown con why-notes specifiche). Nel Generator le checkbox sono raggruppate: "AI assistants" (Claude✓, ChatGPT✓, Gemini✓, Perplexity) e "Open models" (Llama, GLM, Kimi, Nemotron).
- **Router a 4 app**: Perplexity aggiunto a tutte le classifiche per task; per Research è ora il best pick (citazioni + Deep Research free). Confidenza research → high.
- **Catalogo modelli** (nuova sezione nella Model guide): 18 modelli in 4 categorie — Frontier flagships, Everyday workhorses, Search & research, Open-weight — ciascuno con vendor, accesso (free/prezzo abbonamento) e nota benchmark.
- Test: engine 8 modelli, ranking 4-app per tutti i task, integrità catalogo, chains compatibili col nuovo default router — tutti passati.
- [ ] Jack pubblica v0.10.

## Fatto (sessione 9, 2026-07-07)

- **Chains (v0.9)** — quinta vista in nav (#chains), il workflow multi-step della Fase 4:
  - `js/chains.js` (nuovo): template di catena per gli 8 tipi di task, 3 step ciascuno (es. writing: Outline → Draft → Revise; coding: Spec → Implementation → Review & tests), con istruzioni parametriche `{goal}`.
  - Flusso: goal (+context, task auto-detect) → "Build chain" → step numerati. Ogni step: modello selezionabile (default = best pick del router, etichetta "(auto-run)" per Gemini/Llama), prompt costruito al volo riusando l'intero engine (istruzione step come goal, output dello step precedente iniettato nel context), Copy prompt, Run via API o paste manuale.
  - Il prompt di ogni step è sempre calcolato fresco (niente prompt stantii se cambi output o modello).
  - Salvataggio in localStorage (`pc_chains_v1`) con cronologia Open/Delete, contatore output compilati.
- Test: template integrity (8×3, {goal} presente, no mutazioni), simulazione catena completa con iniezione output precedente, sintassi, id cross-check — passati.
- [ ] Jack pubblica v0.9.

## Fatto (sessione 8, 2026-07-07)

- Jack ha pubblicato e testato v0.7 (Run via API funzionanti, chiavi in Settings). Dai suoi screenshot individuato **bug cambio vista**: la vista Generator non si nascondeva mai — l'attributo `hidden` (regola UA) perde contro `display: grid` di `.layout`, quindi le sezioni si accodavano in fondo alla pagina invece di sostituirsi.
- **Fix**: `[hidden] { display: none !important; }` in CSS. Ora le viste si sostituiscono davvero in cima alla pagina.
- **Transizione animata**: classe `.view` sui 4 main con animazione viewIn (fade + traslazione dal basso, 0.28s) a ogni cambio vista + smooth scroll già presente. Rispetta prefers-reduced-motion.
- **Fase 4 — memoria preferenze (v0.8)**: al Generate l'app salva automaticamente le ultime opzioni usate (modelli, task type, formato, lunghezza, tono) in localStorage (`pc_prefs_v1`) e le ripristina all'avvio. In Settings: sezione "Preferences" con bottone di reset ai default.
- Modifiche chirurgiche via python3 dalla sandbox (anchor-based, entrambi i lati coerenti). Test: sintassi, id cross-check, regressioni engine/benchmark — passati.
- [ ] Jack pubblica v0.8.

## Fatto (sessione 7, 2026-07-07)

- Verificato v0.6 live. Jack ha creato le chiavi Google AI Studio e Groq (le inserirà lui in Settings, mai condivise in chat).
- **Settings (BYOK)**: quarta vista in nav (#settings) con campi chiave API (password input) e nome modello per Gemini e Groq; salvataggio solo in localStorage. Default modelli (ricercati, luglio 2026): `gemini-3.5-flash` e `llama-3.3-70b-versatile` — campi modificabili per resistere ai rename.
- **Auto-run nel Compare**: colonne Gemini e Llama hanno "Run via API" (fetch diretto dal browser: generativelanguage.googleapis.com / api.groq.com); stati Running/Done/Error visibili; senza chiave → messaggio che rimanda a Settings. Claude/ChatGPT restano manual paste.
- **Llama 4° modello**: aggiunto all'engine (template Markdown "no meta-commentary" + why notes), checkbox nel Generator (default deselezionato). Il router benchmark resta a 3 app.
- **UI polish richiesto da Jack**: nav a pill ben visibili (attivo = nero pieno); scroll automatico smooth in cima al cambio vista; animazione typewriter parola-per-parola velocissima sui prompt generati (rispetta prefers-reduced-motion; ogni tab si anima solo la prima volta).
- Test: engine 4 modelli, regressioni detection/benchmark, id cross-check — tutti passati. NB: le chiamate API reali non sono testabili dalla sandbox (rete bloccata) — verifica live a carico di Jack.
- [ ] Jack pubblica v0.7, inserisce le chiavi in Settings e testa i Run.

## Fatto (sessione 6, 2026-07-06)

- Verificato v0.5 live.
- Versioning (v0.6): i prompt nel Compare sono ora modificabili (textarea monospace); bottone "New version" clona il confronto (stesso goalId, version+1, prompt mantenuti/modificati, output e voti azzerati) per iterare sul prompt e misurare il miglioramento; badge "v{n}" nel meta e nella cronologia; migrazione automatica dei salvataggi vecchi (goalId=id, version=1).
- Export: bottone "Export .md" scarica il confronto completo (goal, prompt, output, voti, esito) come file Markdown.
- Modifiche a index.html/styles.css fatte via sed/cat dalla sandbox (evita il bug di sync senza file temporanei).
- Test: sintassi, migrazione, id cross-check, regressione dataset — passati.
- [ ] Jack pubblica v0.6.

## Fatto (sessione 5, 2026-07-06)

- Verificato v0.4 live (Fase 2 completa).
- Costruita vista "Compare" (v0.5, terza voce in nav, #compare): dai risultati del Generator il bottone "Compare outputs →" apre un confronto con una colonna per modello — prompt usato (richiudibile, copiabile), textarea per incollare la risposta del modello, valutazione 1-5 stelle, badge Winner/Tied calcolato dai punteggi.
- Cronologia: "Save comparison" salva in localStorage (solo nel browser dell'utente); lista con data, goal, task, vincitore; Open/Delete. Ogni salvataggio è uno snapshot completo di goal+prompt+output+voti — base del versioning.
- Gestione errori: localStorage non disponibile → messaggio, il confronto funziona comunque senza persistenza.
- Test: sintassi, logica winner (0 voti / vincitore netto / pareggio), id cross-check, regressione dataset — passati.
- [ ] Jack pubblica v0.5.

## Fatto (sessione 4, 2026-07-06)

- Verificato v0.3 live.
- Costruita vista "Model guide" (v0.4): nav in header (Generator | Model guide), routing via hash (#guide, linkabile), griglia con le raccomandazioni per tutti gli 8 tipi di task (best pick, confidenza, summary, ranking espandibile condiviso col router), CTA "Write a prompt for this task" che precompila il tipo di task nel generatore.
- Refactor: blocco ranking condiviso `buildRankingDetails()` usato da router card e guide. Tagline header sostituita dalla nav. README aggiornato.
- Test: sintassi, id cross-check, regressione dataset — passati.
- [ ] Jack pubblica v0.4.

## Roadmap

- **Fase 1 — MVP**: COMPLETATA (v0.2 live: engine a template 3 modelli, auto-detect task, esempi, deploy Vercel via GitHub)
- **Fase 2 — Model router + benchmark explainer** *(in corso)*:
  - [x] Ricerca benchmark luglio 2026 (LMArena, SWE-bench Verified/Pro, Artificial Analysis, free tier)
  - [x] Dataset curato `js/benchmarks.js`: 8 tipi di task × 3 app, ranking con spiegazioni in linguaggio semplice, livello di confidenza, fonti linkate, data snapshot
  - [x] Router UI: card "Which model for this task?" nei risultati (best pick + summary + ranking espandibile con free tier e fonti); tab del modello raccomandato pre-selezionato con pallino
  - [x] v0.3 pubblicata da Jack
  - [x] Vista "Model guide" standalone (#guide) — v0.4
  - [ ] Jack pubblica v0.4 → Fase 2 completa
  - [ ] (Manutenzione) refresh periodico del dataset benchmark (~mensile)
- **Fase 3 — Confronto side-by-side** *(in corso)*:
  - [x] Manual paste mode: vista Compare con colonna per modello, prompt copiabile, paste output
  - [x] Scoring a stelle + winner/tie
  - [x] Salvataggio confronti in localStorage (snapshot completi)
  - [x] v0.5 pubblicata da Jack
  - [x] Versioning: prompt modificabili + "New version" (lineage goalId/version) + export Markdown — v0.6
  - [x] v0.6 pubblicata da Jack
  - [x] BYOK: Settings + auto-run Gemini/Groq nel Compare + Llama come 4° modello — v0.7
  - [x] v0.7 pubblicata e testata da Jack (Run via API ok) → Fase 3 COMPLETA
- **Fase 4 — Memoria e orchestrazione** *(in corso)*:
  - [x] Memoria preferenze utente (opzioni Generator ricordate/ripristinate, reset in Settings) — v0.8 (pubblicata)
  - [x] Chaining / workflow multi-step (Chains: obiettivo → passi concatenati, output → input successivo) — v0.9
  - [x] Orchestrazione multi-modello (modello per passo, default dal router, auto-run dove BYOK) — v0.9
  - [ ] Jack pubblica v0.9 → ROADMAP INIZIALE COMPLETATA

## Fatto (sessione 3, 2026-07-06)

- Verificato v0.2 live (3 deployment in produzione: 2 da GitHub, 1 da CLI — Jack ha testato entrambe le strade).
- Ricerca web sui benchmark correnti. Quadro luglio 2026: Claude Opus 4.8 #1 LMArena (~1510 Elo) e AA Index (61.4); GPT-5.5 quasi pari (60.2; SWE-bench Verified 88.7 vs 88.6 — pari statistico); Gemini 3.1 Pro #1 coding arena e free tier più generoso (3.5 Flash + Deep Research mensile); Claude Fable 5 top scrittura creativa; free tier: ChatGPT = GPT-5.5 limitato, Claude = Sonnet 5, Gemini = 3.5 Flash.
- Costruito `js/benchmarks.js` (dataset + `recommend()`) e integrato il router in `js/app.js` / `index.html` / `styles.css`. Badge v0.3.
- Test sandbox: integrità dataset (8 task, 3 app ciascuno, fonti valide, fallback), sintassi, id cross-check — tutti passati.
- Top pick per task: writing/coding/analysis/education/general → Claude; brainstorming/business → ChatGPT; research → Gemini (guidato dalle fonti, non uniforme).

## Workflow di pubblicazione (invariato, dettagli in docs/SETUP-JACK.md)

Jack pubblica: Opzione A upload GitHub (consigliata) o Opzione B `npx vercel deploy --prod --yes`. La sandbox di Claude non può deployare (rete bloccata verso Vercel/GitHub, by design).

## Nota tecnica per Claude (bug di sync, confermato in sessione 3)

File MODIFICATI = vista sandbox troncata alla dimensione vecchia (lato Windows corretti). File NUOVI = ok. Workaround collaudato: Write su file temporaneo nuovo → bash `cp` sull'originale → `rm` (permesso delete già attivo). I file .md si possono sovrascrivere direttamente (non vengono testati in sandbox).

## Manutenzione dataset benchmark

`js/benchmarks.js` va aggiornato periodicamente (~mensile o quando escono modelli nuovi): rifare le 4 ricerche (LMArena overall/coding, SWE-bench, creative writing, free tier), aggiornare note/ranking/updated. Le fonti citate sono in `Bench.sources`.

## Da fare (prossime sessioni)

1. Verificare v0.18 live: (a) telefono — nav scorrevole, PWA installabile; (b) lingua → العربية (layout RTL, prompt restano LTR) e Русский/日本語; cambio lingua → footer resta v0.18; (c) Chains → Share link → aprire l'URL in incognito → catena ricostruita; (d) OpenRouter Run via API; (e) condividere il link su WhatsApp/LinkedIn → anteprima con og-image.
2. Candidati: dominio custom (unica voce a pagamento — decide Jack); Google Search Console (gratis, submit sitemap); analytics privacy-friendly opzionale; canale feedback (GitHub issue template); demo video/GIF per il README.
3. Manutenzione ricorrente: refresh models-db + benchmark + slug OpenRouter free (~mensile, ultimo: 2026-07-11); **bump CACHE in sw.js + APP_VERSION in app.js a ogni release**; stime e rumored da riverificare; le route :free cambiano senza preavviso.

## Come riprendere il lavoro

- Logica prompt: `js/engine.js`. Dataset+router: `js/benchmarks.js` (recommend). UI: `js/app.js` (renderRouter/renderResults). Un solo CSS.
- Vincoli fissi: budget zero, niente servizi a pagamento senza ok di Jack, PC di Jack solo browser + Node 24.
