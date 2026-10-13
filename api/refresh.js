/*
 * GET /api/refresh - the data check, running on Vercel instead of GitHub.
 *
 * This endpoint runs the diagnostic check from api/_refresh-core.js.
 * The report is not persisted and does not update the browser catalog:
 * /api/catalog supplies the automatically refreshed data the browser uses.
 *
 * A Vercel Cron calls it daily (see "crons" in vercel.json), and the Model
 * Radar page reads it so the answer is visible where the data lives. A cron
 * only invokes the check; without durable storage it is not a change log.
 *
 * Read-only: it inspects a public source and reports. It never edits the
 * catalog - a machine does not get to change the numbers the site is judged on.
 */
"use strict";

var L = require("./_lib.js");
var Core = require("./_refresh-core.js");

module.exports = async function handler(req, res) {
  if (!L.guard(req, res)) return;

  var report;
  try {
    var upstream = await Core.fetchUpstream(15000);
    report = Core.analyse(upstream, L.DB);
  } catch (err) {
    /* A public source being down is not an error in WhichAI. Report it as a
       skipped check with a 200 so the page can say "could not check today"
       instead of showing a scary failure it cannot explain. */
    report = Core.skippedReport(err && err.message ? err.message : String(err), L.DB);
  }

  report.meta = L.meta();
  report.docs = "https://whichai.wiki/docs/API.md";

  /* Six hours: often enough to notice a retired free route the same day,
     rare enough to be a courteous guest on someone else's public API. */
  L.send(req, res, 200, report, 21600);
};
