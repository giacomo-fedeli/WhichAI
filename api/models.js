/*
 * GET /api/models - the WhichAI open model catalog (109+ models).
 * Read-only, public, CORS-open: CC BY 4.0, so anyone can build on it.
 *
 * Query parameters (all optional, all combinable):
 *   id=claude-opus-5      single model by id (404 when unknown)
 *   q=coding              free text over name, vendor, family, review
 *   vendor=Anthropic      exact vendor match (case-insensitive)
 *   tag=free              repeatable via comma: tag=free,open-weights (AND)
 *   label=coding          category label filter
 *   status=public         public | preview | rumored | legacy
 *   minScore=50           minimum Artificial Analysis index
 *   measuredOnly=1        drop models whose score is an estimate
 *   sort=score|name|vendor  default score (desc)
 *   limit=50&offset=0     pagination, limit 1..200 (default 200)
 *   fields=id,name,score  trim the payload
 */
"use strict";

var L = require("./_lib.js");

function norm(s) { return String(s == null ? "" : s).toLowerCase(); }

function listParam(v) {
  return String(v || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
}

function pick(model, fields) {
  if (!fields.length) return model;
  var out = {};
  fields.forEach(function (f) { if (f in model) out[f] = model[f]; });
  return out;
}

module.exports = function handler(req, res) {
  if (!L.guard(req, res)) return;
  var q = L.query(req);
  var models = L.DB.models.slice();

  if (q.id) {
    var one = models.filter(function (m) { return m.id === String(q.id); })[0];
    if (!one) return L.fail(req, res, 404, "Model not found", "Try /api/models?q=" + encodeURIComponent(String(q.id)));
    return L.send(req, res, 200, {
      meta: L.meta(),
      model: one,
      links: { official: L.DB.links[one.family] || L.DB.vendorLinks[one.vendor] || null, page: "https://whichai.wiki/models/" + one.id + ".html" }
    });
  }

  var text = norm(q.q);
  if (text) {
    models = models.filter(function (m) {
      return norm(m.name).indexOf(text) >= 0 || norm(m.vendor).indexOf(text) >= 0 ||
        norm(m.family).indexOf(text) >= 0 || norm(m.review).indexOf(text) >= 0 ||
        (m.tags || []).some(function (t) { return norm(t).indexOf(text) >= 0; }) ||
        (m.labels || []).some(function (t) { return norm(t).indexOf(text) >= 0; });
    });
  }
  if (q.vendor) {
    var v = norm(q.vendor);
    models = models.filter(function (m) { return norm(m.vendor) === v; });
  }
  var tags = listParam(q.tag);
  if (tags.length) {
    models = models.filter(function (m) {
      var have = (m.tags || []).map(norm);
      return tags.every(function (t) { return have.indexOf(t) >= 0; });
    });
  }
  var labels = listParam(q.label);
  if (labels.length) {
    models = models.filter(function (m) {
      var have = (m.labels || []).map(norm);
      return labels.every(function (t) { return have.indexOf(t) >= 0; });
    });
  }
  if (q.status) {
    var st = norm(q.status);
    models = models.filter(function (m) { return norm(m.status) === st; });
  }
  if (q.minScore != null && q.minScore !== "") {
    var min = parseFloat(q.minScore);
    if (isFinite(min)) models = models.filter(function (m) { return m.score && typeof m.score.aa === "number" && m.score.aa >= min; });
  }
  if (q.measuredOnly === "1" || q.measuredOnly === "true") {
    models = models.filter(function (m) { return m.score && m.score.est === false; });
  }

  var total = models.length;
  var sort = String(q.sort || "score");
  models.sort(function (a, b) {
    if (sort === "name") return String(a.name).localeCompare(String(b.name));
    if (sort === "vendor") return String(a.vendor).localeCompare(String(b.vendor)) || String(a.name).localeCompare(String(b.name));
    var as = a.score && typeof a.score.aa === "number" ? a.score.aa : -1;
    var bs = b.score && typeof b.score.aa === "number" ? b.score.aa : -1;
    return bs - as;
  });

  var limit = L.intParam(q.limit, 200, 1, 200);
  var offset = L.intParam(q.offset, 0, 0, 100000);
  var fields = listParam(q.fields);
  var page = models.slice(offset, offset + limit).map(function (m) { return pick(m, fields); });

  L.send(req, res, 200, {
    meta: L.meta(),
    total: total,
    count: page.length,
    offset: offset,
    limit: limit,
    models: page
  });
};
