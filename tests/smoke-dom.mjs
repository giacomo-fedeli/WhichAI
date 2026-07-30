/* WhichAI — DOM smoke test (v0.22): boots the real app inside jsdom and walks
   every view, the finder, the glossary, model compare and the chain roadmap.
   Run: node tests/smoke-dom.mjs  (needs `npm i jsdom` reachable via NODE_PATH) */
import { readFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " — " + detail : "")); console.log("FAIL  " + name + (detail ? " — " + detail : "")); }
}

const html = readFileSync("index.html", "utf8");
const dom = new JSDOM(html, { url: "https://whichai.wiki/", runScripts: "outside-only", pretendToBeVisual: true });
const w = dom.window;
const d = w.document;
w.scrollTo = () => {};
w.Element.prototype.scrollIntoView = function () {};
if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
w.confirm = () => true;
w.URL.createObjectURL = w.URL.createObjectURL || (() => "blob:test");
w.URL.revokeObjectURL = w.URL.revokeObjectURL || (() => {});

const scripts = ["js/engine.js", "js/benchmarks.js", "js/chains.js", "js/i18n.js", "js/models-db.js", "js/merge.js", "js/charts.js", "js/glossary.js", "js/finder.js", "js/modelcompare.js", "js/stack.js", "js/doctor.js", "js/changes.js", "js/radar.js", "js/sharecard.js", "js/brands.js", "js/welcome.js", "js/config.js", "js/support.js", "js/topics.js", "js/arena.js", "js/app.js"];
let bootError = null;
for (const s of scripts) {
  try { w.eval(readFileSync(s, "utf8")); }
  catch (e) { bootError = s + ": " + e.message; break; }
}
check("boot: all scripts execute without throwing", !bootError, bootError);
if (bootError) { console.log("aborting"); process.exit(1); }

check("boot: generator visible, nav active", !d.getElementById("generator-view").hidden && d.getElementById("nav-generator").classList.contains("active"));
check("boot: footer links present (4 + hidden support)", d.querySelectorAll(".footer-links a").length === 5);
check("v0.26: welcome is minimal and has four staged actions", !!d.getElementById("welcome-brand") && d.querySelectorAll(".welcome-action").length === 4);
check("v0.26: all 13 generator families have local brand icons", d.querySelectorAll(".model-check[data-ai-brand] .ai-brand-icon").length === 13);
check("v0.26: native welcome controller initialized", !!w.WhichAIWelcome && typeof w.WhichAIWelcome.leave === "function");

/* --- Guided finder --- */
d.getElementById("mode-finder").click();
check("finder: mode switch shows finder", !d.getElementById("finder-wrap").hidden && d.getElementById("generator-view").classList.contains("finder-on"));
check("finder: first question rendered (8 task options)", d.querySelectorAll("#finder-wrap .finder-opt").length === 8);
d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // writing
check("finder: advanced to Q2", d.querySelectorAll("#finder-wrap .finder-opt").length === 3);
d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // app
d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // free
// multi-select question: toggle one need then Next
d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // toggle "web"
const nextBtn = [...d.querySelectorAll("#finder-wrap button")].find(b => b.className.includes("btn-primary"));
nextBtn.click();
d.querySelectorAll("#finder-wrap .finder-opt")[0].click(); // writing kind: creative
check("finder: results rendered with top match", !!d.querySelector("#finder-wrap .finder-top"));
check("finder: result has why-list and actions", d.querySelectorAll("#finder-wrap .finder-why li").length >= 1 && !!d.querySelector("#finder-wrap .finder-actions"));
d.getElementById("mode-goal").click();
check("finder: switch back to goal mode", d.getElementById("finder-wrap").hidden);

/* --- Generator flow --- */
d.getElementById("goal").value = "Write a landing page headline for a budgeting app";
d.getElementById("generate").click();
check("generate: tabs + router card", d.getElementById("tabs").children.length >= 3 && !d.getElementById("router-card").hidden);

/* --- Glossary via hash --- */
w.location.hash = "#glossary";
await new Promise(r => setTimeout(r, 30));
check("glossary: view shown via footer hash", !d.getElementById("glossary-view").hidden);
check("glossary: >= 21 terms rendered", d.querySelectorAll("#glossary-list .gl-item").length >= 21);
d.getElementById("glossary-search").value = "token";
d.getElementById("glossary-search").dispatchEvent(new w.Event("input"));
check("glossary: search filters", d.querySelectorAll("#glossary-list .gl-item").length < 10 && d.querySelectorAll("#glossary-list .gl-item").length > 0);

