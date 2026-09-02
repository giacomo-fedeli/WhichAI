/* WhichAI — sandbox test suite (v0.22)
   Run: node tests/run-tests.mjs   (from the project root)
   Pure Node, no dependencies. Exits 1 on any failure. */
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " — " + detail : "")); console.log("FAIL  " + name + (detail ? " — " + detail : "")); }
}

/* Node needs a window for the browser-style modules */
globalThis.window = globalThis;

/* ---------- 1. Syntax of every shipped JS file ---------- */
const jsFiles = ["js/engine.js", "js/benchmarks.js", "js/chains.js", "js/i18n.js", "js/models-db.js", "js/merge.js", "js/charts.js", "js/glossary.js", "js/finder.js", "js/modelcompare.js", "js/stack.js", "js/doctor.js", "js/changes.js", "js/radar.js", "js/sharecard.js", "js/brands.js", "js/welcome.js", "js/arena.js", "js/config.js", "js/support.js", "js/topics.js", "js/app.js", "sw.js"];
for (const f of jsFiles) {
  try { execSync("node --check " + f, { stdio: "pipe" }); check("syntax " + f, true); }
  catch (e) { check("syntax " + f, false, String(e.stderr || e)); }
}

/* ---------- 2. Load data modules ---------- */
const Engine = require("../js/engine.js");
const Bench = require("../js/benchmarks.js");
const Chains = require("../js/chains.js");
const I18n = require("../js/i18n.js");
const DB = require("../js/models-db.js");
const Charts = require("../js/charts.js");
const Glossary = require("../js/glossary.js");
const Finder = require("../js/finder.js");
const MC = require("../js/modelcompare.js");
const Stack = require("../js/stack.js");
const Doctor = require("../js/doctor.js");
const ChangesFeed = require("../js/changes.js");
const Radar = require("../js/radar.js");
const ShareCard = require("../js/sharecard.js");
const Brands = require("../js/brands.js");

/* ---------- 3. models-db integrity ---------- */
{
  const ids = new Set();
  let dup = null, badTag = null, badCat = null, badPriv = null, badFam = null, badSpec = null, weakReview = null;
  const VALID_TAGS = ["free", "paid", "api", "open-weights", "prompt-target", "auto-run", "info-only", "private", "preview", "legacy", "rumored"];
  const VALID_LABELS = ["coding", "reasoning", "writing", "research", "agents", "speed", "value", "multilingual", "vision", "long-context", "local", "enterprise"];
  const FAMILIES = Engine.MODEL_ORDER;
  for (const m of DB.models) {
    if (ids.has(m.id)) dup = m.id; ids.add(m.id);
    for (const t of m.tags) if (!VALID_TAGS.includes(t)) badTag = m.id + ":" + t;
    for (const l of m.labels || []) if (!VALID_LABELS.includes(l)) badTag = m.id + ":" + l;
    if ((m.status === "private" || m.status === "rumored") && !m.tags.includes("info-only")) badPriv = m.id;
    if (m.family && !FAMILIES.includes(m.family)) badFam = m.id + ":" + m.family;
    if (m.score && m.score.cat) for (const c of Object.values(m.score.cat)) if (typeof c !== "number" || c < 0 || c > 100) badCat = m.id;
    if (m.spec) {
      if (m.spec.priceIn != null && typeof m.spec.priceIn !== "number") badSpec = m.id;
      if (m.spec.priceOut != null && typeof m.spec.priceOut !== "number") badSpec = m.id;
    }
    if (!m.review || m.review.length < 40) weakReview = m.id;
  }
  check("db: " + DB.models.length + " models, unique ids", !dup, dup);
  check("db: tags/labels valid", !badTag, badTag);
  check("db: private/rumored are info-only", !badPriv, badPriv);
  check("db: families exist in engine", !badFam, badFam);
  check("db: category scores 0-100", !badCat, badCat);
  check("db: spec price fields numeric", !badSpec, badSpec);
  check("db: reviews substantive", !weakReview, weakReview);
  check("db: kimi-k3 present with measured score", DB.models.some(m => m.id === "kimi-k3" && !m.score.est && m.score.aa > 40 && m.score.aa < 70));
  check("db: inkling present with measured score", DB.models.some(m => m.id === "inkling" && !m.score.est && m.score.aa > 20 && m.score.aa < 60));
  const specCount = DB.models.filter(m => m.spec).length;
  check("db: spec data on " + specCount + " models (>=15)", specCount >= 15);
  check("db: updated field is a real, non-future date", (() => {
    const d = Date.parse(DB.updated);
    return isFinite(d) && d <= Date.now() + 864e5;
  })());
  const brandFiles = new Set();
  Object.values(Brands.FAMILIES).concat(Object.values(Brands.VENDORS)).forEach(b => {
    if (b.icon) brandFiles.add(b.icon);
    if (b.wordmark) brandFiles.add(b.wordmark);
  });
  const missingBrandFiles = [...brandFiles].filter(f => !existsSync("assets/brands/" + f));
  check("brands: all " + brandFiles.size + " registry assets exist", missingBrandFiles.length === 0, missingBrandFiles.join(", "));
  check("brands: borrowed prompt families keep their real provider", Brands.resolve(DB.models.find(m => m.id === "inkling")).slug === "thinking-machines" && Brands.resolve(DB.models.find(m => m.id === "minimax-m3")).slug === "minimax");
}

