# WhichAI - Changelog

(Older release-by-release history lives in `STATUS.md`, the project's working memory.)

## v0.31.0 (2026-08-31)

The August data refresh, and the test suite that stopped breaking every time the data moves.

### Data refresh (two mirrors, both cited)
Scores come from the **BenchLM mirror of August 30** for the top ten and the **ModelCap mirror of August 27** for ranks 11 to 30, retrieved August 31. Twenty scores updated, five models added, catalog now 114.

- **New top ten**: Claude Opus 5 63.0, Claude Fable 5 62.1, Grok 4.6 60.9, Kimi K3 59.7, GLM-5.3 59.5, GPT-5.6 Sol 58.9, Qwen3.8 Max 58.1, GLM-5.3-Flash 57.5, Claude Opus 4.8 57.3, Muse Spark 1.2 56.8. The ten now fit inside 6.3 points, and two Chinese labs sit in the top five.
- **Stated plainly in the scale note**: the August index sits 1.5 to 2.5 points above July across the whole table. That is a shift in the index, not every model improving at once, and comparing the two months directly would mislead.
- **Grok 4.6** (Aug 12), **GLM-5.3** (Aug 14), **Gemini 3.7 Flash** (Aug 13), **GLM-5.3-Flash** (Aug 26), **Muse Spark 1.2** (Aug 6) added with release dates, prices and sources.
- **GLM-5.3 is not tagged open-weights**: it is the first GLM flagship to ship with weights held back behind a staged safety review. GLM-5.3-Flash is the open one (MIT, 320B-A18B, 1M multimodal context, $0.15/$0.50).
- **Gemini 3.7 Flash is not claimed free**: its free tier is unconfirmed, so auto-run keeps defaulting to gemini-3.6-flash, whose free tier is confirmed. A broken default would break auto-run for every user on stock settings.
- **Claude Sonnet 5**: the $2/$10 introductory API price expired on August 31; the entry now carries $3/$15.
- **Qwen3.8 Max** moves from a declared estimate to a measured score (58.1).
- Model Radar gains seven dated, sourced entries; the wiki regenerates to 174 pages and a 175-URL sitemap.

### Changed
- **Tests assert invariants, not frozen numbers.** Seven checks pinned July's exact values (`kimi-k3 === 57.1`, `/July 30, 2026/`), so every data refresh broke the suite and taught us to ignore it. They now assert what actually matters: the model exists and is measured within a plausible band, the snapshot date is real and not in the future, and the database and benchmark dates agree. One test was rewritten in its intent rather than its letter: "Qwen3.8 preview must be an estimate" became false the moment a real score was published, so it now asserts the rule the site is judged on, that no rumored model is ever presented as measured.
- **A dead upstream source no longer fails the scheduled run.** `tools/refresh-data.mjs` reports "the upstream source did not answer", leaves the catalog untouched and exits clean, instead of ending a Monday morning with a stack trace. `--strict` still fails on purpose.
- Repository references updated to `giacomo-fedeli/WhichAI`.

### Verified in production
All five API endpoints answer 200, the served `js/app.js` is minified (79 KB against a 126 KB source, so the build runs on Vercel), every security header is present, `POST /api/models` returns 405, and ETags are issued.

### Tests
181 static + 82 DOM smoke + 42 API = **305 passing**.

## v0.30.0 (2026-08-19)

Answering an external technical review: a real backend, data that maintains itself, an even layout, and a privacy promise restated to stay true.

### Added
- **A read-only serverless API** (`api/`): five Vercel Functions sharing the exact data modules the browser uses, so the API can never drift from the page. `GET /api/health` (status, volumes, endpoint index), `GET /api/models` (search, tag/vendor/status filters, `minScore`, `measuredOnly`, sorting, pagination, `fields`, `?id=` for one model), `GET /api/benchmarks` (`?task=` runs the router server-side), `GET /api/recommend` (`?goal=` in plain language: task detection, best pick with the reason, runner-up and a free alternative), `GET /api/stats` (totals, score distribution, tallies, leaderboard). Weak ETags, `s-maxage=3600` with `stale-while-revalidate`, open CORS, `405` on anything but GET/HEAD/OPTIONS, no request body accepted, nothing stored. Documented in `docs/API.md`, runnable locally with `tools/api-dev.mjs`.
- **API client with a fallback, not a dependency** (`js/api.js`): 3.5s timeout, `AbortController`, resolves to `null` on any failure, `credentials: "omit"`, sends no user data. The Model guide shows an honest status pill: live with the served model count and snapshot, or "using the built-in catalog" when the backend is unreachable. The service worker deliberately bypasses `/api/`.
- **Scheduled data check** (`tools/refresh-data.mjs` + `.github/workflows/data-refresh.yml`): every Monday it queries the public OpenRouter API and verifies that every `:free` route the app ships as a default still exists (read straight from `DEFAULT_OR_MODELS`, so the check cannot drift from what users get), flags price drift over 15% and context drift over 25%, and lists models released since the last snapshot. It regenerates the static wiki and sitemap, runs the suites, opens a pull request with the evidence, and opens an issue when a shipped free route has died. Intelligence scores are never rewritten by a script: they need a human and a cited snapshot.
- **Continuous integration** (`.github/workflows/ci.yml`): static checks, DOM smoke test and API tests on every push and pull request, plus a production build.
- **Production build** (`tools/build.mjs` + `vercel.json`): esbuild minifies 23 JS files and the CSS, HTML whitespace is collapsed while inline script bodies stay byte-identical, and the CSP sha256 hash is recomputed and verified before the build is allowed to pass. 614 KB to 473 KB of JS, 90 KB to 66 KB of CSS. Security headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options) configured at the edge.
- **`LICENSE.md`**: the dataset stays open under CC BY 4.0; the application source is all rights reserved.
- **"How WhichAI is different from a leaderboard"** in About: an honest three-column comparison against LMArena/Artificial Analysis and Hugging Face, stating plainly that WhichAI does not run its own benchmarks and pointing readers to those sites when a ranking is all they need.
- **"How the data stays current"** in About: what is automated weekly, what runs on every change, and what deliberately still needs a person.

