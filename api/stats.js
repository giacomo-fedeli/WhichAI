/*
 * GET /api/stats - aggregates computed on the server, not in the browser.
 * Powers the "Market at a glance" numbers and is useful on its own for
 * anyone studying the model landscape.
 *
 *   top=10   how many models in the leaderboard slice (1..50, default 10)
 */
"use strict";

var L = require("./_lib.js");

function tally(models, key) {
  var out = {};
  models.forEach(function (m) {
    (m[key] || []).forEach(function (v) { out[v] = (out[v] || 0) + 1; });
  });
  return Object.keys(out).sort(function (a, b) { return out[b] - out[a]; })
    .map(function (k) { return { name: k, count: out[k] }; });
}

module.exports = function handler(req, res) {
  if (!L.guard(req, res)) return;
  var q = L.query(req);
  var models = L.DB.models;
  var measured = models.filter(function (m) { return m.score && m.score.est === false && typeof m.score.aa === "number"; });
  var vendors = {};
  models.forEach(function (m) { vendors[m.vendor] = (vendors[m.vendor] || 0) + 1; });

  var scores = measured.map(function (m) { return m.score.aa; }).sort(function (a, b) { return a - b; });
  function pct(p) {
    if (!scores.length) return null;
    var i = Math.min(scores.length - 1, Math.max(0, Math.round((p / 100) * (scores.length - 1))));
    return Math.round(scores[i] * 10) / 10;
  }

  var top = L.intParam(q.top, 10, 1, 50);
  var leaderboard = measured.slice().sort(function (a, b) { return b.score.aa - a.score.aa; }).slice(0, top)
    .map(function (m, i) { return { rank: i + 1, id: m.id, name: m.name, vendor: m.vendor, score: m.score.aa }; });

  L.send(req, res, 200, {
    meta: L.meta(),
    totals: {
      models: models.length,
      vendors: Object.keys(vendors).length,
      measuredScores: measured.length,
      estimatedScores: models.length - measured.length,
      free: models.filter(function (m) { return (m.tags || []).indexOf("free") >= 0; }).length,
      openWeights: models.filter(function (m) { return (m.tags || []).indexOf("open-weights") >= 0; }).length,
      inGenerator: models.filter(function (m) { return (m.tags || []).indexOf("prompt-target") >= 0; }).length,
      autoRun: models.filter(function (m) { return (m.tags || []).indexOf("auto-run") >= 0; }).length,
      rumored: models.filter(function (m) { return m.status === "rumored"; }).length
    },
    scoreDistribution: { min: pct(0), p25: pct(25), median: pct(50), p75: pct(75), max: pct(100) },
    byVendor: Object.keys(vendors).sort(function (a, b) { return vendors[b] - vendors[a]; })
      .map(function (k) { return { vendor: k, count: vendors[k] }; }),
    byTag: tally(models, "tags"),
    byLabel: tally(models, "labels"),
    leaderboard: leaderboard
  });
};