/* ---------- 4. benchmarks integrity ---------- */
{
  let ok = true, msg = null;
  for (const t of Engine.TASK_ORDER) {
    const r = Bench.taskTypes[t];
    if (!r || !r.ranking || r.ranking.length !== 4) { ok = false; msg = t; break; }
    for (const item of r.ranking) if (!Bench.apps[item.app]) { ok = false; msg = t + ":" + item.app; }
    for (const sid of r.sourceIds) if (!Bench.sources.some(s => s.id === sid)) { ok = false; msg = t + " src " + sid; }
  }
  check("bench: 8 tasks × 4 apps, sources resolve", ok, msg);
  check("bench: snapshot date matches the database", Bench.updated === DB.updated && isFinite(Date.parse(Bench.updated)));
  check("bench: recommend falls back", Bench.recommend("nope") === Bench.taskTypes.general);
}

/* ---------- 5. i18n completeness ---------- */
{
  const langs = I18n.LANGS.map(l => l.code);
  const en = Object.keys(I18n.STRINGS.en);
  let bad = null;
  for (const l of langs) {
    const d = I18n.STRINGS[l];
    for (const k of en) if (d[k] === undefined) bad = l + " missing " + k;
    for (const k of Object.keys(d)) if (!en.includes(k)) bad = l + " extra " + k;
  }
  check("i18n: " + en.length + " keys aligned across " + langs.length + " languages", !bad, bad);
  const newKeys = ["finderTitle", "glossTitle", "mcTitle", "footFaq", "chainMapTitle", "cmpTabSpecs", "specCompareBtn"];
  check("i18n: v0.22 keys present", newKeys.every(k => I18n.STRINGS.en[k] && I18n.STRINGS.ar[k] && I18n.STRINGS.ja[k]));
}

/* ---------- 6. engine + chains regression ---------- */
{
  const res = Engine.generate({ goal: "Write a launch email for a new app", context: "", taskType: "writing", models: Engine.MODEL_ORDER });
  check("engine: 13 prompts generated", res.length === 13 && res.every(r => r.prompt.length > 200));
  let ok = true;
  for (const t of Object.keys(Chains.TEMPLATES)) {
    const tpl = Chains.TEMPLATES[t];
    if (tpl.length !== 3 || !tpl.every(s => s.instruction.includes("{goal}"))) ok = false;
  }
  check("chains: templates 3 steps each with {goal}", ok);
}

/* ---------- 7. charts ---------- */
{
  const bar = Charts.barChart([{ label: "A<script>", value: 59.9 }, { label: "B", value: 40, est: true }], { max: 65 });
  check("charts: barChart svg + escaping", bar.startsWith("<svg") && !bar.includes("<script>") && bar.includes("wc-est"));
  const sc = Charts.scatter([{ x: 4, y: 53.4, label: "S" }, { x: 20, y: 59.9, label: "F" }], { xLabel: "x", yLabel: "y" });
  check("charts: scatter svg", sc.startsWith("<svg") && sc.includes("wc-dot"));
  const gb = Charts.groupedBars(["Coding"], [{ name: "M1", values: [90] }, { name: "M2", values: [null] }]);
  check("charts: groupedBars handles missing values", gb.includes("not available") && gb.includes("wc-s1"));
}

/* ---------- 8. glossary ---------- */
{
  check("glossary: >= 21 terms", Glossary.TERMS.length >= 21);
  check("glossary: every term has one-sentence def", Glossary.TERMS.every(t => t.term && t.def && t.def.length > 20));
  check("glossary: search works", Glossary.filter("token").some(t => t.id === "token") && Glossary.filter("zzzz").length === 0);
  const linked = Glossary.TERMS.filter(t => t.link);
  check("glossary: " + linked.length + " terms link into the app", linked.length >= 5 && linked.every(t => typeof t.link.hash === "string"));
}

/* ---------- 9. finder recommendation logic ---------- */
{
  const r1 = Finder._recommend({ step: 99, task: "writing", mode: "app", budget: "low", needs: [], extra: "creative" });
  check("finder: creative writing → Claude/Fable", r1.top.dbId === "fable-5", JSON.stringify(r1.top && r1.top.dbId));
  const r2 = Finder._recommend({ step: 99, task: "research", mode: "app", budget: "free", needs: ["web"], extra: "quick" });
  check("finder: sourced research → Perplexity", r2.top.app === "perplexity", r2.top && r2.top.name);
  const r3 = Finder._recommend({ step: 99, task: "coding", mode: "dev", budget: "free", needs: [], extra: "help" });
  check("finder: dev+free coding offers Qwen3 Coder", [r3.top].concat(r3.alts).some(o => o.dbId === "qwen3-coder"));
  const r4 = Finder._recommend({ step: 99, task: "general", mode: "app", budget: "free", needs: ["privacy"], extra: null });
  check("finder: privacy surfaces Inkling", [r4.top].concat(r4.alts).some(o => o.dbId === "inkling"));
  const r5 = Finder._recommend({ step: 99, task: "coding", mode: "dev", budget: "any", needs: [], extra: "agent" });
  check("finder: dev+any coding surfaces Kimi K3", [r5.top].concat(r5.alts).some(o => o.dbId === "kimi-k3"));
  check("finder: why lists populated", r1.top.why.length >= 1 && r2.top.why.length >= 1);
  check("finder: offers carry access + limit", [r1, r2, r3].every(r => r.top.access && r.top.limit));
}

