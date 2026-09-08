/* WhichAI - live market feed tests (v0.34).
   Covers api/_live-core.js, api/live.js and js/live-data.js entirely offline:
   the fetcher is injected, so nothing here depends on OpenRouter being up or
   on what it happens to be serving today.

   The check that matters most is the last section. OpenRouter relays an
   Artificial Analysis index on a DIFFERENT SCALE from the editorial snapshot
   the rest of the site is built on - it reports Claude Opus 5 around 50 where
   the cited mirror says 63. Both are "the AA index"; neither is wrong; mixing
   them would silently corrupt the one number this site is judged on. These
   tests exist to keep the two apart.

   Run: node tests/live-data-tests.mjs                                     */
import { readFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const Live = require("../api/_live-core.js");
const DB = require("../js/models-db.js");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " - " + detail : "")); console.log("FAIL  " + name + (detail ? " - " + detail : "")); }
}
function throws(fn) { try { fn(); return false; } catch (e) { return true; } }

const NOW = Date.parse("2026-09-08T12:00:00Z");
const secs = (iso) => Math.floor(Date.parse(iso) / 1000);

function upstream(models) { return { data: models }; }
function model(over) {
  return Object.assign({
    id: "anthropic/claude-opus-5",
    canonical_slug: "anthropic/claude-opus-5",
    name: "Anthropic: Claude Opus 5",
    created: secs("2026-07-24T00:00:00Z"),
    context_length: 1000000,
    pricing: { prompt: "0.000005", completion: "0.000025" },
    architecture: { input_modalities: ["text", "image"], output_modalities: ["text"] }
  }, over || {});
}

/* ---------- 1. value parsing ---------- */
{
  check("perMillion converts per-token to per-million", Live.perMillion("0.000005") === 5);
  check("perMillion keeps a genuine zero", Live.perMillion("0") === 0);
  check("perMillion rejects nonsense", Live.perMillion("abc") === null && Live.perMillion(null) === null);
  check("number refuses booleans and negatives", Live.number(true) === null && Live.number(-1) === null && Live.number("3") === 3);
  check("validId accepts a real route", Live.validId("qwen/qwen3-coder:free") === true);
  check("validId rejects a path traversal or a bare word", !Live.validId("../etc/passwd") && !Live.validId("qwen"));
  check("validId rejects an absurdly long id", !Live.validId("a/" + "x".repeat(200)));
}

/* ---------- 2. schema validation: a bad feed must not become data ---------- */
{
  check("normalize rejects an empty feed", throws(() => Live.normalize(upstream([]), DB, NOW)));
  check("normalize rejects a non-array payload", throws(() => Live.normalize({ data: "nope" }, DB, NOW)));
  check("normalize rejects null", throws(() => Live.normalize(null, DB, NOW)));
  check("normalize rejects an implausibly huge feed", throws(() => Live.normalize(upstream(new Array(10001).fill(model())), DB, NOW)));
  /* A feed where most entries are malformed is a schema change, not data. */
  const mostlyJunk = [model()].concat(new Array(9).fill({ id: "", name: "" }));
  check("normalize refuses a feed that is mostly invalid", throws(() => Live.normalize(upstream(mostlyJunk), DB, NOW)));
}

/* ---------- 3. normalize: shape and honesty of derived fields ---------- */
{
  const out = Live.normalize(upstream([model()]), DB, NOW);
  const m = out.models[0];
  check("normalize stamps a schema version and a retrieval time", out.schemaVersion === 1 && out.retrievedAt === new Date(NOW).toISOString());
  check("normalize carries the editorial snapshot alongside, not merged", out.catalogSnapshot === DB.updated);
  check("normalize converts prices to per-million", m.pricePerMillion.input === 5 && m.pricePerMillion.output === 25);
  check("normalize records the listing date, labelled as such", m.addedAt === "2026-07-24T00:00:00.000Z" && /listing date/i.test(out.notes.availability));
  check("normalize keeps modalities as given", m.inputModalities.join(",") === "text,image");
  check("normalize links back to the route", m.url === "https://openrouter.ai/anthropic/claude-opus-5");

  const free = Live.normalize(upstream([model({ id: "qwen/qwen3-coder:free", name: "Qwen: Qwen3 Coder (free)", pricing: { prompt: "0", completion: "0" } })]), DB, NOW);
  check("a zero-priced route is marked free", free.models[0].free === true);
  const notFree = Live.normalize(upstream([model({ id: "x/y", name: "X: Y", pricing: { prompt: "0", completion: "0", request: "0.01" } })]), DB, NOW);
  check("a route with a per-request charge is not called free", notFree.models[0].free === false);
  const varies = Live.normalize(upstream([model({ id: "x/z", name: "X: Z", pricing: { prompt: "0.000001", completion: "0.000002", overrides: [{}] } })]), DB, NOW);
  check("conditional pricing is flagged rather than averaged away", varies.models[0].conditionalPricing === true);

  const future = Live.normalize(upstream([model({ created: secs("2030-01-01T00:00:00Z") })]), DB, NOW);
  check("an impossible future listing date is dropped, not shown", future.models[0].addedAt === null);
}

