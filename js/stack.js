/*
 * WhichAI - AI Stack Optimizer (v0.24.0)
 * Rule-based, 100% client-side: which subscriptions to keep, what to use free,
 * what is redundant, with an honest estimated cost. Facts come from
 * benchmarks.js and models-db.js; prices from vendor pages (July 2026 snapshot).
 * Result copy is English by design (same content policy as the finder).
 */
(function () {
  "use strict";

  var deps = null; // { T, openModel(id), openFinder() }
  var root = null;
  var LS_KEY = "pc_stack_v1";

  function Bench() { return window.PromptCompassBenchmarks || null; }
  function DB() { return window.PromptCompassModelsDB || null; }

  var TASKS = ["writing", "coding", "research", "analysis", "brainstorming", "education", "business", "general"];

  /* Subscriptions we can reason about. Prices: vendor pages, July 2026 snapshot. */
  var SUBS = [
    { id: "chatgpt", label: "ChatGPT Plus", price: 20, app: "chatgpt" },
    { id: "claude", label: "Claude Pro", price: 20, app: "claude" },
    { id: "gemini", label: "Google AI Pro", price: 19.99, app: "gemini" },
    { id: "perplexity", label: "Perplexity Pro", price: 20, app: "perplexity" },
    { id: "copilot", label: "Copilot Pro", price: 20, app: "copilot" },
    { id: "grok", label: "SuperGrok", price: 16, app: "grok", approx: true }
  ];

  var APP_DB = {
    claude: { free: "sonnet-5", paid: "claude-opus-5" },
    chatgpt: { free: "gpt-5-5", paid: "gpt-5-5" },
    gemini: { free: "gemini-3-5-flash", paid: "gemini-3-1-pro" },
    perplexity: { free: "sonar", paid: "sonar-pro" }
  };

  var FREE_TIER_NOTE = {
    claude: "free tier runs Claude Sonnet 5 (limits vary with demand)",
    chatgpt: "free tier runs GPT-5.5 with message caps",
    gemini: "the most generous free tier of the big assistants",
    perplexity: "unlimited basic cited searches plus 5 Pro searches/day"
  };

  function freshState() {
    return { tasks: [], subs: [], budget: "20", needs: [], done: false };
  }
  var state = null;

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && Array.isArray(s.tasks)) return s;
    } catch (e) { /* ignore */ }
    return freshState();
  }
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------------- Optimizer (transparent rules) ---------------- */

  function scoreApps(task) {
    var bench = Bench();
    var scores = { claude: 0, chatgpt: 0, gemini: 0, perplexity: 0 };
    var pts = [5, 3, 2, 1];
    var rec = bench ? bench.recommend(task) : null;
    if (rec) rec.ranking.forEach(function (r, i) { if (scores[r.app] != null) scores[r.app] += pts[i] || 0; });
    if (state.needs.indexOf("web") !== -1) { scores.perplexity += 4; scores.gemini += 1.5; }
    if (state.needs.indexOf("files") !== -1) { scores.chatgpt += 1.5; scores.gemini += 1; }
    if (state.needs.indexOf("long") !== -1) { scores.claude += 1.5; scores.gemini += 1; }
    if (state.needs.indexOf("speed") !== -1) { scores.gemini += 1.5; }
    return scores;
  }

  function optimize() {
    var bench = Bench();
    var perTask = {};   // task -> app
    var appTasks = {};  // app -> [tasks]
    var appScore = {};  // app -> total score across selected tasks
    state.tasks.forEach(function (t) {
      var sc = scoreApps(t);
      var winner = Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; })[0];
      perTask[t] = winner;
      (appTasks[winner] = appTasks[winner] || []).push(t);
      Object.keys(sc).forEach(function (a) { appScore[a] = (appScore[a] || 0) + sc[a]; });
    });

    var stackApps = Object.keys(appTasks);
    // how many paid subscriptions the budget allows
    var maxPaid = state.budget === "0" ? 0 : state.budget === "20" ? 1 : state.budget === "40" ? 2 : stackApps.length;
    // paid slots go to the apps covering the most selected tasks (score as tiebreak)
    var paidOrder = stackApps.slice().sort(function (a, b) {
      return (appTasks[b].length - appTasks[a].length) || ((appScore[b] || 0) - (appScore[a] || 0));
    });
    var paidApps = paidOrder.slice(0, maxPaid);

    var stack = stackApps.map(function (app) {
      var paid = paidApps.indexOf(app) !== -1;
      var sub = SUBS.filter(function (s) { return s.app === app; })[0];
      var why = [];
      appTasks[app].forEach(function (t) {
        var rec = bench ? bench.recommend(t) : null;
        if (rec && rec.ranking[0].app === app) why.push("Ranked #1 for " + t + " in our benchmark router.");
      });
      if (!paid) why.push("Free tier: " + (FREE_TIER_NOTE[app] || "available"));
      return {
        app: app,
        label: bench && bench.apps[app] ? bench.apps[app].label : app,
        tasks: appTasks[app],
        paid: paid,
        price: paid && sub ? sub.price : 0,
        priceApprox: paid && sub ? !!sub.approx : false,
        why: why.slice(0, 3),
        dbId: APP_DB[app] ? (paid ? APP_DB[app].paid : APP_DB[app].free) : null
      };
    });

    var newCost = stack.reduce(function (s, x) { return s + x.price; }, 0);
    var currentCost = 0;
    var current = [];
    state.subs.forEach(function (id) {
      var sub = SUBS.filter(function (s) { return s.id === id; })[0];
      if (sub) { currentCost += sub.price; current.push(sub); }
    });
    var keepApps = paidApps;
    var redundant = current.filter(function (sub) { return keepApps.indexOf(sub.app) === -1; });

    var extras = [];
    if (state.needs.indexOf("privacy") !== -1) {
      extras.push({ kind: "privacy", text: "Privacy-first option: run an open-weight model locally. Inkling (Apache 2.0, multimodal) or Qwen tiers cost nothing per token and keep data on your machine.", dbId: "inkling" });
    }
    if (state.needs.indexOf("api") !== -1) {
      extras.push({ kind: "api", text: "For API and automation on a zero budget: free OpenRouter routes (Nemotron 3 Ultra, Qwen3 Coder) plus Google AI Studio and Groq free keys, all usable for auto-run right here in Compare and Chains.", dbId: "qwen3-coder" });
    }

    return {
      perTask: perTask, stack: stack, newCost: newCost,
      currentCost: currentCost, redundant: redundant, extras: extras,
      updated: bench ? bench.updated : ""
    };
  }

  /* ---------------- Export ---------------- */

  function exportMd(res) {
    var lines = ["# My AI stack (WhichAI)", ""];
    lines.push("Tasks: " + state.tasks.join(", "));
    lines.push("Budget: " + (state.budget === "0" ? "free only" : state.budget === "nolimit" ? "no limit" : "~$" + state.budget + "/month"));
    lines.push("");
    res.stack.forEach(function (s) {
      lines.push("## " + s.label + (s.paid ? " (paid, $" + s.price + "/mo" + (s.priceApprox ? " approx" : "") + ")" : " (free tier)"));
      lines.push("Covers: " + s.tasks.join(", "));
      s.why.forEach(function (w) { lines.push("- " + w); });
      lines.push("");
    });
    lines.push("Estimated new cost: $" + res.newCost.toFixed(2) + "/month");
    if (res.currentCost) lines.push("Current subscriptions: $" + res.currentCost.toFixed(2) + "/month");
    if (res.redundant.length) lines.push("Possibly redundant: " + res.redundant.map(function (r) { return r.label; }).join(", "));
    lines.push("");
    lines.push("Estimates based on public benchmarks and vendor prices (snapshot " + res.updated + "). Generated with WhichAI, https://whichai.wiki");
    var blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "whichai-stack.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  /* ---------------- UI ---------------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function chipToggle(label, on, fn) {
    var b = el("button", "chip chip-toggle" + (on ? " chip-on" : ""), label);
    b.type = "button";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.addEventListener("click", fn);
    return b;
  }

  function render() {
    if (!root) return;
    root.innerHTML = "";
    var card = el("div", "card finder-card stack-card");

    card.appendChild(el("h2", "finder-title", deps.T("stackTitle")));
    card.appendChild(el("p", "finder-sub", deps.T("stackSub")));

    // 1. tasks
    card.appendChild(el("h3", "finder-q", "1 · What do you use AI for?"));
    var tWrap = el("div", "db-filters stack-chips");
    TASKS.forEach(function (t) {
      tWrap.appendChild(chipToggle(deps.T("task_" + t), state.tasks.indexOf(t) !== -1, function () {
        var i = state.tasks.indexOf(t);
        if (i === -1) state.tasks.push(t); else state.tasks.splice(i, 1);
        state.done = false; saveState(); render();
      }));
    });
    card.appendChild(tWrap);

    // 2. current subs
    card.appendChild(el("h3", "finder-q", "2 · What do you already pay for?"));
    var sWrap = el("div", "db-filters stack-chips");
    SUBS.forEach(function (s) {
      sWrap.appendChild(chipToggle(s.label + " $" + s.price + (s.approx ? "~" : ""), state.subs.indexOf(s.id) !== -1, function () {
        var i = state.subs.indexOf(s.id);
        if (i === -1) state.subs.push(s.id); else state.subs.splice(i, 1);
        state.done = false; saveState(); render();
      }));
    });
    card.appendChild(sWrap);

    // 3. budget
    card.appendChild(el("h3", "finder-q", "3 · Monthly budget going forward?"));
    var bWrap = el("div", "finder-opts stack-budget");
    [["0", "Free only"], ["20", "About $20"], ["40", "About $40"], ["nolimit", "Whatever works best"]].forEach(function (b) {
      var o = el("button", "finder-opt stack-opt" + (state.budget === b[0] ? " on" : ""));
      o.type = "button";
      o.appendChild(el("span", "finder-opt-label", b[1]));
      o.setAttribute("aria-pressed", state.budget === b[0] ? "true" : "false");
      o.addEventListener("click", function () { state.budget = b[0]; state.done = false; saveState(); render(); });
      bWrap.appendChild(o);
    });
    card.appendChild(bWrap);

    // 4. needs
    card.appendChild(el("h3", "finder-q", "4 · Anything essential?"));
    var nWrap = el("div", "db-filters stack-chips");
    [["web", "Web + sources"], ["files", "Files / images"], ["privacy", "Privacy / local"], ["speed", "Speed"], ["long", "Long documents"], ["api", "API / automation"]].forEach(function (n) {
      nWrap.appendChild(chipToggle(n[1], state.needs.indexOf(n[0]) !== -1, function () {
        var i = state.needs.indexOf(n[0]);
        if (i === -1) state.needs.push(n[0]); else state.needs.splice(i, 1);
        state.done = false; saveState(); render();
      }));
    });
    card.appendChild(nWrap);

    var go = el("button", "btn-primary btn-inline stack-go", deps.T("stackGo"));
    go.type = "button";
    go.disabled = !state.tasks.length;
    go.addEventListener("click", function () { state.done = true; saveState(); render(); });
    var goRow = el("div", "compare-actions");
    goRow.appendChild(go);
    if (!state.tasks.length) goRow.appendChild(el("span", "field-hint", deps.T("stackPickOne")));
    card.appendChild(goRow);
    root.appendChild(card);

    if (state.done && state.tasks.length) renderResult();
  }

  function renderResult() {
    var res = optimize();

    var wrap = el("div", "stack-result");
    var head = el("h3", "finder-q stack-result-title", deps.T("stackResult"));
    wrap.appendChild(head);

    // cost summary first (conclusion first)
    var cost = el("div", "card finder-result finder-top stack-cost");
    var line1 = el("p", "stack-cost-main");
    line1.appendChild(el("strong", null, "$" + res.newCost.toFixed(2) + "/mo"));
    line1.appendChild(document.createTextNode(" " + deps.T("stackNewCost")));
    cost.appendChild(line1);
    if (res.currentCost > 0) {
      var delta = res.currentCost - res.newCost;
      var line2 = el("p", "finder-line", deps.T("stackCurrentCost") + " $" + res.currentCost.toFixed(2) + "/mo" +
        (delta > 0.01 ? " · " + deps.T("stackSaving") + " ~$" + delta.toFixed(2) + "/mo" : ""));
      cost.appendChild(line2);
    }
    if (res.redundant.length) {
      cost.appendChild(el("p", "finder-line finder-limit", deps.T("stackRedundant") + " " + res.redundant.map(function (r) { return r.label; }).join(", ")));
    }
    cost.appendChild(el("p", "router-meta", "Estimates from public vendor prices and our benchmark router (snapshot " + res.updated + "). Your real usage may differ."));
    wrap.appendChild(cost);

    // stack cards
    var grid = el("div", "finder-alts stack-grid");
    res.stack.forEach(function (s) {
      var c = el("div", "card finder-result");
      var h = el("div", "db-row-head");
      var modelName = el("span", "panel-model", s.label);
      var brandedSubject = s.app;
      var DBx = DB();
      if (s.dbId && DBx) {
        for (var bi = 0; bi < DBx.models.length; bi++) {
          if (DBx.models[bi].id === s.dbId) { brandedSubject = DBx.models[bi]; break; }
        }
      }
      if (window.WhichAIBrands) {
        window.WhichAIBrands.setMark(modelName, brandedSubject, s.label, { providerWordmark: true });
      }
      h.appendChild(modelName);
      h.appendChild(el("span", "badge", s.paid ? "$" + s.price + "/mo" + (s.priceApprox ? " ~" : "") : deps.T("stackFreeTier")));
      c.appendChild(h);
      var chips = el("div", "db-chips");
      s.tasks.forEach(function (t) { chips.appendChild(el("span", "chip chip-label", deps.T("task_" + t))); });
      c.appendChild(chips);
      var ul = el("ul", "finder-why");
      s.why.forEach(function (w) { ul.appendChild(el("li", null, w)); });
      c.appendChild(ul);
      if (s.dbId) {
        var actions = el("div", "compare-actions finder-actions");
        var open = el("button", "btn-copy", deps.T("finderOpenGuide"));
        open.type = "button";
        open.addEventListener("click", function () { deps.openModel(s.dbId); });
        actions.appendChild(open);
        DBx = DB();
        var url = DBx && DBx.links ? DBx.links[s.app] : null;
        if (url) {
          var oa = document.createElement("a");
          oa.className = "btn-copy btn-official";
          oa.href = url;
          oa.target = "_blank";
          oa.rel = "noopener";
          oa.textContent = deps.T("officialOpen") + " " + s.label + " \u2197";
          actions.appendChild(oa);
        }
        c.appendChild(actions);
      }
      grid.appendChild(c);
    });
    wrap.appendChild(grid);

    // extras (privacy / api)
    res.extras.forEach(function (x) {
      var c = el("div", "card finder-result stack-extra");
      c.appendChild(el("p", "finder-line", x.text));
      if (x.dbId) {
        var a = el("div", "compare-actions finder-actions");
        var open = el("button", "btn-copy", deps.T("finderOpenGuide"));
        open.type = "button";
        open.addEventListener("click", function () { deps.openModel(x.dbId); });
        a.appendChild(open);
        c.appendChild(a);
      }
      wrap.appendChild(c);
    });

    var actions = el("div", "compare-actions");
    var ex = el("button", "btn-copy", deps.T("exportMd"));
    ex.type = "button";
    ex.addEventListener("click", function () { exportMd(res); });
    actions.appendChild(ex);
    var fin = el("button", "btn-link", deps.T("stackToFinder"));
    fin.type = "button";
    fin.addEventListener("click", function () { deps.openFinder(); });
    actions.appendChild(fin);
    if (window.WhichAIShare && res.stack.length) {
      var shareB = el("button", "btn-copy", deps.T("shareBtn"));
      shareB.type = "button";
      shareB.addEventListener("click", function () {
        var rows = res.stack.slice(0, 3).map(function (s) {
          return { label: s.label, value: s.tasks.map(function (t) { return deps.T("task_" + t); }).join(", ") + (s.paid ? " · $" + s.price + "/mo" : " · free") };
        });
        rows.push({ label: "Total", value: "$" + res.newCost.toFixed(2) + "/mo" + (res.currentCost > res.newCost ? " (was $" + res.currentCost.toFixed(2) + ")" : "") });
        window.WhichAIShare.share({
          title: "My AI stack",
          subtitle: "Built with the WhichAI Stack Optimizer",
          badge: "AI Stack",
          rows: rows
        }, function () { shareB.textContent = deps.T("shareDone"); setTimeout(function () { shareB.textContent = deps.T("shareBtn"); }, 2200); });
      });
      actions.appendChild(shareB);
    }
    wrap.appendChild(actions);

    root.appendChild(wrap);
  }

  var Stack = {
    init: function (rootEl, dependencies) {
      root = rootEl;
      deps = dependencies;
      if (!state) state = loadState();
      render();
    },
    rerender: function () { if (root && deps) render(); },
    /* exposed for tests */
    _optimize: function (s) { state = s; return optimize(); }
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIStack = Stack;
  if (typeof module !== "undefined" && module.exports) module.exports = Stack;
})();
