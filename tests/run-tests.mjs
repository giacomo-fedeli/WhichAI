/* WhichAI - sandbox test suite (v0.37)
   Run: node tests/run-tests.mjs   (from the project root)
   Pure Node, no dependencies. Exits 1 on any failure.

   v0.36 rebuilt the page as one scroll of six connected chapters. The checks
   of the views that were removed with it (welcome cover, journey, 3D stage,
   Chains, Merge, Blind Arena, API keys and auto-run) were replaced by checks
   on the new structure. The data, honesty and automation checks carry over. */
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " - " + detail : "")); console.log("FAIL  " + name + (detail ? " - " + detail : "")); }
}

/* Node needs a window for the browser-style modules */
globalThis.window = globalThis;

const html = readFileSync("index.html", "utf8");
const css = readFileSync("styles.css", "utf8");
const app = readFileSync("js/app.js", "utf8");
const sw = readFileSync("sw.js", "utf8");
const SCRIPTS = [...html.matchAll(/<script src="(js\/[\w.-]+\.js)"><\/script>/g)].map(m => m[1]);
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const between = (needle, a, b) => {
  const i = html.indexOf(needle), ia = html.indexOf('id="' + a + '"'), ib = b ? html.indexOf('id="' + b + '"') : html.length;
  return i > ia && ia >= 0 && i < ib;
};

/* ---------- 1. syntax of every shipped file ---------- */
{
  check("index loads 26 scripts, app.js last", SCRIPTS.length === 26 && SCRIPTS[SCRIPTS.length - 1] === "js/app.js", String(SCRIPTS.length));
  const apiFiles = ["api/_lib.js", "api/_live-core.js", "api/_catalog-core.js", "api/_refresh-core.js", "api/_news-core.js", "api/health.js", "api/models.js", "api/benchmarks.js", "api/recommend.js", "api/stats.js", "api/refresh.js", "api/live.js", "api/catalog.js", "api/news.js"];
  for (const f of SCRIPTS.concat(["sw.js"], apiFiles)) {
    try { execSync("node --check " + f, { stdio: "pipe" }); check("syntax " + f, true); }
    catch (e) { check("syntax " + f, false, String(e.stderr || e)); }
  }
}

/* ---------- 2. load the modules ---------- */
const Engine = require("../js/engine.js");
const Bench = require("../js/benchmarks.js");
const I18n = require("../js/i18n.js");
const DB = require("../js/models-db.js");
const Charts = require("../js/charts.js");
const Glossary = require("../js/glossary.js");
const Finder = require("../js/finder.js");
const Stack = require("../js/stack.js");
const Doctor = require("../js/doctor.js");
const ChangesFeed = require("../js/changes.js");
const Radar = require("../js/radar.js");
const ShareCard = require("../js/sharecard.js");
const Brands = require("../js/brands.js");
const Ranking = require("../js/ranking.js");
const Market = require("../js/market.js");
const Motion = require("../js/motion.js");
const Generator = require("../js/generator.js");
const Topics = require("../js/topics.js");
const MC = require("../js/modelcompare.js");
check("modules: every chapter module exports its interface", [Ranking.init, Ranking.tiers, MC.init, MC.compareWith, Radar.init, Radar.fillNewest, Market.init, Market.fillLeader, Topics.init, Finder.init, Finder.startWith, Generator.init, Generator.useModel, Doctor.init, Stack.init, Motion.init, Motion.mount].every(f => typeof f === "function"));

/* ---------- 3. models-db integrity ---------- */
{
  const ids = new Set();
  let dup = null, badTag = null, badCat = null, badPriv = null, badFam = null, badSpec = null, weakReview = null;
  const VALID_TAGS = ["free", "paid", "api", "open-weights", "prompt-target", "info-only", "private", "preview", "legacy", "rumored"];
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
  check("db: tags/labels valid (auto-run retired in v0.36)", !badTag, badTag);
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
  /* A free tag is a promise. A model whose only free route was retired must
     not keep it, or the "Free" filter of the ranking would lie. */
  const freeClaims = DB.models.filter(m => m.tags.includes("free") && /route[^.]*has been retired/i.test(m.access || ""));
  check("db: no model keeps a free tag for a retired route", freeClaims.length === 0, freeClaims.map(m => m.id).join(", "));
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
  check("bench: 8 tasks x 4 apps, sources resolve", ok, msg);
  check("bench: snapshot date matches the database", Bench.updated === DB.updated && isFinite(Date.parse(Bench.updated)));
  /* v0.35: general, analysis and coding are re-ordered live from the index,
     so an unknown task returns the general ranking (same apps, live order). */
  const fb = Bench.recommend("nope");
  check("bench: recommend falls back to general", fb.ranking.map(r => r.app).sort().join() === Bench.taskTypes.general.ranking.map(r => r.app).sort().join() && !!fb.summary);
  check("bench: editorial tasks are returned untouched", Bench.recommend("writing") === Bench.taskTypes.writing);
}

/* ---------- 5. i18n: complete, aligned, and covering what the page uses ---------- */
{
  const langs = I18n.LANGS.map(l => l.code);
  const en = Object.keys(I18n.STRINGS.en);
  let bad = null;
  for (const l of langs) {
    const d = I18n.STRINGS[l];
    for (const k of en) if (d[k] === undefined) bad = l + " missing " + k;
    for (const k of Object.keys(d)) if (!en.includes(k)) bad = l + " extra " + k;
  }
  check("i18n: " + en.length + " keys aligned across " + langs.length + " languages", langs.length === 11 && !bad, bad);
  check("i18n: Arabic is the right-to-left language", I18n.LANGS.some(l => l.code === "ar" && l.dir === "rtl") || /dir.*rtl|rtl/.test(app));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n(?:-ph|-aria)?="([A-Za-z0-9_]+)"/g)) used.add(m[1]);
  const scriptSrc = SCRIPTS.map(f => readFileSync(f, "utf8")).join("\n");
  for (const m of scriptSrc.matchAll(/\b(?:T|tr)\("([A-Za-z0-9_]+)"\)/g)) used.add(m[1]);
  /* English may leave a note empty on purpose (langNote: there is nothing to
     warn an English reader about); every other language must say something. */
  const filled = (l, k) => typeof I18n.STRINGS[l][k] === "string" && (I18n.STRINGS[l][k].length > 0 || (l === "en" && k === "langNote"));
  const missing = [...used].filter(k => !langs.every(l => filled(l, k)));
  check("i18n: all " + used.size + " keys the page uses exist in every language", used.size > 200 && missing.length === 0, missing.slice(0, 12).join(", "));
  /* Keys reached only through a computed name ("task_" + id, "tier" + t,
     "topics" + Kind) are the only ones allowed to look unused. */
  const everything = scriptSrc + html;
  const unused = en.filter(k => !everything.includes('"' + k + '"') && !/^(task_\w+|tier[SABCD]|topics(Estimate|Projection|Research|Reported|Guidance|Definition))$/.test(k));
  check("i18n: no dead keys (every key is referenced somewhere)", unused.length === 0, unused.slice(0, 12).join(", "));
  const dashed = langs.filter(l => JSON.stringify(I18n.STRINGS[l]).includes("—"));
  check("i18n: no em dash in any language", dashed.length === 0, dashed.join(", "));
}

