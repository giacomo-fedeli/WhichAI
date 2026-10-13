# The WhichAI API

Base URL: `https://whichai.wiki/api`

Read-only, no key, no account, no rate-limit gate. Every endpoint answers `GET`
(and `HEAD`), sends `Access-Control-Allow-Origin: *`, and is cached at the edge
with an `ETag` so a repeat call costs a `304`.

The catalog is published under **CC BY 4.0** — attribution: *WhichAI,
whichai.wiki*. Benchmark scores are **Artificial Analysis**'s official indices
(attribution: artificialanalysis.ai), relayed by OpenRouter's public model
list. The application code is not open source; the data is.

**Since v0.35 the API is live.** `/api/models`, `/api/stats`, `/api/recommend`
and `/api/health` serve the editorial catalog merged with the current public
data (official scores, prices, models measured since the last deploy). Each
response's `meta.live.retrievedAt` says when the source was read; when the
source is unreachable the editorial catalog is served unchanged and `meta.live`
is absent.

---

## Design rules

| Rule | Why |
| --- | --- |
| `GET` and `HEAD` only, `405` on anything else | There is nothing to write. A read-only surface cannot be abused into one. |
| No request body, ever | Nothing a caller sends can be stored, because nothing is read. |
| No cookies, no session, no logging of query text | The site's promise is that what you type stays in your browser. The API is not an exception carved into it. |
| Same data modules as the browser (`js/models-db.js`, `js/benchmarks.js`) | One source of truth. The API cannot drift from the page. |
| `s-maxage=3600, stale-while-revalidate=86400` | Warm cache, cheap function invocations: the upstream is read about once an hour per region however busy the site is. |

---

## `GET /api/health`

Liveness, data volume, snapshot dates and the endpoint index.

```bash
curl https://whichai.wiki/api/health
```

```json
{
  "status": "ok",
  "apiVersion": "1.0.0",
  "appVersion": "v0.30",
  "data": { "models": 109, "taskTypes": 8, "dataUpdated": "July 30, 2026" },
  "endpoints": [ { "path": "/api/models", "what": "model catalog with filters, search and pagination" } ]
}
```

---

## `GET /api/models`

The catalog. All parameters are optional and combinable.

| Parameter | Example | Meaning |
| --- | --- | --- |
| `id` | `claude-opus-5` | One model. `404` with a hint when unknown. |
| `q` | `coding` | Free text over name, vendor, family, review, tags, labels. |
| `vendor` | `Anthropic` | Exact vendor, case-insensitive. |
| `tag` | `free,open-weights` | Comma-separated, combined with AND. |
| `label` | `coding` | Category label, same AND rule. |
| `status` | `public` | `public`, `preview`, `rumored`, `legacy`. |
| `minScore` | `55` | Minimum Artificial Analysis index. |
| `measuredOnly` | `1` | Drop models whose score is an estimate. |
| `sort` | `score` | `score` (default, desc), `name`, `vendor`. |
| `limit` / `offset` | `50` / `0` | Pagination. `limit` is capped at 200. |
| `fields` | `id,name,score` | Trim the payload. |

```bash
# the best free open-weight models, measured scores only
curl "https://whichai.wiki/api/models?tag=free,open-weights&measuredOnly=1&limit=5&fields=id,name,vendor,score"
```

---

## `GET /api/benchmarks`

The curated task rankings with their sources and confidence levels.

| Parameter | Meaning |
| --- | --- |
| `task` | Run the router for one task: `writing`, `coding`, `analysis`, `research`, `brainstorming`, `education`, `business`, `general`. |
| `apps` | `1` to include the app profiles behind the rankings. |

```bash
curl "https://whichai.wiki/api/benchmarks?task=coding"
```

Returns `bestPick` (with the reason), `confidence`, `summary`, the full
`ranking` and the linked `sources`.

---

## `GET /api/recommend`

The whole decision in one call: the server detects the task type from a
plain-language goal, runs the router, and adds a free alternative from the
catalog.

