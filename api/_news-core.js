/*
 * WhichAI - the news wire for the Model Radar (v0.36.0)
 *
 * The Radar used to know two things: the notes written by hand and the models
 * OpenRouter lists. A launch announced on a lab's blog reached it only once a
 * route existed. This module reads the public sources that announce things
 * first and turns them into one short, dated, de-duplicated list:
 *
 *   labs       OpenAI, Google DeepMind, Mistral AI       (official RSS)
 *   press      TechCrunch AI                              (RSS, AI names only)
 *   community  Hacker News, stories with 100+ points     (Algolia search API)
 *   open       Hugging Face blog + trending models        (RSS + public JSON API)
 *
 * All free, keyless, no account. Only titles, links, dates and a score are
 * kept: the text belongs to its publishers and the Radar links to it.
 * A source that is down, slow or malformed is skipped and reported; it never
 * takes the others with it.
 */
"use strict";

const UA = "WhichAI-news (+https://whichai.wiki)";
const DAY = 86400000;
const WINDOW_DAYS = 45;
const TTL_MS = 30 * 60 * 1000;

const SOURCES = [
  { id: "openai", name: "OpenAI", kind: "lab", type: "rss", url: "https://openai.com/news/rss.xml", max: 6, skipStories: true },
  { id: "deepmind", name: "Google DeepMind", kind: "lab", type: "rss", url: "https://deepmind.google/blog/rss.xml", max: 6 },
  { id: "mistral", name: "Mistral AI", kind: "lab", type: "rss", url: "https://mistral.ai/news/rss", max: 4 },
  { id: "techcrunch", name: "TechCrunch AI", kind: "press", type: "rss", url: "https://techcrunch.com/category/artificial-intelligence/feed/", max: 8, aiNamesOnly: true },
  { id: "hn", name: "Hacker News", kind: "community", type: "hn", max: 8 },
  { id: "hf-blog", name: "Hugging Face blog", kind: "open", type: "rss", url: "https://huggingface.co/blog/feed.xml", max: 4 },
  { id: "hf-trending", name: "Hugging Face trending", kind: "open", type: "hf", url: "https://huggingface.co/api/models?sort=trendingScore&limit=40", max: 6 }
];

const HN_QUERIES = ["OpenAI", "Anthropic", "Gemini", "LLM", "DeepSeek", "Mistral", "Qwen", "open weights"];

/* Customer stories ("Acme cuts costs 40% with ChatGPT") outnumber launches on
   some lab feeds ten to one. A launch is what the Radar is for. */
const STORY = /^(how\s+)?[A-Z0-9][\w&.'’-]*(\s+[A-Z0-9][\w&.'’-]*){0,2}\s+(cuts|turns|halves|saves|helps|uses|scales|transforms|powers|builds|reduces|boosts|accelerates|brings|gives|lets|doubles|triples|speeds)\b|\bwith (OpenAI|ChatGPT|Codex)\b/;
const AI_NAMES = /\b(OpenAI|ChatGPT|GPT|Anthropic|Claude|Google|Gemini|DeepMind|Gemma|Meta|Llama|Muse|Mistral|DeepSeek|Qwen|Alibaba|Kimi|Moonshot|Zhipu|GLM|xAI|Grok|Nvidia|Nemotron|Microsoft|Copilot|Perplexity|Hugging Face|open[- ]source|open[- ]weights?|LLMs?|frontier|AI model|model)\b/i;
const LLM_PIPELINES = { "text-generation": 1, "image-text-to-text": 1, "any-to-any": 1, "text2text-generation": 1 };

/* ---------- text hygiene: upstream text ends up in the page ---------- */