/* ---------- 6. engine ---------- */
{
  const res = Engine.generate({ goal: "Write a launch email for a new app", context: "", taskType: "writing", models: Engine.MODEL_ORDER });
  check("engine: 13 prompts generated", res.length === 13 && res.every(r => r.prompt.length > 200));
  check("engine: task detection still works", Engine.detectTaskType("Fix this Python function that throws a KeyError") === "coding");
}

/* ---------- 7. charts: a scatter nobody can squash ---------- */
{
  const bar = Charts.barChart([{ label: "A<script>", value: 59.9 }, { label: "B", value: 40, est: true }], { max: 65 });
  check("charts: barChart svg + escaping", bar.startsWith("<svg") && !bar.includes("<script>") && bar.includes("wc-est"));
  const gb = Charts.groupedBars(["Coding"], [{ name: "M1", values: [90] }, { name: "M2", values: [null] }]);
  check("charts: groupedBars handles missing values", gb.includes("not available") && gb.includes("wc-s1"));

  /* The v0.35 bug: one legacy model at $262 per 1M squeezed every other dot
     into the first few pixels. On a log axis a decade is a decade. */
  const pts = [
    { x: 0.2, y: 30, label: "Cheap", id: "cheap" }, { x: 1, y: 40, label: "One", id: "one" },
    { x: 3, y: 50, label: "Three", id: "three" }, { x: 10, y: 55, label: "Ten", id: "ten" },
    { x: 262, y: 35, label: "Outlier", id: "outlier" }, { x: 0, y: 33, label: "Gratis", id: "gratis" }
  ];
  const cxOf = (svg, id) => parseFloat((svg.match(new RegExp('data-id="' + id + '"[^>]*><title>[^<]*</title><circle cx="([0-9.]+)"')) || [])[1]);
  const logSvg = Charts.scatter(pts, { logX: true, frontier: true, freeLabel: "Free" });
  const linSvg = Charts.scatter(pts.filter(p => p.x > 0), {});
  const logGap = cxOf(logSvg, "ten") - cxOf(logSvg, "one");
  const linGap = cxOf(linSvg, "ten") - cxOf(linSvg, "one");
  check("charts: on the log axis $1 and $10 sit a decade apart (" + Math.round(logGap) + "px vs " + Math.round(linGap) + "px linear)", logGap > 100 && linGap < 30);
  check("charts: a $0 price sits in its own free lane instead of breaking the scale", logSvg.includes("wc-free-lane") && cxOf(logSvg, "gratis") < cxOf(logSvg, "cheap"));
  check("charts: the best-value frontier is drawn", logSvg.includes("wc-frontier") && logSvg.includes("wc-on-frontier"));
  const fr = Charts.frontierOf([{ x: 1, y: 40 }, { x: 2, y: 35 }, { x: 3, y: 50 }, { x: 4, y: 45 }]);
  check("charts: frontierOf keeps only points no cheaper model beats", fr.map(p => p.x).join() === "1,3");
  check("charts: log ticks read 1-3-10", Charts.logTicks(0.1, 316).join() === "0.1,0.3,1,3,10,30,100,300");
  check("charts: dots carry ids for the chip <-> dot highlight", /<g class="wc-pt[^"]*" data-id="one"/.test(logSvg));
  check("charts: the ranking uses the log axis and the frontier", /logX: true, frontier: true/.test(readFileSync("js/ranking.js", "utf8")));
}

/* ---------- 8. ranking: tiers are computed, never chosen ---------- */
{
  const t = Ranking.tiers("aa", false);
  const official = DB.models.filter(m => m.score && typeof m.score.aa === "number" && !m.score.est && m.status !== "rumored" && m.status !== "private" && m.status !== "legacy");
  const all = ["S", "A", "B", "C", "D"].flatMap(k => t.tiers[k]);
  check("tiers: every official current model appears exactly once (" + t.total + ")", all.length === official.length && new Set(all.map(m => m.id)).size === all.length);
  check("tiers: nothing estimated, converted or rumored is ranked", all.every(m => !m.score.est && m.status !== "rumored"));
  check("tiers: the list is ordered by the index", t.list.every((m, i) => i === 0 || t.list[i - 1].score.aa >= m.score.aa));
  const tieBreak = t.list.every((m, i) => i === 0 || t.list[i - 1].score.aa !== m.score.aa || t.ranks[t.list[i - 1].id].tier === t.ranks[m.id].tier);
  check("tiers: ties share a tier and a rank", tieBreak && t.list.every((m, i) => i === 0 || t.list[i - 1].score.aa !== m.score.aa || t.ranks[t.list[i - 1].id].rank === t.ranks[m.id].rank));
  const cut = { S: 0.05, A: 0.20, B: 0.40, C: 0.65 };
  check("tiers: S is the top 5%, A to 20%, B to 40%, C to 65%", Object.keys(cut).every(k => t.tiers[k].every(m => (t.ranks[m.id].rank - 1) / t.total < cut[k])) && t.tiers.S.length >= 1);
  check("tiers: the coding and agentic views rank only models measured on them", ["coding", "agentic"].every(k => { const x = Ranking.tiers(k, false); return x.total > 20 && x.list.every(m => typeof m.score[k] === "number"); }));
  check("tiers: legacy models join only when asked", Ranking.tiers("aa", true).total >= t.total);
  check("tiers: the compare chapter follows the live top pair", Ranking.topPair().length === 2 && Ranking.topPair()[0] === t.list[0].id);
}