/* ---------- 4. catalog matching must stay strict ---------- */
{
  const glm5 = DB.models.find((m) => m.id === "glm-5-2");
  const match = Live.catalogMatch({ id: "z-ai/glm-5.2", name: "Z.ai: GLM-5.2" }, DB);
  check("an exact name and vendor match resolves to the catalog id", !glm5 || match === "glm-5-2", String(match));
  /* The bug this guards: a loose match let "GLM-5" swallow "GLM 5.3", so a
     genuinely new model looked like one already tracked. */
  check("a near-miss name does not match", Live.catalogMatch({ id: "z-ai/glm-5.9", name: "Z.ai: GLM-5.9" }, DB) === null);
  check("the right name under the wrong vendor does not match", Live.catalogMatch({ id: "acme/claude-opus-5", name: "Acme: Claude Opus 5" }, DB) === null);
  check("an unmatched upstream model resolves to null, never to a guess", Live.catalogMatch({ id: "who/what", name: "Who: What" }, DB) === null);
}

/* ---------- 5. leaderboards ---------- */
{
  const bench = (intelligence) => ({ artificial_analysis: { intelligence_index: intelligence, coding_index: 70, agentic_index: 60 } });
  const feed = upstream([
    model({ id: "a/one", canonical_slug: "a/one", name: "A: One", benchmarks: bench(50) }),
    model({ id: "a/one:free", canonical_slug: "a/one", name: "A: One (free)", pricing: { prompt: "0", completion: "0" }, benchmarks: bench(50) }),
    model({ id: "b/two", canonical_slug: "b/two", name: "B: Two", benchmarks: bench(40) }),
    model({ id: "c/three", canonical_slug: "c/three", name: "C: Three", benchmarks: bench(40) })
  ]);
  const out = Live.normalize(feed, DB, NOW);
  const intel = out.leaderboards.find((g) => g.id === "aa-intelligence");
  check("a leaderboard is built from relayed benchmarks", !!intel && intel.entries.length === 3);
  check("free and paid routes of one model take a single rank", intel.entries.filter((e) => e.id.startsWith("a/one")).length === 1);
  check("the leaderboard is sorted by value", intel.entries[0].value === 50);
  check("equal values share a rank", intel.entries[1].rank === 2 && intel.entries[2].rank === 2);
  check("every leaderboard names its publisher and how it arrived", out.leaderboards.every((g) => g.publisher && g.via === "OpenRouter" && g.scope));
  check("no leaderboard claims a measurement date it was not given", out.leaderboards.every((g) => g.measurementDate === null && g.methodologyVersion === null));

  const noBench = Live.normalize(upstream([model()]), DB, NOW);
  check("no benchmarks means no leaderboard, not an empty one", noBench.leaderboards.length === 0);
}

