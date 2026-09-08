/* Public, read-only market feed. Values remain attributed to their source;
   nothing in this module rewrites the editorial catalog or its score scale. */
"use strict";

const SOURCE = "https://openrouter.ai/api/v1/models";
const TTL_MS = 60 * 60 * 1000;
const MAX_STALE_MS = 7 * 24 * TTL_MS;
const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const text = (value, max = 240) => typeof value === "string" ? value.trim().slice(0, max) : "";

function number(value) {
  if (value == null || value === "" || typeof value === "boolean") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function perMillion(value) {
  const n = number(value);
  return n == null ? null : Math.round(n * 1e9) / 1000;
}
function validId(id) { return typeof id === "string" && /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:+-]*$/i.test(id) && id.length <= 180; }
function date(value, now) {
  const n = number(value);
  return n && n * 1000 <= now + 86400000 ? new Date(n * 1000).toISOString() : null;
}
function vendorKey(value) {
  const key = norm(value);
  return ({ zai: "zai", moonshotai: "moonshot", moonshot: "moonshot", metaai: "meta", meta: "meta", nvidia: "nvidia", xai: "xai" })[key] || key;
}
function catalogMatch(up, catalog) {
  const rawName = text(up.name).replace(/^[^:]+:\s*/, "").replace(/\s*\(free\)$/i, "");
  const name = norm(rawName);
  const prefix = vendorKey(up.id.split("/")[0]);
  const matches = (catalog.models || []).filter((m) => norm(m.name) === name && vendorKey(m.vendor) === prefix);
  return matches.length === 1 ? matches[0].id : null;
}

function normalize(payload, catalog, now = Date.now()) {
  if (!payload || !Array.isArray(payload.data) || payload.data.length === 0 || payload.data.length > 10000) throw new Error("Invalid OpenRouter catalog schema");
  const seen = new Set();
  const models = payload.data.filter((m) => m && validId(m.id) && text(m.name) && !seen.has(m.id) && seen.add(m.id)).map((m) => {
    const pricing = m.pricing || {};
    const input = perMillion(pricing.prompt), output = perMillion(pricing.completion);
    const aa = m.benchmarks && m.benchmarks.artificial_analysis;
    const design = m.benchmarks && m.benchmarks.design_arena;
    return {
      id: m.id, canonicalId: text(m.canonical_slug, 180) || m.id.replace(/:free$/, ""),
      name: text(m.name), vendor: text(m.name).includes(":") ? text(m.name).split(":")[0] : m.id.split("/")[0],
      catalogId: catalogMatch(m, catalog), addedAt: date(m.created, now),
      contextTokens: number(m.context_length),
      pricePerMillion: { input, output },
      conditionalPricing: Array.isArray(pricing.overrides) && pricing.overrides.length > 0,
      extraCosts: ["request", "image", "web_search"].some((k) => number(pricing[k]) > 0),
      free: input === 0 && output === 0 && !["request", "image", "web_search", "internal_reasoning"].some((k) => number(pricing[k]) > 0) && !(Array.isArray(pricing.overrides) && pricing.overrides.length),
      inputModalities: ((m.architecture || {}).input_modalities || []).filter((v) => typeof v === "string").slice(0, 12),
      outputModalities: ((m.architecture || {}).output_modalities || []).filter((v) => typeof v === "string").slice(0, 12),
      expirationDate: /^\d{4}-\d{2}-\d{2}$/.test(m.expiration_date || "") ? m.expiration_date : null,
      url: "https://openrouter.ai/" + m.id,
      benchmarks: {
        artificialAnalysis: aa && typeof aa === "object" ? {
          intelligence: number(aa.intelligence_index), coding: number(aa.coding_index), agentic: number(aa.agentic_index)
        } : null,
        designArena: Array.isArray(design) ? design.filter((b) => b && text(b.arena) && text(b.category) && number(b.elo) != null && number(b.rank) > 0).map((b) => ({
          arena: text(b.arena, 60), category: text(b.category, 60), elo: number(b.elo), rank: number(b.rank), winRate: number(b.win_rate)
        })).slice(0, 40) : []
      }
    };
  });
  if (!models.length || models.length < payload.data.length * 0.8) throw new Error("OpenRouter catalog contains too many invalid models");
  models.sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)) || a.id.localeCompare(b.id));
  return {
    schemaVersion: 1, source: { name: "OpenRouter", url: SOURCE, docs: "https://openrouter.ai/docs/guides/overview/models" },
    retrievedAt: new Date(now).toISOString(), refreshAfter: new Date(now + TTL_MS).toISOString(),
    catalogSnapshot: catalog.updated, models,
    leaderboards: leaderboards(models),
    notes: {
      prices: "USD per 1M input/output tokens on OpenRouter, under default conditions. Route/provider rates and extra charges can differ. Zero token price is not unlimited access.",
      availability: "Listed by OpenRouter at retrieval time; not a guarantee of provider uptime or access. Added date is OpenRouter listing date, not model release date.",
      benchmarks: "Benchmarks relayed by OpenRouter. Each metric has its own scale. Source methodology version and measurement date are not supplied; retrieval time is not measurement time. These scores never overwrite the editorial snapshot."
    }
  };
}

