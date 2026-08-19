/*
 * WhichAI - client for the WhichAI API (v0.30.0)
 *
 * The app ships a full copy of the catalog so it works offline and with no
 * network round trip. This module talks to /api on top of that, never
 * instead of it: every call has a short timeout and a local fallback, so a
 * cold serverless function, an offline device or a blocked request degrades
 * to exactly the behaviour of v0.29 rather than to an error.
 *
 * Nothing user-owned is ever sent: no goal text, no keys, no identifiers.
 * The endpoints are read-only and take no body.
 */
(function () {
  "use strict";

  var TIMEOUT_MS = 3500;
  var BASE = "/api";
  var cache = {};
  var state = { reachable: null, checkedAt: 0, info: null };

  function canFetch() {
    return typeof fetch === "function" && typeof AbortController === "function";
  }

  /* Resolves with the parsed body, or with null when anything at all goes
     wrong. Callers never have to handle an error path: they handle null. */
  function get(path, params) {
    if (!canFetch()) return Promise.resolve(null);
    var url = BASE + path;
    if (params) {
      var qs = Object.keys(params)
        .filter(function (k) { return params[k] != null && params[k] !== ""; })
        .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); })
        .join("&");
      if (qs) url += "?" + qs;
    }
    if (cache[url]) return Promise.resolve(cache[url]);

    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, TIMEOUT_MS);
    return fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" }, credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j) cache[url] = j;
        state.reachable = !!j;
        return j;
      })
      .catch(function () { state.reachable = false; return null; })
      .then(function (j) { clearTimeout(timer); return j; });
  }

  /* One health call per session decides whether the backend is worth using. */
  function health() {
    if (state.info) return Promise.resolve(state.info);
    return get("/health").then(function (j) {
      state.info = j;
      state.checkedAt = Date.now();
      return j;
    });
  }

  var Api = {
    base: BASE,
    get: get,
    health: health,
    models: function (params) { return get("/models", params); },
    model: function (id) { return get("/models", { id: id }); },
    benchmarks: function (task) { return get("/benchmarks", task ? { task: task } : null); },
    recommend: function (goal) { return get("/recommend", { goal: String(goal || "").slice(0, 600) }); },
    stats: function (top) { return get("/stats", top ? { top: top } : null); },
    isReachable: function () { return state.reachable; },

    /* Paints the small "API" pill next to the data snapshot line in the
       Model guide: live when the backend answers, local when it does not.
       Either way the page already has its data - this only tells the truth
       about where it came from. */
    renderStatus: function (el) {
      if (!el) return;
      el.hidden = true;
      health().then(function (j) {
        el.hidden = false;
        el.textContent = "";
        var dot = document.createElement("span");
        dot.className = "api-dot" + (j ? " live" : " local");
        dot.setAttribute("aria-hidden", "true");
        el.appendChild(dot);
        var label = document.createElement("span");
        if (j) {
          label.textContent = "API live · " + j.data.models + " models · " + j.data.dataUpdated;
          el.title = "Served by the WhichAI API (" + j.region + "). Read-only, no account, no tracking.";
        } else {
          label.textContent = "Offline · using the built-in catalog";
          el.title = "The API did not answer, so this page is using the copy bundled with the app.";
        }
        el.appendChild(label);
      });
    }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAIApi = Api;
  if (typeof module !== "undefined" && module.exports) module.exports = Api;
})();