### Changed
- **One measure per view.** Content blocks used to cap themselves at six different widths (640 to 920 px) and align left, so the right edge of the page moved as you scrolled. The container now sets the measure and every block fills it: heading, cards and tables share one left and one right edge.
- **Even cards.** Router cards stretch to equal height with their call to action pinned to the bottom and summaries clamped; catalog categories fold past five models behind "Show all (N)". The Model guide is 400 px shorter and scans in rows instead of steps.
- **API key safety.** The risk model is spelled out: what a stolen key can and cannot do, exactly where it travels, why a server-side proxy would be less private rather than more, revocation links for all three providers, and good habits. A warning appears only in device-storage mode, and every key field has a Show/Hide toggle.
- **The privacy promise, restated to stay true.** With an API in production, "no server" was no longer accurate. Six claim-bearing strings were rewritten in all 11 languages and throughout the HTML: no account, no tracking, and a read-only API that serves the public catalog and never sees what you type. A test now prevents the old wording from returning.
- **Task detection** covers modern coding vocabulary (react, vue, node, java, rust, component, endpoint, unit test, docker, algorithm and more).

### Fixed
- `js/support.js` called `fetch` unguarded: with a visit-counter code configured, boot threw in any environment without `fetch`. Now guarded, and it degrades to no counter rather than to a broken page.
- The v0.29 config test asserted that the owner's counter code was empty, which broke the moment the owner legitimately set one. It now asserts the mechanism (hide when unset, never invent a number).

### Tests
165 static + 82 DOM smoke + 42 API = **289 passing**.

## v0.29.0 (2026-07-30)

Real social proof, a way to support the project, a way home, and a new reading section.

