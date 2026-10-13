/*
 * GET /api/news - the Model Radar's news wire (v0.36).
 * Official lab blogs, TechCrunch AI, Hacker News and Hugging Face, merged into
 * one dated list of headlines and links. Computed by api/_news-core.js,
 * cached at the edge for 30 minutes and served stale while it refreshes.
 * Read-only, keyless, no tracking: like every WhichAI endpoint.
 */
"use strict";

var L = require("./_lib.js");
var Core = require("./_news-core.js");
var service = Core.createService();

module.exports = async function handler(req, res) {
  if (!L.guard(req, res)) return;
  var wire = null;
  try { wire = await service.get(); } catch (e) { wire = null; }
  if (!wire) {
    return L.send(req, res, 200, { schemaVersion: 1, kind: "whichai-news", items: [], sources: [], status: "unavailable" }, 120);
  }
  var anyOk = wire.sources.some(function (s) { return s.ok; });
  L.send(req, res, 200, Object.assign({ status: anyOk ? "fresh" : "unavailable" }, wire), anyOk ? 1800 : 120);
};
