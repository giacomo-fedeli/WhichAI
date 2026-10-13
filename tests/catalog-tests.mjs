/* WhichAI - the self-updating catalog (v0.36).
   Everything here runs offline against a REAL OpenRouter response saved on
   October 3, 2026 (tests/fixtures/openrouter-2026-10-03.json): the delta,
   the browser merge, the /api/catalog endpoint, the build-time seed and wiki.

   What these tests protect is the promise made to the owner of the site:
   nobody has to edit a file for the numbers to stay current, and nothing the
   automation does can invent a number, rank an unmeasured model, delete an
   entry or rewrite a review.

   Run: node tests/catalog-tests.mjs                                       */
import { readFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import { createRequire } from "module";
import vm from "vm";
const require = createRequire(import.meta.url);
globalThis.window = globalThis.window || globalThis;

const DB = require("../js/models-db.js");
const Live = require("../api/_live-core.js");
const Core = require("../api/_catalog-core.js");
const LiveCatalog = require("../js/live-catalog.js");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " - " + detail : "")); console.log("FAIL  " + name + (detail ? " - " + detail : "")); }
}
const clone = (x) => JSON.parse(JSON.stringify(x));
const WHEN = Date.parse("2026-10-03T18:46:00Z");
const FIXTURE = JSON.parse(readFileSync("tests/fixtures/openrouter-2026-10-03.json", "utf8"));
const before = JSON.stringify(DB);
const live = Live.normalize(clone(FIXTURE), DB, WHEN);
const delta = Core.computeDelta(DB, live, { now: WHEN });

