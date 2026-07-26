# WhichAI v0.28 - release notes (for the GitHub Release)

Copy-paste body for the first GitHub Release (tag: `v0.28.0`). It summarizes everything since the last published version (v0.21), because v0.22-v0.27 were never deployed individually.

---

## WhichAI v0.28: the "everything" release

The biggest update since launch. Live at https://whichai.wiki - free, private, no account, everything runs in your browser.

### Decide faster
- **Guided AI Finder**: 4-5 quick questions, one honest recommendation with reasons, limits and prices. No prompt needed.
- **AI Stack Optimizer**: which subscription is worth keeping, what to use free, what is redundant, with estimated saving.
- **Homepage shows a finished example first**, and navigation is grouped into three primary tabs plus a rich "More" menu.

### Test on your own work
- **Blind Arena**: anonymous A/B rounds between the models your free keys can run, with a personal local Elo.
- **Compare, two modes**: real outputs side by side, or on-paper model comparison (scores, context, prices, category profiles).
- **Prompt Doctor**: paste a prompt, get a 0-100 score, a gap checklist and an optimized version for any of 13 model families.
- **Chains** got a visual roadmap with reorder/add/remove steps.

### Trust the data
- **108-model database** aligned to the July 24, 2026 AA snapshot (Claude Opus 5 debuts as overall #1 at 60.7). New entries: Claude Opus 5, Gemini 3.6 Flash, Gemini 3.5 Flash-Lite, Qwen3.8 Max preview, Kimi K3, Inkling.
- **Model Radar**: a curated, sourced feed of new models, price moves and free-tier changes, with a watchlist and "since your last visit" badges.
- **Versioned methodology**, sources on every ranking, estimates always marked, missing data shown as n/a.
- **156-page static wiki** (per-model pages, task rankings, head-to-heads, glossary) generated from the database, plus an open dataset (`data/models.json`, CC BY 4.0).

### Own your data
- API keys are session-only by default (device storage is opt-in), strict CSP, one-click backup export/import, delete-everything button.
- Real offline PWA with an update toast.
- 11 languages including RTL Arabic, three themes, shareable result images.

Full changelog: see `CHANGELOG.md`. Tests: 100+ static checks and a full DOM smoke suite, all green.

---

## Come pubblicare la Release (per Jack, 3 minuti)

1. GitHub → repo `promptcompass-` → a destra "Releases" → "Create a new release".
2. "Choose a tag" → scrivi `v0.28.0` → "Create new tag on publish".
3. Titolo: `WhichAI v0.28`.
4. Incolla il blocco inglese qui sopra (da "## WhichAI v0.28" fino a "all green.").
5. Publish release. Da qui in poi, una Release per ogni versione pubblicata.