| Parameter | Meaning |
| --- | --- |
| `goal` | Required. Max 600 characters (`413` above that). |

```bash
curl "https://whichai.wiki/api/recommend?goal=write%20a%20python%20script%20that%20parses%20a%20csv"
```

```json
{
  "detectedTask": "coding",
  "confidence": "high",
  "bestPick": { "app": "claude", "label": "Claude", "why": "...", "freeTier": "Claude Sonnet 5 ..." },
  "runnerUp": { "label": "ChatGPT" },
  "freeAlternative": { "id": "kimi-k3", "name": "Kimi K3", "score": 57.1 },
  "promptBuilder": "https://whichai.wiki/#goal=..."
}
```

The goal is used to compute the answer and then discarded. It is not stored,
logged or forwarded.

---

## `GET /api/stats`

Aggregates computed server-side: totals, score distribution (min / p25 /
median / p75 / max), tallies by vendor, tag and label, and a leaderboard.

| Parameter | Meaning |
| --- | --- |
| `top` | Leaderboard size, 1..50 (default 10). |

---

## `GET /api/catalog`

The self-updating layer (v0.35). One small delta that the browser, the build
and every other endpoint lay over the editorial catalog in `js/models-db.js`.
Computed by `api/_catalog-core.js` from OpenRouter's public model list.

```bash
curl https://whichai.wiki/api/catalog
```

```json
{
  "schemaVersion": 1,
  "kind": "whichai-live-catalog",
  "status": "fresh",
  "retrievedAt": "2026-10-03T18:46:00.000Z",
  "updated": "October 3, 2026",
  "source": { "name": "OpenRouter", "benchmarks": { "name": "Artificial Analysis", "url": "https://artificialanalysis.ai/" } },
  "patches": { "claude-opus-5": { "score": { "aa": 50.8, "coding": 78, "agentic": 56.5, "src": "aa" } } },
  "added": [ { "id": "claude-opus-5-5", "name": "Claude Opus 5.5", "score": { "aa": 57.6, "src": "aa" }, "auto": true } ],
  "freeRoutes": [ { "id": "qwen/qwen3.8-27b:free", "family": "qwen", "aa": 33.7 } ],
  "arrivals": [ { "date": "2026-09-29", "name": "GPT-6.1 Sol", "aa": 51.8 } ],
  "counts": { "matched": 90, "official": 97, "added": 42, "freeRoutes": 10 }
}
```

| Field | Meaning |
| --- | --- |
| `patches` | Per catalog id: official scores (`src: "aa"`), current price (`priceSrc: "OpenRouter"`, with `priceWas`), context and date only where the catalog has none, tags that become true (`free`, `open-weights`). Never a review. |
| `added` | Models Artificial Analysis has measured that the catalog does not list. Marked `auto: true` until a person writes their review. |
| `freeRoutes` | `:free` routes that exist right now, best measured first. The Market, the Finder and the Stack read it to point at a free way to try a model (since v0.36 the site ships no free-route defaults of its own). |
| `arrivals` | Everything listed in the last 45 days that is measured, plus new unmeasured models from the big labs (tiers like `-pro`/`-prime` of listed models are skipped). Feeds the Model Radar. |

`status` is `fresh`, `stale` (upstream down, last good read under 7 days old,
cached 5 minutes) or `unavailable` (no delta: the response carries no
`patches`, and clients keep what they have). Rules the delta never breaks: no
review is rewritten, no model is deleted, no tag is removed, no unmeasured
model gets a score, a converted value (`~`) is never ranked.

---

## `GET /api/refresh`

The automated data check, running on the same host that serves the site. A
Vercel Cron calls it daily; the Model Radar page reads it so the answer is
visible where the data lives.

