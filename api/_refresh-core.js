/*
 * WhichAI - the data check, as one implementation (v0.36.0)
 *
 * The same analysis runs in two places and must never diverge:
 *   - tools/refresh-data.mjs  (command line and GitHub Actions)
 *   - api/refresh.js          (Vercel Function, hit by a Vercel Cron)
 *
 * Having a second copy would recreate exactly the problem the check exists to
 * prevent, so both callers import this file.
 *
 * It reads the public OpenRouter model list and answers four questions:
 *   1. does every ":free" route the catalog text names still exist?
 *   2. did any price drift more than 15% from the catalog?
 *   3. did any context window drift more than 25%?
 *   4. which models exist upstream and are missing from the catalog?
 *
 * It is a diagnostic only: the fixes it used to ask a human for happen by
 * themselves. Official Artificial Analysis scores, prices, newly measured
 * models and the list of free routes are applied automatically by
 * /api/catalog (see api/_catalog-core.js). Since v0.36 the site ships no
 * free-route defaults of its own (the in-browser auto-run is gone), so the
 * only thing left that can go stale is an editorial sentence in the catalog.
 */
"use strict";

const OR_ENDPOINT = "https://openrouter.ai/api/v1/models";
const PRICE_TOLERANCE = 0.15;
const CTX_TOLERANCE = 0.25;

/* Free routes the catalog's own text names, e.g. "FREE on OpenRouter
   (vendor/model:free)". A mention that already says the route was retired
   is history, not a claim, so it is not checked. */
function citedFreeRoutes(DB) {
  const out = [];
  for (const m of (DB && DB.models) || []) {
    const text = String(m.access || "");
    for (const x of text.matchAll(/([a-z0-9][\w.-]*\/[\w.:-]+?:free)\b/gi)) {
      const after = text.slice(x.index + x[0].length, x.index + x[0].length + 40);
      if (/retired|expired|removed/i.test(after)) continue;
      if (out.indexOf(x[1]) === -1) out.push(x[1]);
    }
  }
  return out;
}

async function fetchUpstream(timeoutMs) {
  const res = await fetch(OR_ENDPOINT, {
    headers: { "User-Agent": "WhichAI-data-check (+https://whichai.wiki)" },
    signal: AbortSignal.timeout(timeoutMs || 20000)
  });
  if (!res.ok) throw new Error("OpenRouter responded " + res.status);
  const payload = await res.json();
  validateUpstream(payload);
  return payload;
}

function validateUpstream(payload) {
  if (!payload || !Array.isArray(payload.data) || !payload.data.length || payload.data.some((m) => !m || typeof m.id !== "string" || typeof m.name !== "string")) {
    throw new Error("Invalid OpenRouter catalog schema; no checks applied");
  }
}

const perMillion = (v) => {
  const n = parseFloat(v);
  return isFinite(n) && n >= 0 ? Math.round(n * 1e6 * 1000) / 1000 : null;
};

function parsePrice(spec) {
  if (!spec) return [null, null];
  return [spec.priceIn, spec.priceOut].map((p) => {
    if (p == null) return null;
    const n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
    return isFinite(n) ? n : null;
  });
}

function normName(s) {
  return String(s || "").toLowerCase().replace(/\(free\)/g, "").replace(/[^a-z0-9]+/g, "");
}

/* Upstream ids carry a vendor prefix ("Z.ai: GLM 5.3"); strip it before
   comparing. Matching must be tight: "GLM-5" must NOT swallow "GLM 5.3",
   or a genuinely new model looks like one we already track. */
function upstreamKey(up) {
  return normName(String(up.name || "").split(":").pop());
}

function sameModel(a, b) {
  if (!a || !b) return false;
  return a === b;
}

