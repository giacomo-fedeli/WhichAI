/*
 * GET /api/health - is the backend alive, which data is it serving, and
 * what else can you call? Also the endpoint the scheduled data-refresh
 * workflow pings to confirm a deploy went out with fresh data.
 */
"use strict";

var L = require("./_lib.js");

/* Health must answer fast even on a cold start: the live catalog gets 2.5 s,
   then the editorial catalog answers alone and says so. */
function within(ms, promise, fallback) {
  return Promise.race([promise, new Promise(function (r) { setTimeout(function () { r(fallback); }, ms); })]);
}

module.exports = async function handler(req, res) {
  if (!L.guard(req, res)) return;
  var started = Date.now();
  var DBx = await within(2500, L.currentDB().catch(function () { return L.DB; }), L.DB);
  var ok = Array.isArray(DBx.models) && DBx.models.length > 0 && !!L.Bench.taskTypes;

  L.send(req, res, ok ? 200 : 503, {
    status: ok ? "ok" : "degraded",
    apiVersion: L.API_VERSION,
    appVersion: L.APP_VERSION,
    time: new Date().toISOString(),
    region: process.env.VERCEL_REGION || "local",
    data: {
      models: Array.isArray(DBx.models) ? DBx.models.length : 0,
      editorialModels: L.DB.models.length,
      addedAutomatically: DBx.models.filter(function (m) { return m.auto === true; }).length,
      taskTypes: L.Bench.taskTypes ? Object.keys(L.Bench.taskTypes).length : 0,
      dataUpdated: DBx.updated,
      editorialSnapshot: L.DB.updated,
      liveRetrievedAt: DBx.live ? DBx.live.at : null,
      benchmarkUpdated: L.Bench.updated
    },
    endpoints: [
      { path: "/api/health", what: "this page" },
      { path: "/api/models", what: "model catalog with filters, search and pagination" },
      { path: "/api/models?id=claude-opus-5", what: "one model" },
      { path: "/api/benchmarks", what: "curated task rankings and sources" },
      { path: "/api/benchmarks?task=coding", what: "router answer for one task" },
      { path: "/api/recommend?goal=...", what: "task detection plus recommended AI" },
      { path: "/api/stats", what: "server-side aggregates and leaderboard" },
      { path: "/api/refresh", what: "the automated data check against public sources" }
      ,{ path: "/api/live", what: "automatically refreshed OpenRouter routes, pricing and attributed benchmarks" }
      ,{ path: "/api/catalog", what: "the self-updating catalog: official AA scores, prices, new models, live free routes" }
      ,{ path: "/api/news", what: "the Radar news wire: lab blogs, TechCrunch AI, Hacker News, Hugging Face (titles and links)" }
    ],
    docs: "https://whichai.wiki/docs/API.md",
    license: "CC BY 4.0 (attribution: WhichAI, whichai.wiki). Scores: Artificial Analysis, relayed by OpenRouter.",
    latencyMs: Date.now() - started
  }, 60);
};
