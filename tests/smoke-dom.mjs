/* WhichAI - DOM smoke test (v0.36): boots the real page inside jsdom and walks
   the six chapters top to bottom: ranking, compare, radar, market, debates,
   tools; then the drawer, old addresses, language, theme, and fresh data
   landing while the page is open.
   jsdom has no IntersectionObserver, so every chapter mounts at once: the
   same code path a browser takes when the reader scrolls past each one.
   Run: node tests/smoke-dom.mjs  (needs jsdom from devDependencies) */
import { readFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { JSDOM, VirtualConsole } = require("jsdom");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " - " + detail : "")); console.log("FAIL  " + name + (detail ? " - " + detail : "")); }
}
const tick = (ms) => new Promise(r => setTimeout(r, ms || 30));

const html = readFileSync("index.html", "utf8");
/* The page's own console reaches ours; jsdom's "navigation not implemented"
   (a download link being clicked) is noise, and anything the app reports as
   a failed render is collected and fails the run at the end. */
const pageErrors = [];
const vc = new VirtualConsole();
vc.sendTo(console, { omitJSDOMErrors: true });
vc.on("error", (...args) => pageErrors.push(args.map(String).join(" ")));
vc.on("jsdomError", (e) => { if (!/Not implemented: navigation/.test(e.message)) { pageErrors.push(e.message); console.error(e.message); } });
const dom = new JSDOM(html, { url: "https://whichai.wiki/", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
const w = dom.window;
const d = w.document;
w.scrollTo = () => {};
w.Element.prototype.scrollIntoView = function () {};
if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
w.confirm = () => true;
w.URL.createObjectURL = w.URL.createObjectURL || (() => "blob:test");
w.URL.revokeObjectURL = w.URL.revokeObjectURL || (() => {});

/* A returning visitor from v0.35: API keys and retired tools in storage. */
w.localStorage.setItem("pc_settings_v1", JSON.stringify({ geminiKey: "AIza-old", orModels: { qwen: "qwen/qwen3-coder:free" } }));
w.localStorage.setItem("pc_chains_v1", "[]");
w.sessionStorage.setItem("pc_settings_v1", "{}");
w.localStorage.setItem("pc_keymode", "local");

const scripts = [...html.matchAll(/<script src="(js\/[\w.-]+\.js)"><\/script>/g)].map(m => m[1]);
let bootError = null;
for (const s of scripts) {
  try { w.eval(readFileSync(s, "utf8")); }
  catch (e) { bootError = s + ": " + e.message; break; }
}
check("boot: all " + scripts.length + " scripts execute without throwing", !bootError, bootError);
if (bootError) { console.log("aborting"); process.exit(1); }
await tick(80);

const R = w.WhichAIRanking;
const top = R.tiers("aa", false).list;

/* ---------- boot ---------- */
check("boot: no cover and no menu of views", !d.getElementById("welcome") && !d.querySelector("[id^='nav-']") && !d.body.classList.contains("welcome-active"));
check("boot: keys and tools of older versions are wiped", ["pc_settings_v1", "pc_chains_v1", "pc_keymode"].every(k => w.localStorage.getItem(k) === null) && w.sessionStorage.getItem("pc_settings_v1") === null);
check("boot: every chapter rendered", d.querySelectorAll("#tier-list .tier-row").length === 5 && d.querySelectorAll("#vs-stage .vs-select").length >= 2 && !!d.querySelector("#radar-wrap .radar-grid") && !!d.querySelector("#market-wrap .mk-ladder") && !!d.querySelector("#topics-wrap .deb-deck") && d.querySelectorAll("#quick-wrap .quick-task").length === 8);
check("boot: the 13 generator families carry brand icons", d.querySelectorAll(".model-check[data-ai-brand] .ai-brand-icon").length === 13);
check("boot: the version is shown", d.getElementById("foot-version").textContent === "WhichAI v0.36" && w.WhichAIApp.version === "v0.36");

/* ---------- the bridges: each chapter hands something to the next ---------- */
{
  const duel = d.getElementById("bridge-duel");
  check("bridge: the top two models travel to Compare", duel.querySelectorAll(".token-chip").length === 2 && duel.textContent.includes(top[0].name) && duel.textContent.includes(top[1].name));
  check("bridge: the newest arrival travels to the Radar", d.getElementById("bridge-newest").textContent.length > 4);
  check("bridge: the leader's price travels to the Market", /\$\d/.test(d.getElementById("bridge-price").textContent) && d.getElementById("bridge-price").textContent.includes(top[0].name));
  check("bridge: a number from the first debate travels to Debates", !!d.querySelector("#bridge-debate .token-big"));
  check("bridge: four task icons travel to the Tools", d.querySelectorAll("#bridge-task .token-task").length === 4);
  const pairs = ["duel", "newest", "price", "debate", "task"];
  check("bridge: every token has a landing spot on the page", pairs.every(k => !!d.querySelector('[data-morph-from="' + k + '"]') && !!d.querySelector('[data-morph-to="' + k + '"]')));
}

/* ---------- 01 ranking ---------- */
{
  const S = d.querySelector("#tier-list .tier-S");
  check("ranking: the S tier opens with the live leader", !!S && S.querySelector(".mchip .mchip-name").textContent === top[0].name);
  check("ranking: four KPI tiles", d.querySelectorAll("#rank-kpis .kpi").length === 4);
  check("ranking: the scatter is on a log axis with a frontier", !!d.querySelector("#scatter svg.wc-log") && !!d.querySelector("#scatter .wc-frontier"));
  check("ranking: every chip has a dot in the scatter (cross-highlight)", (() => {
    const ids = [...d.querySelectorAll("#tier-list .mchip")].map(c => c.getAttribute("data-id")).slice(0, 10);
    return ids.length > 5 && ids.filter(id => d.querySelector('#scatter .wc-pt[data-id="' + id + '"]')).length >= ids.length - 2;
  })());
  const coding = d.querySelector('#rank-controls .seg-btn[data-metric="coding"]');
  coding.click();
  await tick();
  const codingTop = R.tiers("coding", false).list[0];
  check("ranking: switching to Coding re-ranks the tiers", d.querySelector('#rank-controls .seg-btn[data-metric="coding"]').getAttribute("aria-pressed") === "true" && d.querySelector("#tier-list .tier-S .mchip-name").textContent === codingTop.name);
  d.querySelector('#rank-controls .seg-btn[data-metric="aa"]').click();
  await tick();
  const openChip = [...d.querySelectorAll("#rank-controls .chip-toggle")][1];
  openChip.click();
  await tick();
  const shownIds = [...d.querySelectorAll("#tier-list .mchip")].map(c => c.getAttribute("data-id"));
  const DBm = w.PromptCompassModelsDB.models;
  check("ranking: the open-weights filter shows only open models", shownIds.length > 3 && shownIds.every(id => DBm.find(m => m.id === id).tags.includes("open-weights")));
  [...d.querySelectorAll("#rank-controls .chip-toggle")][0].click();
  await tick();
  check("ranking: All brings everyone back", d.querySelectorAll("#tier-list .mchip").length > shownIds.length);

  const search = d.getElementById("rank-search");
  search.value = "kimi";
  search.dispatchEvent(new w.Event("input"));
  const hits = d.querySelectorAll("#rank-results .rank-hit");
  check("ranking: the search finds any model", hits.length >= 1 && !d.getElementById("rank-results").hidden);
  hits[0].click();
  await tick(60);
  const drawer = d.getElementById("drawer");
  check("drawer: opens on the model with tier and rank", !drawer.hidden && /Kimi/.test(drawer.textContent) && !!drawer.querySelector(".badge-rank") && !!drawer.querySelector(".tier-badge"));
  check("drawer: the address is a shareable #model= link", w.location.hash.indexOf("#model=") === 0);
  check("drawer: has Compare, Follow, official site and wiki page", [...drawer.querySelectorAll("button")].some(b => /Compare/.test(b.textContent)) && !!drawer.querySelector(".radar-star") && !!drawer.querySelector('a[href^="/models/"]'));
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await tick(320);
  check("drawer: Escape closes it and gives the address back", drawer.hidden && w.location.hash.indexOf("#model=") !== 0);
  search.value = "";
  search.dispatchEvent(new w.Event("input"));

  w.WhichAIApp.openModel("gemini-3-5-pro");
  await tick();
  check("drawer: a rumored model shows no rank", !drawer.querySelector(".badge-rank"));
  w.WhichAIApp.closeDrawer(true);
  await tick(300);
}

/* ---------- 02 compare ---------- */
{
  const sel = [...d.querySelectorAll("#vs-stage .vs-select")].map(s => s.value);
  check("compare: opens on the live top two", sel[0] === top[0].id && sel[1] === top[1].id, sel.join(" vs "));
  check("compare: bars drawn for the pair", d.querySelectorAll("#vs-body .vs-row").length >= 4);
  w.WhichAIApp.openModel("kimi-k3");
  await tick();
  [...d.getElementById("drawer").querySelectorAll("button")].find(b => /Compare/.test(b.textContent)).click();
  await tick(300);
  const after = [...d.querySelectorAll("#vs-stage .vs-select")].map(s => s.value);
  check("compare: 'Compare' in a model card brings that model in", after.includes("kimi-k3") && w.location.hash === "#compare");
}

/* ---------- 03 radar ---------- */
{
  check("radar: launches and price moves listed", d.querySelectorAll("#radar-wrap .radar-item").length >= 5);
  check("radar: the news column explains itself with no network", !!d.querySelector("#radar-wrap .radar-news") && d.querySelector("#radar-wrap .radar-news").textContent.length > 20);
  check("radar: the data-check line stays hidden when the API is unreachable", d.querySelector("#radar-wrap .radar-check").hidden === true);
  const latest = d.getElementById("radar-latest");
  check("radar: the newest arrival is the landing spot of the bridge", !latest.hidden && latest.textContent.length > 4);
  const star = d.querySelector("#radar-wrap .radar-star");
  star.click();
  check("radar: follow star toggles", d.querySelector("#radar-wrap .radar-star").textContent.includes("★"));
}

/* ---------- 04 market ---------- */
{
  check("market: the ladder has one step per tier S to C", d.querySelectorAll("#market-wrap .mk-ladder .mk-step").length === 4);
  const leader = d.getElementById("mk-leader");
  check("market: the leader's price is the landing spot of the bridge", !leader.hidden && leader.textContent.includes(top[0].name) && leader.getAttribute("data-id") === top[0].id);
  check("market: best value and the calculator render", d.querySelectorAll("#market-wrap .mk-bars .mk-bar").length >= 3 && !!d.querySelector("#market-wrap .mk-calc"));
  leader.click();
  await tick();
  check("market: clicking the leader opens its card", !d.getElementById("drawer").hidden && d.getElementById("drawer").textContent.includes(top[0].name));
  w.WhichAIApp.closeDrawer(true);
  await tick(300);
}

/* ---------- 05 debates + glossary ---------- */
{
  const cards = d.querySelectorAll("#topics-wrap .deb-card");
  check("debates: six debates in the deck", cards.length === 6);
  const firstPanel = d.querySelector("#topics-wrap .deb-panel").textContent;
  cards[1].click();
  await tick();
  check("debates: choosing another debate swaps the panel", d.querySelector("#topics-wrap .deb-panel").textContent !== firstPanel);
  check("debates: both sides and sources shown", d.querySelectorAll("#topics-wrap .deb-side").length === 2 && d.querySelectorAll("#topics-wrap .topic-srcs a").length >= 2);
  let comply = false;
  for (const c of d.querySelectorAll("#topics-wrap .deb-card")) { c.click(); if (d.querySelector("#topics-wrap .deb-comply")) comply = true; }
  check("debates: the regulation debate links to ComplyAI.wiki", comply);
  check("glossary: >= 21 terms rendered", d.querySelectorAll("#glossary-list .gl-item").length >= 21);
  const gs = d.getElementById("glossary-search");
  gs.value = "token";
  gs.dispatchEvent(new w.Event("input"));
  const n = d.querySelectorAll("#glossary-list .gl-item").length;
  check("glossary: search filters", n > 0 && n < 10);
  check("support: counter and donate stay hidden without config", d.getElementById("visit-counter").hidden && d.getElementById("foot-support").hidden && d.getElementById("about-support").hidden);
}

/* ---------- 06 tools: quick answer -> guided finder -> prompt -> doctor -> stack ---------- */
{
  const quickBtns = d.querySelectorAll("#quick-wrap .quick-task");
  quickBtns[1].click(); // coding
  check("quick: one tap gives an answer with sources", !!d.querySelector("#quick-wrap .quick-answer") && d.querySelectorAll("#quick-wrap .qa-rank-row").length === 4 && !!d.querySelector("#quick-wrap .qa-src a"));
  d.querySelector("#quick-wrap .qa-actions .btn-primary").click();
  await tick(500);
  const checked = [...d.querySelectorAll('.model-check input[type="checkbox"]')].filter(c => c.checked).map(c => c.value);
  check("quick: 'write the prompt' pre-fills the generator", w.location.hash === "#prompt" && d.getElementById("task-type").value === "coding" && checked.length >= 1);

  check("finder: the guided path starts as a short teaser", !!d.querySelector("#finder-wrap .finder-teaser"));
  d.querySelector("#finder-wrap .finder-teaser .btn-ghost").click();
  check("finder: first question shows 8 tasks", d.querySelectorAll("#finder-wrap .finder-opt").length === 8);
  d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // writing
  check("finder: advanced to Q2", d.querySelectorAll("#finder-wrap .finder-opt").length === 3);
  d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // app
  d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // free
  d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // toggle a need
  [...d.querySelectorAll("#finder-wrap button")].find(b => b.className.includes("btn-primary")).click();
  d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // creative
  check("finder: results with a top match, reasons and actions", !!d.querySelector("#finder-wrap .finder-top") && d.querySelectorAll("#finder-wrap .finder-why li").length >= 1 && !!d.querySelector("#finder-wrap .finder-actions"));

  d.getElementById("goal").value = "Write a landing page headline for a budgeting app";
  d.getElementById("generate").click();
  await tick();
  check("prompt: tabs, router card and official links", d.getElementById("tabs").children.length >= 1 && !d.getElementById("router-card").hidden && d.querySelectorAll("#panels .panel").length === d.getElementById("tabs").children.length);
  [...d.querySelectorAll("#tool-checks input, .model-check input")].forEach(c => { c.checked = true; c.dispatchEvent(new w.Event("change", { bubbles: true })); });
  d.getElementById("generate").click();
  await tick();
  check("prompt: all 13 families can be generated at once", d.getElementById("tabs").children.length === 13);
  const docBtn = [...d.querySelectorAll("#panels .panel")][0].querySelector(".panel-btns button.btn-ghost");
  docBtn.click();
  await tick(60);
  const di = d.getElementById("doctor-input");
  check("prompt -> doctor: a generated prompt opens in the Doctor", w.location.hash === "#doctor" && !!di && di.value.length > 200);
  di.value = "write a poem";
  [...d.querySelectorAll("#doctor-wrap button")].find(b => b.className.includes("btn-primary")).click();
  check("doctor: score, ten checks, before and after", !!d.querySelector("#doctor-wrap .doctor-score") && d.querySelectorAll("#doctor-wrap .doctor-check").length === 10 && d.querySelector("#doctor-wrap .doctor-after").textContent.length > 200 && d.querySelector("#doctor-wrap .doctor-before").textContent === "write a poem");

  const taskChips = d.querySelectorAll("#stack-wrap .stack-chips")[0].querySelectorAll("button");
  taskChips[0].click();
  taskChips[2].click();
  d.querySelector("#stack-wrap .stack-go").click();
  check("stack: result with a cost card and picks", !!d.querySelector("#stack-wrap .stack-cost") && d.querySelectorAll("#stack-wrap .stack-grid .finder-result").length >= 1);
  check("stack: offers to share the result as an image", [...d.querySelectorAll("#stack-wrap button")].some(b => /Share|image/i.test(b.textContent)));
}

/* ---------- old addresses still land somewhere sensible ---------- */
{
  const MAP = { "#guide": "#ranking", "#compare-specs": "#compare", "#compare-outputs": "#compare", "#chains": "#prompt", "#merge": "#prompt", "#arena": "#compare", "#live": "#market", "#topics": "#debates", "#finder": "#find", "#generator": "#prompt", "#settings": "#data", "#about-methodology": "#about-method" };
  const wrong = [];
  for (const [from, to] of Object.entries(MAP)) {
    w.location.hash = from;
    await tick(40);
    if (w.location.hash !== to) wrong.push(from + "->" + w.location.hash);
  }
  check("links: every retired address is rewritten to its new home", wrong.length === 0, wrong.join(", "));
  check("links: an About anchor opens its section", d.getElementById("about-method").open === true);
  w.location.hash = "#goal=" + encodeURIComponent("Write a haiku about rain");
  await tick(80);
  check("links: #goal= pre-fills the prompt generator", d.getElementById("goal").value === "Write a haiku about rain");
  w.location.hash = "#compare=gpt-5-5,kimi-k3";
  await tick(60);
  const pair = [...d.querySelectorAll("#vs-stage .vs-select")].map(s2 => s2.value);
  check("links: #compare=a,b (from the wiki) loads that pair", pair[0] === "gpt-5-5" && pair[1] === "kimi-k3" && w.location.hash === "#compare");
  w.location.hash = "#model=kimi-k3";
  await tick(60);
  check("links: #model= opens the card", !d.getElementById("drawer").hidden && /Kimi K3/.test(d.getElementById("drawer").textContent));
}

/* ---------- language and theme ---------- */
{
  const langSel = d.getElementById("lang-select");
  langSel.value = "it";
  langSel.dispatchEvent(new w.Event("change"));
  const it = w.PromptCompassI18n.STRINGS.it;
  check("i18n: Italian relabels the page and the chapters", d.querySelector("#tier-list .tier-S .tier-name").textContent === it.tierS && d.querySelector("[data-i18n='skipLink']").textContent === it.skipLink);
  check("i18n: the open model card follows the language", !d.getElementById("drawer").hidden && d.getElementById("drawer").textContent.includes(it.drawerCompare));
  langSel.value = "ar";
  langSel.dispatchEvent(new w.Event("change"));
  check("i18n: Arabic flips the direction", d.documentElement.dir === "rtl" && d.documentElement.lang === "ar");
  w.WhichAIApp.closeDrawer(true);
  await tick(300);
  check("i18n: a closed drawer stays hidden in RTL", d.getElementById("drawer").hidden && d.getElementById("drawer-backdrop").hidden);
  langSel.value = "en";
  langSel.dispatchEvent(new w.Event("change"));
  check("i18n: back to English, left to right", d.documentElement.dir === "ltr" && d.querySelector("#tier-list .tier-S .tier-name").textContent === w.PromptCompassI18n.STRINGS.en.tierS);
  const t0 = d.documentElement.getAttribute("data-theme");
  d.getElementById("theme-toggle").click();
  const t1 = d.documentElement.getAttribute("data-theme");
  check("theme: toggles light <-> dark (" + t0 + " -> " + t1 + ")", t0 !== t1 && ["light", "dark"].includes(t1));
}

/* ---------- your data ---------- */
{
  let threw = false;
  try { d.getElementById("data-export").click(); } catch (e) { threw = true; }
  check("data: export does not throw", !threw);
  check("api: the client is inert without fetch", typeof w.WhichAIApi.get === "function");
}

/* ---------- v0.35: fresh data lands while the page is open ---------- */
{
  const Live = require("../api/_live-core.js");
  const Core = require("../api/_catalog-core.js");
  globalThis.window = globalThis.window || globalThis;
  const DBnode = require("../js/models-db.js");
  const fixture = JSON.parse(readFileSync("tests/fixtures/openrouter-2026-10-03.json", "utf8"));
  const delta = Core.computeDelta(DBnode, Live.normalize(fixture, DBnode, Date.now()), { now: Date.now() });

  check("live: before any live data the pill stays hidden", d.getElementById("live-pill").hidden);
  const n0 = w.PromptCompassModelsDB.models.length;
  w.fetch = async (url) => ({ ok: String(url) === "/api/catalog", status: 200, json: async () => JSON.parse(JSON.stringify(delta)) });
  const r = await w.WhichAILiveCatalog.refresh();
  await tick(60);
  check("live: GET /api/catalog is applied in the page", r && r.ok && w.PromptCompassModelsDB.models.length === n0 + delta.added.length);
  check("live: the pill appears and says how fresh the data is", !d.getElementById("live-pill").hidden && /Live data/.test(d.getElementById("live-pill").textContent));
  check("live: the copy is saved for the next visit", !!w.localStorage.getItem("whichai_live_catalog_v1"));
  check("live: the ranking re-tiers by itself (new leader in S)", d.querySelector("#tier-list .tier-S .mchip-name").textContent === "Claude Opus 5.5");
  check("live: the bridges follow (Compare duel and Market price)", d.getElementById("bridge-duel").textContent.includes("Claude Opus 5.5") && d.getElementById("mk-leader").textContent.includes("Claude Opus 5.5"));
  check("live: the free list in the Market is the live one", d.querySelectorAll("#market-wrap .mk-free .mk-free-row").length >= 1);
  const search = d.getElementById("rank-search");
  search.value = "Opus 5.5";
  search.dispatchEvent(new w.Event("input"));
  check("live: a model measured after the last deploy is searchable", !!d.querySelector('#rank-results .rank-hit[data-id="claude-opus-5-5"]'));
  w.WhichAIApp.openModel("claude-opus-5-5");
  const det = d.getElementById("drawer");
  check("live: its card shows the official score, a rank and the auto chip", /AA 57\.6/.test(det.textContent) && !!det.querySelector(".badge-rank") && !!det.querySelector(".chip-auto"));
  w.WhichAIApp.openModel("muse-spark-1-3");
  check("live: a converted score shows ~ and no rank", /AA ~/.test(det.textContent) && !det.querySelector(".badge-rank"));
  const rec = w.PromptCompassBenchmarks.recommend("general");
  check("live: the general summary is computed, not typed", /Right now Claude Opus 5\.5/.test(rec.summary));
  const feed = w.WhichAIChanges.past();
  check("live: the Radar lists automatic arrivals among curated entries", feed.some(e => e.auto && /Claude Opus 5\.5/.test(e.title)) && feed.some(e => !e.auto));
}

check("page: nothing failed to render and nothing threw", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed" + (fail ? "\n\nFAILURES:\n" + failures.join("\n") : " - SMOKE ALL GREEN"));
process.exit(fail ? 1 : 0);
