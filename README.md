# WhichAI
*(formerly PromptCompass - same project, new home: [whichai.wiki](https://whichai.wiki))*

Which AI model is best right now, what it costs, what changed this week - and the right AI and prompt for your own task. One page, read top to bottom.

**Live:** https://whichai.wiki · **Status:** Growth · v0.36.0 · zero-cost architecture (free tiers only) · static frontend + read-only serverless API · responsive, installable (PWA) and offline-capable

## One page, six chapters

There is no cover and no menu of views. The page opens on the data and every chapter hands something visible to the next one while you scroll:

| # | Chapter | What it does | What travels to the next chapter |
| --- | --- | --- | --- |
| 01 | **Ranking** | Every model with an official Artificial Analysis score, sorted into tiers S to D by percentile on the Intelligence, Coding or Agentic index. Filters (open weights, free route, under $1, legacy), a search for any model, and a price vs intelligence map on a log axis with the best-value frontier. | the top two models |
| 02 | **Compare** | Two or three models side by side: official indices, price, context, strengths. Follows the live top two until you pick your own. | the newest arrival |
| 03 | **Radar** | Launches and price moves from the live catalog, next to a news wire from the labs, the press, Hacker News and Hugging Face. | the leader's price |
| 04 | **Market** | What the leader costs, the cheapest way into each tier, best value per dollar, the free API routes that exist right now, price moves, and a monthly cost calculator. | a number from the first debate |
| 05 | **Debates** | Six sourced AI debates with both sides, plus a plain-language glossary. Law and compliance topics link to [ComplyAI.wiki](https://complyai.wiki). | four task icons |
| 06 | **Tools** | Find your AI (a one-tap answer per task, or four questions for a personal pick), the Prompt generator for 13 model families, the Prompt Doctor, and the Stack Optimizer. | - |

The hand-offs are real objects that morph from one chapter into the next as you scroll (and land if you stop half-way); everything turns off for `prefers-reduced-motion`. Any model opens the same card (`#model=id`, shareable) from any chapter. Old addresses (`#guide`, `#chains`, `#settings`...) still land somewhere sensible.

## The data maintains itself

- **Scores, prices, new models and free routes** come from OpenRouter's public model list, which relays the official Artificial Analysis indices. `GET /api/catalog` turns it into a small delta (cached at the edge for an hour) that the page lays over the editorial catalog on every visit. New measured models appear on their own, marked "auto-added" until a person writes their review. A converted (`~`) or guessed score is never ranked.
- **News** comes from free, keyless public feeds through `GET /api/news` (cached 30 minutes; every source fails on its own).
- **A daily audit** (`/api/refresh`, Vercel Cron) reports what the automation did and the little that still needs a person.
- **Never automatic:** reviews, caveats, category ratings and the debates.

## Private by design

No account, no tracking, no API keys. What you type (goals, prompts) stays in your browser. The `/api` endpoints are read-only, serve public data and accept no request body. The only third party is a privacy-friendly visit counter (GoatCounter: no cookies, no personal data).

## A real API, and an open dataset

Read-only, keyless, CORS-enabled: `/api/health`, `/api/models`, `/api/benchmarks`, `/api/recommend` (send a plain-language goal, get the detected task and the recommended AI), `/api/stats`, `/api/catalog`, `/api/news`, `/api/refresh`. Documented in [docs/API.md](docs/API.md). The catalog is also an open dataset at `/data/models.json` (CC BY 4.0).

## Also

- **11 languages**: English, Italiano, Français, Español, Deutsch, Português, 中文, हिन्दी, Русский, 日本語 and العربية (full right-to-left layout). Light and dark themes.
- **A static wiki**: 178 pages generated from the database (`node tools/build-seo.mjs`) - a page per model, per task, per glossary term and curated head-to-heads - regenerated with fresh data on every deploy.
- **Installable (PWA)** with an offline fallback.
- **More from the maker**: [ComplyAI.wiki](https://complyai.wiki) (AI rules and compliance for small businesses) and [War Right Now](https://warrightnow.vercel.app) (conflicts and crises, live).

## Run locally

Open `index.html` in any modern browser (the `/api` features need `node tools/api-dev.mjs` or a Vercel deploy). Production build: `node tools/build.mjs` (writes `dist/`).

## Tests

```
npm install      # test-only dependencies (jsdom, esbuild)
npm test         # 6 suites, all offline: static, DOM smoke, API, live data, catalog, news
```

## Contributing

Data corrections, bug reports and small PRs are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md). Repository: [github.com/giacomo-fedeli/WhichAI](https://github.com/giacomo-fedeli/WhichAI) · author: [Giacomo Fedeli](https://www.linkedin.com/in/giacomo-fedeli-277765239/).

## Architecture principles

- **Zero cost:** free tiers only, no paid services, no keys.
- **Static-first:** vanilla HTML/CSS/JS, one file per module, no framework, no chart library.
- **Honest data:** official measurements only in rankings; estimates marked `~`; missing values shown as "n/a"; sources linked; near-ties stated as ties.

## Project structure

```
index.html            - the page: six chapters (data-chapter), footer, model drawer
styles.css            - design system (light/dark, tier colours, responsive, RTL-aware)
js/app.js             - conductor: language, theme, navigation (+ old addresses), drawer, chapter hand-offs, your data
js/motion.js          - progress, accent blend, reveal, lazy mount, morphs between chapters
js/ranking.js         - 01 tiers, filters, search, log-scale scatter
js/modelcompare.js    - 02 head to head
js/radar.js           - 03 launches, price moves, news wire (js/changes.js: curated entries)
js/market.js          - 04 prices, value, free routes, calculator
js/topics.js          - 05 debates (js/glossary.js: glossary)
js/finder.js          - 06 find your AI (quick answer + guided questions)
js/generator.js       - 06 prompt generator (js/engine.js: 13 prompt families)
js/doctor.js          - 06 prompt doctor · js/stack.js - 06 stack optimizer
js/models-db.js       - editorial catalog (reviews, categories) + offline copy of the numbers
js/benchmarks.js      - editorial task notes + live router
js/live-catalog.js    - lays live public data over the catalog on every visit
js/charts.js          - dependency-free SVG charts · js/brands.js - local brand marks
js/i18n.js            - 11-language UI dictionary (completeness-tested)
api/                  - read-only serverless endpoints (catalog, news, refresh, models...)
tools/                - build, wiki generator, data check, local API server
tests/                - six offline suites
sw.js                 - network-first service worker (bump CACHE each release)
STATUS.md             - project memory (Italian) · CHANGELOG.md - release notes
```
