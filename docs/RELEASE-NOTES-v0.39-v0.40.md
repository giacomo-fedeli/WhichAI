# GitHub release notes (draft, to publish by Jack)

These are the first GitHub Releases of the repository. Tags:
- `v0.39.0` on commit `cd4ed08` (already on GitHub, live since November 25, 2026)
- `v0.40.0` on the session-40 commit (after the push)

---

## v0.39.0 - The live AI ranking, on one page

**Title:** WhichAI v0.39.0

WhichAI (https://whichai.wiki) is a free, account-free guide to which AI model to use, what it costs and what changed this week. This is the first tagged release; it collects the work since v0.35.

**Highlights**
- **Data that updates itself** (v0.35): official Artificial Analysis scores, prices, newly measured models and free routes arrive through `/api/catalog`; every deploy bakes fresh data in. Nothing is ranked without an official measurement.
- **One page, six chapters** (v0.36): Ranking, Compare, Model Radar (with automatic news from `/api/news`), Market, AI Debates and Tools (Find your AI, Prompt generator, Prompt Doctor, Stack Optimizer).
- **Dot-field background** (v0.37) driven by scroll, replacing the flying cards; CI made hermetic.
- **Footer row of AI directories** (v0.38-v0.39): plain text links to ToolPilot, ShowMeBestAI and Dang.ai.

11 UI languages (Arabic RTL), installable PWA, light/dark theme, no tracking beyond a cookieless visit counter.

Full history: `CHANGELOG.md`.

---

## v0.40.0 - Green CI, nine new reviews, open source

**Title:** WhichAI v0.40.0

**Fixed**
- CI and the weekly data check were red since November 9 because a test measured a 45-day window from today's date against an October fixture; the test clock is now pinned.
- Wiki URLs: the sitemap, canonical tags and internal links pointed at `.html` URLs that redirect (308) under `cleanUrls`; all public URLs are now final and extensionless.
- Stack Optimizer: SuperGrok and Copilot were always called redundant without a calculation. Grok is now scored from official live data; anything it cannot score is "not assessed"; each cancel advice says what you lose. Retired Copilot Pro is shown as Microsoft 365 Premium.

**Added**
- Hand-written reviews for Claude Fable 5.2, Claude Opus 5.5, Claude Sonnet 5.5, GPT-6.2 Astra, GPT-6.2 Sol, GPT-6.1 Sol, Gemini 4 Carbon, Gemini 4 Neon and Qwen4 Max (scores still come only from the official source).
- Price policy: prices follow OpenRouter, except opposite-direction changes, which are held for review.
- Dependabot for GitHub Actions.

**Changed**
- AI Debates on copyright and regulation updated with dated sources (US DOJ statement of interest, Thomson Reuters v. Ross on appeal, EU AI Omnibus 2026/1744).
- Rumored entries re-verified (Gemini 3.5 Pro cancelled, Grok 5 and Llama 5 unreleased).
- GitHub Actions on Node 24 (`checkout@v7`, `setup-node@v7`, `upload-artifact@v7`).
- **The code is now MIT-licensed**; the data stays CC BY 4.0.

Tests: 569 passing (static, DOM smoke, API, live data, catalog, news) and the production build.
