# WhichAI  
*(formerly PromptCompass - same project, new home: [whichai.wiki](https://whichai.wiki))*

Turn a plain-language goal into prompts optimized for each AI model - and know which model to use for the job.

**Live:** https://whichai.wiki · **Status:** Growth · v0.32.0 · zero-cost architecture (free tiers only) · static frontend + read-only serverless API · responsive, installable (PWA) and offline-capable

**Two ways in.** Describe a goal and get optimized prompts - or take the **guided finder**: a few quick questions (task, budget, must-haves) and WhichAI recommends the right AI with reasons, honest limitations and pricing. No prompt needed.

**Thirteen prompt targets, grouped.** AI assistants (Claude, ChatGPT, Gemini, Perplexity), ecosystem assistants (Grok, Copilot, Meta AI) and open models (Llama, GLM, Kimi, Nemotron, DeepSeek, Qwen), each with its own prompt style and "why it works" notes.

**Private by design.** No account, no tracking: the interface runs client-side and your goals, prompts and API keys never leave the browser. The `/api` endpoints are read-only, serve the public model catalog and accept no request body.

**A real API, and an open dataset.** The catalog is not locked inside the page. Six read-only serverless endpoints serve it with filters, pagination, edge caching and CORS: `/api/health`, `/api/models`, `/api/benchmarks`, `/api/recommend` (send a plain-language goal, get the detected task, the recommended AI and a free alternative), `/api/stats` and `/api/refresh` (the live data check). No key, no account, no request body, nothing stored. Documented in [docs/API.md](docs/API.md); dataset under CC BY 4.0.

**The data maintains itself, up to the point where judgement starts.** The check runs in two places on purpose: a **Vercel Cron** hits `/api/refresh` daily on the host that already serves the site, and a **GitHub Action** runs the identical code weekly to open a pull request. Both import the same `api/_refresh-core.js`, so they cannot disagree, and neither depends on the other staying available. The check queries public sources: it verifies that every free model route the app ships still exists, flags price and context drift, lists models released since the last snapshot, regenerates the static wiki and sitemap, and runs the full suite. Anything that needs editorial judgement - intelligence scores above all - opens a pull request with the evidence instead of being rewritten silently. The result is shown on the Model Radar page, so it is visible where the data lives rather than in a dashboard nobody opens. Continuous integration runs 195 static checks, 85 DOM smoke checks and 50 API checks on every push.

**Auto-run with your own free keys (BYOK).** Compare and Chains can execute prompts directly from the browser with free keys: Google AI Studio (Gemini), Groq (Llama) and OpenRouter (Nemotron 3 Ultra and Qwen3 Coder on genuinely free ":free" routes - ~20 requests/min, 200/day). Keys never leave the browser.

**Searchable model database with real specs.** 109 models from 34 vendors - public, private (Claude Mythos 5), preview, legacy and clearly-flagged rumored entries. Search matches partial names, vendors, tags and strengths; filter chips narrow by status and strength. Every model gets an overall score (Artificial Analysis index, July 16, 2026 snapshot, where published - clearly-marked estimates elsewhere), four 0–100 category ratings, and - where sourced - release date, context window, modalities, API price and speed. A **Market at a glance** section adds two minimal SVG charts: top measured scores and price-vs-performance (only models with published price *and* measured score are plotted).

**Compare, two modes.** *Output comparison*: run the same optimized prompt in each AI app (auto-run where you have a key), paste answers, score them 1–5, save versions, export Markdown, merge the best parts in the Merge studio. *Model comparison*: pick 2–3 models and compare them on paper - scores, category profiles, context, price, strengths - with unavailable values shown honestly as "n/a" and estimates marked "~".

**Chains with a visual roadmap.** Break a complex goal into linked steps: numbered connected nodes show each step's model, purpose and input→output flow; each step gets a fresh optimized prompt and the previous output feeds the next. Reorder, remove or add custom steps; **Run all** executes the chain with your free keys; share a chain via URL; export everything as Markdown.

**Glossary.** 26 AI terms (token, context window, RAG, agent, hallucination…) explained in one plain sentence each, with everyday examples and links into the app - searchable, linked from the footer of every page.

**11 languages & three themes.** Interface in English, Italiano, Français, Español, Deutsch, Português, 中文, हिन्दी, Русский, 日本語 and العربية - full right-to-left layout for Arabic - plus light, dark and a warm sepia reading theme, with a soft cross-fade on switch.

**About & FAQ.** What the project is (open, free, sincere), an 8-question FAQ, a fair list of similar tools and what each does better, and how to contribute on [GitHub](https://github.com/giacomo-fedeli/WhichAI) or reach the author on [LinkedIn](https://www.linkedin.com/in/giacomo-fedeli-277765239/). FAQ, Similar tools, Contribute and Glossary are one tap away in the footer of every view.

**Installable (PWA).** Add WhichAI to your phone's home screen: standalone window, compass icon, offline fallback via a network-first service worker that never serves stale versions.

**A real wiki.** 156 static pages are generated straight from the database (`node tools/build-seo.mjs`): a page per model, per task ranking, per glossary term and curated head-to-heads, all indexed in `sitemap.xml`. The full database is an open dataset at `/data/models.json` (CC BY 4.0).

**Keys and data, handled honestly.** API keys default to session-only storage and never leave the browser; saving on the device is an explicit opt-in. A strict Content Security Policy limits connections to the three BYOK providers. Settings includes full JSON export/import and a delete-everything button. Methodology is versioned and public in About.

**Personal tools.** The Stack Optimizer turns four quick choices into an honest subscription plan (what to pay, what to use free, what is redundant, estimated saving). The Prompt Doctor scores any pasted prompt against 10 prompt-engineering checks and rewrites it with the same engine that powers the Generator.

**Model Radar.** A curated, sourced feed of what changed: new models, price moves, score snapshots, free-tier changes and upcoming events, with a personal watchlist and a "since your last visit" counter. Every recommendation in the app links straight to the official chatbot, and finder/stack results export as a shareable image card.

## Run locally

Open `index.html` in any modern browser. No installation or build step required.

## Tests

```
node tests/run-tests.mjs     # 57 static checks - no dependencies
node tests/smoke-dom.mjs     # full DOM smoke test - requires `npm i jsdom`
```

## Contributing

Data corrections, bug reports and small PRs are very welcome: see [CONTRIBUTING.md](CONTRIBUTING.md) and the issue templates. The model database is also published as an open dataset (`data/models.json`, CC BY 4.0).

## Deploy

Static site: deploy the folder as-is to any static host (Vercel, Netlify, GitHub Pages).

## Architecture principles

- **Zero cost:** free tiers only, no paid services
- **Static-first:** vanilla HTML/CSS/JS, no build, no framework, no chart libraries
- **BYOK (bring your own key):** API features use the user's own free-tier keys, stored locally
- **Manual paste mode:** closed models without free APIs are supported by pasting prompts/outputs manually
- **Honest data:** benchmark snapshots are dated, confidence-labeled and source-linked; estimates are marked "~"; unavailable values are shown as "n/a"; near-ties are stated as ties

## Project structure

```
index.html          - app entry point (all views, hash-routed)
styles.css          - design system (3 themes, responsive, RTL-aware)
js/engine.js        - prompt generation engine + task auto-detection (13 families)
js/benchmarks.js    - curated benchmark dataset + per-task model router (update ~monthly)
js/models-db.js     - 105-model database: scores, categories, specs, prices (update ~monthly)
js/chains.js        - multi-step workflow templates per task type
js/finder.js        - guided finder: adaptive questionnaire → transparent recommendation
js/modelcompare.js  - on-paper model comparison (2–3 models)
js/charts.js        - dependency-free SVG chart helpers (bars, scatter, grouped)
js/glossary.js      - plain-language AI glossary
js/merge.js         - Merge studio (hand-pick the best of several outputs)
js/i18n.js          - 11-language UI dictionary (193 keys, completeness-tested)
js/app.js           - UI wiring, BYOK runners, PWA registration
sw.js               - network-first service worker (bump CACHE each release)
tests/              - static test suite + jsdom smoke test
docs/               - internal docs (Italian) · CHANGELOG.md - release notes
STATUS.md           - project state and roadmap (Italian)
```
