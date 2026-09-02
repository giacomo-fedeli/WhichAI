/*
 * WhichAI - the data check, as one implementation (v0.32.0)
 *
 * The same analysis runs in two places and must never diverge:
 *   - tools/refresh-data.mjs  (command line and GitHub Actions)
 *   - api/refresh.js          (Vercel Function, hit by a Vercel Cron)
 *
 * Having a second copy would recreate exactly the problem the check exists to
 * prevent, so both callers import this file.
 *
 * It reads the public OpenRouter model list and answers four questions:
 *   1. does every ":free" route WhichAI ships as a default still exist?
 *   2. did any price drift more than 15% from the catalog?
 *   3. did any context window drift more than 25%?
 *   4. which models exist upstream and are missing from the catalog?
 *
 * It never rewrites Artificial Analysis scores. Those need a human and a
 * cited snapshot, and the whole site is judged on them being honest.
 */
"use strict";

const OR_ENDPOINT = "https://openrouter.ai/api/v1/models";
const PRICE_TOLERANCE = 0.15;
const CTX_TOLERANCE = 0.25;

/* Read the shipped defaults out of the source, so the check can never drift
   from what users actually receive. */
function shippedFreeRoutes(appSrc) {
  const m = String(appSrc || "").match(/DEFAULT_OR_MODELS\s*=\s*\{([^}]*)\}/);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+:free)"/g)].map((x) => x[1]);
}

async function fetchUpstream(timeoutMs) {
  const res = await fetch(OR_ENDPOINT, {
    headers: { "User-Agent": "WhichAI-data-check (+https://whichai.wiki)" },
    signal: AbortSignal.timeout(timeoutMs || 20000)
  });
  if (!res.ok) throw new Error("OpenRouter responded " + res.status);
  return res.json();
}

const perMillion = (v) => {
  const n = parseFloat(v);
  return isFinite(n) && n > 0 ? Math.round(n * 1e6 * 1000) / 1000 : null;
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
  if (a === b) return true;
  if (a.length < 6 || b.length < 6) return false;
  const long = a.length >= b.length ? a : b;
  const short = a.length >= b.length ? b : a;
  return long.startsWith(short) && long.length - short.length <= 1;
}

function analyse(upstream, DB, appSrc) {
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

  for (const route of shippedFreeRoutes(appSrc)) {
    (byId.has(route) ? report.liveFreeRoutes : report.deadFreeRoutes).push(route);
  }

  const catalogNames = DB.models.map((m) => ({ m, key: normName(m.name) }));
  const findUpstream = (model) => {
    const key = normName(model.name);
    for (const up of all) if (sameModel(key, upstreamKey(up))) return up;
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

  if (report.deadFreeRoutes.length) report.needsHuman.push("A shipped :free route no longer exists - auto-run is broken for those users until a default is changed.");
  if (report.missingFromCatalog.length) report.needsHuman.push(report.missingFromCatalog.length + " model(s) exist upstream and are not in the catalog - decide which deserve an entry.");
  if (report.priceDrift.length) report.needsHuman.push(report.priceDrift.length + " price(s) drifted more than 15% - confirm against the vendor page before editing.");
  report.needsHuman.push("Artificial Analysis scores are never updated automatically: re-check the snapshot and cite it.");

  /* One number the site can show without anyone reading the report. */
  report.actionable = report.deadFreeRoutes.length + report.priceDrift.length + report.missingFromCatalog.length;
  report.severity = report.deadFreeRoutes.length ? "broken" : (report.actionable ? "review" : "clean");
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
  L.push("| Shipped `:free` routes alive | " + r.liveFreeRoutes.length + " / " + (r.liveFreeRoutes.length + r.deadFreeRoutes.length) + (r.deadFreeRoutes.length ? " **BROKEN: " + r.deadFreeRoutes.join(", ") + "**" : " ok") + " |");
  L.push("| Price drift > 15% | " + r.priceDrift.length + " |");
  L.push("| Context drift > 25% | " + r.contextDrift.length + " |");
  L.push("| New upstream models not in catalog | " + r.missingFromCatalog.length + " |");
  L.push("");
  if (r.missingFromCatalog.length) {
    L.push("### Candidates to add");
    L.push("");
    L.push("| Released | Model | Context | $/1M in | $/1M out | Free route |");
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
  L.push("_Automated by the WhichAI data check. Scores are never changed without a cited snapshot._");
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

module.exports = { OR_ENDPOINT, analyse, markdown, fetchUpstream, shippedFreeRoutes, skippedReport, sameModel, normName, upstreamKey };
