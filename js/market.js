/*
 * WhichAI - the AI market, live (v0.36.0)
 *
 * Replaces the old "Live market" view, which downloaded 675 KB of raw
 * OpenRouter routes on every open. Everything here is computed in the
 * browser from the catalog the page already holds (kept current by
 * js/live-catalog.js): no extra request, no wait, nothing to maintain.
 *
 *   - the price of the leader and the cheapest way into each tier
 *   - best value: index points per dollar, among models at or above the median
 *   - what is free right now: $0 API routes and the free tiers of the apps
 *   - price moves: where the live price differs from our last review
 *   - a calculator: what a month of your usage would cost on each pick
 *
 * Prices are OpenRouter's, in USD per million tokens, blended 3:1 input to
 * output. Subscriptions are flat fees and live in the Stack Optimizer.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var deps = null; // { T, openModel(id), lang() }
  var box = null;
  var calc = { msgs: 30, len: "medium" };
  var LS_KEY = "pc_market_calc_v1";
  var LENGTHS = { short: [400, 300], medium: [1500, 700], long: [6000, 1500] };

  function DB() { return root.PromptCompassModelsDB || null; }
  function R() { return root.WhichAIRanking || null; }
  function T(k) { return deps && deps.T ? deps.T(k) : k; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function blended(m) {
    var s = (m && m.spec) || {};
    return typeof s.priceIn === "number" && typeof s.priceOut === "number" ? (3 * s.priceIn + s.priceOut) / 4 : null;
  }
  function usd(v) {
    if (v == null || !isFinite(v)) return "n/a";
    if (v === 0) return "$0";
    if (v < 0.01) return "<$0.01";
    if (v < 10) return "$" + v.toFixed(2).replace(/\.00$/, "");
    if (v < 1000) return "$" + Math.round(v);
    return "$" + Math.round(v).toLocaleString("en-US");
  }
  function per1m(m) { return "$" + m.spec.priceIn + " / $" + m.spec.priceOut; }

  /* ---------- the computations (exposed for tests) ---------- */

  function current() {
    var r = R();
    var t = r ? r.tiers("aa", false) : null;
    return t || { tiers: { S: [], A: [], B: [], C: [], D: [] }, ranks: {}, list: [], total: 0 };
  }

  function ladder(t) {
    t = t || current();
    return ["S", "A", "B", "C"].map(function (tier) {
      var priced = t.tiers[tier].filter(function (m) { return blended(m) != null; });
      priced.sort(function (a, b) { return blended(a) - blended(b) || b.score.aa - a.score.aa; });
      return { tier: tier, model: priced[0] || null, count: t.tiers[tier].length };
    });
  }

  function bestValue(t, n) {
    t = t || current();
    var list = t.list;
    if (!list.length) return [];
    var median = list[Math.floor(list.length / 2)].score.aa;
    return list.filter(function (m) { var b = blended(m); return b != null && b > 0 && m.score.aa >= median; })
      .map(function (m) { return { m: m, value: m.score.aa / blended(m) }; })
      .sort(function (a, b) { return b.value - a.value; })
      .slice(0, n || 8);
  }

  function freeRoutes() {
    var db = DB();
    return db && db.live && Array.isArray(db.live.freeRoutes) ? db.live.freeRoutes.slice() : [];
  }

  function moves() {
    var db = DB();
    if (!db) return [];
    return db.models.filter(function (m) { return Array.isArray(m.priceWas) && blended(m) != null; }).map(function (m) {
      var was = (3 * m.priceWas[0] + m.priceWas[1]) / 4;
      var now = blended(m);
      return { m: m, was: m.priceWas, change: was > 0 ? (now - was) / was : 0 };
    }).sort(function (a, b) { return Math.abs(b.change) - Math.abs(a.change); });
  }

  function monthly(m, msgs, len) {
    var tok = LENGTHS[len] || LENGTHS.medium;
    if (!m || !m.spec || typeof m.spec.priceIn !== "number") return null;
    return 30 * msgs * (tok[0] * m.spec.priceIn + tok[1] * m.spec.priceOut) / 1e6;
  }

  /* ---------- rendering ---------- */

  function brandName(m, cls) {
    var n = el("span", cls || "mk-name");
    var Br = root.WhichAIBrands;
    if (!(Br && Br.setMark(n, m, m.name, { small: true }))) n.textContent = m.name;
    return n;
  }
  function openBtn(m, child) {
    var b = el("button", "mk-open");
    b.type = "button";
    b.appendChild(child || brandName(m));
    b.addEventListener("click", function () { deps.openModel(m.id); });
    return b;
  }

  function fillLeader(node, t) {
    if (!node) return;
    t = t || current();
    var lead = t.list[0];
    node.textContent = "";
    node.hidden = !lead;
    if (!lead) return;
    node.appendChild(el("span", "mk-leader-kicker", T("mkLeaderKicker")));
    var b = blended(lead);
    node.appendChild(el("strong", "mk-leader-price", b != null ? per1m(lead) : "n/a"));
    node.appendChild(el("span", "mk-leader-unit", T("mkPer1M")));
    var who = el("span", "mk-leader-who");
    who.appendChild(brandName(lead));
    who.appendChild(el("span", "mk-leader-score", "AA " + lead.score.aa));
    node.appendChild(who);
    node.setAttribute("data-id", lead.id);
    node.classList.add("is-link");
  }

  function kpis(t) {
    var wrap = el("div", "mk-kpis");
    var lad = ladder(t);
    var s = lad[0].model;
    var fr = freeRoutes();
    var mv = moves();
    [
      [s ? usd(blended(s)) : "n/a", T("mkCheapS"), s ? s.name : ""],
      [String(fr.length), T("mkFreeNow"), fr.length ? T("mkFreeBest").replace("{name}", fr[0].name || fr[0].id) : ""],
      [String(mv.length), T("mkMoves"), mv.length ? mv[0].m.name : ""]
    ].forEach(function (k) {
      var tile = el("div", "kpi kpi-tile");
      tile.appendChild(el("strong", "kpi-n", k[0]));
      tile.appendChild(el("span", "kpi-l", k[1]));
      if (k[2]) tile.appendChild(el("span", "kpi-s", k[2]));
      wrap.appendChild(tile);
    });
    return wrap;
  }

  function ladderBlock(t) {
    var sec = el("section", "mk-block mk-ladder card");
    sec.appendChild(el("h3", "mk-title", T("mkLadderTitle")));
    sec.appendChild(el("p", "mk-sub", T("mkLadderSub")));
    var steps = el("div", "mk-steps");
    ladder(t).forEach(function (row, i) {
      var st = el("div", "mk-step tier-" + row.tier);
      st.style.setProperty("--step", String(3 - i));
      st.appendChild(el("span", "mk-step-tier", row.tier));
      st.appendChild(el("span", "mk-step-name", T("tier" + row.tier)));
      if (row.model) {
        st.appendChild(el("strong", "mk-step-price", usd(blended(row.model))));
        st.appendChild(el("span", "mk-step-unit", T("mkPer1M")));
        st.appendChild(openBtn(row.model));
        st.appendChild(el("span", "mk-step-score", "AA " + row.model.score.aa));
      } else {
        st.appendChild(el("span", "mk-step-unit", "n/a"));
      }
      steps.appendChild(st);
    });
    sec.appendChild(steps);
    return sec;
  }

  function valueBlock(t) {
    var sec = el("section", "mk-block card");
    sec.appendChild(el("h3", "mk-title", T("mkValueTitle")));
    sec.appendChild(el("p", "mk-sub", T("mkValueNote")));
    var list = bestValue(t, 8);
    var max = list.length ? list[0].value : 1;
    var ol = el("ol", "mk-bars");
    list.forEach(function (v) {
      var li = el("li", "mk-bar");
      li.appendChild(openBtn(v.m));
      var track = el("span", "mk-track");
      var fill = el("span", "mk-fill");
      fill.style.setProperty("--w", Math.max(4, (v.value / max) * 100).toFixed(1) + "%");
      track.appendChild(fill);
      li.appendChild(track);
      li.appendChild(el("span", "mk-bar-val", Math.round(v.value) + " " + T("mkPtsPerUsd")));
      li.appendChild(el("span", "mk-bar-meta", "AA " + v.m.score.aa + " · " + usd(blended(v.m)) + " " + T("mkPer1MShort")));
      ol.appendChild(li);
    });
    sec.appendChild(ol);
    return sec;
  }

  function calcBlock(t) {
    var sec = el("section", "mk-block mk-calc card");
    sec.appendChild(el("h3", "mk-title", T("mkCalcTitle")));
    var form = el("div", "mk-calc-form");
    var l1 = el("label", "mk-field");
    l1.appendChild(el("span", "mk-field-l", T("mkCalcMsgs")));
    var range = document.createElement("input");
    range.type = "range"; range.min = "1"; range.max = "500"; range.step = "1"; range.value = String(calc.msgs);
    range.setAttribute("aria-label", T("mkCalcMsgs"));
    var out = el("output", "mk-out", String(calc.msgs));
    l1.appendChild(range);
    l1.appendChild(out);
    form.appendChild(l1);
    var l2 = el("div", "mk-field");
    l2.appendChild(el("span", "mk-field-l", T("mkCalcLen")));
    var seg = el("div", "seg seg-sm");
    [["short", "optShort"], ["medium", "optMedium"], ["long", "optLong"]].forEach(function (o) {
      var b = el("button", "seg-btn" + (calc.len === o[0] ? " is-on" : ""), T(o[1]));
      b.type = "button";
      b.setAttribute("aria-pressed", calc.len === o[0] ? "true" : "false");
      b.addEventListener("click", function () { calc.len = o[0]; save(); paintResult(); Array.prototype.forEach.call(seg.children, function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); });
      seg.appendChild(b);
    });
    l2.appendChild(seg);
    form.appendChild(l2);
    sec.appendChild(form);
    var res = el("div", "mk-calc-res");
    sec.appendChild(res);
    var note = el("p", "router-meta mk-calc-note");
    sec.appendChild(note);

    function picks() {
      var lad = ladder(t);
      var val = bestValue(t, 1)[0];
      var out = [];
      function push(label, m) { if (m && out.every(function (o) { return o.m.id !== m.id; })) out.push({ label: label, m: m }); }
      push(T("mkPickLeader"), t.list[0]);
      push(T("mkPickValue"), val && val.m);
      push(T("mkPickA"), lad[1].model);
      push(T("mkPickB"), lad[2].model);
      return out;
    }
    function paintResult() {
      out.textContent = String(calc.msgs);
      res.textContent = "";
      var rows = picks().map(function (p) { return { p: p, cost: monthly(p.m, calc.msgs, calc.len) }; }).filter(function (r) { return r.cost != null; });
      var max = rows.reduce(function (a, r) { return Math.max(a, r.cost); }, 0) || 1;
      rows.forEach(function (r) {
        var row = el("div", "mk-cost");
        var lab = el("div", "mk-cost-l");
        lab.appendChild(el("span", "mk-cost-kind", r.p.label));
        lab.appendChild(openBtn(r.p.m));
        row.appendChild(lab);
        var track = el("span", "mk-track");
        var fill = el("span", "mk-fill");
        fill.style.setProperty("--w", Math.max(2, (r.cost / max) * 100).toFixed(1) + "%");
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el("strong", "mk-cost-v", usd(r.cost) + " " + T("mkPerMonth")));
        res.appendChild(row);
      });
      var fr = freeRoutes()[0];
      if (fr) {
        var frow = el("div", "mk-cost mk-cost-free");
        var fl = el("div", "mk-cost-l");
        fl.appendChild(el("span", "mk-cost-kind", T("mkPickFree")));
        fl.appendChild(el("span", "mk-name", fr.name || fr.id));
        frow.appendChild(fl);
        frow.appendChild(el("span", "mk-track"));
        frow.appendChild(el("strong", "mk-cost-v", "$0 · " + T("mkRateLimited")));
        res.appendChild(frow);
      }
      var tok = LENGTHS[calc.len];
      note.textContent = T("mkCalcNote").replace("{in}", String(tok[0])).replace("{out}", String(tok[1]));
    }
    range.addEventListener("input", function () { calc.msgs = Number(range.value) || 1; save(); paintResult(); });
    paintResult();
    return sec;
  }

  function freeBlock() {
    var sec = el("section", "mk-block card");
    sec.appendChild(el("h3", "mk-title", T("mkFreeTitle")));
    sec.appendChild(el("p", "mk-sub", T("mkFreeNote")));
    var fr = freeRoutes();
    var ul = el("ul", "mk-free");
    if (!fr.length) ul.appendChild(el("li", "router-meta", T("mkFreeNone")));
    fr.slice(0, 8).forEach(function (f) {
      var li = el("li", "mk-free-row");
      var a = el("a", "mk-free-name", f.name || f.id);
      a.href = "https://openrouter.ai/" + String(f.id).replace(/[^a-z0-9._:\/+-]/gi, "");
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      li.appendChild(a);
      li.appendChild(el("span", "mk-free-meta", (f.vendor || "") + (typeof f.aa === "number" ? " · AA " + f.aa : "") + (f.ctx ? " · " + Math.round(f.ctx / 1000) + "K ctx" : "") + (f.expires ? " · " + T("mkUntil") + " " + f.expires : "")));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    var B = root.PromptCompassBenchmarks;
    if (B && B.apps) {
      sec.appendChild(el("p", "mk-subtitle", T("mkAppsFree")));
      var apps = el("ul", "mk-apps");
      Object.keys(B.apps).forEach(function (k) {
        var app = B.apps[k];
        var li = el("li", "mk-app");
        var n = el("strong", "mk-app-name");
        var Br = root.WhichAIBrands;
        if (!(Br && Br.setMark(n, k, app.label, { small: true }))) n.textContent = app.label;
        li.appendChild(n);
        li.appendChild(el("span", "mk-app-free", app.freeModel));
        apps.appendChild(li);
      });
      sec.appendChild(apps);
    }
    return sec;
  }

  function movesBlock() {
    var sec = el("section", "mk-block card");
    sec.appendChild(el("h3", "mk-title", T("mkMovesTitle")));
    sec.appendChild(el("p", "mk-sub", T("mkMovesNote")));
    var mv = moves();
    var ul = el("ul", "mk-moves");
    if (!mv.length) ul.appendChild(el("li", "router-meta", T("mkMovesNone")));
    mv.slice(0, 8).forEach(function (x) {
      var li = el("li", "mk-move " + (x.change < 0 ? "is-cut" : "is-rise"));
      li.appendChild(openBtn(x.m));
      li.appendChild(el("span", "mk-move-was", "$" + x.was[0] + " / $" + x.was[1]));
      li.appendChild(el("span", "mk-move-arrow", "→"));
      li.appendChild(el("span", "mk-move-now", per1m(x.m)));
      var pct = Math.round(x.change * 100);
      li.appendChild(el("span", "mk-move-pct", (pct > 0 ? "+" : "") + pct + "%"));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    return sec;
  }

  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(calc)); } catch (e) { /* ignore */ } }
  function load() {
    try {
      var c = JSON.parse(localStorage.getItem(LS_KEY));
      if (c && c.msgs >= 1 && c.msgs <= 500) calc.msgs = Math.round(c.msgs);
      if (c && LENGTHS[c.len]) calc.len = c.len;
    } catch (e) { /* ignore */ }
  }

  function render() {
    if (!box || !DB()) return;
    var t = current();
    box.textContent = "";
    fillLeader(document.getElementById("mk-leader"), t);
    box.appendChild(kpis(t));
    box.appendChild(ladderBlock(t));
    var two = el("div", "mk-two");
    two.appendChild(valueBlock(t));
    two.appendChild(calcBlock(t));
    box.appendChild(two);
    var three = el("div", "mk-two");
    three.appendChild(freeBlock());
    three.appendChild(movesBlock());
    box.appendChild(three);
    var db = DB();
    box.appendChild(el("p", "router-meta mk-foot", T("mkFoot").replace("{when}", (db && db.updated) || "")));
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("is-drawn"); }); });
  }

  var Market = {
    init: function (rootEl, dependencies) {
      box = rootEl;
      deps = dependencies;
      load();
      render();
    },
    rerender: function () { if (box && deps) render(); },
    fillLeader: fillLeader,
    _ladder: ladder,
    _bestValue: bestValue,
    _moves: moves,
    _monthly: monthly
  };

  root.WhichAIMarket = Market;
  if (typeof module !== "undefined" && module.exports) module.exports = Market;
})();
