/* WhichAI - API test suite (v0.30).
   Boots the real serverless handlers behind a local node:http server and
   exercises every endpoint the way a caller would: happy paths, filters,
   pagination, caching, error shapes and the read-only guarantee.
   Run: node tests/api-tests.mjs                                        */
import { createServer } from "../tools/api-dev.mjs";

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " - " + detail : "")); console.log("FAIL  " + name + (detail ? " - " + detail : "")); }
}

const server = createServer();
await new Promise((r) => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;
const get = async (p, opts) => {
  const res = await fetch(base + p, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 304 has no body */ }
  return { res, json, text };
};

/* ---------- 1. health ---------- */
{
  const { res, json } = await get("/api/health");
  check("health: 200 ok", res.status === 200 && json.status === "ok");
  check("health: reports data volume", json.data.models > 100 && json.data.taskTypes === 8);
  check("health: advertises every endpoint", json.endpoints.length >= 7 && json.endpoints.every((e) => e.path.startsWith("/api/")));
  check("health: json content type", /application\/json/.test(res.headers.get("content-type")));
  check("health: cors open (public dataset)", res.headers.get("access-control-allow-origin") === "*");
}

/* ---------- 2. models: shape, filters, pagination ---------- */
{
  const { json } = await get("/api/models");
  check("models: returns the whole catalog", json.total > 100 && json.models.length === json.total);
  check("models: sorted by score desc by default", json.models[0].score.aa >= json.models[1].score.aa);
  check("models: meta carries licence and snapshot", /CC BY 4.0/.test(json.meta.license) && !!json.meta.dataUpdated);

  const paged = await get("/api/models?limit=5&offset=2");
  check("models: pagination honoured", paged.json.models.length === 5 && paged.json.offset === 2);
  check("models: limit is capped, not trusted", (await get("/api/models?limit=99999")).json.limit === 200);

  const free = await get("/api/models?tag=free,open-weights");
  check("models: multi-tag filter is AND", free.json.models.every((m) => m.tags.includes("free") && m.tags.includes("open-weights")));

  const vendor = await get("/api/models?vendor=anthropic");
  check("models: vendor filter is case-insensitive", vendor.json.total > 0 && vendor.json.models.every((m) => m.vendor.toLowerCase() === "anthropic"));

  const measured = await get("/api/models?measuredOnly=1&minScore=55");
  check("models: measuredOnly drops estimates", measured.json.models.every((m) => m.score.est === false && m.score.aa >= 55));

  const fields = await get("/api/models?fields=id,name&limit=1");
  check("models: fields trims the payload", Object.keys(fields.json.models[0]).join(",") === "id,name");

  const byName = await get("/api/models?sort=name&limit=3");
  check("models: sort=name is alphabetical", byName.json.models[0].name.localeCompare(byName.json.models[1].name) <= 0);

  const q = await get("/api/models?q=opus");
  check("models: free text search finds a known model", q.json.models.some((m) => /opus/i.test(m.name)));

  const one = await get("/api/models?id=claude-opus-5");
  check("models: single model carries links", one.json.model.id === "claude-opus-5" && /whichai\.wiki\/models\//.test(one.json.links.page));
  const missing = await get("/api/models?id=definitely-not-a-model");
  check("models: unknown id is a 404 with a hint", missing.res.status === 404 && !!missing.json.hint);
}

/* ---------- 3. benchmarks and the router ---------- */
{
  const all = await get("/api/benchmarks");
  check("benchmarks: lists the 8 task types", all.json.taskTypes.length === 8);
  check("benchmarks: every source is https", all.json.sources.every((s) => /^https:/.test(s.url)));

  const coding = await get("/api/benchmarks?task=coding");
  check("benchmarks: router answers for one task", coding.json.bestPick && coding.json.bestPick.app && coding.json.ranking.length >= 3);
  check("benchmarks: best pick carries the reason", typeof coding.json.bestPick.why === "string" && coding.json.bestPick.why.length > 20);

  const bad = await get("/api/benchmarks?task=cooking");
  check("benchmarks: unknown task is a 400 listing valid values", bad.res.status === 400 && /writing/.test(bad.json.hint));
}

/* ---------- 4. recommend: the actual question, answered server-side ---------- */
{
  const r = await get("/api/recommend?goal=" + encodeURIComponent("write a python script that parses a csv"));
  check("recommend: detects the task from plain language", r.json.detectedTask === "coding");
  check("recommend: returns a best pick with a reason", !!r.json.bestPick.label && !!r.json.bestPick.why);
  check("recommend: always offers a free alternative", !!r.json.freeAlternative && !!r.json.freeAlternative.name);
  check("recommend: free alternative is really free", !!r.json.freeAlternative.access);
  check("recommend: links back to the prompt builder", /whichai\.wiki\/#goal=/.test(r.json.promptBuilder));

  const empty = await get("/api/recommend");
  check("recommend: missing goal is a 400 with an example", empty.res.status === 400 && /example/i.test(empty.json.hint));
  const long = await get("/api/recommend?goal=" + "x".repeat(700));
  check("recommend: over-long goal is rejected (413)", long.res.status === 413);
}

/* ---------- 5. stats ---------- */
{
  const { json } = await get("/api/stats?top=5");
  check("stats: totals add up", json.totals.measuredScores + json.totals.estimatedScores === json.totals.models);
  check("stats: leaderboard respects top=", json.leaderboard.length === 5 && json.leaderboard[0].rank === 1);
  check("stats: percentiles are ordered", json.scoreDistribution.min <= json.scoreDistribution.median && json.scoreDistribution.median <= json.scoreDistribution.max);
  check("stats: vendor tally is sorted desc", json.byVendor[0].count >= json.byVendor[1].count);
}

/* ---------- 6. caching, methods, safety ---------- */
{
  const first = await get("/api/models?limit=1");
  const etag = first.res.headers.get("etag");
  check("cache: weak etag issued", /^W\//.test(etag || ""));
  const second = await get("/api/models?limit=1", { headers: { "If-None-Match": etag } });
  check("cache: revalidation returns 304 with no body", second.res.status === 304 && second.text === "");
  check("cache: edge caching enabled", /s-maxage=\d+/.test(first.res.headers.get("cache-control") || ""));

  const post = await fetch(base + "/api/models", { method: "POST" });
  check("safety: writes are refused (405)", post.status === 405 && /GET/.test(post.headers.get("allow") || ""));
  const opts = await fetch(base + "/api/models", { method: "OPTIONS" });
  check("safety: preflight answered (204)", opts.status === 204);
  const head = await fetch(base + "/api/health", { method: "HEAD" });
  check("safety: HEAD works and sends no body", head.status === 200 && (await head.text()) === "");
  check("safety: nosniff header set", first.res.headers.get("x-content-type-options") === "nosniff");
}

/* ---------- 7. no user data anywhere ---------- */
{
  const all = await get("/api/models");
  const blob = JSON.stringify(all.json).toLowerCase();
  check("privacy: no key, token or cookie field in any payload", !/"(apikey|token|cookie|session|email)"/.test(blob));
}

server.close();
console.log("\n" + pass + " passed, " + fail + " failed");
if (fail) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