/* ---------- 1. the delta, computed from real data ---------- */
{
  check("delta: computing it never mutates the catalog", JSON.stringify(DB) === before);
  check("delta: passes its own schema check", Core.isDelta(delta) && LiveCatalog.isDelta(delta));
  check("delta: most catalog entries find their OpenRouter route", delta.counts.matched >= 85, String(delta.counts.matched));
  check("delta: official measurements for most of the market", delta.counts.official >= 90, String(delta.counts.official));
  const addedIds = delta.added.map((a) => a.id);
  const LAUNCHES = ["claude-opus-5-5", "claude-sonnet-5-5", "gpt-6-1-sol", "grok-4-7", "mimo-v2-6-pro"];
  check("delta: the September launches appear on their own", LAUNCHES.every((id) => addedIds.includes(id)), LAUNCHES.filter((id) => !addedIds.includes(id)).join(","));
  const opus55 = delta.added.find((a) => a.id === "claude-opus-5-5");
  check("delta: a new model carries the official figure and says it is automatic", opus55 && opus55.score.aa === 57.6 && opus55.score.src === "aa" && opus55.score.est === false && opus55.auto === true && /automatically/.test(opus55.review));
  check("delta: a new model gets vendor, family and price from the source", opus55.vendor === "Anthropic" && opus55.family === "claude" && opus55.spec.priceIn === 4 && opus55.spec.priceOut === 20);
  check("delta: only measured models are added", delta.added.every((a) => typeof a.score.aa === "number" && a.score.est === false));
  check("delta: routes and batch tiers are never added as models", delta.added.every((a) => a.or.every((id) => id.indexOf(":") === -1)));
  const claimed = new Set(DB.models.flatMap((m) => m.or || []));
  check("delta: nothing the catalog already lists is added twice", delta.added.every((a) => !a.or.some((id) => claimed.has(id))));
  check("delta: added ids are unique and never collide with the catalog", new Set(addedIds).size === addedIds.length && addedIds.every((id) => !DB.models.some((m) => m.id === id)));
  check("delta: no added review claims a rank", delta.added.every((a) => !/#\s?\d/.test(a.review)));
  check("delta: upstream text cannot inject markup", delta.added.every((a) => !/[<>]/.test(a.name + a.review + a.access)));
  check("delta: a model listed more than 400 days ago is filed as legacy", delta.added.filter((a) => a.status === "legacy").every((a) => a.tags.includes("legacy")) && delta.added.some((a) => a.status === "legacy"));

  const sol = delta.patches["gpt-5-6-sol"];
  check("delta: a price cut is applied with the old price kept for the record", sol && sol.spec.priceIn === 2 && sol.spec.priceOut === 10 && sol.priceWas[0] === 5 && sol.priceWas[1] === 30);
  check("delta: the price inside the access sentence follows, and nothing else changes", sol.access && sol.access.includes("$2/$10") && !sol.access.includes("$5/$30") && sol.access.replace("$2/$10", "$5/$30") === DB.models.find((m) => m.id === "gpt-5-6-sol").access);
  check("delta: official scores patch the matched entries", delta.patches["claude-opus-5"].score.aa === 50.8 && delta.patches["fable-5-1"].score.coding === 81.6);
  check("delta: a patch never carries a review", Object.values(delta.patches).every((p) => !("review" in p)));
  check("delta: a context window is only filled, never overwritten", Object.keys(delta.patches).every((id) => { const p = delta.patches[id]; const m = DB.models.find((x) => x.id === id); return !(p.spec && p.spec.ctx) || !(m.spec && m.spec.ctx); }));

  const free = delta.freeRoutes.map((f) => f.id);
  check("delta: live free routes are listed, best measured first", free[0] === "qwen/qwen3.8-27b:free" && delta.freeRoutes[0].family === "qwen");
  check("delta: a retired free route is not offered", !free.includes("qwen/qwen3-coder:free"));
  check("delta: arrivals are newest first", delta.arrivals.every((a, i, arr) => i === 0 || arr[i - 1].date >= a.date));
  check("delta: arrivals skip tiers of models already listed", !delta.arrivals.some((a) => /gpt-6\.1-sol-pro|glm-5\.3-prime|muse-spark-1\.3-contributor/.test(a.or)));
  check("delta: a brand-new unmeasured model from a big lab is announced", delta.arrivals.some((a) => a.aa === null && /qwen3\.8-omni-flash/.test(a.or)));
  check("delta: the note states source, scale and the ~ rule", /official/.test(delta.note) && /Artificial Analysis/.test(delta.note) && /~/.test(delta.note) && /never ranked/.test(delta.note));
  /* A listed route renamed upstream (preview -> GA) must be recognised by
     name, not re-added as a second "Gemini 3.1 Pro". */
  const renamed = clone(FIXTURE);
  renamed.data.forEach((m) => { if (m.id === "google/gemini-3.1-pro-preview") { m.id = "google/gemini-3.1-pro-ga"; m.canonical_slug = "google/gemini-3.1-pro-ga"; m.name = "Google: Gemini 3.1 Pro"; } });
  const dRen = Core.computeDelta(DB, Live.normalize(renamed, DB, WHEN), { now: WHEN });
  check("delta: a renamed route is matched by name instead of being added twice", !dRen.added.some((a) => /gemini-3\.1-pro/.test(a.or[0])) && dRen.patches["gemini-3-1-pro"] && dRen.patches["gemini-3-1-pro"].live.or === "google/gemini-3.1-pro-ga");
  check("delta: refuses to run without a feed", (() => { try { Core.computeDelta(DB, { models: [] }); return false; } catch (e) { return true; } })());
}

/* ---------- 2. helpers ---------- */
{
  check("fmtCtx: 1M, 1.05M, 262K", Core.fmtCtx(1000000) === "1M" && Core.fmtCtx(1050000) === "1.05M" && Core.fmtCtx(262144) === "262K");
  check("rewritePrice: decimals and spacing", Core.rewritePrice("API $0.15/$0.5 per 1M", 0.15, 0.5, 0.1, 0.4) === "API $0.1/$0.4 per 1M" && Core.rewritePrice("$5 / $25 today", 5, 25, 4, 20) === "$4/$20 today");
  check("rewritePrice: never touches a different number", Core.rewritePrice("$15/$75 and $1.5/$7.5", 1.5, 7.5, 1, 5) === "$15/$75 and $1/$5");
  const known = new Set(["openai/gpt-6.1-sol", "qwen/qwen3.8-max-0902", "deepseek/deepseek-v4-flash"]);
  check("variants: pro, prime, dated and stacked suffixes", Core.isVariantOfKnown("openai/gpt-6.1-sol-pro", known) && Core.isVariantOfKnown("qwen/qwen3.8-max-prime", known) && Core.isVariantOfKnown("deepseek/deepseek-v4-flash-vision-exp", known));
  check("variants: a genuinely new model is not a variant", !Core.isVariantOfKnown("qwen/qwen3.8-omni-flash", known));
}

/* ---------- 3. the merge in the browser ---------- */
{
  const db = clone(DB);
  const n0 = db.models.length;
  const r1 = LiveCatalog.applyDelta(db, clone(delta));
  check("merge: applies and reports what it did", r1.ok && r1.added === delta.added.length && r1.patched === Object.keys(delta.patches).length);
  check("merge: the catalog only grows", db.models.length === n0 + delta.added.length);
  const r2 = LiveCatalog.applyDelta(db, clone(delta));
  check("merge: applying the same delta twice changes nothing", r2.ok && r2.added === 0 && db.models.length === n0 + delta.added.length);
  const top = db.models.filter((m) => m.score && typeof m.score.aa === "number" && !m.score.est && m.status === "public").sort((a, b) => b.score.aa - a.score.aa)[0];
  check("merge: the live leader is the newest official #1", top.id === "claude-opus-5-5" && top.score.aa === 57.6);
  check("merge: reviews are untouched", db.models.filter((m) => !m.auto).every((m) => m.review === DB.models.find((x) => x.id === m.id).review));
  check("merge: no tag is ever removed", db.models.filter((m) => !m.auto).every((m) => DB.models.find((x) => x.id === m.id).tags.every((t) => m.tags.includes(t))));
  check("merge: the date and the note describe the live data", db.updated === delta.updated && db.scaleNote === delta.note && db.live && db.live.at === delta.retrievedAt);
  check("merge: rumored models stay unranked", db.models.filter((m) => m.status === "rumored").every((m) => !m.score || m.score.aa === null));

  const bad = LiveCatalog.applyDelta(clone(DB), Object.assign(clone(delta), { schemaVersion: 2 }));
  check("merge: a delta of an unknown schema is refused", bad.ok === false);
  const evil = clone(delta);
  evil.added = [Object.assign(clone(delta.added[0]), { id: "x-evil", or: ["evil/model-x"], name: "<img src=x onerror=alert(1)>Evil" }), Object.assign(clone(delta.added[0]), { id: "../etc", or: ["evil/model-y"] })];
  const db2 = clone(DB);
  LiveCatalog.applyDelta(db2, evil);
  const ev = db2.models.find((m) => m.id === "x-evil");
  check("merge: markup in an upstream name is neutralised", ev && !/[<>]/.test(ev.name));
  check("merge: an unsafe id is rejected", !db2.models.some((m) => m.id === "../etc"));
}

/* ---------- 4. the browser lifecycle: seed, cache, never backwards ---------- */
{
  const src = readFileSync("js/live-catalog.js", "utf8");
  class PinnedDate extends Date {}
  PinnedDate.now = () => WHEN + 3600000;
  function page(seed, cached) {
    const store = {};
    if (cached) store.whichai_live_catalog_v1 = JSON.stringify(cached);
    const ctx = {
      PromptCompassModelsDB: clone(DB), WhichAILiveSeed: seed,
      localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
      document: { readyState: "loading", addEventListener: () => {} }, addEventListener: () => {}, setTimeout: () => {},
      /* The page's clock is pinned to the fixture's day: a test must not
         start failing in December because October is "too old" by then. */
      Date: PinnedDate, JSON, Intl, Object, Array, Math, String, Number, isNaN, CustomEvent: function () {}, dispatchEvent: () => {}
    };
    ctx.window = ctx;
    vm.runInNewContext(src, ctx);
    return ctx;
  }
  const older = Object.assign(clone(delta), { retrievedAt: "2026-10-01T00:00:00.000Z", updated: "October 1, 2026" });
  const p1 = page(clone(delta), older);
  check("boot: the newest of seed and cache is applied before first paint", p1.PromptCompassModelsDB.updated === delta.updated && p1.WhichAILiveCatalog.state().source === "build");
  const p2 = page(null, clone(delta));
  check("boot: with no seed, this browser's saved copy is used", p2.PromptCompassModelsDB.updated === delta.updated && p2.WhichAILiveCatalog.state().source === "cache");
  const stale = Object.assign(clone(delta), { retrievedAt: "2026-01-01T00:00:00.000Z" });
  const p3 = page(null, stale);
  check("boot: a saved copy older than two weeks is ignored", p3.WhichAILiveCatalog.state().applied === null);
  check("boot: no seed and no cache leaves the editorial catalog as it is", page(null, null).PromptCompassModelsDB.updated === DB.updated);
}

/* ---------- 5. GET /api/catalog and the live API ---------- */
{
  const realFetch = globalThis.fetch;
  let upstreamCalls = 0;
  globalThis.fetch = async (url, opts) => {
    if (String(url).indexOf("https://openrouter.ai/") === 0) {
      upstreamCalls++;
      return new Response(JSON.stringify(FIXTURE), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return realFetch(url, opts);
  };
  const { createServer } = await import("../tools/api-dev.mjs");
  const server = createServer();
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const get = async (p) => { const res = await realFetch(base + p); const text = await res.text(); let json = null; try { json = JSON.parse(text); } catch (e) { /* 304 */ } return { res, json }; };

  const c1 = await get("/api/catalog");
  check("api: /api/catalog answers with a valid delta", c1.res.status === 200 && LiveCatalog.isDelta(c1.json) && c1.json.status === "fresh");
  check("api: cached at the edge for an hour, served stale while it refreshes", /s-maxage=3600/.test(c1.res.headers.get("cache-control")) && /stale-while-revalidate/.test(c1.res.headers.get("cache-control")));
  await get("/api/catalog");
  await get("/api/models?limit=1");
  check("api: one upstream read serves every endpoint and every request", upstreamCalls === 1, String(upstreamCalls));
  const models = await get("/api/models?measuredOnly=1&limit=3");
  check("api: /api/models serves the live catalog, new models included", models.json.models[0].id === "claude-opus-5-5" && models.json.meta.live && /Artificial Analysis/.test(models.json.meta.license));
  const health = await get("/api/health");
  check("api: health reports the editorial and the live side", health.json.data.addedAutomatically > 0 && health.json.data.editorialSnapshot === DB.updated && !!health.json.data.liveRetrievedAt && health.json.endpoints.some((e) => e.path === "/api/catalog"));
  const stats = await get("/api/stats");
  check("api: stats count what was added automatically", stats.json.totals.addedAutomatically === delta.added.length && stats.json.leaderboard[0].id === "claude-opus-5-5");
  const router = await get("/api/benchmarks?task=general");
  check("api: the server-side router reads the live catalog too", router.json.ranking[0].live && router.json.ranking[0].live.name === "Claude Opus 5.5" && /Right now Claude Opus 5\.5/.test(router.json.summary));
  check("api: the static catalog in memory is never mutated by a request", JSON.stringify(DB) === before);

  process.env.WHICHAI_LIVE = "off";
  const off = await get("/api/catalog");
  check("api: with the live layer switched off the endpoint says so and is not a delta", off.json.status === "disabled" && !LiveCatalog.isDelta(off.json));
  const offModels = await get("/api/models?limit=1");
  check("api: and the editorial catalog is served unchanged", offModels.json.meta.dataUpdated === DB.updated && !offModels.json.models.some((m) => m.auto));
  delete process.env.WHICHAI_LIVE;
  server.close();
  globalThis.fetch = realFetch;
}

/* ---------- 6. the build bakes current data in, without touching the repo ---------- */
{
  let out = "";
  try {
    out = execFileSync(process.execPath, ["tools/build.mjs"], { env: Object.assign({}, process.env, { WHICHAI_LIVE_FIXTURE: "tests/fixtures/openrouter-2026-10-03.json" }), encoding: "utf8" });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || e.message); }
  check("build: reports the live read", /live\s+\d+ official scores, \d+ models added/.test(out), out.split("\n").filter((l) => /live|check/.test(l)).join(" | "));
  const seedSrc = existsSync("dist/js/live-seed.js") ? readFileSync("dist/js/live-seed.js", "utf8") : "";
  const ctx = {};
  try { vm.runInNewContext(seedSrc, { window: ctx }); } catch (e) { /* checked below */ }
  check("build: the seed is a valid delta the browser will accept", LiveCatalog.isDelta(ctx.WhichAILiveSeed));
  check("build: wiki pages exist for models measured since the last commit", existsSync("dist/models/claude-opus-5-5.html") && !existsSync("models/claude-opus-5-5.html"));
  const page = existsSync("dist/models/claude-opus-5.html") ? readFileSync("dist/models/claude-opus-5.html", "utf8") : "";
  check("build: wiki figures are marked for live refresh", /data-live-score="claude-opus-5"/.test(page) && /\/js\/wiki-live\.js/.test(page));
  check("build: the repository copy of the seed stays empty", /WhichAILiveSeed = null/.test(readFileSync("js/live-seed.js", "utf8")));
  const off = execFileSync(process.execPath, ["tools/build.mjs"], { env: Object.assign({}, process.env, { WHICHAI_LIVE: "off" }), encoding: "utf8" });
  check("build: without the source it ships the committed snapshot and says so", /live\s+skipped/.test(off) && /check\s+ok/.test(off));
}

/* ---------- 7. wiring ---------- */
{
  const html = readFileSync("index.html", "utf8");
  const order = ["js/models-db.js", "js/live-seed.js", "js/live-catalog.js", "js/app.js"].map((f) => html.indexOf(f));
  check("wiring: seed and live catalog load after the database and before the app", order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])));
  const sw = readFileSync("sw.js", "utf8");
  check("wiring: both are precached for offline use, the API never is", sw.includes("js/live-seed.js") && sw.includes("js/live-catalog.js") && sw.includes('url.pathname.indexOf("/api/") === 0'));
  const app = readFileSync("js/app.js", "utf8");
  const ranking = readFileSync("js/ranking.js", "utf8");
  check("wiring: the app redraws every mounted chapter when fresh data lands", app.includes("onChange(onLiveData)") && /function onLiveData\(\) \{[\s\S]{0,600}WhichAIRanking\.rerender\(\)[\s\S]{0,600}WhichAIMarket\.rerender\(\)/.test(app));
  check("wiring: the site ships no free-route default of its own (v0.36)", !/DEFAULT_OR_MODELS|HISTORIC_OR_DEFAULTS|healFreeRoutes/.test(app));
  check("wiring: the free list shown is the live one", ["js/market.js", "js/stack.js", "js/finder.js"].every((f) => readFileSync(f, "utf8").includes("db.live.freeRoutes")));
  check("wiring: rankings use official measurements only", /!m\.score\.est && m\.status !== "rumored"/.test(ranking));
}

console.log("\n" + pass + " passed, " + fail + " failed" + (fail ? "" : " — CATALOG ALL GREEN"));
if (fail) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
