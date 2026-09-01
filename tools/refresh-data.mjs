/*
 * WhichAI - scheduled data check (v0.30.0)
 *
 * What it does, without a human:
 *   1. pulls the public OpenRouter model list (no key, no cost)
 *   2. checks that every ":free" route WhichAI ships as a default still exists
 *      (these silently disappear and would break auto-run for real users)
 *   3. flags price and context-window drift against js/models-db.js
 *   4. lists models that exist upstream and are missing from the catalog
 *   5. writes data/refresh-report.json + a Markdown summary
 *
 * What it deliberately does NOT do: rewrite scores. Artificial Analysis
 * numbers need editorial judgement and a cited snapshot, so the workflow
 * opens a pull request for a human to approve instead of silently editing
 * the numbers the whole site is judged on.
 *
 * Usage:
 *   node tools/refresh-data.mjs            check, write report, exit 0
 *   node tools/refresh-data.mjs --strict   exit 1 when a shipped free route died
 *   node tools/refresh-data.mjs --fixture path.json   offline run for tests
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const OR_ENDPOINT = "https://openrouter.ai/api/v1/models";
const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const fixtureIdx = args.indexOf("--fixture");
const FIXTURE = fixtureIdx >= 0 ? args[fixtureIdx + 1] : null;

const DB = require("../js/models-db.js");
const appSrc = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");

/* The free routes WhichAI ships as defaults, read straight from the source
   so this check can never drift from what users actually get. */
function shippedFreeRoutes() {
  const m = appSrc.match(/DEFAULT_OR_MODELS\s*=\s*\{([^}]*)\}/);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+:free)"/g)].map((x) => x[1]);
}

