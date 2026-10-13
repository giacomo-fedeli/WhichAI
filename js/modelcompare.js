/*
 * WhichAI - head to head (v0.36.0)
 *
 * Two (or three) models face each other: official indices as paired bars,
 * price, context, age, category profile, access and the one-line review.
 * It opens on today's top two by the official index and follows the live
 * ranking until the reader picks models; a pick is remembered, "Reset"
 * returns to following the leaders. No API calls: catalog data only.
 * Converted (~) values are marked and never declared the winner of a row.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var stage = null, body = null;
  var deps = null; // { T, openModel(id), topPair() }
  var LS_KEY = "pc_mcmp_v2";
  var sel = null;   // ids, 2-3
  var auto = true;  // following the live top two

  function DB() { return root.PromptCompassModelsDB || null; }
  function Charts() { return root.WhichAICharts || null; }
  function T(k) { return deps && deps.T ? deps.T(k) : k; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function byId(id) {
    var db = DB();
    if (!db) return null;
    for (var i = 0; i < db.models.length; i++) if (db.models[i].id === id) return db.models[i];
    return null;
  }
  function official(m) { return !!m && !!m.score && typeof m.score.aa === "number" && !m.score.est; }

  function livePair() {
    var p = deps && deps.topPair ? deps.topPair() : [];
    if (p.length >= 2) return p.slice(0, 2);
    var db = DB();
    var list = db ? db.models.filter(function (m) { return official(m) && m.status === "public"; }).sort(function (a, b) { return b.score.aa - a.score.aa; }) : [];
    return list.slice(0, 2).map(function (m) { return m.id; });
  }

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && Array.isArray(s.ids) && s.ids.length >= 2 && s.ids.every(function (id) { return !!byId(id); })) {
        auto = false;
        return s.ids.slice(0, 3);
      }
    } catch (e) { /* ignore */ }
    auto = true;
    return livePair();
  }
  function save() {
    try {
      if (auto) localStorage.removeItem(LS_KEY);
      else localStorage.setItem(LS_KEY, JSON.stringify({ ids: sel }));
    } catch (e) { /* ignore */ }
  }

  /* ---------- small formatters ---------- */

  function ctxTokens(m) {
    var c = m.spec && m.spec.ctx;
    var x = String(c || "").match(/([\d.]+)\s*([KM])/i);
    if (!x) return null;
    return parseFloat(x[1]) * (x[2].toUpperCase() === "M" ? 1e6 : 1e3);
  }
  function released(m) {
    var r = m.spec && m.spec.released;
    if (!r) return null;
    var t = Date.parse(/^\d{4}-\d{2}$/.test(r) ? r + "-15" : r);
    return isFinite(t) ? t : null;
  }
  function dateText(t, lang) {
    try { return new Date(t).toLocaleDateString(lang || "en", { year: "numeric", month: "short", day: "numeric" }); }
    catch (e) { return new Date(t).toISOString().slice(0, 10); }
  }

  /* ---------- the stage: who faces whom ---------- */

  function select(idx) {
    var db = DB();
    var s = document.createElement("select");
    s.className = "vs-select";
    s.setAttribute("aria-label", T("cmpPick") + " " + (idx + 1));
    var groups = {};
    db.models.forEach(function (m) { (groups[m.vendor] = groups[m.vendor] || []).push(m); });
    Object.keys(groups).sort().forEach(function (vendor) {
      var og = document.createElement("optgroup");
      og.label = vendor;
      groups[vendor].sort(function (a, b) { return ((b.score && b.score.aa) || -1) - ((a.score && a.score.aa) || -1); }).forEach(function (m) {
        var o = document.createElement("option");
        o.value = m.id;
        o.textContent = m.name + (m.score && typeof m.score.aa === "number" ? " · " + (m.score.est ? "~" : "") + m.score.aa : "");
        og.appendChild(o);
      });
      s.appendChild(og);
    });
    s.value = sel[idx];
    /* the selected attribute too: a cloned select (the morph ghost) keeps it */
    if (s.selectedIndex >= 0) s.options[s.selectedIndex].defaultSelected = true;
    s.addEventListener("change", function () {
      sel[idx] = s.value;
      auto = false;
      save();
      render(true);
    });
    return s;
  }

  function slot(m, idx) {
    var card = el("div", "vs-slot");
    card.setAttribute("data-slot", String(idx));
    var head = el("div", "vs-name");
    var Br = root.WhichAIBrands;
    if (!(Br && Br.setMark(head, m, m.name, { className: "ai-brand-lockup", providerWordmark: true }))) head.textContent = m.name;
    card.appendChild(head);
    card.appendChild(el("p", "vs-vendor", m.vendor));
    var badges = el("div", "vs-badges");
    if (official(m)) {
      badges.appendChild(el("span", "badge badge-strong", "AA " + m.score.aa));
      var R = root.WhichAIRanking;
      var info = R && R.tierOf ? R.tierOf(m.id) : null;
      if (info) {
        badges.appendChild(el("span", "badge tier-badge tier-" + info.tier, info.tier));
        badges.appendChild(el("span", "badge", "#" + info.rank + " / " + info.total));
      }
    } else if (m.score && typeof m.score.aa === "number") {
      badges.appendChild(el("span", "badge badge-est", "AA ~" + m.score.aa));
    } else {
      badges.appendChild(el("span", "badge", T("rankUnmeasured")));
    }
    card.appendChild(badges);
    var row = el("div", "vs-slot-tools");
    row.appendChild(select(idx));
    var det = el("button", "btn-link", T("mcDetails"));
    det.type = "button";
    det.addEventListener("click", function () { deps.openModel(m.id); });
    row.appendChild(det);
    if (idx >= 2) {
      var rm = el("button", "btn-link danger", T("mcRemove"));
      rm.type = "button";
      rm.addEventListener("click", function () { sel.splice(idx, 1); auto = false; save(); render(true); });
      row.appendChild(rm);
    }
    card.appendChild(row);
    return card;
  }

  function renderStage(models) {
    stage.textContent = "";
    stage.className = "vs-stage vs-n" + models.length;
    models.forEach(function (m, i) {
      if (i > 0) stage.appendChild(el("span", "vs-emblem", "vs"));
      stage.appendChild(slot(m, i));
    });
  }

  /* ---------- the rows: paired bars, the better value lit ---------- */

  function bestIdx(vals, lowerIsBetter) {
    var best = -1;
    vals.forEach(function (v, i) {
      if (v == null || v.est) return;
      if (best === -1 || (lowerIsBetter ? v.n < vals[best].n : v.n > vals[best].n)) best = i;
    });
    var ties = vals.filter(function (v) { return v && best !== -1 && !v.est && v.n === vals[best].n; }).length;
    return ties > 1 ? -1 : best;
  }

  function barRow(label, vals, opts) {
    opts = opts || {};
    var row = el("div", "vs-row");
    row.appendChild(el("div", "vs-row-label", label));
    var max = 0;
    vals.forEach(function (v) { if (v && v.n > max) max = v.n; });
    var win = bestIdx(vals, opts.lower);
    var cells = el("div", "vs-row-cells vs-n" + vals.length);
    vals.forEach(function (v, i) {
      var c = el("div", "vs-cell" + (i === win ? " is-best" : ""));
      if (!v) {
        c.appendChild(el("span", "vs-na", "n/a"));
      } else {
        var track = el("span", "vs-track");
        var fill = el("span", "vs-fill" + (v.est ? " is-est" : ""));
        /* Bar length is always the value itself (a longer price bar is a
           higher price); the better value is lit, whichever way "better" runs. */
        var pct = max > 0 ? Math.max(3, Math.min(100, (v.n / max) * 100)) : 0;
        fill.style.setProperty("--w", pct.toFixed(1) + "%");
        track.appendChild(fill);
        c.appendChild(track);
        c.appendChild(el("span", "vs-val", v.text));
      }
      cells.appendChild(c);
    });
    row.appendChild(cells);
    return row;
  }

  function textRow(label, vals, cls) {
    var row = el("div", "vs-row vs-row-text" + (cls ? " " + cls : ""));
    row.appendChild(el("div", "vs-row-label", label));
    var cells = el("div", "vs-row-cells vs-n" + vals.length);
    vals.forEach(function (v) {
      var c = el("div", "vs-cell");
      if (v == null || v === "") c.appendChild(el("span", "vs-na", "n/a"));
      else if (typeof v === "string") c.textContent = v;
      else c.appendChild(v);
      cells.appendChild(c);
    });
    row.appendChild(cells);
    return row;
  }

  function renderBody(models) {
    body.textContent = "";
    var lang = deps && deps.lang ? deps.lang() : "en";
    var idx = el("div", "vs-block card");
    idx.appendChild(el("h3", "vs-block-title", T("cmpIndices")));
    function idxVal(m, k) {
      if (!m.score) return null;
      if (k === "aa") {
        if (typeof m.score.aa !== "number") return null;
        return { n: m.score.aa, text: (m.score.est ? "~" : "") + m.score.aa, est: !!m.score.est };
      }
      var v = m.score[k];
      return typeof v === "number" && !m.score.est ? { n: v, text: String(v) } : null;
    }
    idx.appendChild(barRow(T("metricAA"), models.map(function (m) { return idxVal(m, "aa"); })));
    idx.appendChild(barRow(T("metricCoding"), models.map(function (m) { return idxVal(m, "coding"); })));
    idx.appendChild(barRow(T("metricAgentic"), models.map(function (m) { return idxVal(m, "agentic"); })));
    idx.appendChild(el("p", "router-meta", T("cmpIndicesNote")));
    body.appendChild(idx);

    var cost = el("div", "vs-block card");
    cost.appendChild(el("h3", "vs-block-title", T("cmpCost")));
    function price(m, k) {
      var v = m.spec ? m.spec[k] : null;
      return typeof v === "number" ? { n: v, text: "$" + v } : null;
    }
    cost.appendChild(barRow(T("cmpPriceIn"), models.map(function (m) { return price(m, "priceIn"); }), { lower: true }));
    cost.appendChild(barRow(T("cmpPriceOut"), models.map(function (m) { return price(m, "priceOut"); }), { lower: true }));
    cost.appendChild(barRow(T("mcCtx"), models.map(function (m) {
      var t = ctxTokens(m);
      return t ? { n: t, text: m.spec.ctx } : null;
    })));
    cost.appendChild(textRow(T("mcReleased"), models.map(function (m) {
      var t = released(m);
      if (!t) return null;
      var days = Math.max(0, Math.round((Date.now() - t) / 86400000));
      return dateText(t, lang) + " · " + T("cmpDaysAgo").replace("{n}", String(days));
    })));
    cost.appendChild(textRow(T("mcSpeed"), models.map(function (m) { return m.spec && m.spec.speed ? m.spec.speed : null; })));
    cost.appendChild(textRow(T("mcModal"), models.map(function (m) { return m.spec && m.spec.modal ? m.spec.modal : null; })));
    cost.appendChild(el("p", "router-meta", T("cmpPriceNote")));
    body.appendChild(cost);

    var C = Charts();
    if (C && models.some(function (m) { return m.score && m.score.cat; })) {
      var prof = el("div", "vs-block card");
      prof.appendChild(el("h3", "vs-block-title", T("mcProfile")));
      var cats = [["coding", "Coding"], ["reasoning", "Reasoning"], ["writing", "Writing"], ["agents", "Agents & tools"]];
      var box = el("div", "vs-chart");
      box.innerHTML = C.groupedBars(cats.map(function (c) { return c[1]; }), models.map(function (m) {
        return { name: m.name, values: cats.map(function (c) { return m.score && m.score.cat ? m.score.cat[c[0]] : null; }) };
      }), { aria: T("mcProfile") });
      prof.appendChild(box);
      prof.appendChild(el("p", "router-meta", T("cmpProfileNote")));
      body.appendChild(prof);
    }

    var words = el("div", "vs-block card");
    words.appendChild(el("h3", "vs-block-title", T("mcReview")));
    words.appendChild(textRow(T("mcAccess"), models.map(function (m) { return m.access || null; }), "vs-row-small"));
    words.appendChild(textRow(T("mcStrengths"), models.map(function (m) {
      if (!m.labels || !m.labels.length) return null;
      var b = el("div", "db-chips");
      m.labels.forEach(function (l) { b.appendChild(el("span", "chip chip-label", l)); });
      return b;
    })));
    words.appendChild(textRow(T("mcReview"), models.map(function (m) { return m.review || null; }), "vs-row-review"));
    words.appendChild(el("p", "router-meta", T("mcFootnote")));
    body.appendChild(words);
  }

  function renderActions(models) {
    var bar = el("div", "vs-actions");
    var sw = el("button", "btn-ghost", T("cmpSwap"));
    sw.type = "button";
    sw.addEventListener("click", function () { sel = [sel[1], sel[0]].concat(sel.slice(2)); auto = false; save(); render(true); });
    bar.appendChild(sw);
    if (sel.length < 3) {
      var add = el("button", "btn-ghost", T("mcAdd"));
      add.type = "button";
      add.addEventListener("click", function () {
        var R = root.WhichAIRanking;
        var list = R ? R.tiers("aa", false).list : [];
        var next = null;
        list.some(function (m) { if (sel.indexOf(m.id) === -1) { next = m.id; return true; } return false; });
        if (!next) return;
        sel.push(next);
        auto = false;
        save();
        render(true);
      });
      bar.appendChild(add);
    }
    var reset = el("button", "btn-ghost", T("cmpReset"));
    reset.type = "button";
    reset.disabled = auto;
    reset.addEventListener("click", function () { auto = true; sel = livePair(); save(); render(true); });
    bar.appendChild(reset);
    var note = el("span", "vs-mode", auto ? T("cmpFollowing") : T("cmpYourPick"));
    bar.appendChild(note);
    return bar;
  }

  function render(animate) {
    if (!stage || !body || !DB()) return;
    var models = sel.map(byId).filter(Boolean);
    if (models.length < 2) { auto = true; sel = livePair(); models = sel.map(byId).filter(Boolean); }
    if (models.length < 2) return;
    renderStage(models);
    var old = body.previousElementSibling && body.previousElementSibling.classList && body.previousElementSibling.classList.contains("vs-actions") ? body.previousElementSibling : null;
    var acts = renderActions(models);
    if (old) old.replaceWith(acts); else body.parentNode.insertBefore(acts, body);
    renderBody(models);
    if (animate) body.classList.remove("is-drawn");
    requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add("is-drawn"); }); });
    if (root.WhichAIMotion) root.WhichAIMotion.refresh();
  }

  var MC = {
    init: function (stageEl, bodyEl, dependencies) {
      stage = stageEl;
      body = bodyEl;
      deps = dependencies;
      if (!sel) sel = load();
      render(false);
    },
    rerender: function () {
      if (!stage || !deps) return;
      if (auto) sel = livePair();
      render(false);
    },
    /** preselect from elsewhere (the drawer, the ranking) */
    compareWith: function (id) {
      if (!sel) sel = load();
      if (sel.indexOf(id) === -1) {
        sel = [id, sel[0] === id ? sel[1] : sel[0]];
        auto = false;
        save();
      }
      if (stage && deps) render(true);
    },
    setModels: function (ids) {
      var ok = (ids || []).filter(byId).slice(0, 3);
      if (ok.length < 2) return;
      sel = ok;
      auto = false;
      save();
      if (stage && deps) render(true);
    },
    selection: function () { return { ids: (sel || []).slice(), auto: auto }; },
    _ctxTokens: ctxTokens
  };

  root.WhichAIModelCompare = MC;
  if (typeof module !== "undefined" && module.exports) module.exports = MC;
})();