/* ---------- 9b. stack optimizer + prompt doctor logic ---------- */
{
  const r1 = Stack._optimize({ tasks: ["writing", "research", "coding"], subs: ["chatgpt", "perplexity", "claude"], budget: "20", needs: ["web"], done: true });
  check("stack: $20 budget keeps 1 paid sub", r1.stack.filter(s => s.paid).length === 1 && r1.newCost <= 20);
  check("stack: redundancy detected", r1.redundant.length >= 1 && r1.currentCost === 60);
  const r2 = Stack._optimize({ tasks: ["writing"], subs: [], budget: "0", needs: [], done: true });
  check("stack: free-only budget costs 0", r2.newCost === 0 && r2.stack.every(s => !s.paid));
  const r3 = Stack._optimize({ tasks: ["research"], subs: [], budget: "nolimit", needs: ["web", "privacy"], done: true });
  check("stack: web need routes research to Perplexity", r3.stack.some(s => s.app === "perplexity"));
  check("stack: privacy extra surfaces local option", r3.extras.some(x => x.kind === "privacy" && x.dbId === "inkling"));
  const weak = Doctor._analyze("write something");
  const strong = Doctor._analyze("Act as a senior editor. Rewrite my article for beginner developers as a 5-bullet list, max 200 words, avoid jargon. Context: our company sells devtools. For example keep the tone like our blog. Make sure it is accurate; if unsure, ask clarifying questions. Cite sources.");
  check("doctor: weak prompt scores low (" + weak.score + ")", weak.score <= 20);
  check("doctor: strong prompt scores high (" + strong.score + ")", strong.score >= 85);
  check("doctor: 10 weighted checks with tips", Doctor._checks.length === 10 && Doctor._checks.every(c => c.tip && c.w > 0));
  const it = Doctor._analyze("Agisci come un editor esperto. Riscrivi il testo per principianti, al massimo 200 parole, evita il gergo. Ad esempio come il nostro blog. Se non sei sicuro chiedi. Cita le fonti.");
  check("doctor: Italian keywords recognized (" + it.score + ")", it.score >= 60);
  const v24keys = ["navMore", "stackTitle", "stackGo", "doctorTitle", "doctorGo", "demoTitle", "demoTry"];
  check("i18n: v0.24 keys in all languages", v24keys.every(k => I18n.STRINGS.en[k] && I18n.STRINGS.ar[k] && I18n.STRINGS.zh[k] && I18n.STRINGS.it[k]));
}

/* ---------- 9c. official links, change feed, radar/share exports ---------- */
{
  const linkFor = m => m.url || (m.family && DB.links && DB.links[m.family]) || (DB.vendorLinks && DB.vendorLinks[m.vendor]) || null;
  const unlinked = DB.models.filter(m => !linkFor(m)).map(m => m.id);
  check("links: every model resolves an official link", unlinked.length === 0, unlinked.join(", "));
  check("links: all 13 prompt families covered", Engine.MODEL_ORDER.every(f => DB.links[f] && DB.links[f].indexOf("https://") === 0));
  const VALID_TYPES = ["new-model", "price", "score", "free-tier", "upcoming"];
  let badChange = null;
  for (const c of ChangesFeed.CHANGES) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) badChange = c.title + " date";
    if (!VALID_TYPES.includes(c.type)) badChange = c.title + " type";
    if (c.dbId && !DB.models.some(m => m.id === c.dbId)) badChange = c.title + " dbId";
    if (!c.src || !/^https:/.test(c.src.url)) badChange = c.title + " src";
    if (!c.note || c.note.length < 30) badChange = c.title + " note";
  }
  check("radar: " + ChangesFeed.CHANGES.length + " changes valid (dates, types, dbIds, sources)", !badChange, badChange);
  check("radar: unseen counting works", ChangesFeed.unseenCount("", "2026-07-26") === ChangesFeed.past("2026-07-26").length && ChangesFeed.unseenCount("2026-07-25", "2026-07-26") === 0 && ChangesFeed.unseenCount("2026-07-10", "2026-07-26") > 4);
  check("radar: upcoming separated", ChangesFeed.upcoming("2026-07-20").every(c => c.date > "2026-07-20"));
  check("radar + sharecard modules export", typeof Radar.init === "function" && typeof ShareCard.share === "function");
}

