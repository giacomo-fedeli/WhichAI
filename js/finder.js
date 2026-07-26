/*
 * WhichAI - Guided AI finder (v0.22.0)
 * Short adaptive questionnaire → transparent, rule-based recommendation.
 * No API calls: candidates and facts come from js/models-db.js and js/benchmarks.js,
 * every boost is explained in the "Why this pick" list. Question/answer copy is
 * English by design (same content policy as prompts and benchmarks).
 */
(function () {
  "use strict";

  var deps = null; // { T, openModel(id), useModel(family, task), switchToGoal() }
  var root = null;
  var state = null;

  function DB() { return window.PromptCompassModelsDB || null; }
  function Bench() { return window.PromptCompassBenchmarks || null; }

  function freshState() {
    return { step: 0, task: null, mode: null, budget: null, needs: [], extra: null };
  }

  /* ---------------- Questions ---------------- */

  var TASKS = ["writing", "coding", "research", "analysis", "brainstorming", "education", "business", "general"];

  function questions() {
    var qs = [
      { id: "task", title: "What do you need help with?", type: "single",
        options: TASKS.map(function (k) { return { v: k, label: deps.T("task_" + k) }; }) },
      { id: "mode", title: "How will you use it?", type: "single", options: [
        { v: "app", label: "A simple chat app", sub: "No setup, just type" },
        { v: "power", label: "Chat plus a few settings", sub: "Comfortable adding a free API key" },
        { v: "dev", label: "Developer / automation", sub: "API, code, scripts or agents" }
      ] },
      { id: "budget", title: "What can you spend?", type: "single", options: [
        { v: "free", label: "Nothing - free only" },
        { v: "low", label: "Up to about $20/month" },
        { v: "any", label: "Whatever gives the best results" }
      ] },
      { id: "needs", title: "Anything essential?", sub: "Pick any that apply - or none.", type: "multi", options: [
        { v: "web", label: "Current info from the web, with sources" },
        { v: "files", label: "Working with files or images" },
        { v: "privacy", label: "Extra privacy - local / open models welcome" },
        { v: "speed", label: "Speed matters more than depth" },
        { v: "long", label: "Very long documents" }
      ] }
    ];
    var extra = null;
    if (state.task === "coding") {
      extra = { id: "extra", title: "How should it help with code?", type: "single", options: [
        { v: "help", label: "Explain and write code with me in chat" },
        { v: "agent", label: "Work through tasks on its own", sub: "Agentic / repo-level work" }
      ] };
    } else if (state.task === "research") {
      extra = { id: "extra", title: "What kind of research?", type: "single", options: [
        { v: "quick", label: "Quick sourced answers" },
        { v: "deep", label: "Long, deep research reports" }
      ] };
    } else if (state.task === "writing") {
      extra = { id: "extra", title: "What kind of writing?", type: "single", options: [
        { v: "creative", label: "Creative - fiction, voice, style" },
        { v: "pro", label: "Professional - posts, emails, copy" }
      ] };
    }
    if (extra) qs.push(extra);
    return qs;
  }

  /* ---------------- Recommendation engine (transparent rules) ---------------- */

  var APP_META = {
    claude: { label: "Claude", bestFor: "polished writing, careful reasoning, long documents",
      limit: "No free API for auto-run; free-tier limits vary with demand.",
      models: { free: "sonnet-5", low: "claude-opus-5", any: "claude-opus-5", creative: "fable-5", devLow: "sonnet-5", devAny: "claude-opus-5" } },
    chatgpt: { label: "ChatGPT", bestFor: "all-round work, brainstorming, files and data tooling",
      limit: "Free tier has message caps; the strongest modes need Plus or Pro.",
      models: { free: "gpt-5-5", low: "gpt-5-5", any: "gpt-5-5-pro", devLow: "gpt-5-6-terra", devAny: "gpt-5-6-sol", devFree: "gpt-5-5" } },
    gemini: { label: "Gemini", bestFor: "generous free use, speed, Google Workspace",
      limit: "Less distinctive on creative voice; tied to a Google account.",
      models: { free: "gemini-3-5-flash", low: "gemini-3-1-pro", any: "gemini-3-1-pro", devLow: "gemini-3-5-flash", devAny: "gemini-3-1-pro", devFree: "gemini-3-5-flash" } },
    perplexity: { label: "Perplexity", bestFor: "current, sourced answers - a cited replacement for googling",
      limit: "Built for sourced answers, not long creative prose.",
      models: { free: "sonar", low: "sonar-pro", any: "sonar-pro" } }
  };

  var OPEN_OFFERS = {
    "qwen3-coder": { bestFor: "free auto-run coding via OpenRouter (1M context)", limit: "Free route is rate-limited (~20 req/min, 200/day)." },
    "glm-5-2": { bestFor: "the strongest open-weight coder, cheap on API hosts", limit: "No free hosted route on OpenRouter right now." },
    "kimi-k3": { bestFor: "frontier-level agentic and coding work at a third of US prices", limit: "Brand new - tooling still maturing; API is paid." },
    "nemotron-3-ultra": { bestFor: "free, extremely fast drafts and volume work via OpenRouter", limit: "A clear step below frontier quality." },
    "inkling": { bestFor: "full local control - open weights (Apache 2.0), multimodal", limit: "Needs serious hardware locally; below frontier quality." },
    "deepseek-v4-pro": { bestFor: "capable free chat app, open weights", limit: "Free chat runs on DeepSeek's servers - check its data policy; no free OpenRouter route." }
  };

  function recommend() {
    var bench = Bench();
    var db = DB();
    var scores = { claude: 0, chatgpt: 0, gemini: 0, perplexity: 0 };
    var why = { claude: [], chatgpt: [], gemini: [], perplexity: [] };
    var pts = [5, 3, 2, 1];

    var rec = bench ? bench.recommend(state.task) : null;
    if (rec) {
      rec.ranking.forEach(function (r, i) {
        if (scores[r.app] == null) return;
        scores[r.app] += pts[i] || 0;
        if (i === 0) why[r.app].push("Ranked #1 for this task in our benchmark router (snapshot " + bench.updated + ").");
        if (i === 1) why[r.app].push("Ranked #2 for this task in our benchmark router.");
      });
    }
    function boost(app, v, reason) { scores[app] += v; why[app].push(reason); }

    if (state.budget === "free") {
      boost("gemini", 2, "Most generous free tier of the big assistants.");
      boost("perplexity", 1, "Free tier includes unlimited basic cited searches.");
      boost("chatgpt", 1, "Solid free tier (message caps apply).");
      boost("claude", 0.5, "Free tier runs Claude Sonnet 5 - strong free quality.");
    }
    if (state.needs.indexOf("web") !== -1) {
      boost("perplexity", 4, "Purpose-built for cited, current answers.");
      boost("gemini", 1.5, "Deep Research allowance even on the free tier.");
    }
    if (state.needs.indexOf("files") !== -1) {
      boost("chatgpt", 1.5, "The most mature built-in tooling for uploaded files and data.");
      boost("gemini", 1, "Strong file and image handling.");
    }
    if (state.needs.indexOf("long") !== -1) {
      boost("claude", 1.5, "1M-token context and up to 128K tokens of output.");
      boost("gemini", 1, "1M-token context on every current tier.");
    }
    if (state.needs.indexOf("speed") !== -1) {
      boost("gemini", 1.5, "Gemini 3.5 Flash is near-instant and free.");
    }
    if (state.extra === "creative") boost("claude", 2, "Claude Fable 5 tops creative-writing boards for voice and subtext.");
    if (state.extra === "pro") boost("chatgpt", 1, "Strong at variants and turning notes into polished drafts.");
    if (state.extra === "agent") boost("chatgpt", 1.5, "GPT-5.6 Sol leads the Coding Agent Index (80).");
    if (state.extra === "help") boost("claude", 1, "Leads the toughest real-repo coding benchmarks.");
    if (state.extra === "deep") { boost("perplexity", 1, "Pro adds 20 Deep Research runs/day."); boost("gemini", 1, "Deep Research is bundled, with a free monthly allowance."); }

    var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });

    var offers = [];
    function appOffer(app) {
      var meta = APP_META[app];
      var mkey = state.budget;
      if (state.mode === "dev" && meta.models["dev" + (mkey === "any" ? "Any" : mkey === "low" ? "Low" : "Free")]) {
        mkey = "dev" + (mkey === "any" ? "Any" : mkey === "low" ? "Low" : "Free");
      }
      if (app === "claude" && state.extra === "creative" && state.budget !== "free") mkey = "creative";
      var dbId = meta.models[mkey] || meta.models.any;
      var m = db ? db.models.filter(function (x) { return x.id === dbId; })[0] : null;
      return {
        kind: "app", app: app, name: meta.label + (m ? " - " + m.name : ""), dbId: dbId, family: app,
        why: why[app].slice(0, 4), bestFor: meta.bestFor, limit: meta.limit,
        access: m ? m.access : "", score: m && m.score ? m.score : null
      };
    }
    function modelOffer(id, extraWhy) {
      var m = db ? db.models.filter(function (x) { return x.id === id; })[0] : null;
      if (!m) return null;
      var meta = OPEN_OFFERS[id] || {};
      return {
        kind: "model", name: m.name + " (" + m.vendor + ")", dbId: id, family: m.family,
        why: extraWhy, bestFor: meta.bestFor || "", limit: meta.limit || "",
        access: m.access, score: m.score || null
      };
    }

    ranked.forEach(function (app) { offers.push(appOffer(app)); });

    // Developer mode: open/API alternatives with a free or cheap route
    if (state.mode === "dev") {
      if (state.task === "coding") {
        if (state.budget === "free") offers.splice(1, 0, modelOffer("qwen3-coder", ["Runnable for free via OpenRouter - auto-run works right here in Compare/Chains."]));
        else offers.splice(1, 0, modelOffer("kimi-k3", ["#3 on the July 16 AA index (57.1) at $3/$15 per 1M tokens - a fraction of US frontier prices.", "Best published BrowseComp score and #1 Frontend Code Arena at launch."]));
      } else if (state.budget === "free") {
        offers.splice(2, 0, modelOffer("nemotron-3-ultra", ["Free on OpenRouter and extremely fast (400+ tok/s on some hosts) - auto-run works right here."]));
      }
    }
    // Privacy: local/open alternative always surfaces
    if (state.needs.indexOf("privacy") !== -1) {
      offers.splice(1, 0, modelOffer("inkling", ["Open weights under Apache 2.0 - you can run it entirely on your own hardware.", "Natively multimodal (text, image, audio) with a 1M context."]));
    }

    offers = offers.filter(Boolean);
    var seen = {};
    offers = offers.filter(function (o) { if (seen[o.dbId || o.name]) return false; seen[o.dbId || o.name] = true; return true; });
    return { top: offers[0], alts: offers.slice(1, 3) };
  }

  /* ---------------- Rendering ---------------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render() {
    if (!root) return;
    root.innerHTML = "";
    var qs = questions();
    var card = el("div", "card finder-card");

    var head = el("div", "finder-head");
    head.appendChild(el("h2", "finder-title", deps.T("finderTitle")));
    var dots = el("div", "finder-dots");
    var totalSteps = qs.length;
    for (var i = 0; i < totalSteps; i++) {
      var d = el("span", "finder-dot" + (i < state.step ? " done" : i === state.step ? " now" : ""));
      dots.appendChild(d);
    }
    if (state.step < totalSteps) head.appendChild(dots);
    card.appendChild(head);

    if (state.step >= totalSteps) {
      renderResults(card);
      root.appendChild(card);
      return;
    }
    if (state.step === 0) card.appendChild(el("p", "finder-sub", deps.T("finderSub")));

    var q = qs[state.step];
    card.appendChild(el("h3", "finder-q", q.title));
    if (q.sub) card.appendChild(el("p", "finder-qsub", q.sub));

    var opts = el("div", "finder-opts" + (q.id === "task" ? " finder-opts-grid" : ""));
    q.options.forEach(function (o) {
      var b = el("button", "finder-opt");
      b.type = "button";
      b.appendChild(el("span", "finder-opt-label", o.label));
      if (o.sub) b.appendChild(el("span", "finder-opt-sub", o.sub));
      if (q.type === "multi") {
        var on = state.needs.indexOf(o.v) !== -1;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.addEventListener("click", function () {
          var ix = state.needs.indexOf(o.v);
          if (ix === -1) state.needs.push(o.v); else state.needs.splice(ix, 1);
          render();
        });
      } else {
        b.addEventListener("click", function () {
          state[q.id] = o.v;
          state.step++;
          render();
        });
      }
      opts.appendChild(b);
    });
    card.appendChild(opts);

    var nav = el("div", "finder-nav");
    if (state.step > 0) {
      var back = el("button", "btn-link", deps.T("finderBack"));
      back.type = "button";
      back.addEventListener("click", function () { state.step--; render(); });
      nav.appendChild(back);
    }
    if (q.type === "multi") {
      var next = el("button", "btn-primary btn-inline", deps.T("finderNext"));
      next.type = "button";
      next.addEventListener("click", function () { state.step++; render(); });
      nav.appendChild(next);
    }
    card.appendChild(nav);
    root.appendChild(card);
  }

  function offerCard(offer, isTop) {
    var db = DB();
    var c = el("div", "card finder-result" + (isTop ? " finder-top" : ""));
    var head = el("div", "db-row-head");
    var name = el("span", "panel-model", offer.name);
    var brandedSubject = offer.family;
    if (offer.dbId && db) {
      for (var bi = 0; bi < db.models.length; bi++) {
        if (db.models[bi].id === offer.dbId) { brandedSubject = db.models[bi]; break; }
      }
    }
    if (window.WhichAIBrands) {
      window.WhichAIBrands.setMark(name, brandedSubject, offer.name, { providerWordmark: true });
    }
    head.appendChild(name);
    if (isTop) head.appendChild(el("span", "win-badge", deps.T("finderTop")));
    else if (offer.score && offer.score.aa) {
      head.appendChild(el("span", "badge", "AA " + (offer.score.est ? "~" : "") + offer.score.aa));
    }
    c.appendChild(head);
    if (isTop && offer.score && offer.score.aa) {
      c.appendChild(el("p", "router-meta", "AA index: " + (offer.score.est ? "~" : "") + offer.score.aa + (offer.score.est ? " (WhichAI estimate)" : " (July 16 snapshot)")));
    }
    if (offer.why && offer.why.length) {
      var whyTitle = el("p", "finder-block-title", deps.T("finderWhy"));
      c.appendChild(whyTitle);
      var ul = el("ul", "finder-why");
      offer.why.forEach(function (w) { ul.appendChild(el("li", null, w)); });
      c.appendChild(ul);
    }
    if (offer.bestFor) c.appendChild(el("p", "finder-line", deps.T("finderBestFor") + " " + offer.bestFor));
    if (offer.limit) c.appendChild(el("p", "finder-line finder-limit", deps.T("finderLimit") + " " + offer.limit));
    if (offer.access) c.appendChild(el("p", "finder-line router-free", deps.T("finderAccess") + " " + offer.access));

    var actions = el("div", "compare-actions finder-actions");
    if (offer.dbId && db) {
      var g = el("button", "btn-copy", deps.T("finderOpenGuide"));
      g.type = "button";
      g.addEventListener("click", function () { deps.openModel(offer.dbId); });
      actions.appendChild(g);
    }
    if (offer.family) {
      var u = el("button", isTop ? "btn-primary btn-inline" : "btn-copy", deps.T("finderUseGen"));
      u.type = "button";
      u.addEventListener("click", function () { deps.useModel(offer.family, state.task); });
      actions.appendChild(u);
      var DBx = window.PromptCompassModelsDB || null;
      var url = DBx && DBx.links ? DBx.links[offer.family] : null;
      if (url) {
        var oa = document.createElement("a");
        oa.className = "btn-copy btn-official";
        oa.href = url;
        oa.target = "_blank";
        oa.rel = "noopener";
        oa.textContent = deps.T("officialOpen") + " " + (offer.name.split(" - ")[0] || offer.name) + " \u2197";
        actions.appendChild(oa);
      }
    }
    c.appendChild(actions);
    return c;
  }

  function renderResults(card) {
    var res = recommend();
    card.appendChild(el("h3", "finder-q", deps.T("finderResults")));
    if (res.top) card.appendChild(offerCard(res.top, true));
    if (res.alts.length) {
      card.appendChild(el("p", "finder-block-title finder-alt-title", deps.T("finderAlt")));
      var grid = el("div", "finder-alts");
      res.alts.forEach(function (o) { grid.appendChild(offerCard(o, false)); });
      card.appendChild(grid);
    }
    if (state.needs.indexOf("privacy") !== -1) {
      card.appendChild(el("p", "router-meta", "Note: WhichAI itself runs entirely in your browser - no account, no server. For maximum privacy, open-weight models can run fully on your own hardware."));
    }
    card.appendChild(el("p", "router-meta", "Guidance from public benchmarks and vendor pages (snapshot July 16, 2026) plus transparent rules - not gospel. Sources are linked in the Model guide."));
    var nav = el("div", "finder-nav");
    var again = el("button", "btn-link", deps.T("finderRestart"));
    again.type = "button";
    again.addEventListener("click", function () { state = freshState(); render(); });
    nav.appendChild(again);
    var sw = el("button", "btn-link", deps.T("finderSwitchGoal"));
    sw.type = "button";
    sw.addEventListener("click", function () { deps.switchToGoal(); });
    nav.appendChild(sw);
    if (window.WhichAIShare && res.top) {
      var shareB = el("button", "btn-copy", deps.T("shareBtn"));
      shareB.type = "button";
      shareB.addEventListener("click", function () {
        var rows = [{ label: deps.T("finderTop"), value: res.top.name }];
        res.alts.forEach(function (o, i) { rows.push({ label: "Alt " + (i + 1), value: o.name }); });
        if (res.top.score && res.top.score.aa) rows.push({ label: "AA index", value: String((res.top.score.est ? "~" : "") + res.top.score.aa) + " (July 16 snapshot)" });
        window.WhichAIShare.share({
          title: "My AI pick: " + res.top.name.split(" - ")[0],
          subtitle: "Task: " + deps.T("task_" + state.task),
          badge: "AI Finder",
          rows: rows
        }, function () { shareB.textContent = deps.T("shareDone"); setTimeout(function () { shareB.textContent = deps.T("shareBtn"); }, 2200); });
      });
      nav.appendChild(shareB);
    }
    card.appendChild(nav);
  }

  var Finder = {
    init: function (rootEl, dependencies) {
      root = rootEl;
      deps = dependencies;
      if (!state) state = freshState();
      render();
    },
    rerender: function () { if (root && deps) render(); },
    /* exposed for tests */
    _recommend: function (answers) { state = answers; return recommend(); },
    _questions: function (answers) { state = answers; return questions(); }
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIFinder = Finder;
  if (typeof module !== "undefined" && module.exports) module.exports = Finder;
})();
