/*
 * WhichAI - Model Radar (v0.36.0)
 *
 * Two streams side by side, both updating by themselves:
 *   - launches & changes: curated notes (js/changes.js) merged with every
 *     model the live catalog has seen arrive, with type filters, a personal
 *     watchlist and "since your last visit"
 *   - the news wire: GET /api/news (official lab blogs, TechCrunch AI,
 *     Hacker News stories with 100+ points, Hugging Face), titles and links
 *     only. The last good wire is kept in this browser so the column is never
 *     empty on a second visit; if the sources are down the launches stream is
 *     complete without it.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var deps = null; // { T, lang(), openModel(id), isWatched(id), toggleWatch(id), getSeen(), setSeen(iso) }
  var box = null;
  var small = typeof window !== "undefined" && window.innerWidth && window.innerWidth < 640;
  var FEED_STEP = small ? 5 : 8;
  var filter = "all", newsKind = "all", feedLimit = FEED_STEP, newsLimit = 10;
  var seenAtOpen = null;
  var wire = null, wireState = "idle"; // idle | loading | fresh | cached | down
  var NEWS_KEY = "whichai_news_v1";
  var NEWS_MAX_AGE = 3 * 86400000;

  function CH() { return root.WhichAIChanges || null; }
  function DB() { return root.PromptCompassModelsDB || null; }
  function T(k) { return deps && deps.T ? deps.T(k) : k; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function modelById(id) {
    var db = DB();
    if (!db || !id) return null;
    for (var i = 0; i < db.models.length; i++) if (db.models[i].id === id) return db.models[i];
    return null;
  }
  function safeHref(u) { return typeof u === "string" && /^https:\/\//.test(u) ? u : null; }

  var TYPE_META = {
    "new-model": { key: "radarTypeNew", cls: "rt-new" },
    "price": { key: "radarTypePrice", cls: "rt-price" },
    "score": { key: "radarTypeScore", cls: "rt-score" },
    "free-tier": { key: "radarTypeFree", cls: "rt-free" },
    "upcoming": { key: "radarUpcoming", cls: "rt-upcoming" }
  };
  var KINDS = [["all", "newsAll"], ["lab", "newsLabs"], ["press", "newsPress"], ["community", "newsCommunity"], ["open", "newsOpen"]];

  function ago(iso) {
    var t = Date.parse(iso);
    if (!isFinite(t)) return "";
    var s = (Date.now() - t) / 1000;
    var lang = deps && deps.lang ? deps.lang() : "en";
    var steps = [[3600, "minute", 60], [86400, "hour", 3600], [86400 * 30, "day", 86400], [Infinity, "month", 86400 * 30]];
    for (var i = 0; i < steps.length; i++) {
      if (s < steps[i][0]) {
        var v = -Math.max(1, Math.round(s / steps[i][2]));
        try { return new Intl.RelativeTimeFormat(lang, { numeric: "auto" }).format(v, steps[i][1]); }
        catch (e) { return Math.abs(v) + " " + steps[i][1] + "s ago"; }
      }
    }
    return "";
  }

  /* ---------- the newest arrival: the thread from the Compare chapter ---------- */

  function newest() {
    var db = DB();
    var arr = db && db.live && Array.isArray(db.live.arrivals) ? db.live.arrivals.slice() : [];
    arr = arr.filter(function (a) { return a && a.date && a.name; }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    if (arr.length) {
      var a = arr[0];
      return { name: a.name, vendor: a.vendor, date: a.date, aa: typeof a.aa === "number" ? a.aa : null, dbId: a.dbId || null };
    }
    var ch = CH();
    var past = ch ? ch.past().filter(function (c) { return c.type === "new-model" && c.dbId; }) : [];
    if (!past.length) return null;
    var m = modelById(past[0].dbId);
    return m ? { name: m.name, vendor: m.vendor, date: past[0].date, aa: m.score && !m.score.est ? m.score.aa : null, dbId: m.id } : null;
  }

  function fillNewest(node) {
    if (!node) return;
    var n = newest();
    node.textContent = "";
    node.hidden = !n;
    if (!n) return;
    node.appendChild(el("span", "pulse-dot", null));
    node.appendChild(el("span", "newest-kicker", T("radarLatest")));
    var name = el("strong", "newest-name");
    var m = n.dbId ? modelById(n.dbId) : null;
    var Br = root.WhichAIBrands;
    if (!(m && Br && Br.setMark(name, m, n.name, { small: true }))) name.textContent = n.name;
    node.appendChild(name);
    node.appendChild(el("span", "newest-meta", n.vendor + " · " + n.date + (n.aa != null ? " · AA " + n.aa : "")));
    if (n.dbId) {
      node.setAttribute("data-id", n.dbId);
      node.classList.add("is-link");
    }
  }

  /* ---------- launches & changes ---------- */

  function matches(c) {
    if (filter === "all") return true;
    if (filter === "following") return c.dbId && deps.isWatched(c.dbId);
    return c.type === filter;
  }

  function itemCard(c, isNew) {
    var card = el("article", "radar-item" + (isNew ? " radar-new" : ""));
    var head = el("div", "radar-item-head");
    var left = el("div", "radar-item-meta");
    left.appendChild(el("span", "radar-date", c.date));
    var tm = TYPE_META[c.type] || TYPE_META.score;
    left.appendChild(el("span", "chip radar-type " + tm.cls, T(tm.key)));
    if (isNew) left.appendChild(el("span", "chip radar-newchip", T("radarNew")));
    if (c.auto) left.appendChild(el("span", "chip chip-auto", T("liveAutoChip")));
    head.appendChild(left);
    if (c.dbId) {
      var on = deps.isWatched(c.dbId);
      var star = el("button", "radar-star" + (on ? " on" : ""), on ? "★" : "☆");
      star.type = "button";
      star.title = on ? T("radarUnfollow") : T("radarFollow");
      star.setAttribute("aria-label", star.title);
      star.setAttribute("aria-pressed", on ? "true" : "false");
      star.addEventListener("click", function () { deps.toggleWatch(c.dbId); renderFeed(); });
      head.appendChild(star);
    }
    card.appendChild(head);
    var title = el("h4", "radar-title");
    var m = c.dbId ? modelById(c.dbId) : null;
    if (m && root.WhichAIBrands) {
      var icon = root.WhichAIBrands.createIcon(m, "ai-brand-icon-sm");
      if (icon) title.appendChild(icon);
    }
    title.appendChild(document.createTextNode(c.title));
    card.appendChild(title);
    card.appendChild(el("p", "radar-note", c.note));
    var acts = el("div", "radar-acts");
    if (c.dbId && m) {
      var open = el("button", "btn-link", m.name + " →");
      open.type = "button";
      open.addEventListener("click", function () { deps.openModel(c.dbId); });
      acts.appendChild(open);
    }
    var href = c.src && safeHref(c.src.url);
    if (href) {
      var a = el("a", "btn-link muted", c.src.label + " ↗");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      acts.appendChild(a);
    }
    card.appendChild(acts);
    return card;
  }

  function renderFeed() {
    var col = box && box.querySelector(".radar-feed");
    if (!col) return;
    var ch = CH();
    col.textContent = "";
    var head = el("div", "radar-col-head");
    head.appendChild(el("h3", "radar-col-title", T("radarFeedTitle")));
    var unseen = ch ? ch.unseenCount(seenAtOpen) : 0;
    if (unseen > 0 && seenAtOpen) head.appendChild(el("span", "radar-since", unseen + " " + T("radarSince")));
    col.appendChild(head);

    var fRow = el("div", "chips-row radar-filters");
    [["all", "radarAll"], ["new-model", "radarTypeNew"], ["price", "radarTypePrice"], ["score", "radarTypeScore"], ["free-tier", "radarTypeFree"], ["following", "radarFollowing"]].forEach(function (f) {
      var b = el("button", "chip chip-toggle" + (filter === f[0] ? " chip-on" : ""), T(f[1]));
      b.type = "button";
      b.setAttribute("aria-pressed", filter === f[0] ? "true" : "false");
      b.addEventListener("click", function () { filter = f[0]; feedLimit = FEED_STEP; renderFeed(); });
      fRow.appendChild(b);
    });
    col.appendChild(fRow);

    var past = ch ? ch.past().filter(matches) : [];
    var list = el("div", "radar-list");
    if (!past.length) list.appendChild(el("p", "router-meta", T("radarEmpty")));
    past.slice(0, feedLimit).forEach(function (c) {
      list.appendChild(itemCard(c, seenAtOpen ? c.date > seenAtOpen : false));
    });
    col.appendChild(list);
    if (past.length > feedLimit) {
      var more = el("button", "btn-ghost radar-more", T("showMore") + " (" + (past.length - feedLimit) + ")");
      more.type = "button";
      more.addEventListener("click", function () { feedLimit += FEED_STEP; renderFeed(); if (root.WhichAIMotion) root.WhichAIMotion.refresh(); });
      col.appendChild(more);
    }
    var up = ch ? ch.upcoming().filter(matches) : [];
    if (up.length && filter !== "following") {
      col.appendChild(el("p", "radar-sec", T("radarUpcoming")));
      var upList = el("div", "radar-list");
      up.forEach(function (c) { upList.appendChild(itemCard(c, false)); });
      col.appendChild(upList);
    }
  }

  /* ---------- the news wire ---------- */

  function isWire(d) { return !!d && d.kind === "whichai-news" && d.schemaVersion === 1 && Array.isArray(d.items); }

  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(NEWS_KEY));
      if (c && isWire(c.wire) && Date.now() - Date.parse(c.wire.generatedAt) < NEWS_MAX_AGE) return c.wire;
    } catch (e) { /* ignore */ }
    return null;
  }
  function writeCache(w) {
    try { localStorage.setItem(NEWS_KEY, JSON.stringify({ wire: w })); } catch (e) { /* quota */ }
  }

  function loadNews() {
    if (wireState === "loading") return;
    var cached = readCache();
    if (cached) { wire = cached; wireState = "cached"; renderNews(); }
    var Api = root.WhichAIApi;
    if (!Api || typeof Api.get !== "function") { if (!wire) { wireState = "down"; renderNews(); } return; }
    if (!wire) { wireState = "loading"; renderNews(); }
    Api.get("/news", null, { timeout: 9000, fresh: true }).then(function (d) {
      if (d && isWire(d) && d.items.length) {
        wire = d;
        wireState = "fresh";
        writeCache(d);
      } else if (!wire) {
        wireState = "down";
      } else if (wireState === "loading") {
        wireState = "cached";
      }
      renderNews();
      if (root.WhichAIMotion) root.WhichAIMotion.refresh();
    });
  }

  function newsRow(it) {
    var row = el("article", "news-item news-" + (it.kind || "press"));
    var meta = el("div", "news-meta");
    meta.appendChild(el("span", "news-src", it.sourceName || it.source || ""));
    meta.appendChild(el("span", "news-when", ago(it.date)));
    row.appendChild(meta);
    var href = safeHref(it.url);
    var t = el(href ? "a" : "span", "news-title", it.title);
    if (href) { t.href = href; t.target = "_blank"; t.rel = "noopener noreferrer"; }
    row.appendChild(t);
    var extra = el("div", "news-extra");
    if (it.source === "hn" && typeof it.score === "number") extra.appendChild(el("span", "news-points", it.score + " " + T("newsPoints")));
    var disc = safeHref(it.discuss);
    if (disc && disc !== href) {
      var d = el("a", "news-discuss", T("newsDiscuss") + " ↗");
      d.href = disc; d.target = "_blank"; d.rel = "noopener noreferrer";
      extra.appendChild(d);
    }
    if (extra.children.length) row.appendChild(extra);
    return row;
  }

  function renderNews() {
    var col = box && box.querySelector(".radar-news");
    if (!col) return;
    col.textContent = "";
    var head = el("div", "radar-col-head");
    head.appendChild(el("h3", "radar-col-title", T("newsTitle")));
    var status = el("span", "news-status news-" + wireState);
    if (wire && wire.generatedAt) status.textContent = T("newsUpdated").replace("{when}", ago(wire.generatedAt));
    head.appendChild(status);
    col.appendChild(head);

    if (!wire || !wire.items.length) {
      col.appendChild(el("p", "news-empty" + (wireState === "loading" ? " is-loading" : ""), wireState === "loading" ? T("newsLoading") : T("newsDown")));
      return;
    }
    var kRow = el("div", "chips-row news-filters");
    KINDS.forEach(function (k) {
      var n = k[0] === "all" ? wire.items.length : wire.items.filter(function (i) { return i.kind === k[0]; }).length;
      if (!n) return;
      var b = el("button", "chip chip-toggle" + (newsKind === k[0] ? " chip-on" : ""), T(k[1]));
      b.type = "button";
      b.setAttribute("aria-pressed", newsKind === k[0] ? "true" : "false");
      b.addEventListener("click", function () { newsKind = k[0]; newsLimit = 10; renderNews(); });
      kRow.appendChild(b);
    });
    col.appendChild(kRow);
    var items = wire.items.filter(function (i) { return newsKind === "all" || i.kind === newsKind; });
    var list = el("div", "news-list");
    items.slice(0, newsLimit).forEach(function (it) { list.appendChild(newsRow(it)); });
    col.appendChild(list);
    if (items.length > newsLimit) {
      var more = el("button", "btn-ghost radar-more", T("showMore") + " (" + (items.length - newsLimit) + ")");
      more.type = "button";
      more.addEventListener("click", function () { newsLimit += 10; renderNews(); if (root.WhichAIMotion) root.WhichAIMotion.refresh(); });
      col.appendChild(more);
    }
    var down = (wire.sources || []).filter(function (s) { return !s.ok; }).map(function (s) { return s.name; });
    col.appendChild(el("p", "router-meta news-foot", T("newsFoot") + (down.length ? " " + T("newsSomeDown").replace("{list}", down.join(", ")) : "")));
  }

  /* ---------- the automated data check, shown where the data lives ---------- */

  function paintCheck(node) {
    if (!node || !root.WhichAIApi) return;
    root.WhichAIApi.get("/refresh").then(function (r) {
      if (!r) return;
      node.textContent = "";
      var dot = el("span", "api-dot", null);
      var when = r.generated ? new Date(r.generated) : null;
      var stamp = when && !isNaN(when) ? when.toISOString().slice(0, 10) : "";
      var label;
      if (r.skipped || r.severity === "unknown") { dot.className = "api-dot local"; label = T("radarCheckSkipped"); }
      else if (r.severity === "broken") { dot.className = "api-dot broken"; label = T("radarCheckBroken"); }
      else if (r.actionable > 0) { dot.className = "api-dot review"; label = r.actionable + " " + T("radarCheckReview"); }
      else { dot.className = "api-dot live"; label = T("radarCheckClean"); }
      node.appendChild(dot);
      node.appendChild(document.createTextNode(label + (stamp ? " · " + stamp : "")));
      node.title = (r.needsHuman || []).join(" · ");
      node.hidden = false;
    });
  }

  function render() {
    if (!box) return;
    box.textContent = "";
    var grid = el("div", "radar-grid");
    grid.appendChild(el("section", "radar-col radar-feed"));
    grid.appendChild(el("section", "radar-col radar-news"));
    box.appendChild(grid);
    var check = el("p", "radar-check");
    check.hidden = true;
    box.appendChild(check);
    renderFeed();
    renderNews();
    paintCheck(check);
  }

  if (root.addEventListener) {
    root.addEventListener("whichai:data", function () { if (box && deps) { renderFeed(); fillNewest(document.getElementById("radar-latest")); } });
  }

  var Radar = {
    init: function (rootEl, dependencies) {
      box = rootEl;
      deps = dependencies;
      if (seenAtOpen === null) seenAtOpen = deps.getSeen() || "";
      render();
      loadNews();
      deps.setSeen(new Date().toISOString().slice(0, 10));
    },
    rerender: function () { if (box && deps) { renderFeed(); renderNews(); } },
    newest: newest,
    fillNewest: fillNewest,
    _ago: ago
  };

  root.WhichAIRadar = Radar;
  if (typeof module !== "undefined" && module.exports) module.exports = Radar;
})();
