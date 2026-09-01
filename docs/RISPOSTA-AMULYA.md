# Bozza di risposta ad Amulya Galmarini

**Stato al 31 agosto 2026: v0.30 è live e verificata**, quindi i punti 1, 2, 3,
4 e 6 sono già veri e controllabili aprendo il sito.

**Una cosa da sistemare prima di inviare:** il punto 5 dice "il repo diventa
privato", ma `github.com/giacomo-fedeli/WhichAI` risulta ancora **pubblico**.
Delle tre misure che aveva senso prendere, due sono fatte (build minificata in
produzione, logica dietro `/api`, più `LICENSE.md`) e una no. Scegli:

- se lo rendi privato prima di inviare, la frase va bene com'è;
- se decidi di lasciarlo pubblico, sostituisci quel paragrafo con la versione
  alternativa in fondo a questo file: è altrettanto solida e non ti fa dire
  una cosa che lui può smentire in dieci secondi.

Oggetto: `Re: (la sua email)` · A: `a.galmarini3003@gmail.com`

---

Ciao Amulya,

grazie davvero. È la prima review tecnica seria che ricevo sul progetto e mi è
stata più utile di venti complimenti. Ti rispondo punto per punto perché ho
lavorato su tutti e sei.

**"Non mi sembra un servizio nuovo, ci sono huggingface, lmstats..."**
Hai ragione e ho smesso di far finta di niente: ora c'è una sezione in About che
lo dice esplicitamente. Hugging Face e LMArena/Artificial Analysis *misurano* i
modelli, e WhichAI non fa e non pretende di fare benchmark propri: si appoggia ai
loro, li cita con la data dello snapshot e aggiunge il pezzo che nessuno di loro
copre, cioè passare da un obiettivo scritto in italiano o inglese al modello
giusto **e** al prompt scritto per quel modello. Se a uno serve solo una
classifica, sul sito c'è scritto di andare direttamente su Artificial Analysis o
LMArena, linkati su ogni pagina. Resta un layer sopra il loro lavoro, non un
sostituto: se il layer non vale, il progetto non vale, ed è giusto che si veda.

**"C'è un backend, un database, delle API interne?"**
Prima no, era una scelta (zero costi, zero dati utente) ma non l'avevo mai
argomentata. Ora ci sono cinque endpoint serverless su Vercel, read-only:
`/api/health`, `/api/models` (catalogo con ricerca, filtri, ordinamento,
paginazione), `/api/benchmarks?task=coding` (il router gira sul server),
`/api/recommend?goal=...` (gli mandi un obiettivo in linguaggio naturale e ti
risponde con task rilevato, modello consigliato e alternativa gratuita) e
`/api/stats`. Condividono gli stessi moduli dati del frontend, quindi non
possono divergere dalla pagina. Accettano solo GET, non hanno request body, non
salvano niente e hanno ETag + cache all'edge. Sono documentati in `docs/API.md` e
coperti da 42 test. Il dataset è pubblicato in CC BY 4.0: se ti va di
smontarlo, `curl https://whichai.wiki/api/models?limit=5` e vedi tutto.

**"La grafica è da sistemare, i blocchi hanno lunghezza diversa"**
Trovata la causa vera, ed era peggio di quanto pensassi: ogni blocco si
auto-limitava a una larghezza diversa (640, 720, 780, 840, 860, 920 px) e si
allineava a sinistra, quindi il bordo destro della pagina si spostava mentre
scrollavi. Ora è il contenitore a decidere la misura e i blocchi la riempiono:
titolo, card e tabelle condividono lo stesso bordo. Le card del router hanno
altezza uniforme con la call to action allineata in fondo, e il catalogo piega la
coda oltre i cinque modelli. La pagina Model guide è 400 px più corta e si legge
per righe invece che a scalini.

**"La roba della chiave API espone troppo l'utente"**
Qui ti rispondo con una precisazione, non con una difesa. Le chiavi vanno dal
browser direttamente al provider e non passano da nessuna mia macchina: un proxy
lato server sarebbe *meno* privato, perché la chiave finirebbe sul mio server
insieme a ogni prompt. Il punto debole vero è quello che dici tu, cioè il
`localStorage` quando l'utente sceglie di salvarla. Quindi: il default resta
solo-sessione, c'è un avviso arancione visibile solo se scegli di salvare sul
dispositivo, un toggle mostra/nascondi su ogni campo, e soprattutto una sezione
che spiega senza giri di parole cosa può fare una chiave rubata, dove va
davvero, e i link per revocarla sui tre provider. E il sito funziona
completamente senza nessuna chiave: copia e incolla copre tutti i modelli.

**"È esposto troppo quello che c'è dietro dei file .js"**
Vero, e qui la cosa onesta da dire è che la minificazione offusca ma non
protegge: quello che il browser esegue, il browser lo può mostrare. Ho fatto le
tre cose che hanno senso davvero: il repo diventa privato, la produzione passa da
una build minificata (esbuild, 171 KB in meno, con l'hash della CSP ricalcolato e
verificato dal build stesso), e la logica che vale sta dietro `/api`. Più un
`LICENSE.md` che separa le due cose: dataset aperto CC BY 4.0, codice
applicativo all rights reserved. La protezione seria è legale e architetturale,
non cosmetica.

**"Come si aggiorna il sito? Spero che non sia tu di volta in volta"**
Era esattamente così, e avevi ragione a sospettarlo. Ora c'è un workflow
schedulato che ogni lunedì interroga le fonti pubbliche e verifica che ogni route
gratuita che l'app spedisce di default esista ancora (la legge direttamente dal
codice, così il controllo non può divergere da quello che ricevono gli utenti),
segnala drift di prezzo e context window, elenca i modelli usciti dopo l'ultimo
snapshot, rigenera le 174 pagine statiche e la sitemap e fa girare tutti i test.
Poi apre una pull request con l'evidenza, e una issue se una route gratuita è
morta. L'unica cosa che resta volutamente umana sono i punteggi di intelligenza:
quelli non li riscrive uno script, perché tutto il sito si gioca la credibilità
su quei numeri e vanno confermati su uno snapshot datato e citato.

Non ti chiedo altro tempo, so che ne hai poco. Se però ti capita di riaprirlo tra
qualche settimana e qualcosa ti sembra ancora sbagliato, scrivimi pure senza
addolcire: questa email è la prova che le critiche dirette le uso.

Grazie ancora, davvero.

Giacomo


---

## Versione alternativa del punto 5 (se il repo resta pubblico)

> **"È esposto troppo quello che c'è dietro dei file .js"**
> Vero, e la cosa onesta da dire è che la minificazione offusca ma non protegge:
> quello che il browser esegue, il browser lo può mostrare. Ho quindi scelto
> deliberatamente di non fingere: la produzione passa da una build minificata
> (esbuild, 170 KB in meno, con l'hash della CSP ricalcolato e verificato dal
> build stesso), la logica che vale sta dietro `/api`, e un `LICENSE.md` separa
> le due cose - dataset aperto CC BY 4.0, codice applicativo all rights
> reserved. Il repo resta pubblico perché su un progetto che si vende sulla
> trasparenza dei dati e della metodologia, nascondere il codice avrebbe
> guadagnato poco e tolto molto. La protezione è legale e architetturale, non
> cosmetica: è l'unica che regge davvero.
