/*
 * WhichAI - Plain-language AI glossary (v0.36.0)
 * Content intentionally in English (same policy as prompts/benchmarks).
 * Each term: one-sentence definition + optional everyday example + optional
 * link into the app (a chapter or a tool).
 */
(function () {
  "use strict";

  var TERMS = [
    { id: "ai", term: "AI (artificial intelligence)", def: "Software that performs tasks which normally need human thinking - writing, answering, recognizing images.", ex: "ChatGPT, Claude and Gemini are AI assistants." },
    { id: "ml", term: "Machine learning", def: "The way AI gets its abilities: instead of being programmed rule by rule, it learns patterns from millions of examples.", ex: "A spam filter learns what spam looks like from past emails." },
    { id: "llm", term: "LLM (large language model)", def: "An AI trained on huge amounts of text to predict the next word - which turns out to be enough to write, summarize, translate and code.", ex: "GPT-5.6, Claude Fable 5 and Kimi K3 are LLMs.", link: { hash: "#ranking", label: "Browse the live ranking" } },
    { id: "model", term: "Model", def: "One specific version of an AI, with its own size, skills, price and speed.", ex: "“Gemini 3.5 Flash” and “Gemini 3.1 Pro” are two models from the same company.", link: { hash: "#ranking", label: "See every model, ranked" } },
    { id: "prompt", term: "Prompt", def: "The text you send to an AI: your request plus any instructions and background.", ex: "A good prompt says what you want, for whom, and in what format.", link: { hash: "#prompt", label: "Generate an optimized prompt" } },
    { id: "token", term: "Token", def: "The small chunks of text an AI actually reads and writes - roughly ¾ of a word each; usage and prices are counted in tokens.", ex: "“Unbelievable” may be 3 tokens; 1,000 tokens ≈ 750 words." },
    { id: "context-window", term: "Context window", def: "How much text a model can keep in mind at once - your conversation, documents and its answer all have to fit.", ex: "A 1M-token window fits several long books." },
    { id: "benchmark", term: "Benchmark", def: "A standard test used to compare models - like an exam that every model takes.", ex: "SWE-bench tests real coding; GPQA tests hard science questions.", link: { hash: "#ranking", label: "See benchmark-based rankings" } },
    { id: "inference", term: "Inference", def: "The moment a trained model runs and produces an answer for you (as opposed to training, when it learns).", ex: "Every chat reply is one inference." },
    { id: "training", term: "Training", def: "The expensive phase where a model learns from data - done once by the provider, before you ever use it.", ex: "Models are trained on trillions of words." },
    { id: "hallucination", term: "Hallucination", def: "When an AI states something false with full confidence - it generates plausible text, not verified facts.", ex: "Inventing a book title that does not exist. Always check important facts." },
    { id: "multimodal", term: "Multimodal", def: "A model that handles more than text - images, audio or video, in or out.", ex: "Sending a photo of a menu and asking what is vegetarian." },
    { id: "api", term: "API", def: "The developer doorway to a model: apps send requests and pay per token, instead of using a chat website.", ex: "Apps call models through APIs and pay per token; WhichAI's Market chapter compares those prices.", link: { hash: "#market", label: "Compare API prices" } },
    { id: "api-key", term: "API key", def: "A personal password-like code that lets an app call a model's API on your account.", ex: "Keys like “AIza…” or “sk-or-…”. Keep them private." },
    { id: "fine-tuning", term: "Fine-tuning", def: "Extra training that specializes an existing model on your own examples.", ex: "Teaching a model your company's support style." },
    { id: "rag", term: "RAG (retrieval-augmented generation)", def: "A technique where the AI first looks up relevant documents, then answers using them - fewer hallucinations, real sources.", ex: "Perplexity searches the web, then writes a cited answer." },
    { id: "agent", term: "Agent", def: "An AI that does not just answer once but takes steps toward a goal - browsing, running code, using tools, checking its work.", ex: "“Book me a table” → searches, compares, fills the form.", link: { hash: "#ranking", label: "Rank models by the Agentic index" } },
    { id: "tool-use", term: "Tool use", def: "A model's ability to call external tools - calculator, web search, code runner - instead of guessing.", ex: "Using a real calculator for 847 × 393." },
    { id: "open-weights", term: "Open-weight model", def: "A model whose internal parameters are published, so anyone can download and run it - on their own hardware too.", ex: "Llama, GLM and Inkling are open-weight; GPT-5.6 is not.", link: { hash: "#ranking", label: "Filter open-weight models" } },
    { id: "latency", term: "Latency", def: "How long you wait for an answer to start and finish - separate from how smart the answer is.", ex: "Fast models feel instant; deep-reasoning models can take minutes." },
    { id: "parameter", term: "Parameter", def: "One of the billions of internal numbers a model tunes during training - a rough (imperfect) measure of size.", ex: "Kimi K3 has 2.8 trillion parameters." },
    { id: "embedding", term: "Embedding", def: "A list of numbers representing the meaning of a text, so computers can measure how similar two texts are.", ex: "How search finds “cheap flights” when you type “low-cost airfare”." },
    { id: "reasoning", term: "Reasoning model", def: "A model that “thinks” step by step before answering - slower, but much better at math, logic and hard problems.", ex: "Max-effort modes trade minutes for accuracy." },
    { id: "system-prompt", term: "System prompt", def: "Standing instructions given to a model before the conversation - its role, rules and style.", ex: "“You are a helpful legal assistant. Cite sources.”" },
    { id: "temperature", term: "Temperature", def: "A dial for randomness: low = predictable and precise, high = varied and creative.", ex: "Low for contracts, higher for brainstorming." },
    { id: "byok", term: "BYOK (bring your own key)", def: "A privacy-friendly setup where an app uses your personal API keys, so your data flows only between you and the provider.", ex: "Many coding assistants and chat front-ends accept your own OpenRouter or Gemini key. WhichAI needs no key at all: it reads public data, and what you type stays in your browser.", link: { hash: "#about", label: "How WhichAI handles data" } }
  ];

  var Glossary = {
    TERMS: TERMS,
    /** filter(query) -> matching terms (name + definition + example). */
    filter: function (q) {
      q = (q || "").toLowerCase().trim();
      if (!q) return TERMS;
      return TERMS.filter(function (t) {
        return (t.term + " " + t.def + " " + (t.ex || "")).toLowerCase().indexOf(q) !== -1;
      });
    }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAIGlossary = Glossary;
  if (typeof module !== "undefined" && module.exports) module.exports = Glossary;
})();
