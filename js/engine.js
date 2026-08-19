/*
 * WhichAI (formerly PromptCompass) - Prompt Engine (v0.21.0)
 * v0.21: goal decomposition (audience & constraints), per-task workflow phases,
 * final self-check - richer prompts, same meaning, still zero network calls.
 * Pure client-side template engine. No network calls, no API keys.
 * Exposed as window.PromptCompassEngine (browser) and module.exports (Node, for tests).
 */
(function () {
  "use strict";

  var VERSION = "0.21.0";

  /* ---------------------------------------------------------------- *
   *  Task types: each defines a role and task-specific quality rules  *
   * ---------------------------------------------------------------- */

  var TASK_ORDER = [
    "writing",
    "coding",
    "analysis",
    "research",
    "brainstorming",
    "education",
    "business",
    "general"
  ];

  var TASK_TYPES = {
    writing: {
      label: "Writing & content",
      role: "an expert writer and editor",
      guidance: [
        "Match tone and style to the audience described.",
        "Structure the piece with a clear opening, body and closing.",
        "Prefer concrete language; avoid filler phrases and cliches.",
        "After drafting, review the text once and tighten it before finalizing."
      ]
    },
    coding: {
      label: "Coding & development",
      role: "a senior software engineer",
      guidance: [
        "Write complete, runnable code with no placeholders or omitted sections.",
        "Handle edge cases and errors explicitly.",
        "Briefly explain key design decisions after the code.",
        "If requirements are ambiguous, state your assumptions before coding."
      ]
    },
    analysis: {
      label: "Analysis & data",
      role: "a rigorous data analyst",
      guidance: [
        "State your assumptions explicitly before the analysis.",
        "Show the reasoning behind each conclusion, not just the result.",
        "Quantify uncertainty where possible and flag weak evidence.",
        "End with a short summary of key findings and their limitations."
      ]
    },
    research: {
      label: "Research & summarization",
      role: "a careful research assistant",
      guidance: [
        "Distinguish clearly between established facts and interpretation.",
        "Note where information may be incomplete or contested.",
        "Organize findings by theme, not by source.",
        "End with open questions worth investigating further."
      ]
    },
    brainstorming: {
      label: "Brainstorming & ideas",
      role: "a creative strategist",
      guidance: [
        "Generate at least 10 distinct ideas before evaluating any of them.",
        "Mix safe, expected ideas with bold, unconventional ones.",
        "Do not self-censor or filter ideas early.",
        "After the list, mark the 3 most promising ideas and explain why."
      ]
    },
    education: {
      label: "Education & explanation",
      role: "a patient expert teacher",
      guidance: [
        "Adapt the explanation to the learner's level described in the context.",
        "Use one concrete analogy or example per key concept.",
        "Build from simple to complex; define terms on first use.",
        "End with 2-3 short questions to check understanding."
      ]
    },
    business: {
      label: "Business & marketing",
      role: "an experienced business strategist",
      guidance: [
        "Anchor every recommendation to the stated objective and audience.",
        "Make the key message explicit and easy to repeat.",
        "Include a clear call to action or next step.",
        "Prefer measurable suggestions over vague advice."
      ]
    },
    general: {
      label: "General / other",
      role: "a knowledgeable, precise assistant",
      guidance: [
        "Address the goal directly before adding secondary information.",
        "Be specific and concrete; avoid generic filler.",
        "If the request is ambiguous, state the interpretation you chose."
      ]
    }
  };

  /* -------------------------------------------- *
   *  Delivery options (format / length / tone)    *
   * -------------------------------------------- */

  var FORMATS = {
    none: null,
    prose: "well-structured plain prose",
    markdown: "clean Markdown with headings",
    bullets: "concise bullet points",
    table: "a table with clearly labeled columns",
    json: "valid JSON only, with no text outside the JSON",
    code: "code, with brief comments where non-obvious"
  };

  var LENGTHS = {
    none: null,
    short: "Keep the answer short: the most concise version that fully completes the task.",
    medium: "Aim for a focused, moderately detailed answer.",
    long: "Be thorough and detailed: cover nuances, edge cases and practical implications."
  };

  var TONES = {
    none: null,
    professional: "professional and polished",
    friendly: "friendly and approachable",
    casual: "casual and conversational",
    persuasive: "persuasive and confident",
    academic: "precise and academic"
  };

  var LANGUAGE_RULE =
    "Answer in the same language as the task description, unless the task itself asks for a different language.";


  /* -------------------------------------------- *
   *  v0.21: goal decomposition & task workflows   *
   * -------------------------------------------- */

  // Three working phases per task type - injected into every prompt as an
  // explicit approach, so models decompose the job instead of answering flat.
  var WORKFLOWS = {
    writing: ["map the sharpest angle and outline the structure", "write the complete draft following the outline", "revise for flow, tightness and a strong opening and closing"],
    coding: ["define inputs, outputs, edge cases and the approach", "implement complete, runnable code", "review the code against the edge cases and add tests or a test plan"],
    analysis: ["frame the key questions, data and assumptions", "run the analysis, showing the reasoning behind each conclusion", "summarize findings with their limitations"],
    research: ["break the topic into the questions that matter", "answer each question, separating established facts from interpretation", "synthesize everything into a brief with open questions"],
    brainstorming: ["generate a wide, unfiltered range of ideas", "evaluate them against the goal", "develop the strongest ideas into concrete form"],
    education: ["map the concepts in the right learning order", "explain each with one concrete analogy or example", "check understanding with a few graded questions"],
    business: ["clarify the objective, audience and what success looks like", "compare distinct options with pros and cons", "turn the best option into an actionable plan"],
    general: ["plan the steps needed", "execute the plan fully", "review the result against the goal and fix gaps"]
  };

  var SELF_CHECK =
    "Before finalizing, re-read the requirements above and fix anything that does not fully meet them.";

  function approachSteps(taskKey) {
    var w = WORKFLOWS[taskKey] || WORKFLOWS.general;
    return w.slice();
  }

  /**
   * goalMeta(input) -> { audience, constraints[] }
   * Light heuristics (EN + IT) that surface what the goal already says -
   * never inventing new intent, only making implicit details explicit.
   */
  function goalMeta(input) {
    var text = (input.goal || "") + ". " + (input.context || "");
    var audience = null;
    var am = text.match(/\b(?:aimed at|targeting|intended for|audience[:=]?|for an audience of|rivolto a|destinato a|per un pubblico di)\s+([^,.;:\n]{3,70})/i);
    if (am) audience = am[1].trim();
    var constraints = [];
    text.split(/[.;\n]+/).forEach(function (seg) {
      var t = seg.trim();
      if (!t || t.length < 8 || t.length > 140) return;
      if (constraints.length >= 3) return;
      if (/\b(must|should not|shouldn't|avoid|without|only|no more than|at most|at least|under|within|max|min|budget|deadline|due by|entro|senza|solo|al massimo|almeno|non deve|evita|massimo|minimo)\b/i.test(t) || /\b\d+\s?(words|characters|steps|items|minutes|hours|days|%|€|\$|parole|caratteri|passi|minuti|ore|giorni)\b/i.test(t)) {
        constraints.push(t);
      }
    });
    return { audience: audience, constraints: constraints };
  }

  // Extra requirement lines derived from the goal itself (safe: no new intent).
  function metaLines(input) {
    var m = goalMeta(input);
    var lines = [];
    if (m.audience) lines.push("Write specifically for this audience: " + m.audience + ".");
    if (m.constraints.length) lines.push("Treat these as hard constraints from the goal: " + m.constraints.join(" · ") + ".");
    return lines;
  }

  function qualityLines(task) {
    return task.guidance.slice();
  }

  function deliveryLines(input) {
    var lines = [];
    var fmt = FORMATS[input.format];
    if (fmt) lines.push("Deliver the answer as " + fmt + ".");
    var len = LENGTHS[input.length];
    if (len) lines.push(len);
    var tone = TONES[input.tone];
    if (tone) lines.push("Use a " + tone + " tone.");
    lines.push(LANGUAGE_RULE);
    return lines;
  }

  /* -------------------------------------------- *
   *  Per-model prompt builders                    *
   * -------------------------------------------- */

  // Claude (Anthropic): XML-tagged sections, explicit role and criteria.
  function buildClaude(input, task) {
    var p = [];
    p.push("You are " + task.role + ".");
    p.push("");
    if (input.context) {
      p.push("<context>");
      p.push(input.context);
      p.push("</context>");
      p.push("");
    }
    p.push("<task>");
    p.push(input.goal);
    p.push("</task>");
    p.push("");
    p.push("<approach>");
    approachSteps(input.taskType).forEach(function (st, i) {
      p.push((i + 1) + ". " + st.charAt(0).toUpperCase() + st.slice(1) + ".");
    });
    p.push("</approach>");
    p.push("");
    p.push("<requirements>");
    metaLines(input).concat(qualityLines(task)).concat(deliveryLines(input)).forEach(function (l) {
      p.push("- " + l);
    });
    p.push("</requirements>");
    p.push("");
    p.push(
      "Think through the task carefully before writing your final answer, following the phases in <approach>. " +
        "If important information is missing, state the assumptions you are making instead of guessing silently. " +
        SELF_CHECK
    );
    return p.join("\n");
  }

  // ChatGPT (OpenAI): Markdown sections, numbered requirements, clarifying questions.
  function buildChatGPT(input, task) {
    var p = [];
    p.push("You are " + task.role + ".");
    p.push("");
    p.push("## Task");
    p.push(input.goal);
    if (input.context) {
      p.push("");
      p.push("## Context");
      p.push(input.context);
    }
    p.push("");
    p.push("## Approach");
    approachSteps(input.taskType).forEach(function (st, i) {
      p.push((i + 1) + ". " + st.charAt(0).toUpperCase() + st.slice(1) + ".");
    });
    p.push("");
    p.push("## Requirements");
    metaLines(input).concat(qualityLines(task)).concat(deliveryLines(input)).forEach(function (l, i) {
      p.push(i + 1 + ". " + l);
    });
    p.push("");
    p.push(
      "Work through the approach phases in order. If any part of the task is ambiguous, ask me a clarifying question before answering; " +
        "otherwise, deliver the complete result directly. " + SELF_CHECK
    );
    return p.join("\n");
  }

  // Gemini (Google): Persona / Task / Context / Format structure.
  function buildGemini(input, task) {
    var p = [];
    p.push("Persona: You are " + task.role + ".");
    p.push("");
    p.push("Task:");
    p.push(input.goal);
    if (input.context) {
      p.push("");
      p.push("Context:");
      p.push(input.context);
    }
    p.push("");
    p.push("Approach:");
    approachSteps(input.taskType).forEach(function (st, i) {
      p.push((i + 1) + ". " + st.charAt(0).toUpperCase() + st.slice(1) + ".");
    });
    p.push("");
    p.push("Requirements:");
    metaLines(input).concat(qualityLines(task)).forEach(function (l) {
      p.push("- " + l);
    });
    p.push("");
    p.push("Format:");
    deliveryLines(input).forEach(function (l) {
      p.push("- " + l);
    });
    p.push("");
    p.push(
      "Be specific and concrete. If key information is missing, state your assumptions explicitly at the start of your answer. " + SELF_CHECK
    );
    return p.join("\n");
  }

  // Llama (Meta, via Groq): tight Markdown structure, no meta-commentary.
  function buildLlama(input, task) {
    var p = [];
    p.push("You are " + task.role + ".");
    p.push("");
    p.push("## Task");
    p.push(input.goal);
    if (input.context) {
      p.push("");
      p.push("## Context");
      p.push(input.context);
    }
    p.push("");
    p.push("## Approach");
    approachSteps(input.taskType).forEach(function (st, i) {
      p.push((i + 1) + ". " + st.charAt(0).toUpperCase() + st.slice(1) + ".");
    });
    p.push("");
    p.push("## Requirements");
    metaLines(input).concat(qualityLines(task)).concat(deliveryLines(input)).forEach(function (l, i) {
      p.push(i + 1 + ". " + l);
    });
    p.push("");
    p.push(
      "Follow the approach phases in order and the requirements exactly. Do not add disclaimers, introductions or meta-commentary - deliver the answer directly. " +
        "If key information is missing, state your assumptions in one line, then answer. " + SELF_CHECK
    );
    return p.join("\n");
  }

  // Perplexity: search-first - lead with the task, demand citations and recency.
  function buildPerplexity(input, task) {
    var p = [];
    p.push(input.goal);
    if (input.context) {
      p.push("");
      p.push("Context:");
      p.push(input.context);
    }
    p.push("");
    p.push("Instructions:");
    p.push("- Cite sources for every substantive claim, with links.");
    p.push("- Prefer recent, authoritative sources and note the date of key facts.");
    p.push("- Approach: " + approachSteps(input.taskType).map(function (st, i) { return (i + 1) + ") " + st; }).join("; ") + ".");
    metaLines(input).concat(qualityLines(task)).concat(deliveryLines(input)).forEach(function (l) {
      p.push("- " + l);
    });
    p.push("");
    p.push(
      "If your sources disagree, say so explicitly and present the strongest version of each side instead of blending them. " + SELF_CHECK
    );
    return p.join("\n");
  }

  /* -------------------------------------------- *
   *  Model registry with "why it works" notes     *
   * -------------------------------------------- */

  var MODEL_ORDER = ["claude", "chatgpt", "gemini", "perplexity", "grok", "copilot", "meta", "llama", "glm", "kimi", "nemotron", "deepseek", "qwen"];

  var MODELS = {
    claude: {
      label: "Claude",
      vendor: "Anthropic",
      build: buildClaude,
      why: [
        "Anthropic's own guidance recommends XML tags like <context>, <task> and <requirements>: Claude is trained to treat them as reliable section boundaries, so instructions never get mixed up with content.",
        "A first-line role (\"You are...\") reliably shifts Claude's expertise, vocabulary and tone toward the domain.",
        "Claude follows explicit quality criteria well, and asking it to state assumptions reduces silent guessing on ambiguous goals."
      ]
    },
    chatgpt: {
      label: "ChatGPT",
      vendor: "OpenAI",
      build: buildChatGPT,
      why: [
        "GPT models are tuned on Markdown-heavy data: ## headings act as clear delimiters between task, context and requirements.",
        "A numbered requirements list improves instruction-following and lets you reference items later (\"redo it, but relax point 3\").",
        "Inviting clarifying questions uses ChatGPT's conversational tuning and avoids confident answers built on wrong guesses."
      ]
    },
    gemini: {
      label: "Gemini",
      vendor: "Google",
      build: buildGemini,
      why: [
        "Google's prompting guide is built on four components - Persona, Task, Context, Format - so this prompt mirrors exactly the structure Gemini is optimized for.",
        "Short, directive sentences work better with Gemini than long nested instructions.",
        "Asking Gemini to surface its assumptions up front counters its tendency to fill information gaps without flagging them."
      ]
    },
    llama: {
      label: "Llama",
      vendor: "Meta · via Groq",
      build: buildLlama,
      why: [
        "Open models like Llama respond best to explicit, tightly structured Markdown instructions - ambiguity degrades their output faster than on the frontier closed models.",
        "A direct \"no meta-commentary\" closing counters open models' tendency to add disclaimers and filler around the answer.",
        "Running on Groq's free tier, Llama replies near-instantly - great for fast iteration and drafts, with quality a step below the frontier three."
      ]
    },
    perplexity: {
      label: "Perplexity",
      vendor: "Perplexity AI",
      build: buildPerplexity,
      why: [
        "Perplexity runs a live web search for every answer: leading with the task itself (not a long role preamble) keeps the retrieval focused on what you actually need.",
        "Explicitly asking for citations and recent, authoritative sources steers both the search and the answer - it is what Perplexity does best.",
        "Asking it to flag disagreements between sources counters the tendency of search-based answers to blend conflicting information into one confident claim."
      ]
    },
    glm: {
      label: "GLM",
      vendor: "Z.ai · open",
      build: buildLlama,
      why: [
        "GLM-5.2 is the strongest open-weight coder (leads SWE-bench Pro among open models): precise, structured specs pay off more here than on chatty assistants.",
        "Open models follow tight Markdown instructions best - ambiguity degrades their output faster than on the frontier closed models.",
        "The direct no-meta-commentary closing keeps answers on point; open models tend to add filler around the answer."
      ]
    },
    kimi: {
      label: "Kimi",
      vendor: "Moonshot AI · open",
      build: buildLlama,
      why: [
        "Kimi K2.6 tops the open-weight intelligence indexes and is tuned for long, multi-part agentic tasks - numbered requirements map cleanly onto that.",
        "Explicit structure and delivery constraints matter more on open models than on frontier assistants.",
        "A direct closing instruction counters filler and disclaimers."
      ]
    },
    nemotron: {
      label: "Nemotron",
      vendor: "NVIDIA · open",
      build: buildLlama,
      why: [
        "Nemotron 3 Ultra is reasoning-tuned and extremely fast (400+ tokens/second on some hosts, free via OpenRouter) - ideal for quick iterations on a tight, explicit prompt.",
        "Like other open models, it rewards unambiguous Markdown structure with numbered requirements.",
        "Direct, no-preamble instructions keep its speed advantage from being spent on filler."
      ]
    },
    grok: {
      label: "Grok",
      vendor: "xAI",
      build: buildChatGPT,
      why: [
        "Grok is tuned for candid, direct answers with real-time access to X data and a huge 2M-token context - Markdown structure with numbered requirements keeps it focused.",
        "Explicit tone instructions matter more than usual: by default Grok leans irreverent, so state the register you want.",
        "It measures among the lowest hallucination rates of the frontier assistants - inviting clarifying questions plays to that carefulness."
      ]
    },
    copilot: {
      label: "Copilot",
      vendor: "Microsoft",
      build: buildChatGPT,
      why: [
        "Copilot runs on OpenAI GPT-5-family models, so it responds to the same Markdown structure ChatGPT does.",
        "It shines inside the Microsoft ecosystem: name the Office file, app or work context explicitly in your prompt.",
        "Numbered requirements and an explicit output section help it produce work-document-ready answers."
      ]
    },
    meta: {
      label: "Meta AI",
      vendor: "Meta",
      build: buildLlama,
      why: [
        "Meta AI runs on Llama models, so the same tight open-model structure applies: explicit Markdown and numbered requirements.",
        "It is free inside WhatsApp, Instagram and the meta.ai web app - keep prompts self-contained, since its chat-context features are thinner.",
        "The no-meta-commentary closing counters filler, which Llama-family models are prone to."
      ]
    },
    deepseek: {
      label: "DeepSeek",
      vendor: "DeepSeek · open",
      build: buildLlama,
      why: [
        "DeepSeek's reasoning-first models do their best work when requirements are explicit and verifiable - structure pays off on hard problems.",
        "The free app and open weights make it the most accessible strong reasoner worldwide.",
        "A direct closing keeps answers lean - its reasoning mode can otherwise over-explain."
      ]
    },
    qwen: {
      label: "Qwen",
      vendor: "Alibaba · open",
      build: buildLlama,
      why: [
        "Qwen follows strict Markdown instructions well and is notably strong multilingually - state the output language explicitly.",
        "It is among the top open-weight lines for coding and general tasks; explicit specs narrow the gap with frontier models.",
        "The direct closing counters boilerplate and disclaimers."
      ]
    }
  };

  /* -------------------------------------------- *
   *  Task type auto-detection (EN + IT keywords)  *
   * -------------------------------------------- */

  var DETECT_KEYWORDS = {
    writing: ["write", "draft", "rewrite", "blog", "article", "email", "newsletter", "headline", "essay", "letter", "caption", "post", "scrivi", "scrivere", "riscrivi", "articolo", "testo", "titolo", "bozza", "lettera", "descrizione"],
    coding: ["code", "coding", "script", "function", "debug", "bug", "fix", "python", "javascript", "typescript", "sql", "html", "css", "api", "regex", "refactor", "program", "develop", "website", "webapp", "app", "react", "vue", "angular", "node", "java", "rust", "golang", "component", "endpoint", "unit test", "algorithm", "compile", "docker", "repository", "codice", "funzione", "errore", "sviluppa", "programma", "sito"],
    analysis: ["analyze", "analyse", "analysis", "data", "dataset", "csv", "excel", "chart", "metrics", "statistics", "trend", "forecast", "kpi", "analizza", "analisi", "dati", "statistiche", "grafico", "metriche", "previsione", "confronta"],
    research: ["research", "summarize", "summarise", "summary", "sources", "literature", "investigate", "overview", "ricerca", "riassumi", "riassunto", "sintesi", "fonti", "approfondisci", "panoramica"],
    brainstorming: ["brainstorm", "ideas", "options", "alternatives", "suggestions", "concepts", "names", "name ideas", "idee", "nomi", "proposte", "alternative", "spunti"],
    education: ["explain", "teach", "learn", "understand", "lesson", "tutorial", "course", "beginner", "spiega", "spiegami", "insegna", "insegnami", "impara", "capire", "lezione", "principiante"],
    business: ["marketing", "strategy", "business", "customers", "sales", "pricing", "launch", "brand", "campaign", "market", "pitch", "clienti", "vendite", "prezzo", "prezzi", "lancio", "mercato", "campagna", "strategia"]
  };

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * detectTaskType(text) -> task type key.
   * Counts distinct keyword hits per type (word-boundary, case-insensitive).
   * Ties resolve to the type listed first in TASK_ORDER; no hits -> "general".
   */
  function detectTaskType(text) {
    var t = (text || "").toLowerCase();
    var best = "general";
    var bestScore = 0;
    TASK_ORDER.forEach(function (type) {
      var kws = DETECT_KEYWORDS[type];
      if (!kws) return;
      var score = 0;
      kws.forEach(function (kw) {
        var re = new RegExp("\\b" + escapeRegExp(kw) + "\\b", "i");
        if (re.test(t)) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = type;
      }
    });
    return best;
  }

  /* -------------------------------------------- *
   *  Public API                                   *
   * -------------------------------------------- */

  /**
   * generate(input) -> array of result objects
   * input: {
   *   goal: string (required),
   *   context: string,
   *   taskType: key of TASK_TYPES, or "auto" (default "general"),
   *   format: key of FORMATS (default "none"),
   *   length: key of LENGTHS (default "none"),
   *   tone: key of TONES (default "none"),
   *   models: array of model ids (default: all)
   * }
   */
  function generate(rawInput) {
    var input = {
      goal: (rawInput.goal || "").trim(),
      context: (rawInput.context || "").trim(),
      taskType: rawInput.taskType || "general",
      format: rawInput.format || "none",
      length: rawInput.length || "none",
      tone: rawInput.tone || "none",
      models: rawInput.models && rawInput.models.length ? rawInput.models : MODEL_ORDER.slice()
    };

    if (!input.goal) {
      throw new Error("A goal is required to generate prompts.");
    }

    if (input.taskType === "auto") {
      input.taskType = detectTaskType(input.goal + " " + input.context);
    }

    var task = TASK_TYPES[input.taskType] || TASK_TYPES.general;

    return MODEL_ORDER.filter(function (id) {
      return input.models.indexOf(id) !== -1;
    }).map(function (id) {
      var model = MODELS[id];
      var prompt = model.build(input, task);
      return {
        id: id,
        label: model.label,
        vendor: model.vendor,
        prompt: prompt,
        why: model.why.slice(),
        chars: prompt.length,
        words: prompt.trim().split(/\s+/).length
      };
    });
  }

  var Engine = {
    VERSION: VERSION,
    TASK_ORDER: TASK_ORDER,
    TASK_TYPES: TASK_TYPES,
    MODEL_ORDER: MODEL_ORDER,
    MODELS: MODELS,
    detectTaskType: detectTaskType,
    WORKFLOWS: WORKFLOWS,
    goalMeta: goalMeta,
    generate: generate
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.PromptCompassEngine = Engine;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Engine;
  }
})();
