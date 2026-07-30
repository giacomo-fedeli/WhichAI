/*
 * WhichAI - Model Radar change feed (v0.25.0)
 * Curated, dated, sourced changes. Update this file at every data refresh
 * (add new entries at the top; keep sources). Dates are ISO (YYYY-MM-DD).
 * Types: new-model · price · score · free-tier · upcoming
 * Entries with a future date are shown under "Coming up".
 */
(function () {
  "use strict";

  var CHANGES = [
    { date: "2026-07-24", type: "new-model", title: "Claude Opus 5: the new overall #1", dbId: "claude-opus-5",
      note: "Anthropic's fourth release in two months tops the AA Intelligence Index (60.7) and the Agentic Index (55.3): 1M context, default thinking, computer use, unchanged $5/$25 pricing (Fast mode $10/$50).",
      src: { label: "MarkTechPost", url: "https://www.marktechpost.com/2026/07/24/meet-the-new-claude-opus-5-frontier-class-agentic-coding-and-computer-use-at-unchanged-opus-pricing/" } },
    { date: "2026-07-24", type: "score", title: "AA index: July 24 snapshot (167 models)", dbId: "claude-opus-5",
      note: "Anthropic takes the top two spots: Opus 5 60.7, Fable 5 59.9, GPT-5.6 Sol 58.9, Kimi K3 57.1. WhichAI scores are realigned; lower-table corrections for Mercury 2, K-Exaone and Trinity Large.",
      src: { label: "BenchLM mirror", url: "https://benchlm.ai/benchmarks/artificialAnalysis" } },
    { date: "2026-07-23", type: "new-model", title: "FLUX 3: Black Forest Labs goes multimodal frontier",
      note: "The image-generation lab ships its first multimodal frontier model. Outside WhichAI's text-model scope for now; tracked here because it reshapes the image side of the market.",
      src: { label: "Release trackers", url: "https://llm-stats.com/llm-updates" } },
    { date: "2026-07-21", type: "new-model", title: "Gemini 3.6 Flash (+3.5 Flash-Lite)", dbId: "gemini-3-6-flash",
      note: "Google refreshes the free workhorse: $1.50/$7.50 per 1M (output down from $9), 1M context, day one in AI Studio, API and app. Flash-Lite lands at $0.30/$2.50 for routing jobs. WhichAI's BYOK default is now gemini-3.6-flash.",
      src: { label: "Pricing guide", url: "https://apidog.com/blog/gemini-3-6-flash-pricing/" } },
    { date: "2026-07-19", type: "new-model", title: "Qwen week: 3.8 Max preview, Audio 3.0, Image 3.0", dbId: "qwen-3-8-max-preview",
      note: "Alibaba previews its next flagship (July 19) and ships new audio (July 20) and image (July 21) models. No index score published for 3.8 Max yet; listed as a clearly-marked preview.",
      src: { label: "AI Release Tracker", url: "https://aireleasetracker.com/latest" } },
    { date: "2026-08-31", type: "upcoming", title: "Claude Sonnet 5 intro pricing ends", dbId: "sonnet-5",
      note: "The $2/$10 per 1M intro API price runs to Aug 31; standard $3/$15 starts Sept 1.",
      src: { label: "Anthropic pricing (mirror)", url: "https://benchlm.ai/anthropic/api-pricing" } },
    { date: "2026-07-27", type: "free-tier", title: "Kimi K3 weights are live on Hugging Face", dbId: "kimi-k3",
      note: "As promised: the full 2.8T-parameter weights shipped July 27 under a Modified MIT license, the largest open-weight release ever. The database entry now carries the open-weights tag.",
      src: { label: "Kimi K3 tech blog", url: "https://www.kimi.com/blog/kimi-k3" } },
    { date: "2026-07-21", type: "free-tier", title: "Tencent Hy3 free OpenRouter listing ended", dbId: "hy3",
      note: "The :free route was time-limited by Tencent and expired July 21; expect paid pricing or removal.",
      src: { label: "OpenRouter free-model list", url: "https://costgoat.com/pricing/openrouter-free-models" } },
    { date: "2026-07-16", type: "new-model", title: "Kimi K3: the July surprise", dbId: "kimi-k3",
      note: "2.8T-parameter MoE, 1M context, native vision. Debuts at #3 on the AA index (57.1), best published BrowseComp (91.2%), #1 Frontend Code Arena. API $3/$15 per 1M.",
      src: { label: "VentureBeat", url: "https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems" } },
    { date: "2026-07-16", type: "score", title: "AA Intelligence Index: July snapshot", dbId: "fable-5",
      note: "Rebased snapshot across 165 models: Claude Fable 5 leads at 59.9, GPT-5.6 Sol 58.9, Kimi K3 57.1, Opus 4.8 55.7. WhichAI scores are aligned to this snapshot.",
      src: { label: "BenchLM mirror", url: "https://benchlm.ai/benchmarks/artificialAnalysis" } },
    { date: "2026-07-16", type: "score", title: "LMArena July update: coding lead changes hands", dbId: "fable-5",
      note: "Claude Fable 5 now tops the coding board; the overall top-10 sits within about 28 Elo points, the tightest spread on record.",
      src: { label: "LMArena trackers", url: "https://www.swfte.com/ai/leaderboard" } },
    { date: "2026-07-15", type: "new-model", title: "Inkling: Thinking Machines goes open", dbId: "inkling",
      note: "975B-parameter MoE (41B active), natively multimodal, 1M context, Apache 2.0. The new leading US open-weights base for customization (AA 40.7).",
      src: { label: "Thinking Machines", url: "https://thinkingmachines.ai/news/introducing-inkling/" } },
    { date: "2026-07-11", type: "free-tier", title: "OpenRouter free routes verified", dbId: "qwen3-coder",
      note: "Nemotron 3 Ultra and Qwen3 Coder remain genuinely free (about 20 req/min, 200/day). DeepSeek and Mistral currently have no free route.",
      src: { label: "OpenRouter free-model list", url: "https://costgoat.com/pricing/openrouter-free-models" } },
    { date: "2026-07-09", type: "new-model", title: "GPT-5.6 Sol, Terra and Luna go public", dbId: "gpt-5-6-sol",
      note: "OpenAI's new trio: Sol $5/$30 (leads the Coding Agent Index), Terra $2.50/$15, Luna $1/$6 per 1M tokens. Sol reaches 750 tok/s on Cerebras.",
      src: { label: "AA / BenchLM", url: "https://benchlm.ai/benchmarks/artificialAnalysis" } },
    { date: "2026-07-09", type: "new-model", title: "Muse Spark 1.1: Meta's first paid model", dbId: "muse-spark-1-1",
      note: "Meta Superintelligence Labs ships its first commercial model; 50.6 on the July AA snapshot.",
      src: { label: "BenchLM mirror", url: "https://benchlm.ai/benchmarks/artificialAnalysis" } },
    { date: "2026-07-08", type: "new-model", title: "Grok 4.5 launches an API price war", dbId: "grok-4-5",
      note: "$2/$6 per 1M tokens, roughly 60% below comparable frontier tiers, with high token efficiency (~80 tok/s). Not available in the EU.",
      src: { label: "xAI pricing trackers", url: "https://tokencost.app/models/grok-4-5" } },
    { date: "2026-07-07", type: "price", title: "Claude Fable 5 moves to usage credits", dbId: "fable-5",
      note: "Subscription access to Fable 5 switched to usage credits on July 7; API stays $10/$50 per 1M tokens.",
      src: { label: "Pricing guide", url: "https://www.digitalapplied.com/blog/claude-fable-5-usage-credits-july-7-pricing-guide-2026" } },
    { date: "2026-07-06", type: "new-model", title: "Hunyuan 3.0 goes open weights", dbId: "hy3",
      note: "Tencent opens up with a permissive Apache license; 41.2 on the July AA snapshot.",
      src: { label: "BenchLM mirror", url: "https://benchlm.ai/benchmarks/artificialAnalysis" } }
  ];

  var Changes = {
    CHANGES: CHANGES,
    /** entries not in the future, newest first */
    past: function (today) {
      today = today || new Date().toISOString().slice(0, 10);
      return CHANGES.filter(function (c) { return c.date <= today; });
    },
    /** future entries, soonest first */
    upcoming: function (today) {
      today = today || new Date().toISOString().slice(0, 10);
      return CHANGES.filter(function (c) { return c.date > today; }).slice().reverse();
    },
    /** how many past entries are newer than the given ISO date string */
    unseenCount: function (lastSeen, today) {
      if (!lastSeen) return this.past(today).length;
      return this.past(today).filter(function (c) { return c.date > lastSeen; }).length;
    }
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIChanges = Changes;
  if (typeof module !== "undefined" && module.exports) module.exports = Changes;
})();
