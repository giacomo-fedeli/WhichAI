/*
 * WhichAI - Model comparison on paper (v0.22.0)
 * Compare 2-3 models from the database side by side: scores, specs, price,
 * strengths. No API calls, no outputs - pure Model-guide data.
 * Estimates are marked "~", unavailable values shown as "n/a".
 */
(function () {
  "use strict";

  var root = null;
  var deps = null; // { T, openModel(id) }
  var LS_KEY = "pc_mcmp_v1";
  var sel = null; // array of model ids (2-3)

  function DB() { return window.PromptCompassModelsDB || null; }
  function Charts() { return window.WhichAICharts || null; }

  function byId(id) {
    var db = DB();
    if (!db) return null;
    for (var i = 0; i < db.models.length; i++) if (db.models[i].id === id) return db.models[i];
    return null;
  }

  function loadSel() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && s.length >= 2 && s.every(function (id) { return !!byId(id); })) return s.slice(0, 3);
    } catch (e) { /* ignore */ }
    return ["fable-5", "gpt-5-6-sol"];
  }

  function saveSel() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(sel)); } catch (e) { /* ignore */ }
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildSelect(idx) {
    var db = DB();
    var s = document.createElement("select");
    s.className = "mc-select";
    s.setAttribute("aria-label", "Model " + (idx + 1));
    var groups = {};
    db.models.forEach(function (m) {
      if (!groups[m.vendor]) groups[m.vendor] = [];
      groups[m.vendor].push(m);
    });
    Object.keys(groups).forEach(function (vendor) {
      var og = document.createElement("optgroup");
      og.label = vendor;
      groups[vendor].forEach(function (m) {
        var o = document.createElement("option");
        o.value = m.id;
        o.textContent = m.name + (m.score && m.score.aa ? " · " + (m.score.est ? "~" : "") + m.score.aa : "");
        og.appendChild(o);
      });
      s.appendChild(og);
    });
    s.value = sel[idx];
    s.addEventListener("change", function () {
      sel[idx] = s.value;
      saveSel();
      render();
    });
    return s;
  }

  function specVal(m, key) {
    return m.spec && m.spec[key] != null ? m.spec[key] : null;
  }

  function priceText(m) {
    var pin = specVal(m, "priceIn"), pout = specVal(m, "priceOut");
    if (pin == null || pout == null) return null;
    return "$" + pin + " / $" + pout;
  }

  function render() {
    if (!root) return;
    var db = DB();
    var C = Charts();
    root.innerHTML = "";
    if (!db) return;

    var head = el("div", "guide-head mc-head");
    head.appendChild(el("h2", null, deps.T("mcTitle")));
    head.appendChild(el("p", null, deps.T("mcSub")));
    root.appendChild(head);

    // selector row
    var selRow = el("div", "mc-selrow");
    sel.forEach(function (id, i) {
      var wrap = el("div", "mc-selwrap");
      wrap.appendChild(buildSelect(i));
      if (i >= 2) {
        var rm = el("button", "btn-link danger", deps.T("mcRemove"));
        rm.type = "button";
        rm.addEventListener("click", function () { sel.splice(i, 1); saveSel(); render(); });
        wrap.appendChild(rm);
      }
      selRow.appendChild(wrap);
    });
    if (sel.length < 3) {
      var add = el("button", "btn-copy mc-add", deps.T("mcAdd"));
      add.type = "button";
      add.addEventListener("click", function () {
        var used = {};
        sel.forEach(function (id) { used[id] = 1; });
        var next = null;
        ["kimi-k3", "gemini-3-1-pro", "glm-5-2", "sonnet-5"].forEach(function (c) { if (!next && !used[c]) next = c; });
        if (!next) db.models.some(function (m) { if (!used[m.id]) { next = m.id; return true; } return false; });
        sel.push(next);
        saveSel();
        render();
      });
      selRow.appendChild(add);
    }
    root.appendChild(selRow);

    var models = sel.map(byId).filter(Boolean);
    if (models.length < 2) return;

    var anyEst = models.some(function (m) { return m.score && m.score.est; });

    // AA score bars
    if (C) {
      var scoreCard = el("div", "card mc-chart-card");
      scoreCard.appendChild(el("h3", "mc-block-title", deps.T("mcScore")));
      var items = models.map(function (m) {
        return { label: m.name, value: m.score && m.score.aa ? m.score.aa : 0, est: !!(m.score && m.score.est) };
      });
      var chartBox = el("div", "mc-chart");
      chartBox.innerHTML = C.barChart(items, { max: 70, rowH: 34, aria: "AA Intelligence Index comparison" });
      scoreCard.appendChild(chartBox);
      scoreCard.appendChild(el("p", "router-meta", "Official Artificial Analysis Intelligence Index, read " + ((window.PromptCompassModelsDB || {}).updated || "recently") + " (refreshed automatically)." + (anyEst ? " Values marked ~ are not current official measurements (converted from an older scale or estimated) - never compare them 1:1 with measured scores." : "")));
      root.appendChild(scoreCard);

      // Category profile
      var catCard = el("div", "card mc-chart-card");
      catCard.appendChild(el("h3", "mc-block-title", deps.T("mcProfile")));
      var cats = [["coding", "Coding"], ["reasoning", "Reasoning"], ["writing", "Writing"], ["agents", "Agents & tools"]];
      var series = models.map(function (m) {
        return { name: m.name, values: cats.map(function (c) { return m.score && m.score.cat ? m.score.cat[c[0]] : null; }) };
      });
      var catBox = el("div", "mc-chart");
      catBox.innerHTML = C.groupedBars(cats.map(function (c) { return c[1]; }), series, { aria: "Category profile comparison" });
      catCard.appendChild(catBox);
      catCard.appendChild(el("p", "router-meta", "Category scores (0–100) are WhichAI blended ratings - guidance, not official measurements."));
      root.appendChild(catCard);
    }

    // Spec table
    var table = el("div", "card mc-table-card");
    var grid = el("div", "mc-grid mc-grid-" + models.length);
    function row(label, vals, cls) {
      grid.appendChild(el("div", "mc-rowlabel", label));
      vals.forEach(function (v) {
        var cell = el("div", "mc-cell" + (cls ? " " + cls : ""));
        if (v == null || v === "") cell.appendChild(el("span", "mc-na", "n/a"));
        else if (typeof v === "string") cell.textContent = v;
        else cell.appendChild(v);
        grid.appendChild(cell);
      });
    }
    // header row: names + open buttons
    grid.appendChild(el("div", "mc-rowlabel", ""));
    models.forEach(function (m) {
      var cell = el("div", "mc-cell mc-name");
      var modelTitle = el("strong", null, m.name);
      if (window.WhichAIBrands) {
        window.WhichAIBrands.setMark(modelTitle, m, m.name, { providerWordmark: true });
      }
      cell.appendChild(modelTitle);
      var open = el("button", "btn-link", deps.T("mcOpenGuide"));
      open.type = "button";
      open.addEventListener("click", function () { deps.openModel(m.id); });
      cell.appendChild(open);
      grid.appendChild(cell);
    });
    row(deps.T("mcProvider"), models.map(function (m) {
      if (!window.WhichAIBrands) return m.vendor;
      return window.WhichAIBrands.createMark(m.vendor, m.vendor, { wordmark: true, small: true }) || m.vendor;
    }));
    row(deps.T("mcStatus"), models.map(function (m) {
      var s = el("span", "chip chip-" + m.status, m.status);
      return s;
    }));
    row(deps.T("mcReleased"), models.map(function (m) { return specVal(m, "released"); }));
    row(deps.T("mcCtx"), models.map(function (m) { return specVal(m, "ctx"); }));
    row(deps.T("mcModal"), models.map(function (m) { return specVal(m, "modal"); }));
    row(deps.T("mcPrice"), models.map(function (m) {
      var p = priceText(m);
      var note = specVal(m, "note");
      return p ? p + (note ? " · " + note : "") : null;
    }));
    row(deps.T("mcSpeed"), models.map(function (m) { return specVal(m, "speed"); }));
    row(deps.T("mcAccess"), models.map(function (m) { return m.access; }));
    row(deps.T("mcStrengths"), models.map(function (m) {
      if (!m.labels || !m.labels.length) return null;
      var box = el("div", "db-chips");
      m.labels.forEach(function (l) { box.appendChild(el("span", "chip chip-label", l)); });
      return box;
    }));
    row(deps.T("mcReview"), models.map(function (m) { return m.review; }), "mc-review");
    table.appendChild(grid);
    table.appendChild(el("p", "router-meta", deps.T("mcFootnote")));
    root.appendChild(table);
  }

  var MC = {
    init: function (rootEl, dependencies) {
      root = rootEl;
      deps = dependencies;
      if (!sel) sel = loadSel();
      render();
    },
    rerender: function () { if (root && deps) render(); },
    /* preselect from elsewhere (e.g. Model guide) */
    compareWith: function (id) {
      if (!sel) sel = loadSel();
      if (sel.indexOf(id) === -1) { sel[1] = id; saveSel(); }
      if (root && deps) render();
    }
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIModelCompare = MC;
  if (typeof module !== "undefined" && module.exports) module.exports = MC;
})();
