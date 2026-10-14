# WhichAI - Changelog

(Older release-by-release history lives in `STATUS.md`, the project's working memory.)

## v0.37.0 (2026-10-14)

The cards that flew from one chapter to the next are gone. A quiet dot grid behind the page carries the change instead, and it stops the moment you stop scrolling.

### Added
- **The dot field** (`js/dotfield.js`): one fixed canvas behind the page with a fine grid of dots, like dotted paper. Each chapter lights its own halftone pattern in the chapter's colour: five tier rows (Ranking), two rings moving together (Compare), radar rings and a turning sweep (Radar), rising price lines (Market), two voices meeting in the middle (Debates), a compass (Tools).
- Crossing into the next chapter dissolves one pattern into the other from the bottom up, as a pure function of the scroll position: stop half-way and it stays half-way. While you read, the grid drifts up slower than the page and each pattern follows your reading.
- Interactivity: dots swell and make room around the mouse pointer; a click on an empty part of the page sends a ripple. Nothing reacts to touch scrolling.
- `WhichAIMotion.onFrame(fn)`: every frame's geometry (scroll, viewport, chapters, accent, layout version) for listeners.
- **The maker's own page** ([giacomo-fedeli.vercel.app](https://giacomo-fedeli.vercel.app)) joins ComplyAI.wiki and War Right Now in the footer, in About > Contribute, and in the footer of every wiki page.

### Removed
- The "morph" ghosts and their settling step (`data-morph-from` / `data-morph-to`, `.morph-ghost`). When the reader stopped mid-way the ghost had to glide to the nearer end, which read as a jolt. The bridge cards stay, still.

### Fixed
- **CI was red on GitHub** (step "API tests"): with real network access the daily data check came back fully clean, its "needs a human" list was empty, and a test insisted it never could be. `tests/api-tests.mjs` is now hermetic (outside hosts answer from the saved October 3 response or not at all) and the assertion allows an empty list when the report is clean. The site itself was never affected: Vercel deploys independently of CI.

### Performance
Frames only while something changes; about 2.5 ms per frame for ~4,500 dots in software-rendered Chromium (about 1.3 ms for ~1,600 on a phone); measured scroll jank is the same with and without the field. Half the dots on slow devices, a wider grid on very large screens, a still picture for `prefers-reduced-motion`, hidden in print, and no dots at all without canvas.

### Tests
250 static + 83 DOM smoke + 52 API + 59 live data + 69 catalog + 44 news = **557 passing**, also on a clean clone with `npm ci` and Node 24.

## v0.36.0 (2026-10-13)

One page, six chapters, read top to bottom. No cover, no menu of views: the data comes first, every chapter hands something visible to the next, and the tools that turn a choice into a result close the page.

### Added
- **A single page in six chapters**: 01 Ranking, 02 Compare, 03 Radar, 04 Market, 05 Debates, 06 Tools (Find your AI, Prompt generator, Prompt Doctor, Stack Optimizer). The footer carries the maker's other projects (ComplyAI.wiki, War Right Now), About and "Your data".
- **The Ranking chapter opens the site**: every model with an official score sorted into tiers S to D by percentile (S top 5%, A to 20%, B to 40%, C to 65%; ties share a tier), on the Intelligence, Coding or Agentic index, with filters (open weights, free route, under $1, legacy), a search for any model in the catalog, and four live KPIs. Tiers are computed, never chosen; a converted, guessed or rumored score is never ranked.
- **A scatter nobody can squash**: price on a log axis (1-3-10), legacy models out unless asked for, $0 prices in their own "Free" lane, the best-value frontier drawn, dots coloured by tier and linked to the chips (hover one, the other lights up). Until v0.35 a single legacy model at $262 per 1M tokens pushed ninety others into a corner.
- **Visible connections between chapters** (`js/motion.js`): a reading-progress bar, a side rail, an accent colour that blends from chapter to chapter, reveal on scroll, lazily mounted chapters, and five morphs: a real object leaves the end of one chapter and lands in the next while you scroll (the top two models become the Compare duel, the newest arrival becomes the Radar's headline, the leader's price opens the Market, a number from the first debate opens Debates, four task icons become the Finder's buttons). If scrolling stops mid-way, the object glides to the nearer end and lands. Everything turns off for prefers-reduced-motion.
- **The Market chapter** (`js/market.js`), computed from the catalog the page already holds: what the leader costs, the cheapest way into each tier, best value (index points per dollar among models at or above the median), the free API routes that exist right now, live price moves, and a monthly cost calculator.
- **`GET /api/news`** (`api/_news-core.js`): the Radar's news wire from free, keyless public sources: the OpenAI, Google DeepMind and Mistral AI blogs, TechCrunch AI (titles naming a lab or a model), Hacker News (AI stories with 100+ points in the last 14 days) and Hugging Face (blog and trending models). RSS and Atom parsed without a library, each source fails on its own, cached 30 minutes at the edge; the browser keeps the last good wire. `tests/news-tests.mjs`: 44 offline checks.
- **One model card everywhere**: an accessible drawer (dialog, focus trap, Escape) with tier, rank, specs, review, Compare, Follow, official site and wiki page, shareable as `#model=id`.
- **Find your AI first**: a one-tap answer per task (the best app, why, the free tier, the sources) above the four-question guided finder; "Write the prompt" hands the choice to the generator with the model and task pre-selected; the generator hands any prompt to the Doctor.
- Deep link **`#compare=a,b`**, used by the wiki's "Compare them live" buttons.

### Removed (to lighten the stack)
- The welcome cover with four cards, the scroll journey and the Three.js scene (`three` is no longer a dependency).
- The hash views and the More menu; Chains; the Merge studio; Output comparison; Blind Arena; Settings with API keys and in-browser auto-run (BYOK). Keys stored by older versions are deleted on the first visit.
- The old Live market view, which downloaded about 675 KB of raw routes on every open.
- Every old address still lands somewhere sensible (`#guide` to the Ranking, `#chains` to the generator, `#settings` to Your data, and so on).

### Changed
- `/api/refresh` checks the free routes the catalog text names (the site ships no defaults of its own any more); nothing it can find breaks the site, so its worst state is "review".
- The catalog: the `auto-run` tag is retired; the free tag is removed from Qwen3 Coder and Nemotron 3 Super, whose free routes were retired; the Gemini Flash access lines are current; the finder no longer offers Qwen3 Coder as free.
- i18n rebuilt around what the page uses: 373 keys in 11 languages, none missing, none dead.
- The static wiki links to the new chapters and to the maker's other projects.
- Deep links open in place instead of scrolling the whole page; a chapter starts flush under the bar.
- Kimi's icon (a white K) gets its own dark tile, so it is visible.

### Tests
237 static + 82 DOM smoke + 50 API + 59 live data + 69 catalog + 44 news = **541 passing**. New: every i18n key the page uses exists in all 11 languages, every chapter hand-off leaves and lands where it should, every retired address is mapped, nothing removed is still loaded or cached.

## v0.35.0 (2026-10-03)

The site updates itself. Scores, prices, new models and free routes now come from their public sources automatically, every hour, with nobody editing a file.

### Added
- **`GET /api/catalog`** - the self-updating layer. `api/_catalog-core.js` turns OpenRouter's public model list into one small delta: the official Artificial Analysis Intelligence, Coding and Agentic indices, current prices, the free routes that exist right now, every model Artificial Analysis has measured that the catalog lacks, and the newest arrivals. Cached at the edge for an hour and served stale while it revalidates, so the upstream sees about one read per hour per region.
- **`js/live-catalog.js`** - lays that delta over the editorial catalog in the browser. At load it applies the newest of the build seed and this browser's saved copy (so the first paint is already current); once the page settles it asks `/api/catalog` for fresher data and every view redraws: ranks, the Model guide, the welcome ladder, the Radar.
- **New models appear on their own.** On October 3 that meant 42 measured models the catalog did not list - Claude Opus 5.5 (57.6, the new #1), Claude Sonnet 5.5, GPT-6.1 Sol, GPT-6 Sol and Luna, Grok 4.7, MiMo-V2.6 and more - each marked "auto-added" until a person writes its review. Brand-new unmeasured models from the big labs show in the Radar and are ranked only once measured.
- **Every deploy bakes fresh data in.** `tools/build.mjs` reads the same sources, writes `dist/js/live-seed.js` and regenerates the static wiki from the merged catalog, so search-engine pages and new model pages are current from the first byte. If the source does not answer, the build ships the committed snapshot and says so.
- **`js/wiki-live.js`** keeps wiki figures current between deploys (elements marked `data-live-*`), and the models index lists what was measured since the page was generated.
- **Self-healing free routes.** OpenRouter retired `qwen/qwen3-coder:free`, the shipped Qwen default, which silently broke auto-run for everyone who kept it. A retired default is now replaced by the best live free route of the same family (today `qwen/qwen3.8-27b:free`), and the Settings page says so. Routes a user typed are never touched.
- **A live router.** For general use, analysis and coding the order of Claude, ChatGPT and Gemini follows the live index of each maker's best public model; the general summary and the Frontier / Open-weight catalog cards are computed from the data instead of typed. The guided finder picks "whatever is best", the developer value pick, the best free route and the best downloadable model from the live catalog too.
- A green **Live data** badge in the header says when the numbers were last read, in the reader's language.
- **`tests/catalog-tests.mjs`** - 69 checks on a real OpenRouter response saved on October 3 (`tests/fixtures/openrouter-2026-10-03.json`): the delta, the merge, the browser lifecycle, the endpoint, the build seed and the wiki.

### Corrected
- **The catalog's "AA index" was not the official one.** Until v0.34 the scores came from the BenchLM mirror, which sits on a different scale (Claude Opus 5: 63.0 on the mirror, 50.8 official). The values OpenRouter relays match what Artificial Analysis publishes itself (OfficeChai, September 22: Opus 5.5 58, GPT-6 Astra 53, Fable 5.1 53, Opus 5 51). A one-time migration (`tools/migrations/2026-10-03-official-aa-scale.mjs`, kept for provenance) moved the static catalog to the official scale: 55 entries take their official value; 53 measured only on the old scale carry a converted value marked "~" (with the original kept in `was`), never ranked.
- **Rankings use official measurements only** - liveRank, the welcome ladder, the 3D ladder, charts, the finder and the API. A converted or guessed value is context, not a position.
- Three reviews quoted old-scale figures (Grok 4.6, Muse Spark 1.2, GLM-5.3); the figures are gone, the judgment stays.
- `js/benchmarks.js` prose no longer carries numbers, dates or ranks (it had "Opus 5 = 60.7, July 24" beside a September summary); the editorial layer describes character, the live layer supplies figures.

### Changed
- `/api/models`, `/api/stats`, `/api/recommend` and `/api/health` serve the live catalog (`meta.live` says when the source was read); with the source down they serve the editorial catalog unchanged. `WHICHAI_LIVE=off` pins the static data.
- `/api/refresh` became an audit of the automation: what was applied, what was healed, and only what still needs a person. It also raises a flag if OpenRouter ever stops relaying the indices (`relayedScores` under 20), because then scores would freeze.
- About, Methodology and FAQ describe how the data now stays current; the Radar merges curated entries with automatic arrivals; the price-performance chart labels only the frontier and the leaders so a hundred dots stay readable.

### Tests
232 static + 115 DOM smoke + 50 API + 55 live data + 69 catalog = **521 passing**.

## v0.34.0 (2026-09-08)

The live market feed, finished and mounted, plus the test file two workflows were already calling.

### Added
- **Live market view** (`#live`, in the More menu). `js/live-data.js` was complete, translated and wired to nothing: not referenced by `index.html` or the service worker. It now has a view, and the feed is fetched only when someone opens it, because it is a network call to a third party that nobody asked for at page load.
- **`tests/live-data-tests.mjs`** - 53 checks, entirely offline through an injected fetcher. Both workflows had been calling this file for a release; it did not exist, so both would have failed at that step regardless of anything else.
- A guard that stops it happening again: every `node tests/*.mjs` or `node tools/*.mjs` referenced by a workflow must point at a file that is actually in the repository.

### Corrected
- **Automatic score updates are possible after all.** The previous release said no public source exposes intelligence scores to a machine. OpenRouter does, on roughly 18 models, free and keyless, under `benchmarks.artificial_analysis`.
- **And they still must not be copied into the catalog.** The relayed index sits on a different scale from the cited editorial snapshot: OpenRouter reports Claude Opus 5 near 50, the mirror the catalog is built from says 63. Both are "the AA index". Writing one into the other would corrupt the single number this site is judged on, silently. The live feed therefore keeps relayed benchmarks in their own namespace, states the scale difference in its own payload, and never touches `score.aa` - now enforced by test rather than by intent.

### Changed
- Two tests stopped pinning implementation details. The scheduled-refresh check required an exact cron minute and a pull-request action; the workflow has since been rewritten to need no write permission at all, which is better, so the test now asserts that instead. The More-menu check counted nine items and broke whenever a tool was added; it now verifies every entry routes to a view that exists.

### Tests
231 static + 101 DOM smoke + 50 API + 53 live data = **435 passing**.

## v0.33.0 (2026-09-08)

A 3D constellation you can scroll through, and the numbers behind it made incapable of rotting.

### Added
- **The model constellation.** 118 real models as points in space: horizontal is price per million output tokens on a log scale, vertical is the measured index, depth is how recently it shipped. Scrolling morphs them between four formations - cloud, price/performance plane, ranked ladder, focus - so the shape on screen is the sentence being read. Built on three.js, tree-shaken to 133 KB gzipped, loaded lazily and never in the critical path.
- **A gate that says no.** The scene is declined outright for `prefers-reduced-motion`, Save-Data, 2g, under 4 GB of device memory, two cores or fewer, and no WebGL, and it stops rendering whenever the canvas leaves the viewport or the tab is hidden. The 2D fallback carries the same models, colours and formations. `?stage=3d` and `?stage=flat` override the decision.
- **The journey.** The welcome is no longer a dead end: scrolling is now a third answer alongside the four buttons. Four acts - the map, the ranking, your job, the tools - with a spine that fills as you descend, a dot per act, and a goal field in act three that answers live from the local router and carries your text into the Generator.
- **A computed rank badge** on every model card (`#4 of 108`), replacing rank claims that used to be typed into prose.

### Changed
- **Nothing unmeasured can be ranked any more.** Rumoured and private models no longer carry `score.aa` at all; their estimate lives in `score.guess`. GPT-6 had been sitting at the top of every sorted list on the site with an invented 65 while telling readers OpenAI had announced nothing. Sorting now excludes them by construction rather than by every consumer remembering to.
- **Eleven reviews stopped claiming a rank.** "#3 on the AA index (57.1)" is wrong within weeks and contradicts the score rendered beside it. Reviews now describe what a model is like to work with; positions are computed.
- **Four modules stopped hardcoding the snapshot date**, and `benchmarks.js` stopped keeping its own copy of six scores that had already drifted from the database.
- **The landing is dark in every theme.** A constellation of faint points on near-white is confetti. The app keeps the reader's chosen theme.

### Data refresh (September 8, verified against the OpenRouter public model list)
Claude Fable 5.1 (65.7, Sept 1, cache reads 75% cheaper), GPT-6 Astra (61.2, Sept 4 - the rumour entry became the real model), Muse Spark 1.3 (62.1, Sept 2), Gemini 3.8 Flash (58.7, Sept 2), Claude Mythos 5.1 (unmeasured). 118 models.

### Fixed
- `getContext("2d")` can return null in jsdom and in privacy modes that block canvas; it took the whole page down with it.
- `liveRank` and the price-chart note referenced `DBx`, a local of two other functions: a ReferenceError on opening any model card.
- The journey listened to the wrong scroll container, and tracked its position with `offsetTop` against a `scrollTop` from a different coordinate system.

### Tests
229 static + 97 DOM smoke + 50 API = **376 passing**.

## v0.32.0 (2026-09-02)

Automation that does not depend on anyone else's billing being in order.

### Added
- **The data check now runs on Vercel** (`api/refresh.js` + a daily Vercel Cron), on the same host that already serves the site: no extra account, no token, no cost. It asks the public OpenRouter list whether every shipped `:free` route still exists, whether prices drifted past 15% or context windows past 25%, and which models appeared since the last snapshot.
- **One implementation, two callers** (`api/_refresh-core.js`). The command line, CI and the endpoint all import it, so the check cannot mean different things depending on where it runs. A second copy would have recreated exactly the drift the check exists to catch.
- **The result is visible where the data lives.** The Model Radar shows a status pill: green when everything matches the public sources, amber with a count when items need review, red when a shipped free route is broken, grey when the check could not run. If the API is unreachable the line stays hidden and the local feed is complete regardless.
- `GET /api/refresh` is documented in `docs/API.md` and covered by eight new API tests.

### Changed
- **GitHub Actions is now the secondary path, by design.** It runs the identical code and still does the part only GitHub can do (open a pull request with the evidence, open an issue when a free route dies), but the automation no longer stops when Actions cannot run.
- `tools/refresh-data.mjs` is a thin CLI wrapper over the shared core.
- `/api/health` advertises six endpoints.

### Notes
The endpoint answers `200` with `skipped: true` and a `reason` when the upstream source is unreachable: a third party being down is not an error in WhichAI, and a red alert that cannot be explained trains people to ignore alerts. Intelligence scores are still never touched by a machine.

### Tests
195 static + 85 DOM smoke + 50 API = **330 passing**.

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
