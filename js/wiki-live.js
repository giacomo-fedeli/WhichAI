/*
 * WhichAI - live figures for the static wiki (v0.35.0)
 * The wiki is plain HTML generated at deploy time, from data read at that
 * moment. Between deploys this script keeps its figures current: it reads the
 * same delta the app uses (this browser's saved copy first, then
 * /api/catalog) and rewrites only the elements marked data-live-*. Without
 * JavaScript, or if the API is down, the page simply shows its deploy-time
 * numbers. No tracking, no third-party request.
 */
(function () {
  "use strict";
  var KEY = "whichai_live_catalog_v1";

  function ok(d) { return d && d.kind === "whichai-live-catalog" && d.schemaVersion === 1 && d.patches && Array.isArray(d.added); }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  function apply(d) {
    if (!ok(d)) return;
    var added = {};
    d.added.forEach(function (a) { if (a && a.id) added[a.id] = a; });
    function scoreOf(id) {
      var p = d.patches[id];
      if (p && p.score && typeof p.score.aa === "number") return p.score.aa;
      return added[id] && added[id].score ? added[id].score.aa : null;
    }
    function priceOf(id) {
      var p = d.patches[id], s = p && p.spec ? p.spec : (added[id] ? added[id].spec : null);
      return s && typeof s.priceIn === "number" && typeof s.priceOut === "number" ? [s.priceIn, s.priceOut] : null;
    }
    each("[data-live-score]", function (el) {
      var v = scoreOf(el.getAttribute("data-live-score"));
      if (typeof v === "number") el.textContent = v + " (official, read " + d.updated + ")";
    });
    each("[data-live-price]", function (el) {
      var v = priceOf(el.getAttribute("data-live-price"));
      if (v) el.textContent = "$" + v[0] + " / $" + v[1] + " (OpenRouter, read " + d.updated + ")";
    });
    each("[data-live-updated]", function (el) { el.textContent = d.updated; });

    /* The models index lists what existed at deploy time; anything measured
       since is announced here and opens in the app. */
    var box = document.getElementById("live-new-models");
    if (box) {
      var known = {};
      each("a[href^='/models/']", function (a) { known[a.getAttribute("href").replace(/^\/models\//, "").replace(/\.html$/, "")] = true; });
      var fresh = d.added.filter(function (a) { return a && a.id && !known[a.id]; }).slice(0, 12);
      if (fresh.length) {
        box.textContent = "";
        var p = document.createElement("p");
        p.className = "router-meta";
        p.textContent = "Measured since this page was generated (" + d.updated + "): ";
        fresh.forEach(function (a, i) {
          var link = document.createElement("a");
          link.href = "/#model=" + encodeURIComponent(a.id);
          link.textContent = a.name + " (" + a.score.aa + ")";
          if (i) p.appendChild(document.createTextNode(" · "));
          p.appendChild(link);
        });
        box.appendChild(p);
        box.hidden = false;
      }
    }
  }

  try { apply(JSON.parse(localStorage.getItem(KEY))); } catch (e) { /* nothing saved yet */ }
  if (typeof fetch === "function") {
    fetch("/api/catalog", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!ok(d)) return;
        apply(d);
        try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* private mode */ }
      })
      .catch(function () { /* offline: deploy-time figures stay */ });
  }
})();
