/* WhichAI - static SEO site generator (v0.23)
   Regenerates /models, /best-ai-for, /glossary, /compare, /data/models.json and sitemap.xml
   from the live database. Run after every data refresh:
       node tools/build-seo.mjs
   Pure Node, no dependencies. Pages are plain HTML (no JS) styled by /styles.css. */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

globalThis.window = globalThis;
const DB = require("../js/models-db.js");
const Bench = require("../js/benchmarks.js");
const Glossary = require("../js/glossary.js");
const Engine = require("../js/engine.js");
const Brands = require("../js/brands.js");

const SITE = "https://whichai.wiki";
const TODAY = new Date().toISOString().slice(0, 10);

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const brand = (subject, label, options = {}) => Brands.markHTML(subject, label, { base: "/assets/brands/", ...options });

const COMPARE_PAIRS = [
  ["claude-opus-5", "fable-5"], ["claude-opus-5", "gpt-5-6-sol"], ["fable-5", "gpt-5-6-sol"], ["fable-5", "opus-4-8"], ["gpt-5-6-sol", "kimi-k3"],
  ["kimi-k3", "glm-5-2"], ["sonnet-5", "gpt-5-5"], ["gemini-3-1-pro", "gpt-5-6-terra"],
  ["gemini-3-5-flash", "gpt-5-6-luna"], ["opus-4-8", "gpt-5-5"], ["grok-4-5", "gpt-5-6-terra"],
  ["deepseek-v4-pro", "qwen-3-7-max"], ["inkling", "nemotron-3-ultra"], ["kimi-k3", "opus-4-8"]
];

const byId = id => DB.models.find(m => m.id === id);
const linkFor = m => m.url || (m.family && DB.links && DB.links[m.family]) || (DB.vendorLinks && DB.vendorLinks[m.vendor]) || null;
const pairsFor = id => COMPARE_PAIRS.filter(p => p.includes(id));
const pairPath = p => `/compare/${p[0]}-vs-${p[1]}.html`;

