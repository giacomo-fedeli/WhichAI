/*
 * WhichAI - the page conductor (v0.37.0)
 *
 * One page, six chapters read top to bottom: the ranking, head to head, the
 * radar, the market, the debates and the tools. There is no menu to learn and
 * no cover to get past; a rail and the header say where you are, and each
 * chapter ends with a bridge that hands something to the next one.
 *
 * This file only wires things together: language and theme, the live data
 * pill, lazy mounting of each chapter, the bridges, the model drawer that any
 * chapter can open, links and old addresses, local data tools and the
 * service worker. The chapters live in their own modules.
 */
(function () {
  "use strict";

  var APP_VERSION = "v0.37";
  var BRAND = "WhichAI";
  var LANG_KEY = "pc_lang";
  var THEME_KEY = "pc_theme";
  var WATCH_KEY = "pc_watch_v1";
  var RADAR_SEEN_KEY = "pc_radar_seen";
  var PREFS_KEY = "pc_prefs_v1";

  var Engine = window.PromptCompassEngine;
  var I18n = window.PromptCompassI18n || null;
  var Motion = window.WhichAIMotion || null;
  var $ = function (id) { return document.getElementById(id); };

  var CHAPTERS = ["ranking", "compare", "radar", "market", "debates", "tools"];
  var CHAPTER_KEYS = { ranking: "navRanking", compare: "navCompare", radar: "navRadar", market: "navMarket", debates: "navTopics", tools: "navTools" };
  /* Addresses from earlier versions keep working: every old view has a home. */
  var LEGACY = {
    "guide": "ranking", "compare-specs": "compare", "compare-outputs": "compare", "merge": "prompt",
    "chains": "prompt", "arena": "compare", "live": "market", "topics": "debates", "finder": "find",
    "generator": "prompt", "settings": "data", "about-different": "about-diff", "about-freshness": "about-data",
    "about-methodology": "about-method", "glossary-view": "glossary"
  };

  /* ---------- language ---------- */

  var currentLang = "en";
  try { currentLang = localStorage.getItem(LANG_KEY) || "en"; } catch (e) { /* private mode */ }
  if (!I18n || !I18n.STRINGS[currentLang]) currentLang = "en";

  function T(key) { return I18n ? I18n.t(currentLang, key) : key; }
  function tl(task) {
    var v = I18n ? I18n.t(currentLang, "task_" + task) : null;
    return v || (Engine && Engine.TASK_TYPES[task] ? Engine.TASK_TYPES[task].label : task);
  }
  function lang() { return currentLang; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function setMark(node, subject, label, opts) {
    var B = window.WhichAIBrands;
    if (B && B.setMark(node, subject, label, opts)) return;
    node.textContent = label || "";
  }

  function applyStatic() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (n) {
      var v = T(n.getAttribute("data-i18n"));
      if (v) n.textContent = v.trim();
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-ph]"), function (n) {
      var v = T(n.getAttribute("data-i18n-ph"));
      if (v) n.setAttribute("placeholder", v);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-aria]"), function (n) {
      var v = T(n.getAttribute("data-i18n-aria"));
      if (v) n.setAttribute("aria-label", v);
    });
  }

  function applyLanguage(code) {
    currentLang = I18n && I18n.STRINGS[code] ? code : "en";
    try { localStorage.setItem(LANG_KEY, currentLang); } catch (e) { /* ignore */ }
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    var sel = $("lang-select");
    if (sel) sel.value = currentLang;
    applyStatic();
    var note = $("lang-note");
    if (note) {
      var txt = currentLang === "en" ? "" : T("langNote");
      note.textContent = txt;
      note.hidden = !txt;
    }
    $("foot-version").textContent = BRAND + " " + APP_VERSION;
    paintTheme();
    paintChapter(Motion && Motion.current ? Motion.current() : "ranking");
    paintLivePill();
    [window.WhichAIRanking, window.WhichAIModelCompare, window.WhichAIRadar, window.WhichAIMarket, window.WhichAITopics,
      window.WhichAIFinder, window.WhichAIDoctor, window.WhichAIStack].forEach(function (m) { if (m && m.rerender) m.rerender(); });
    if (window.WhichAIGenerator) window.WhichAIGenerator.relabel();
    if (window.WhichAISupport) window.WhichAISupport.relabel();
    if (mounted.debates) renderGlossary();
    fillBridges();
    var dr = $("drawer");
    if (dr && !dr.hidden && drawerModel && byId(drawerModel)) drawerContent(byId(drawerModel));
  }

  /* ---------- theme: light and dark, following the system until chosen ---------- */

  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintTheme() {
    var btn = $("theme-toggle");
    var t = currentTheme();
    if (btn) {
      btn.firstChild.textContent = t === "dark" ? "☀" : "☾";
      btn.setAttribute("aria-label", T("themeTip"));
      btn.title = T("themeTip");
    }
    var mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute("content", t === "dark" ? "#0c0e13" : "#f6f7f9");
  }
  function setTheme(t, animate) {
    var rootEl = document.documentElement;
    if (animate && !(Motion && Motion.reduced)) {
      rootEl.classList.add("theme-fade");
      setTimeout(function () { rootEl.classList.remove("theme-fade"); }, 450);
    }
    rootEl.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignore */ }
    paintTheme();
  }

  /* ---------- shared helpers handed to the chapters ---------- */

  function DB() { return window.PromptCompassModelsDB || null; }
  function byId(id) {
    var db = DB();
    if (!db) return null;
    for (var i = 0; i < db.models.length; i++) if (db.models[i].id === id) return db.models[i];
    return null;
  }
  function linkForModel(m) {
    var db = DB();
    if (!m || !db) return null;
    if (m.url) return m.url;
    if (m.family && db.links && db.links[m.family]) return db.links[m.family];
    if (db.vendorLinks && db.vendorLinks[m.vendor]) return db.vendorLinks[m.vendor];
    return null;
  }
  function linkForFamily(f) { var db = DB(); return db && db.links && db.links[f] ? db.links[f] : null; }
  function officialAnchor(url, label, primary) {
    var a = el("a", primary ? "btn-primary btn-official" : "btn-ghost btn-sm btn-official", label + " ↗");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  function copyText(text, btn) {
    var original = btn.textContent;
    function done() {
      btn.textContent = T("copied");
      btn.classList.add("copied");
      setTimeout(function () { btn.textContent = original; btn.classList.remove("copied"); }, 1600);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
      done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  function getWatchlist() { try { return JSON.parse(localStorage.getItem(WATCH_KEY)) || []; } catch (e) { return []; } }
  function isWatched(id) { return getWatchlist().indexOf(id) !== -1; }
  function toggleWatch(id) {
    var w = getWatchlist();
    var i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i, 1);
    try { localStorage.setItem(WATCH_KEY, JSON.stringify(w)); } catch (e) { /* ignore */ }
  }
  function getSeen() { try { return localStorage.getItem(RADAR_SEEN_KEY) || ""; } catch (e) { return ""; } }
  function setSeen(iso) { try { localStorage.setItem(RADAR_SEEN_KEY, iso); } catch (e) { /* ignore */ } }

  /* ---------- navigation: smooth, and never short of its target ---------- */

  var programmatic = 0;

  function resolveTarget(hash) {
    var id = String(hash || "").replace(/^#/, "");
    if (!id) return null;
    if (LEGACY[id]) id = LEGACY[id];
    return $(id) ? id : null;
  }

  /* Chapters render lazily. Before jumping, render everything up to the
     target, so nothing above it grows while the page is scrolling there. */
  function mountThrough(id) {
    var target = $(id);
    if (!target) return;
    var chapter = target.closest ? target.closest("[data-chapter]") : null;
    var last = chapter ? CHAPTERS.indexOf(chapter.getAttribute("data-chapter")) : CHAPTERS.length - 1;
    for (var i = 0; i <= last; i++) mountChapter(CHAPTERS[i]);
  }

  function scrollToId(id, smooth) {
    var target = $(id);
    if (!target) return;
    mountThrough(id);
    if (target.tagName === "DETAILS") target.open = true;
    var parentDetails = target.parentElement && target.parentElement.closest ? target.parentElement.closest("details") : null;
    if (parentDetails) parentDetails.open = true;
    programmatic = Date.now();
    /* "instant", not "auto": auto follows the stylesheet's smooth scrolling,
       and a deep link should open where it points, not travel there. Older
       engines reject the value, hence the plain fallback. */
    var behavior = smooth && !(Motion && Motion.reduced) ? "smooth" : "instant";
    if (target.scrollIntoView) {
      try { target.scrollIntoView({ behavior: behavior, block: "start" }); } catch (e) { target.scrollIntoView(true); }
    }
  }

  function navigate(hash, opts) {
    opts = opts || {};
    var h = String(hash || "");
    if (/^#model=/.test(h)) { openModel(decodeURIComponent(h.slice(7))); return; }
    if (/^#goal=/.test(h)) {
      var goal = "";
      try { goal = decodeURIComponent(h.slice(6)); } catch (e) { goal = ""; }
      mountChapter("tools");
      if (window.WhichAIGenerator) window.WhichAIGenerator.setGoal(goal.slice(0, 600));
      scrollToId("prompt", opts.smooth);
      setTimeout(function () { var g = $("goal"); if (g && g.focus) g.focus({ preventScroll: true }); }, 400);
      return;
    }
    if (/^#compare=/.test(h)) {
      /* /#compare=a,b (the wiki's "compare them live" links): load the pair. */
      var ids = [];
      try { ids = decodeURIComponent(h.slice(9)).split(","); } catch (e) { ids = []; }
      mountChapter("compare");
      if (window.WhichAIModelCompare) window.WhichAIModelCompare.setModels(ids.filter(byId).slice(0, 3));
      h = "#compare";
    }
    var id = resolveTarget(h);
    if (!id) return;
    if (opts.push && history.pushState) history.pushState(null, "", "#" + id);
    else if (history.replaceState && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    scrollToId(id, opts.smooth !== false);
  }

  function paintChapter(id) {
    var box = $("topbar-chapter");
    if (!box || !id) return;
    var idx = CHAPTERS.indexOf(id);
    box.firstChild.textContent = (idx < 9 ? "0" : "") + (idx + 1);
    box.lastChild.textContent = T(CHAPTER_KEYS[id] || "navRanking");
  }

  /* ---------- the model drawer ---------- */

  var drawerReturn = null;
  var drawerHashBefore = "";
  var drawerModel = null;

  function chip(text, cls) { return el("span", "chip " + cls, text); }

  function drawerContent(m) {
    var body = $("drawer-body");
    body.textContent = "";
    var R = window.WhichAIRanking;
    var head = el("div", "dr-head");
    var name = el("h2", "dr-name");
    setMark(name, m, m.name, { className: "ai-brand-lockup", providerWordmark: true });
    head.appendChild(name);
    head.appendChild(el("p", "dr-vendor", m.vendor + (m.status !== "public" ? " · " + m.status : "")));
    var badges = el("div", "dr-badges");
    if (m.score && typeof m.score.aa === "number") {
      var sc = el("span", "badge badge-strong", "AA " + (m.score.est ? "~" : "") + m.score.aa);
      if (m.score.src === "aa") sc.title = "Official Artificial Analysis Intelligence Index" + (m.score.at ? ", read " + m.score.at : "");
      else if (m.score.src === "converted") sc.title = "Converted from an older snapshot scale: never ranked.";
      badges.appendChild(sc);
      var info = R && !m.score.est ? R.tierOf(m.id) : null;
      if (info) {
        badges.appendChild(el("span", "badge tier-badge tier-" + info.tier, T("tier" + info.tier) + " · " + info.tier));
        var rk = el("span", "badge badge-rank", "#" + info.rank + " / " + info.total);
        rk.title = T("drawerRankTip");
        badges.appendChild(rk);
      }
    } else if (m.score && typeof m.score.guess === "number") {
      var un = el("span", "badge badge-unmeasured", T("rankUnmeasured") + " · ~" + m.score.guess);
      un.title = "No public index score exists for this model yet. The figure is a WhichAI estimate shown for context only, excluded from every ranking, chart and recommendation.";
      badges.appendChild(un);
    } else {
      badges.appendChild(el("span", "badge", T("rankUnmeasured")));
    }
    head.appendChild(badges);
    body.appendChild(head);

    var chips = el("div", "db-chips");
    if (m.auto) { var ac = chip(T("liveAutoChip"), "chip-auto"); ac.title = T("liveAutoTitle"); chips.appendChild(ac); }
    (m.tags || []).forEach(function (t) { if (t !== m.status && t !== "info-only") chips.appendChild(chip(t === "prompt-target" ? T("chipPromptTarget") : t, "chip-" + t)); });
    (m.labels || []).forEach(function (l) { chips.appendChild(chip(l, "chip-label")); });
    body.appendChild(chips);

    var specs = el("div", "db-specs");
    function spec(label, value) {
      if (value == null || value === "") return;
      var c = el("div", "db-spec");
      c.appendChild(el("b", null, label));
      c.appendChild(document.createTextNode(String(value)));
      specs.appendChild(c);
    }
    var s = m.spec || {};
    spec(T("mcReleased"), s.released);
    spec(T("mcCtx"), s.ctx);
    spec(T("mcModal"), s.modal);
    spec(T("mcSpeed"), s.speed);
    if (s.priceIn != null && s.priceOut != null) {
      spec(T("mcPrice"), "$" + s.priceIn + " / $" + s.priceOut + (s.priceSrc ? " (" + s.priceSrc + ")" : "") +
        (m.priceWas ? " · " + T("drawerWas") + " $" + m.priceWas[0] + " / $" + m.priceWas[1] : "") + (s.note ? " · " + s.note : ""));
    } else if (s.note) spec("Note", s.note);
    if (specs.children.length) body.appendChild(specs);

    if (m.score && m.score.src === "aa") {
      body.appendChild(el("p", "router-meta dr-official", "Artificial Analysis, official" + (m.score.at ? " (read " + m.score.at + ")" : "") + ": Intelligence " + m.score.aa +
        (m.score.coding != null ? " · Coding " + m.score.coding : "") + (m.score.agentic != null ? " · Agentic " + m.score.agentic : "") + "."));
    }
    if (m.score && m.score.cat) {
      var bars = el("div", "cat-bars");
      [["coding", "Coding"], ["reasoning", "Reasoning"], ["writing", "Writing"], ["agents", "Agents & tools"]].forEach(function (c) {
        var v = m.score.cat[c[0]];
        if (v == null) return;
        var row = el("div", "cat-row");
        row.appendChild(el("span", "cat-label", c[1]));
        var track = el("span", "cat-track");
        var fill = el("span", "cat-fill");
        fill.style.setProperty("--w", Math.max(2, Math.min(100, v)) + "%");
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el("span", "cat-val", String(v)));
        bars.appendChild(row);
      });
      body.appendChild(bars);
      body.appendChild(el("p", "router-meta", T("drawerCatNote")));
    }
    if (m.access) body.appendChild(el("p", "dr-access", m.access));
    if (m.review) body.appendChild(el("p", "dr-review", m.review));
    if (m.score && m.score.est) {
      body.appendChild(el("p", "router-meta", m.score.src === "converted"
        ? "The score shown (~) is converted from an older snapshot scale (it read " + m.score.was + " there): no current official number exists, so it is never ranked. It updates by itself when one appears."
        : "The score shown is a WhichAI estimate - not an official measurement, never ranked."));
    }

    var acts = el("div", "dr-actions");
    var cmp = el("button", "btn-primary", T("drawerCompare"));
    cmp.type = "button";
    cmp.addEventListener("click", function () {
      closeDrawer(true);
      mountChapter("compare");
      if (window.WhichAIModelCompare) window.WhichAIModelCompare.compareWith(m.id);
      navigate("#compare", { push: true });
    });
    acts.appendChild(cmp);
    if (m.family && (m.tags || []).indexOf("prompt-target") !== -1) {
      var use = el("button", "btn-ghost", T("drawerPrompt"));
      use.type = "button";
      use.addEventListener("click", function () {
        closeDrawer(true);
        mountChapter("tools");
        if (window.WhichAIGenerator) window.WhichAIGenerator.useModel(m.family);
        navigate("#prompt", { push: true });
      });
      acts.appendChild(use);
    }
    var star = el("button", "btn-ghost radar-star" + (isWatched(m.id) ? " on" : ""));
    star.type = "button";
    function paintStar() { star.textContent = (isWatched(m.id) ? "★ " + T("radarUnfollow") : "☆ " + T("radarFollow")); star.classList.toggle("on", isWatched(m.id)); }
    paintStar();
    star.addEventListener("click", function () { toggleWatch(m.id); paintStar(); if (window.WhichAIRadar) window.WhichAIRadar.rerender(); });
    acts.appendChild(star);
    var url = linkForModel(m);
    if (url) acts.appendChild(officialAnchor(url, T("officialSite"), false));
    var wiki = el("a", "btn-link", T("drawerWiki") + " ↗");
    wiki.href = "/models/" + encodeURIComponent(m.id) + ".html";
    acts.appendChild(wiki);
    body.appendChild(acts);
    var db = DB();
    if (db) body.appendChild(el("p", "router-meta dr-scale", db.scaleNote + (db.specNote ? " " + db.specNote : "")));
  }

  function openModel(id) {
    var m = byId(id);
    var d = $("drawer");
    if (!m || !d) return;
    drawerModel = m.id;
    drawerContent(m);
    if (d.hidden) {
      drawerReturn = document.activeElement;
      drawerHashBefore = /^#model=/.test(location.hash) ? "" : location.hash;
    }
    $("drawer-backdrop").hidden = false;
    d.hidden = false;
    document.body.classList.add("drawer-open");
    requestAnimationFrame(function () { d.classList.add("is-open"); $("drawer-backdrop").classList.add("is-open"); });
    if (history.replaceState) history.replaceState(null, "", "#model=" + encodeURIComponent(m.id));
    setTimeout(function () { var c = $("drawer-close"); if (c && c.focus) c.focus({ preventScroll: true }); }, 30);
  }

  function closeDrawer(silent) {
    var d = $("drawer");
    if (!d || d.hidden) return;
    d.classList.remove("is-open");
    $("drawer-backdrop").classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    var finish = function () { d.hidden = true; $("drawer-backdrop").hidden = true; };
    if (Motion && Motion.reduced) finish(); else setTimeout(finish, 260);
    if (history.replaceState) history.replaceState(null, "", drawerHashBefore || location.pathname + location.search);
    if (!silent && drawerReturn && drawerReturn.focus) { try { drawerReturn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }

  function trapFocus(e) {
    var d = $("drawer");
    if (!d || d.hidden || e.key !== "Tab") return;
    var f = d.querySelectorAll("button, a[href], select, input, textarea, [tabindex]:not([tabindex='-1'])");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- the bridges: what each chapter hands to the next ---------- */

  function tokenModel(m, extra) {
    var t = el("span", "token-chip");
    var B = window.WhichAIBrands;
    var icon = B && B.createIcon(m, "ai-brand-icon-sm");
    if (icon) t.appendChild(icon);
    t.appendChild(el("span", "token-name", m.name));
    if (extra) t.appendChild(el("span", "token-val", extra));
    return t;
  }

  function fillBridges() {
    var R = window.WhichAIRanking;
    var duel = $("bridge-duel");
    if (duel && R) {
      duel.textContent = "";
      var pair = R.topPair().map(byId).filter(Boolean);
      pair.forEach(function (m, i) {
        if (i) duel.appendChild(el("span", "token-vs", "vs"));
        duel.appendChild(tokenModel(m, "AA " + m.score.aa));
      });
    }
    var nw = $("bridge-newest");
    var Rd = window.WhichAIRadar;
    if (nw && Rd) {
      nw.textContent = "";
      var n = Rd.newest();
      if (n) {
        nw.appendChild(el("span", "pulse-dot", null));
        var m2 = n.dbId ? byId(n.dbId) : null;
        nw.appendChild(m2 ? tokenModel(m2, n.date) : el("span", "token-name", n.name + " · " + n.date));
      }
    }
    var pr = $("bridge-price");
    if (pr && R) {
      pr.textContent = "";
      var lead = R.tiers("aa", false).list[0];
      if (lead && lead.spec && typeof lead.spec.priceIn === "number") {
        pr.appendChild(tokenModel(lead, "$" + lead.spec.priceIn + " / $" + lead.spec.priceOut));
        pr.appendChild(el("span", "token-unit", T("mkPer1M")));
      }
    }
    var deb = $("bridge-debate");
    var Tp = window.WhichAITopics;
    if (deb && Tp && Tp.TOPICS && Tp.TOPICS[0]) {
      deb.textContent = "";
      var num = Tp.TOPICS[0].numbers[0];
      deb.appendChild(el("strong", "token-big", num.v));
      deb.appendChild(el("span", "token-cap", num.label));
    }
    var task = $("bridge-task");
    var F = window.WhichAIFinder;
    if (task && F && F.TASK_ICONS) {
      task.textContent = "";
      ["writing", "coding", "research", "analysis"].forEach(function (k) {
        var t = el("span", "token-task");
        var ic = el("span", "token-task-icon");
        ic.innerHTML = F.TASK_ICONS[k];
        t.appendChild(ic);
        t.appendChild(el("span", null, tl(k)));
        task.appendChild(t);
      });
    }
    if (Motion) Motion.refresh();
  }

  /* ---------- chapters, mounted when the reader gets near them ---------- */

  var mounted = {};
  var MOUNTS = {
    ranking: function () {
      window.WhichAIRanking.init({
        controls: $("rank-controls"), tiers: $("tier-list"), note: $("tier-note"), scatter: $("scatter"),
        search: $("rank-search"), results: $("rank-results"), kpis: $("rank-kpis"), summary: $("rank-summary")
      }, { T: T, openModel: openModel });
    },
    compare: function () {
      window.WhichAIModelCompare.init($("vs-stage"), $("vs-body"), {
        T: T, lang: lang, openModel: openModel,
        topPair: function () { return window.WhichAIRanking ? window.WhichAIRanking.topPair() : []; }
      });
    },
    radar: function () {
      window.WhichAIRadar.init($("radar-wrap"), { T: T, lang: lang, openModel: openModel, isWatched: isWatched, toggleWatch: toggleWatch, getSeen: getSeen, setSeen: setSeen });
      window.WhichAIRadar.fillNewest($("radar-latest"));
    },
    market: function () {
      window.WhichAIMarket.init($("market-wrap"), { T: T, lang: lang, openModel: openModel });
    },
    debates: function () {
      window.WhichAITopics.init($("topics-wrap"), { T: T });
      renderGlossary();
    },
    tools: function () {
      var F = window.WhichAIFinder;
      var G = window.WhichAIGenerator;
      var toPrompt = function (family, task) {
        if (G) G.useModel(family, task);
        navigate("#prompt", { push: true });
        setTimeout(function () { var g = $("goal"); if (g && g.focus) g.focus({ preventScroll: true }); }, 450);
      };
      if (F) {
        F.initQuick($("quick-wrap"), { T: T, useModel: toPrompt, focusGuided: function () { scrollToId("finder-wrap", true); } });
        F.init($("finder-wrap"), {
          T: T, openModel: openModel, useModel: toPrompt,
          switchToGoal: function (task) { toPrompt(null, task); }
        });
      }
      if (G) G.init({
        T: T, tl: tl, copy: copyText, officialAnchor: officialAnchor, linkForFamily: linkForFamily,
        toDoctor: function (text) {
          if (window.WhichAIDoctor) window.WhichAIDoctor.load(text);
          navigate("#doctor", { push: true });
        }
      });
      if (window.WhichAIDoctor) window.WhichAIDoctor.init($("doctor-wrap"), {
        T: T, copy: copyText,
        useInGenerator: function (text) {
          if (G) G.setGoal(text);
          navigate("#prompt", { push: true });
        }
      });
      if (window.WhichAIStack) window.WhichAIStack.init($("stack-wrap"), {
        T: T, openModel: openModel, openFinder: function () { navigate("#find", { push: true }); }
      });
    }
  };

  function mountChapter(id) {
    if (mounted[id] || !MOUNTS[id]) return;
    mounted[id] = true;
    try { MOUNTS[id](); } catch (e) { if (window.console) console.error("[WhichAI] " + id + " failed to render:", e); }
    if (Motion) { Motion.reveal(document.getElementById(id)); Motion.refresh(); }
  }

  /* ---------- glossary (part of the debates chapter) ---------- */

  function renderGlossary() {
    var G = window.WhichAIGlossary;
    var list = $("glossary-list"), search = $("glossary-search"), count = $("glossary-count");
    if (!G || !list) return;
    function paint(q) {
      var terms = G.filter(q);
      list.textContent = "";
      if (count) count.textContent = terms.length + " " + T("glossCount");
      if (!terms.length) { list.appendChild(el("p", "router-meta", T("glossNoRes"))); return; }
      terms.forEach(function (t) {
        var d = el("details", "gl-item");
        d.appendChild(el("summary", null, t.term));
        d.appendChild(el("p", "gl-def", t.def));
        if (t.ex) d.appendChild(el("p", "gl-ex", t.ex));
        if (t.link) {
          var a = el("a", "gl-link", t.link.label + " →");
          a.href = t.link.hash;
          d.appendChild(a);
        }
        list.appendChild(d);
      });
    }
    if (search && !search.getAttribute("data-wired")) {
      search.setAttribute("data-wired", "1");
      search.addEventListener("input", function () { paint(search.value); if (Motion) Motion.refresh(); });
    }
    paint(search ? search.value : "");
  }

  /* ---------- live data: the pill, and redrawing what depends on it ---------- */

  function dataLine() {
    var db = DB() || {};
    var LC = window.WhichAILiveCatalog;
    if (db.live && db.live.at) {
      var auto = (db.models || []).filter(function (m) { return m.auto; }).length;
      var when = (LC && LC.ago(currentLang)) || db.updated;
      return T("liveDataLine").replace("{when}", when).replace("{n}", String(auto));
    }
    return T("snapshotLabel") + ": " + (db.updated || "n/a") + ".";
  }

  function paintLivePill() {
    var pill = $("live-pill"), txt = $("live-pill-text");
    var LC = window.WhichAILiveCatalog;
    var db = DB();
    if (!pill || !LC || !db || !db.live || !db.live.at) return;
    var ago = LC.ago(currentLang);
    if (txt) txt.textContent = T("livePill") + (ago ? " · " + ago : "");
    pill.title = dataLine();
    pill.hidden = false;
  }

  function onLiveData() {
    paintLivePill();
    if (mounted.ranking) window.WhichAIRanking.rerender();
    if (mounted.compare) window.WhichAIModelCompare.rerender();
    if (mounted.radar) { window.WhichAIRadar.rerender(); window.WhichAIRadar.fillNewest($("radar-latest")); }
    if (mounted.market) window.WhichAIMarket.rerender();
    if (mounted.tools && window.WhichAIFinder) window.WhichAIFinder.rerender();
    fillBridges();
  }

  /* ---------- your data: export, import, wipe ---------- */

  function pcKeys(store) {
    var out = [];
    try {
      for (var i = 0; i < store.length; i++) {
        var k = store.key(i);
        if (k && (k.indexOf("pc_") === 0 || k.indexOf("whichai_") === 0)) out.push(k);
      }
    } catch (e) { /* ignore */ }
    return out;
  }
  function status(msg, isError) {
    var s = $("data-status");
    if (!s) return;
    s.textContent = msg;
    s.classList.toggle("error", !!isError);
    s.hidden = false;
    setTimeout(function () { s.hidden = true; }, 3200);
  }
  function initDataTools() {
    var ex = $("data-export"), im = $("data-import"), wp = $("data-wipe"), fi = $("data-file"), pr = $("prefs-reset");
    if (!ex || !im || !wp || !fi) return;
    ex.addEventListener("click", function () {
      var dump = { app: "WhichAI", version: APP_VERSION, exported: new Date().toISOString(), local: {}, session: {} };
      pcKeys(localStorage).forEach(function (k) { dump.local[k] = localStorage.getItem(k); });
      pcKeys(sessionStorage).forEach(function (k) { dump.session[k] = sessionStorage.getItem(k); });
      var blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "whichai-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
    im.addEventListener("click", function () { fi.click(); });
    fi.addEventListener("change", function () {
      var f = fi.files && fi.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var dump = JSON.parse(reader.result);
          if (!dump || dump.app !== "WhichAI" || typeof dump.local !== "object") throw new Error("bad");
          if (!window.confirm(T("dataImportAsk"))) { fi.value = ""; return; }
          Object.keys(dump.local || {}).forEach(function (k) {
            /* API keys from older versions are not restored: nothing uses them any more. */
            if ((k.indexOf("pc_") === 0 || k.indexOf("whichai_") === 0) && k !== "pc_settings_v1") try { localStorage.setItem(k, dump.local[k]); } catch (e) { /* ignore */ }
          });
          status(T("dataImported"), false);
          setTimeout(function () { location.reload(); }, 900);
        } catch (e) { status(T("dataImportBad"), true); }
        fi.value = "";
      };
      reader.readAsText(f);
    });
    wp.addEventListener("click", function () {
      if (!window.confirm(T("dataWipeAsk"))) return;
      pcKeys(localStorage).forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
      pcKeys(sessionStorage).forEach(function (k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } });
      location.reload();
    });
    if (pr) pr.addEventListener("click", function () {
      try { localStorage.removeItem(PREFS_KEY); } catch (e) { /* ignore */ }
      status(T("prefsDone"), false);
    });
  }

  /* Older versions kept API keys for features that no longer exist. They are
     removed, not left behind in someone's browser. */
  function forgetRetiredKeys() {
    ["pc_settings_v1", "pc_keymode", "pc_comparisons_v1", "pc_chains_v1", "pc_genmode", "pc_arena_v1", "pc_merge_v1", "pc_mcmp_v1", "pc_journey_goal", "whichai_public_market_v1"].forEach(function (k) {
      try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- service worker: offline, and a gentle "new version" note ---------- */

  function showUpdateToast() {
    if ($("update-toast")) return;
    var t = el("div", "update-toast");
    t.id = "update-toast";
    t.setAttribute("role", "status");
    t.appendChild(el("span", null, T("updateReady")));
    var b = el("button", "btn-primary btn-sm", T("updateReload"));
    b.type = "button";
    b.addEventListener("click", function () { location.reload(); });
    t.appendChild(b);
    document.body.appendChild(t);
  }
  function registerSW() {
    if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      if (!reg) return;
      reg.addEventListener("updatefound", function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", function () { if (nw.state === "installed" && navigator.serviceWorker.controller) showUpdateToast(); });
      });
    }).catch(function () { /* optional: never block the app */ });
  }

  /* ---------- boot ---------- */

  function initLangTheme() {
    var sel = $("lang-select");
    if (I18n && sel) {
      I18n.LANGS.forEach(function (l) {
        var o = document.createElement("option");
        o.value = l.code;
        o.textContent = l.label;
        sel.appendChild(o);
      });
      sel.value = currentLang;
      sel.addEventListener("change", function () { applyLanguage(sel.value); });
    }
    var btn = $("theme-toggle");
    var t = document.documentElement.getAttribute("data-theme");
    if (t !== "dark" && t !== "light") document.documentElement.setAttribute("data-theme", "light");
    if (btn) btn.addEventListener("click", function () {
      btn.classList.remove("spin");
      void btn.offsetWidth;
      btn.classList.add("spin");
      setTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  function wireLinks() {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var h = a.getAttribute("href");
      if (h === "#" || a.target === "_blank") return;
      var id = resolveTarget(h);
      if (!id && !/^#(model|goal|compare)=/.test(h)) return;
      e.preventDefault();
      if (!$("drawer").hidden) closeDrawer(true);
      navigate(h, { push: true });
    });
    window.addEventListener("hashchange", function () { navigate(location.hash, { smooth: true }); });
    window.addEventListener("popstate", function () {
      if (/^#model=/.test(location.hash)) navigate(location.hash);
      else { if (!$("drawer").hidden) closeDrawer(true); var id = resolveTarget(location.hash); if (id) scrollToId(id, true); }
    });
    $("drawer-close").addEventListener("click", function () { closeDrawer(false); });
    $("drawer-backdrop").addEventListener("click", function () { closeDrawer(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("drawer").hidden) closeDrawer(false);
      trapFocus(e);
    });
    ["radar-latest", "mk-leader"].forEach(function (id) {
      var n = $(id);
      if (n) n.addEventListener("click", function () { var mid = n.getAttribute("data-id"); if (mid) openModel(mid); });
    });
  }

  function boot() {
    forgetRetiredKeys();
    initLangTheme();
    applyStatic();
    applyLanguage(currentLang);
    mountChapter("ranking");
    fillBridges();
    if (Motion) {
      Motion.onChapter(function (id) {
        paintChapter(id);
        /* The address follows the reading position, without new history
           entries and never while a jump or the drawer is in progress. */
        if (Date.now() - programmatic > 1200 && $("drawer").hidden && history.replaceState && location.hash !== "#" + id && !/^#(model|goal)=/.test(location.hash)) {
          if (id === "ranking" && !location.hash) return;
          history.replaceState(null, "", "#" + id);
        }
      });
      Motion.init();
      /* the dots behind the page: drawn from the same frames, scroll-driven */
      if (window.WhichAIDots) window.WhichAIDots.init($("dotfield"), Motion);
      CHAPTERS.slice(1).forEach(function (id) {
        var node = $(id);
        if (node) Motion.mount(node, function () { mountChapter(id); });
      });
    } else {
      CHAPTERS.forEach(mountChapter);
    }
    wireLinks();
    initDataTools();
    if (window.WhichAISupport) window.WhichAISupport.init({ T: T });
    if (window.WhichAILiveCatalog) {
      window.WhichAILiveCatalog.onChange(onLiveData);
      paintLivePill();
      setInterval(paintLivePill, 60000);
    }
    registerSW();
    if (location.hash) {
      var h = location.hash;
      /* Let the first paint settle, then go where the link pointed. */
      setTimeout(function () { navigate(h, { smooth: false }); }, 60);
    }
    window.WhichAIApp = { openModel: openModel, closeDrawer: closeDrawer, navigate: navigate, mount: mountChapter, version: APP_VERSION };
  }

  boot();
})();
