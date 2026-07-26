/*
 * WhichAI - Benchmark dataset, model router & catalog (v0.11.0)
 * Curated snapshot of public leaderboards, translated into plain language.
 * Task rankings are at APP level (the four big assistants people actually open);
 * the catalog covers specific models across the market, grouped by category.
 * Update this file periodically.
 */
(function () {
  "use strict";

  var Bench = {
    updated: "July 26, 2026",

    disclaimer:
      "Snapshot curated from public leaderboards and comparisons. Rankings shift fast - treat this as guidance, not gospel.",

    CONFIDENCE_NOTES: {
      high: "High confidence: direct benchmark coverage exists for this task type.",
      medium: "Medium confidence: based on adjacent benchmarks plus app features.",
      low: "Low confidence: differences between the top models are small for this task."
    },

    apps: {
      claude: {
        label: "Claude",
        vendor: "Anthropic",
        topModel: "Claude Opus 5 / Fable 5 (Pro, $20/mo)",
        freeModel: "Claude Sonnet 5 (usage limits vary by demand)"
      },
      chatgpt: {
        label: "ChatGPT",
        vendor: "OpenAI",
        topModel: "GPT-5.5 / GPT-5.5 Pro (Plus $20/mo, Pro $200/mo)",
        freeModel: "GPT-5.5 (limited messages, then a smaller model)"
      },
      gemini: {
        label: "Gemini",
        vendor: "Google",
        topModel: "Gemini 3.1 Pro (AI Pro, $19.99/mo)",
        freeModel: "Gemini 3.6 Flash (most generous free tier, includes a monthly Deep Research allowance)"
      },
      perplexity: {
        label: "Perplexity",
        vendor: "Perplexity AI",
        topModel: "Sonar Pro + Deep Research, with GPT-5.4 / Opus / Gemini 3.1 Pro inside (Pro, $20/mo)",
        freeModel: "Sonar (unlimited basic cited searches + 5 Pro searches/day)"
      }
    },

    sources: [
      { id: "lmarena", label: "LMArena leaderboard (community head-to-head votes)", url: "https://arena.ai/leaderboard" },
      { id: "swebench", label: "SWE-bench Verified / Pro (real-world coding tasks)", url: "https://llm-stats.com/benchmarks/swe-bench-verified" },
      { id: "aa", label: "Artificial Analysis Intelligence Index", url: "https://artificialanalysis.ai" },
      { id: "tiers", label: "Plans and free-tier comparison (June 2026)", url: "https://www.morphllm.com/comparisons/chatgpt-vs-claude-vs-gemini" },
      { id: "cw", label: "Creative-writing model guide (July 2026)", url: "https://www.buildmvpfast.com/articles/best-llms-2026-guide/creative-writing-ai" },
      { id: "pplx", label: "Perplexity plans, features and Sonar (2026)", url: "https://suprmind.ai/hub/perplexity/pricing/" },
      { id: "open", label: "Open-weight model benchmarks (2026)", url: "https://benchlm.ai/blog/posts/best-chinese-llm" },
      { id: "subs", label: "AI subscription pricing comparison (2026)", url: "https://www.sentisight.ai/ai-price-comparison-gemini-chatgpt-claude-grok/" },
      { id: "aidx", label: "AA Intelligence Index snapshot, July 24, 2026 (BenchLM mirror)", url: "https://benchlm.ai/benchmarks/artificialAnalysis" },
      { id: "opus5", label: "Claude Opus 5 launch coverage (July 24, 2026)", url: "https://www.marktechpost.com/2026/07/24/meet-the-new-claude-opus-5-frontier-class-agentic-coding-and-computer-use-at-unchanged-opus-pricing/" },
      { id: "orfree", label: "OpenRouter free-model list (July 2026)", url: "https://costgoat.com/pricing/openrouter-free-models" },
      { id: "price", label: "Vendor API pricing mirror (July 2026)", url: "https://benchlm.ai/anthropic/api-pricing" }
    ],

    taskTypes: {
      writing: {
        confidence: "high",
        summary:
          "Claude currently produces the most natural-sounding prose, and Anthropic's Fable 5 tops creative-writing benchmarks. ChatGPT is a close second and shines when you want many variants to choose from.",
        ranking: [
          { app: "claude", note: "Best-rated prose: natural voice, subtext and character work (Fable 5 leads creative-writing benchmarks). Its free model, Sonnet 5, is rated the strongest free option for writing quality." },
          { app: "chatgpt", note: "Strong all-rounder: great at brainstorming angles, dialogue variants and turning rough notes into drafts. Canvas mode helps with editing." },
          { app: "gemini", note: "Capable writer with the most generous free tier - good for high-volume everyday writing." },
          { app: "perplexity", note: "Not built for prose - but excellent for gathering cited facts and references before you write." }
        ],
        sourceIds: ["cw", "lmarena", "tiers"]
      },

      coding: {
        confidence: "high",
        summary:
          "It is nearly a tie at the top: Claude leads the toughest real-repo benchmark and LMArena's coding board, and the new Opus 5 leads AA's Agentic Index (55.3, July 24) with computer use at unchanged pricing; GPT-5.6 Sol tops the Coding Agent Index. Kimi K3 debuted #1 on the Frontend Code Arena.",
        ranking: [
          { app: "claude", note: "Leads SWE-bench Pro (uncontaminated, real repositories) at 69.2%, sits at the top of SWE-bench Verified (88.6%), and Fable 5 now leads LMArena's coding board (July 16 snapshot) - strongest at multi-file, real-project work." },
          { app: "chatgpt", note: "Statistically tied on SWE-bench Verified (88.7%); the Codex variant is built specifically for coding workflows." },
          { app: "gemini", note: "Gemini 3.1 Pro long led LMArena's coding arena and stays top-tier in head-to-head developer votes - the July 16 snapshot has Claude Fable 5 ahead." },
          { app: "perplexity", note: "Useful for looking up current docs, APIs and error messages with sources - pair it with a coding model." }
        ],
        sourceIds: ["swebench", "lmarena", "open", "aidx"]
      },

      analysis: {
        confidence: "medium",
        summary:
          "The top models are close on reasoning. Claude leads the overall intelligence index, Gemini 3.1 Pro leads several reasoning boards, and ChatGPT has the most mature built-in tools for uploaded data files.",
        ranking: [
          { app: "claude", note: "Holds the top two spots on the July 24 AA snapshot (Opus 5 = 60.7, Fable 5 = 59.9) with careful, assumption-stating reasoning - a good default for rigorous analysis." },
          { app: "gemini", note: "Leads several reasoning benchmarks and handles very long documents well." },
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
          { app: "perplexity", note: "Best-in-class citations on every answer; free tier has unlimited basic searches, Pro adds Deep Research (20/day) and frontier models inside." },
          { app: "gemini", note: "Deep Research with a monthly allowance even on the free tier, plus tight Google Search integration." },
          { app: "claude", note: "Very large context and up to 128K tokens of output in one pass - best for summarizing long documents you paste in." },
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
          "The top tier has never been closer - the top ten sit within about 28 Elo points on LMArena (July 16 update). Claude holds #1 overall, GPT-5.6 is right behind, and the July surprise Kimi K3 joined the leaders; Perplexity is the specialist you add for anything that needs sources.",
        ranking: [
          { app: "claude", note: "The new Opus 5 (July 24) tops the AA snapshot at 60.7 with Fable 5 right behind (59.9): Anthropic holds the top two spots. GPT-5.6 Sol follows (58.9) and stays the value pick for agentic work; Moonshot's Kimi K3 (57.1) remains the closest outside challenger." },
          { app: "chatgpt", note: "A hair behind on aggregate scores, and the most complete all-round app." },
          { app: "gemini", note: "Close third, with the most generous free tier of the three." },
          { app: "perplexity", note: "Not a generalist - but the first stop whenever the answer must be current and cited." }
        ],
        sourceIds: ["lmarena", "aa", "aidx", "tiers"]
      }
    },

    /* ---------------- Model catalog: who's who on the market ---------------- */

    catalog: [
      {
        id: "frontier",
        label: "Frontier flagships",
        blurb: "The most capable models on the market - paid tiers, overkill for simple tasks, unbeatable for hard ones.",
        models: [
          { name: "Claude Opus 4.8", vendor: "Anthropic", access: "Claude Pro ($20/mo); limited on free tier", note: "#1 on LMArena overall, top-3 on the Artificial Analysis index (56); leads real-repo coding (SWE-bench Pro 69.2%)." },
          { name: "GPT-5.5 Pro", vendor: "OpenAI", access: "ChatGPT Pro ($200/mo); standard GPT-5.5 on Plus ($20/mo)", note: "OpenAI's maximum-reasoning tier, statistically tied with Opus on many boards - and the new GPT-5.6 series (Sol/Terra/Luna, July 9) sits one point behind Fable 5 at max effort - Sol leads the Coding Agent Index." },
          { name: "Gemini 3.1 Pro", vendor: "Google", access: "Google AI Pro ($19.99/mo); also inside Perplexity Pro", note: "#1 in LMArena's coding arena, top-tier reasoning, deep Google Workspace integration." },
          { name: "Claude Opus 5", vendor: "Anthropic", access: "Claude Pro / Max plans · API $5/$25 per 1M", note: "July 24: the new overall #1 (AA 60.7; Agentic Index 55.3) with 1M context, default thinking and computer use at unchanged Opus pricing." },
          { name: "Claude Fable 5", vendor: "Anthropic", access: "Claude Pro / Max plans · API $10/$50 per 1M", note: "Purpose-built for creative work - tops creative-writing benchmarks; #2 overall (59.9) behind its new sibling Opus 5." },
          { name: "Kimi K3", vendor: "Moonshot AI", access: "API $3/$15 per 1M · open weights announced for July 27", note: "July 16 surprise: 2.8T-parameter MoE, 1M context, native vision - #3 on the AA index (57.1), best published BrowseComp (91.2%), #1 Frontend Code Arena at launch." }
        ]
      },
      {
        id: "everyday",
        label: "Everyday workhorses",
        blurb: "Fast, capable defaults - what you actually talk to most of the time, often free.",
        models: [
          { name: "GPT-5.5", vendor: "OpenAI", access: "Free (limited messages); higher limits on Plus ($20/mo) or Go (~$8/mo)", note: "The strongest broad generalist; excellent brainstorming and drafting." },
          { name: "GPT-5.4", vendor: "OpenAI", access: "Plus ($20/mo); also inside Perplexity Pro", note: "The previous flagship, still very strong - a reliable known quantity." },
          { name: "Claude Sonnet 5", vendor: "Anthropic", access: "Free tier of claude.ai", note: "Rated the strongest free option for writing and coding quality." },
          { name: "Claude Sonnet 4.6", vendor: "Anthropic", access: "Claude Pro ($20/mo)", note: "The balanced default of the Claude line - near-flagship quality with higher limits." },
          { name: "Claude Haiku 4.5", vendor: "Anthropic", access: "All Claude tiers; cheapest Claude via API", note: "Fastest and cheapest of the line - quick answers, light tasks, high volume." },
          { name: "Gemini 3.6 Flash", vendor: "Google", access: "Free (the most generous free tier around)", note: "July 21 refresh of the free workhorse (AA 50.1): cheaper output than 3.5 Flash, 1M context, free Deep Research allowance included." }
        ]
      },
      {
        id: "search",
        label: "Search & research assistants",
        blurb: "Built around live web search with citations - the right tool when the answer must be current and sourced.",
        models: [
          { name: "Perplexity Sonar", vendor: "Perplexity AI", access: "Free: unlimited basic cited searches + 5 Pro searches/day", note: "Best-in-class citation accuracy - a smarter, cited replacement for googling." },
          { name: "Perplexity Pro (Sonar Pro + Deep Research)", vendor: "Perplexity AI", access: "$20/mo", note: "Unlimited Pro Search, 20 Deep Research runs/day, plus GPT-5.4, Opus and Gemini 3.1 Pro selectable inside." },
          { name: "Gemini Deep Research", vendor: "Google", access: "Monthly allowance on the free tier; more on AI Pro", note: "Long autonomous research reports generated inside Gemini." }
        ]
      },
      {
        id: "ecosystem",
        label: "Ecosystem assistants",
        blurb: "Assistants bundled into platforms you may already use - often the shortest path to a good answer.",
        models: [
          { name: "Grok 4.1", vendor: "xAI", access: "Free tier on X / grok.com; paid from ~$16/mo", note: "Direct, up-to-the-minute answers with X data, a Think mode and a 2M-token context; among the lowest measured hallucination rates." },
          { name: "Copilot", vendor: "Microsoft", access: "Free tier; Copilot Pro $20/mo; built into Windows and Office", note: "GPT-5-family models woven into Word, Excel, PowerPoint, Teams and Windows - best when your work lives in Microsoft 365." },
          { name: "Meta AI", vendor: "Meta", access: "Free - meta.ai web app and inside WhatsApp, Instagram, Messenger", note: "Llama-powered and always at hand inside Meta's apps, with real-time info via search integration." }
        ]
      },
      {
        id: "open",
        label: "Open-weight models",
        blurb: "Downloadable and cheap or free to run via hosts like Groq and OpenRouter - a step below the frontier, and closing fast.",
        models: [
          { name: "GLM-5.2", vendor: "Z.ai", access: "Open weights; low-cost API hosts", note: "Best open-weight coder (SWE-bench Pro 62.1%) and the top open-weight score on the July 16 AA snapshot (51.1) - a genuine frontier challenger." },
          { name: "Kimi K2.6", vendor: "Moonshot AI", access: "Open weights; API hosts", note: "Strong open all-rounder (AA 44.2 on the July 16 rebased snapshot; SWE-bench Verified 80.2%) - now overshadowed by its flagship sibling K3." },
          { name: "Nemotron 3 Ultra", vendor: "NVIDIA", access: "FREE on OpenRouter; open weights on Hugging Face", note: "Extremely fast US open model (AA 37.8 on the July 16 rebased snapshot; 400+ tokens/second on some hosts) - still free on OpenRouter." },
          { name: "Llama 4", vendor: "Meta", access: "Free tier on Groq (near-instant)", note: "The classic open workhorse - great for fast drafts and iteration." },
          { name: "DeepSeek V4", vendor: "DeepSeek", access: "Free chat app; open weights", note: "Solid open reasoning (V4 Pro at AA 44.3 on the July 16 snapshot); the most popular free alternative worldwide - currently no free OpenRouter route." },
          { name: "Qwen 3.7 Max", vendor: "Alibaba", access: "Free chat app · API; open weights for smaller Qwen tiers", note: "Alibaba's strongest line (AA 46.0) for coding and multilingual work; Qwen3 Coder remains the best free coding route on OpenRouter." },
          { name: "Inkling", vendor: "Thinking Machines Lab", access: "Open weights (Apache 2.0) on Hugging Face · Tinker API", note: "July 15 debut: 975B-parameter multimodal MoE (41B active), 1M context - the new leading US open-weights base for customization (AA 40.7)." }
        ]
      }
    ],

    /** recommend(taskType) -> recommendation object (falls back to "general"). */
    recommend: function (taskType) {
      return this.taskTypes[taskType] || this.taskTypes.general;
    }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.PromptCompassBenchmarks = Bench;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bench;
  }
})();
