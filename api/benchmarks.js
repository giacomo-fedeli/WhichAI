/*
 * GET /api/benchmarks - the task router, executed on the server.
 *
 * Without parameters it returns the full curated dataset (8 task types,
 * their rankings, confidence levels and linked sources).
 *
 *   task=coding   run the router for one task and return the ranked answer
 *   apps=1        include the app profiles used to build the rankings
 */
"use strict";

var L = require("./_lib.js");

module.exports = function handler(req, res) {
  if (!L.guard(req, res)) return;
  var q = L.query(req);
  var tasks = Object.keys(L.Bench.taskTypes);

  if (q.task) {
    var key = String(q.task).toLowerCase();
    if (tasks.indexOf(key) < 0) {
      return L.fail(req, res, 400, "Unknown task type", "Valid values: " + tasks.join(", "));
    }
    var rec = L.Bench.recommend(key);
    var top = rec.ranking && rec.ranking[0];
    return L.send(req, res, 200, {
      meta: L.meta(),
      task: key,
      bestPick: top ? { app: top.app, label: (L.Bench.apps[top.app] || {}).label || top.app, why: top.note || null } : null,
      confidence: rec.confidence,
      summary: rec.summary,
      ranking: rec.ranking,
      sources: L.Bench.sources,
      disclaimer: L.Bench.disclaimer
    });
  }

  var body = {
    meta: L.meta(),
    updated: L.Bench.updated,
    disclaimer: L.Bench.disclaimer,
    taskTypes: tasks,
    confidenceNotes: L.Bench.CONFIDENCE_NOTES,
    rankings: L.Bench.taskTypes,
    sources: L.Bench.sources
  };
  if (q.apps === "1" || q.apps === "true") body.apps = L.Bench.apps;
  L.send(req, res, 200, body);
};
