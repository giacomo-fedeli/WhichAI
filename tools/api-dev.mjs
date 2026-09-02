/* Local runner for the Vercel Functions in api/ (no Vercel CLI needed).
   Used by tests/api-tests.mjs and handy for manual checks:
   node tools/api-dev.mjs 8787  ->  http://localhost:8787/api/health      */
import http from "node:http";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const ROUTES = ["health", "models", "benchmarks", "recommend", "stats", "refresh"];

export function createServer() {
  const handlers = {};
  for (const r of ROUTES) handlers["/api/" + r] = require("../api/" + r + ".js");
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const h = handlers[url.pathname.replace(/\/$/, "")];
    if (!h) { res.statusCode = 404; res.end(JSON.stringify({ error: "Not found" })); return; }
    const query = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    req.query = query;
    h(req, res);
  });
}

if (process.argv[1] && process.argv[1].endsWith("api-dev.mjs")) {
  const port = Number(process.argv[2] || 8787);
  createServer().listen(port, () => console.log("API dev server on http://localhost:" + port));
}