/* --- Model guide + insights + detail specs --- */
w.location.hash = "#guide";
await new Promise(r => setTimeout(r, 30));
check("guide: task cards built", d.getElementById("guide-grid").children.length === 8);
check("guide: insights charts rendered", !d.getElementById("insights-wrap").hidden && d.querySelectorAll("#chart-top svg, #chart-pp svg").length === 2);
w.WhichAIApp.openModel("kimi-k3");
await new Promise(r => setTimeout(r, 30));
const detail = d.getElementById("db-detail");
check("guide: openModel shows Kimi K3 detail with specs", !detail.hidden && detail.textContent.includes("Kimi K3") && detail.querySelectorAll(".db-spec").length >= 3);
check("guide: detail has Compare button", [...detail.querySelectorAll("button")].some(b => b.textContent.includes("Compare")));

/* --- Compare specs tab --- */
w.location.hash = "#compare-specs";
await new Promise(r => setTimeout(r, 30));
check("compare: specs tab active, outputs hidden", !d.getElementById("cmp-specs-wrap").hidden && d.getElementById("cmp-outputs-wrap").hidden);
check("compare: mc grid rendered with 2 selects", d.querySelectorAll("#cmp-specs-wrap .mc-select").length >= 2 && !!d.querySelector("#cmp-specs-wrap .mc-grid"));
check("compare: mc charts rendered", d.querySelectorAll("#cmp-specs-wrap svg").length >= 2);
const addBtn = d.querySelector("#cmp-specs-wrap .mc-add");
addBtn.click();
check("compare: third model added", d.querySelectorAll("#cmp-specs-wrap .mc-select").length === 3);
w.location.hash = "#compare-outputs";
await new Promise(r => setTimeout(r, 30));
check("compare: outputs tab restores via explicit hash", !d.getElementById("cmp-outputs-wrap").hidden && d.getElementById("cmp-specs-wrap").hidden);

/* --- Chains: build, roadmap, reorder, add, remove --- */
w.location.hash = "#chains";
await new Promise(r => setTimeout(r, 30));
d.getElementById("chain-goal").value = "Launch a newsletter about local food";
d.getElementById("chain-build").click();
check("chains: 3 steps + 3 roadmap nodes", d.getElementById("chain-steps").children.length === 3 && d.querySelectorAll("#chain-map .chain-node").length === 3);
check("chains: roadmap shows model + io", d.querySelector("#chain-map .chain-node-model").textContent.length > 2 && d.querySelector("#chain-map .chain-io").textContent.includes("your goal"));
d.getElementById("chain-addstep").click();
check("chains: add step → 4 nodes", d.querySelectorAll("#chain-map .chain-node").length === 4 && d.getElementById("chain-steps").children.length === 4);
check("chains: custom step editable", !!d.querySelector("#chain-steps .chain-custom-instr"));
const firstName = d.querySelector("#chain-map .chain-node-name").textContent;
const downBtns = [...d.querySelectorAll("#chain-steps .chain-step-tools button")].filter(b => b.textContent === "↓");
downBtns[0].click();
check("chains: move down reorders roadmap", d.querySelector("#chain-map .chain-node-name").textContent !== firstName);
const removeBtns = [...d.querySelectorAll("#chain-steps .chain-step-tools button")].filter(b => b.textContent === "✕");
removeBtns[3].click();
check("chains: remove step → 3 nodes", d.querySelectorAll("#chain-map .chain-node").length === 3);