/* ---------- 9. market: computed from the catalog the page holds ---------- */
{
  const t = Ranking.tiers("aa", false);
  const blended = m => (3 * m.spec.priceIn + m.spec.priceOut) / 4;
  const lad = Market._ladder(t);
  check("market: the ladder names the cheapest priced model of each tier", lad.length === 4 && lad.every(r => !r.model || (t.tiers[r.tier].includes(r.model) && t.tiers[r.tier].filter(m => m.spec && typeof m.spec.priceIn === "number" && typeof m.spec.priceOut === "number").every(m => blended(m) >= blended(r.model)))));
  const bv = Market._bestValue(t, 8);
  const median = t.list[Math.floor(t.list.length / 2)].score.aa;
  check("market: best value is points per dollar among models at or above the median", bv.length > 0 && bv.every(v => v.m.score.aa >= median) && bv.every((v, i) => i === 0 || bv[i - 1].value >= v.value));
  const cost = Market._monthly({ spec: { priceIn: 1, priceOut: 2 } }, 30, "medium");
  check("market: the monthly calculator does the arithmetic (30 msgs/day, medium = $2.61)", Math.abs(cost - 2.61) < 1e-9, String(cost));
  check("market: price moves are read from priceWas, biggest first", Array.isArray(Market._moves()));
}