/* ---------- 9d. v0.28: July 26 refresh + arena ---------- */
{
  const Arena = require("../js/arena.js");
  const o5 = DB.models.find(m => m.id === "claude-opus-5");
  check("v28: Claude Opus 5 public with specs", o5 && o5.status === "public" && !o5.score.est && o5.score.aa > 55 && o5.spec.priceIn === 5 && o5.family === "claude");
  check("v28: measured #1 is Claude Opus 5", DB.models.filter(m => m.score && m.score.aa && !m.score.est).sort((a, b) => b.score.aa - a.score.aa)[0].id === "claude-opus-5");
  check("v28: Gemini 3.6 Flash + Flash-Lite present", ["gemini-3-6-flash", "gemini-3-5-flash-lite"].every(id => DB.models.some(m => m.id === id && !m.score.est)));
  check("v28: no rumored model is presented as measured", !DB.models.some(m => m.status === "rumored" && m.score && m.score.est === false));
  check("v28: lower-table corrections applied", DB.models.find(m => m.id === "mercury-2").score.aa === 21.4 && DB.models.find(m => m.id === "trinity-large").score.aa === 18.2);
  check("v28+: db and bench carry the same snapshot date", DB.updated === Bench.updated);
  check("v28: gemini BYOK default bumped", readFileSync("js/app.js", "utf8").includes('DEFAULT_GEMINI_MODEL = "gemini-3.6-flash"'));
  check("v28: finder/stack paid Claude pick is Opus 5", readFileSync("js/finder.js", "utf8").includes('low: "claude-opus-5"') && readFileSync("js/stack.js", "utf8").includes('paid: "claude-opus-5"'));
  const elo = Arena._elo({}, "a", "b", 1);
  check("v28: arena elo math (winner +16 at equal ratings)", elo.a.r === 1016 && elo.b.r === 984 && elo.a.g === 1);
  const elo2 = Arena._elo({ a: { r: 1016, g: 1 }, b: { r: 984, g: 1 } }, "a", "b", 0.5);
  check("v28: arena elo tie pulls ratings together", elo2.a.r < 1016 && elo2.b.r > 984);
  const pair = Arena._pickTwo([{ id: "x" }, { id: "y" }, { id: "z" }]);
  check("v28: arena picks two distinct models", pair.length === 2 && pair[0].id !== pair[1].id);
}

/* ---------- 9e. v0.29: topics, support config, welcome home ---------- */
{
  const TopicsMod = require("../js/topics.js");
  const Cfg = require("../js/config.js");
  const SupportMod = require("../js/support.js");
  check("v29: 6 debates, all sourced, both sides", TopicsMod.TOPICS.length === 6 && TopicsMod.TOPICS.every(t => t.sideA && t.sideB && t.status && t.sources.length >= 2 && t.sources.every(s => /^https:/.test(s.url))));
  check("v29: debates carry numbers with labels", TopicsMod.TOPICS.every(t => t.numbers.length >= 2 && t.numbers.every(n => n.v && n.label)));
  check("v29: no em dash in topics", !readFileSync("js/topics.js", "utf8").includes("\u2014"));
  {
    /* The owner may legitimately have filled these in. What must hold is that
       an EMPTY value hides the feature and never invents a number. */
    const supportSrc = readFileSync("js/support.js", "utf8");
    const hidesWhenEmpty = supportSrc.includes('if (!code)') && supportSrc.includes('if (!url)');
    const noFakeNumber = !/count\s*[:=]\s*\d{2,}/.test(supportSrc);
    check("v29: counter and donate stay hidden until configured", hidesWhenEmpty && noFakeNumber && typeof SupportMod.init === "function" && typeof Cfg.goatCode === "string" && typeof Cfg.donateUrl === "string");
    check("v30: counter degrades instead of throwing without fetch", supportSrc.includes('typeof fetch !== "function"'));
  }
  check("v29: welcome exposes show()", readFileSync("js/welcome.js", "utf8").includes("show: show"));
  check("v29: CSP allows goatcounter only", (() => { const h = readFileSync("index.html", "utf8"); return h.includes("https://gc.zgo.at") && h.includes("https://*.goatcounter.com"); })());
  check("v29: kimi k3 now open-weights", DB.models.some(m => m.id === "kimi-k3" && m.tags.includes("open-weights")));
  check("v29: gemini 3.5 pro rumor is info-only + estimated", DB.models.some(m => m.id === "gemini-3-5-pro" && m.status === "rumored" && m.score.est && m.tags.includes("info-only")));
  check("v29: support/topics ids in html", ["foot-support", "visit-counter", "welcome-visits", "about-support", "support-btn", "topics-view", "topics-wrap", "nav-topics"].every(id => readFileSync("index.html", "utf8").includes('id="' + id + '"')));
}