/* --- v0.23: key storage, data tools, model deep link --- */
w.location.hash = "#settings";
await new Promise(r => setTimeout(r, 30));
check("v23: key mode radios present, session default", d.getElementById("keymode-session").checked === true && d.getElementById("keymode-local").checked === false);
d.getElementById("gemini-key").value = "AIza-test";
d.getElementById("settings-save").click();
check("v23: keys saved to sessionStorage by default", !!w.sessionStorage.getItem("pc_settings_v1") && !w.localStorage.getItem("pc_settings_v1"));
d.getElementById("keymode-local").click();
d.getElementById("keymode-local").dispatchEvent(new w.Event("change"));
check("v23: switching mode moves keys to localStorage", !!w.localStorage.getItem("pc_settings_v1") && !w.sessionStorage.getItem("pc_settings_v1"));
d.getElementById("keys-clear").click();
check("v23: clear keys empties fields", d.getElementById("gemini-key").value === "" && JSON.parse(w.localStorage.getItem("pc_settings_v1")).geminiKey === "");
check("v23: data tools present", !!d.getElementById("data-export") && !!d.getElementById("data-import") && !!d.getElementById("data-wipe"));
d.getElementById("data-export").click();
check("v23: export does not throw", true);
w.location.hash = "#model=kimi-k3";
await new Promise(r => setTimeout(r, 260));
check("v23: #model= deep link opens detail", !d.getElementById("guide-view").hidden && d.getElementById("db-detail").textContent.includes("Kimi K3"));

/* --- v0.25: inline detail, official links, compare default, radar --- */
check("v25: radar dot on More button at boot", d.getElementById("nav-more").classList.contains("has-dot"));
w.location.hash = "#guide";
await new Promise(r => setTimeout(r, 30));
d.getElementById("db-search").value = "gpt";
d.getElementById("db-search").dispatchEvent(new w.Event("input"));
const hits = d.querySelectorAll("#db-results .db-hit");
check("v25: search lists several hits", hits.length >= 5);
hits[2].click();
const det = d.getElementById("db-detail");
check("v25: detail opens inline right under the clicked row", det.parentNode === d.getElementById("db-results") && hits[2].nextElementSibling === det && !det.hidden && hits[2].classList.contains("open"));
check("v25: detail has official link + follow", [...det.querySelectorAll("a.btn-official")].length >= 1 && [...det.querySelectorAll("button")].some(b => b.className.includes("radar-star")));
hits[2].click();
check("v25: clicking again closes the detail", det.hidden && !hits[2].classList.contains("open"));
// compare default: no active output comparison in a fresh view -> specs
w.eval('window.__wa_cmp_probe = 1');
w.location.hash = "#compare";
await new Promise(r => setTimeout(r, 30));
check("v25: plain #compare defaults to Model comparison", !d.getElementById("cmp-specs-wrap").hidden && d.getElementById("cmp-outputs-wrap").hidden);
// official link on generated prompt panels
w.location.hash = "";
await new Promise(r => setTimeout(r, 30));
d.getElementById("mode-goal").click();
d.getElementById("goal").value = "Plan a launch email";
d.getElementById("generate").click();
check("v25: prompt panels carry official app links", d.querySelectorAll("#panels .btn-official").length >= 3);
// radar view
w.location.hash = "#radar";
await new Promise(r => setTimeout(r, 30));
check("v25: radar renders items + filters + upcoming", d.querySelectorAll("#radar-wrap .radar-item").length >= 8 && d.querySelectorAll("#radar-wrap .radar-filters .chip").length === 6);
const star = d.querySelector("#radar-wrap .radar-star");
star.click();
check("v25: follow star toggles", d.querySelector("#radar-wrap .radar-star").textContent.includes("★"));
check("v25: radar visit clears the dot", !d.getElementById("nav-more").classList.contains("has-dot"));
// share buttons exist (canvas is not clickable in jsdom)
w.location.hash = "#stack";
await new Promise(r => setTimeout(r, 30));
const goBtn2 = d.querySelector("#stack-wrap .stack-go");
if (goBtn2 && !goBtn2.disabled) { goBtn2.click(); }
check("v25: stack result offers share as image", [...d.querySelectorAll("#stack-wrap button")].some(b => b.textContent.includes("Share") || b.textContent.includes("image")));