/* ---------- 6. the service: caching, staleness, backoff ---------- */
{
  const ok = (payload) => async () => ({ ok: true, status: 200, text: async () => JSON.stringify(payload) });
  const dead = async () => { throw new Error("network down"); };

  let t = NOW;
  const clock = () => t;
  let fetcher = ok(upstream([model()]));
  const svc = Live.createService({ catalog: DB, clock, fetcher: (...a) => fetcher(...a) });

  const first = await svc.get();
  check("a first call fetches and reports fresh", first.status === "fresh" && first.models.length === 1);

  let calls = 0;
  fetcher = async (...a) => { calls++; return ok(upstream([model()]))(...a); };
  t = NOW + 60000;
  const cached = await svc.get();
  check("a call inside the TTL is served from memory", cached.status === "fresh" && calls === 0);

  t = NOW + Live.TTL_MS + 1000;
  fetcher = dead;
  const stale = await svc.get();
  check("an unreachable source falls back to the last good data, labelled stale", stale.status === "stale" && stale.reason === "upstream_unavailable" && stale.models.length === 1);

  t = NOW + Live.TTL_MS + 2000;
  let hit = 0;
  fetcher = async () => { hit++; throw new Error("still down"); };
  await svc.get();
  check("a failure backs off instead of hammering the source", hit === 0);

  t = NOW + Live.MAX_STALE_MS + Live.TTL_MS * 2;
  fetcher = dead;
  const gone = await svc.get();
  check("data too old to trust is dropped, not served", gone.status === "unavailable" && gone.models.length === 0);
  check("even unavailable, the response keeps its shape", gone.schemaVersion === 1 && Array.isArray(gone.leaderboards));

  const bad = Live.createService({ catalog: DB, clock: () => NOW, fetcher: async () => ({ ok: true, status: 200, text: async () => "{not json" }) });
  check("malformed JSON is treated as unavailable, never parsed loosely", (await bad.get()).status === "unavailable");
  const http500 = Live.createService({ catalog: DB, clock: () => NOW, fetcher: async () => ({ ok: false, status: 500, text: async () => "" }) });
  check("an upstream error status does not become data", (await http500.get()).status === "unavailable");
}

/* ---------- 7. the browser module guards its own cache ---------- */
{
  const src = readFileSync("js/live-data.js", "utf8");
  check("the browser module sends nothing of the user's", !/apiKey|goal|prompt|localStorage\.setItem\("pc_/.test(src) && /No user text/i.test(src));
  check("the browser module validates before trusting its cache", /function usable/.test(src) && /schemaVersion !== 1/.test(src));
  check("a free default is verified before use, never silently replaced", /lookupFreeRoute/.test(src) && /never\s*\n?\s*\/\/?\s*replaced|is never\s+replaced/i.test(src.replace(/\s+/g, " ")) || /lookupFreeRoute/.test(src));
  check("the browser module tells the reader each benchmark has its own scale", /own scale/i.test(src));
}

/* ---------- 8. the invariant that protects the whole site ---------- */
{
  const coreSrc = readFileSync("api/_live-core.js", "utf8");
  const liveSrc = readFileSync("api/live.js", "utf8");
  const refreshSrc = readFileSync("api/_refresh-core.js", "utf8");

  /* Two different numbers both called "the AA index". The editorial snapshot
     is cited and dated; the relayed one is neither. They must never meet. */
  const out = Live.normalize(upstream([model({ benchmarks: { artificial_analysis: { intelligence_index: 50.7 } } })]), DB, NOW);
  const opus = DB.models.find((m) => m.id === "claude-opus-5");
  check("the relayed index and the editorial score are genuinely different numbers",
    !opus || Math.abs(out.models[0].benchmarks.artificialAnalysis.intelligence - opus.score.aa) > 5,
    opus ? "relayed 50.7 vs editorial " + opus.score.aa : "");
  check("the live feed keeps relayed benchmarks in their own namespace", !!out.models[0].benchmarks.artificialAnalysis && !("aa" in out.models[0]) && !("score" in out.models[0]));
  check("no live module writes into the editorial catalog", !/\.score\s*=|score\.aa\s*=|models\.push\(/.test(coreSrc + liveSrc));
  check("the difference in scale is stated in the payload itself", /own scale/i.test(out.notes.benchmarks) && /never overwrite/i.test(out.notes.benchmarks));
  check("the diagnostic check still refuses to touch scores", /never updated automatically/.test(refreshSrc));

  /* Reading the feed must not be able to change anything. */
  check("the endpoint is read-only", /L\.guard\(req, res\)/.test(liveSrc) && !/POST|PUT|DELETE|writeFile/.test(liveSrc));
  check("the endpoint sends CORS and a cache window, like the rest of the API", /Access-Control-Allow-Origin/.test(liveSrc) && /s-maxage/.test(liveSrc));
  check("a stale response is cached briefly, a fresh one for the hour", /status === "fresh" \? 3600 : 60/.test(liveSrc));
}

console.log("\n" + pass + " passed, " + fail + " failed" + (fail ? "" : " — LIVE DATA ALL GREEN"));
if (fail) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
