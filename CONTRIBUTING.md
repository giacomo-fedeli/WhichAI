# Contributing to WhichAI

WhichAI is a free site with an open dataset: vanilla HTML/CSS/JS, no framework, no accounts, no tracking, plus a small read-only serverless API. Contributions of every size are welcome, from a typo fix to a new data entry.

## The fastest ways to help

1. **Report wrong data** (a price, a score, an access condition): open a *Data correction* issue with a link to an official source. Data quality is the core asset of this project.
2. **Report a bug**: open a *Bug report* issue with browser, device, theme and steps.
3. **Propose a model** for the database: open a *Data correction* issue with the official announcement and, if available, a published benchmark score.
4. **Improve translations**: the UI dictionary lives in `js/i18n.js` (11 languages, identical keys, enforced by tests).

## Ground rules

- Zero cost: no paid services, no build tooling, no frameworks, no chart libraries.
- Privacy by design: no accounts, no tracking. The `/api` endpoints are read-only, serve public data and accept no request body.
- Honest data: every score has a dated source; estimates are marked `est: true` and rendered with `~`; missing values are `n/a`, never invented.
- Rumored or private models are `info-only` and never enter rankings.
- Typography: no em dashes in user-visible text (there is a test for it).
- English content (prompts, reviews, benchmark notes), translated UI chrome.

## Project layout

```
index.html           the one page: six chapters (Ranking, Compare, Radar, Market, Debates, Tools)
styles.css           single stylesheet, light and dark themes, RTL-aware
js/app.js            conductor: language, theme, navigation, model drawer
js/models-db.js      the model database (the crown jewel)    js/benchmarks.js  per-task router + sources
js/i18n.js           UI dictionary, 11 languages              js/changes.js     Model Radar entries
api/                 read-only serverless endpoints (Vercel)  data/models.json  open dataset (CC BY 4.0)
tools/               build-seo.mjs (static wiki), build.mjs   tests/             six offline suites
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
npm install      # test-only dependencies (jsdom, esbuild)
npm test         # six offline suites: static, DOM smoke, API, live data, catalog, news
node tools/build-seo.mjs     # if you touched data files (regenerates the static wiki)
```

Everything must be green. Keep PRs small and single-topic; explain the source of any data change. Release rules: bump `APP_VERSION` (js/app.js and api/_lib.js), the footer version (index.html), `CACHE` (sw.js) and the package version together; a test checks that they agree.

By opening a pull request you agree that your contribution may be included in the project under the licences described in [LICENSE.md](LICENSE.md).

## Not accepted

Paid placements or affiliate-driven ranking changes (the neutrality of the router is the whole point), unverifiable benchmark numbers, account systems, trackers/analytics that identify users.

## Contact

Open an issue, or reach Giacomo Fedeli on [LinkedIn](https://www.linkedin.com/in/giacomo-fedeli-277765239/).