function decode(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&(quot|apos|#39|lt|gt|nbsp|amp);/g, (_, e) => ({ quot: '"', apos: "'", "#39": "'", lt: "<", gt: ">", nbsp: " ", amp: "&" })[e]);
}
function safeChar(n) { return n > 31 && n < 0x110000 ? String.fromCodePoint(n) : " "; }
function clean(s, max) {
  return decode(s).replace(/<[^>]*>/g, " ").replace(/[<>\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max || 200);
}
function httpsUrl(u) {
  const s = String(u || "").trim();
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s) || s.length > 400 || /[\s<>"']/.test(s)) return null;
  return s;
}
function isoDate(s) {
  const t = Date.parse(String(s || "").trim());
  return isFinite(t) ? new Date(t).toISOString() : null;
}

/* ---------- RSS 2.0 and Atom, without an XML library ---------- */

function tag(block, name) {
  const m = block.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i"));
  return m ? m[1] : "";
}
function parseFeed(xml) {
  const text = String(xml || "");
  const out = [];
  const blocks = text.match(/<item[\s>][\s\S]*?<\/item>/gi) || text.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  blocks.forEach((b) => {
    const title = clean(tag(b, "title"), 200);
    let link = clean(tag(b, "link"), 400);
    if (!link) {
      const alt = b.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) || b.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = alt ? decode(alt[1]) : "";
    }
    const date = isoDate(clean(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date"), 60));
    const url = httpsUrl(link);
    if (title && url && date) out.push({ title, url, date });
  });
  return out;
}

/* ---------- per-source readers (fetcher injected for tests) ---------- */

async function getText(fetcher, url, ms) {
  const res = await fetcher(url, { headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, application/json;q=0.9, */*;q=0.5" }, signal: AbortSignal.timeout(ms || 6000) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const body = await res.text();
  if (body.length > 3000000) throw new Error("too large");
  return body;
}

async function readSource(src, fetcher, now) {
  const since = now - WINDOW_DAYS * DAY;
  let items = [];
  if (src.type === "rss") {
    items = parseFeed(await getText(fetcher, src.url));
    if (src.skipStories) items = items.filter((i) => !STORY.test(i.title));
    if (src.aiNamesOnly) items = items.filter((i) => AI_NAMES.test(i.title));
  } else if (src.type === "hn") {
    const after = Math.floor((now - 14 * DAY) / 1000);
    let failed = 0;
    const lists = await Promise.all(HN_QUERIES.map((q) => getText(fetcher,
      "https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=20&query=" + encodeURIComponent(q) +
      "&numericFilters=" + encodeURIComponent("points>=100,created_at_i>" + after)).then((t) => JSON.parse(t).hits || []).catch(() => { failed++; return []; })));
    /* One query failing is noise; all of them failing is an outage to report. */
    if (failed === HN_QUERIES.length) throw new Error("all " + failed + " searches failed");
    const seen = new Set();
    [].concat.apply([], lists).forEach((h) => {
      if (!h || seen.has(h.objectID)) return;
      seen.add(h.objectID);
      const title = clean(h.title, 200);
      const url = httpsUrl(h.url) || "https://news.ycombinator.com/item?id=" + encodeURIComponent(String(h.objectID).replace(/\D/g, ""));
      const date = isoDate(h.created_at);
      if (title && date && AI_NAMES.test(title)) items.push({ title, url, date, score: Number(h.points) || 0, discuss: "https://news.ycombinator.com/item?id=" + String(h.objectID).replace(/\D/g, "") });
    });
    items.sort((a, b) => b.score - a.score);
  } else if (src.type === "hf") {
    const list = JSON.parse(await getText(fetcher, src.url));
    (Array.isArray(list) ? list : []).forEach((m) => {
      const id = clean(m && (m.id || m.modelId), 120);
      if (!id || !/^[\w.-]+\/[\w.-]+$/.test(id)) return;
      if (m.pipeline_tag && !LLM_PIPELINES[m.pipeline_tag]) return;
      if (/gguf|awq|gptq|mlx|exl2|-\d+bit|quant|uncensored|abliterat/i.test(id)) return;
      const date = isoDate(m.createdAt);
      if (!date) return;
      items.push({ title: id + " is trending on Hugging Face", url: "https://huggingface.co/" + id, date, score: Number(m.likes) || 0, model: id });
    });
  }
  return items.filter((i) => Date.parse(i.date) >= since && Date.parse(i.date) <= now + DAY).slice(0, src.max || 6)
    .map((i) => Object.assign({ source: src.id, sourceName: src.name, kind: src.kind }, i));
}

/* ---------- the wire ---------- */

async function collect(fetcher, now) {
  now = now || Date.now();
  const results = await Promise.all(SOURCES.map((s) => readSource(s, fetcher, now)
    .then((items) => ({ s, items, error: null }))
    .catch((e) => ({ s, items: [], error: String((e && e.message) || e).slice(0, 120) }))));
  const seen = new Set();
  const items = [];
  results.forEach((r) => r.items.forEach((i) => {
    const key = i.url.replace(/[?#].*$/, "").replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push(i);
  }));
  items.sort((a, b) => b.date.localeCompare(a.date) || (b.score || 0) - (a.score || 0));
  return {
    schemaVersion: 1,
    kind: "whichai-news",
    generatedAt: new Date(now).toISOString(),
    windowDays: WINDOW_DAYS,
    items: items.slice(0, 60),
    sources: results.map((r) => ({ id: r.s.id, name: r.s.name, kind: r.s.kind, ok: !r.error, count: r.items.length, error: r.error || undefined })),
    note: "Headlines and links from public feeds: official lab blogs, TechCrunch AI, Hacker News (100+ points) and Hugging Face. Titles only; every item links to its publisher."
  };
}

function createService(options) {
  options = options || {};
  const fetcher = options.fetcher || fetch;
  const clock = options.clock || Date.now;
  let saved = null, pending = null;
  return {
    async get() {
      const now = clock();
      if (saved && now - Date.parse(saved.generatedAt) < TTL_MS) return saved;
      if (pending) return pending;
      pending = collect(fetcher, now).then((r) => {
        /* An all-sources failure must not replace a good wire with an empty one. */
        if (r.items.length || !saved) saved = r;
        return saved;
      }).finally(() => { pending = null; });
      return pending;
    }
  };
}

function isWire(d) {
  return !!d && d.kind === "whichai-news" && d.schemaVersion === 1 && Array.isArray(d.items);
}

module.exports = { SOURCES, HN_QUERIES, STORY, AI_NAMES, TTL_MS, WINDOW_DAYS, parseFeed, clean, httpsUrl, readSource, collect, createService, isWire };