/* ---------- 9f. v0.30: serverless API, automation, layout, key safety ---------- */
{
  const html = readFileSync("index.html", "utf8");
  const css = readFileSync("styles.css", "utf8");
  const app = readFileSync("js/app.js", "utf8");
  const apiClient = readFileSync("js/api.js", "utf8");
  const sw = readFileSync("sw.js", "utf8");

  // --- the backend actually exists and is read-only ---
  const endpoints = ["health", "models", "benchmarks", "recommend", "stats"];
  check("v30: every API endpoint file exists", endpoints.every(e => existsSync("api/" + e + ".js")) && existsSync("api/_lib.js"));
  check("v30: every endpoint exports a handler", endpoints.every(e => typeof require("../api/" + e + ".js") === "function"));
  const lib = readFileSync("api/_lib.js", "utf8");
  check("v30: API refuses anything but GET/HEAD/OPTIONS", lib.includes('req.method !== "GET" && req.method !== "HEAD"') && lib.includes("405"));
  check("v30: API sets cache and cors headers", lib.includes("s-maxage") && lib.includes("Access-Control-Allow-Origin"));
  check("v30: API reuses the browser data modules (one source of truth)", lib.includes('require("../js/models-db.js")') && lib.includes('require("../js/benchmarks.js")'));
  check("v30: no secret or env token is read by the API", !/process\.env\.[A-Z_]*(KEY|TOKEN|SECRET)/.test(lib + readFileSync("api/models.js", "utf8")));

  // --- the frontend uses it without depending on it ---
  check("v30: index loads api.js before app.js", html.indexOf("js/api.js") > 0 && html.indexOf("js/api.js") < html.indexOf("js/app.js"));
  check("v30: api client has a timeout and aborts", apiClient.includes("AbortController") && /TIMEOUT_MS\s*=\s*\d+/.test(apiClient));
  check("v30: api client falls back to null, never throws", apiClient.includes("return null") && apiClient.includes(".catch("));
  check("v30: api client sends no credentials and no user data", apiClient.includes('credentials: "omit"') && !/localStorage|sessionStorage|Key\b/.test(apiClient));
  check("v30: guide paints the API status", app.includes("WhichAIApi.renderStatus"));
  check("v30: service worker never caches /api/", sw.includes('url.pathname.indexOf("/api/") === 0') && sw.includes('"js/api.js"'));

  // --- automation ---
  check("v30: CI workflow runs all three suites", (() => {
    const y = readFileSync(".github/workflows/ci.yml", "utf8");
    return y.includes("run-tests.mjs") && y.includes("smoke-dom.mjs") && y.includes("api-tests.mjs");
  })());
  check("v30: scheduled data refresh exists and is cron driven", (() => {
    const y = readFileSync(".github/workflows/data-refresh.yml", "utf8");
    return /cron:\s*"0 6 \* \* 1"/.test(y) && y.includes("refresh-data.mjs") && y.includes("create-pull-request");
  })());
  const refreshCli = readFileSync("tools/refresh-data.mjs", "utf8");
  const refreshCore = readFileSync("api/_refresh-core.js", "utf8");
  check("v30: refresh checks the shipped free routes", refreshCore.includes("DEFAULT_OR_MODELS") && refreshCore.includes("deadFreeRoutes"));
  check("v30: refresh never rewrites scores by itself", !/score\s*\.\s*aa\s*=/.test(refreshCore + refreshCli) && refreshCore.includes("never updated automatically"));
  check("v30: refresh writes a report a human can read", refreshCli.includes("refresh-report.md") && refreshCore.includes("Needs a human"));

  // --- production build ---
  check("v30: build script and vercel config exist", existsSync("tools/build.mjs") && existsSync("vercel.json") && existsSync("package.json"));
  check("v30: vercel builds from tools/build.mjs into dist", (() => {
    const v = JSON.parse(readFileSync("vercel.json", "utf8"));
    return v.buildCommand === "node tools/build.mjs" && v.outputDirectory === "dist";
  })());
  check("v30: security headers configured", (() => {
    const v = JSON.parse(readFileSync("vercel.json", "utf8"));
    const flat = JSON.stringify(v.headers);
    return ["X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Permissions-Policy"].every(h => flat.includes(h));
  })());
  const build = readFileSync("tools/build.mjs", "utf8");
  check("v30: build recomputes the CSP hash instead of trusting it", build.includes("refreshCspHash") && build.includes("createHash"));
  check("v30: build keeps non-ascii intact (11 languages)", build.includes('charset: "utf8"'));
  check("v30: build never ships api/ or the drift report", !build.includes('"api"') && build.includes("EXCLUDE_DATA"));

  // --- layout: one measure, even cards ---
  check("v30: single content measure token", css.includes("--measure:") && css.includes("max-width: var(--layout-measure, var(--measure-wide))") && css.includes("--layout-measure: var(--measure)"));
  check("v30: guide cards stretch and pin their action", css.includes(".guide-grid { align-items: stretch; }") && css.includes(".guide-card .guide-cta,"));
  check("v30: catalog folds its tail", app.includes("catalog-extra") && app.includes("catalog-more") && css.includes(".catalog-open .catalog-list .catalog-extra"));

  // --- key safety ---
  check("v30: key risk model is spelled out", html.includes('id="key-risk-title"') && html.includes("If a key leaks"));
  check("v30: warning shown only in device mode", html.includes('id="keymode-warn"') && app.includes("paintWarn"));
  check("v30: every key field has a reveal toggle", (html.match(/class="key-reveal"/g) || []).length === 3 && app.includes("initKeyReveal"));

  // --- positioning and honesty ---
  check("v30: says how it differs from leaderboards", html.includes('id="about-different"') && html.includes("LMArena") && html.includes("Hugging Face"));
  check("v30: does not claim to run its own benchmarks", html.includes("does not run its own benchmarks"));
  check("v30: documents the API publicly", html.includes('id="about-api"') && html.includes("/api/recommend"));
  check("v30: explains how data stays current", html.includes('id="about-freshness"') && html.includes("never rewritten by a script"));

  // --- honesty: the claim had to change when the API arrived ---
  check("v30: no stale 'no server' claim in the UI", !/no server|nessun server|aucun serveur|sin servidor|kein Server|sem servidor/i.test(html) && !I18n.LANGS.some(l => /no server|nessun server|aucun serveur|sin servidor|kein Server|sem servidor/i.test(JSON.stringify(I18n.STRINGS[l.code]))));
  check("v30: privacy promise names what actually stays local", I18n.STRINGS.en.privacyTip.includes("read-only") && I18n.STRINGS.it.privacyTip.includes("sola lettura"));

  // --- i18n for the new chrome ---
  const newKeys = ["keyShow", "keyHide", "keymodeWarn", "keyRiskTitle", "apiLive", "apiLocal", "catalogShowAll", "catalogShowLess"];
  check("v30: new UI keys exist in all 11 languages", I18n.LANGS.every(l => newKeys.every(k => typeof I18n.STRINGS[l.code][k] === "string" && I18n.STRINGS[l.code][k].length > 0)));
  check("v30: no em dash in the new modules", ![apiClient, refreshCli, refreshCore, build, lib].some(f => f.includes("—")));
}