function shell({ path, title, desc, body, crumb }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${SITE}${path}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${SITE}${path}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%2317181c'/%3E%3Cpath d='M15.8 8.2l-2.4 5.2-5.2 2.4 2.4-5.2z' fill='white'/%3E%3C/svg%3E" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9.2"></circle><path d="M15.5 8.5l-2.2 5-5 2.2 2.2-5z" fill="currentColor" stroke="none"></path></svg>
        <a class="brand-name" href="/" style="text-decoration:none">WhichAI</a>
        <span class="badge">wiki</span>
      </div>
      <nav class="site-nav" aria-label="Site">
        <a href="/">Open the app</a>
        <a href="/#finder">AI Finder</a>
        <a href="/models/">All models</a>
        <a href="/best-ai-for/">Best AI for…</a>
        <a href="/glossary/">Glossary</a>
      </nav>
    </div>
  </header>
  <main class="layout-guide">
    <p class="router-meta">${crumb}</p>
${body}
  </main>
  <footer class="site-footer">
    <nav class="footer-links" aria-label="More">
      <a href="/#about-faq">FAQ</a>
      <a href="/#about-methodology">Methodology</a>
      <a href="/#about-contribute">Contribute</a>
      <a href="/data/models.json">Open dataset</a>
    </nav>
    <p>Generated from the WhichAI model database · Data snapshot: ${esc(DB.updated)} · Free, no account, no tracking.</p>
  </footer>
</body>
</html>
`;
}

function chip(text, cls) { return `<span class="chip ${cls}">${esc(text)}</span>`; }

function specRows(m) {
  const s = m.spec || {};
  const rows = [
    ["Provider", m.vendor],
    ["Status", m.status],
    ["AA Intelligence Index", m.score && m.score.aa ? (m.score.est ? "~" + m.score.aa + " (WhichAI estimate)" : m.score.aa + " (July 16, 2026 snapshot)") : "n/a"],
    ["Released", s.released || "n/a"],
    ["Context window", s.ctx || "n/a"],
    ["Modalities", s.modal || "n/a"],
    ["API price $/1M (in / out)", s.priceIn != null ? "$" + s.priceIn + " / $" + s.priceOut + (s.note ? " · " + s.note : "") : "n/a"],
    ["Speed", s.speed || "n/a"],
    ["Access", m.access]
  ];
  return rows.map(r => `<div class="db-spec"><b>${esc(r[0])}</b>${r[0] === "Provider" ? brand(m.vendor, m.vendor, { wordmark: true }) : esc(r[1])}</div>`).join("\n        ");
}

function catBars(m) {
  if (!m.score || !m.score.cat) return "";
  const cats = [["coding", "Coding"], ["reasoning", "Reasoning"], ["writing", "Writing"], ["agents", "Agents & tools"]];
  const rows = cats.map(c => {
    const v = m.score.cat[c[0]];
    if (v == null) return "";
    return `<div class="cat-row"><span class="cat-label">${c[1]}</span><span class="cat-track"><span class="cat-fill" style="width:${Math.max(2, Math.min(100, v))}%"></span></span><span class="cat-val">${v}</span></div>`;
  }).join("");
  return `<div class="cat-bars">${rows}</div>
      <p class="router-meta">Category scores (0-100) are WhichAI blended ratings: public category leaderboards plus editorial judgment. Guidance, not official measurements.</p>`;
}

function alternatives(m) {
  const pool = DB.models
    .filter(x => x.id !== m.id && x.status === "public" && x.score && x.score.aa && !x.score.est)
    .sort((a, b) => Math.abs((a.score.aa) - (m.score.aa || 0)) - Math.abs((b.score.aa) - (m.score.aa || 0)))
    .slice(0, 3);
  if (!pool.length) return "";
  return `<h2>Alternatives worth a look</h2>
      <ul class="catalog-list">
        ${pool.map(x => `<li><span class="router-app"><a href="/models/${x.id}.html">${brand(x, x.name, { providerWordmark: true })}</a></span> (${brand(x.vendor, x.vendor)}) · AA ${x.score.aa}<span class="router-free">${esc(x.access)}</span></li>`).join("\n        ")}
      </ul>`;
}

let pages = [];

/* ---------- model pages ---------- */
mkdirSync("models", { recursive: true });
for (const m of DB.models) {
  const p = `/models/${m.id}.html`;
  const scoreTxt = m.score && m.score.aa ? (m.score.est ? "estimated ~" + m.score.aa : "scores " + m.score.aa) : "has no published score";
  const desc = `${m.name} by ${m.vendor}: review, price, context window and benchmarks. ${m.name} ${scoreTxt} on the AA Intelligence Index. Verified ${DB.updated}.`;
  const chips = [chip(m.status, "chip-" + m.status)]
    .concat(m.tags.filter(t => t !== m.status).map(t => chip(t === "prompt-target" ? "in Generator" : t, "chip-" + t)))
    .concat((m.labels || []).map(l => chip(l, "chip-label"))).join(" ");
  const cmp = pairsFor(m.id).map(pr => {
    const other = byId(pr[0] === m.id ? pr[1] : pr[0]);
    return `<a href="${pairPath(pr)}">${esc(m.name)} vs ${esc(other.name)}</a>`;
  }).join(" · ");
  const body = `    <div class="guide-head">
      <h1>${brand(m, m.name, { providerWordmark: true })}</h1>
      <p>${brand(m.vendor, m.vendor, { wordmark: true })} · verified ${esc(DB.updated)}</p>
    </div>
    <div class="card about-card">
      <div class="db-chips">${chips}</div>
      <div class="db-specs" style="margin-top:14px">
        ${specRows(m)}
      </div>
      ${m.score && m.score.est ? '<p class="router-meta">The score shown is a WhichAI estimate from adjacent benchmarks, not an official measurement.</p>' : ""}
    </div>
    <div class="card about-card">
      <h2 class="card-title">In one line</h2>
      <p class="about-text">${esc(m.review)}</p>
      ${catBars(m)}
    </div>
    <div class="card about-card">
      ${alternatives(m)}
      ${cmp ? `<p class="router-meta">Head-to-head: ${cmp}</p>` : ""}
      <div class="compare-actions">
        ${linkFor(m) ? `<a class="btn-copy" href="${esc(linkFor(m))}" rel="noopener">Open ${esc(m.name.split(" ")[0])}'s official app ↗</a>` : ""}
        <a class="btn-copy" href="/#model=${m.id}">Open in the WhichAI app</a>
        <a class="btn-copy" href="/#finder">Not sure? Take the 30-second finder</a>
      </div>
      <p class="router-meta">${esc(DB.scaleNote)} ${esc(DB.specNote || "")} Sources are linked inside the app (Model guide and About > Methodology).</p>
    </div>`;
  writeFileSync("models/" + m.id + ".html", shell({ path: p, title: `${m.name} review, price and benchmarks (2026) | WhichAI`, desc, body, crumb: `<a href="/">WhichAI</a> / <a href="/models/">Models</a> / ${esc(m.name)}` }));
  pages.push(p);
}

/* models index */
{
  const groups = {};
  DB.models.forEach(m => { (groups[m.vendor] = groups[m.vendor] || []).push(m); });
  const body = `    <div class="guide-head">
      <h1>All ${DB.models.length} tracked AI models</h1>
      <p>Every model in the WhichAI database, with score, price and an honest one-line review. Snapshot: ${esc(DB.updated)}.</p>
    </div>
    ${Object.keys(groups).map(v => `<div class="card about-card"><h2 class="card-title">${brand(v, v, { wordmark: true })}</h2><ul class="catalog-list">${groups[v].map(m => `<li><span class="router-app"><a href="/models/${m.id}.html">${brand(m, m.name, { providerWordmark: true })}</a></span>${m.score && m.score.aa ? " · AA " + (m.score.est ? "~" : "") + m.score.aa : ""} · ${esc(m.status)}</li>`).join("")}</ul></div>`).join("\n    ")}`;
  writeFileSync("models/index.html", shell({ path: "/models/", title: `All ${DB.models.length} AI models compared (2026) | WhichAI`, desc: `Searchable list of ${DB.models.length} AI models from ${new Set(DB.models.map(m => m.vendor)).size} vendors with scores, prices and honest reviews. Updated ${DB.updated}.`, body, crumb: `<a href="/">WhichAI</a> / Models` }));
  pages.push("/models/");
}

/* ---------- best-ai-for pages ---------- */
mkdirSync("best-ai-for", { recursive: true });
const TASK_LABELS = { writing: "writing and content", coding: "coding and development", analysis: "data analysis", research: "research with sources", brainstorming: "brainstorming and ideas", education: "learning and explanations", business: "business and marketing", general: "everyday questions" };
for (const t of Engine.TASK_ORDER) {
  const rec = Bench.taskTypes[t];
  if (!rec) continue;
  const p = `/best-ai-for/${t}.html`;
  const top = Bench.apps[rec.ranking[0].app];
  const body = `    <div class="guide-head">
      <h1>Best AI for ${esc(TASK_LABELS[t] || t)} (${esc(Bench.updated)})</h1>
      <p>${esc(rec.summary)}</p>
    </div>
    <div class="card about-card">
      <h2 class="card-title">Ranking · ${esc(rec.confidence)} confidence</h2>
      <ol class="router-rank">
        ${rec.ranking.map(r => { const app = Bench.apps[r.app]; const u = DB.links && DB.links[r.app]; return `<li><span class="router-app">${brand(r.app, app.label, { wordmark: true, providerWordmark: true })}</span> (${brand(app.vendor, app.vendor)})${u ? ` · <a href="${esc(u)}" rel="noopener">open ↗</a>` : ""} · ${esc(r.note)}<span class="router-free">Free tier: ${esc(app.freeModel)}</span></li>`; }).join("\n        ")}
      </ol>
      <p class="router-meta">${esc(Bench.CONFIDENCE_NOTES[rec.confidence])} ${esc(Bench.disclaimer)}</p>
      <p class="router-meta">Sources: ${rec.sourceIds.map(sid => { const s = Bench.sources.find(x => x.id === sid); return s ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>` : ""; }).filter(Boolean).join(" · ")}</p>
      <div class="compare-actions">
        <a class="btn-copy" href="/#finder">Answer 4 questions for a personal pick</a>
        <a class="btn-copy" href="/">Generate an optimized prompt for ${esc(top.label)}</a>
      </div>
    </div>`;
  writeFileSync("best-ai-for/" + t + ".html", shell({ path: p, title: `Best AI for ${TASK_LABELS[t] || t} in 2026: ranked with sources | WhichAI`, desc: `Which AI is best for ${TASK_LABELS[t] || t}? ${top.label} leads our ${rec.confidence}-confidence ranking. Benchmarks in plain language, free tiers included. Updated ${Bench.updated}.`, body, crumb: `<a href="/">WhichAI</a> / <a href="/best-ai-for/">Best AI for…</a> / ${esc(t)}` }));
  pages.push(p);
}
{
  const body = `    <div class="guide-head">
      <h1>Best AI for every kind of task</h1>
      <p>Per-task rankings from public benchmarks, translated into plain language. Snapshot: ${esc(Bench.updated)}.</p>
    </div>
    <div class="card about-card"><ul class="catalog-list">
      ${Engine.TASK_ORDER.map(t => { const appId = Bench.taskTypes[t].ranking[0].app; const app = Bench.apps[appId]; return `<li><span class="router-app"><a href="/best-ai-for/${t}.html">Best AI for ${esc(TASK_LABELS[t] || t)}</a></span><span class="router-free">Top pick: ${brand(appId, app.label, { wordmark: true, providerWordmark: true })}</span></li>`; }).join("\n      ")}
    </ul></div>`;
  writeFileSync("best-ai-for/index.html", shell({ path: "/best-ai-for/", title: "Best AI for each task, ranked with sources (2026) | WhichAI", desc: "Writing, coding, research, analysis and more: which AI app wins each task, with confidence levels, free tiers and linked sources.", body, crumb: `<a href="/">WhichAI</a> / Best AI for…` }));
  pages.push("/best-ai-for/");
}

/* ---------- glossary pages ---------- */
mkdirSync("glossary", { recursive: true });
for (const t of Glossary.TERMS) {
  const p = `/glossary/${t.id}.html`;
  const body = `    <div class="guide-head">
      <h1>${esc(t.term)}</h1>
      <p>AI glossary · plain-language definition</p>
    </div>
    <div class="card about-card">
      <p class="about-text">${esc(t.def)}</p>
      ${t.ex ? `<p class="gl-ex">Example: ${esc(t.ex)}</p>` : ""}
      <div class="compare-actions">
        <a class="btn-copy" href="/#glossary">Browse the full glossary</a>
        ${t.link ? `<a class="btn-copy" href="/${t.link.hash}">${esc(t.link.label)}</a>` : ""}
      </div>
    </div>`;
  writeFileSync("glossary/" + t.id + ".html", shell({ path: p, title: `What is ${t.term.replace(/ \(.*\)/, "")}? Simple definition | WhichAI`, desc: t.def.slice(0, 150), body, crumb: `<a href="/">WhichAI</a> / <a href="/glossary/">Glossary</a> / ${esc(t.term)}` }));
  pages.push(p);
}
{
  const body = `    <div class="guide-head">
      <h1>AI glossary in plain words</h1>
      <p>${Glossary.TERMS.length} terms, one sentence each, with everyday examples.</p>
    </div>
    <div class="card about-card"><ul class="catalog-list">
      ${Glossary.TERMS.map(t => `<li><span class="router-app"><a href="/glossary/${t.id}.html">${esc(t.term)}</a></span><span class="router-free">${esc(t.def.slice(0, 110))}${t.def.length > 110 ? "…" : ""}</span></li>`).join("\n      ")}
    </ul></div>`;
  writeFileSync("glossary/index.html", shell({ path: "/glossary/", title: "AI glossary: every term in one plain sentence | WhichAI", desc: `${Glossary.TERMS.length} AI terms (token, context window, RAG, agent, hallucination…) explained simply, with examples.`, body, crumb: `<a href="/">WhichAI</a> / Glossary` }));
  pages.push("/glossary/");
}

/* ---------- compare pages ---------- */
mkdirSync("compare", { recursive: true });
for (const pr of COMPARE_PAIRS) {
  const a = byId(pr[0]), b = byId(pr[1]);
  if (!a || !b) continue;
  const p = pairPath(pr);
  const rows = [
    ["Provider", a.vendor, b.vendor],
    ["AA index", a.score && a.score.aa ? (a.score.est ? "~" : "") + a.score.aa : "n/a", b.score && b.score.aa ? (b.score.est ? "~" : "") + b.score.aa : "n/a"],
    ["Released", (a.spec && a.spec.released) || "n/a", (b.spec && b.spec.released) || "n/a"],
    ["Context", (a.spec && a.spec.ctx) || "n/a", (b.spec && b.spec.ctx) || "n/a"],
    ["Price $/1M", a.spec && a.spec.priceIn != null ? `$${a.spec.priceIn} / $${a.spec.priceOut}` : "n/a", b.spec && b.spec.priceIn != null ? `$${b.spec.priceIn} / $${b.spec.priceOut}` : "n/a"],
    ["Access", a.access, b.access]
  ];
  const winner = (a.score && b.score && a.score.aa && b.score.aa && !a.score.est && !b.score.est)
    ? (a.score.aa === b.score.aa ? "They tie on the index" : (a.score.aa > b.score.aa ? a.name : b.name) + " scores higher on the July 16 index")
    : "Scores are not directly comparable";
  const body = `    <div class="guide-head">
      <h1 class="brand-comparison">${brand(a, a.name, { providerWordmark: true })}<span>vs</span>${brand(b, b.name, { providerWordmark: true })}</h1>
      <p>${esc(winner)}. Full context below: price, context window, strengths and honest limits. Verified ${esc(DB.updated)}.</p>
    </div>
    <div class="card about-card">
      <div class="mc-grid mc-grid-2" style="grid-template-columns:130px 1fr 1fr">
        <div class="mc-rowlabel"></div><div class="mc-cell"><strong><a href="/models/${a.id}.html">${brand(a, a.name, { providerWordmark: true })}</a></strong></div><div class="mc-cell"><strong><a href="/models/${b.id}.html">${brand(b, b.name, { providerWordmark: true })}</a></strong></div>
        ${rows.map(r => `<div class="mc-rowlabel">${esc(r[0])}</div><div class="mc-cell">${r[0] === "Provider" ? brand(a.vendor, a.vendor, { wordmark: true }) : esc(r[1])}</div><div class="mc-cell">${r[0] === "Provider" ? brand(b.vendor, b.vendor, { wordmark: true }) : esc(r[2])}</div>`).join("\n        ")}
      </div>
      <p class="router-meta">n/a = not published or not yet verified. Scores marked ~ are WhichAI estimates and should not be compared 1:1 with measured scores.</p>
    </div>
    <div class="card about-card">
      <h2 class="card-title">In one line each</h2>
      <p class="about-text"><strong>${brand(a, a.name)}:</strong> ${esc(a.review)}</p>
      <p class="about-text"><strong>${brand(b, b.name)}:</strong> ${esc(b.review)}</p>
      <div class="compare-actions">
        <a class="btn-copy" href="/#compare-specs">Compare them live in the app</a>
        <a class="btn-copy" href="/#finder">Which one is right for you? 30-second finder</a>
      </div>
    </div>`;
  writeFileSync("compare/" + pr[0] + "-vs-" + pr[1] + ".html", shell({ path: p, title: `${a.name} vs ${b.name}: benchmarks, price, context (2026) | WhichAI`, desc: `${a.name} vs ${b.name} compared on the AA index, price, context window and real strengths. ${winner}. Updated ${DB.updated}.`, body, crumb: `<a href="/">WhichAI</a> / <a href="/compare/">Compare</a> / ${esc(a.name)} vs ${esc(b.name)}` }));
  pages.push(p);
}
{
  const body = `    <div class="guide-head">
      <h1>Model head-to-heads</h1>
      <p>Curated comparisons from the WhichAI database. Snapshot: ${esc(DB.updated)}.</p>
    </div>
    <div class="card about-card"><ul class="catalog-list">
      ${COMPARE_PAIRS.map(pr => { const a = byId(pr[0]), b = byId(pr[1]); return a && b ? `<li><span class="router-app"><a href="${pairPath(pr)}">${brand(a, a.name)} <span aria-hidden="true">vs</span> ${brand(b, b.name)}</a></span></li>` : ""; }).join("\n      ")}
    </ul></div>`;
  writeFileSync("compare/index.html", shell({ path: "/compare/", title: "AI model comparisons: head-to-head with real data (2026) | WhichAI", desc: "Claude vs GPT, Kimi vs GLM and more: honest head-to-head comparisons with benchmarks, prices and context windows.", body, crumb: `<a href="/">WhichAI</a> / Compare` }));
  pages.push("/compare/");
}

/* ---------- open dataset ---------- */
mkdirSync("data", { recursive: true });
writeFileSync("data/models.json", JSON.stringify({
  project: "WhichAI", site: SITE, license: "CC BY 4.0 (attribution: WhichAI, whichai.wiki)",
  generated: TODAY, snapshot: DB.updated, scaleNote: DB.scaleNote, specNote: DB.specNote || "",
  count: DB.models.length, models: DB.models
}, null, 1));
pages.push("/data/models.json");

/* ---------- sitemap ---------- */
const urls = ["/"].concat(pages);
writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`);

console.log("SEO build done:", pages.length, "pages + sitemap (" + urls.length + " urls)");
