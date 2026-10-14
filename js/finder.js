/*
 * WhichAI - Guided AI finder (v0.36.0)
 * Two ways in, both rule-based and transparent:
 *   - quick answer: pick a task, get the router's best app with its reasons,
 *     free tier and sources (what the old Model guide cards showed, one at a time)
 *   - guided: a short adaptive questionnaire for a personal pick.
 * The task chosen in the quick answer carries into the guided questions.
 * No API calls: candidates and facts come from js/models-db.js and js/benchmarks.js,
 * every boost is explained in the "Why this pick" list. Question/answer copy is
 * English by design (same content policy as prompts and benchmarks).
 */
(function () {
  "use strict";

  /* Never hardcode the snapshot date: it rots at every data refresh. */
  function snapshotDate() {
    var db = window.PromptCompassModelsDB;
    return (db && db.updated) || "the current";
  }

  var deps = null; // { T, openModel(id), useModel(family, task), switchToGoal() }
  var root = null;
  var state = null;

  function DB() { return window.PromptCompassModelsDB || null; }
  function Bench() { return window.PromptCompassBenchmarks || null; }

  function freshState(started) {
    return { step: 0, task: null, mode: null, budget: null, needs: [], extra: null, started: !!started };
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
      limit: "No free API tier; free-tier limits in the app vary with demand.",
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
    "qwen3-coder": { bestFor: "open-weight coding with a 1M context, cheap on API hosts", limit: "Its free OpenRouter route was retired: paid routes or self-hosting only." },
    "glm-5-2": { bestFor: "the strongest open-weight coder, cheap on API hosts", limit: "No free hosted route on OpenRouter right now." },
    "kimi-k3": { bestFor: "frontier-level agentic and coding work at a third of US prices", limit: "Brand new - tooling still maturing; API is paid." },
    "nemotron-3-ultra": { bestFor: "free, extremely fast drafts and volume work via OpenRouter", limit: "A clear step below frontier quality." },
    "inkling": { bestFor: "full local control - open weights (Apache 2.0), multimodal", limit: "Needs serious hardware locally; below frontier quality." },
    "deepseek-v4-pro": { bestFor: "capable free chat app, open weights", limit: "Free chat runs on DeepSeek's servers - check its data policy; no free OpenRouter route." }
  };

  /* ---------- v0.35: picks that follow the live catalog ----------
     The strongest model of a maker, the best value, the best free route and
     the best open-weights model are looked up in the current catalog (kept
     fresh by js/live-catalog.js) instead of being typed here, where they went
     stale within weeks. Static ids remain only as the offline fallback. */

  var APP_VENDOR = { claude: "Anthropic", chatgpt: "OpenAI", gemini: "Google" };
  function appOf(vendor) { for (var a in APP_VENDOR) { if (APP_VENDOR[a] === vendor) return a; } return null; }
  function official(m) { return m && m.status === "public" && m.score && typeof m.score.aa === "number" && !m.score.est; }
  function blended(m) { var s = m.spec || {}; return s.priceIn != null && s.priceOut != null ? (3 * s.priceIn + s.priceOut) / 4 : null; }
  function liveBest(db, filter, key) {
    var best = null;
    (db ? db.models : []).forEach(function (m) {
      if (!official(m) || !filter(m)) return;
      var v = key ? key(m) : m.score.aa;
      if (typeof v !== "number") return;
      if (!best || v > best.v) best = { m: m, v: v };
    });
    return best ? best.m : null;
  }
  function vendorBest(db, vendor) { return liveBest(db, function (m) { return m.vendor === vendor; }); }
  function vendorValue(db, vendor) {
    var top = vendorBest(db, vendor);
    if (!top) return null;
    return liveBest(db, function (m) { return m.vendor === vendor && m.score.aa >= top.score.aa * 0.8 && blended(m) > 0; },
      function (m) { return m.score.aa / blended(m); });
  }
  function routeModel(db, routeId) {
    var base = String(routeId || "").replace(/:free$/, "");
    return (db ? db.models : []).filter(function (m) { return (m.or || []).indexOf(base) !== -1; })[0] || null;
  }
  function bestFreeRoute(db, family) {
    var routes = db && db.live && db.live.freeRoutes ? db.live.freeRoutes : [];
    for (var i = 0; i < routes.length; i++) {
      if (family && routes[i].family !== family) continue;
      var m = routeModel(db, routes[i].id);
      if (m) return { route: routes[i], model: m };
    }
    return null;
  }

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
        if (i === 0) why[r.app].push(r.live ? "Ranked #1 for this task: its best model, " + r.live.name + ", leads the makers on the live " + r.live.label + " index (" + r.live.value + ")." : "Ranked #1 for this task in our benchmark router.");
        if (i === 1) why[r.app].push("Ranked #2 for this task in our benchmark router.");
      });
    }
    function boost(app, v, reason) { scores[app] += v; why[app].push(reason); }

    if (state.budget === "free") {
      boost("gemini", 2, "Most generous free tier of the big assistants.");
      boost("perplexity", 1, "Free tier includes unlimited basic cited searches.");
      boost("chatgpt", 1, "Solid free tier (message caps apply).");
      boost("claude", 0.5, "Claude's free tier runs a Sonnet model - strong free quality.");
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
      boost("gemini", 1.5, "Gemini's Flash models are near-instant and free.");
    }
    if (state.extra === "creative") boost("claude", 2, "Anthropic's Fable line is built for creative writing: voice and subtext.");
    if (state.extra === "pro") boost("chatgpt", 1, "Strong at variants and turning notes into polished drafts.");
    if (state.extra === "agent") {
      var ag = liveBest(db, function (m) { return !!appOf(m.vendor); }, function (m) { return m.score.agentic; });
      if (ag) boost(appOf(ag.vendor), 1.5, "Best live Agentic Index among the big three right now: " + ag.name + " (" + ag.score.agentic + ").");
    }
    if (state.extra === "help") {
      var cd = liveBest(db, function (m) { return !!appOf(m.vendor); }, function (m) { return m.score.coding; });
      if (cd) boost(appOf(cd.vendor), 1, "Best live Coding Index among the big three right now: " + cd.name + " (" + cd.score.coding + ").");
      else boost("claude", 1, "Leads the toughest real-repo coding benchmarks.");
    }
    if (state.extra === "deep") { boost("perplexity", 1, "Pro adds daily Deep Research runs."); boost("gemini", 1, "Deep Research is bundled, with a free monthly allowance."); }

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
      /* "Whatever is best" and the developer tiers follow the live index;
         free tiers and the creative pick are product facts, kept editorial. */
      var vendor = APP_VENDOR[app];
      var liveM = null;
      if (vendor && (mkey === "any" || mkey === "devAny")) liveM = vendorBest(db, vendor);
      else if (vendor && mkey === "devLow") liveM = vendorValue(db, vendor);
      if (liveM) dbId = liveM.id;
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

    // Developer mode: open/API alternatives with a free or cheap route,
    // chosen from the live catalog (static ids only when it is unavailable)
    if (state.mode === "dev") {
      if (state.task === "coding") {
        if (state.budget === "free") {
          var fr = bestFreeRoute(db);
          offers.splice(1, 0, fr ? modelOffer(fr.model.id, ["Free on OpenRouter right now (" + fr.route.id + ")" + (fr.route.aa != null ? ", AA " + fr.route.aa : "") + ": call it from your own code at no cost, within the route's rate limits."])
            : modelOffer("nemotron-3-ultra", ["Free on OpenRouter, within the route's rate limits (the live list of free routes could not be read, so this is the last one we checked)."]));
        } else {
          var val = liveBest(db, function (m) { return !appOf(m.vendor) && blended(m) > 0; }, function (m) { return m.score.coding; });
          offers.splice(1, 0, val ? modelOffer(val.id, ["Best live Coding Index outside Anthropic, OpenAI and Google (" + val.score.coding + "), at $" + val.spec.priceIn + "/$" + val.spec.priceOut + " per 1M tokens on OpenRouter."])
            : modelOffer("kimi-k3", ["Frontier-level coding at a fraction of US prices."]));
        }
      } else if (state.budget === "free") {
        var fr2 = bestFreeRoute(db, "nemotron") || bestFreeRoute(db);
        offers.splice(2, 0, fr2 ? modelOffer(fr2.model.id, ["Free on OpenRouter right now (" + fr2.route.id + "), within the route's rate limits."])
          : modelOffer("nemotron-3-ultra", ["Free on OpenRouter, within the route's rate limits."]));
      }
    }
    // Privacy: the strongest model you can download, from the live catalog
    if (state.needs.indexOf("privacy") !== -1) {
      var ow = liveBest(db, function (m) { return (m.tags || []).indexOf("open-weights") !== -1; });
      offers.splice(1, 0, ow ? modelOffer(ow.id, ["Open weights: you can run it entirely on your own hardware.", "The strongest downloadable model on the live index right now (AA " + ow.score.aa + ")."])
        : modelOffer("inkling", ["Open weights under Apache 2.0 - you can run it entirely on your own hardware."]));
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

    /* The quick answer above already lists the tasks: until the reader asks
       for the personal route, the guided card is one line and a button. */
    if (!state.started && state.step === 0) {
      card.classList.add("finder-teaser");
      var th = el("div", "finder-head");
      th.appendChild(el("h3", "finder-title", deps.T("finderGuidedTitle")));
      card.appendChild(th);
      card.appendChild(el("p", "finder-sub", deps.T("finderSub")));
      var go = el("button", "btn-ghost", deps.T("finderStart"));
      go.type = "button";
      go.addEventListener("click", function () { state.started = true; render(); });
      card.appendChild(go);
      root.appendChild(card);
      return;
    }

    var head = el("div", "finder-head");
    head.appendChild(el("h3", "finder-title", deps.T("finderGuidedTitle")));
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
      c.appendChild(el("p", "router-meta", "AA index: " + (offer.score.est ? "~" : "") + offer.score.aa + (offer.score.est ? " (estimate, not an official measurement)" : " (official, " + snapshotDate() + ")")));
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
    card.appendChild(el("p", "router-meta", "Guidance from public benchmarks (official indices read " + snapshotDate() + ", refreshed automatically) and vendor pages, plus transparent rules - not gospel. Sources are linked in the quick answer above and in each model's details."));
    var nav = el("div", "finder-nav");
    var again = el("button", "btn-link", deps.T("finderRestart"));
    again.type = "button";
    again.addEventListener("click", function () { state = freshState(true); render(); });
    nav.appendChild(again);
    var sw = el("button", "btn-link", deps.T("finderSwitchGoal"));
    sw.type = "button";
    sw.addEventListener("click", function () { deps.switchToGoal(state.task); });
    nav.appendChild(sw);
    if (window.WhichAIShare && res.top) {
      var shareB = el("button", "btn-copy", deps.T("shareBtn"));
      shareB.type = "button";
      shareB.addEventListener("click", function () {
        var rows = [{ label: deps.T("finderTop"), value: res.top.name }];
        res.alts.forEach(function (o, i) { rows.push({ label: "Alt " + (i + 1), value: o.name }); });
        if (res.top.score && res.top.score.aa) rows.push({ label: "AA index", value: String((res.top.score.est ? "~" : "") + res.top.score.aa) + " (" + (res.top.score.est ? "not an official measurement" : "official, " + snapshotDate()) + ")" });
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

  /* ---------------- Quick answer: one task, the router's pick ---------------- */

  var TASK_ICONS = {
    writing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z"/><path d="M13.5 7.5l3 3"/></svg>',
    coding: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/></svg>',
    analysis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>',
    research: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    brainstorming: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 014 10.5c-.8.7-1 1.5-1 2.5h-6c0-1-.2-1.8-1-2.5A6 6 0 0112 3z"/></svg>',
    education: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8l10-4 10 4-10 4L2 8z"/><path d="M6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>',
    business: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a3 3 0 016 0v2"/><path d="M3 13h18"/></svg>',
    general: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>'
  };

  var quick = { root: null, deps: null, task: null };

  function brandMark(subject, label, opts) {
    var b = window.WhichAIBrands;
    return b ? b.createMark(subject, label, opts || {}) : null;
  }

  function renderQuick() {
    var q = quick.root, d = quick.deps;
    if (!q || !d) return;
    q.textContent = "";
    q.appendChild(el("p", "quick-title", d.T("quickTitle")));
    var row = el("div", "quick-tasks");
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", d.T("quickTitle"));
    TASKS.forEach(function (k, i) {
      var b = el("button", "quick-task" + (quick.task === k ? " is-on" : ""));
      b.type = "button";
      b.setAttribute("aria-pressed", quick.task === k ? "true" : "false");
      b.style.setProperty("--i", String(i));
      var ic = el("span", "quick-icon");
      ic.innerHTML = TASK_ICONS[k];
      b.appendChild(ic);
      b.appendChild(el("span", "quick-label", d.T("task_" + k)));
      b.addEventListener("click", function () { quick.task = quick.task === k ? null : k; renderQuick(); });
      row.appendChild(b);
    });
    q.appendChild(row);
    if (!quick.task) {
      q.appendChild(el("p", "quick-hint", d.T("quickHint")));
      return;
    }
    var bench = Bench();
    if (!bench) return;
    var rec = bench.recommend(quick.task);
    var top = rec.ranking[0];
    var app = bench.apps[top.app];
    var card = el("div", "quick-answer");
    var head = el("div", "qa-head");
    head.appendChild(el("span", "qa-kicker", d.T("quickBestFor").replace("{task}", d.T("task_" + quick.task))));
    head.appendChild(el("span", "badge", rec.confidence + " " + d.T("journeyConfidence")));
    card.appendChild(head);
    var pick = el("div", "qa-pick");
    var mark = brandMark(top.app, app.label, { wordmark: true, providerWordmark: true, className: "ai-brand-lockup" });
    if (mark) pick.appendChild(mark); else pick.textContent = app.label;
    if (top.live) pick.appendChild(el("span", "qa-live", top.live.name + " · " + top.live.label + " " + top.live.value));
    card.appendChild(pick);
    card.appendChild(el("p", "qa-summary", rec.summary));
    var ol = el("ol", "qa-rank");
    rec.ranking.forEach(function (r, i) {
      var a = bench.apps[r.app];
      var li = el("li", "qa-rank-row" + (i === 0 ? " is-top" : ""));
      var nm = el("span", "qa-app");
      var mk = brandMark(r.app, a.label, { small: true });
      if (mk) nm.appendChild(mk); else nm.textContent = a.label;
      li.appendChild(nm);
      li.appendChild(el("span", "qa-note", r.note));
      li.appendChild(el("span", "qa-free", d.T("freeTier") + " " + a.freeModel));
      ol.appendChild(li);
    });
    card.appendChild(ol);
    var src = el("p", "router-meta qa-src");
    src.appendChild(document.createTextNode(bench.CONFIDENCE_NOTES[rec.confidence] + " " + d.T("sourcesLabel") + " "));
    rec.sourceIds.forEach(function (sid, i) {
      var s0 = bench.sources.filter(function (x) { return x.id === sid; })[0];
      if (!s0) return;
      if (i) src.appendChild(document.createTextNode(" · "));
      var a = document.createElement("a");
      a.href = s0.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = s0.label;
      src.appendChild(a);
    });
    card.appendChild(src);
    var acts = el("div", "qa-actions");
    var write = el("button", "btn-primary", d.T("quickWrite").replace("{app}", app.label));
    write.type = "button";
    write.addEventListener("click", function () { d.useModel(top.app, quick.task); });
    acts.appendChild(write);
    var personal = el("button", "btn-ghost", d.T("quickPersonal"));
    personal.type = "button";
    personal.addEventListener("click", function () { Finder.startWith(quick.task); if (d.focusGuided) d.focusGuided(); });
    acts.appendChild(personal);
    card.appendChild(acts);
    q.appendChild(card);
  }

  var Finder = {
    init: function (rootEl, dependencies) {
      root = rootEl;
      deps = dependencies;
      if (!state) state = freshState();
      render();
    },
    rerender: function () { if (root && deps) render(); renderQuick(); },
    initQuick: function (rootEl, dependencies) { quick.root = rootEl; quick.deps = dependencies; renderQuick(); },
    pickTask: function (task) { if (TASKS.indexOf(task) !== -1) { quick.task = task; renderQuick(); } },
    /** jump into the guided questions with the task already answered */
    startWith: function (task) {
      state = freshState(true);
      if (TASKS.indexOf(task) !== -1) { state.task = task; state.step = 1; }
      if (root && deps) render();
    },
    TASK_ICONS: TASK_ICONS,
    /* exposed for tests */
    _recommend: function (answers) { state = answers; return recommend(); },
    _questions: function (answers) { state = answers; return questions(); }
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIFinder = Finder;
  if (typeof module !== "undefined" && module.exports) module.exports = Finder;
})();
