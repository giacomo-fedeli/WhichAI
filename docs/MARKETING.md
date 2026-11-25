# WhichAI - Piano marketing a costo zero (v2, 25 novembre 2026)

Obiettivo: portare utenti a https://whichai.wiki **ogni giorno**, spendendo 0 EUR. Sostituisce la v1 (13 luglio 2026, scritta per v0.21).

Come leggerlo: sezioni 0-3 = da dove partire; sezione 4 = la lista completa dei canali gratuiti; sezione 5 = guerrilla non convenzionale; 6 = linee rosse; 7-8 = calendario e testi pronti; 9 = chi fa cosa; 10 = KPI; 11 = fonti.

Legenda affidabilità: **[V]** = confermato da fonte terza consultata il 25/11/2026 (sezione 11); **[?]** = suggerimento da conoscenza generale, da verificare prima dell'uso (regole, prezzi e URL cambiano).

---

## 0. Cosa è cambiato rispetto alla v1 (leggere prima)

- **Il prodotto è un altro.** Oggi (v0.37.0) è una pagina unica in sei capitoli: Ranking (fasce S-D su indici Artificial Analysis ufficiali), Compare, Radar (lanci, prezzi, news wire), Market, Debates, Tools (Find your AI, Prompt generator, Prompt Doctor, Stack Optimizer). Dati che si aggiornano da soli, API pubblica senza chiave, dataset CC BY 4.0, 11 lingue, wiki statica di ~178 pagine.
- **Testi v1 da NON riusare**: citano BYOK/auto-run con chiavi Gemini/Groq/OpenRouter, Chains, Merge studio, Blind Arena e "103 modelli". Tutto questo è stato rimosso dalla v0.36 (le chiavi salvate dalle versioni vecchie vengono cancellate). I testi nuovi sono in sezione 8.
- **Le automazioni v1 non esistono più** in questo account Cowork (nessun task "post settimanali" o "manutenzione mensile" in lista). Da ricreare: vedi sezione 9.
- **URL del repo**: il README dice `github.com/giacomo-fedeli/WhichAI`, HANDOVER/STATUS dicono `Jackfdl/promptcompass-`. Jack: conferma quale è quello pubblico e usa solo quello nei post.
- **Mercato directory 2026**: le grandi directory AI sono quasi tutte diventate a pagamento (sezione 4.4). Con budget zero si usa la parte gratuita e si compensa con canali che nella v1 non c'erano.

## 1. Posizionamento

**Pitch IT:** "Quale AI è la migliore adesso, quanto costa, cosa è cambiato questa settimana e quale usare per il tuo compito. Dati che si aggiornano da soli. Gratis, senza account."

**Pitch EN:** "Which AI model is best right now, what it costs, and what changed this week. Live, self-updating, free, no account."

**Prove (usarle sempre, sono verificabili nel repo):**
1. Punteggi = indici ufficiali Artificial Analysis; stime marcate `~` e mai in classifica.
2. Si aggiorna da solo (catalogo, prezzi, route gratuite, nuovi modelli, news).
3. API aperta senza chiave + dataset CC BY 4.0 (altri possono costruirci sopra).
4. Nessun account, nessun cookie, 11 lingue.

**Limiti dichiarati (ammetterli è la cosa che convince di più):** non fa test propri, usa i dati di Artificial Analysis via OpenRouter; le recensioni sono editoriali; le stime sono segnalate.

**Tre pubblici, tre angoli:**

| Pubblico | Cosa cerca | Angolo del messaggio |
|---|---|---|
| Sviluppatori / indie maker | Quale modello/API, quanto costa, route gratuite | "Prezzo vs prestazioni, route :free vive oggi, API e dataset aperti" |
| Chi sceglie un abbonamento | Quale AI pagare, cosa basta gratis | "Find your AI + Stack Optimizer: quale abbonamento ti serve davvero" |
| Studenti / curiosi / data people | Capire le differenze | "Classifica a fasce S-D, glossario, dibattiti con fonti" |

## 2. Come si arriva a utenti quotidiani: tre motori

| Motore | Cosa lo alimenta | Tempo a regime | Nota |
|---|---|---|---|
| **A. Ricerca** (Google, Bing, motori di risposta AI) | ~178 pagine wiki, una per modello/compito/termine; si rigenerano a ogni deploy | 2-4 mesi, poi costante | È la base: traffico ogni giorno senza fare nulla |
| **B. Newsjacking** (picchi a ogni lancio di modello) | Radar + `/api/catalog` (arrivals) ti dicono quando esce un modello | Immediato, ogni 1-2 settimane | Protocollo "launch day" in sezione 7 |
| **C. Abitudine** (motivi per tornare) | Radar, feed RSS, bot dichiarati, Daily Duel (sezione 5) | Dopo lo sviluppo, poi si autoalimenta | Il motore più sottovalutato: trasforma visite in ritorni |