async function fetchUpstream() {
  if (FIXTURE) return JSON.parse(readFileSync(FIXTURE, "utf8"));
  const res = await fetch(OR_ENDPOINT, {
    headers: { "User-Agent": "WhichAI-data-check (+https://whichai.wiki)" },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error("OpenRouter responded " + res.status);
  return res.json();
}

const perMillion = (v) => {
  const n = parseFloat(v);
  return isFinite(n) && n > 0 ? Math.round(n * 1e6 * 1000) / 1000 : null;
};

/* "$3/$15 per 1M tokens" and friends -> [3, 15] */
function parsePrice(spec) {
  if (!spec) return [null, null];
  const raw = [spec.priceIn, spec.priceOut].map((p) => {
    if (p == null) return null;
    const n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
    return isFinite(n) ? n : null;
  });
  return raw;
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

function main(upstream) {
  const all = Array.isArray(upstream.data) ? upstream.data : [];
  const byId = new Map(all.map((m) => [m.id, m]));
  const freeUp = all.filter((m) => /:free$/.test(m.id));
  const report = {
    generated: new Date().toISOString(),
    source: OR_ENDPOINT,
    upstreamModels: all.length,
    upstreamFreeRoutes: freeUp.length,
    catalogModels: DB.models.length,
    catalogUpdated: DB.updated,
    deadFreeRoutes: [],
    liveFreeRoutes: [],
    priceDrift: [],
    contextDrift: [],
    missingFromCatalog: [],
    needsHuman: []
  };

  for (const route of shippedFreeRoutes()) {
    (byId.has(route) ? report.liveFreeRoutes : report.deadFreeRoutes).push(route);
  }

  const catalogNames = DB.models.map((m) => ({ m, key: normName(m.name) }));
  const findUpstream = (model) => {
    const key = normName(model.name);
    for (const up of all) {
      if (sameModel(key, upstreamKey(up))) return up;
    }
    return null;
  };

  for (const model of DB.models) {
    if (!model.spec) continue;
    const up = findUpstream(model);
    if (!up) continue;
    const [inHave, outHave] = parsePrice(model.spec);
    const inUp = perMillion(up.pricing && up.pricing.prompt);
    const outUp = perMillion(up.pricing && up.pricing.completion);
    const off = (a, b) => a != null && b != null && Math.abs(a - b) / Math.max(a, b) > 0.15;
    if (off(inHave, inUp) || off(outHave, outUp)) {
      report.priceDrift.push({ id: model.id, name: model.name, catalog: { in: inHave, out: outHave }, upstream: { in: inUp, out: outUp, id: up.id } });
    }
    const ctxHave = parseFloat(String(model.spec.ctx || "").replace(/[^0-9.]/g, ""));
    const ctxUp = up.context_length ? up.context_length / 1000 : null;
    if (isFinite(ctxHave) && ctxUp && Math.abs(ctxHave * (/M/i.test(model.spec.ctx || "") ? 1000 : 1) - ctxUp) / ctxUp > 0.25) {
      report.contextDrift.push({ id: model.id, name: model.name, catalogCtx: model.spec.ctx, upstreamTokens: up.context_length });
    }
  }

  /* Anything released upstream after our snapshot that we have never heard of. */
  const snapshot = Date.parse(DB.updated) || 0;
  for (const up of all) {
    const created = (up.created || 0) * 1000;
    if (snapshot && created && created <= snapshot) continue;
    const key = upstreamKey(up);
    const known = catalogNames.some((c) => sameModel(c.key, key));
    if (!known) {
      report.missingFromCatalog.push({
        id: up.id,
        name: up.name,
        released: created ? new Date(created).toISOString().slice(0, 10) : null,
        contextTokens: up.context_length || null,
        pricePerMillion: { in: perMillion(up.pricing && up.pricing.prompt), out: perMillion(up.pricing && up.pricing.completion) },
        free: /:free$/.test(up.id)
      });
    }
  }
  report.missingFromCatalog.sort((a, b) => String(b.released).localeCompare(String(a.released)));

  if (report.deadFreeRoutes.length) report.needsHuman.push("A shipped :free route no longer exists - auto-run is broken for those users until a default is changed.");
  if (report.missingFromCatalog.length) report.needsHuman.push(report.missingFromCatalog.length + " model(s) exist upstream and are not in the catalog - decide which deserve an entry.");
  if (report.priceDrift.length) report.needsHuman.push(report.priceDrift.length + " price(s) drifted more than 15% - confirm against the vendor page before editing.");
  report.needsHuman.push("Artificial Analysis scores are never updated automatically: re-check the snapshot and cite it.");

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
      L.push("| " + (m.released || "n/a") + " | `" + m.id + "` | " + (m.contextTokens ? Math.round(m.contextTokens / 1000) + "K" : "n/a") + " | " + (m.pricePerMillion.in ?? "n/a") + " | " + (m.pricePerMillion.out ?? "n/a") + " | " + (m.free ? "yes" : "no") + " |");
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
  L.push("_Automated by `tools/refresh-data.mjs`. Scores are never changed without a cited snapshot._");
  return L.join("\n");
}

/* A public source being down is not a reason to page anyone at 06:00 on a
   Monday. Report it as a skipped check and exit clean, unless --strict. */
let upstream = null;
let sourceError = null;
try {
  upstream = await fetchUpstream();
} catch (err) {
  sourceError = err && err.message ? err.message : String(err);
}

if (!upstream) {
  const md = [
    "## WhichAI scheduled data check",
    "",
    "**Skipped: the upstream source did not answer.**",
    "",
    "- Source: `" + OR_ENDPOINT + "`",
    "- Reason: " + sourceError,
    "- Catalog left untouched (snapshot " + DB.updated + ", " + DB.models.length + " models).",
    "",
    "Nothing is wrong with the catalog: the check simply could not run. The next scheduled run will retry.",
    ""
  ].join("\n");
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n", { flag: "a" });
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, "changes=0\ndead_routes=0\nsource_error=1\n", { flag: "a" });
  process.exit(STRICT ? 1 : 0);
}

const report = main(upstream);
writeFileSync(new URL("../data/refresh-report.json", import.meta.url), JSON.stringify(report, null, 1) + "\n");
const md = markdown(report);
writeFileSync(new URL("../data/refresh-report.md", import.meta.url), md + "\n");
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n", { flag: "a" });
}
if (process.env.GITHUB_OUTPUT) {
  const changed = report.deadFreeRoutes.length + report.priceDrift.length + report.missingFromCatalog.length;
  writeFileSync(process.env.GITHUB_OUTPUT, "changes=" + changed + "\ndead_routes=" + report.deadFreeRoutes.length + "\n", { flag: "a" });
}
if (STRICT && report.deadFreeRoutes.length) {
  console.error("\nFAIL: shipped free route(s) gone: " + report.deadFreeRoutes.join(", "));
  process.exit(1);
}
