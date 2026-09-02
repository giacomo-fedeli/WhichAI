/*
 * GET /api/refresh - the data check, running on Vercel instead of GitHub.
 *
 * Why this exists alongside the GitHub Action: the Action can be blocked by
 * something that has nothing to do with the code (an account lock, a policy,
 * a quota), and an automation that only works when a third party is happy is
 * not really automation. This endpoint runs the identical check from
 * api/_refresh-core.js, on the same host that already serves the site, with
 * no account, no token and no cost.
 *
 * A Vercel Cron calls it daily (see "crons" in vercel.json), and the Model
 * Radar page reads it so the answer is visible where the data lives.
 *
 * Read-only: it inspects a public source and reports. It never edits the
 * catalog - a machine does not get to change the numbers the site is judged on.
 */
"use strict";

var L = require("./_lib.js");
var Core = require("./_refresh-core.js");
var fs = require("node:fs");
var path = require("node:path");

/* The shipped free-route defaults live in js/app.js. Reading the file keeps
   the check honest; if it cannot be read we say so rather than pass silently. */
function appSource() {
  try {
    return fs.readFileSync(path.join(process.cwd(), "js", "app.js"), "utf8");
  } catch (e) {
    try {
      return fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8");
    } catch (e2) {
      return "";
    }
  }
}

module.exports = async function handler(req, res) {
  if (!L.guard(req, res)) return;

  var appSrc = appSource();
  var report;
  try {
    var upstream = await Core.fetchUpstream(15000);
    report = Core.analyse(upstream, L.DB, appSrc);
  } catch (err) {
    /* A public source being down is not an error in WhichAI. Report it as a
       skipped check with a 200 so the page can say "could not check today"
       instead of showing a scary failure it cannot explain. */
    report = Core.skippedReport(err && err.message ? err.message : String(err), L.DB);
  }

  if (!appSrc) {
    report.needsHuman = (report.needsHuman || []).concat(
      "The free-route defaults could not be read from js/app.js, so that check did not run."
    );
    report.severity = report.severity === "clean" ? "unknown" : report.severity;
  }

  report.meta = L.meta();
  report.docs = "https://whichai.wiki/docs/API.md";

  /* Six hours: often enough to catch a dead free route the same day, rare
     enough to be a courteous guest on someone else's public API. */
  L.send(req, res, 200, report, 21600);
};
