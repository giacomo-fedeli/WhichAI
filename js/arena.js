/*
 * WhichAI - Blind Arena (v0.28.0)
 * A/B blind rounds between the models YOUR free keys can auto-run
 * (Gemini via AI Studio, Llama via Groq, open models via OpenRouter).
 * Votes build a personal, local Elo. This measures your preference on
 * your prompts, not global model quality - and says so.
 */
(function () {
  "use strict";

  var deps = null; // { T, families() -> [{id,label,available}], run(id,prompt)->Promise<string>, openSettings() }
  var root = null;
  var ELO_KEY = "pc_elo_v1";
  var K = 32;
  var START = 1000;

  var state = { prompt: "", round: null };
  // round: { a, b, order: [x, y] (display order), out: {famId: text}, err: {famId: msg}, done: bool, voted: bool, winner: null|famId|"tie" }

  function loadElo() {
    try { return JSON.parse(localStorage.getItem(ELO_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveElo(elo) {
    try { localStorage.setItem(ELO_KEY, JSON.stringify(elo)); } catch (e) { /* ignore */ }
  }

  /** Pure Elo update; exposed for tests. result: 1 = a wins, 0 = b wins, 0.5 = tie */
  function eloUpdate(elo, a, b, result) {
    var ea = elo[a] || { r: START, g: 0 };
    var eb = elo[b] || { r: START, g: 0 };
    var expA = 1 / (1 + Math.pow(10, (eb.r - ea.r) / 400));
    var newA = Math.round(ea.r + K * (result - expA));
    var newB = Math.round(eb.r + K * ((1 - result) - (1 - expA)));
    elo[a] = { r: newA, g: ea.g + 1 };
    elo[b] = { r: newB, g: eb.g + 1 };
    return elo;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function pickTwo(av) {
    var pool = av.slice();
    var i = Math.floor(Math.random() * pool.length);
    var a = pool.splice(i, 1)[0];
    var j = Math.floor(Math.random() * pool.length);
    var b = pool[j];
    return Math.random() < 0.5 ? [a, b] : [b, a];
  }

  function startRound() {
    var av = deps.families().filter(function (f) { return f.available; });
    if (av.length < 2) return;
    var pair = pickTwo(av);
    state.round = { a: pair[0], b: pair[1], order: pair.slice(), out: {}, err: {}, done: false, voted: false, winner: null };
    render();
    ["a", "b"].forEach(function (side) {
      var fam = state.round[side];
      deps.run(fam.id, state.prompt).then(function (text) {
        if (!state.round || state.round[side] !== fam) return;
        state.round.out[fam.id] = text;
        checkDone();
      }).catch(function (err) {
        if (!state.round || state.round[side] !== fam) return;
        state.round.err[fam.id] = (err && err.message) ? err.message : "request failed";
        checkDone();
      });
    });
  }

  function checkDone() {
    var r = state.round;
    if (!r) return;
    var settled = [r.a, r.b].every(function (f) { return r.out[f.id] != null || r.err[f.id] != null; });
    if (settled) r.done = true;
    render();
  }

  function vote(result) { // 1 a-side wins, 0 b-side wins, 0.5 tie (sides are DISPLAY sides)
    var r = state.round;
    if (!r || r.voted || !r.done) return;
    var dispA = r.order[0], dispB = r.order[1];
    var elo = eloUpdate(loadElo(), dispA.id, dispB.id, result);
    saveElo(elo);
    r.voted = true;
    r.winner = result === 0.5 ? "tie" : (result === 1 ? dispA.id : dispB.id);
    render();
  }

  function render() {
    if (!root) return;
    root.innerHTML = "";

    var card = el("div", "card finder-card arena-card");
    card.appendChild(el("h2", "finder-title", deps.T("arenaTitle")));
    card.appendChild(el("p", "finder-sub", deps.T("arenaSub")));

    var av = deps.families().filter(function (f) { return f.available; });
    if (av.length < 2) {
      var warn = el("div", "card finder-result arena-warn");
      warn.appendChild(el("p", "finder-line", deps.T("arenaNeedKeys")));
      var go = el("button", "btn-primary btn-inline", deps.T("navSettings"));
      go.type = "button";
      go.addEventListener("click", function () { deps.openSettings(); });
      var acts = el("div", "compare-actions");
      acts.appendChild(go);
      warn.appendChild(acts);
      card.appendChild(warn);
      root.appendChild(card);
      renderBoard();
      return;
    }

    var pool = el("p", "router-meta", deps.T("arenaPool") + " " + av.map(function (f) { return f.label; }).join(" · "));
    card.appendChild(pool);

    var ta = document.createElement("textarea");
    ta.id = "arena-input";
    ta.rows = 3;
    ta.placeholder = deps.T("arenaPh");
    ta.value = state.prompt;
    ta.addEventListener("input", function () { state.prompt = ta.value; });
    card.appendChild(ta);

    var row = el("div", "compare-actions");
    var go2 = el("button", "btn-primary btn-inline", state.round ? deps.T("arenaNext") : deps.T("arenaGo"));
    go2.type = "button";
    go2.addEventListener("click", function () {
      if (!ta.value.trim()) { ta.focus(); return; }
      state.prompt = ta.value.trim();
      startRound();
    });
    row.appendChild(go2);
    card.appendChild(row);
    root.appendChild(card);

    if (state.round) renderRound();
    renderBoard();
  }

  function renderRound() {
    var r = state.round;
    var wrap = el("div", "arena-round");

    var panes = el("div", "arena-panes");
    r.order.forEach(function (fam, i) {
      var letter = i === 0 ? "A" : "B";
      var pane = el("div", "card arena-pane" + (r.voted && r.winner === fam.id ? " arena-winner" : ""));
      var head = el("div", "db-row-head");
      var title = el("span", "panel-model", r.voted ? fam.label : deps.T("arenaModel") + " " + letter);
      head.appendChild(title);
      if (r.voted && r.winner === fam.id) head.appendChild(el("span", "win-badge", deps.T("winner")));
      pane.appendChild(head);
      var pre = el("pre", "prompt-text prompt-text-sm arena-out");
      if (r.err[fam.id]) {
        pre.textContent = "";
        var errP = el("p", "run-status error", "Error: " + r.err[fam.id]);
        pane.appendChild(errP);
      } else if (r.out[fam.id] != null) {
        pre.textContent = r.out[fam.id];
        pane.appendChild(pre);
      } else {
        var load = el("p", "run-status", deps.T("arenaRunning"));
        pane.appendChild(load);
      }
      panes.appendChild(pane);
    });
    wrap.appendChild(panes);

    if (r.done && !r.voted) {
      var okA = r.err[r.order[0].id] == null;
      var okB = r.err[r.order[1].id] == null;
      if (okA && okB) {
        var voteRow = el("div", "compare-actions arena-vote");
        var bA = el("button", "btn-primary btn-inline", "A " + deps.T("arenaBetter"));
        bA.type = "button";
        bA.addEventListener("click", function () { vote(1); });
        var bTie = el("button", "btn-copy", deps.T("tie"));
        bTie.type = "button";
        bTie.addEventListener("click", function () { vote(0.5); });
        var bB = el("button", "btn-primary btn-inline", "B " + deps.T("arenaBetter"));
        bB.type = "button";
        bB.addEventListener("click", function () { vote(0); });
        voteRow.appendChild(bA);
        voteRow.appendChild(bTie);
        voteRow.appendChild(bB);
        wrap.appendChild(voteRow);
      } else {
        wrap.appendChild(el("p", "run-status error", deps.T("arenaRoundErr")));
      }
    }
    if (r.voted) {
      wrap.appendChild(el("p", "router-meta arena-reveal", deps.T("arenaReveal") + " A = " + r.order[0].label + " · B = " + r.order[1].label));
    }
    root.appendChild(wrap);
  }

  function renderBoard() {
    var elo = loadElo();
    var fams = deps.families();
    var rows = Object.keys(elo).map(function (id) {
      var f = fams.filter(function (x) { return x.id === id; })[0];
      return { id: id, label: f ? f.label : id, r: elo[id].r, g: elo[id].g };
    }).filter(function (x) { return x.g > 0; }).sort(function (a, b) { return b.r - a.r; });
    if (!rows.length) return;

    var card = el("div", "card finder-result arena-board");
    card.appendChild(el("p", "finder-block-title", deps.T("arenaBoard")));
    var grid = el("div", "arena-board-grid");
    rows.forEach(function (x, i) {
      grid.appendChild(el("div", "arena-rank", "#" + (i + 1)));
      grid.appendChild(el("div", "arena-name", x.label));
      grid.appendChild(el("div", "arena-elo", String(x.r)));
      grid.appendChild(el("div", "arena-games", x.g + " " + deps.T("arenaGames")));
    });
    card.appendChild(grid);
    var reset = el("button", "btn-link danger", deps.T("arenaReset"));
    reset.type = "button";
    reset.addEventListener("click", function () {
      if (!window.confirm(deps.T("arenaReset") + "?")) return;
      try { localStorage.removeItem(ELO_KEY); } catch (e) { /* ignore */ }
      render();
    });
    card.appendChild(reset);
    card.appendChild(el("p", "router-meta", deps.T("arenaNote")));
    root.appendChild(card);
  }

  var Arena = {
    init: function (rootEl, dependencies) {
      root = rootEl;
      deps = dependencies;
      render();
    },
    rerender: function () { if (root && deps) render(); },
    /* exposed for tests */
    _elo: eloUpdate,
    _pickTwo: pickTwo
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIArena = Arena;
  if (typeof module !== "undefined" && module.exports) module.exports = Arena;
})();
