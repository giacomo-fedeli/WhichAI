# The WhichAI API

Base URL: `https://whichai.wiki/api`

Read-only, no key, no account, no rate-limit gate. Every endpoint answers `GET`
(and `HEAD`), sends `Access-Control-Allow-Origin: *`, and is cached at the edge
with an `ETag` so a repeat call costs a `304`.

The catalog is published under **CC BY 4.0** — attribution: *WhichAI,
whichai.wiki*. The application code is not open source; the data is.

---

## Design rules

| Rule | Why |
| --- | --- |
| `GET` and `HEAD` only, `405` on anything else | There is nothing to write. A read-only surface cannot be abused into one. |
| No request body, ever | Nothing a caller sends can be stored, because nothing is read. |
| No cookies, no session, no logging of query text | The site's promise is that what you type stays in your browser. The API is not an exception carved into it. |
| Same data modules as the browser (`js/models-db.js`, `js/benchmarks.js`) | One source of truth. The API cannot drift from the page. |
| `s-maxage=3600, stale-while-revalidate=86400` | Warm cache, cheap function invocations, and the catalog changes weekly at most. |

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

## `GET /api/refresh`

The automated data check, running on the same host that serves the site. A
Vercel Cron calls it daily; the Model Radar page reads it so the answer is
visible where the data lives.

It asks the public OpenRouter model list four questions:

1. does every `:free` route WhichAI ships as a default still exist?
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
  "liveFreeRoutes": ["nvidia/nemotron-3-ultra-550b-a55b:free", "qwen/qwen3-coder:free"],
  "deadFreeRoutes": [],
  "priceDrift": [],
  "missingFromCatalog": [],
  "needsHuman": ["Artificial Analysis scores are never updated automatically: re-check the snapshot and cite it."]
}
```

`severity` is one of `clean`, `review`, `broken` or `unknown`. It answers 200
even when the upstream source is unreachable, returning `skipped: true` with a
`reason`, because a third party being down is not an error in WhichAI.

The analysis lives in `api/_refresh-core.js` and is shared with
`tools/refresh-data.mjs`, so the command line, CI and the endpoint can never
mean different things. It is read-only: it reports findings and never edits
the catalog. Intelligence scores in particular are never touched by a machine.

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