Regola: A costruisce la base, B dà i picchi, C fa sì che chi arriva torni.

## 3. Fase 0 - Prerequisiti (prima di fare rumore)

| # | Cosa | Chi | Note |
|---|---|---|---|
| 1 | Verificare che GoatCounter conti davvero (`js/config.js` ha `goatCode: "whichai"`; dashboard attesa su whichai.goatcounter.com) | Jack | Senza misura non sai cosa funziona |
| 2 | Search Console: proprietà attiva (nel repo c'è il file di verifica Google), sitemap `https://whichai.wiki/sitemap.xml` inviata; poi importare in Bing Webmaster | Jack | Gratis, 10 min |
| 3 | GitHub: description, Website = whichai.wiki, topics (`ai, llm, benchmarks, model-comparison, prompt-engineering, pwa, vanilla-js, open-data`), Release v0.37.0 con note, GIF demo nel README | Jack (+ Claude per i testi) | Il README è la vetrina per tutti i canali dev |
| 4 | `llms.txt` + dati strutturati `Dataset` (JSON-LD) sulla pagina del dataset + feed RSS/Atom del Radar + export CSV (per Google Sheets) | Claude (codice) | Non li ho trovati nel repo; costano poco; abilitano i canali 4.2 e 4.6 e le idee G6/G22 |
| 5 | Pagina "Press kit": nome, URL, tagline, descrizioni 160/500 caratteri, 4 screenshot, logo | Claude | Un testo unico ovunque (le directory lo chiedono) |
| 6 | robots.txt | - | Già ok: `Allow: /` per tutti, quindi anche per i crawler di ricerca AI |
| 7 | Ko-fi / PayPal.Me (`donateUrl` è vuoto) | Jack | Facoltativo, dopo i primi visitatori; non prima |

## 4. Catalogo dei canali gratuiti

Priorità: **P1** = fallo subito, **P2** = dopo, **P3** = opportunistico. Tutti a 0 EUR; le voci a pagamento sono elencate solo per dire "salta".

### 4.1 Superfici tue (owned) - P1, 30 minuti totali

| Canale | Cosa fare |
|---|---|
| LinkedIn di Giacomo | Headline e "In evidenza": "Creator of WhichAI (whichai.wiki)"; un post per lancio di modello |
| GitHub profile README + repo | Link al sito in cima; repo "pinned" |
| Sito personale giacomo-fedeli.vercel.app | Pagina progetto con screenshot |
| Siti fratelli: ComplyAI.wiki, War Right Now | Footer già collegato: aggiungere un riquadro "oggi nel Radar" o link contestuali negli articoli |
| Firma email, CV, portfolio, bio X/Bluesky/Mastodon/dev.to | Una riga: "Maker di WhichAI: la classifica AI che si aggiorna da sola" |
| Contatti universitari (corso, associazioni, gruppi WhatsApp/Telegram di corso) | Condividere con chi conosci, non spam: servono i primi feedback reali |

### 4.2 Motori di ricerca e motori di risposta AI - P1

| Canale | Cosa fare | Nota |
|---|---|---|
| Google Search Console | Sitemap, controllo query dopo 2-3 settimane | [V] gratis |
| Bing Webmaster Tools | Importa da GSC | Alimenta anche Copilot/ricerca Bing |
| Motori di risposta (ChatGPT search, Perplexity, AI Overviews) | Non c'è un modulo: servono pagine chiare, FAQ, descrizione coerente ovunque, crawler consentiti | [V] fonte SaaSCity; nessuna citazione è garantita |
| Google Dataset Search | JSON-LD `Dataset` sulla pagina di `/data/models.json` | [?] |
| `llms.txt` | File indice per agenti | [?] standard informale, costo quasi zero |

### 4.3 Piattaforme di lancio (launch boards) - P1/P2

| Piattaforma | Costo | Nota |
|---|---|---|
| **Show HN** (Hacker News) | Gratis | [V] eccezione ufficiale all'autopromozione; solo per cose provabili; non chiedere voti; resta a rispondere per ore. I link HN sono nofollow |
| **Peerlist Launchpad** | Gratis, ciclo settimanale | [V] |
| **Fazier** | Lancio quotidiano gratuito | [V] una fonte indica 49 USD per il link dofollow permanente, un'altra dice che i 49 sono spazi pubblicitari: **salta** i pagamenti (budget zero) |
| **DevHunt**, **MicroLaunch** | Gratis | [V] da fonte terza; rivedi le condizioni |
| **Uneed** | Gratis con coda lunga | [V] una fonte dice 50+ giorni; saltare la coda è a pagamento |
| **BetaList** | Coda gratuita, prezzi contestati | [V] fonti discordi: verifica sul sito |
| **Product Hunt** | Gratis | Link nofollow; vale per visibilità, non per la SEO. Lancia solo con 10+ stelle GitHub e feedback; non chiedere upvote |
| **Indie Hackers** | Gratis | [?] post "build in public" con numeri onesti |
| SideProjectors, Startup Stash e simili | Gratis | [?] bassa priorità |

### 4.4 Directory di strumenti AI - P1 (solo le gratuite)

Verità scomoda [V, SaaSCity, 5/10/2026]: le directory grandi sono a pagamento. Con budget zero **non pagare**. La fonte vende servizi di submission, quindi va trattata con cautela.

| Directory | Costo reale | Decisione |
|---|---|---|
| There's An AI For That | 49 USD (la via gratuita è un thread mensile su X) | Salta; tieni d'occhio il thread |
| Toolify.ai | 99 USD | Salta |
| Futurepedia | 497 USD | Salta |
| OpenTools, Easy With AI, AIxploria, TopAI.tools, MagicBox, AI Agent Store | A pagamento | Salta |
| **Dang.ai** | Gratis, chiede un badge di ritorno (link nofollow) | **Fai** (valuta se mettere il badge) |
| **ToolPilot.ai** | Gratis con link di ritorno, dofollow | **Fai** |
| **ShowMeBest.ai** | Gratis + piani a pagamento | **Fai** (free) |
| **AI Tools Directory** | Gratis dopo revisione manuale (99 USD per saltare la coda) | **Fai** (free) |
| **Future Tools** | Gratis, curato (rifiuta oltre 3/4 delle proposte) | **Fai**, con demo curata |
| **The Rundown tools** (supertools.therundown.ai) | Gratis via email | **Fai** |
| **SaaSCity** | Gratis con badge | Opzionale |
| AlternativeTo, SaaSHub | Gratis [?] | **Fai**: posizionati come alternativa a ranking tipo LMArena/Artificial Analysis e ai "which model" picker |
| OECD.AI catalogue | Gratis, solo strumenti per AI affidabile | Non pertinente a WhichAI; **pertinente a ComplyAI.wiki** |

Regole per essere accettati [V]: titolo = il compito, non "AI productivity tool"; screenshot di un risultato vero; dire cosa è gratis; stesso nome/URL/descrizione ovunque; dopo l'approvazione controllare se il link è rimasto dofollow. Ricorda: le directory valgono più come citazione e SEO che come traffico.

### 4.5 Community e forum - P1/P2 (un canale alla volta)

**Reddit** [V sulla regola generale]: la "regola 9:1" è un'euristica sul tuo storico, vincolano le regole di ogni subreddit. Leggile prima, mai lo stesso testo, rispondi a tutti.

| Subreddit [?] | Angolo |
|---|---|
| r/SideProject | Storia del progetto, feedback |
| r/InternetIsBeautiful | "Sito gratuito che mostra la classifica AI viva" |
| r/dataisbeautiful | Il grafico prezzo vs prestazioni (regole su fonte e contenuto originale) |
| r/LocalLLaMA | Modelli open-weights e route gratuite (community severa: solo dati veri) |
| r/ClaudeAI, r/OpenAI, r/ChatGPT, r/artificial | Un thread per lancio: "dove si piazza X nel ranking" (no link-drop) |
| r/PromptEngineering | Prompt per famiglia di modello + Prompt Doctor |
| r/datascience, r/learnmachinelearning | Dataset aperto e metodologia |
| r/webdev, r/javascript | Angolo tecnico "zero framework, pagina unica, dot field" |

**Altre community:**

| Canale | Angolo / nota |
|---|---|
| Hacker News (commenti e thread di lancio modelli) | Rispondere con dati, non con link [V: linea guida] |
| Lobsters | Su invito [?] |
| dev.to, Hashnode, Medium, Substack (Notes e post) | Articolo tecnico con canonical verso whichai.wiki |
| Quora | Risposte a "which AI is best for X" con dati aggiornati |
| Discord (server di Hugging Face, OpenRouter, community LLM locali, "build in public") | Solo canali #showcase/#share e solo se le regole lo consentono [?] |
| Slack di community dati (es. Data Talks Club) [?] | Canali di condivisione |
| Kaggle (dataset + notebook), Hugging Face (dataset card, forum) | Vedi G9 |
| Telegram, WhatsApp, LinkedIn Groups, Facebook Groups | Solo gruppi pertinenti, un post, con valore |
| Mastodon, Bluesky, Threads, X | Hashtag AI; thread per lancio; bot dichiarato (G5) |
| GitHub Discussions / Issues di repo correlati | Contribuire con dati o correzioni, non pubblicità |

### 4.6 Ecosistema sviluppatori e dati - P1/P2 (poca concorrenza, backlink veri)

| Canale | Cosa fare | Nota |
|---|---|---|
| **Awesome-list** su GitHub | PR con 1 riga a liste su leaderboard/valutazione LLM (es. SAILResearch/awesome-foundation-model-leaderboards, Awesome-LLM-Eval) | [V] la prima accetta PR; leggi i criteri di inclusione |
| **public-apis/public-apis** (lista di API gratuite) | PR: API aperta, nessuna auth, HTTPS, CORS | [?] verifica le regole di contribuzione attuali |
| **Registri MCP** (Glama, registro ufficiale, Smithery) | Dopo aver creato un piccolo server MCP che incapsula `/api/recommend` e `/api/models` | [V Glama gratis; gli altri ?]; vedi G7 |
| **Kaggle / Hugging Face Datasets / Zenodo / data.world** | Pubblica `models.json` con scheda dati; Zenodo dà un DOI citabile | [?] ottimo per la parte "data science" di Jack |
| **Postman / RapidAPI** (liste di API gratuite) | Collezione pubblica dell'API | [?] |
| Chrome Web Store, Firefox Add-ons, Raycast/Alfred store | Estensione "which model for this prompt" | Effort alto; vedi G21 |

### 4.7 Canali localizzati (11 lingue = vantaggio che i concorrenti non hanno) - P2

La UI è tradotta in 11 lingue: postare nella lingua giusta, in community dove la concorrenza anglofona non arriva. Sono **spunti di ricerca [?]**, non elenchi verificati.

| Lingua | Dove cercare |
|---|---|
| Italiano | LinkedIn IT, gruppi Telegram AI/data, meetup locali (Meetup) con lightning talk |
| Portoghese (BR) | TabNews, gruppi dev brasiliani |
| Russo | Habr, VC.ru |
| Giapponese | Qiita, Zenn, note |
| Cinese | V2EX, Zhihu, Juejin (verifica accesso e regole) |
| Francese, Spagnolo, Tedesco | LinkedIn, dev.to nella lingua, blog tech che accettano segnalazioni, subreddit/forum nazionali |
| Hindi, Arabo | LinkedIn/X nella lingua, community dev regionali (verifica) |

### 4.8 Stampa, newsletter, podcast - P2

| Canale | Come |
|---|---|
| Newsletter AI (The Rundown, TLDR, Ben's Bites, altre) | La mia ricerca non ha trovato una procedura pubblica di submission per tre di esse: scrivi tramite il sito ufficiale; per The Rundown c'è la directory gratuita via email. Offri **dati**, non pubblicità (G10) |
| Richieste di giornalisti (es. Qwoted, Featured, Connectively) | [?] rispondere con numeri dal Radar quando c'è un lancio |
| Stampa locale / universitaria | "Studente crea una classifica AI che si aggiorna da sola" |
| Podcast di nicchia | Proporsi come fonte di dati, non come prodotto |

### 4.9 Visuale e video - P3

| Canale | Idea |
|---|---|
| LinkedIn caroselli (PDF), Instagram, Pinterest | **Tier list S-D settimanale** come immagine/carosello (la share card esiste già) |
| YouTube Shorts, TikTok, Reels | "Il modello AI della settimana in 30 secondi" con i grafici del sito |
| Imgur / post immagine su Reddit | Grafico prezzo vs prestazioni con fonte |

---

## 5. Guerrilla marketing non convenzionale (etico, a costo zero)

Principio: ogni mossa deve dare **valore reale** a chi la incontra e restare entro le regole delle piattaforme. Niente account finti, voti pilotati, spam. Effort: B = basso, M = medio, A = alto. "Dev" = richiede una sessione di sviluppo (Claude).

| ID | Idea | Come funziona | Effort | Dev | Priorità |
|---|---|---|---|---|---|
| **G1** | **Daily Duel** (tipo Wordle) | Ogni giorno 2 modelli dal catalogo vivo: indovina quale ha l'indice più alto / costa meno; risultato condivisibile con emoji, serie in localStorage, nessun account | M | Sì | **P1**: crea ritorno quotidiano + condivisione |
| **G2** | **Badge SVG per modello** | `/api/badge/<id>.svg` stile shields.io ("Claude Opus 5.5 - tier S - 57.6"); gli sviluppatori lo mettono nei README | B-M | Sì | P1: backlink e visibilità su GitHub |
| **G3** | **Widget incorporabile** "Top 5 oggi" | Snippet di una riga con link "powered by WhichAI"; blog e dashboard lo incorporano | M | Sì | P2 [V: gli embed generano backlink se ben evidenziati] |
| **G4** | **Newsjacking di lancio** | Quando esce un modello: post entro 60 minuti con 3 numeri (tier, indice, prezzo) + link alla pagina wiki già generata | B | No | **P1** |
| **G5** | **Bot dichiarato** su Bluesky/Mastodon/Telegram | Posta "nuovo modello misurato / prezzo cambiato" dai dati del catalogo; profilo etichettato come bot | M | Sì | P1 (verifica le regole dell'API di ogni piattaforma; per X controlla i limiti) |
| **G6** | **Feed RSS/Atom del Radar** | Chi usa un lettore RSS torna ogni giorno; il feed si registra su aggregatori | B | Sì | P1 |
| **G7** | **Server MCP** per `/api/recommend` e `/api/models` | Gli agenti possono chiedere "quale modello per X"; listing sui registri MCP | M | Sì | P2 |
| **G8** | **Tier list settimanale** come immagine | Generata dai dati (share card); post su LinkedIn/Reddit/Pinterest | B | Parziale | P1 |
| **G9** | **Semina dei dati** | Dataset su Kaggle, Hugging Face, Zenodo (DOI), Google Dataset Search; notebook di esempio | M | No | P1 (è il tuo terreno: data science) |
| **G10** | **"Regalo di dati" a newsletter e blogger** | Ogni settimana un paragrafo "le 3 mosse AI della settimana" con attribuzione, mandato a 3-5 autori che pubblicano classifiche | B | No | P2 |
| **G11** | **Aiutare prima, linkare poi** | Rispondere a "which AI for X?" su Reddit/HN/Quora con la risposta vera, link solo se serve | B (continuo) | No | **P1** |
| **G12** | **Offline** | QR su poster in università, biblioteche, coworking, hackathon; lightning talk a meetup | B | No | P2 |
| **G13** | **Immagini OG per pagina** | Anteprima social unica per modello, così ogni condivisione è riconoscibile | M | Sì | P3 |
| **G14** | **Pagine "alternative" oneste** | "WhichAI vs [altro ranking]": cosa fanno meglio gli altri e cosa offre WhichAI | B | Sì (wiki) | P2 |
| **G15** | **Taglia sugli errori** | Pagina "Hall of fame": chi segnala un dato sbagliato con fonte viene citato; trasforma i critici in promotori | B | Sì (pagina) | P2 |
| **G16** | **Pronostici pubblici** | Poll "quale modello sarà #1 tra un mese?" con data di verifica; poi pubblichi l'esito | B | No | P2 |
| **G17** | **Web ring di maker** | Scambio di link reciproco con progetti indie veri, nel footer | B | No | P3 |
| **G18** | **Q&A per motori di risposta** | Pagine FAQ con schema per domande reali ("best AI for coding?") | M | Sì (wiki) | P1 |
| **G19** | **Tesi / progetto / hackathon** | Presentare WhichAI come progetto di corso o in hackathon; meetup | B | No | P2 |
| **G20** | **Bot Discord/Telegram** `/which coding` | Comando che chiama `/api/recommend`; listing su directory di bot | M | Sì | P2 |
| **G21** | **Estensione / bookmarklet / Raycast** | "Quale modello per questo prompt?" dalla barra | A | Sì | P3 |
| **G22** | **IMPORTDATA per Google Sheets** | Articolo "Traccia i prezzi AI in Google Sheets con una formula" + endpoint CSV | B-M | Sì (CSV) | P2: SEO a coda lunga |
| **G23** | **Contributi a repo di altri** | PR di dati o correzioni su liste di leaderboard: visibilità meritata | B | No | P2 |

**Le tre che spingono davvero il traffico quotidiano** (se scegli solo queste): G4 (picchi a ogni lancio), G1 (motivo per tornare ogni giorno), G6+G5 (feed e bot che portano il Radar a chi non visita il sito).

## 6. Linee rosse (non negoziabili)

1. **Niente account finti, voti pilotati, recensioni false, commenti "da cliente".** Danneggiano il progetto e violano le regole di ogni piattaforma.
2. **Trasparenza**: dichiara sempre "l'ho fatto io" quando lo è. I bot sono etichettati.
3. **Niente email a freddo a liste comprate o "scrapate"** (GDPR/ePrivacy). Contatta singoli autori solo con messaggi personali e pertinenti.
4. **Non chiedere upvote** (HN e Product Hunt lo vietano).
5. **Un testo diverso per ogni canale**; niente cross-post a tappeto.
6. **Dati onesti**: se un numero è stimato, si scrive `~`. È il vantaggio competitivo del sito; non barattarlo per un picco.
7. **Budget zero**: nessun servizio o directory a pagamento senza ok esplicito di Jack.
8. **Agenti AI**: possono ricercare, preparare bozze e monitorare; **iscrizioni e pubblicazioni le fa Jack** (o le approva una per una). Credenziali solo in un password manager, mai in chat.

## 7. Calendario

### Settimana 1 - Fondamenta
- Sezione 3 completa (Claude: llms.txt, JSON-LD Dataset, RSS, CSV, press kit; Jack: GoatCounter, GSC/Bing, GitHub).
- Directory gratuite P1 (4.4): ToolPilot, Dang.ai, ShowMeBest, AI Tools Directory, The Rundown tools, Future Tools, AlternativeTo, SaaSHub.
- Post LinkedIn IT + thread EN (sezione 8).

### Settimana 2 - Community
- **Show HN** (martedì-giovedì, nel pomeriggio italiano: è un'euristica [?]); resta 4-5 ore a rispondere.
- Reddit: **un subreddit al giorno**, testo diverso ogni volta (4.5).
- Indie Hackers: post "build in public".

### Settimana 3 - Lancio e semina
- Peerlist Launchpad, Fazier (solo il lancio gratuito), DevHunt, MicroLaunch.
- Dataset su Kaggle/Hugging Face/Zenodo; PR a 2 awesome-list e a public-apis.
- Articolo tecnico su dev.to e Hashnode (canonical verso il sito).

### Settimana 4 - Guerrilla
- Sviluppo G1 (Daily Duel) + G2 (badge) + G5/G6 (feed e bot).
- Product Hunt (facoltativo, solo con 10+ stelle).
- Primo "regalo di dati" a 3 newsletter/blogger (G10).

### Regime (per sempre)

| Quando | Cosa | Tempo |
|---|---|---|
| Ogni giorno | Rispondere ai commenti; una risposta di valore in un thread "which AI for X" (G11) | 10-15 min |
| Ogni lancio di modello | **Protocollo launch day**: (1) controlla Radar e `/api/catalog` arrivals; (2) verifica che la pagina `whichai.wiki/models/<id>` esista; (3) post con 3 numeri; (4) una risposta in un thread | 30-60 min |
| Lunedì | 3 bozze settimanali (LinkedIn IT, EN, un commento per community) + tier list immagine (G8) | 30 min |
| Venerdì | Guardare GoatCounter + GSC e applicare le regole di decisione (sezione 10) | 10 min |
| 1° del mese | Controllo qualità dati (`/api/refresh`), aggiornare questo piano se un canale non rende | 30 min |

## 8. Testi pronti (aggiornati a v0.37)

**LinkedIn (IT)**
> Ogni settimana esce un nuovo modello AI e i prezzi cambiano di continuo. Ho costruito WhichAI: una pagina che ti dice quale modello è il migliore adesso (indici ufficiali Artificial Analysis, divisi in fasce da S a D), quanto costa, cosa è cambiato questa settimana e quale conviene per il tuo compito.
> I dati si aggiornano da soli. Gratis, senza account, in 11 lingue, con API aperta e dataset CC BY 4.0.
> -> whichai.wiki
> Se trovi un dato sbagliato, dimmelo con la fonte: lo correggo e ti cito.

**X / Bluesky (EN), 3 post**
> 1/ A new AI model every week, prices moving daily. Which one is actually best right now, and which should YOU use? WhichAI: live ranking (official Artificial Analysis indices, tiers S to D), prices, what changed this week, plus a picker for your task. Free, no account. whichai.wiki
> 2/ It updates itself: scores, prices, new models and free API routes come from public sources automatically. Estimates are marked ~ and never ranked.
> 3/ Open API (no key) and open dataset (CC BY 4.0), 11 languages. Found a wrong number? Send a source and it gets fixed and credited. github.com/giacomo-fedeli/WhichAI

**Show HN**
- Titolo: `Show HN: WhichAI - a live, self-updating ranking of AI models with prices and news`
- Primo commento:
> Every week there is a new "best" model and nobody tells you which one to use for what. I built a single page that ranks every model with an official Artificial Analysis score into tiers (S to D by percentile), shows price vs intelligence, a radar of launches and price moves, and a few tools (a task picker, a prompt generator for 13 model families, a prompt doctor, a subscription stack optimizer).
> How it works: scores and prices come from OpenRouter's public model list (which relays the official indices), merged hourly over a hand-written editorial layer (reviews, caveats). New measured models appear on their own, marked "auto-added" until I write the review. Estimates (~) are never ranked. Static frontend in vanilla JS (no framework), read-only serverless API, no account, no cookies, 11 languages.
> Limits: I don't run my own evals; I rely on Artificial Analysis. The reviews are my judgment. API and dataset (CC BY 4.0) are open: docs/API.md in the repo. Tell me where you think the ranking is wrong.

**Pitch "regalo di dati" (email a un autore di newsletter, EN)**
> Hi {name}, I run whichai.wiki, a free live ranking of AI models (official Artificial Analysis indices, prices, free routes). Each week I can send you three data points about what moved (new entries, price changes, best value), with sources, free to use with a link back. If useful, I can also adapt them to your format. No pitch, just data. - Giacomo

**Descrizioni per le directory** (usarle identiche ovunque)
- Tagline (<=60): `Live AI model ranking, prices and news. Free.`
- Breve (~160): `WhichAI is a free, self-updating ranking of AI models with official benchmark scores, prices and news, plus a picker that finds the right model for your task.`
- Lunga (~450): `WhichAI ranks every AI model with an official Artificial Analysis score into tiers S to D, shows price versus intelligence, and tracks launches and price moves in a live radar. Instead of reading ten leaderboards, you see what is best right now, what it costs, the cheapest way into each tier, and which free API routes exist today. Tools help you pick the right AI for your task, write a prompt for 13 model families, check a prompt and compare subscriptions. Free, no account, 11 languages, open API and dataset.`

**Post di lancio modello (template)**
> NEW in the live ranking: {model} ({lab}). Tier {T}, index {score}, ${in}/${out} per 1M tokens. {una riga di confronto: vs leader / vs il più economico comparabile}. Data and sources: whichai.wiki/models/{id}

**Commento del maker (Peerlist, Fazier, DevHunt, Product Hunt)**
> I got tired of a different "best model" every week. WhichAI keeps one honest page: official scores only in the ranking, estimates labelled, sources linked, and the numbers refresh themselves. Biggest open question for me: what would make you come back to it daily?

## 9. Chi fa cosa e automazioni

| Claude | Jack |
|---|---|
| Ricerca di thread e opportunità, bozze di post e articoli, press kit, `llms.txt`, JSON-LD, RSS, CSV, badge, Daily Duel, bot, server MCP (sessioni di sviluppo con test e bump di versione) | Account (GoatCounter, GSC, Bing, impostazioni GitHub, Ko-fi), login/2FA, **pubblicare** post e submission, approvare ogni invio, rispondere ai commenti con la sua voce |
| Monitoraggio: controllare Radar e `/api/catalog` per avvisarti dei lanci; riepilogo KPI | Decidere cosa tagliare quando un canale non rende |

**Automazioni da ricreare** (richiedono il tuo ok; non esistono nell'account attuale):
1. *Launch watch* (giornaliera, mattina): controlla le novità nel catalogo e ti scrive "oggi è uscito X, ecco la bozza di post".
2. *Bozze della settimana* (lunedì): 3 bozze + tier list.
3. *Manutenzione mensile* (1° del mese): `/api/refresh`, cure editoriali, aggiornamento di questo piano.

## 10. KPI e regole di decisione

| Metrica | Dove |
|---|---|
| Visite, pagine, referrer (distinguere diretto / ricerca / social) | GoatCounter |
| Impressioni, clic, query, backlink | Google Search Console |
| Stelle, fork, issue di estranei | GitHub |
| Chiamate API (un picco = qualcuno ci sta costruendo sopra) | Dashboard Vercel |

Regole (le soglie sono ipotesi di lavoro, non previsioni di traffico):
- **Un canale è "vivo"** se in 2 tentativi porta almeno ~10 visite di referral: altrimenti tagliarlo.
- **Raddoppiare** su un canale che porta più del 30% dei referral.
- La SEO è lenta: giudicarla dopo 8-12 settimane, non prima.
- Se una query in GSC ha impressioni ma pochi clic, riscrivere titolo e descrizione di quella pagina.
- Il successo del motore C (abitudine) si vede nei visitatori di ritorno e nelle visite dirette: seguire quelle due curve.

## 11. Fonti consultate (25/11/2026) e affidabilità

- [SaaSCity - Best AI tool directories 2026](https://saascity.io/best-ai-directories): prezzi e tipo di link delle directory AI. L'autore vende servizi di submission: conflitto di interessi.
- [Hacker News Guidelines](https://news.ycombinator.com/newsguidelines.html): regole Show HN (la pagina ufficiale non è stata letta per intero).
- [Reddit self-promotion rules 2026 (Redship)](https://redship.io/blog/reddit-self-promotion-rules-2026): la regola 9:1 è un'euristica; valgono le regole di ogni subreddit. Fonte secondaria/di marketing.
- [Product Hunt alternatives (DEV Community)](https://dev.to/kaan_tokali_5a4828a3f897c/8-product-hunt-alternatives-that-actually-work-in-2026-including-the-one-im-building-323p) e [Pinggy](https://pinggy.io/blog/best_producthunt_alternatives/): Peerlist, Fazier, Uneed, BetaList, DevHunt, MicroLaunch. Le guide sono scritte da piattaforme che si classificano da sole; prezzi discordanti.
- [Embeddable tools and backlinks (RightBlogger)](https://rightblogger.com/blog/embeddable-tools-backlinks) e [HubSpot, free tool marketing](https://blog.hubspot.com/marketing/free-saas-mini-tool-marketing): widget e strumenti gratuiti come motore di backlink. Fonti di vendor.
- [awesome-foundation-model-leaderboards (indice ecosyste.ms)](https://awesome.ecosyste.ms/lists/sailresearch%2Fawesome-foundation-model-leaderboards): lista che accetta PR; criteri di inclusione da leggere.
- Dal repo: `README.md`, `CHANGELOG.md`, `docs/API.md`, `js/config.js`, `robots.txt`.

Tutto ciò che è marcato **[?]** non è stato verificato in rete: controllare regole, prezzi e URL sul sito di ogni canale prima di usarlo.

## 12. Registro esecuzione (aggiornare a ogni sessione)

Questa sezione dice cosa è GIÀ stato fatto, così in una nuova chat non si ripete nulla. Identità usata per le iscrizioni: `whichai.wiki@proton.me` (nessuna password in questo file). Regole: niente servizi a pagamento, niente captcha aggirati (li risolve Jack), i form si compilano e si invia solo dopo l'ok di Jack.

| Data | Canale | Stato | Note |
|---|---|---|---|
| 25/11/2026 | Future Tools | Inviata (da Jack a mano) | Il Cloudflare Turnstile fallisce nel browser integrato. Attesa revisione. |
| 25/11/2026 | ShowMeBest.ai (free) | Inviata | Richiede link nel footer (presente). Revisione 72 h - 4 settimane. Il piano free non dà dofollow. |
| 25/11/2026 | ToolPilot.ai (Free With Backlink) | Inviata da Jack | Logo: `C:\dev\PromptCompassFolder\promptcompass--main\docs\whichai-logo-500.jpg`. Link nel footer presente. Fino a 60 giorni. |
| 25/11/2026 | Dang.ai (free) | In corso | Account creato da Jack. Link nel footer dalla v0.39. Serve push + deploy prima dell'invio. |
| - | AI Tools Directory (free) | Da fare | Scarta testi scritti con AI: la descrizione la scrive Jack a mano. Non pagare il Fast Track. |
| - | The Rundown tools | Da fare | Solo bozza email: l'invio richiede l'ok di Jack. |
| - | AlternativeTo, SaaSHub | Da fare | Servono account con password: li crea Jack. |
| - | GitHub (About, sito, topics) | Da fare | Dopo il login di Jack: description aggiornata, sito `https://whichai.wiki`, topics `ai, llm, benchmarks, model-comparison, prompt-engineering, pwa, vanilla-js, open-data`. |

**Footer del sito (riga "AI directories")**: v0.38 ToolPilot e ShowMeBestAI; v0.39 aggiunge Dang.ai. Directory a pagamento scartate: TAAFT, Toolify, Futurepedia.

**Lezioni operative**
- Browser integrato: Turnstile fallisce e il form ToolPilot non si disegna. Usare l'estensione Claude in Chrome (tab propria); i campi del form ToolPilot non sono esposti, quindi si lavora a coordinate.
- Upload file: il campo file non è raggiungibile dall'estensione. Il file lo sceglie Jack con "Select Image".
- Accettare termini e inviare form spetta a Jack (o va chiesto esplicitamente).
- Il controllo schermo del PC vede i browser solo in lettura: per Comet/Chrome non serve.

**Prossime azioni**: (1) Jack: `npm test`, commit e push di v0.39; (2) Dang.ai: compilare il form dopo il deploy; (3) AI Tools Directory: testo scritto da Jack; (4) GitHub: login di Jack, poi aggiornamento About/topics; (5) controllare tra 1-2 settimane lo stato dei listing e il referrer in GoatCounter.