function analyse(upstream, DB) {
  validateUpstream(upstream);
  const all = Array.isArray(upstream && upstream.data) ? upstream.data : [];
  const byId = new Map(all.map((m) => [m.id, m]));
  const report = {
    generated: new Date().toISOString(),
    source: OR_ENDPOINT,
    upstreamModels: all.length,
    upstreamFreeRoutes: all.filter((m) => /:free$/.test(m.id)).length,
    catalogModels: DB.models.length,
    catalogUpdated: DB.updated,
    deadFreeRoutes: [],
    liveFreeRoutes: [],
    priceDrift: [],
    contextDrift: [],
    missingFromCatalog: [],
    needsHuman: []
  };

  for (const route of citedFreeRoutes(DB)) {
    (byId.has(route) ? report.liveFreeRoutes : report.deadFreeRoutes).push(route);
  }

  const catalogNames = DB.models.map((m) => ({ m, key: normName(m.name) }));
  const findUpstream = (model) => {
    const key = normName(model.name);
    const Live = require("./_live-core.js");
    for (const up of all) if (!/:/.test(up.id) && sameModel(key, upstreamKey(up)) && Live.catalogMatch(up, { models: [model] }) === model.id) return up;
    return null;
  };

  for (const model of DB.models) {
    if (!model.spec) continue;
    const up = findUpstream(model);
    if (!up) continue;
    const [inHave, outHave] = parsePrice(model.spec);
    const inUp = perMillion(up.pricing && up.pricing.prompt);
    const outUp = perMillion(up.pricing && up.pricing.completion);
    const off = (a, b) => a != null && b != null && Math.abs(a - b) / Math.max(a, b) > PRICE_TOLERANCE;
    if (off(inHave, inUp) || off(outHave, outUp)) {
      report.priceDrift.push({ id: model.id, name: model.name, catalog: { in: inHave, out: outHave }, upstream: { in: inUp, out: outUp, id: up.id } });
    }
    const ctxHave = parseFloat(String(model.spec.ctx || "").replace(/[^0-9.]/g, ""));
    const ctxUp = up.context_length ? up.context_length / 1000 : null;
    if (isFinite(ctxHave) && ctxUp && Math.abs(ctxHave * (/M/i.test(model.spec.ctx || "") ? 1000 : 1) - ctxUp) / ctxUp > CTX_TOLERANCE) {
      report.contextDrift.push({ id: model.id, name: model.name, catalogCtx: model.spec.ctx, upstreamTokens: up.context_length });
    }
  }

  const snapshot = Date.parse(DB.updated) || 0;
  for (const up of all) {
    const created = (up.created || 0) * 1000;
    if (snapshot && created && created <= snapshot) continue;
    const key = upstreamKey(up);
    if (catalogNames.some((c) => sameModel(c.key, key))) continue;
    report.missingFromCatalog.push({
      id: up.id,
      name: up.name,
      released: created ? new Date(created).toISOString().slice(0, 10) : null,
      contextTokens: up.context_length || null,
      pricePerMillion: { in: perMillion(up.pricing && up.pricing.prompt), out: perMillion(up.pricing && up.pricing.completion) },
      free: /:free$/.test(up.id)
    });
  }
  report.missingFromCatalog.sort((a, b) => String(b.released).localeCompare(String(a.released)));

  /* What the live layer already does on its own, so nobody acts on it twice:
     the free list users see is read live, so a retired route has already
     left the site. Suggest the nearest live route of the same vendor for the
     sentence that still names it. */
  const freeAlive = all.filter((m) => /:free$/.test(m.id)).map((m) => m.id);
  report.healedFreeRoutes = report.deadFreeRoutes.map((route) => {
    const prefix = route.split("/")[0] + "/";
    return { route, replacement: freeAlive.find((id) => id.indexOf(prefix) === 0) || null };
  });
  report.automated = {
    scores: "official Artificial Analysis indices applied automatically by /api/catalog",
    prices: report.priceDrift.length ? report.priceDrift.length + " price change(s) applied automatically (OpenRouter price, labelled as such)" : "no drift",
    newModels: report.missingFromCatalog.length + " upstream model(s) newer than the editorial snapshot: measured ones are added automatically, unmeasured ones appear in the Radar",
    freeRoutes: "the free list on the site is read live by /api/catalog (" + report.upstreamFreeRoutes + " routes upstream today)"
  };
  /* The automation depends on OpenRouter relaying the official indices. If
     that ever stops, scores freeze at their last values: say so loudly. */
  report.relayedScores = all.filter((m) => m.benchmarks && m.benchmarks.artificial_analysis && typeof m.benchmarks.artificial_analysis.intelligence_index === "number").length;
  if (report.relayedScores < 20) report.needsHuman.push("OpenRouter relays only " + report.relayedScores + " Artificial Analysis scores (usually 100+): automatic score updates are effectively paused and the catalog keeps its last known values.");
  if (report.deadFreeRoutes.length) report.needsHuman.push("The catalog text still names retired free route(s): " + report.deadFreeRoutes.join(", ") + ". The site's live free list is already correct; reword that model's access line (js/models-db.js) at the next maintenance.");
  if (report.contextDrift.length) report.needsHuman.push(report.contextDrift.length + " context window(s) differ from the route: check whether the catalog figure describes the model or the route.");

  /* One number the site can show without anyone reading the report. */
  /* Context drift is information (a hosted route often caps the window), not
     a fault: it does not turn the light yellow on its own. Nothing this check
     finds can break the site any more, so the worst state is "review". */
  report.actionable = report.deadFreeRoutes.length;
  report.severity = report.deadFreeRoutes.length || report.relayedScores < 20 ? "review" : "clean";
  return report;
}