### Added
- **AI Debates** (`js/topics.js`, `#topics`, in the More menu, plus 7 static wiki pages under `/topics/`): the six biggest AI-and-society questions (energy and data centers, jobs, the bubble, copyright, regulation, open vs closed weights) summarized honestly: the numbers people cite, the concern AND the counter-view, where things stand, and 2-4 linked sources each (IEA, Stanford HAI, WEF, Goldman Sachs, US Copyright Office, EU Commission and more). English content, translated chrome, explicit not-advice disclaimer. Designed to become community-extendable later.
- **Real visit counter** (`js/support.js` + `js/config.js`): GoatCounter integration (free, open source, no cookies). Once the owner sets a site code in `js/config.js`, the site counts real visits and shows the true public total in the footer and on the welcome screen, with a live pulse dot. By explicit design the counter never displays invented numbers: it stays hidden until a real value exists.
- **Support button**: a warm but quiet "Support ♥" link in the footer plus a Support card in About with an honest pitch and a no-influence note. Hidden until `donateUrl` is set in `js/config.js` (Ko-fi or PayPal.Me recommended; a raw personal IBAN is deliberately not supported).
- **Logo goes home**: clicking (or keyboard-activating) the WhichAI brand in the header returns to the minimal welcome screen. Implemented by adding a clean `show()` to the welcome module's public API, coordinated with the other assistant's morph code (nothing else touched).

### Data refresh (verified 2026-07-30)
- **Kimi K3 weights confirmed live** on Hugging Face (July 27, Modified MIT): entry now carries open-weights and free tags; radar entry updated from promise to fact.
- **Gemini 3.5 Pro added as clearly-marked rumor** (info-only, estimated score): release-timing reports around the K3 launch called it imminent; nothing official from Google.
- Database and router re-verified July 30 (109 models); wiki regenerated: 169 pages, sitemap 170 URLs.

### Tests
- Static suite: 127 checks (topics validity and sourcing, config defaults keep counter/donate hidden, welcome `show()` API, CSP scope, K3 tags, rumor hygiene). DOM smoke: 67 (debates view, hidden-by-default support UI, brand-to-welcome round trip). **194/194 green.**

## v0.28.0 (2026-07-26)

Data refresh for a wild week, the Blind Arena, and the community kit.

### Data refresh (sources retrieved 2026-07-26)
- **Claude Opus 5 is real and is the new #1**: released July 24, it moves from rumored to public in the database with measured data: AA Intelligence Index 60.7 (July 24 snapshot), Agentic Index 55.3, 1M context, 128K output, $5/$25 per 1M unchanged (Fast mode $10/$50, cache hits $0.50/M). It becomes the paid Claude pick in the finder and Stack Optimizer. Sources: BenchLM mirror, MarkTechPost, artificialanalysis.ai.
- **AA July 24 snapshot (167 models)**: Anthropic holds the top two spots (Opus 5 60.7, Fable 5 59.9). Lower-table corrections: Mercury 2 21.4, K-Exaone 22.1, Trinity Large 18.2, Gemma 4 12B 21.8.
- **New models (108 total)**: Gemini 3.6 Flash (July 21: $1.50/$7.50, 1M ctx, free tier day one; now the BYOK Gemini default), Gemini 3.5 Flash-Lite ($0.30/$2.50), Qwen3.8 Max preview (clearly estimated). Benchmark router notes and catalog updated; OpenRouter free routes re-verified (Nemotron 3 Ultra and Qwen3 Coder still free).
- **Model Radar**: 5 new sourced entries (Opus 5, July 24 snapshot, FLUX 3, Gemini 3.6 Flash, Qwen week); Kimi K3 weights stay in "Coming up" for July 27.
- Static wiki regenerated: 161 pages, sitemap 162 URLs, including new head-to-heads (Opus 5 vs Fable 5, Opus 5 vs GPT-5.6 Sol).

### Added
- **Blind Arena** (`js/arena.js`, `#arena`, in the More menu): anonymous A/B rounds on YOUR prompts between the models your free keys can auto-run; vote, names are revealed, and a personal local Elo builds up (K=32, ties count half). Honest framing throughout: it measures your preference on your prompts among your available models, not global quality. Clear no-keys state linking Settings; failed rounds are not counted. 18 i18n keys in 11 languages (293 total).
- **Community kit**: `CONTRIBUTING.md` (ground rules, database schema, test commands), GitHub issue templates (bug, data correction with mandatory source, feature request), `docs/RELEASE-NOTES-v0.28.md` ready to paste into the first GitHub Release.

