/*
 * WhichAI - the prompt generator (v0.36.0)
 *
 * One goal in, a prompt tuned for each selected AI family out, plus the
 * router's pick for the task. Moved out of app.js when the site became one
 * page: it is now step 2 of the Tools chapter, reached from the finder
 * ("write the prompt for it") or the debates, and it hands any prompt to the
 * Prompt Doctor below it. Pure client-side: js/engine.js builds the prompts,
 * nothing is sent anywhere.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var deps = null; // { T, tl(task), copy(text, btn), officialAnchor(url,label,primary), linkForFamily(f), toDoctor(text) }
  var $ = function (id) { return document.getElementById(id); };
  var PREFS_KEY = "pc_prefs_v1";
  var results = [];
  var recommendedAppId = null;
  var panelPres = [], panelAnimated = [];
  var twTimer = null;
  var exampleIndex = 0;
  var reduced = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var EXAMPLES = [
    { goal: "Write a landing page headline and subheadline for a budgeting app aimed at freelancers",
      context: "The app is called Coinly. It automatically sets aside money for taxes. Audience: freelancers aged 25-40 who hate spreadsheets.",
      format: "markdown", length: "short", tone: "persuasive" },
    { goal: "Build a Python script that renames all photos in a folder using the date they were taken",
      context: "Photos come from different cameras and phones, so file naming is inconsistent. I want a dry-run mode that previews changes before applying them.",
      format: "code", length: "medium", tone: "none" },
    { goal: "Explain how HTTPS keeps a connection secure to someone with no technical background",
      context: "The reader is a curious teenager. Use everyday analogies.",
      format: "prose", length: "medium", tone: "friendly" },
    { goal: "Generate 10 name ideas for a podcast about AI for non-technical listeners",
      context: "Tone of the show: practical, curious, jargon-free. Each episode answers one everyday question about AI.",
      format: "bullets", length: "short", tone: "none" }
  ];
  var OPT_KEYS = { none: "optNone", prose: "optProse", markdown: "optMarkdown", bullets: "optBullets", table: "optTable", json: "optJson", code: "optCode", short: "optShort", medium: "optMedium", long: "optLong", professional: "optProfessional", friendly: "optFriendly", casual: "optCasual", persuasive: "optPersuasive", academic: "optAcademic" };

  function Engine() { return root.PromptCompassEngine; }
  function Bench() { return root.PromptCompassBenchmarks || null; }
  function T(k) { return deps && deps.T ? deps.T(k) : k; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function setMark(node, subject, label, opts) {
    var B = root.WhichAIBrands;
    if (B && B.setMark(node, subject, label, opts)) return;
    node.textContent = label || "";
  }

  function selectedModels() {
    return Array.prototype.slice.call(document.querySelectorAll("#gen .model-check input:checked")).map(function (cb) { return cb.value; });
  }

  /* ---------- typewriter: fast, word by word, off for reduced motion ---------- */

  function typewrite(node, text) {
    if (reduced) { node.textContent = text; return; }
    if (twTimer) { clearInterval(twTimer); twTimer = null; }
    var tokens = text.split(/(\s+)/), i = 0, acc = "";
    node.textContent = "▍";
    twTimer = setInterval(function () {
      for (var k = 0; k < 6 && i < tokens.length; k++, i++) acc += tokens[i];
      if (i >= tokens.length) { node.textContent = acc; clearInterval(twTimer); twTimer = null; }
      else node.textContent = acc + "▍";
    }, 12);
  }

  /* ---------- preferences: the last options used come back next time ---------- */

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        taskType: $("task-type").value, format: $("format").value, length: $("length").value, tone: $("tone").value, models: selectedModels()
      }));
    } catch (e) { /* private mode */ }
  }
  function applyPrefs() {
    var p = {};
    try { p = JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch (e) { p = {}; }
    function setSel(node, val) {
      if (!val || !node) return;
      for (var i = 0; i < node.options.length; i++) if (node.options[i].value === val) { node.value = val; return; }
    }
    setSel($("task-type"), p.taskType);
    setSel($("format"), p.format);
    setSel($("length"), p.length);
    setSel($("tone"), p.tone);
    if (p.models && p.models.length) {
      Array.prototype.forEach.call(document.querySelectorAll("#gen .model-check input"), function (cb) { cb.checked = p.models.indexOf(cb.value) !== -1; });
    }
  }

  /* ---------- the router card: which AI for this task ---------- */

  function rankingDetails(rec) {
    var B = Bench();
    var details = el("details", "router-details");
    details.appendChild(el("summary", null, T("fullRanking")));
    var ol = el("ol", "router-rank");
    rec.ranking.forEach(function (item) {
      var app = B.apps[item.app];
      var li = el("li");
      var name = el("span", "router-app");
      setMark(name, item.app, app.label, { wordmark: true });
      li.appendChild(name);
      li.appendChild(document.createTextNode(" (" + app.vendor + ") - " + item.note));
      if (item.live) li.appendChild(el("span", "router-live", item.live.label + " (live): " + item.live.name + " " + item.live.value));
      li.appendChild(el("span", "router-free", T("freeTier") + " " + app.freeModel));
      ol.appendChild(li);
    });
    details.appendChild(ol);
    details.appendChild(el("p", "router-meta", B.CONFIDENCE_NOTES[rec.confidence] + " " + B.disclaimer));
    var src = el("p", "router-meta");
    src.appendChild(document.createTextNode(T("sourcesLabel") + " "));
    rec.sourceIds.forEach(function (sid, i) {
      var s0 = B.sources.filter(function (x) { return x.id === sid; })[0];
      if (!s0) return;
      if (i) src.appendChild(document.createTextNode(" · "));
      var a = el("a", null, s0.label);
      a.href = s0.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      src.appendChild(a);
    });
    details.appendChild(src);
    return details;
  }

  function renderRouter(taskType) {
    var card = $("router-card");
    var B = Bench();
    recommendedAppId = null;
    if (!B || !card) { if (card) card.hidden = true; return; }
    var rec = B.recommend(taskType);
    recommendedAppId = rec.ranking[0].app;
    card.textContent = "";
    var head = el("div", "router-head");
    head.appendChild(el("span", "router-title", T("routerTitle")));
    head.appendChild(el("span", "badge", T("benchLabel") + " " + B.updated));
    card.appendChild(head);
    var pick = el("p", "router-pick");
    pick.appendChild(document.createTextNode(T("bestPick") + " "));
    var strong = el("strong");
    setMark(strong, recommendedAppId, B.apps[recommendedAppId].label, { wordmark: true });
    pick.appendChild(strong);
    card.appendChild(pick);
    card.appendChild(el("p", "router-summary", rec.summary));
    card.appendChild(rankingDetails(rec));
    card.hidden = false;
  }

  /* ---------- the prompts ---------- */

  function selectTab(index) {
    var tabs = $("tabs").children, panels = $("panels").children;
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute("aria-selected", i === index ? "true" : "false");
      panels[i].hidden = i !== index;
      if (i !== index && panelPres[i] && results[i]) panelPres[i].textContent = results[i].prompt;
    }
    if (panelPres[index] && results[index]) {
      if (!panelAnimated[index]) { panelAnimated[index] = true; typewrite(panelPres[index], results[index].prompt); }
      else if (!twTimer) panelPres[index].textContent = results[index].prompt;
    }
  }

  function renderResults() {
    var tabs = $("tabs"), panels = $("panels");
    tabs.textContent = "";
    panels.textContent = "";
    panelPres = [];
    panelAnimated = [];
    if (twTimer) { clearInterval(twTimer); twTimer = null; }
    var selected = 0;
    results.forEach(function (r, i) { if (r.id === recommendedAppId) selected = i; });
    results.forEach(function (r, i) {
      var tab = el("button", "tab" + (r.id === recommendedAppId ? " tab-reco" : ""));
      tab.type = "button";
      tab.setAttribute("role", "tab");
      setMark(tab, r.id, r.label, { wordmark: true, small: true });
      if (r.id === recommendedAppId) tab.title = T("genReco");
      tab.addEventListener("click", function () { selectTab(i); });
      tabs.appendChild(tab);

      var panel = el("div", "panel");
      panel.setAttribute("role", "tabpanel");
      var bar = el("div", "panel-toolbar");
      var title = el("span", "panel-model");
      setMark(title, r.id, r.label, { wordmark: true, providerWordmark: true });
      title.appendChild(el("small", null, r.vendor));
      bar.appendChild(title);
      var btns = el("div", "panel-btns");
      var url = deps.linkForFamily ? deps.linkForFamily(r.id) : null;
      if (url && deps.officialAnchor) btns.appendChild(deps.officialAnchor(url, T("officialOpen") + " " + r.label, false));
      var doc = el("button", "btn-ghost btn-sm", T("genToDoctor"));
      doc.type = "button";
      doc.addEventListener("click", function () { if (deps.toDoctor) deps.toDoctor(r.prompt); });
      btns.appendChild(doc);
      var copy = el("button", "btn-copy", T("copy"));
      copy.type = "button";
      copy.addEventListener("click", function () { deps.copy(r.prompt, copy); });
      btns.appendChild(copy);
      bar.appendChild(btns);
      panel.appendChild(bar);
      var pre = el("pre", "prompt-text");
      panel.appendChild(pre);
      panelPres.push(pre);
      panelAnimated.push(false);
      panel.appendChild(el("p", "prompt-meta", r.words + " " + T("genWords") + " · " + r.chars + " " + T("genChars")));
      var why = el("details", "why");
      var sum = el("summary");
      sum.appendChild(document.createTextNode(T("whyPrefix") + " "));
      var B = root.WhichAIBrands;
      var wm = B && B.createMark(r.id, r.label, { providerWordmark: true, small: true });
      if (wm) sum.appendChild(wm); else sum.appendChild(document.createTextNode(r.label));
      why.appendChild(sum);
      var ul = el("ul");
      r.why.forEach(function (reason) { ul.appendChild(el("li", null, reason)); });
      why.appendChild(ul);
      panel.appendChild(why);
      panels.appendChild(panel);
    });
    $("gen-empty").hidden = true;
    $("results-wrap").hidden = false;
    selectTab(selected);
    if (root.WhichAIMotion) root.WhichAIMotion.refresh();
  }

  function onGenerate() {
    var E = Engine();
    $("goal-error").hidden = true;
    $("models-error").hidden = true;
    var goal = $("goal").value.trim();
    var models = selectedModels();
    if (!goal) { $("goal-error").hidden = false; $("goal").focus(); return; }
    if (!models.length) { $("models-error").hidden = false; return; }
    var taskType = $("task-type").value;
    var hint = $("detect-hint");
    var ctx = $("context").value.trim();
    if (taskType === "auto") {
      taskType = E.detectTaskType(goal + " " + ctx);
      hint.textContent = T("detected") + " " + deps.tl(taskType);
      hint.hidden = false;
    } else hint.hidden = true;
    results = E.generate({ goal: goal, context: ctx, taskType: taskType, format: $("format").value, length: $("length").value, tone: $("tone").value, models: models });
    savePrefs();
    renderRouter(taskType);
    renderResults();
  }

  function loadExample() {
    var ex = EXAMPLES[exampleIndex % EXAMPLES.length];
    exampleIndex++;
    $("goal").value = ex.goal;
    $("context").value = ex.context;
    $("task-type").value = "auto";
    $("format").value = ex.format;
    $("length").value = ex.length;
    $("tone").value = ex.tone;
    $("goal-error").hidden = true;
    $("detect-hint").hidden = true;
    var more = $("gen-more");
    if (more) more.open = true;
    $("goal").focus();
  }

  function relabel() {
    var task = $("task-type");
    if (task) {
      Array.prototype.forEach.call(task.options, function (o) { o.textContent = o.value === "auto" ? T("autoDetect") : deps.tl(o.value); });
    }
    ["format", "length", "tone"].forEach(function (id) {
      var s = $(id);
      if (!s) return;
      Array.prototype.forEach.call(s.options, function (o) { if (OPT_KEYS[o.value]) o.textContent = T(OPT_KEYS[o.value]); });
    });
  }

  var Generator = {
    init: function (dependencies) {
      deps = dependencies;
      var E = Engine();
      var task = $("task-type");
      if (!task || !E) return;
      var auto = document.createElement("option");
      auto.value = "auto";
      task.appendChild(auto);
      E.TASK_ORDER.forEach(function (k) {
        var o = document.createElement("option");
        o.value = k;
        task.appendChild(o);
      });
      task.value = "auto";
      relabel();
      applyPrefs();
      $("generate").addEventListener("click", onGenerate);
      $("load-example").addEventListener("click", loadExample);
      ["goal", "context"].forEach(function (id) {
        $(id).addEventListener("keydown", function (e) {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onGenerate(); }
        });
      });
    },
    relabel: relabel,
    /** a family chosen elsewhere (finder, drawer): tick it, set the task */
    useModel: function (family, task) {
      var cb = document.querySelector('#gen .model-check input[value="' + family + '"]');
      if (cb) cb.checked = true;
      var E = Engine();
      if (task && E && E.TASK_TYPES[task]) { $("task-type").value = task; $("detect-hint").hidden = true; }
    },
    setGoal: function (text) {
      if (typeof text === "string" && text.trim()) $("goal").value = text.trim().slice(0, 4000);
    },
    generate: onGenerate,
    selected: selectedModels
  };

  root.WhichAIGenerator = Generator;
  if (typeof module !== "undefined" && module.exports) module.exports = Generator;
})();