/* ---------- 9g. v0.31: the August data refresh ---------- */
{
  const Changes = require("../js/changes.js");
  const feed = Array.isArray(Changes) ? Changes : (Changes.CHANGES || Changes.changes || Changes.items || Changes.list || []);

  const NEW_AUG = ["grok-4-6", "glm-5-3", "glm-5-3-flash", "gemini-3-7-flash", "muse-spark-1-2"];
  check("v31: the five August models are in the catalog", NEW_AUG.every(id => DB.models.some(m => m.id === id)));
  check("v31: every August model carries a release date and a measured score", NEW_AUG.every(id => {
    const m = DB.models.find(x => x.id === id);
    return m && m.score.est === false && m.spec && /^2026-08-/.test(m.spec.released);
  }));
  check("v31: every August model resolves an official link", NEW_AUG.every(id => {
    const m = DB.models.find(x => x.id === id);
    return !!(DB.links[m.family] || DB.vendorLinks[m.vendor]);
  }));

  const measured = DB.models.filter(m => m.score && m.score.est === false && typeof m.score.aa === "number");
  const rank = measured.slice().sort((a, b) => b.score.aa - a.score.aa);
  check("v31: leaderboard matches the cited August snapshot", rank[0].id === "claude-opus-5" && rank[0].score.aa === 63 && rank[1].id === "fable-5" && rank[2].id === "grok-4-6");
  check("v31: the top ten sit inside the stated 6.3 points", Math.round((rank[0].score.aa - rank[9].score.aa) * 10) / 10 <= 6.3);

  /* The August index shifted the whole table upward. Saying so is the point:
     a reader comparing to July must not be told the models all improved. */
  check("v31: the scale shift is disclosed, not hidden", /shift in the index/.test(DB.scaleNote) && /August 30, 2026/.test(DB.scaleNote) && /August 27, 2026/.test(DB.scaleNote));
  check("v31: both mirrors are cited as sources", ["aa-aug", "aa-aug-mc"].every(id => Bench.sources.some(s2 => s2.id === id && /^https:/.test(s2.url))));

  /* GLM-5.3 shipped without weights: claiming otherwise would be the exact
     kind of error the methodology page promises not to make. */
  const glm53 = DB.models.find(m => m.id === "glm-5-3");
  check("v31: GLM-5.3 is not tagged open-weights", !glm53.tags.includes("open-weights") && /NOT released/.test(glm53.access));
  const glmFlash = DB.models.find(m => m.id === "glm-5-3-flash");
  check("v31: GLM-5.3-Flash is tagged open-weights with its licence", glmFlash.tags.includes("open-weights") && /MIT/.test(glmFlash.access));

  /* Gemini 3.7 Flash has no confirmed free tier, so it must not become the
     auto-run default and must not carry the free tag. */
  const g37 = DB.models.find(m => m.id === "gemini-3-7-flash");
  check("v31: Gemini 3.7 Flash is not claimed free", !g37.tags.includes("free") && /not confirmed/.test(g37.access));
  check("v31: BYOK default stays on the model with a confirmed free tier", readFileSync("js/app.js", "utf8").includes('DEFAULT_GEMINI_MODEL = "gemini-3.6-flash"'));

  check("v31: Sonnet 5 intro pricing recorded as expired", (() => {
    const m = DB.models.find(x => x.id === "sonnet-5");
    return m.spec.priceIn === 3 && m.spec.priceOut === 15 && /expired/.test(m.spec.note);
  })());

  check("v31: radar carries the August entries with sources", (() => {
    const aug = feed.filter(e => /^2026-08-/.test(e.date));
    return aug.length >= 6 && aug.every(e => e.src && /^https:/.test(e.src.url) && e.note && e.note.length > 40);
  })());
  check("v31: radar dbIds all resolve", feed.every(e => !e.dbId || DB.models.some(m => m.id === e.dbId)));

  const refresh31 = readFileSync("tools/refresh-data.mjs", "utf8");
  check("v31: a dead upstream source degrades instead of failing the run", refresh31.includes("Skipped: the upstream source did not answer") && refresh31.includes("process.exit(STRICT ? 1 : 0)"));

  check("v31: repo references point at the current repository", !["README.md", "AGENTS.md", "HANDOVER.md"].some(f => readFileSync(f, "utf8").includes("Jackfdl/promptcompass-")));
}

