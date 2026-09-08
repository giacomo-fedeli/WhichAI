/* Live public market data, independent of Actions and releases. No user text,
   identifiers or API keys are sent. Only the public feed is cached locally. */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  var KEY = "whichai_public_market_v1", HOUR = 3600000, MAX_AGE = 7 * 24 * HOUR;
  var saved = null, pending = null, checkedAt = 0, mounts = [], listening = false;
  var words = {
    liveTitle: "The live AI market", liveSubtitle: "Current routes, prices and source benchmarks. Updated automatically, without waiting for a release.",
    liveLoading: "Checking public sources…", liveFresh: "Source retrieved", liveStale: "Saved data · source currently unavailable", liveUnavailable: "Live source unavailable. The editorial catalog below remains available.",
    liveSearch: "Search live models", liveAll: "All routes", liveFree: "Zero token price", liveNewest: "Recently listed", livePrice: "Lowest input price", liveContext: "Largest context",
    liveRoutes: "routes", liveMore: "Show more", liveNoResults: "No routes match these filters.", liveInput: "Input / 1M", liveOutput: "Output / 1M", liveContextLabel: "Context", livePricingVaries: "Conditional or extra pricing", liveListed: "Listed", liveOpen: "View route",
    liveRankTitle: "Source leaderboards", liveRankSelect: "Choose benchmark", liveRankNote: "Scores relayed by OpenRouter. Each benchmark has its own scale. Measurement dates and methodology versions are not supplied: compare only within the selected table, not with the editorial snapshot.",
    liveNoRanks: "The source currently supplies no benchmark rows.", livePriceNote: "USD per 1M tokens on OpenRouter under default conditions. Listed availability does not guarantee uptime. Zero token pricing has usage limits; provider and extra charges can vary.",
    liveSource: "Source", liveRetry: "Check again", liveScore: "Score", liveModel: "Model", liveRank: "Rank", liveCoverage: "Coverage: models listed by OpenRouter. Listing date is not release date."
  };
  function validId(id) { return typeof id === "string" && /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:+-]*$/i.test(id) && id.length <= 180; }
  function usable(j) {
    if (!j || j.schemaVersion !== 1 || !Array.isArray(j.models) || !j.models.length || j.models.length > 10000 || !Array.isArray(j.leaderboards)) return false;
    var age = Date.now() - Date.parse(j.retrievedAt);
    return Number.isFinite(age) && age >= -300000 && age <= MAX_AGE && j.models.every(function (m) { return m && validId(m.id) && typeof m.name === "string" && m.pricePerMillion && Array.isArray(m.inputModalities); });
  }
  function restore() {
    if (saved) return;
    try { var raw = root.localStorage.getItem(KEY); if (raw && raw.length < 4000000) { var j = JSON.parse(raw); if (usable(j)) saved = j; } } catch (_) {}
  }
  function snapshot() {
    restore();
    if (!usable(saved)) return null;
    if (Date.now() > Date.parse(saved.refreshAfter) || saved.status !== "fresh") return Object.assign({}, saved, { status: "stale" });
    return saved;
  }
  function publish() { mounts = mounts.filter(function (m) { return m.el.isConnected !== false; }); mounts.forEach(paint); }
  function load(force) {
    restore();
    if (pending) return pending;
    if (!force && checkedAt && Date.now() - checkedAt < HOUR && snapshot()) return Promise.resolve(snapshot());
    if (typeof root.fetch !== "function" || typeof root.AbortController !== "function") return Promise.resolve(snapshot());
    var ctl = new root.AbortController(), timer = setTimeout(function () { ctl.abort(); }, 10000);
    checkedAt = Date.now();
    pending = root.fetch("/api/live", { signal: ctl.signal, credentials: "omit", headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("unavailable"); return r.json(); })
      .then(function (j) {
        if (!usable(j)) throw new Error("unavailable");
        saved = j;
        try { root.localStorage.setItem(KEY, JSON.stringify(j)); } catch (_) {}
        return snapshot();
      }).catch(function () { if (saved) saved = Object.assign({}, saved, { status: "stale" }); return snapshot(); })
      .then(function (j) { clearTimeout(timer); pending = null; publish(); return j; });
    return pending;
  }
  function el(tag, cls, value) {
    var node = document.createElement(tag); if (cls) node.className = cls;
    if (value != null) node.textContent = String(value); return node;
  }
  function T(m, key) { var s = m.deps.T && m.deps.T(key); return s && s !== key ? s : (words[key] || key); }
  function link(label, href, cls) {
    var a = el("a", cls, label); a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer"; return a;
  }
  function date(value) { var n = Date.parse(value); return Number.isFinite(n) ? new Date(n).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-"; }
  function money(value) { return typeof value === "number" && Number.isFinite(value) ? "$" + value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "-"; }
  function count(value) { return typeof value === "number" && value > 0 ? value.toLocaleString() : "-"; }
  function addSelect(m, name, values, selected, onChange) {
    var label = el("label", "live-field", T(m, name)), select = el("select"); select.setAttribute("aria-label", T(m, name));
    values.forEach(function (v) { var option = el("option", "", v[1]); option.value = v[0]; select.appendChild(option); });
    select.value = selected; select.addEventListener("change", function () { onChange(select.value); }); label.appendChild(select); return label;
  }
  function paintResults(m) {
    var j = snapshot(), results = m.el.querySelector(".live-results"); if (!results || !j) return;
    results.textContent = "";
    var q = m.query.toLowerCase(), routes = j.models.filter(function (r) {
      return (!m.free || r.free === true) && (!q || (r.name + " " + r.id + " " + r.inputModalities.join(" ")).toLowerCase().includes(q));
    });
    routes.sort(function (a, b) {
      if (m.sort === "price") return (a.pricePerMillion.input == null ? Infinity : a.pricePerMillion.input) - (b.pricePerMillion.input == null ? Infinity : b.pricePerMillion.input) || a.name.localeCompare(b.name);
      if (m.sort === "context") return (b.contextTokens || 0) - (a.contextTokens || 0);
      return String(b.addedAt).localeCompare(String(a.addedAt)) || a.name.localeCompare(b.name);
    });
    var summary = el("p", "router-meta live-count", routes.length + " " + T(m, "liveRoutes")); summary.setAttribute("aria-live", "polite"); results.appendChild(summary);
    var grid = el("div", "live-grid");
    routes.slice(0, m.limit).forEach(function (r) {
      var card = el("article", "live-model"); card.appendChild(el("p", "live-vendor", r.vendor)); card.appendChild(el("h4", "", r.name.replace(/^[^:]+:\s*/, "")));
      var spec = el("dl", "live-spec");
      [["liveInput", money(r.pricePerMillion.input)], ["liveOutput", money(r.pricePerMillion.output)], ["liveContextLabel", count(r.contextTokens)]].forEach(function (v) { spec.appendChild(el("dt", "", T(m, v[0]))); spec.appendChild(el("dd", "", v[1])); });
      card.appendChild(spec);
      if (r.conditionalPricing || r.extraCosts) card.appendChild(el("small", "live-pricing-note", T(m, "livePricingVaries")));
      if (r.addedAt) card.appendChild(el("p", "router-meta", T(m, "liveListed") + " " + date(r.addedAt).split(", ").slice(0, 2).join(", ")));
      card.appendChild(link(T(m, "liveOpen") + " ↗", "https://openrouter.ai/" + r.id, "live-route-link")); grid.appendChild(card);
    });
    results.appendChild(grid);
    if (!routes.length) results.appendChild(el("p", "router-meta", T(m, "liveNoResults")));
    if (routes.length > m.limit) { var more = el("button", "btn ghost", T(m, "liveMore")); more.type = "button"; more.addEventListener("click", function () { m.limit += 12; paintResults(m); }); results.appendChild(more); }
  }
  function paintRanks(m) {
    var j = snapshot(), wrap = m.el.querySelector(".live-rankings"); if (!wrap || !j) return; wrap.textContent = "";
    wrap.appendChild(el("h3", "", T(m, "liveRankTitle")));
    wrap.appendChild(el("p", "router-meta", T(m, "liveRankNote")));
    var groups = j.leaderboards.filter(function (g) { return g && typeof g.id === "string" && Array.isArray(g.entries) && g.entries.length; });
    if (!groups.length) { wrap.appendChild(el("p", "", T(m, "liveNoRanks"))); return; }
    var g = groups.filter(function (x) { return x.id === m.group; })[0] || groups[0]; m.group = g.id;
    wrap.appendChild(addSelect(m, "liveRankSelect", groups.map(function (x) { return [x.id, x.name]; }), g.id, function (v) { m.group = v; paintRanks(m); }));
    var box = el("div", "live-table-wrap"); box.tabIndex = 0; box.setAttribute("role", "region"); box.setAttribute("aria-label", g.name);
    var table = el("table", "live-table"), caption = el("caption", "", g.name + " · via OpenRouter"); table.appendChild(caption);
    var head = el("thead"), tr = el("tr"); ["liveRank", "liveModel", "liveScore"].forEach(function (key) { var th = el("th", "", T(m, key)); th.scope = "col"; tr.appendChild(th); }); head.appendChild(tr); table.appendChild(head);
    var body = el("tbody");
    g.entries.filter(function (e) { return e && validId(e.id) && typeof e.value === "number" && Number.isFinite(e.value); }).slice(0, 15).forEach(function (e) {
      var row = el("tr"); row.appendChild(el("td", "", e.rank)); var name = el("td"); name.appendChild(link(e.name, "https://openrouter.ai/" + e.id)); row.appendChild(name); row.appendChild(el("td", "live-score", e.value.toLocaleString(undefined, { maximumFractionDigits: 2 }))); body.appendChild(row);
    }); table.appendChild(body); box.appendChild(table); wrap.appendChild(box);
    var sourceUrl = g.publisher === "Artificial Analysis" ? "https://artificialanalysis.ai/" : "https://designarena.org/";
    wrap.appendChild(link(T(m, "liveSource") + ": " + g.publisher, sourceUrl, "router-meta"));
    wrap.appendChild(el("p", "router-meta", T(m, "liveCoverage")));
  }
  function paint(m) {
    var j = snapshot(); m.el.textContent = ""; m.el.classList.add("live-market");
    var header = el("div", "live-header"); header.appendChild(el("h2", "", T(m, "liveTitle"))); header.appendChild(el("p", "", T(m, "liveSubtitle"))); m.el.appendChild(header);
    var status = el("p", "live-status " + (j ? j.status : "unavailable")); status.setAttribute("role", "status");
    status.textContent = j ? T(m, j.status === "fresh" ? "liveFresh" : "liveStale") + " · " + date(j.retrievedAt) : T(m, pending ? "liveLoading" : "liveUnavailable"); m.el.appendChild(status);
    if (!j) { var retry = el("button", "btn ghost", T(m, "liveRetry")); retry.type = "button"; retry.disabled = !!pending; retry.addEventListener("click", function () { load(true); paint(m); }); m.el.appendChild(retry); return; }
    m.el.appendChild(el("p", "router-meta", T(m, "livePriceNote")));
    var toolbar = el("div", "live-toolbar"), searchLabel = el("label", "live-field live-search", T(m, "liveSearch")), search = el("input");
    search.type = "search"; search.value = m.query; search.placeholder = "GPT, Claude, Gemini…"; search.maxLength = 120; search.setAttribute("aria-label", T(m, "liveSearch"));
    search.addEventListener("input", function () { m.query = search.value; m.limit = 12; paintResults(m); }); searchLabel.appendChild(search); toolbar.appendChild(searchLabel);
    toolbar.appendChild(addSelect(m, "liveRoutes", [["all", T(m, "liveAll")], ["free", T(m, "liveFree")]], m.free ? "free" : "all", function (v) { m.free = v === "free"; m.limit = 12; paintResults(m); }));
    toolbar.appendChild(addSelect(m, "liveNewest", [["newest", T(m, "liveNewest")], ["price", T(m, "livePrice")], ["context", T(m, "liveContext")]], m.sort, function (v) { m.sort = v; m.limit = 12; paintResults(m); }));
    m.el.appendChild(toolbar); m.el.appendChild(el("div", "live-results")); m.el.appendChild(el("section", "live-rankings")); paintResults(m); paintRanks(m);
    m.el.appendChild(link(T(m, "liveSource") + ": OpenRouter", "https://openrouter.ai/docs/guides/overview/models", "router-meta"));
  }
  function render(target, deps) {
    if (!target) return;
    var m = mounts.filter(function (x) { return x.el === target; })[0];
    if (!m) { m = { el: target, deps: deps || {}, query: "", free: false, sort: "newest", limit: 12, group: "aa-intelligence" }; mounts.push(m); } else m.deps = deps || m.deps;
    load(); paint(m);
    if (!listening && typeof document !== "undefined") {
      listening = true;
      var refresh = function () { if (!document.hidden && mounts.some(function (x) { return x.el.isConnected; })) load(); };
      document.addEventListener("visibilitychange", refresh); root.addEventListener("online", function () { load(true); }); setInterval(refresh, HOUR);
    }
  }
  // Check a free default immediately before use. A removed route is never
  // replaced with a paid route or another model family without a user choice.
  function lookupFreeRoute(requested) {
    return load().then(function (j) {
      if (!j || j.status !== "fresh") return { status: "unknown", route: requested };
      var found = j.models.filter(function (m) { return m.id === requested; })[0];
      return found && found.free ? { status: "available", route: requested } : { status: "unavailable", route: null };
    });
  }
  var api = { render: render, load: load, snapshot: snapshot, lookupFreeRoute: lookupFreeRoute, words: words, usable: usable };
  root.WhichAILive = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