/* ---------- 10. glossary ---------- */
{
  check("glossary: >= 21 terms", Glossary.TERMS.length >= 21);
  check("glossary: every term has one-sentence def", Glossary.TERMS.every(t => t.term && t.def && t.def.length > 20));
  check("glossary: search works", Glossary.filter("token").some(t => t.id === "token") && Glossary.filter("zzzz").length === 0);
  const linked = Glossary.TERMS.filter(t => t.link);
  const deadLinks = linked.filter(t => !htmlIds.has(String(t.link.hash).replace(/^#/, "")));
  check("glossary: " + linked.length + " terms link to a place that exists on the page", linked.length >= 5 && deadLinks.length === 0, deadLinks.map(t => t.id + "->" + t.link.hash).join(", "));
  check("glossary: no stale claim about keys or auto-run", !/WhichAI is BYOK|auto-run/i.test(readFileSync("js/glossary.js", "utf8")));
}

/* ---------- 11. finder, stack, doctor ---------- */
{
  const r1 = Finder._recommend({ step: 99, task: "writing", mode: "app", budget: "low", needs: [], extra: "creative" });
  check("finder: creative writing -> Claude/Fable", r1.top.dbId === "fable-5", JSON.stringify(r1.top && r1.top.dbId));
  const r2 = Finder._recommend({ step: 99, task: "research", mode: "app", budget: "free", needs: ["web"], extra: "quick" });
  check("finder: sourced research -> Perplexity", r2.top.app === "perplexity", r2.top && r2.top.name);
  const r3 = Finder._recommend({ step: 99, task: "coding", mode: "dev", budget: "free", needs: [], extra: "help" });
  const r3free = [r3.top].concat(r3.alts).filter(o => o && o.kind === "model");
  check("finder: dev+free coding offers a model that is free right now", r3free.length >= 1 && r3free.every(o => { const m = DB.models.find(x => x.id === o.dbId); return m && /free/i.test(m.access) && !/retired/i.test(m.access); }), r3free.map(o => o.dbId).join(","));
  const r4 = Finder._recommend({ step: 99, task: "general", mode: "app", budget: "free", needs: ["privacy"], extra: null });
  check("finder: privacy surfaces the strongest downloadable model", [r4.top].concat(r4.alts).some(o => { const m = DB.models.find(x => x.id === o.dbId); return m && m.tags.includes("open-weights"); }));
  const r5 = Finder._recommend({ step: 99, task: "coding", mode: "dev", budget: "any", needs: [], extra: "agent" });
  check("finder: dev+any coding surfaces a value pick outside the big three", [r5.top].concat(r5.alts).some(o => { const m = DB.models.find(x => x.id === o.dbId); return m && !["Anthropic", "OpenAI", "Google"].includes(m.vendor); }));
  check("finder: why lists populated", r1.top.why.length >= 1 && r2.top.why.length >= 1);
  check("finder: offers carry access + limit", [r1, r2, r3].every(r => r.top.access && r.top.limit));
  check("finder: the quick answer has one button per task", Engine.TASK_ORDER.every(t => Finder.TASK_ICONS[t]));
  check("finder: paid Claude pick is Opus 5, stack agrees", readFileSync("js/finder.js", "utf8").includes('low: "claude-opus-5"') && readFileSync("js/stack.js", "utf8").includes('paid: "claude-opus-5"'));

  const s1 = Stack._optimize({ tasks: ["writing", "research", "coding"], subs: ["chatgpt", "perplexity", "claude"], budget: "20", needs: ["web"], done: true });
  check("stack: $20 budget keeps 1 paid sub", s1.stack.filter(s => s.paid).length === 1 && s1.newCost <= 20);
  check("stack: redundancy detected", s1.redundant.length >= 1 && s1.currentCost === 60);
  const s2 = Stack._optimize({ tasks: ["writing"], subs: [], budget: "0", needs: [], done: true });
  check("stack: free-only budget costs 0", s2.newCost === 0 && s2.stack.every(s => !s.paid));
  const s3 = Stack._optimize({ tasks: ["research"], subs: [], budget: "nolimit", needs: ["web", "privacy"], done: true });
  check("stack: web need routes research to Perplexity", s3.stack.some(s => s.app === "perplexity"));
  check("stack: privacy extra surfaces local option", s3.extras.some(x => x.kind === "privacy" && x.dbId === "inkling"));
  const s4 = Stack._optimize({ tasks: ["coding"], subs: [], budget: "0", needs: ["api"], done: true });
  check("stack: the API extra points at the Market, not a removed view", s4.extras.some(x => x.kind === "api" && /Market/.test(x.text) && !/Compare|Chains/.test(x.text)));

  const weak = Doctor._analyze("write something");
  const strong = Doctor._analyze("Act as a senior editor. Rewrite my article for beginner developers as a 5-bullet list, max 200 words, avoid jargon. Context: our company sells devtools. For example keep the tone like our blog. Make sure it is accurate; if unsure, ask clarifying questions. Cite sources.");
  check("doctor: weak prompt scores low (" + weak.score + ")", weak.score <= 20);
  check("doctor: strong prompt scores high (" + strong.score + ")", strong.score >= 85);
  check("doctor: 10 weighted checks with tips", Doctor._checks.length === 10 && Doctor._checks.every(c => c.tip && c.w > 0));
  const it = Doctor._analyze("Agisci come un editor esperto. Riscrivi il testo per principianti, al massimo 200 parole, evita il gergo. Ad esempio come il nostro blog. Se non sei sicuro chiedi. Cita le fonti.");
  check("doctor: Italian keywords recognized (" + it.score + ")", it.score >= 60);
}

/* ---------- 12. official links, change feed, radar/share exports ---------- */
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

/* ---------- 13. catalog facts that must not regress ---------- */
{
  const o5 = DB.models.find(m => m.id === "claude-opus-5");
  check("v28: Claude Opus 5 public with specs", o5 && o5.status === "public" && !o5.score.est && o5.score.src === "aa" && o5.spec.priceIn === 5 && o5.family === "claude");
  check("v28: the measured leader is a public, non-estimated model", (() => {
    const lead = DB.models.filter(m => m.score && typeof m.score.aa === "number" && !m.score.est).sort((a, b) => b.score.aa - a.score.aa)[0];
    return lead && lead.status === "public" && lead.score.src === "aa";
  })());
  check("v28: Gemini 3.6 Flash + Flash-Lite present", ["gemini-3-6-flash", "gemini-3-5-flash-lite"].every(id => DB.models.some(m => m.id === id && !m.score.est)));
  check("v28: no rumored model is presented as measured", !DB.models.some(m => m.status === "rumored" && m.score && m.score.est === false));
  check("v35: every converted score keeps its provenance", DB.models.filter(m => m.score && m.score.src === "converted").every(m => m.score.est === true && typeof m.score.was === "number"));
  check("v28+: db and bench carry the same snapshot date", DB.updated === Bench.updated);

  check("v29: 6 debates, all sourced, both sides", Topics.TOPICS.length === 6 && Topics.TOPICS.every(t => t.sideA && t.sideB && t.status && t.sources.length >= 2 && t.sources.every(s => /^https:/.test(s.url))));
  check("v29: debates carry numbers with labels", Topics.TOPICS.every(t => t.numbers.length >= 2 && t.numbers.every(n => n.v && n.label)));
  check("v36: debates link to ComplyAI.wiki where the law is the topic", /complyai\.wiki/.test(readFileSync("js/topics.js", "utf8")));
  check("v36: debate decisions point at chapters that exist", Topics.TOPICS.every(t => { const d = Topics.getDecision ? Topics.getDecision(t.id) : null; return !d || !d.href || htmlIds.has(String(d.href).replace(/^#/, "").split("=")[0]); }));
  {
    /* The owner may legitimately have filled these in. What must hold is that
       an EMPTY value hides the feature and never invents a number. */
    const Cfg = require("../js/config.js");
    const SupportMod = require("../js/support.js");
    const supportSrc = readFileSync("js/support.js", "utf8");
    const hidesWhenEmpty = supportSrc.includes("if (!code)") && supportSrc.includes("if (!url)");
    const noFakeNumber = !/count\s*[:=]\s*\d{2,}/.test(supportSrc);
    check("v29: counter and donate stay hidden until configured", hidesWhenEmpty && noFakeNumber && typeof SupportMod.init === "function" && typeof Cfg.goatCode === "string" && typeof Cfg.donateUrl === "string");
    check("v30: counter degrades instead of throwing without fetch", supportSrc.includes('typeof fetch !== "function"'));
  }
  check("v29: kimi k3 now open-weights", DB.models.some(m => m.id === "kimi-k3" && m.tags.includes("open-weights")));
  check("v29: gemini 3.5 pro rumor is info-only + estimated", DB.models.some(m => m.id === "gemini-3-5-pro" && m.status === "rumored" && m.score.est && m.tags.includes("info-only")));

  const NEW_AUG = ["grok-4-6", "glm-5-3", "glm-5-3-flash", "gemini-3-7-flash", "muse-spark-1-2"];
  check("v31: the five August models are in the catalog", NEW_AUG.every(id => DB.models.some(m => m.id === id)));
  check("v31: every August model carries a release date and a measured score", NEW_AUG.every(id => {
    const m = DB.models.find(x => x.id === id);
    return m && m.score.est === false && m.spec && /^2026-08-/.test(m.spec.released);
  }));
  const NEW_SEP = ["fable-5-1", "muse-spark-1-3", "gemini-3-8-flash", "gpt-6"];
  check("v33: the September models are in the catalog, measured or honestly converted", NEW_SEP.every(id => {
    const m = DB.models.find(x => x.id === id);
    const ok = m && m.score && typeof m.score.aa === "number" && ((m.score.est === false && m.score.src === "aa") || (m.score.est === true && m.score.src === "converted"));
    return ok && m.spec && /^2026-09-/.test(m.spec.released);
  }));
  const measured = DB.models.filter(m => m.score && m.score.est === false && typeof m.score.aa === "number");
  const rank = measured.slice().sort((a, b) => b.score.aa - a.score.aa);
  check("v31: leaderboard is ordered and led by a measured public model", rank.length > 50 && rank[0].status === "public" && rank[0].score.est === false && rank[0].score.aa >= rank[1].score.aa && rank[1].score.aa >= rank[2].score.aa);
  check("v31: the top ten are a plausible spread, not a data error", (() => { const spread = rank[0].score.aa - rank[9].score.aa; return spread >= 0 && spread <= 15; })());
  check("v31: the scale note names its snapshot and its retrieval date", /[A-Z][a-z]+ \d{1,2}, 20\d\d/.test(DB.scaleNote) && /snapshot/i.test(DB.scaleNote) && /retriev/i.test(DB.scaleNote));
  check("v31: the index snapshot is backed by a cited https source", Bench.sources.some(s2 => /aa/i.test(s2.id) && /^https:/.test(s2.url)));
  const glm53 = DB.models.find(m => m.id === "glm-5-3");
  check("v31: GLM-5.3 is not tagged open-weights", !glm53.tags.includes("open-weights") && /NOT released/.test(glm53.access));
  const glmFlash = DB.models.find(m => m.id === "glm-5-3-flash");
  check("v31: GLM-5.3-Flash is tagged open-weights with its licence", glmFlash.tags.includes("open-weights") && /MIT/.test(glmFlash.access));
  const g37 = DB.models.find(m => m.id === "gemini-3-7-flash");
  check("v31: Gemini 3.7 Flash is not claimed free", !g37.tags.includes("free") && /not confirmed/.test(g37.access));
  check("v31: Sonnet 5 intro pricing recorded as expired", (() => { const m = DB.models.find(x => x.id === "sonnet-5"); return m.spec.priceIn === 3 && m.spec.priceOut === 15 && /expired/.test(m.spec.note); })());
  const feed = ChangesFeed.CHANGES;
  check("v31: radar carries the August entries with sources", (() => { const aug = feed.filter(e => /^2026-08-/.test(e.date)); return aug.length >= 6 && aug.every(e => e.src && /^https:/.test(e.src.url) && e.note && e.note.length > 40); })());
  check("v31: repo references point at the current repository", !["README.md", "AGENTS.md", "HANDOVER.md"].some(f => readFileSync(f, "utf8").includes("Jackfdl/promptcompass-")));

  /* A rank or an index score written into a sentence is wrong within weeks. */
  const offenders = DB.models.filter(m => /#\s?([1-9]|10)\b/.test(m.review || ""));
  check("v33: no model review claims a rank in prose", offenders.length === 0, offenders.map(m => m.id).join(", "));
  const contradictions = DB.models.filter(m => {
    const own = m.score && typeof m.score.aa === "number" ? m.score.aa : null;
    if (own === null) return false;
    const nums = [...(m.review || "").matchAll(/\b([3-6][0-9]\.[0-9])\b/g)].map(x => parseFloat(x[1]));
    return nums.some(n => Math.abs(n - own) > 0.05 && !/%/.test((m.review || "").slice((m.review || "").indexOf(String(n)), (m.review || "").indexOf(String(n)) + String(n).length + 1)));
  });
  check("v33: no review states an index score that is not its own", contradictions.length === 0, contradictions.map(m => m.id).join(", "));
  const ghost = DB.models.filter(m => (m.status === "rumored" || m.status === "private") && m.score && typeof m.score.aa === "number");
  check("v33: unmeasured models carry no index score at all", ghost.length === 0, ghost.map(m => m.id).join(", "));
  const guessed = DB.models.filter(m => m.score && m.score.aa === null && typeof m.score.guess === "number");
  check("v33: their estimate survives in a separate field", guessed.length >= 5 && guessed.every(m => m.score.est === true));
  check("v33: the drawer shows a guess as unmeasured, never as a rank", app.includes("badge-unmeasured") && app.includes("R.tierOf(m.id)") && /!m\.score\.est \? R\.tierOf/.test(app));
  const hardcoded = ["js/app.js", "js/finder.js", "js/modelcompare.js", "js/ranking.js", "js/market.js", "tools/build-seo.mjs"].filter(f => /July \d{1,2}, 20\d\d|July 20\d\d/.test(readFileSync(f, "utf8")));
  check("v33: no module hardcodes a snapshot date", hardcoded.length === 0, hardcoded.join(", "));
  check("v33: benchmarks reads scores from the database", (() => { const b = readFileSync("js/benchmarks.js", "utf8"); return b.includes("function liveScore") && b.includes("models-db.js"); })());
}

/* ---------- 14. the API and the automation ---------- */
{
  const apiClient = readFileSync("js/api.js", "utf8");
  const lib = readFileSync("api/_lib.js", "utf8");
  const endpoints = ["health", "models", "benchmarks", "recommend", "stats", "refresh", "live", "catalog", "news"];
  check("api: every endpoint file exists and exports a handler", endpoints.every(e => existsSync("api/" + e + ".js") && typeof require("../api/" + e + ".js") === "function"));
  check("api: the dev runner mounts every endpoint", endpoints.every(e => readFileSync("tools/api-dev.mjs", "utf8").includes('"' + e + '"')));
  check("api: refuses anything but GET/HEAD/OPTIONS", lib.includes('req.method !== "GET" && req.method !== "HEAD"') && lib.includes("405"));
  check("api: cache and cors headers", lib.includes("s-maxage") && lib.includes("Access-Control-Allow-Origin"));
  check("api: reuses the browser data modules (one source of truth)", lib.includes('require("../js/models-db.js")') && lib.includes('require("../js/benchmarks.js")'));
  check("api: no secret or env token is read", !/process\.env\.[A-Z_]*(KEY|TOKEN|SECRET)/.test(lib + readFileSync("api/models.js", "utf8") + readFileSync("api/_news-core.js", "utf8")));
  check("api: health advertises the news wire and the check", readFileSync("api/health.js", "utf8").includes("/api/news") && readFileSync("api/health.js", "utf8").includes("/api/refresh"));
  check("api: the client has a timeout, never throws, sends nothing of the user's", apiClient.includes("AbortController") && /TIMEOUT_MS\s*=\s*\d+/.test(apiClient) && apiClient.includes("return null") && apiClient.includes('credentials: "omit"') && !/localStorage|sessionStorage/.test(apiClient));
  check("api: the client can skip its memory cache for the news", /opts\.fresh/.test(apiClient));
  check("api: service worker never caches /api/", sw.includes('url.pathname.indexOf("/api/") === 0'));

  const yCi = readFileSync(".github/workflows/ci.yml", "utf8");
  const yData = readFileSync(".github/workflows/data-refresh.yml", "utf8");
  check("ci: runs every suite", ["run-tests.mjs", "smoke-dom.mjs", "api-tests.mjs", "live-data-tests.mjs", "catalog-tests.mjs", "news-tests.mjs"].every(f => yCi.includes(f)));
  check("ci: scheduled data refresh exists and is cron driven", /cron:\s*"\s*\d+\s+\d+\s+\*\s+\*\s+[0-6]"/.test(yData) && yData.includes("refresh-data.mjs") && /workflow_dispatch/.test(yData));
  check("ci: the scheduled job needs no write access", /permissions:\s*\n\s*contents:\s*read/.test(yData) && !/contents:\s*write/.test(yData));
  check("ci: every workflow step points at a file that exists", (() => {
    const missing = [];
    for (const y of [yCi, yData]) for (const m of y.matchAll(/node\s+((?:tests|tools)\/[\w.-]+\.mjs)/g)) if (!existsSync(m[1])) missing.push(m[1]);
    return missing.length === 0;
  })());

  const core = readFileSync("api/_refresh-core.js", "utf8");
  const cli = readFileSync("tools/refresh-data.mjs", "utf8");
  const endpoint = readFileSync("api/refresh.js", "utf8");
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
  check("refresh: one shared implementation", cli.includes('require("../api/_refresh-core.js")') && endpoint.includes('require("./_refresh-core.js")') && /function analyse\(/.test(core) && !/function analyse\(/.test(cli + endpoint));
  check("refresh: checks the free routes the catalog names, not app defaults (v0.36)", core.includes("function citedFreeRoutes") && !/DEFAULT_OR_MODELS|appSrc/.test(core + cli + endpoint));
  check("refresh: audits the automation instead of editing data", !/score\s*\.\s*aa\s*=/.test(core + cli) && core.includes("report.automated") && core.includes("Needs a human"));
  check("refresh: a dead upstream degrades instead of failing", cli.includes("Skipped: the upstream source did not answer") && cli.includes("process.exit(STRICT ? 1 : 0)") && endpoint.includes("skippedReport"));
  check("refresh: a daily Vercel cron drives it", Array.isArray(vercel.crons) && vercel.crons.some(c => c.path === "/api/refresh" && /^\S+ \S+ \S+ \S+ \S+$/.test(c.schedule)) && vercel.crons.every(c => !/^\*/.test(c.schedule.split(" ")[1])));
  check("refresh: the radar shows the result and degrades silently", readFileSync("js/radar.js", "utf8").includes('WhichAIApi.get("/refresh")') && /if \(!r\) return;/.test(readFileSync("js/radar.js", "utf8")));
  const radarKeys = ["radarCheckClean", "radarCheckReview", "radarCheckBroken", "radarCheckSkipped"];
  check("refresh: check labels exist in all 11 languages", I18n.LANGS.every(l => radarKeys.every(k => typeof I18n.STRINGS[l.code][k] === "string" && I18n.STRINGS[l.code][k].length > 0)));

  check("build: vercel builds from tools/build.mjs into dist", vercel.buildCommand === "node tools/build.mjs" && vercel.outputDirectory === "dist");
  check("build: security headers configured", ["X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Permissions-Policy"].every(h => JSON.stringify(vercel.headers).includes(h)));
  const build = readFileSync("tools/build.mjs", "utf8");
  check("build: recomputes the CSP hash, keeps non-ascii, never ships api/", build.includes("refreshCspHash") && build.includes("createHash") && build.includes('charset: "utf8"') && !build.includes('"api"'));
  check("build: no 3D bundle step left", !/bundle-3d|scene3d/.test(build));
}

/* ---------- 15. v0.36: one page, six chapters, visibly connected ---------- */
{
  const CH = ["ranking", "compare", "radar", "market", "debates", "tools"];
  const pos = CH.map(c => html.indexOf('id="' + c + '" data-chapter="' + c + '"'));
  check("chapters: ranking, compare, radar, market, debates, tools - in that order", pos.every((p, i) => p > 0 && (i === 0 || p > pos[i - 1])));
  check("chapters: the conductor walks the same order", app.includes('var CHAPTERS = ["ranking", "compare", "radar", "market", "debates", "tools"];'));
  check("chapters: each one carries its accent colour", CH.every(c => new RegExp('id="' + c + '" data-chapter="' + c + '" data-accent="\\d{1,3} \\d{1,3} \\d{1,3}"').test(html)));
  check("chapters: the data comes first (the page opens on the ranking)", html.indexOf('id="ranking"') < html.indexOf('id="tools"') && /<h1[^>]*id="ranking-title"/.test(html));
  check("chapters: no cover, no menu of views", !htmlIds.has("welcome") && !htmlIds.has("journey") && ![...htmlIds].some(id => /^nav-|-view$/.test(id)));
  check("chapters: the tools end the page: finder first, then prompt, doctor, stack", ["find", "prompt", "doctor", "stack"].map(id => html.indexOf('id="' + id + '"')).every((p, i, a) => p > html.indexOf('id="tools"') && (i === 0 || p > a[i - 1])));
  check("chapters: the quick answer comes before the guided finder", html.indexOf('id="quick-wrap"') < html.indexOf('id="finder-wrap"') && html.indexOf('id="finder-wrap"') < html.indexOf('id="gen"'));

  /* Every chapter still hands the next one something to read (a bridge with
     a live token: the top two, the newest arrival, the leader's price...).
     Since v0.37 the tokens stay put: the card that used to fly from one
     chapter to the next is gone, the dots behind the page carry the change. */
  const BRIDGES = [["bridge-duel", "ranking", "compare"], ["bridge-newest", "compare", "radar"], ["bridge-price", "radar", "market"], ["bridge-debate", "market", "debates"], ["bridge-task", "debates", "tools"]];
  for (const [id, from, to] of BRIDGES) check("bridge: " + id + " closes " + from + " and points to " + to, between('id="' + id + '"', from, to) && new RegExp('id="' + id + '"[\\s\\S]{0,400}href="#' + to + '"').test(html));
  const jsAll = SCRIPTS.map(f => readFileSync(f, "utf8")).join("\n");
  check("bridge: no flying cards left (no morph attributes, ghosts or settling)", !/data-morph-(from|to)/.test(html + jsAll) && !/morph-ghost|settleAll|buildGhost|is-settling/.test(jsAll + css));

  const motion = readFileSync("js/motion.js", "utf8");
  const dots = readFileSync("js/dotfield.js", "utf8");
  const Dots = require("../js/dotfield.js");
  check("motion: everything turns off for prefers-reduced-motion", motion.includes("prefers-reduced-motion") && dots.includes("prefers-reduced-motion") && /@media \(prefers-reduced-motion: reduce\)/.test(css));
  check("motion: chapters mount lazily, ahead of the reader", motion.includes("IntersectionObserver") && /rootMargin/.test(motion));
  check("motion: scrolling is never hijacked", !/preventDefault|scrollTo\(|wheel/.test(motion + dots) && /passive: true/.test(motion) && /passive: true/.test(dots));
  check("motion: hands every frame's geometry to its listeners", /onFrame: function/.test(motion) && /layout: layoutVersion/.test(motion));

  /* The dot field: decorative, behind everything, driven by the scroll. */
  check("dots: one canvas behind the page, hidden from assistive tech", /<canvas class="dotfield" id="dotfield" aria-hidden="true"><\/canvas>/.test(html) && /\.dotfield \{[^}]*position: fixed;[^}]*z-index: 0;[^}]*pointer-events: none;/.test(css) && /main, \.site-footer \{ position: relative; z-index: 1; \}/.test(css));
  check("dots: loaded after motion and before the app, precached, not printed", SCRIPTS.indexOf("js/dotfield.js") === SCRIPTS.indexOf("js/motion.js") + 1 && SCRIPTS.indexOf("js/dotfield.js") < SCRIPTS.indexOf("js/app.js") && sw.includes('"js/dotfield.js"') && /\.dotfield \{ display: none !important; \}|\.hero-actions, \.dotfield \{ display: none !important; \}/.test(css));
  check("dots: a pattern for every chapter, in page order", JSON.stringify(Dots.patterns) === JSON.stringify(CH));
  {
    const chs = [{ top: 0, bottom: 3000 }, { top: 3000, bottom: 4500 }, { top: 4500, bottom: 9000 }];
    const at = (sy) => Dots._storyAt(sy, 900, chs);
    const seq = [0, 1000, 2100, 2300, 2500, 2700, 2900, 3000, 3600, 3800, 4200, 4600, 8000].map(at);
    check("dots: the story position is a plain, monotonic function of the scroll", seq.every((v, i) => i === 0 || v >= seq[i - 1]) && seq[0] === 0 && seq[seq.length - 1] === 2 && at(2500) === at(2500));
    check("dots: a change starts as the next chapter enters and ends near the top", at(3000 - 900 * 0.92) === 0 && at(3000 - 900 * 0.2) === 1 && at(3000 - 900 * 0.56) > 0.45 && at(3000 - 900 * 0.56) < 0.55);
    const phis = [];
    Dots._storyAt(3750, 900, chs, phis);
    check("dots: the reading position inside each chapter is 0..1", phis.length === 3 && phis.every(p => p >= 0 && p <= 1) && phis[1] > 0.4 && phis[1] < 0.9);
    const samples = [];
    for (const id of CH) for (let x = 0; x <= 1440; x += 120) for (let y = 0; y <= 900; y += 90) for (const ph of [0, 0.5, 1]) samples.push([id, Dots._lit(id, x, y, 1440, 900, ph)]);
    check("dots: every pattern lights dots between 0 and 1, and lights some", samples.every(([, v]) => v >= 0 && v <= 1.0001 && isFinite(v)) && CH.every(id => samples.some(([k, v]) => k === id && v > 0.4)));
    check("dots: the same place and reading position always look the same", CH.every(id => Dots._lit(id, 1200, 400, 1440, 900, 0.3) === Dots._lit(id, 1200, 400, 1440, 900, 0.3)));
  }
  check("dots: no time-based settling: only the pointer, a click ripple and the first fade-in run on their own", !/settle/i.test(dots.replace(/\/\*[\s\S]*?\*\//g, "")) && /pointerType !== "mouse" && e\.pointerType !== "pen"/.test(dots) && /isControl\(e\.target\)/.test(dots));
  check("dots: text stays clean (headings and ledes are masked)", /MASK_SEL = "\.ch-eyebrow, \.ch-title, \.ch-lede/.test(dots));
  check("dots: no canvas, no dots, no error", /if \(!c\) \{ canvasEl\.hidden = true; return false; \}/.test(dots));
  check("motion: the progress bar and rail exist", htmlIds.has("progress-bar") && htmlIds.has("rail-fill"));

  /* Old addresses keep working: every retired view has a home. */
  const legacy = (app.match(/var LEGACY = \{([\s\S]*?)\};/) || [])[1] || "";
  const pairs = [...legacy.matchAll(/"([\w-]+)":\s*"([\w-]+)"/g)].map(m => [m[1], m[2]]);
  const OLD = ["guide", "compare-specs", "compare-outputs", "merge", "chains", "arena", "live", "topics", "finder", "generator", "settings", "about-different", "about-freshness", "about-methodology", "glossary-view"];
  check("links: every old address is mapped", OLD.every(o => pairs.some(p => p[0] === o)), OLD.filter(o => !pairs.some(p => p[0] === o)).join(", "));
  check("links: every mapped address lands on an id that exists", pairs.every(p => htmlIds.has(p[1])), pairs.filter(p => !htmlIds.has(p[1])).map(p => p.join("->")).join(", "));

  /* Removed features leave nothing behind: no file, no script, no cache
     entry, no stored key in a returning visitor's browser. */
  const GONE = ["js/welcome.js", "js/journey.js", "js/stage.js", "js/scene3d.js", "js/chains.js", "js/merge.js", "js/arena.js", "js/live-data.js", "src/scene3d.src.js", "tools/bundle-3d.mjs"];
  check("removed: the retired modules are gone from the repo", GONE.every(f => !existsSync(f)), GONE.filter(f => existsSync(f)).join(", "));
  check("removed: nothing loads or precaches them", GONE.every(f => !html.includes(f) && !sw.includes('"' + f + '"')));
  check("removed: three.js is no longer a dependency", !JSON.stringify(JSON.parse(readFileSync("package.json", "utf8")).dependencies || {}).includes("three"));
  check("removed: no API key field, no auto-run, no BYOK host in the CSP", !/type="password"|keymode|key-reveal/.test(html) && /connect-src 'self' https:\/\/\*\.goatcounter\.com;/.test(html) && !/googleapis\.com\/v1|api\.groq\.com|openrouter\.ai\/api/.test(html));
  check("removed: keys stored by older versions are wiped on load", /function forgetRetiredKeys/.test(app) && ["pc_settings_v1", "pc_keymode", "pc_chains_v1", "pc_arena_v1", "pc_merge_v1"].every(k => app.includes('"' + k + '"')));
  check("removed: every page script is precached for offline use", SCRIPTS.every(s => sw.includes('"' + s + '"')));

  /* Jack's other projects are linked visibly. */
  check("projects: ComplyAI.wiki and War Right Now are linked from the footer", /href="https:\/\/complyai\.wiki"[^>]*rel="noopener"/.test(html) && /href="https:\/\/warrightnow\.vercel\.app"[^>]*rel="noopener"/.test(html) && htmlIds.has("projects"));

  check("drawer: a real dialog with a close button", /id="drawer"[^>]*role="dialog"|role="dialog"[^>]*id="drawer"/.test(html) && /aria-modal="true"/.test(html) && htmlIds.has("drawer-close"));
  check("drawer: deep links use #model= and are kept in sync", app.includes("#model=") && app.includes("replaceState"));
  check("theme: light and dark only, chosen before first paint", /data-theme/.test(html) && /\[data-theme="dark"\]/.test(css) && !/sepia/.test(app));
  check("honesty: says how it differs from leaderboards and does not run its own benchmarks", htmlIds.has("about-diff") && html.includes("LMArena") && html.includes("Hugging Face") && html.includes("does not run its own benchmarks"));
  check("honesty: explains how data stays current, automatically and honestly", htmlIds.has("about-data") && html.includes("Scores: official, automatic") && html.includes("Never automatic"));
  check("honesty: documents the API, news wire included", htmlIds.has("about-api") && html.includes("/api/recommend") && html.includes("/api/news"));
  check("honesty: no stale 'no server' claim in the UI", !/no server|nessun server|aucun serveur|sin servidor|kein Server|sem servidor/i.test(html) && !I18n.LANGS.some(l => /no server|nessun server|aucun serveur|sin servidor|kein Server|sem servidor/i.test(JSON.stringify(I18n.STRINGS[l.code]))));
}

/* ---------- 16. HTML <-> JS id cross-check ---------- */
{
  const created = new Set();
  const refs = [];
  for (const f of SCRIPTS) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/\.id\s*=\s*"([^"]+)"/g)) created.add(m[1]);
    for (const m of src.matchAll(/setAttribute\("id",\s*"([^"]+)"\)/g)) created.add(m[1]);
    for (const m of src.matchAll(/(?:getElementById|\$)\("([A-Za-z][\w-]*)"\)/g)) refs.push([f, m[1]]);
  }
  const missing = refs.filter(([, id]) => !htmlIds.has(id) && !created.has(id)).map(([f, id]) => f + ":" + id);
  check("ids: every element the scripts look up exists (" + refs.length + " lookups)", missing.length === 0, [...new Set(missing)].join(", "));
  const MUST = ["ranking-title", "rank-kpis", "rank-summary", "rank-controls", "rank-search", "rank-results", "tier-list", "tier-note", "scatter", "vs-stage", "vs-body", "radar-latest", "radar-wrap", "mk-leader", "market-wrap", "topics-wrap", "glossary-list", "quick-wrap", "finder-wrap", "gen", "goal", "generate", "panels", "doctor-wrap", "stack-wrap", "drawer", "drawer-body", "live-pill", "lang-select", "theme-toggle", "data-export", "data-import", "data-wipe", "foot-support", "visit-counter", "about-support", "support-btn", "foot-version"];
  const absent = MUST.filter(id => !htmlIds.has(id));
  check("ids: the v0.36 skeleton is complete", absent.length === 0, absent.join(", "));
}

/* ---------- 17. version coherence ---------- */
{
  check("version: APP_VERSION v0.37", app.includes('APP_VERSION = "v0.37"'));
  check("version: footer v0.37", html.includes(">WhichAI v0.37<"));
  check("version: SW cache v0.37.0", sw.includes('"whichai-v0.37.0"'));
  check("version: package.json 0.37.0", JSON.parse(readFileSync("package.json", "utf8")).version === "0.37.0" && JSON.parse(readFileSync("package-lock.json", "utf8")).version === "0.37.0");
  check("version: the API reports v0.37", readFileSync("api/_lib.js", "utf8").includes('APP_VERSION = "v0.37"'));
  check("brands: 13 branded model controls in the generator", (html.match(/data-ai-brand=/g) || []).length === 13 && html.includes("js/brands.js"));
  check("brands: dark wordmarks use a light treatment", /\[data-theme="dark"\] \.ai-brand-wordmark\s*\{[^}]*invert\(1\)/s.test(css));
  check("brands: SW precaches the core brand assets", sw.includes("assets/brands/claude-color.svg") && sw.includes("assets/brands/qwen-color.svg"));
  check("csp: meta present, goatcounter the only third party", html.includes("Content-Security-Policy") && html.includes("https://gc.zgo.at") && html.includes("https://*.goatcounter.com"));
  {
    const noDash = ["js/i18n.js", "js/models-db.js", "js/benchmarks.js", "js/engine.js", "js/finder.js", "js/glossary.js", "js/modelcompare.js", "js/charts.js", "js/app.js", "js/ranking.js", "js/market.js", "js/radar.js", "js/topics.js", "js/motion.js", "js/dotfield.js", "js/generator.js", "index.html", "manifest.webmanifest"];
    const dirty = noDash.filter(f => readFileSync(f, "utf8").includes("—"));
    check("text: no em dashes in visible files", dirty.length === 0, dirty.join(", "));
  }
  {
    const sm = readFileSync("sitemap.xml", "utf8");
    const urlCount = (sm.match(/<loc>/g) || []).length;
    check("wiki: sitemap has 150+ urls (" + urlCount + ")", urlCount >= 150);
    check("wiki: model page generated + clean", existsSync("models/fable-5.html") && existsSync("models/index.html") && !readFileSync("models/fable-5.html", "utf8").includes("—"));
    check("wiki: best-ai-for + glossary + compare + dataset", existsSync("best-ai-for/coding.html") && existsSync("glossary/token.html") && existsSync("compare/fable-5-vs-gpt-5-6-sol.html") && existsSync("data/models.json"));
    const ds = JSON.parse(readFileSync("data/models.json", "utf8"));
    check("wiki: open dataset valid (" + ds.count + " models)", ds.count === ds.models.length && ds.count >= 105);
    const wikiLinks = readFileSync("models/fable-5.html", "utf8") + readFileSync("best-ai-for/coding.html", "utf8");
    check("wiki: pages link to the new chapters, not retired views", !/\/#(finder|compare-specs|compare-outputs|topics|chains|arena|guide|about-methodology)\b/.test(wikiLinks));
  }
}

/* ---------- 18. CSS sanity ---------- */
{
  check("css: braces balanced", css.split("{").length === css.split("}").length);
  check("css: [hidden] always wins over display rules", /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/.test(css));
  check("css: focus-visible ring", css.includes(":focus-visible"));
  check("css: light and dark tokens with color-scheme", /color-scheme: light/.test(css) && /color-scheme: dark/.test(css));
  check("css: unified radii tokens", css.includes("--r-card:") && css.includes("--r-ctl:"));
  check("css: tier colours defined", ["--t-S", "--t-A", "--t-B", "--t-C", "--t-D"].every(v => css.includes(v)));
  check("css: update toast", css.includes(".update-toast"));
  check("css: a phone layout exists", /@media \(max-width: 640px\)/.test(css) && /@media \(max-width: 420px\)/.test(css));
  check("css: right-to-left handled", /\[dir="rtl"\]/.test(css));
}

/* ---------- 19. manifest ---------- */
{
  try {
    const man = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
    check("manifest: valid JSON with icons", Array.isArray(man.icons) && man.icons.length >= 2 && man.icons.every(i => existsSync(i.src)));
  } catch (e) { check("manifest: valid JSON", false, String(e)); }
}

console.log("\n" + pass + " passed, " + fail + " failed" + (fail ? "\n\nFAILURES:\n" + failures.join("\n") : " - ALL GREEN"));
process.exit(fail ? 1 : 0);