function leaderboards(models) {
  // Batch/free routes sharing a canonical model must not occupy multiple ranks.
  const unique = new Map();
  models.slice().sort((a, b) => Number(a.id.includes(":")) - Number(b.id.includes(":")) || a.id.localeCompare(b.id)).forEach((m) => { if (!unique.has(m.canonicalId)) unique.set(m.canonicalId, m); });
  const all = [...unique.values()], groups = [];
  ["intelligence", "coding", "agentic"].forEach((metric) => {
    const entries = all.filter((m) => m.benchmarks.artificialAnalysis && m.benchmarks.artificialAnalysis[metric] != null)
      .map((m) => ({ id: m.id, name: m.name, value: m.benchmarks.artificialAnalysis[metric], url: m.url }))
      .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
    let rank = 0;
    entries.forEach((e, i) => { if (i === 0 || e.value !== entries[i - 1].value) rank = i + 1; e.rank = rank; });
    if (entries.length) groups.push({ id: "aa-" + metric, name: "Artificial Analysis · " + metric, publisher: "Artificial Analysis", sourceUrl: "https://artificialanalysis.ai/", via: "OpenRouter", scope: "Models in this OpenRouter response", metric, measurementDate: null, methodologyVersion: null, entries });
  });
  const designGroups = new Map();
  all.forEach((m) => m.benchmarks.designArena.forEach((b) => {
    const id = "design-" + b.arena + "-" + b.category;
    if (!designGroups.has(id)) designGroups.set(id, { id, name: "Design Arena · " + b.arena + " / " + b.category, publisher: "Design Arena", sourceUrl: "https://designarena.ai/", via: "OpenRouter", scope: "OpenRouter-listed models in this arena and category", metric: "elo", measurementDate: null, methodologyVersion: null, entries: [] });
    designGroups.get(id).entries.push({ id: m.id, name: m.name, value: b.elo, rank: b.rank, url: m.url });
  }));
  [...designGroups.values()].forEach((g) => { g.entries.sort((a, b) => a.rank - b.rank || b.value - a.value); groups.push(g); });
  return groups;
}

function createService(options = {}) {
  const fetcher = options.fetcher || fetch;
  const clock = options.clock || Date.now;
  const catalog = options.catalog || { models: [], updated: null };
  let saved = null, pending = null, retryAt = 0;
  async function get() {
    const now = clock();
    if (saved && now - Date.parse(saved.retrievedAt) < TTL_MS) return { ...saved, status: "fresh" };
    if (pending) return pending;
    function fallback() {
      if (saved && now - Date.parse(saved.retrievedAt) <= MAX_STALE_MS) return { ...saved, status: "stale", reason: "upstream_unavailable" };
      return { schemaVersion: 1, status: "unavailable", source: { name: "OpenRouter", url: SOURCE }, retrievedAt: null, refreshAfter: null, catalogSnapshot: catalog.updated, models: [], leaderboards: [], reason: "upstream_unavailable" };
    }
    if (now < retryAt) return fallback();
    pending = (async () => {
      try {
        const res = await fetcher(SOURCE, { headers: { Accept: "application/json", "User-Agent": "WhichAI-public-catalog (+https://whichai.wiki)" }, signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error("upstream_http_" + res.status);
        const body = await res.text();
        if (body.length > 10000000) throw new Error("upstream_too_large");
        saved = normalize(JSON.parse(body), catalog, clock());
        retryAt = 0;
        return { ...saved, status: "fresh" };
      } catch (_) {
        retryAt = clock() + 60000;
        return fallback();
      } finally { pending = null; }
    })();
    return pending;
  }
  return { get };
}

module.exports = { SOURCE, TTL_MS, MAX_STALE_MS, number, perMillion, validId, catalogMatch, normalize, leaderboards, createService };