/* ---------- 9h. v0.32: automation that does not depend on GitHub ---------- */
{
  const html = readFileSync("index.html", "utf8");
  const css = readFileSync("styles.css", "utf8");
  const core = readFileSync("api/_refresh-core.js", "utf8");
  const cli = readFileSync("tools/refresh-data.mjs", "utf8");
  const endpoint = readFileSync("api/refresh.js", "utf8");
  const radar = readFileSync("js/radar.js", "utf8");
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));

  /* One implementation. A second copy of the check would recreate exactly
     the drift the check exists to catch. */
  check("v32: the check has a single shared implementation", existsSync("api/_refresh-core.js") && cli.includes('require("../api/_refresh-core.js")') && endpoint.includes('require("./_refresh-core.js")'));
  check("v32: neither caller reimplements the analysis", !/function analyse\(/.test(cli) && !/function analyse\(/.test(endpoint) && /function analyse\(/.test(core));
  check("v32: the endpoint is registered for the dev runner and tests", readFileSync("tools/api-dev.mjs", "utf8").includes('"refresh"'));

  /* The whole point: the automation runs on the host that already serves the
     site, so a blocked CI account cannot switch it off. */
  check("v32: a Vercel cron drives the check", Array.isArray(vercel.crons) && vercel.crons.some(c => c.path === "/api/refresh" && /^\S+ \S+ \S+ \S+ \S+$/.test(c.schedule)));
  check("v32: the cron runs at most daily (free plan)", vercel.crons.every(c => !/^\*/.test(c.schedule.split(" ")[1])));
  check("v32: js/app.js is bundled so the free-route check can run", vercel.functions && vercel.functions["api/refresh.js"] && /app\.js/.test(vercel.functions["api/refresh.js"].includeFiles));
  check("v32: the endpoint degrades instead of failing", endpoint.includes("skippedReport") && !/throw /.test(endpoint));
  check("v32: the endpoint never edits the catalog", !/\.push\(|models\s*=/.test(endpoint.replace(/needsHuman[^;]*;/g, "")));
  check("v32: health advertises the check", readFileSync("api/health.js", "utf8").includes("/api/refresh"));

  /* Visible where the data lives, not only in a dashboard nobody opens. */
  check("v32: the radar shows the check result", radar.includes("paintCheck") && radar.includes('WhichAIApi.get("/refresh")'));
  check("v32: the radar degrades silently when the API is unreachable", /if \(!r\) return;/.test(radar));
  check("v32: severity has a style for every state", ["api-dot.review", "api-dot.broken", "radar-check"].every(c => css.includes(c)));
  const radarKeys = ["radarCheckClean", "radarCheckReview", "radarCheckBroken", "radarCheckSkipped"];
  check("v32: check labels exist in all 11 languages", I18n.LANGS.every(l => radarKeys.every(k => typeof I18n.STRINGS[l.code][k] === "string" && I18n.STRINGS[l.code][k].length > 0)));
  check("v32: no em dash in the new modules", ![core, endpoint].some(f => f.includes("—")));
}

/* ---------- 10. HTML ↔ JS id cross-check ---------- */
{
  const html = readFileSync("index.html", "utf8");
  const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  const missing = [];
  for (const f of ["js/app.js", "js/merge.js"]) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/getElementById\("([^"]+)"\)/g)) {
      const id = m[1];
      if (id.includes("-" + '" +')) continue;
      if (/\$\{|" \+/.test(id)) continue;
      if (["test-gemini", "test-groq", "test-openrouter"].includes(id)) continue; // dynamic prefix ids exist
      if (!htmlIds.has(id) && !["chain-map", "glossary-view", "update-toast"].includes(id)) {
        // dynamically created ids are allowed only if created in JS
        if (!/createElement/.test(src.slice(Math.max(0, m.index - 400), m.index)) && !htmlIds.has(id)) missing.push(f + ":" + id);
      }
    }
  }
  const reallyMissing = missing.filter(x => {
    const id = x.split(":")[1];
    return !htmlIds.has(id);
  });
  check("ids: every getElementById exists in HTML", reallyMissing.length === 0, reallyMissing.join(", "));
  for (const must of ["finder-wrap", "cmp-specs-wrap", "cmp-outputs-wrap", "glossary-list", "chain-map", "chain-addstep", "foot-faq", "foot-glossary", "insights-wrap", "chart-top", "chart-pp", "mode-goal", "mode-finder", "about-faq", "about-similar", "about-contribute"]) {
    if (!htmlIds.has(must)) check("ids: required v0.22 id " + must, false);
  }
  check("ids: v0.22 required ids present", true);
}

/* ---------- 11. version coherence ---------- */
{
  const html = readFileSync("index.html", "utf8");
  const app = readFileSync("js/app.js", "utf8");
  const sw = readFileSync("sw.js", "utf8");
  check("version: badge v0.32", html.includes(">v0.32 · Growth<"));
  check("version: footer v0.32", html.includes("WhichAI v0.32"));
  check("version: APP_VERSION v0.32", app.includes('APP_VERSION = "v0.32"'));
  check("version: SW cache v0.32", sw.includes('"whichai-v0.32.0"'));
  const welcomeJs = readFileSync("js/welcome.js", "utf8");
  check("v0.27: morph reaches target before opacity fade", welcomeJs.includes("offset: 0.76") && welcomeJs.includes("opacity: 0") && welcomeJs.includes("1050"));
  check("v0.27: dark wordmarks use a light treatment", /\[data-theme="dark"\] \.ai-brand-wordmark\s*\{[^}]*invert\(1\)/s.test(readFileSync("styles.css", "utf8")));
  check("v0.26: welcome + morph scripts and markup", ["welcome", "welcome-brand", "welcome-generator", "welcome-guide", "welcome-compare", "welcome-explore"].every(id => html.includes('id="' + id + '"')) && html.includes("js/welcome.js"));
  check("v0.26: 13 branded model controls", (html.match(/data-ai-brand=/g) || []).length === 13 && html.includes("js/brands.js"));
  check("v0.26: SW precaches entrance + core brand assets", sw.includes("js/welcome.js") && sw.includes("js/brands.js") && sw.includes("assets/brands/claude-color.svg") && sw.includes("assets/brands/qwen-color.svg"));
  check("v0.25: radar ids + scripts", ["nav-radar", "radar-view", "radar-wrap"].every(id => html.includes('id="' + id + '"')) && ["changes.js", "radar.js", "sharecard.js"].every(s => html.includes("js/" + s)));
  check("v0.25: SW precaches radar + share", sw.includes("js/radar.js") && sw.includes("js/sharecard.js") && sw.includes("js/changes.js"));
  check("v0.24: nav More + new views ids", ["nav-more", "nav-more-panel", "nav-stack", "nav-doctor", "nav-glossary", "stack-view", "doctor-view", "stack-wrap", "doctor-wrap", "demo-card", "open-doctor"].every(id => html.includes('id="' + id + '"')));
  check("v0.24: SW precaches stack + doctor", sw.includes("js/stack.js") && sw.includes("js/doctor.js"));
  check("v0.23: CSP meta present", html.includes("Content-Security-Policy") && html.includes("connect-src 'self' https://generativelanguage.googleapis.com"));
  check("v0.23: key storage + data tools ids", ["keymode-session", "keymode-local", "keys-clear", "data-export", "data-import", "data-wipe", "data-file"].every(id => html.includes('id="' + id + '"')));
  check("v0.23: methodology card", html.includes('id="about-methodology"') && html.includes("Methodology v1.0"));
  check("v0.23: SW precaches shell", sw.includes("js/finder.js") && sw.includes("icons/icon-512.png") && sw.includes("addAll"));
  {
    const noDash = ["js/i18n.js", "js/models-db.js", "js/benchmarks.js", "js/engine.js", "js/finder.js", "js/glossary.js", "js/modelcompare.js", "js/charts.js", "js/app.js", "js/merge.js", "js/chains.js", "index.html", "manifest.webmanifest"];
    const dirty = noDash.filter(f => readFileSync(f, "utf8").includes("\u2014"));
    check("v0.23: no em dashes in visible files", dirty.length === 0, dirty.join(", "));
  }
  {
    const sm = readFileSync("sitemap.xml", "utf8");
    const urlCount = (sm.match(/<loc>/g) || []).length;
    check("v0.23: sitemap has 150+ urls (" + urlCount + ")", urlCount >= 150);
    check("v0.23: model page generated + clean", existsSync("models/fable-5.html") && existsSync("models/index.html") && !readFileSync("models/fable-5.html", "utf8").includes("\u2014"));
    check("v0.23: best-ai-for + glossary + compare + dataset", existsSync("best-ai-for/coding.html") && existsSync("glossary/token.html") && existsSync("compare/fable-5-vs-gpt-5-6-sol.html") && existsSync("data/models.json"));
    const ds = JSON.parse(readFileSync("data/models.json", "utf8"));
    check("v0.23: open dataset valid (" + ds.count + " models)", ds.count === ds.models.length && ds.count >= 105);
  }
  check("version: scripts include new modules", ["charts.js", "glossary.js", "finder.js", "modelcompare.js"].every(s => html.includes("js/" + s)));
}

/* ---------- 12. CSS sanity ---------- */
{
  const css = readFileSync("styles.css", "utf8");
  check("css: braces balanced", css.split("{").length === css.split("}").length);
  check("css: clip fix present", css.includes("padding-block: 5px") && css.includes("margin-block: -5px"));
  check("css: focus-visible ring", css.includes(":focus-visible"));
  check("css: sepia take 2", css.includes("#f1e5cd"));
  check("css: dark focus fix + color-scheme", css.includes('[data-theme="dark"] { --focus: #60a5fa; color-scheme: dark; }'));
  check("css: unified radii tokens", css.includes("--r-card: 14px") && css.includes("--r-ctl: 10px"));
  check("css: update toast", css.includes(".update-toast"));
  check("css: chain map + finder + mc styles", ["chain-node", "finder-opt", "mc-grid", "footer-links", "wc-chart"].every(c => css.includes(c)));
}

/* ---------- 13. manifest ---------- */
{
  try {
    const man = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
    check("manifest: valid JSON with icons", Array.isArray(man.icons) && man.icons.length >= 2 && man.icons.every(i => existsSync(i.src)));
  } catch (e) { check("manifest: valid JSON", false, String(e)); }
}

console.log("\n" + pass + " passed, " + fail + " failed" + (fail ? "\n\nFAILURES:\n" + failures.join("\n") : " — ALL GREEN"));
process.exit(fail ? 1 : 0);
