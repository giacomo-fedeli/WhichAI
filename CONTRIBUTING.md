# Contributing to WhichAI

WhichAI is a free, open, client-side tool: vanilla HTML/CSS/JS, no build step, no server, no tracking. Contributions of every size are welcome, from a typo fix to a new data entry.

## The fastest ways to help

1. **Report wrong data** (a price, a score, an access condition): open a *Data correction* issue with a link to an official source. Data quality is the core asset of this project.
2. **Report a bug**: open a *Bug report* issue with browser, device, theme and steps.
3. **Propose a model** for the database: open a *Data correction* issue with the official announcement and, if available, a published benchmark score.
4. **Improve translations**: the UI dictionary lives in `js/i18n.js` (11 languages, identical keys, enforced by tests).

## Ground rules

- Zero cost: no paid services, no build tooling, no frameworks, no chart libraries.
- Privacy by design: no accounts, no server calls except the user's own BYOK API requests.
- Honest data: every score has a dated source; estimates are marked `est: true` and rendered with `~`; missing values are `n/a`, never invented.
- Rumored or private models are `info-only` and never enter rankings.
- Typography: no em dashes in user-visible text (there is a test for it).
- English content (prompts, reviews, benchmark notes), translated UI chrome.

## Project layout

```
index.html          all views (hash routing)     js/models-db.js   model database (the crown jewel)
styles.css          single stylesheet, 3 themes  js/benchmarks.js  per-task router + sources
js/app.js           wiring, BYOK runners         js/changes.js     Model Radar feed
js/engine.js        prompt generation            tools/build-seo.mjs  static wiki generator
tests/              two suites (see below)       data/models.json  open dataset (CC BY 4.0)
```

## Editing the model database

Each entry in `js/models-db.js` looks like:

```js
{ id: "kebab-case-id", name: "Model Name", vendor: "Vendor", family: "claude|chatgpt|...|null",
  status: "public|preview|private|legacy|rumored",
  access: "Plain-language access and pricing line",
  tags: ["free","paid","api","open-weights","prompt-target","auto-run","info-only","private","preview","legacy","rumored"],
  labels: ["coding","reasoning","writing","research","agents","speed","value","multilingual","vision","long-context","local","enterprise"],
  spec: { released: "YYYY-MM-DD", ctx: "1M", modal: "Text + vision", priceIn: 5, priceOut: 25, speed: "...", note: "..." },  // only sourced values
  score: { aa: 60.7, est: false, cat: { coding: 0-100, reasoning: 0-100, writing: 0-100, agents: 0-100 } },
  review: "One or two honest sentences." }
```

Rules the test suite enforces: unique ids, valid tags and labels, `private`/`rumored` must be `info-only`, `family` must exist in the engine, category scores 0-100, substantive reviews, numeric prices. After a data change also add a dated entry to `js/changes.js` (Model Radar) and regenerate the wiki: `node tools/build-seo.mjs`.

## Before opening a PR

```
node tests/run-tests.mjs     # static suite, no dependencies
node tests/smoke-dom.mjs     # full DOM boot (npm i jsdom once)
node tools/build-seo.mjs     # if you touched data files
```

Both suites must be green. Keep PRs small and single-topic; explain sources for any data change. Release rules: bump `APP_VERSION` (js/app.js), the badge and footer (index.html) and `CACHE` (sw.js) together.

## Not accepted

Paid placements or affiliate-driven ranking changes (the neutrality of the router is the whole point), unverifiable benchmark numbers, account systems, trackers/analytics that identify users.

## Contact

Open an issue, or reach Giacomo Fedeli on [LinkedIn](https://www.linkedin.com/in/giacomo-fedeli-277765239/).
