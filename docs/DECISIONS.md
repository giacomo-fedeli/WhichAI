# Decisioni tecniche — PromptCompass

Registro delle decisioni prese, con motivazione sintetica. Aggiornare a ogni decisione rilevante.

## D1 — Sito statico senza build (2026-07-06)
HTML/CSS/JS puro, nessun framework, nessun passo di build. Motivo: Jack non ha ambienti di sviluppo sul PC; il sito si testa con doppio click su `index.html` e si deploya ovunque gratis (Vercel/Netlify/GitHub Pages) senza configurazione. Migreremo a Vite+React solo quando la complessità lo giustificherà (probabilmente Fase 2-3); in quel caso il build avverrà sui server di Vercel, mai sul PC di Jack.

## D2 — Engine a template, senza chiamate API (2026-07-06)
Il goal-to-prompt engine v1 è basato su template data-driven (best practice per modello + regole per tipo di task), 100% client-side. Motivo: zero costi, zero chiavi, funziona subito e offline. L'assistenza LLM alla generazione arriverà come layer opzionale in Fase 1.5/2.

## D3 — BYOK per le future feature API (2026-07-06)
Quando serviranno chiamate a modelli (Fase 2-3), l'utente inserirà la propria chiave gratuita (Google AI Studio, Groq), salvata solo in localStorage. Motivo: niente backend, niente costi per noi, nessuna chiave esposta nel codice.

## D4 — Deploy: GitHub + Vercel (2026-07-06)
Repo su GitHub (upload via browser, nessun Git sul PC di Jack), hosting su Vercel free tier con redeploy automatico a ogni modifica del repo. Vercel scelto per: deploy zero-config di siti statici + serverless functions gratuite se mai serviranno.

## D5 — Lingue (2026-07-06)
Prodotto, codice e README in inglese (progetto internazionale). STATUS.md e docs/ interne in italiano (servono a Jack e alla continuità tra sessioni).

## D6 — Modelli target v1 (2026-07-06)
Claude, ChatGPT, Gemini — i tre più usati. Copy volutamente version-agnostic (niente "GPT-5.x" ecc.): i nomi versione cambiano spesso, le tecniche di prompting per famiglia restano stabili. Groq/Llama e altri arriveranno con il model router (Fase 2).

## D7 — Design system (2026-07-06)
Palette neutra (quasi-nero, grigi, bianco), un solo colore d'accento (blu, solo per stati di focus), tipografia Inter, niente decorazioni superflue. Tutto in un solo `styles.css` con variabili CSS.

## D8 — Una pagina sola a capitoli; BYOK, Chains, Merge, Arena tolti (2026-10-13, v0.36)
Su richiesta di Jack il sito diventa una pagina unica in 6 capitoli in ordine fisso (ranking, compare, radar, market, debates, tools), collegati da animazioni che portano un oggetto da un capitolo al successivo; niente copertina e niente menu di viste. Si tolgono le funzioni che servivano solo a eseguire prompt nel browser (auto-run con chiavi personali, Chains, Merge, Output comparison, Blind Arena): erano le uniche a chiedere chiavi API all'utente e a dipendere da route gratuite che sparivano senza preavviso. D3 è superata. Gli indirizzi vecchi restano validi tramite una mappa di reindirizzamento. Il design sostituisce D7: un colore d'accento per capitolo, tier S-D con colori propri, tema chiaro e scuro.

## D9 — Collegamenti tra capitoli: sfondo a puntini guidato dallo scroll (2026-10-14, v0.37)
I riquadri che volavano da un capitolo all'altro (v0.36) sono tolti: quando il lettore si fermava a metà dovevano "posarsi", e questo dava scatti. Il collegamento visivo è ora uno sfondo a puntini su canvas, con un disegno per capitolo che si trasforma nel successivo in funzione della sola posizione di scroll (si ferma quando ti fermi), reattivo al puntatore, debole dietro i testi, spento con prefers-reduced-motion. Regola che ne segue: nessuna animazione legata allo scroll può completarsi da sola nel tempo.

