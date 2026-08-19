/*
 * GET /api/recommend?goal=... - the whole decision in one call.
 *
 * The server detects the task type from a plain-language goal, runs the
 * benchmark router, and returns the recommended AI plus a free alternative
 * taken from the catalog. This is the piece of WhichAI that answers the
 * actual question ("which AI should do this?") without the browser needing
 * any of the ranking logic.
 *
 *   goal=write a python script that parses a csv   (required, <= 600 chars)
 *   free=1   force the free-tier alternative to lead
 */
"use strict";

var L = require("./_lib.js");

function freeAlternative(taskKey) {
  var labelMap = { coding: "coding", writing: "writing", analysis: "reasoning", research: "research", brainstorming: "writing", education: "writing", business: "writing", general: "reasoning" };
  var want = labelMap[taskKey] || "reasoning";
  var pool = L.DB.models.filter(function (m) {
    return m.status === "public" && (m.tags || []).indexOf("free") >= 0 &&
      (m.tags || []).indexOf("info-only") < 0 && m.score && typeof m.score.aa === "number";
  });
  pool.sort(function (a, b) {
    var ac = (a.score.cat && a.score.cat[want]) || 0;
    var bc = (b.score.cat && b.score.cat[want]) || 0;
    return (bc - ac) || (b.score.aa - a.score.aa);
  });
  var m = pool[0];
  if (!m) return null;
  return { id: m.id, name: m.name, vendor: m.vendor, access: m.access, score: m.score.aa, estimated: !!m.score.est, page: "https://whichai.wiki/models/" + m.id + ".html" };
}

module.exports = function handler(req, res) {
  if (!L.guard(req, res)) return;
  var q = L.query(req);
  var goal = String(q.goal || "").trim();
  if (!goal) {
    return L.fail(req, res, 400, "Missing goal", 'Example: /api/recommend?goal=summarise a 40 page report for my manager');
  }
  if (goal.length > 600) {
    return L.fail(req, res, 413, "Goal too long", "Keep the goal under 600 characters.");
  }

  var detected = L.Engine.detectTaskType(goal) || "general";
  var rec = L.Bench.recommend(detected);
  var top = rec.ranking && rec.ranking[0];
  var second = rec.ranking && rec.ranking[1];

  L.send(req, res, 200, {
    meta: L.meta(),
    goal: goal,
    detectedTask: detected,
    confidence: rec.confidence,
    bestPick: top ? {
      app: top.app,
      label: (L.Bench.apps[top.app] || {}).label || top.app,
      why: top.note || null,
      freeTier: (L.Bench.apps[top.app] || {}).freeModel || null
    } : null,
    runnerUp: second ? { app: second.app, label: (L.Bench.apps[second.app] || {}).label || second.app, why: second.note || null } : null,
    freeAlternative: freeAlternative(detected),
    summary: rec.summary,
    promptBuilder: "https://whichai.wiki/#goal=" + encodeURIComponent(goal.slice(0, 200)),
    disclaimer: L.Bench.disclaimer,
    note: "Rankings are curated from public leaderboards and shift fast. Guidance, not gospel."
  }, 1800);
};
