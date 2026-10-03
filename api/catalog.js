/*
 * GET /api/catalog - the catalog that updates itself (v0.35).
 *
 * Returns the delta computed by api/_catalog-core.js from OpenRouter's public
 * model list: official Artificial Analysis scores, current prices, free routes
 * alive right now, models measured since the last deploy, and the newest
 * arrivals. The browser (js/live-catalog.js) lays it over the editorial
 * catalog on every visit, so nobody has to edit a file for the site to stay
 * current.
 *
 * Read-only. Cached at the edge for an hour (five minutes when the source is
 * stale), served stale for a day while it revalidates, so the upstream sees
 * roughly one request per hour per region however busy the site gets.
 */
"use strict";

var L = require("./_lib.js");

module.exports = async function handler(req, res) {
  if (!L.guard(req, res)) return;
  var c = null;
  try { c = await L.currentDelta(); } catch (e) { c = null; }
  if (!c) {
    return L.send(req, res, 200, {
      schemaVersion: 1,
      kind: "whichai-live-catalog",
      status: L.liveEnabled() ? "unavailable" : "disabled",
      reason: "The public source did not answer. The editorial catalog is served unchanged.",
      editorial: L.DB.updated,
      meta: L.meta()
    }, 120);
  }
  var body = Object.assign({ status: c.status, meta: L.meta() }, c.delta);
  L.send(req, res, 200, body, c.status === "fresh" ? 3600 : 300);
};
