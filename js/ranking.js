/*
 * WhichAI - the ranking chapter (v0.36.0)
 *
 * The first thing on the page is the data: every current model with an
 * official Artificial Analysis score, sorted into tiers, next to a price vs
 * intelligence map and a finder for any model in the catalog.
 *
 * Tiers are computed, never chosen. On the selected index (Intelligence,
 * Coding or Agentic) models are ranked; S is the top 5%, A the next 15%,
 * B the next 20%, C the next 25%, D the rest, and ties share a tier. Converted
 * (~), guessed and rumoured scores are never ranked. When new data lands the
 * whole chapter is recomputed; nothing here has to be edited by hand.
 *
 * The scatter used to plot price on a linear axis, so one legacy model at
 * $262 per million tokens squeezed ninety others into a corner. Price is on a
 * log axis now, legacy models are out unless asked for, a price of zero sits
 * in its own "free" lane, and the best-value frontier is drawn.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var deps = null; // { T, openModel(id), onTiers(result) }
  var els = null;
  var LS_KEY = "pc_rank_v1";
  var state = { metric: "aa", filter: "all", legacy: false, query: "", open: {} };

  var TIERS = ["S", "A", "B", "C", "D"];
  var CUTS = [0.05, 0.20, 0.40, 0.65];
  var ROW_LIMIT = 14;
  var NEW_DAYS = 21;
  var METRICS = [["aa", "metricAA"], ["coding", "metricCoding"], ["agentic", "metricAgentic"]];
  var FILTERS = [["all", "fAll"], ["open", "fOpen"], ["free", "fFree"], ["cheap", "fCheap"]];

  function DB() { return root.PromptCompassModelsDB || null; }
  function T(k) { return deps && deps.T ? deps.T(k) : k; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- the numbers ---------- */

  function official(m) {
    return !!m && !!m.score && typeof m.score.aa === "number" && !m.score.est && m.status !== "rumored" && m.status !== "private";
  }
  function metricValue(m, metric) {
    if (!official(m)) return null;
    var v = metric === "aa" ? m.score.aa : m.score[metric];
    return typeof v === "number" && isFinite(v) ? v : null;
  }
  function blended(m) {
    var s = (m && m.spec) || {};
    return typeof s.priceIn === "number" && typeof s.priceOut === "number" ? (3 * s.priceIn + s.priceOut) / 4 : null;
  }
  function releasedAt(m) {
    var r = m && m.spec && m.spec.released;
    if (!r) return null;
    var t = Date.parse(/^\d{4}-\d{2}$/.test(r) ? r + "-15" : r);
    return isFinite(t) ? t : null;
  }
  function isNew(m, now) {
    var t = releasedAt(m);
    return t != null && (now || Date.now()) - t < NEW_DAYS * 86400000 && t <= (now || Date.now()) + 86400000;
  }
  function hasFreeRoute(m) {
    return (m.tags || []).indexOf("free") !== -1 || !!(m.live && m.live.free);
  }

  function pool(metric, legacy) {
    var db = DB();
    if (!db) return [];
    return db.models.filter(function (m) {
      return metricValue(m, metric) != null && (legacy || m.status !== "legacy");
    });
  }

  /** tiers(metric, legacy) -> { tiers: {S:[..]..}, ranks: {id:{rank,tier,total,value}}, total, list } */
  function tiers(metric, legacy) {
    metric = metric || "aa";
    var list = pool(metric, legacy).slice().sort(function (a, b) {
      return metricValue(b, metric) - metricValue(a, metric) || a.name.localeCompare(b.name);
    });
    var n = list.length;
    var out = { S: [], A: [], B: [], C: [], D: [] };
    var ranks = {};
    var prevV = null, prevRank = 0;
    list.forEach(function (m, i) {
      var v = metricValue(m, metric);
      var r = prevV !== null && v === prevV ? prevRank : i;
      prevV = v;
      prevRank = r;
      var q = n ? r / n : 0;
      var t = q < CUTS[0] ? "S" : q < CUTS[1] ? "A" : q < CUTS[2] ? "B" : q < CUTS[3] ? "C" : "D";
      out[t].push(m);
      ranks[m.id] = { rank: r + 1, tier: t, total: n, value: v };
    });
    return { tiers: out, ranks: ranks, total: n, list: list, metric: metric };
  }

  function topPair() {
    var t = tiers("aa", false);
    return t.list.slice(0, 2).map(function (m) { return m.id; });
  }

  function passes(m) {
    if (state.filter === "open") return (m.tags || []).indexOf("open-weights") !== -1;
    if (state.filter === "free") return hasFreeRoute(m);
    if (state.filter === "cheap") { var b = blended(m); return b != null && b < 1; }
    return true;
  }
  function matchesQuery(m, q) {
    if (!q) return false;
    return (m.name + " " + m.vendor + " " + (m.family || "")).toLowerCase().indexOf(q) !== -1;
  }

  /* ---------- rendering ---------- */

  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ metric: state.metric, filter: state.filter, legacy: state.legacy })); } catch (e) { /* private mode */ }
  }
  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && /^(aa|coding|agentic)$/.test(s.metric)) state.metric = s.metric;
      if (s && /^(all|open|free|cheap)$/.test(s.filter)) state.filter = s.filter;
      if (s) state.legacy = !!s.legacy;
    } catch (e) { /* ignore */ }
  }

  function segButton(group, value, key, on, fn) {
    var b = el("button", "seg-btn" + (on ? " is-on" : ""), T(key));
    b.type = "button";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.setAttribute("data-" + group, value);
    b.addEventListener("click", fn);
    return b;
  }

  function renderControls() {
    var c = els.controls;
    c.textContent = "";
    var seg = el("div", "seg", null);
    seg.setAttribute("role", "group");
    seg.setAttribute("aria-label", T("rankMetricLabel"));
    METRICS.forEach(function (mt) {
      seg.appendChild(segButton("metric", mt[0], mt[1], state.metric === mt[0], function () {
        if (state.metric === mt[0]) return;
        state.metric = mt[0];
        saveState();
        renderControls();
        update(true);
      }));
    });
    c.appendChild(seg);
    var fil = el("div", "chips-row", null);
    fil.setAttribute("role", "group");
    fil.setAttribute("aria-label", T("rankFilterLabel"));
    FILTERS.forEach(function (f) {
      var b = el("button", "chip chip-toggle" + (state.filter === f[0] ? " chip-on" : ""), T(f[1]));
      b.type = "button";
      b.setAttribute("aria-pressed", state.filter === f[0] ? "true" : "false");
      b.addEventListener("click", function () {
        state.filter = state.filter === f[0] && f[0] !== "all" ? "all" : f[0];
        saveState();
        renderControls();
        update(true);
      });
      fil.appendChild(b);
    });
    var lg = el("label", "switch");
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = state.legacy;
    cb.addEventListener("change", function () { state.legacy = cb.checked; saveState(); update(true); });
    lg.appendChild(cb);
    lg.appendChild(el("span", "switch-track"));
    lg.appendChild(el("span", "switch-label", T("fLegacy")));
    fil.appendChild(lg);
    c.appendChild(fil);
  }

  function chip(m, info, idx, now) {
    var b = el("button", "mchip");
    b.type = "button";
    b.setAttribute("data-flip", m.id);
    b.setAttribute("data-id", m.id);
    b.style.setProperty("--i", String(idx));
    var Br = root.WhichAIBrands;
    var icon = Br && Br.createIcon(m, "ai-brand-icon-sm");
    if (icon) b.appendChild(icon);
    b.appendChild(el("span", "mchip-name", m.name));
    b.appendChild(el("span", "mchip-score", String(info.value)));
    if (isNew(m, now)) {
      var nd = el("span", "mchip-new", T("radarNew"));
      b.appendChild(nd);
    }
    if (m.auto) b.classList.add("is-auto");
    b.title = m.name + " · " + m.vendor + " · #" + info.rank + " / " + info.total + (m.auto ? " · " + T("liveAutoChip") : "");
    return b;
  }

  function renderTiers(animate) {
    var t = tiers(state.metric, state.legacy);
    var q = state.query.toLowerCase().trim();
    var now = Date.now();
    function paint() {
      var box = els.tiers;
      box.textContent = "";
      var filtering = state.filter !== "all";
      TIERS.forEach(function (tier) {
        var row = el("div", "tier-row tier-" + tier);
        row.setAttribute("role", "listitem");
        var lab = el("div", "tier-label");
        lab.appendChild(el("span", "tier-letter", tier));
        lab.appendChild(el("span", "tier-name", T("tier" + tier)));
        var shown = t.tiers[tier].filter(passes);
        lab.appendChild(el("span", "tier-count", String(shown.length)));
        row.appendChild(lab);
        var chips = el("div", "tier-chips");
        var limit = state.open[tier] || filtering || q ? Infinity : (root.innerWidth && root.innerWidth < 640 ? 8 : ROW_LIMIT);
        shown.slice(0, limit).forEach(function (m, i) {
          var c = chip(m, t.ranks[m.id], i, now);
          if (q) c.classList.add(matchesQuery(m, q) ? "is-match" : "is-dim");
          chips.appendChild(c);
        });
        if (!shown.length) chips.appendChild(el("span", "tier-empty", "-"));
        if (shown.length > limit) {
          var more = el("button", "tier-more", T("tierMore").replace("{n}", String(shown.length - limit)));
          more.type = "button";
          more.addEventListener("click", function () { state.open[tier] = true; update(true); });
          chips.appendChild(more);
        } else if (state.open[tier] && shown.length > 8 && !filtering && !q) {
          var less = el("button", "tier-more", T("catalogShowLess"));
          less.type = "button";
          less.addEventListener("click", function () { state.open[tier] = false; update(true); });
          chips.appendChild(less);
        }
        row.appendChild(chips);
        box.appendChild(row);
      });
    }
    var M = root.WhichAIMotion;
    if (animate && M) M.flip(els.tiers, paint); else paint();

    var missing = pool("aa", state.legacy).length - t.total;
    var foot = T("tierNote");
    if (missing > 0 && state.metric !== "aa") {
      foot += " " + T("tierMissing").replace("{n}", String(missing)).replace("{metric}", T(state.metric === "coding" ? "metricCoding" : "metricAgentic"));
    }
    els.note.textContent = foot;
    if (deps && deps.onTiers) deps.onTiers(t);
    return t;
  }

  function renderScatter() {
    var C = root.WhichAICharts;
    if (!C || !els.scatter) return;
    var aa = tiers("aa", state.legacy);
    var pts = [];
    aa.list.forEach(function (m, i) {
      var b = blended(m);
      if (b == null) return;
      pts.push({
        x: b, y: m.score.aa, label: m.name, id: m.id,
        cls: "wc-tier-" + aa.ranks[m.id].tier + (passes(m) ? "" : " wc-dim"),
        top: i < 6
      });
    });
    els.scatter.innerHTML = C.scatter(pts, {
      logX: true, frontier: true, width: 760, height: 430,
      xLabel: T("scatterX"), yLabel: T("scatterY"), freeLabel: T("scatterFree"),
      aria: T("scatterTitle")
    });
  }

  function hot(id, on) {
    if (!els) return;
    Array.prototype.forEach.call(els.scatter.querySelectorAll('.wc-pt[data-id="' + id + '"]'), function (g) { g.classList.toggle("is-hot", on); });
    Array.prototype.forEach.call(els.tiers.querySelectorAll('.mchip[data-id="' + id + '"]'), function (c) { c.classList.toggle("is-hot", on); });
  }

  function renderKpis() {
    if (!els.kpis) return;
    var db = DB();
    if (!db) return;
    var now = Date.now();
    var off = db.models.filter(official);
    var current = off.filter(function (m) { return m.status !== "legacy"; });
    var labs = {};
    current.forEach(function (m) { labs[m.vendor] = 1; });
    var fresh = db.models.filter(function (m) { var t = releasedAt(m); return t != null && now - t < 30 * 86400000 && t <= now + 86400000; });
    var items = [
      [db.models.length, "kpiModels"],
      [off.length, "kpiMeasured"],
      [Object.keys(labs).length, "kpiLabs"],
      [fresh.length, "kpiNew"]
    ];
    els.kpis.textContent = "";
    items.forEach(function (it) {
      var k = el("div", "kpi");
      var n = el("strong", "kpi-n", "0");
      k.appendChild(n);
      k.appendChild(el("span", "kpi-l", T(it[1])));
      els.kpis.appendChild(k);
      if (root.WhichAIMotion) root.WhichAIMotion.count(n, it[0]); else n.textContent = String(it[0]);
    });
  }

  function renderSummary() {
    var B = root.PromptCompassBenchmarks;
    if (!els.summary) return;
    var s = B && B.liveSummary ? B.liveSummary() : null;
    els.summary.textContent = s || "";
    els.summary.hidden = !s;
  }

  /* ---------- the model finder (any model, ranked or not) ---------- */

  function searchHits(q) {
    var db = DB();
    if (!db || !q) return [];
    q = q.toLowerCase().trim();
    return db.models.filter(function (m) {
      return (m.name + " " + m.vendor + " " + (m.labels || []).join(" ") + " " + (m.tags || []).join(" ")).toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) {
      var sa = a.name.toLowerCase().indexOf(q) === 0 ? 0 : 1, sb = b.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      return sa - sb || ((metricValue(b, "aa") || -1) - (metricValue(a, "aa") || -1));
    });
  }

  function renderResults() {
    var box = els.results;
    var q = state.query.trim();
    box.textContent = "";
    box.hidden = !q;
    if (!q) return;
    var hits = searchHits(q);
    if (!hits.length) { box.appendChild(el("p", "rank-noresult", T("dbNoResults"))); return; }
    var Br = root.WhichAIBrands;
    hits.slice(0, 8).forEach(function (m, i) {
      var b = el("button", "rank-hit");
      b.type = "button";
      b.setAttribute("role", "option");
      b.setAttribute("data-id", m.id);
      if (i === 0) b.classList.add("is-first");
      var name = el("span", "rank-hit-name");
      if (!(Br && Br.setMark(name, m, m.name, { small: true }))) name.textContent = m.name;
      b.appendChild(name);
      b.appendChild(el("span", "rank-hit-meta", m.vendor + " · " + m.status));
      var v = metricValue(m, "aa");
      var badge = el("span", "badge", v != null ? "AA " + v : m.score && typeof m.score.aa === "number" ? "AA ~" + m.score.aa : T("rankUnmeasured"));
      b.appendChild(badge);
      b.addEventListener("click", function () { deps.openModel(m.id); });
      box.appendChild(b);
    });
    if (hits.length > 8) box.appendChild(el("p", "rank-noresult", "+" + (hits.length - 8)));
  }

  function wire() {
    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      renderResults();
      renderTiers(false);
    });
    els.search.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = searchHits(els.search.value)[0];
        if (first) { e.preventDefault(); deps.openModel(first.id); }
      } else if (e.key === "Escape") {
        els.search.value = "";
        state.query = "";
        renderResults();
        renderTiers(false);
      }
    });
    function idFrom(t) {
      var n = t && t.closest ? t.closest("[data-id]") : null;
      return n ? n.getAttribute("data-id") : null;
    }
    els.tiers.addEventListener("click", function (e) { var id = idFrom(e.target); if (id && e.target.closest(".mchip")) deps.openModel(id); });
    els.scatter.addEventListener("click", function (e) { var id = idFrom(e.target); if (id) deps.openModel(id); });
    [els.tiers, els.scatter].forEach(function (box) {
      box.addEventListener("mouseover", function (e) { var id = idFrom(e.target); if (id) hot(id, true); });
      box.addEventListener("mouseout", function (e) { var id = idFrom(e.target); if (id) hot(id, false); });
      box.addEventListener("focusin", function (e) { var id = idFrom(e.target); if (id) hot(id, true); });
      box.addEventListener("focusout", function (e) { var id = idFrom(e.target); if (id) hot(id, false); });
    });
  }

  function update(animate) {
    renderTiers(animate);
    renderScatter();
  }

  var Ranking = {
    init: function (elements, dependencies) {
      els = elements;
      deps = dependencies;
      loadState();
      renderControls();
      renderKpis();
      renderSummary();
      els.tiers.classList.add("first-paint");
      update(false);
      setTimeout(function () { els.tiers.classList.remove("first-paint"); }, 2600);
      wire();
    },
    /** new data or a new language: recompute everything */
    rerender: function () {
      if (!els || !deps) return;
      renderControls();
      renderKpis();
      renderSummary();
      update(true);
      renderResults();
    },
    tiers: tiers,
    topPair: topPair,
    blended: blended,
    official: official,
    metricValue: metricValue,
    isNew: isNew,
    /* the rank shown in a model card: among current models when the model is
       current, among all measured ones (legacy included) when it is legacy */
    tierOf: function (id) { return tiers("aa", false).ranks[id] || tiers("aa", true).ranks[id] || null; },
    _state: state
  };

  root.WhichAIRanking = Ranking;
  if (typeof module !== "undefined" && module.exports) module.exports = Ranking;
})();