Since v0.35 it is an **audit** of the automation rather than a to-do list for a
human: scores, prices, new measured models and the list of free routes are
applied by `/api/catalog`. The report's `automated` block says what the
automation did; `needsHuman` keeps only what it cannot do (for example, a
catalog sentence that still names a retired free route, or OpenRouter no
longer relaying the indices - `relayedScores` drops below 20).

It asks the public OpenRouter model list four questions:

1. does every `:free` route the catalog text names still exist?
2. did any price drift more than 15% from the catalog?
3. did any context window drift more than 25%?
4. which models exist upstream and are missing from the catalog?

```bash
curl https://whichai.wiki/api/refresh
```

```json
{
  "severity": "clean",
  "actionable": 0,
  "catalogModels": 114,
  "catalogUpdated": "August 31, 2026",
  "liveFreeRoutes": ["nvidia/nemotron-3-ultra-550b-a55b:free"],
  "deadFreeRoutes": [],
  "priceDrift": [],
  "missingFromCatalog": [],
  "relayedScores": 109,
  "automated": { "scores": "official Artificial Analysis indices applied automatically by /api/catalog" },
  "needsHuman": []
}
```

`severity` is one of `clean`, `review` or `unknown` (nothing this check can
find breaks the site, so v0.36 no longer emits `broken`). It answers 200
even when the upstream source is unreachable, returning `skipped: true` with a
`reason`, because a third party being down is not an error in WhichAI.

The analysis lives in `api/_refresh-core.js` and is shared with
`tools/refresh-data.mjs`, so the command line, CI and the endpoint can never
mean different things. It is read-only: it reports findings and never edits
anything itself.

---

## `GET /api/news`

The Model Radar's news wire (v0.36): official lab blogs (OpenAI, Google
DeepMind, Mistral AI), TechCrunch AI (titles naming an AI lab or model only),
Hacker News (AI stories with 100+ points in the last 14 days, via the public
Algolia search) and Hugging Face (blog and trending models). Headlines and
links only, merged into one dated list, newest first. Computed by
`api/_news-core.js`; every source is read with a timeout and fails on its own,
so one feed being down never empties the wire.

```bash
curl https://whichai.wiki/api/news
```

```json
{
  "status": "fresh",
  "schemaVersion": 1,
  "kind": "whichai-news",
  "generatedAt": "2026-10-13T08:00:00.000Z",
  "windowDays": 14,
  "items": [
    { "source": "openai", "sourceName": "OpenAI", "kind": "lab", "title": "Introducing ...", "url": "https://openai.com/index/...", "date": "2026-10-12T16:00:00.000Z" }
  ],
  "sources": [ { "id": "openai", "name": "OpenAI", "kind": "lab", "ok": true, "count": 4 } ]
}
```

| Field | Meaning |
| --- | --- |
| `items` | Up to 60 headlines from the last 14 days. `kind` is `lab`, `press`, `community` or `open`. Hacker News items add `score` and a `discuss` link; trending models add `model`. |
| `sources` | One line per feed: `ok`, how many items it gave, and a short `error` when it failed. |
| `status` | `fresh`, or `unavailable` when no source answered (cached 2 minutes, `items` empty). The browser keeps its last good wire in that case. |

Cached 30 minutes at the edge. Titles are plain text (HTML stripped, length
capped), links are `https` only.

---

## Errors

```json
{ "error": "Unknown task type", "status": 400, "hint": "Valid values: writing, coding, ..." }
```

| Status | When |
| --- | --- |
| `400` | Missing or invalid parameter. `hint` says what is valid. |
| `404` | Unknown `id`. |
| `405` | Any method other than `GET`, `HEAD`, `OPTIONS`. |
| `413` | `goal` longer than 600 characters. |
| `503` | Data modules failed to load (`/api/health` only). |

---

## Running it locally

```bash
npm install
node tools/api-dev.mjs 8787     # http://localhost:8787/api/health
node tests/api-tests.mjs        # 50 checks against the real handlers
```

`tools/api-dev.mjs` mounts the same handler files Vercel runs, so a local pass
means a production pass.
