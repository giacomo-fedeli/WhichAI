/*
 * WhichAI - the self-updating catalog (v0.35.0)
 *
 * computeDelta(DB, live) turns the public OpenRouter model list (already
 * normalized by _live-core.js) into a small, dated set of changes for the
 * WhichAI catalog:
 *   - official Artificial Analysis scores: Intelligence, Coding, Agentic
 *     (the same scale shown on artificialanalysis.ai, relayed by OpenRouter)
 *   - current prices, plus context windows and dates where the catalog has none
 *   - the free routes that exist right now (so a dead default can heal itself)
 *   - models Artificial Analysis has measured that the catalog does not list yet
 *   - the newest arrivals from the labs people actually use, for the Radar
 *
 * The same function runs in three places and must give the same answer:
 *   - api/catalog.js         Vercel Function, cached at the edge for an hour
 *   - tools/build.mjs        every deploy bakes a fresh seed into the bundle
 *   - tests/catalog-tests.mjs  a real October 3, 2026 snapshot, fully offline
 *
 * What it never does: rewrite a review, delete a model, remove a tag, give a
 * score to a model nobody measured, or invent a number. Editorial prose stays
 * human; every figure comes from a named source and carries its date.
 */
"use strict";

const SOURCE_URL = "https://openrouter.ai/api/v1/models";
const AA_URL = "https://artificialanalysis.ai/";
const SCHEMA = 1;
const KIND = "whichai-live-catalog";
const DAY = 86400000;

/* OpenRouter id prefix -> [vendor name used by the catalog, prompt family]. */
const VENDORS = {
  openai: ["OpenAI", "chatgpt"], anthropic: ["Anthropic", "claude"], google: ["Google", "gemini"],
  "x-ai": ["xAI", "grok"], meta: ["Meta", "meta"], "meta-llama": ["Meta", "llama"],
  microsoft: ["Microsoft", null], perplexity: ["Perplexity AI", "perplexity"], deepseek: ["DeepSeek", "deepseek"],
  qwen: ["Alibaba", "qwen"], moonshotai: ["Moonshot AI", "kimi"], "z-ai": ["Z.ai", "glm"], nvidia: ["NVIDIA", "nemotron"],
  mistralai: ["Mistral AI", null], xiaomi: ["Xiaomi", null], minimax: ["MiniMax", null], tencent: ["Tencent", null],
  thinkingmachines: ["Thinking Machines Lab", null], inclusionai: ["Ant Group", null], meituan: ["Meituan", null],
  "ibm-granite": ["IBM", null], inception: ["Inception Labs", null], upstage: ["Upstage", null], "arcee-ai": ["Arcee AI", null],
  cohere: ["Cohere", null], stepfun: ["StepFun", null], "stepfun-ai": ["StepFun", null], "bytedance-seed": ["ByteDance", null],
  bytedance: ["ByteDance", null], baidu: ["Baidu", null], amazon: ["Amazon", null], ai21: ["AI21 Labs", null],
  liquid: ["Liquid AI", null], allenai: ["Ai2", null], rekaai: ["Reka AI", null], poolside: ["Poolside", null]
};

/* Labs whose brand-new, not-yet-measured models still deserve a Radar line. */
const MAJOR = ["openai", "anthropic", "google", "x-ai", "meta", "meta-llama", "deepseek", "qwen", "moonshotai", "z-ai", "mistralai", "xiaomi", "minimax"];

/* Prompt families that auto-run through an OpenRouter free route. */
const FAMILY_PREFIX = { nemotron: "nvidia/", qwen: "qwen/", glm: "z-ai/", kimi: "moonshotai/", deepseek: "deepseek/", llama: "meta-llama/" };

