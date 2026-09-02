/*
 * WhichAI - scheduled data check, command-line runner (v0.32.0)
 *
 * The analysis itself lives in api/_refresh-core.js and is shared with
 * /api/refresh, so the check cannot mean two different things depending on
 * where it runs. This file is the CLI and CI wrapper around it: fetch,
 * render, write the report, set the GitHub Actions outputs.
 *
 * Usage:
 *   node tools/refresh-data.mjs                       check and write the report
 *   node tools/refresh-data.mjs --strict              exit 1 if a shipped free route died
 *   node tools/refresh-data.mjs --fixture path.json   offline run, for the tests
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const Core = require("../api/_refresh-core.js");
const DB = require("../js/models-db.js");
const appSrc = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");

const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const fixtureIdx = args.indexOf("--fixture");
const FIXTURE = fixtureIdx >= 0 ? args[fixtureIdx + 1] : null;

const out = (name, body) => writeFileSync(new URL("../data/" + name, import.meta.url), body);
const appendEnvFile = (envVar, body) => {
  if (process.env[envVar]) writeFileSync(process.env[envVar], body, { flag: "a" });
};

/* A public source being down is not a reason to page anyone at 06:00 on a
   Monday. Report it as a skipped check and exit clean, unless --strict. */
let upstream = null;
let sourceError = null;
try {
  upstream = FIXTURE ? JSON.parse(readFileSync(FIXTURE, "utf8")) : await Core.fetchUpstream(30000);
} catch (err) {
  sourceError = err && err.message ? err.message : String(err);
}

if (!upstream) {
  const md = [
    "## WhichAI scheduled data check",
    "",
    "**Skipped: the upstream source did not answer.**",
    "",
    "- Source: `" + Core.OR_ENDPOINT + "`",
    "- Reason: " + sourceError,
    "- Catalog left untouched (snapshot " + DB.updated + ", " + DB.models.length + " models).",
    "",
    "Nothing is wrong with the catalog: the check simply could not run. The next scheduled run will retry.",
    ""
  ].join("\n");
  console.log(md);
  out("refresh-report.json", JSON.stringify(Core.skippedReport(sourceError, DB), null, 1) + "\n");
  out("refresh-report.md", md + "\n");
  appendEnvFile("GITHUB_STEP_SUMMARY", md + "\n");
  appendEnvFile("GITHUB_OUTPUT", "changes=0\ndead_routes=0\nsource_error=1\n");
  process.exit(STRICT ? 1 : 0);
}

const report = Core.analyse(upstream, DB, appSrc);
const md = Core.markdown(report);

out("refresh-report.json", JSON.stringify(report, null, 1) + "\n");
out("refresh-report.md", md + "\n");
console.log(md);

appendEnvFile("GITHUB_STEP_SUMMARY", md + "\n");
appendEnvFile("GITHUB_OUTPUT", "changes=" + report.actionable + "\ndead_routes=" + report.deadFreeRoutes.length + "\n");

if (STRICT && report.deadFreeRoutes.length) {
  console.error("\nFAIL: shipped free route(s) gone: " + report.deadFreeRoutes.join(", "));
  process.exit(1);
}
