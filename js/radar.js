/*
 * WhichAI - Model Radar (v0.25.0)
 * "What changed since your last visit": curated feed from js/changes.js,
 * type filters, personal watchlist, upcoming events. 100% local.
 */
(function () {
  "use strict";

  var deps = null; // { T, openModel(id), isWatched(id), toggleWatch(id), getSeen(), setSeen(iso) }
  var root = null;
  var filter = "all";
  var seenAtOpen = null;

  function CH() { return window.WhichAIChanges || null; }
  function DB() { return window.PromptCompassModelsDB || null; }

  var TYPE_META = {
    "new-model": { key: "radarTypeNew", cls: "rt-new" },
    "price": { key: "radarTypePrice", cls: "rt-price" },
    "score": { key: "radarTypeScore", cls: "rt-score" },
    "free-tier": { key: "radarTypeFree", cls: "rt-free" },
    "upcoming": { key: "radarUpcoming", cls: "rt-upcoming" }
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function modelName(id) {
    var db = DB();
    if (!db) return id;
    var m = db.models.filter(function (x) { return x.id === id; })[0];
    return m ? m.name : id;
  }

  function modelById(id) {
    var db = DB();
    if (!db) return null;
    return db.models.filter(function (x) { return x.id === id; })[0] || null;
  }

  function itemCard(c, isNew) {
    var card = el("div", "card radar-item" + (isNew ? " radar-new" : ""));
    var head = el("div", "radar-item-head");
    var left = el("div", "radar-item-meta");
    left.appendChild(el("span", "radar-date", c.date));
    var tm = TYPE_META[c.type] || TYPE_META.score;
    left.appendChild(el("span", "chip radar-type " + tm.cls, deps.T(tm.key)));
    if (isNew) left.appendChild(el("span", "chip radar-newchip", deps.T("radarNew")));
    head.appendChild(left);
    if (c.dbId) {
      var star = el("button", "btn-link radar-star" + (deps.isWatched(c.dbId) ? " on" : ""));
      star.type = "button";
      star.textContent = deps.isWatched(c.dbId) ? "★ " + deps.T("radarUnfollow") : "☆ " + deps.T("radarFollow");
      star.addEventListener("click", function () {
        deps.toggleWatch(c.dbId);
        render();
      });
      head.appendChild(star);
    }
    card.appendChild(head);
    var title = el("p", "radar-title");
    var radarModel = c.dbId ? modelById(c.dbId) : null;
    if (radarModel && window.WhichAIBrands) {
      var radarIcon = window.WhichAIBrands.createIcon(radarModel, "ai-brand-icon-sm");
      if (radarIcon) title.appendChild(radarIcon);
    }
    title.appendChild(document.createTextNode(c.title));
    card.appendChild(title);
    card.appendChild(el("p", "radar-note", c.note));
    var acts = el("div", "compare-actions radar-acts");
    if (c.dbId) {
      var open = el("button", "btn-copy", modelName(c.dbId) + " →");
      open.type = "button";
      open.addEventListener("click", function () { deps.openModel(c.dbId); });
      acts.appendChild(open);
    }
    if (c.src && c.src.url) {
      var a = document.createElement("a");
      a.className = "btn-link";
      a.href = c.src.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = c.src.label + " ↗";
      acts.appendChild(a);
    }
    card.appendChild(acts);
    return card;
  }

  function matches(c) {
    if (filter === "all") return true;
    if (filter === "following") return c.dbId && deps.isWatched(c.dbId);
    return c.type === filter;
  }

  /* The automated data check, shown where the data lives. It runs on the
     server (Vercel Cron hits /api/refresh daily) so the answer is fresh
     without anyone opening a dashboard. If the endpoint is unreachable the
     line simply stays hidden: the feed below is local and complete either way. */
  function paintCheck(node) {
    if (!node || !window.WhichAIApi) return;
    window.WhichAIApi.get("/refresh").then(function (r) {
      if (!r) return;
      node.textContent = "";
      var dot = el("span", "api-dot", null);
      var when = r.generated ? new Date(r.generated) : null;
      var stamp = when && !isNaN(when) ? when.toISOString().slice(0, 10) : "";
      var label;
      if (r.skipped || r.severity === "unknown") {
        dot.className = "api-dot local";
        label = deps.T("radarCheckSkipped");
      } else if (r.severity === "broken") {
        dot.className = "api-dot broken";
        label = deps.T("radarCheckBroken");
      } else if (r.actionable > 0) {
        dot.className = "api-dot review";
        label = r.actionable + " " + deps.T("radarCheckReview");
      } else {
        dot.className = "api-dot live";
        label = deps.T("radarCheckClean");
      }
      node.appendChild(dot);
      node.appendChild(document.createTextNode(label + (stamp ? " \u00b7 " + stamp : "")));
      node.title = (r.needsHuman || []).join(" \u00b7 ");
      node.hidden = false;
    });
  }

  function render() {
    if (!root) return;
    var ch = CH();
    root.innerHTML = "";
    if (!ch) return;

    var head = el("div", "guide-head");
    head.appendChild(el("h1", null, deps.T("radarTitle")));
    head.appendChild(el("p", null, deps.T("radarSub")));
    var unseen = ch.unseenCount(seenAtOpen);
    if (unseen > 0) {
      var pill = el("p", "radar-since");
      pill.appendChild(el("strong", null, String(unseen)));
      pill.appendChild(document.createTextNode(" " + deps.T("radarSince")));
      head.appendChild(pill);
    }
    var checkLine = el("p", "radar-check");
    checkLine.hidden = true;
    head.appendChild(checkLine);
    root.appendChild(head);
    paintCheck(checkLine);

    // filters
    var fRow = el("div", "db-filters radar-filters");
    var filters = [["all", "radarAll"], ["new-model", "radarTypeNew"], ["price", "radarTypePrice"],
      ["score", "radarTypeScore"], ["free-tier", "radarTypeFree"], ["following", "radarFollowing"]];
    filters.forEach(function (f) {
      var b = el("button", "chip chip-toggle" + (filter === f[0] ? " chip-on" : ""), deps.T(f[1]));
      b.type = "button";
      b.setAttribute("aria-pressed", filter === f[0] ? "true" : "false");
      b.addEventListener("click", function () { filter = f[0]; render(); });
      fRow.appendChild(b);
    });
    root.appendChild(fRow);

    // upcoming
    var up = ch.upcoming().filter(matches);
    if (up.length && filter !== "following") {
      root.appendChild(el("p", "finder-block-title radar-sec", deps.T("radarUpcoming")));
      var upWrap = el("div", "radar-list");
      up.forEach(function (c) { upWrap.appendChild(itemCard(c, false)); });
      root.appendChild(upWrap);
    }

    // past feed
    var past = ch.past().filter(matches);
    var list = el("div", "radar-list radar-past");
    if (!past.length) {
      list.appendChild(el("p", "router-meta", deps.T("radarEmpty")));
    } else {
      past.forEach(function (c) {
        var isNew = seenAtOpen ? c.date > seenAtOpen : false;
        list.appendChild(itemCard(c, isNew));
      });
    }
    root.appendChild(list);

    root.appendChild(el("p", "router-meta radar-foot", "Curated with every data refresh; each entry links its source. Follow a model (★) to filter this feed."));
  }

  var Radar = {
    init: function (rootEl, dependencies) {
      root = rootEl;
      deps = dependencies;
      if (seenAtOpen === null) seenAtOpen = deps.getSeen() || "";
      render();
      deps.setSeen(new Date().toISOString().slice(0, 10));
    },
    rerender: function () { if (root && deps) render(); }
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIRadar = Radar;
  if (typeof module !== "undefined" && module.exports) module.exports = Radar;
})();