/* --- v0.29: AI debates, support defaults, brand -> welcome --- */
w.location.hash = "#topics";
await new Promise(r => setTimeout(r, 30));
check("v29: debates view renders 6 items", !d.getElementById("topics-view").hidden && d.querySelectorAll("#topics-wrap .topic-item").length === 6);
check("v29: each debate has sides + sources", d.querySelectorAll("#topics-wrap .topic-side").length === 12 && d.querySelectorAll("#topics-wrap .topic-srcs a").length >= 12);
check("v29: counter + donate stay hidden without config", d.getElementById("visit-counter").hidden && d.getElementById("foot-support").hidden && d.getElementById("about-support").hidden);
d.querySelector(".brand").click();
await new Promise(r => setTimeout(r, 30));
check("v29: brand click returns to the minimal welcome", d.body.classList.contains("welcome-active") && !d.body.classList.contains("app-entered"));
d.querySelectorAll(".welcome-action")[0].click();
await new Promise(r => setTimeout(r, 1200));
check("v29: welcome can be left again after returning", d.body.classList.contains("app-entered"));

/* --- v0.28: blind arena (no keys in jsdom -> need-keys path) --- */
w.location.hash = "#arena";
await new Promise(r => setTimeout(r, 30));
check("v28: arena view opens", !d.getElementById("arena-view").hidden);
check("v28: arena explains missing keys + links Settings", !!d.querySelector("#arena-wrap .arena-warn") && [...d.querySelectorAll("#arena-wrap button")].length >= 1);

/* --- v0.24: demo card, More menu, stack, doctor --- */
w.location.hash = "";
await new Promise(r => setTimeout(r, 30));
check("v24: demo card rendered with actions", !d.getElementById("demo-card").hidden && d.querySelectorAll("#demo-card button").length === 2);
const moreBtn = d.getElementById("nav-more");
moreBtn.click();
check("v24: More panel opens with 9 items", !d.getElementById("nav-more-panel").hidden && d.querySelectorAll("#nav-more-panel .more-item").length === 9);
w.location.hash = "#stack";
await new Promise(r => setTimeout(r, 30));
check("v24: stack view opens, panel closed", !d.getElementById("stack-view").hidden && d.getElementById("nav-more-panel").hidden);
const taskChips = d.querySelectorAll("#stack-wrap .stack-chips")[0].querySelectorAll("button");
taskChips[0].click(); // writing
taskChips[2].click(); // research
const goBtn = d.querySelector("#stack-wrap .stack-go");
goBtn.click();
check("v24: stack result rendered with cost card", !!d.querySelector("#stack-wrap .stack-cost") && d.querySelectorAll("#stack-wrap .stack-grid .finder-result").length >= 1);
w.location.hash = "#doctor";
await new Promise(r => setTimeout(r, 30));
check("v24: doctor view opens", !d.getElementById("doctor-view").hidden && !!d.getElementById("doctor-input"));
d.getElementById("doctor-input").value = "write a poem";
[...d.querySelectorAll("#doctor-wrap button")].find(b => b.className.includes("btn-primary")).click();
check("v24: doctor score + checklist + optimized panes", !!d.querySelector("#doctor-wrap .doctor-score") && d.querySelectorAll("#doctor-wrap .doctor-check").length === 10 && d.querySelector("#doctor-wrap .doctor-after").textContent.length > 200);
check("v24: doctor before pane shows original", d.querySelector("#doctor-wrap .doctor-before").textContent === "write a poem");

/* --- About anchors + language + theme --- */
w.location.hash = "#about-faq";
await new Promise(r => setTimeout(r, 220));
check("about: footer anchor opens About", !d.getElementById("about-view").hidden);
const langSel = d.getElementById("lang-select");
langSel.value = "it";
langSel.dispatchEvent(new w.Event("change"));
check("i18n live: nav + footer links in Italian", d.getElementById("foot-similar").textContent === "Strumenti simili" && d.getElementById("mode-finder").textContent === "Percorso guidato");
langSel.value = "ar";
langSel.dispatchEvent(new w.Event("change"));
check("i18n live: Arabic flips direction", d.documentElement.dir === "rtl");
langSel.value = "en";
langSel.dispatchEvent(new w.Event("change"));
const themeBtn = d.getElementById("theme-toggle");
const t0 = d.documentElement.getAttribute("data-theme");
themeBtn.click();
const t1 = d.documentElement.getAttribute("data-theme");
check("theme: toggle cycles (" + t0 + "→" + t1 + ")", t0 !== t1);

console.log("\n" + pass + " passed, " + fail + " failed" + (fail ? "\n\nFAILURES:\n" + failures.join("\n") : " — SMOKE ALL GREEN"));
process.exit(fail ? 1 : 0);
