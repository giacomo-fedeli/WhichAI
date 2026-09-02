/*
 * GET /api/health - is the backend alive, which data is it serving, and
 * what else can you call? Also the endpoint the scheduled data-refresh
 * workflow pings to confirm a deploy went out with fresh data.
 */
"use strict";

var L = require("./_lib.js");

module.exports = function handler(req, res) {
  if (!L.guard(req, res)) return;
  var started = Date.now();
  var ok = Array.isArray(L.DB.models) && L.DB.models.length > 0 && !!L.Bench.taskTypes;

  L.send(req, res, ok ? 200 : 503, {
    status: ok ? "ok" : "degraded",
    apiVersion: L.API_VERSION,
    appVersion: L.APP_VERSION,
    time: new Date().toISOString(),
    region: process.env.VERCEL_REGION || "local",
    data: {
      models: Array.isArray(L.DB.models) ? L.DB.models.length : 0,
      taskTypes: L.Bench.taskTypes ? Object.keys(L.Bench.taskTypes).length : 0,
      dataUpdated: L.DB.updated,
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
    ],
    docs: "https://whichai.wiki/docs/API.md",
    license: "CC BY 4.0 (attribution: WhichAI, whichai.wiki)",
    latencyMs: Date.now() - started
  }, 60);
};