function markdown(r) {
  const L = [];
  L.push("## WhichAI scheduled data check");
  L.push("");
  L.push("Run: `" + r.generated + "` · upstream models: **" + r.upstreamModels + "** · catalog: **" + r.catalogModels + "** (snapshot " + r.catalogUpdated + ")");
  L.push("");
  L.push("| Check | Result |");
  L.push("| --- | --- |");
  L.push("| `:free` routes named in the catalog alive | " + r.liveFreeRoutes.length + " / " + (r.liveFreeRoutes.length + r.deadFreeRoutes.length) + (r.deadFreeRoutes.length ? " **RETIRED: " + r.deadFreeRoutes.join(", ") + "**" : " ok") + " |");
  L.push("| Price drift > 15% | " + r.priceDrift.length + " |");
  L.push("| Context drift > 25% | " + r.contextDrift.length + " |");
  L.push("| New upstream models not in catalog | " + r.missingFromCatalog.length + " |");
  L.push("");
  if (r.missingFromCatalog.length) {
    L.push("### Candidates to add");
    L.push("");
    L.push("| Added to OpenRouter | Model | Context | $/1M in | $/1M out | Free route |");
    L.push("| --- | --- | --- | --- | --- | --- |");
    for (const m of r.missingFromCatalog.slice(0, 25)) {
      L.push("| " + (m.released || "n/a") + " | `" + m.id + "` | " + (m.contextTokens ? Math.round(m.contextTokens / 1000) + "K" : "n/a") + " | " + (m.pricePerMillion.in == null ? "n/a" : m.pricePerMillion.in) + " | " + (m.pricePerMillion.out == null ? "n/a" : m.pricePerMillion.out) + " | " + (m.free ? "yes" : "no") + " |");
    }
    L.push("");
  }
  if (r.contextDrift.length) {
    L.push("### Context drift");
    L.push("");
    L.push("_Hosted routes often cap the context below the model's native window, so a difference here is not automatically an error in the catalog: check whether the number describes the model or the route._");
    L.push("");
    for (const c of r.contextDrift.slice(0, 20)) {
      L.push("- **" + c.name + "**: catalog `" + c.catalogCtx + "` vs upstream route " + Math.round(c.upstreamTokens / 1024) + "K tokens");
    }
    L.push("");
  }
  if (r.priceDrift.length) {
    L.push("### Price drift");
    L.push("");
    for (const p of r.priceDrift.slice(0, 20)) {
      L.push("- **" + p.name + "**: catalog $" + p.catalog.in + "/$" + p.catalog.out + " vs upstream $" + p.upstream.in + "/$" + p.upstream.out + " (`" + p.upstream.id + "`)");
    }
    L.push("");
  }
  L.push("### Needs a human");
  L.push("");
  for (const n of r.needsHuman) L.push("- " + n);
  L.push("");
  L.push("_Automated by the WhichAI data check. Scores, prices and new measured models are applied automatically by /api/catalog; this report is the audit trail._");
  return L.join("\n");
}

function skippedReport(reason, DB) {
  return {
    generated: new Date().toISOString(),
    source: OR_ENDPOINT,
    skipped: true,
    reason: String(reason || "unknown"),
    catalogModels: DB.models.length,
    catalogUpdated: DB.updated,
    actionable: 0,
    severity: "unknown",
    needsHuman: ["The upstream source did not answer, so nothing was checked. The catalog is untouched."]
  };
}

module.exports = { OR_ENDPOINT, analyse, markdown, fetchUpstream, citedFreeRoutes, skippedReport, sameModel, normName, upstreamKey, validateUpstream, perMillion };