### Tests
- Static suite: 115 checks (July 26 data assertions, Opus 5 as measured #1, arena Elo math, pick-two distinctness). DOM smoke: 62 (arena view + no-keys path, More menu at 8 items). **177/177 green.**

## v0.27.0 (2026-07-21)

### Fixed
- The shared-element morph now reaches its header target and fades out in place before cleanup, removing the visible hard cut between the welcome controls and the real navigation.
- Monochrome wordmark images now receive a dedicated light treatment in dark mode while full-color product icons keep their original colors.

### Tests
- Static suite: 103 checks. DOM smoke: 60 checks. Browser QA covers the final fade timing and dark wordmark contrast. **163/163 automated checks green.**

## v0.26.0 (2026-07-20)

A cinematic but lightweight first impression: native welcome entrance, shared-element morph into the app, and consistent local AI branding across the app and static wiki.

### Added
- **Minimal welcome** with a large WhichAI mark, one-line value proposition and four sequential off-screen menu entrances. Responsive across desktop/tablet/mobile and all three themes, with reduced-motion support.
- **Native morph transition** (`js/welcome.js`): welcome controls shrink and move into their header counterparts while the selected view enters from multiple edges. Deep links still open directly.
- **Central brand registry** (`js/brands.js`) covering all 13 prompt families and 34 database providers with 76 local SVG icons/wordmarks. Assets remain offline-capable and their sources are documented in `assets/brands/README.md`.
- Branding in generator controls, recommendations, finder, model guide, both Compare modes, Chains, Stack, Doctor, Merge, Radar and all 156 generated SEO pages.
- 6 new welcome i18n keys in all 11 languages (275 aligned keys total).

### Tests
- Static suite: 101 checks. DOM smoke: 60 checks. Browser QA at desktop, tablet and phone sizes across light, dark and sepia. **161/161 automated checks green.**

## v0.25.0 (2026-07-20)

Retention and polish: Model Radar, inline model details, official app links everywhere, smarter Compare default, shareable result images.

### Fixed
- **Model guide details now open inline**: clicking a result expands the overview right under that row (accordion with a soft slide, arrow rotates, row highlighted; clicking again closes). Previously the card appeared under the whole list and long result sets made it look like nothing happened.
- **More menu readability**: panel rows were inheriting the nav pill "active" style (light pill + accent text = poor contrast). Panel rows now have their own calm active state: subtle background, accent side bar, regular text color.

### Added
- **Official app links everywhere an AI is suggested**: model detail cards ("Open the official app ↗"), every generated prompt panel ("Open Claude ↗" next to Copy: copy the prompt, jump straight to the chatbot), Compare output columns, finder result cards, stack cards, and the static wiki pages (models + task rankings). New `links` (13 prompt families → official chat apps) and `vendorLinks` (34 vendors) maps in `models-db.js`; every one of the 105 models resolves to an official destination (tested).
- **Model Radar** (`js/radar.js` + curated feed `js/changes.js`, `#radar`, first item in the More menu): what changed since your last visit: new models, price moves, score snapshots, free-tier changes, plus a "Coming up" section (Kimi K3 weights July 27, Sonnet 5 intro price ending Aug 31). Type filters, NEW badges based on your last visit, per-model ★ watchlist (also from any model card) with a "Following" filter, and sources on every entry. A small dot on the More button signals unseen changes; visiting the radar clears it. The feed is part of the monthly data-refresh routine.
- **Share as image**: finder and Stack Optimizer results can be exported as a polished 1200x630 PNG card (canvas, no libraries, aurora-dark design) via the native share sheet on mobile or download on desktop.
- **Compare opens on Model comparison by default**: the on-paper comparison is the zero-effort entry point; Output comparison shows first only when one is already in progress (or via the explicit `#compare-outputs` link).
- 20 new i18n keys in all 11 languages (269 total).

### Tests
- Static suite: 94 checks (link coverage for all models and families, change-feed validation, radar/share exports). DOM smoke: 57 (inline accordion open/close, radar flow with dot + watchlist, compare default, official links on panels). **151/151 green.**

## v0.24.0 (2026-07-20)

Phase 2 of the growth plan: personalization tools and a calmer first impression.

### Added
- **AI Stack Optimizer** (`js/stack.js`, `#stack`): four quick choices (tasks, current subscriptions, budget, essential needs) produce a transparent, rule-based stack: which single subscription is worth paying, what to cover with free tiers, estimated monthly cost, current spend, estimated saving and possibly-redundant subscriptions. Privacy and API needs surface local/open and free-route extras. Profile persists locally; result exports as Markdown. Prices from vendor pages (July 2026 snapshot), rankings from the benchmark router; everything labeled as estimate.
- **Prompt Doctor** (`js/doctor.js`, `#doctor`, plus a shortcut next to "Refine with AI"): paste a prompt, get a 0-100 score from 10 weighted bilingual checks (role, audience, format, constraints, context, examples, quality bar, uncertainty handling, sources), a checklist with one-line tips for every gap, and a before/after view where the optimized version is built by the existing prompt engine for any of the 13 model families, with a "what changed and why" list. 100% static, no API.
- **Homepage that shows a result first**: the empty state now opens with a completed example (goal, best pick and free alternative derived live from the benchmark router) and two actions: try the example or take the 30-second finder.
- **Calmer navigation**: primary nav reduced to Generator, Model guide, Compare plus a "More" menu; the dropdown lists Chains, Stack Optimizer, Prompt Doctor, Glossary, About and Settings each with a one-line description. Keyboard (Esc), click-out closing, active-state aware, full-width sheet on mobile, RTL-aware.
- 39 new i18n keys in all 11 languages (249 total).

### Tests
- Static suite: 83 checks (stack optimizer scenarios, doctor scoring EN+IT, new ids, SW precache). DOM smoke: 46 (demo card, More menu, full stack flow, full doctor flow). **129/129 green.**

## v0.23.0 (2026-07-20)

Dark-theme legibility, typography cleanup, and phase 1 of the growth plan: static wiki pages, key hardening, data backup, real offline PWA, versioned methodology.

### Fixed
- **Dark theme legibility**: the accent color used by every action link, focus ring and highlight stayed at the light-theme dark blue (#2563eb), which is nearly unreadable on dark gray. Dark now uses #60a5fa. Also added `color-scheme: light/dark` per theme so native controls (select dropdowns, scrollbars) match the theme.
- **Typography**: removed all 497 em dashes from user-visible text (UI strings in 11 languages, database reviews, benchmark notes, prompts, HTML, manifest). Separator-style usages became a middle dot, prose became plain hyphens or rephrasing, and the missing-data symbol is now "n/a" everywhere (charts, comparison table, footnotes).
- **Unified corner radii**: one radius language app-wide via tokens (surfaces 14px, controls 10px; pills and chips stay fully rounded by design).

### Added
- **Static wiki (SEO)**: `tools/build-seo.mjs` regenerates 156 plain-HTML pages from the database: 106 model pages (`/models/<id>.html` + index), 8 task rankings (`/best-ai-for/<task>.html` + index), 26 glossary entries (`/glossary/<id>.html` + index), 12 curated head-to-heads (`/compare/a-vs-b.html` + index), plus `sitemap.xml` with 157 URLs. Pages are JS-free, styled by the existing stylesheet, carry canonical/OG tags, the data snapshot date, honest n/a and estimate marks, and deep-link CTAs into the app. Rerun the script after every data refresh.
- **Deep links**: `/#model=<id>` opens a model card directly in the app (used by the wiki pages).
- **Open dataset**: `data/models.json` (CC BY 4.0) exposes the full 105-model database for reuse and backlinks.
- **API key hardening**: keys now default to session-only storage (cleared when the browser closes); saving on the device is an explicit opt-in in Settings, with an honest explanation of client-side storage risk. One-click "Clear all API keys". Existing users who already saved keys keep the on-device mode.
- **Content Security Policy** meta: scripts restricted to self plus the hashed inline theme snippet; connections restricted to the three BYOK API hosts; objects blocked.
- **Your data section (Settings)**: export a full JSON backup, import it on another device, or delete everything, with clear confirmation prompts. 16 new i18n keys in all 11 languages (210 total).
- **Real offline PWA**: the service worker now precaches the full app shell at install, falls back to the cached app for offline navigations, and the app shows a small "new version ready" toast when an update is waiting.
- **Methodology v1.0** card in About: scores, category blends, router, pricing sources, status labels, independence statement and limits, with the update date.

### Tests
- Static suite grew to 69 checks (CSP, key-storage ids, sitemap, generated pages, dataset validity, no-em-dash guard, dark focus fix, radius tokens); DOM smoke grew to 39 (session-first keys, storage-mode migration, clear keys, data tools, `#model=` deep link). **108/108 green.**

### Known limitations / pending
- Personal Benchmark, Blind Arena, Council Mode and Consensus Map are deliberately postponed: they need output generation across many providers, while BYOK currently covers only Gemini, Groq and OpenRouter free routes; results would be biased toward those three. Documented in STATUS.md.
- Static pages must be regenerated (one command) after each data refresh; there is no CI yet.

## v0.22.0 - 2026-07-19

The "one big session" release: guided finder, glossary, two-mode Compare, charts, chain roadmap, footer, warmer sepia, clip-safe buttons, and a full data refresh.

### Fixed
- **Button clipping** - `.site-nav` (one-row header) is an `overflow-x: auto` scroll container, which also clips vertically: pills were cut at the top on hover (`translateY(-1px)`) and at the bottom at rest. Fixed by giving the scroll container inner breathing room (`padding-block: 5px; margin-block: -5px`, inline equivalents) instead of removing the animation.
- Visible, consistent `:focus-visible` rings on links, buttons, tabs and summaries (2px, offset, themed).
- Secondary buttons (`.btn-copy`) got a coherent hover lift (transform only - zero layout shift); long model names now wrap instead of overflowing.
- `compareTitle` said "Compare outputs" while the view now has two modes → renamed "Compare" (11 languages).

### Added
- **Guided finder** (`js/finder.js`, Generator → "Guided finder" mode, also at `#finder`): 4–5 adaptive questions (task, usage mode, budget, essential needs, one task-specific question) → transparent rule-based recommendation with "Why this pick", best-for, honest limitation, access/price, links into Model guide and Generator. No prompt required. Every boost is explained; facts come from `models-db.js`/`benchmarks.js`, never invented.
- **Glossary** (`js/glossary.js`, `#glossary`, linked from the footer): 26 AI terms in one-sentence plain language with everyday examples, live search, progressive disclosure (collapsed by default), cross-links into app features.
- **Compare split into two modes** (subtabs): *Output comparison* (the existing side-by-side output flow, unchanged) and *Model comparison* (`js/modelcompare.js`, `#compare-specs`): pick 2–3 of the 105 models and compare AA index (bar chart), category profiles (grouped bars), release, context window, modalities, API price, speed, access, strengths and one-line review - with explicit "n/a" for unpublished values and "~" for estimates, plus a warning against reading estimate-vs-measured deltas as real.
- **Charts** (`js/charts.js`): dependency-free SVG helpers (horizontal bars, scatter, grouped bars), theme-aware via CSS variables, native tooltips, reduced-motion safe. Used by the new *Market at a glance* section in the Model guide (Top-12 measured AA scores; price-vs-performance scatter of the 10 models with published price + measured score). A context-window chart was deliberately **not** built: every current frontier model in the dataset is at 1M tokens, so the chart would carry no information.
- **Chains roadmap**: visual workflow strip above the steps - numbered connected nodes (arrows, RTL-aware, vertical on mobile) showing each step's model, purpose and input→output flow; nodes turn green when their output is filled; click scrolls to the step. Steps can now be **reordered (↑/↓), removed (✕) and added** ("+ Add step" creates a custom step with an editable instruction; `{goal}` inserts the goal). Prompts are always rebuilt fresh, so reordering stays consistent.
- **Footer on every view**: FAQ · Similar tools · Contribute (deep links into About via `#about-faq/-similar/-contribute` anchors) · Glossary. Compact, themed, translated.
- **Model detail specs** in the Model guide card: released, context window, modalities, API price, speed where sourced, plus a data-provenance line and a "Compare →" shortcut into Model comparison.

### Changed
- **Sepia theme, take 2**: clearly distinct warm palette (cream `#f1e5cd` background, warm browns, muted amber accents, warmer aurora and warm chart palette), with contrast kept accessible (body text ≈ 9.7:1, muted ≈ 4.9:1, links darkened to `#7a4d20` ≈ 5:1); no saturated yellows, no health claims.
- Mobile: mode switch and subtabs become full-width segments; finder options single-column; comparison grid compacts; roadmap goes vertical with ↓ connectors; insights stack. All new controls are ≥40px touch targets; reduced-motion disables every new animation.
- `sw.js` cache → `whichai-v0.22.0`; `APP_VERSION` → v0.22; badge + footer bumped.

### Data refresh (sources retrieved 2026-07-19)
- **AA Intelligence Index snapshot July 16, 2026** (BenchLM mirror - benchlm.ai/benchmarks/artificialAnalysis): DB re-aligned to one consistent scale. Corrections: Fable 5 60→59.9, GPT-5.6 Sol 59→58.9, Opus 4.8 56→55.7, Muse Spark 1.1 43.1→50.6, Hunyuan 3.0 33.6→41.2, Kimi K2.5 38.1→35.4, Step 3.7 Flash 29.7→30.3.
- **New models** (105 total, 34 vendors): **Kimi K3** (Moonshot, July 16 - 2.8T MoE, 1M ctx, native vision, AA 57.1 #3, $3/$15, weights announced July 27 Modified MIT; sources: VentureBeat, simonwillison.net, kie.ai) and **Inkling** (Thinking Machines Lab, July 15 - 975B/41B MoE, multimodal, 1M ctx, Apache 2.0, AA 40.7; sources: thinkingmachines.ai, artificialanalysis.ai, TechCrunch).
- **Spec fields** (`spec: {released, ctx, modal, priceIn, priceOut, speed, note}`) added to 17 models from vendor pages / pricing mirrors: Anthropic $10/$50 (Fable 5), $5/$25 (Opus 4.8), $2/$10 intro→$3/$15 Sept (Sonnet 5), 1M ctx line-wide (benchlm.ai/anthropic/api-pricing, aipricing.guru); Gemini 3.1 Pro $2/$12 (>200K $4/$18), 3.5 Flash $1.50/$9, 1M ctx (benchlm.ai, devtk.ai); GPT-5.6 Sol/Terra/Luna $5/$30, $2.50/$15, $1/$6 (July 9); Grok 4.5 $2/$6, ~80 tok/s (tokencost.app, eesel.ai). GPT-5.5 price: not published → left blank, excluded from the price chart.
- **benchmarks.js** (snapshot July 19): LMArena July 16 update (top-10 within ~28 Elo; Fable 5 leads the coding board; Kimi K3 #1 Frontend Code Arena at 1679 at launch - swfte.com, metatext.io); catalog notes corrected to the rebased scale (Kimi K2.6 44.2, DeepSeek V4 Pro 44.3, Nemotron 3 Ultra 37.8, GLM-5.2 top open at 51.1); Kimi K3 + Inkling added to the catalog; 3 new linked sources.
- **OpenRouter free routes re-verified** (costgoat.com/pricing/openrouter-free-models): defaults `nvidia/nemotron-3-ultra-550b-a55b:free` and `qwen/qwen3-coder:free` still valid; DeepSeek/Mistral still have no free route; Tencent Hy3 free listing ends July 21 (deliberately not set as a default).

### Files
- **New:** `js/charts.js`, `js/finder.js`, `js/glossary.js`, `js/modelcompare.js`, `tests/run-tests.mjs`, `tests/smoke-dom.mjs`, `CHANGELOG.md`.
- **Modified:** `index.html`, `styles.css`, `js/app.js`, `js/i18n.js` (+56 keys ×11 languages → 193 keys, completeness test green), `js/models-db.js`, `js/benchmarks.js`, `sw.js`, `README.md`, `STATUS.md`.

### Tests
- `node tests/run-tests.mjs` - 57 static checks (syntax ×12 files, DB integrity, benchmark integrity, i18n completeness ×11, engine/chains regression, charts escaping, glossary, finder recommendation logic ×7 scenarios, HTML↔JS id cross-check, version coherence, CSS braces, manifest): **57/57 green**.
- `node tests/smoke-dom.mjs` (jsdom) - boots the real app and walks every view: finder full flow, generate, glossary search, guide + insights + model detail, compare specs (2→3 models), chain build/add/reorder/remove, About anchors, live language switch (IT + Arabic RTL), theme cycle: **32/32 green**.

### Known limitations
- Chain **share links** carry goal/context/task/models but not custom steps (URL kept short and private by design).
- GPT-5.5 API price not published → absent from the price-performance chart.
- Finder copy (questions/answers) is English by design, same policy as prompts/benchmarks; its chrome (buttons, headings) is translated in all 11 languages.