/* Suffixes that mark a tier or packaging of a model already listed, not a new model. */
const VARIANT = /-(pro|prime|ultraspeed|ultra-speed|contributor|exp|experimental|preview|thinking|fast|turbo|vision|customtools|high|low|online|nitro|flashx|instruct|it)$/;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function prefixOf(id) { return String(id || "").split("/")[0]; }
function baseOf(id) { return String(id || "").split(":")[0]; }
function isRoute(id) { return String(id || "").indexOf(":") !== -1; }
function vendorOf(up) {
  const v = VENDORS[prefixOf(up.id)];
  if (v) return v[0];
  const n = String(up.name || "");
  return clean(n.indexOf(":") !== -1 ? n.split(":")[0] : prefixOf(up.id), 40);
}
function familyOf(id) { const v = VENDORS[prefixOf(id)]; return v ? v[1] : null; }
function familyForRoute(id) {
  for (const f in FAMILY_PREFIX) if (String(id).indexOf(FAMILY_PREFIX[f]) === 0) return f;
  return null;
}

/* Upstream text ends up in the page. Nothing that looks like markup survives. */
function clean(s, max) {
  return String(s == null ? "" : s).replace(/[<>\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max || 120);
}
function cleanName(up) {
  const n = clean(String(up.name || "").replace(/^[^:]+:\s*/, "").replace(/\s*\(free\)$/i, ""), 80);
  return n || baseOf(up.id).split("/")[1];
}
function slugOf(id) {
  return baseOf(id).split("/")[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fmtDate(iso) {
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00Z");
  if (isNaN(d)) return null;
  return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
}
function fmtCtx(tokens) {
  const n = Number(tokens);
  if (!isFinite(n) || n <= 0) return null;
  if (n >= 1000000) return String(Math.round(n / 10000) / 100).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1") + "M";
  return Math.round(n / 1000) + "K";
}
function money(n) { return "$" + (Math.round(n * 1000) / 1000); }
function modalText(mods) {
  const names = { text: "Text", image: "image", file: "files", audio: "audio", video: "video" };
  const list = (mods || []).filter((m) => names[m]);
  if (!list.length) return null;
  const ordered = ["text", "image", "file", "audio", "video"].filter((m) => list.indexOf(m) !== -1);
  return ordered.map((m) => names[m]).join(" + ");
}

/* Official Artificial Analysis indices, or null. An index without the main
   Intelligence number is not enough to place a model on the site's scale. */
function aaOf(up) {
  const a = up && up.benchmarks && up.benchmarks.artificialAnalysis;
  if (!a || typeof a.intelligence !== "number") return null;
  return { intelligence: a.intelligence, coding: typeof a.coding === "number" ? a.coding : null, agentic: typeof a.agentic === "number" ? a.agentic : null };
}

/* "$5/$30" inside a sentence becomes the new pair, and nothing else changes. */
function rewritePrice(text, oldIn, oldOut, newIn, newOut) {
  if (typeof text !== "string" || oldIn == null || oldOut == null) return text;
  const esc = (n) => String(n).replace(/\./g, "\\.");
  const re = new RegExp("\\$\\s?" + esc(oldIn) + "\\s?/\\s?\\$\\s?" + esc(oldOut) + "(?![\\d.])", "g");
  return text.replace(re, money(newIn) + "/" + money(newOut));
}

function deriveLabels(up, aa) {
  const out = [];
  const pin = up.pricePerMillion.input, pout = up.pricePerMillion.output;
  const blended = pin != null && pout != null ? (3 * pin + pout) / 4 : null;
  if (aa.coding != null && aa.coding >= 70) out.push("coding");
  if (aa.intelligence >= 45 || up.reasoningDefault) out.push("reasoning");
  if (aa.agentic != null && aa.agentic >= 45) out.push("agents");
  if ((up.inputModalities || []).indexOf("image") !== -1) out.push("vision");
  if (up.contextTokens >= 500000) out.push("long-context");
  if (aa.intelligence >= 30 && blended != null && blended > 0 && blended <= 1) out.push("value");
  if (up.openWeights) out.push("local");
  return out;
}

function isVariantOfKnown(id, known) {
  const stripDate = (x) => x.replace(/-\d{4}(\d{4})?$/, "");
  let s = baseOf(id);
  for (let i = 0; i < 4; i++) {
    const next = stripDate(s).replace(VARIANT, "");
    if (next === s) break;
    s = next;
    if (known.has(s)) return true;
    for (const k of known) if (k !== baseOf(id) && stripDate(k) === s) return true;
  }
  return false;
}

function buildModel(up, aa, ctx) {
  let id = slugOf(up.id);
  if (ctx.usedIds.has(id)) id = prefixOf(up.id).replace(/[^a-z0-9]+/g, "-") + "-" + id;
  ctx.usedIds.add(id);
  const vendor = vendorOf(up);
  const free = ctx.byId.get(up.id + ":free");
  const hasFree = !!(free && free.free);
  const pin = up.pricePerMillion.input, pout = up.pricePerMillion.output;
  const paid = (pin || 0) > 0 || (pout || 0) > 0;
  const listed = up.addedAt ? up.addedAt.slice(0, 10) : null;
  const old = !!(up.addedAt && ctx.now - Date.parse(up.addedAt) > 400 * DAY);
  const name = cleanName(up);

  const tags = [];
  if (paid) tags.push("paid", "api");
  if (hasFree) tags.push("free");
  if (up.openWeights) tags.push("open-weights");
  if (old) tags.push("legacy");

  const access = [];
  if (paid) access.push("API " + money(pin) + "/" + money(pout) + " per 1M tokens on OpenRouter");
  if (hasFree) access.push("free route on OpenRouter (" + free.id + ")");
  if (up.openWeights) access.push("open weights");
  if (listed) access.push("listed " + fmtDate(listed));

  const review = [name + " by " + vendor + ", measured by Artificial Analysis at " + aa.intelligence + " on the Intelligence Index" +
    (aa.coding != null ? ", " + aa.coding + " on coding" : "") + (aa.agentic != null ? " and " + aa.agentic + " on agentic work" : "") + ".",
    "Added to WhichAI automatically from live data on " + fmtDate(ctx.at) + ": no editorial review yet, so judge it by the numbers, not by a verdict."];
  if (up.description) review.push("OpenRouter's description: “" + clean(up.description, 240) + "”");

  const live = { or: up.id, url: up.url, at: ctx.at };
  if (hasFree) live.free = free.id;
  return {
    id, name, vendor, family: familyOf(up.id), status: old ? "legacy" : "public",
    spec: { released: listed, ctx: fmtCtx(up.contextTokens), modal: modalText(up.inputModalities), priceIn: paid ? pin : null, priceOut: paid ? pout : null, priceSrc: paid ? "OpenRouter" : null },
    access: access.join(" · "),
    tags, labels: deriveLabels(up, aa),
    score: { aa: aa.intelligence, est: false, src: "aa", coding: aa.coding, agentic: aa.agentic, at: ctx.at },
    review: review.join(" "),
    auto: true,
    or: [up.id],
    live
  };
}

function computeDelta(DB, live, opts) {
  opts = opts || {};
  if (!DB || !Array.isArray(DB.models)) throw new Error("catalog missing");
  if (!live || !Array.isArray(live.models) || !live.models.length) throw new Error("live feed missing");
  const retrievedAt = live.retrievedAt || new Date(opts.now || Date.now()).toISOString();
  const now = Date.parse(retrievedAt) || opts.now || Date.now();
  const at = retrievedAt.slice(0, 10);
  const byId = new Map(live.models.map((m) => [m.id, m]));
  const textOut = (m) => !m.outputModalities || !m.outputModalities.length || m.outputModalities.indexOf("text") !== -1;

  /* 1. Which upstream route is each catalog model? Curated `or` lists first;
        when none of the listed routes exists any more (a "-preview" suffix
        dropped at GA, a renamed slug), a strict name + vendor match takes
        over - otherwise the renamed route would come back as a duplicate. */
  const claimed = new Set();
  const routeOf = new Map();
  DB.models.forEach((m) => {
    const list = Array.isArray(m.or) ? m.or.filter((x) => typeof x === "string") : [];
    list.forEach((id) => { claimed.add(id); claimed.add(id + ":free"); });
    let up = null;
    for (const id of list) { if (byId.has(id)) { up = byId.get(id); break; } }
    if (!up) {
      up = live.models.find((c) => !isRoute(c.id) && c.catalogId === m.id) || null;
      if (up) { claimed.add(up.id); claimed.add(up.id + ":free"); }
    }
    if (up) routeOf.set(m.id, up);
  });
  const claimedCanon = new Set([...routeOf.values()].map((u) => u.canonicalId));

  /* 2. Patches for models the catalog already has. */
  const patches = {};
  let scoreUpdates = 0, priceUpdates = 0, official = 0;
  DB.models.forEach((m) => {
    const up = routeOf.get(m.id);
    if (!up) return;
    const p = { live: { or: up.id, url: up.url, at } };
    const free = byId.get(up.id + ":free");
    if (free && free.free) p.live.free = free.id;

    const aa = aaOf(up);
    if (aa) {
      official++;
      const s = m.score || {};
      p.score = { aa: aa.intelligence, est: false, src: "aa", coding: aa.coding, agentic: aa.agentic, at };
      if (s.aa !== aa.intelligence || s.est || s.src !== "aa") scoreUpdates++;
      if (m.status === "rumored" || m.status === "private") p.status = "public";
    }

    const spec = m.spec || {};
    const pin = up.pricePerMillion.input, pout = up.pricePerMillion.output;
    if (pin != null && pout != null && (pin > 0 || pout > 0)) {
      const differs = (a, b) => a == null || b == null || Math.abs(a - b) > Math.max(0.0005, 0.01 * Math.max(a, b));
      if (differs(spec.priceIn, pin) || differs(spec.priceOut, pout)) {
        p.spec = Object.assign(p.spec || {}, { priceIn: pin, priceOut: pout, priceSrc: "OpenRouter" });
        if (spec.priceIn != null && spec.priceOut != null) {
          priceUpdates++;
          p.priceWas = [spec.priceIn, spec.priceOut];
          const access = rewritePrice(m.access, spec.priceIn, spec.priceOut, pin, pout);
          if (access !== m.access) p.access = access;
        }
      }
    }
    if (!spec.ctx && up.contextTokens) p.spec = Object.assign(p.spec || {}, { ctx: fmtCtx(up.contextTokens) });
    if (!spec.released && up.addedAt) p.spec = Object.assign(p.spec || {}, { released: up.addedAt.slice(0, 10) });

    const tags = m.tags || [];
    const addTags = [];
    if (p.live.free && tags.indexOf("free") === -1) addTags.push("free");
    if (up.openWeights && tags.indexOf("open-weights") === -1) addTags.push("open-weights");
    if (pin > 0 && tags.indexOf("api") === -1) addTags.push("api");
    if (addTags.length) p.addTags = addTags;
    patches[m.id] = p;
  });

  /* 3. Measured models the catalog does not list: they appear on their own. */
  const ctx = { byId, usedIds: new Set(DB.models.map((m) => m.id)), now, at };
  const added = [];
  const addedCanon = new Set();
  live.models.forEach((up) => {
    if (isRoute(up.id) || claimed.has(up.id) || claimedCanon.has(up.canonicalId) || addedCanon.has(up.canonicalId) || !textOut(up)) return;
    const aa = aaOf(up);
    if (!aa) return;
    addedCanon.add(up.canonicalId);
    added.push(buildModel(up, aa, ctx));
  });
  added.sort((a, b) => b.score.aa - a.score.aa || a.name.localeCompare(b.name));

  /* 4. Free routes that exist right now, best measured first. */
  const freeRoutes = live.models.filter((m) => /:free$/.test(m.id) && m.free && textOut(m)).map((m) => {
    const base = byId.get(baseOf(m.id));
    const aa = aaOf(m) || aaOf(base);
    return { id: m.id, name: cleanName(m), vendor: vendorOf(m), family: familyForRoute(m.id), aa: aa ? aa.intelligence : null, ctx: m.contextTokens || null, expires: m.expirationDate || null };
  }).sort((a, b) => (b.aa == null ? -1 : b.aa) - (a.aa == null ? -1 : a.aa) || (b.ctx || 0) - (a.ctx || 0) || a.id.localeCompare(b.id));

  /* 5. Arrivals for the Radar: everything measured that was listed in the
        last 45 days, plus brand-new models from the big labs that nobody has
        measured yet - minus tiers and repackagings of models already listed. */
  const known = new Set(live.models.filter((m) => !isRoute(m.id)).map((m) => m.id));
  const catalogIdOf = new Map();
  routeOf.forEach((up, cid) => catalogIdOf.set(up.id, cid));
  added.forEach((a) => catalogIdOf.set(a.or[0], a.id));
  const horizon = now - 45 * DAY;
  const arrivals = [];
  live.models.forEach((up) => {
    if (isRoute(up.id) || !textOut(up) || !up.addedAt || !(Date.parse(up.addedAt) >= horizon)) return;
    const aa = aaOf(up);
    if (!aa && (MAJOR.indexOf(prefixOf(up.id)) === -1 || isVariantOfKnown(up.id, known))) return;
    arrivals.push({ date: up.addedAt.slice(0, 10), name: cleanName(up), vendor: vendorOf(up), aa: aa ? aa.intelligence : null, or: up.id, url: up.url, dbId: catalogIdOf.get(up.id) || null });
  });
  arrivals.sort((a, b) => b.date.localeCompare(a.date) || (b.aa || 0) - (a.aa || 0) || a.name.localeCompare(b.name));
  arrivals.splice(24);

  const when = fmtDate(at);
  return {
    schemaVersion: SCHEMA,
    kind: KIND,
    generatedAt: new Date(opts.now || Date.now()).toISOString(),
    retrievedAt,
    updated: when,
    editorial: DB.updated || null,
    source: { name: "OpenRouter", url: SOURCE_URL, benchmarks: { name: "Artificial Analysis", url: AA_URL } },
    note: "Artificial Analysis Intelligence Index, official scale (the number published on artificialanalysis.ai), relayed by OpenRouter and refreshed automatically: last read " + when + ". " +
      (official + added.length) + " models carry a current official measurement. A value marked ~ is converted from an earlier snapshot because no current measurement is published; an unmeasured model is never ranked.",
    patches,
    added,
    freeRoutes,
    arrivals,
    counts: { catalog: DB.models.length, matched: routeOf.size, official: official + added.length, scoreUpdates, priceUpdates, added: added.length, freeRoutes: freeRoutes.length, arrivals: arrivals.length }
  };
}

/* The browser and the build both validate before applying: a malformed delta
   must never become data. Kept here so the server can self-check its output. */
function isDelta(d) {
  return !!d && typeof d === "object" && d.schemaVersion === SCHEMA && d.kind === KIND &&
    typeof d.retrievedAt === "string" && !isNaN(Date.parse(d.retrievedAt)) &&
    d.patches && typeof d.patches === "object" && Array.isArray(d.added) && Array.isArray(d.freeRoutes);
}

module.exports = {
  SCHEMA, KIND, SOURCE_URL, AA_URL, VENDORS, MAJOR, FAMILY_PREFIX,
  computeDelta, isDelta, rewritePrice, fmtCtx, fmtDate, modalText, slugOf, cleanName, isVariantOfKnown, familyForRoute, aaOf
};
