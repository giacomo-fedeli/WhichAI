/*
 * WhichAI - the journey (v0.33.0)
 *
 * The welcome screen used to be a dead end with four buttons: click one or
 * leave. Now scrolling is a third answer, and it walks through the same
 * argument the whole site makes, in four acts:
 *
 *   1  the map      118 models placed by price and measured score
 *   2  the ranking  the same points sorted, and why that is not enough
 *   3  your job     a goal in plain language, answered live
 *   4  the rest     every tool, framed as one of those two questions
 *
 * The 3D constellation behind the text is driven by the same scroll position,
 * so the formation the reader sees is the formation the sentence describes.
 * That is the whole trick: the animation is not illustrating the argument,
 * it is the argument.
 *
 * Everything here degrades. Without WebGL the scene is flat, without
 * JavaScript the acts are still readable HTML, and with reduced-motion the
 * scene renders once and stops.
 */
(function () {
  "use strict";

  var deps = null;      // { T, generate, setView }
  var stage = null;
  var scroller = null;
  var acts = [];
  var spine = null;
  var progress = 0;
  var built = false;

  function $(id) { return document.getElementById(id); }
  function DB() { return window.PromptCompassModelsDB || null; }
  function Bench() { return window.PromptCompassBenchmarks || null; }
  function T(k, fallback) {
    try {
      var v = deps && deps.T ? deps.T(k) : null;
      return v && v !== k ? v : fallback;
    } catch (e) { return fallback; }
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- act 1: live counts, never hardcoded ---------- */

  function buildStats() {
    var wrap = $("act-map-stats");
    var db = DB();
    if (!wrap || !db) return;
    var measured = db.models.filter(function (m) { return m.score && typeof m.score.aa === "number"; });
    var free = db.models.filter(function (m) { return (m.tags || []).indexOf("free") >= 0; });
    var open = db.models.filter(function (m) { return (m.tags || []).indexOf("open-weights") >= 0; });
    var rows = [
      [String(db.models.length), T("journeyStatModels", "models tracked")],
      [String(measured.length), T("journeyStatMeasured", "with a measured score")],
      [String(free.length), T("journeyStatFree", "usable for free")],
      [String(open.length), T("journeyStatOpen", "you can download")]
    ];
    wrap.innerHTML = "";
    rows.forEach(function (r) {
      var s = el("div", "act-stat");
      s.appendChild(el("strong", null, r[0]));
      s.appendChild(el("span", null, r[1]));
      wrap.appendChild(s);
    });
    var note = el("p", "act-stat-note", T("journeySnapshot", "Snapshot") + ": " + (db.updated || "n/a"));
    wrap.appendChild(note);
  }

  /* ---------- act 2: the live top five ---------- */

  function buildLadder() {
    var list = $("act-ladder");
    var db = DB();
    if (!list || !db) return;
    var top = db.models
      .filter(function (m) { return m.score && typeof m.score.aa === "number" && m.status !== "rumored" && m.status !== "private"; })
      .sort(function (a, b) { return b.score.aa - a.score.aa; })
      .slice(0, 5);
    list.innerHTML = "";
    top.forEach(function (m, i) {
      var li = el("li", "act-rank-row");
      li.style.setProperty("--i", String(i));
      li.appendChild(el("span", "act-rank-n", String(i + 1)));
      var mid = el("span", "act-rank-mid");
      mid.appendChild(el("strong", null, m.name));
      mid.appendChild(el("span", "act-rank-vendor", m.vendor));
      li.appendChild(mid);
      var bar = el("span", "act-rank-bar");
      var fill = el("span", "act-rank-fill");
      /* Bars are scaled against the leader, not against zero: at this end of
         the table the differences are small and a zero baseline hides them. */
      var lead = top[0].score.aa;
      var floor = Math.max(0, lead - 12);
      fill.style.width = Math.round(((m.score.aa - floor) / (lead - floor)) * 100) + "%";
      bar.appendChild(fill);
      li.appendChild(bar);
      li.appendChild(el("span", "act-rank-score", String(m.score.aa)));
      li.addEventListener("click", function () { openModel(m.id); });
      list.appendChild(li);
    });
  }

  function openModel(id) {
    if (window.WhichAIWelcome && window.WhichAIWelcome.leaveTo) {
      window.WhichAIWelcome.leaveTo("#model=" + id);
    } else {
      location.hash = "#model=" + id;
    }
  }

  /* ---------- act 3: the actual answer, computed locally ---------- */

  function answerGoal(goal) {
    var box = $("act-answer");
    var b = Bench();
    var db = DB();
    var Engine = window.PromptCompassEngine;
    if (!box || !b || !db || !Engine) return;
    var task = (Engine.detectTaskType && Engine.detectTaskType(goal)) || "general";
    var rec = b.recommend(task);
    var top = rec.ranking && rec.ranking[0];
    var app = top ? (b.apps[top.app] || {}) : {};

    var freePool = db.models.filter(function (m) {
      return m.status === "public" && (m.tags || []).indexOf("free") >= 0 &&
        (m.tags || []).indexOf("info-only") < 0 && m.score && typeof m.score.aa === "number";
    }).sort(function (a, b2) { return b2.score.aa - a.score.aa; });
    var free = freePool[0];

    box.innerHTML = "";
    box.hidden = false;

    var head = el("div", "act-answer-head");
    head.appendChild(el("span", "act-answer-task", T("journeyDetected", "Detected") + ": " + task));
    head.appendChild(el("span", "badge", rec.confidence + " " + T("journeyConfidence", "confidence")));
    box.appendChild(head);

    var pick = el("div", "act-answer-pick");
    pick.appendChild(el("span", "act-answer-label", T("journeyBestPick", "Best pick")));
    pick.appendChild(el("strong", null, app.label || (top && top.app) || "n/a"));
    box.appendChild(pick);

    if (top && top.note) box.appendChild(el("p", "act-answer-why", top.note));

    if (free) {
      var alt = el("p", "act-answer-free");
      alt.appendChild(el("span", "act-answer-label", T("journeyFreeAlt", "Free alternative")));
      alt.appendChild(el("strong", null, free.name));
      alt.appendChild(document.createTextNode(" · " + free.access));
      box.appendChild(alt);
    }

    var actions = el("div", "act-answer-actions");
    var go = el("button", "btn-primary act-answer-go", T("journeyWritePrompt", "Write the prompt for it"));
    go.type = "button";
    go.addEventListener("click", function () {
      try { sessionStorage.setItem("pc_journey_goal", goal); } catch (e) { /* fine */ }
      if (window.WhichAIWelcome && window.WhichAIWelcome.leaveTo) window.WhichAIWelcome.leaveTo("");
      else location.hash = "";
    });
    actions.appendChild(go);
    var guide = el("button", "btn-link", T("journeySeeEvidence", "See the evidence"));
    guide.type = "button";
    guide.addEventListener("click", function () {
      if (window.WhichAIWelcome && window.WhichAIWelcome.leaveTo) window.WhichAIWelcome.leaveTo("#guide");
      else location.hash = "#guide";
    });
    actions.appendChild(guide);
    box.appendChild(actions);
  }

  /* ---------- act 4: the tools, described by what they answer ---------- */

  var TOOLS = [
    ["#guide", "journeyToolGuide", "Model guide", "Who is who, with the evidence attached"],
    ["#compare", "journeyToolCompare", "Compare", "Same prompt, several models, side by side"],
    ["#chains", "journeyToolChains", "Chains", "A different model for each step of the job"],
    ["#stack", "journeyToolStack", "Stack Optimizer", "Which subscription is actually worth keeping"],
    ["#doctor", "journeyToolDoctor", "Prompt Doctor", "Score a prompt and see the fixed version"],
    ["#arena", "journeyToolArena", "Blind Arena", "Your preference, measured on your prompts"],
    ["#radar", "journeyToolRadar", "Model Radar", "What changed, dated, with sources"],
    ["#topics", "journeyToolTopics", "AI Debates", "The arguments, both sides, with numbers"]
  ];

  function buildTools() {
    var grid = $("act-tools-grid");
    if (!grid) return;
    grid.innerHTML = "";
    TOOLS.forEach(function (t, i) {
      var card = el("button", "act-tool");
      card.type = "button";
      card.style.setProperty("--i", String(i));
      card.appendChild(el("strong", null, T(t[1], t[2])));
      card.appendChild(el("span", null, t[3]));
      card.addEventListener("click", function () {
        if (window.WhichAIWelcome && window.WhichAIWelcome.leaveTo) window.WhichAIWelcome.leaveTo(t[0]);
        else location.hash = t[0];
      });
      grid.appendChild(card);
    });
  }

  /* ---------- the spine: where you are in the descent ---------- */

  function buildSpine() {
    spine = $("journey-spine");
    if (!spine) return;
    spine.innerHTML = "";
    var line = el("span", "spine-line");
    var fill = el("span", "spine-fill");
    line.appendChild(fill);
    spine.appendChild(line);
    spine.fillEl = fill;
    acts.forEach(function (a, i) {
      var dot = el("button", "spine-dot");
      dot.type = "button";
      dot.setAttribute("aria-label", a.title);
      dot.style.setProperty("--i", String(i));
      dot.appendChild(el("span", "spine-label", a.title));
      dot.addEventListener("click", function () {
        a.node.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      spine.appendChild(dot);
      a.dot = dot;
    });
  }

  /* On a wide screen the acts occupy the left column, so the constellation is
     pushed into the space beside them. On a phone there is no such space and
     it stays centred behind the text. */
  function applyOffset() {
    if (!stage) return;
    var w = window.innerWidth;
    var kind = document.body.getAttribute("data-stage-kind");
    if (w < 1024) { stage.setOffset(0); return; }
    stage.setOffset(kind === "flat" ? Math.min(220, w * 0.16) : 11);
  }

  function onScroll() {
    if (!scroller) return;
    var max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    var raw = scroller.scrollTop / max;
    progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;

    /* The hero occupies the first screen; the constellation should not start
       morphing until the reader has actually left it. */
    var heroH = scroller.clientHeight;
    var past = Math.max(0, scroller.scrollTop - heroH * 0.35);
    var span = Math.max(1, scroller.scrollHeight - scroller.clientHeight - heroH * 0.35);
    var sceneP = Math.min(1, past / span);
    if (stage) stage.setProgress(sceneP);

    if (spine && spine.fillEl) {
      spine.fillEl.style.transform = "scaleY(" + progress + ")";
      spine.style.setProperty("--p", String(progress));
    }

    /* offsetTop is measured against the offset parent, which is not the scroll
       container here: comparing it with scrollTop put the marker one act ahead.
       Rects are in viewport space for both, so they actually agree. */
    var box = scroller.getBoundingClientRect();
    var line = box.top + box.height * 0.42;
    var active = -1;
    acts.forEach(function (a, i) {
      var r = a.node.getBoundingClientRect();
      if (r.top <= line) active = i;
      a.node.classList.toggle("act-in", r.top < box.bottom - box.height * 0.12);
    });
    acts.forEach(function (a, i) {
      if (a.dot) a.dot.classList.toggle("is-active", i === active);
    });
    document.body.classList.toggle("journey-scrolled", scroller.scrollTop > heroH * 0.3);
  }

  /* ---------- hover readout over the constellation ---------- */

  function showTip(model, hit) {
    var tip = $("stage-tip");
    if (!tip) return;
    if (!model || !hit) { tip.hidden = true; return; }
    tip.innerHTML = "";
    var name = el("strong", null, model.name);
    tip.appendChild(name);
    tip.appendChild(el("span", "stage-tip-vendor", model.vendor));
    if (model.score && typeof model.score.aa === "number") {
      tip.appendChild(el("span", "stage-tip-score", "AA " + model.score.aa));
    }
    if (model.spec && typeof model.spec.priceOut === "number") {
      tip.appendChild(el("span", "stage-tip-price", "$" + model.spec.priceOut + " /1M out"));
    }
    var r = $("stage-canvas").getBoundingClientRect();
    tip.style.left = Math.round(hit.sx - r.left) + "px";
    tip.style.top = Math.round(hit.sy - r.top) + "px";
    tip.hidden = false;
  }

  /* ---------- boot ---------- */

  function collectActs() {
    acts = [];
    var nodes = document.querySelectorAll("#journey .act");
    Array.prototype.forEach.call(nodes, function (n) {
      var t = n.querySelector(".act-eyebrow");
      acts.push({ node: n, title: t ? t.textContent : n.id, dot: null });
    });
  }

  var Journey = {
    init: function (dependencies) {
      deps = dependencies || {};
      if (built) return;
      built = true;
      /* The scroll container is the welcome overlay itself: the inner
         wrapper has no overflow and would report scrollTop 0 forever. */
      scroller = $("welcome");
      if (!scroller) return;

      collectActs();
      buildSpine();
      buildStats();
      buildLadder();
      buildTools();

      var canvas = $("stage-canvas");
      if (canvas && window.WhichAIStage) {
        stage = window.WhichAIStage.create(canvas, {
          onHover: showTip,
          onReady: function (kind) { document.body.setAttribute("data-stage-kind", kind); }
        });
        var mounted = stage.mount();
        if (mounted && mounted.then) mounted.then(function () {
          applyOffset();
          window.addEventListener("resize", applyOffset, { passive: true });
        });
      }

      scroller.addEventListener("scroll", function () {
        if (Journey._tick) return;
        Journey._tick = requestAnimationFrame(function () { Journey._tick = null; onScroll(); });
      }, { passive: true });

      var cue = $("journey-cue");
      if (cue) cue.addEventListener("click", function () {
        var first = acts[0];
        if (first) first.node.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      var form = $("act-goal-form");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = ($("act-goal-input").value || "").trim();
        if (v.length < 3) return;
        answerGoal(v);
      });

      onScroll();
    },

    /* The welcome module owns show/hide; the journey resets with it so a
       second visit starts at the top of the story rather than mid-scroll. */
    reset: function () {
      if (scroller) scroller.scrollTop = 0;
      var box = $("act-answer");
      if (box) box.hidden = true;
      onScroll();
    },

    relabel: function () {
      if (!built) return;
      buildStats();
      buildTools();
    },

    progress: function () { return progress; },
    stage: function () { return stage; }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAIJourney = Journey;
  if (typeof module !== "undefined" && module.exports) module.exports = Journey;
})();
