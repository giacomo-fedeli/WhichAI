/*
 * WhichAI - Benchmark dataset, model router & catalog (v0.35.0)
 *
 * Two layers, kept apart on purpose:
 *   - EDITORIAL (this file): what each app is like to use, its free tier, who
 *     it suits. Written without figures, dates or ranks, because those rot
 *     within weeks and then contradict the numbers rendered beside them.
 *   - LIVE (computed at render time from js/models-db.js, which the live
 *     catalog keeps current): who leads today on the official Artificial
 *     Analysis indices, the general summary, the frontier and open-weight
 *     cards. Nothing here has to be edited for the router to follow the market.
 *
 * Task rankings are at APP level (the four big assistants people actually
 * open); for general, analysis and coding the order of the three model makers
 * follows the live index of their best public model.
 */
(function () {
  "use strict";

  var Bench = {
    updated: "October 3, 2026",

    disclaimer:
      "Live where a public measurement exists (official Artificial Analysis indices, refreshed automatically), editorial where it does not. Rankings shift fast - treat this as guidance, not gospel.",

    CONFIDENCE_NOTES: {
      high: "High confidence: direct benchmark coverage exists for this task type.",
      medium: "Medium confidence: based on adjacent benchmarks plus app features.",
      low: "Low confidence: differences between the top models are small for this task."
    },

    apps: {
      claude: {
        label: "Claude",
        vendor: "Anthropic",
        topModel: "Anthropic's current flagships (Pro $20/mo, Max for heavy use)",
        freeModel: "a Sonnet model (usage limits vary by demand)"
      },
      chatgpt: {
        label: "ChatGPT",
        vendor: "OpenAI",
        topModel: "OpenAI's current flagships (Plus $20/mo, Pro $200/mo)",
        freeModel: "a GPT model with limited messages, then a smaller model"
      },
      gemini: {
        label: "Gemini",
        vendor: "Google",
        topModel: "Google's current Flash and Pro models (AI Pro, $19.99/mo)",
        freeModel: "a Flash model (the most generous free tier, with a monthly Deep Research allowance)"
      },
      perplexity: {
        label: "Perplexity",
        vendor: "Perplexity AI",
        topModel: "Sonar Pro + Deep Research, with the current OpenAI, Anthropic and Google flagships inside (Pro, $20/mo)",
        freeModel: "Sonar (unlimited basic cited searches + a few Pro searches a day)"
      }
    },

    sources: [
      { id: "aa", label: "Artificial Analysis Intelligence, Coding and Agentic indices (official, read live via OpenRouter)", url: "https://artificialanalysis.ai" },
      { id: "or", label: "OpenRouter public model list (prices, context, routes; read live)", url: "https://openrouter.ai/models" },
      { id: "lmarena", label: "LMArena leaderboard (community head-to-head votes)", url: "https://arena.ai/leaderboard" },
      { id: "swebench", label: "SWE-bench Verified / Pro (real-world coding tasks)", url: "https://llm-stats.com/benchmarks/swe-bench-verified" },
      { id: "tiers", label: "Plans and free-tier comparison (June 2026)", url: "https://www.morphllm.com/comparisons/chatgpt-vs-claude-vs-gemini" },
      { id: "cw", label: "Creative-writing model guide (July 2026)", url: "https://www.buildmvpfast.com/articles/best-llms-2026-guide/creative-writing-ai" },
      { id: "pplx", label: "Perplexity plans, features and Sonar (2026)", url: "https://suprmind.ai/hub/perplexity/pricing/" },
      { id: "open", label: "Open-weight model benchmarks (2026)", url: "https://benchlm.ai/blog/posts/best-chinese-llm" },
      { id: "subs", label: "AI subscription pricing comparison (2026)", url: "https://www.sentisight.ai/ai-price-comparison-gemini-chatgpt-claude-grok/" },
      { id: "aa-mirror", label: "Older snapshots on the BenchLM mirror scale (used only for converted ~ values)", url: "https://benchlm.ai/benchmarks/artificialanalysis" }
    ],

    taskTypes: {
      writing: {
        confidence: "high",
        summary:
          "Claude produces the most natural-sounding prose, and Anthropic's Fable line is built specifically for creative work. ChatGPT is a close second and shines when you want many variants to choose from.",
        ranking: [
          { app: "claude", note: "Best-rated prose: natural voice, subtext and character work, with a model line built for creative writing. Its free tier is rated among the strongest free options for writing quality." },
          { app: "chatgpt", note: "Strong all-rounder: great at brainstorming angles, dialogue variants and turning rough notes into drafts. Canvas mode helps with editing." },
          { app: "gemini", note: "Capable writer with the most generous free tier - good for high-volume everyday writing." },
          { app: "perplexity", note: "Not built for prose - but excellent for gathering cited facts and references before you write." }
        ],
        sourceIds: ["cw", "lmarena", "tiers"]
      },

      coding: {
        confidence: "high",
        summary:
          "It is close at the top, and the order below follows the live Artificial Analysis Coding Index of each maker's best model. Claude is the reference for multi-file, real-repository work; open models are now within reach for many coding tasks at a fraction of the price.",
        ranking: [
          { app: "claude", note: "Strongest at multi-file, real-project work: consistently at or near the top of SWE-bench Pro (uncontaminated, real repositories) and of LMArena's coding board." },
          { app: "chatgpt", note: "Statistically tied with Claude on SWE-bench Verified for most of 2026; the Codex variants are built specifically for coding workflows." },
          { app: "gemini", note: "Top-tier in head-to-head developer votes, with fast, cheap Flash models that are ideal for quick iteration." },
          { app: "perplexity", note: "Useful for looking up current docs, APIs and error messages with sources - pair it with a coding model." }
        ],
        sourceIds: ["aa", "swebench", "lmarena", "open"]
      },

      analysis: {
        confidence: "medium",
        summary:
          "The top models are close on reasoning; the order below follows the live Intelligence Index. Claude states its assumptions most carefully, Gemini handles very long documents well, and ChatGPT has the most mature built-in tools for uploaded data files.",
        ranking: [
          { app: "claude", note: "Careful, assumption-stating reasoning: a good default for rigorous analysis." },
          { app: "gemini", note: "Strong on reasoning benchmarks and handles very long documents well." },
          { app: "chatgpt", note: "Best built-in tooling for spreadsheets and data files you upload directly in chat." },
          { app: "perplexity", note: "Good for pulling in current external data and benchmarks to feed the analysis, with citations." }
        ],
        sourceIds: ["aa", "lmarena"]
      },

      research: {
        confidence: "high",
        summary:
          "Perplexity is purpose-built for this: every answer runs a live web search and comes back cited, and its citation accuracy is rated best in class. Gemini's Deep Research is the strongest bundled alternative; Claude excels at digesting long documents you already have.",
        ranking: [
          { app: "perplexity", note: "Best-in-class citations on every answer; the free tier has unlimited basic searches, Pro adds Deep Research and frontier models inside." },
          { app: "gemini", note: "Deep Research with a monthly allowance even on the free tier, plus tight Google Search integration." },
          { app: "claude", note: "Very large context and very long outputs in one pass - best for summarizing long documents you paste in." },
          { app: "chatgpt", note: "Solid browsing on every tier; good at fusing multiple sources into a readable summary." }
        ],
        sourceIds: ["pplx", "tiers", "aa"]
      },

      brainstorming: {
        confidence: "medium",
        summary:
          "ChatGPT is rated the strongest broad generalist for idea generation - expanding premises, producing variants, riffing on rough notes. Claude tends to produce fewer but more distinctive ideas.",
        ranking: [
          { app: "chatgpt", note: "Strongest at rapid divergent output: many usable variants fast, from names to campaign angles." },
          { app: "claude", note: "Fewer, more distinctive ideas with better follow-through when you develop one." },
          { app: "gemini", note: "Solid idea generator, and free-tier limits are the least restrictive for long sessions." },
          { app: "perplexity", note: "Use it to fuel the brainstorm with real examples and market references, not to generate the ideas." }
        ],
        sourceIds: ["cw", "tiers"]
      },

      education: {
        confidence: "low",
        summary:
          "All the assistants explain well - differences are small here. Claude's especially natural prose gives it a slight edge for clear, patient explanations; Gemini's generous free tier suits heavy study use.",
        ranking: [
          { app: "claude", note: "Slight edge in clear, well-structured explanations thanks to top-rated prose quality." },
          { app: "gemini", note: "Free tier runs the same fast model as paid defaults - ideal for long study sessions at no cost." },
          { app: "chatgpt", note: "Reliable explainer; custom GPTs offer ready-made tutors for specific subjects." },
          { app: "perplexity", note: "Great for sourced, up-to-date facts while studying - less suited to long patient explanations." }
        ],
        sourceIds: ["cw", "tiers"]
      },

      business: {
        confidence: "medium",
        summary:
          "ChatGPT's generalist strength and ecosystem (custom GPTs, Canvas) make it the practical default for business work; Claude wins when the deliverable is polished writing; Perplexity covers the market-research legwork with citations.",
        ranking: [
          { app: "chatgpt", note: "Best all-round business assistant: strategy drafts, deck outlines, custom GPTs for repeat workflows." },
          { app: "claude", note: "First pick when the output is client-facing text that has to read well." },
          { app: "perplexity", note: "Market and competitor research with citations - the credible-sources half of business work." },
          { app: "gemini", note: "Natural choice if your documents, mail and calendar live in Google Workspace." }
        ],
        sourceIds: ["aa", "tiers", "pplx"]
      },

      general: {
        confidence: "high",
        summary:
          "The top of the market is tight and changes every few weeks; the order below follows the live Artificial Analysis Intelligence Index of each maker's best public model. Perplexity remains the specialist you add for anything that needs sources.",
        ranking: [
          { app: "claude", note: "Careful reasoning, the most natural prose and very long context: the strongest default when quality matters more than speed." },
          { app: "chatgpt", note: "The most complete all-round app: tools, voice, files and custom GPTs in one place." },
          { app: "gemini", note: "Fast, with the most generous free tier of the three and deep Google Workspace integration." },
          { app: "perplexity", note: "Not a generalist - but the first stop whenever the answer must be current and cited." }
        ],
        sourceIds: ["aa", "lmarena", "tiers"]
      }
    },

    /* ---------------- Model catalog: who's who on the market ----------------
       "frontier" and "open" are rebuilt from live data at render time
       (catalogView). The other groups are about how people use an app, which
       no index measures, so they stay editorial - and figure-free. */

    catalog: [
      {
        id: "frontier",
        label: "Frontier flagships",
        blurb: "The most capable models on the market right now, by the official Artificial Analysis Intelligence Index - paid tiers, overkill for simple tasks, unbeatable for hard ones.",
        models: []
      },
      {
        id: "everyday",
        label: "Everyday workhorses",
        blurb: "Fast, capable defaults - what you actually talk to most of the time, often free.",
        models: [
          { name: "ChatGPT free tier", vendor: "OpenAI", access: "Free (limited messages); higher limits on Plus ($20/mo) or Go (~$8/mo)", note: "The strongest broad generalist; excellent brainstorming and drafting." },
          { name: "Claude free tier", vendor: "Anthropic", access: "Free tier of claude.ai", note: "Rated the strongest free option for writing and coding quality." },
          { name: "Gemini Flash", vendor: "Google", access: "Free (the most generous free tier around)", note: "Near-instant, 1M-token context, with a free Deep Research allowance." },
          { name: "Claude Haiku", vendor: "Anthropic", access: "All Claude tiers; cheapest Claude via API", note: "Fastest and cheapest of the line - quick answers, light tasks, high volume." }
        ]
      },
      {
        id: "search",
        label: "Search & research assistants",
        blurb: "Built around live web search with citations - the right tool when the answer must be current and sourced.",
        models: [
          { name: "Perplexity Sonar", vendor: "Perplexity AI", access: "Free: unlimited basic cited searches + a few Pro searches a day", note: "Best-in-class citation accuracy - a smarter, cited replacement for googling." },
          { name: "Perplexity Pro (Sonar Pro + Deep Research)", vendor: "Perplexity AI", access: "$20/mo", note: "Unlimited Pro Search, daily Deep Research runs, plus the current OpenAI, Anthropic and Google flagships selectable inside." },
          { name: "Gemini Deep Research", vendor: "Google", access: "Monthly allowance on the free tier; more on AI Pro", note: "Long autonomous research reports generated inside Gemini." }
        ]
      },
      {
        id: "ecosystem",
        label: "Ecosystem assistants",
        blurb: "Assistants bundled into platforms you may already use - often the shortest path to a good answer.",
        models: [
          { name: "Grok", vendor: "xAI", access: "Free tier on X / grok.com; paid from ~$16/mo", note: "Direct, up-to-the-minute answers with X data and selectable reasoning effort." },
          { name: "Copilot", vendor: "Microsoft", access: "Free tier; Copilot Pro $20/mo; built into Windows and Office", note: "OpenAI models woven into Word, Excel, PowerPoint, Teams and Windows - best when your work lives in Microsoft 365." },
          { name: "Meta AI", vendor: "Meta", access: "Free - meta.ai web app and inside WhatsApp, Instagram, Messenger", note: "Always at hand inside Meta's apps, now running on the proprietary Muse line." }
        ]
      },
      {
        id: "open",
        label: "Open-weight models",
        blurb: "Downloadable, and cheap or free to run via hosts like OpenRouter - the strongest by the official index right now, a step below the frontier and closing.",
        models: []
      }
    ]
  };

  /* ---------------- live layer ---------------- */

  function currentDb() {
    var db = (typeof window !== "undefined" ? window.PromptCompassModelsDB : null) ||
             (typeof module !== "undefined" && module.exports ? tryRequireDb() : null);
    return db && db.models ? db : null;
  }
  function tryRequireDb() {
    try { return require("./models-db.js"); } catch (e) { return null; }
  }

  /* Official = measured by Artificial Analysis on the current scale. A
     converted (~) or guessed value is context, never a rank. */
  function official(m) {
    return m && m.score && typeof m.score.aa === "number" && !m.score.est && m.status !== "rumored" && m.status !== "private";
  }

  var LIVE_METRIC = { general: "aa", analysis: "aa", coding: "coding" };
  var METRIC_LABEL = { aa: "AA Intelligence", coding: "AA Coding" };
  var APP_VENDOR = { claude: "Anthropic", chatgpt: "OpenAI", gemini: "Google" };

  function bestOf(vendor, metric, db) {
    var best = null;
    db.models.forEach(function (m) {
      if (m.vendor !== vendor || m.status !== "public" || !official(m)) return;
      var v = metric === "coding" ? m.score.coding : m.score.aa;
      if (typeof v !== "number") return;
      if (!best || v > best.value) best = { id: m.id, name: m.name, value: v, metric: metric, label: METRIC_LABEL[metric] };
    });
    return best;
  }

  /* One sentence that is true today because it is computed today. */
  function liveSummary(db) {
    db = db || currentDb();
    if (!db) return null;
    var top = db.models.filter(function (m) { return official(m) && m.status === "public"; })
      .sort(function (a, b) { return b.score.aa - a.score.aa; });
    if (top.length < 10) return null;
    var lead = top[0], second = top[1], tenth = top[9];
    var gap = Math.round((lead.score.aa - second.score.aa) * 10) / 10;
    var spread = Math.round((lead.score.aa - tenth.score.aa) * 10) / 10;
    var vendors = {};
    top.slice(0, 10).forEach(function (m) { vendors[m.vendor] = (vendors[m.vendor] || 0) + 1; });
    var makers = Object.keys(vendors).length;
    return "Right now " + lead.name + " (" + lead.vendor + ") leads the official Artificial Analysis Intelligence Index at " + lead.score.aa +
      (gap > 0 ? ", " + gap + " points ahead of " + second.name : ", tied with " + second.name) +
      ". The top ten fit inside " + spread + " points and come from " + makers + " different " + (makers === 1 ? "lab" : "labs") +
      ". Perplexity remains the specialist you add for anything that needs sources.";
  }

  /* recommend(taskType, db?) - db defaults to the page's catalog; the API
     passes the live merged copy it serves, so both answer the same. */
  Bench.recommend = function (taskType, dbOverride) {
    var key = this.taskTypes[taskType] ? taskType : "general";
    var base = this.taskTypes[key];
    var metric = LIVE_METRIC[key];
    var db = metric ? (dbOverride && dbOverride.models ? dbOverride : currentDb()) : null;
    if (!db) return base;
    var live = {};
    Object.keys(APP_VENDOR).forEach(function (app) {
      var b = bestOf(APP_VENDOR[app], metric, db);
      if (b) live[app] = b;
    });
    if (Object.keys(live).length < 2) return base;
    var order = base.ranking.map(function (r, i) { return { r: r, i: i }; });
    order.sort(function (a, b) {
      var va = live[a.r.app] ? live[a.r.app].value : -1;
      var vb = live[b.r.app] ? live[b.r.app].value : -1;
      return vb - va || a.i - b.i;
    });
    var out = {};
    for (var k in base) out[k] = base[k];
    out.ranking = order.map(function (o) {
      var r = { app: o.r.app, note: o.r.note };
      if (live[o.r.app]) r.live = live[o.r.app];
      return r;
    });
    out.metric = metric;
    if (key === "general") out.summary = liveSummary(db) || base.summary;
    return out;
  };

  /* The catalog cards, with the two data-driven groups filled from the
     current catalog: the six strongest public models, and the six strongest
     you can download. Each note is built from figures, never typed. */
  Bench.catalogView = function () {
    var db = currentDb();
    function money(n) { return "$" + n; }
    function card(m) {
      var s = m.spec || {};
      var bits = ["AA " + m.score.aa];
      if (typeof m.score.coding === "number") bits.push("coding " + m.score.coding);
      if (s.ctx) bits.push(s.ctx + " context");
      return {
        id: m.id, name: m.name, vendor: m.vendor,
        access: s.priceIn != null && s.priceOut != null ? "API " + money(s.priceIn) + "/" + money(s.priceOut) + " per 1M tokens" + ((m.tags || []).indexOf("free") !== -1 ? " · has a free route" : "") : (m.access || ""),
        note: bits.join(" · ") + (m.auto ? " · added automatically" : "")
      };
    }
    return Bench.catalog.map(function (cat) {
      if (!db || (cat.id !== "frontier" && cat.id !== "open")) return cat;
      var pool = db.models.filter(function (m) {
        return official(m) && m.status === "public" && (cat.id === "frontier" || (m.tags || []).indexOf("open-weights") !== -1);
      }).sort(function (a, b) { return b.score.aa - a.score.aa; }).slice(0, 6);
      var copy = {};
      for (var k in cat) copy[k] = cat[k];
      copy.models = pool.map(card);
      return copy;
    });
  };

  Bench.liveSummary = liveSummary;

  /* The catalog used to carry its own copy of each score, and those copies
     drifted from js/models-db.js within a single refresh - two different
     numbers for the same model, visible on the same screen. Now the notes are
     written without figures and any score shown next to a catalog entry is
     read from the database at render time. One number, one owner. */
  function dbModel(name) {
    var db = currentDb();
    if (!db) return null;
    var want = String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    for (var i = 0; i < db.models.length; i++) {
      var k = db.models[i].name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (k === want) return db.models[i];
    }
    return null;
  }

  function liveScore(name) {
    var m = dbModel(name);
    return m && m.score && typeof m.score.aa === "number" ? m.score.aa : null;
  }

  Bench.liveScore = liveScore;
  Bench.dbModel = dbModel;

  var root = typeof window !== "undefined" ? window : globalThis;
  root.PromptCompassBenchmarks = Bench;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bench;
  }
})();
