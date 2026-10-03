/*
 * WhichAI - the catalog that updates itself, browser side (v0.35.0)
 *
 * js/models-db.js is the editorial layer: reviews, caveats, categories, and an
 * offline copy of the numbers. This module lays the current public data on top
 * of it, with no button to press and no deploy to wait for:
 *
 *   1. at load, synchronously: the newest of the build-time seed
 *      (js/live-seed.js, written at every deploy) and the copy this browser
 *      saved last time - so the first paint is already current
 *   2. a moment later: GET /api/catalog (cached at the edge for an hour), which
 *      re-reads OpenRouter's public model list and the official Artificial
 *      Analysis indices it relays
 *
 * Applying a delta: official scores and prices replace the stored ones, missing
 * context windows and dates are filled, models Artificial Analysis has measured
 * appear on their own (marked "auto"), and the free routes that exist right now
 * become available to heal a dead auto-run default. Reviews are never touched,
 * nothing is deleted, and a malformed or older delta is ignored.
 *
 * Views listen for the "whichai:data" event and redraw.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var KEY = "whichai_live_catalog_v1";
  var ENDPOINT = "/api/catalog";
  var SCHEMA = 1;
  var KIND = "whichai-live-catalog";
  var MAX_AGE_MS = 14 * 24 * 3600 * 1000;
  var TAGS_ALLOWED = { free: 1, "open-weights": 1, api: 1, paid: 1, legacy: 1 };
  var LABELS_ALLOWED = { coding: 1, reasoning: 1, writing: 1, research: 1, agents: 1, speed: 1, value: 1, multilingual: 1, vision: 1, "long-context": 1, local: 1, enterprise: 1 };

  var state = { applied: null, source: null, fetching: false, error: null, last: null };
  var listeners = [];

  /* ---------- validation: a bad delta must never become data ---------- */

  function isDelta(d) {
    return !!d && typeof d === "object" && d.schemaVersion === SCHEMA && d.kind === KIND &&
      typeof d.retrievedAt === "string" && !isNaN(Date.parse(d.retrievedAt)) &&
      !!d.patches && typeof d.patches === "object" && Array.isArray(d.added) && Array.isArray(d.freeRoutes);
  }
  function str(v, max) {
    return typeof v === "string" ? v.replace(/[<>\u0000-\u001f\u007f]/g, "").slice(0, max || 400) : null;
  }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : null; }
  function list(v, allowed, max) {
    if (!Array.isArray(v)) return [];
    return v.filter(function (x) { return typeof x === "string" && (!allowed || allowed[x]); }).map(function (x) { return str(x, 180); }).slice(0, max || 12);
  }
  function route(v) { return typeof v === "string" && /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:+-]*$/i.test(v) && v.length <= 180 ? v : null; }
  function cleanLive(l) {
    if (!l || typeof l !== "object") return null;
    var out = { or: route(l.or), at: str(l.at, 10) };
    if (typeof l.url === "string" && /^https:\/\/openrouter\.ai\//.test(l.url)) out.url = str(l.url, 220);
    if (route(l.free)) out.free = l.free;
    return out.or ? out : null;
  }
  function cleanAdded(a) {
    if (!a || typeof a !== "object" || !a.score) return null;
    var id = str(a.id, 80), name = str(a.name, 80), vendor = str(a.vendor, 60), aa = num(a.score.aa);
    if (!id || !/^[a-z0-9-]+$/.test(id) || !name || !vendor || aa == null) return null;
    var spec = a.spec && typeof a.spec === "object" ? a.spec : {};
    var out = {
      id: id, name: name, vendor: vendor, family: str(a.family, 20), status: a.status === "legacy" ? "legacy" : "public",
      spec: { released: str(spec.released, 10), ctx: str(spec.ctx, 10), modal: str(spec.modal, 60), priceIn: num(spec.priceIn), priceOut: num(spec.priceOut), priceSrc: str(spec.priceSrc, 30) },
      access: str(a.access, 300) || "",
      tags: list(a.tags, TAGS_ALLOWED), labels: list(a.labels, LABELS_ALLOWED),
      score: { aa: aa, est: false, src: "aa", coding: num(a.score.coding), agentic: num(a.score.agentic), at: str(a.score.at, 10) },
      review: str(a.review, 700) || "",
      auto: true,
      or: list(a.or).filter(route),
      live: cleanLive(a.live)
    };
    return out.or.length ? out : null;
  }

  /* ---------- apply ---------- */

  function applyDelta(DB, delta) {
    if (!DB || !Array.isArray(DB.models) || !isDelta(delta)) return { ok: false, reason: "invalid" };
    var byId = {}, claimed = {};
    DB.models.forEach(function (m) {
      byId[m.id] = m;
      (m.or || []).forEach(function (r) { claimed[r] = m.id; });
    });
    var patched = 0, added = 0, scores = 0, prices = 0;

    Object.keys(delta.patches).forEach(function (id) {
      var m = byId[id], p = delta.patches[id];
      if (!m || !p || typeof p !== "object") return;
      if (p.score && num(p.score.aa) != null) {
        m.score = m.score || {};
        if (m.score.aa !== p.score.aa || m.score.est) scores++;
        m.score.aa = p.score.aa;
        m.score.est = false;
        m.score.src = "aa";
        m.score.coding = num(p.score.coding);
        m.score.agentic = num(p.score.agentic);
        m.score.at = str(p.score.at, 10);
        delete m.score.guess;
        delete m.score.was;
        if (p.status === "public" && (m.status === "rumored" || m.status === "private")) m.status = "public";
      }
      if (p.spec && typeof p.spec === "object") {
        m.spec = m.spec || {};
        if (num(p.spec.priceIn) != null && num(p.spec.priceOut) != null) {
          if (m.spec.priceIn !== p.spec.priceIn || m.spec.priceOut !== p.spec.priceOut) prices++;
          m.spec.priceIn = p.spec.priceIn;
          m.spec.priceOut = p.spec.priceOut;
          m.spec.priceSrc = "OpenRouter";
        }
        if (str(p.spec.ctx, 10) && !m.spec.ctx) m.spec.ctx = p.spec.ctx;
        if (str(p.spec.released, 10) && !m.spec.released) m.spec.released = p.spec.released;
      }
      if (Array.isArray(p.priceWas) && num(p.priceWas[0]) != null && num(p.priceWas[1]) != null) m.priceWas = [p.priceWas[0], p.priceWas[1]];
      if (typeof p.access === "string" && p.access.length) m.access = str(p.access, 600);
      if (Array.isArray(p.addTags)) {
        m.tags = m.tags || [];
        list(p.addTags, TAGS_ALLOWED).forEach(function (t) { if (m.tags.indexOf(t) === -1) m.tags.push(t); });
      }
      var lv = cleanLive(p.live);
      if (lv) m.live = lv;
      patched++;
    });

    delta.added.forEach(function (raw) {
      var a = cleanAdded(raw);
      if (!a || byId[a.id]) return;
      if (a.or.some(function (r) { return claimed[r]; })) return;
      DB.models.push(a);
      byId[a.id] = a;
      a.or.forEach(function (r) { claimed[r] = a.id; });
      added++;
    });

    if (str(delta.updated, 40)) DB.updated = str(delta.updated, 40);
    if (str(delta.note, 700)) DB.scaleNote = str(delta.note, 700);
    DB.live = {
      at: delta.retrievedAt,
      editorial: str(delta.editorial, 40),
      source: "OpenRouter (prices, routes) · Artificial Analysis (scores)",
      freeRoutes: delta.freeRoutes.filter(function (f) { return f && route(f.id); }).map(function (f) {
        return { id: f.id, name: str(f.name, 80), vendor: str(f.vendor, 60), family: str(f.family, 20), aa: num(f.aa), ctx: num(f.ctx), expires: str(f.expires, 10) };
      }).slice(0, 60),
      arrivals: (Array.isArray(delta.arrivals) ? delta.arrivals : []).filter(function (a) { return a && str(a.date, 10) && str(a.name, 80); }).map(function (a) {
        return { date: str(a.date, 10), name: str(a.name, 80), vendor: str(a.vendor, 60), aa: num(a.aa), or: route(a.or), url: typeof a.url === "string" && /^https:\/\/openrouter\.ai\//.test(a.url) ? str(a.url, 220) : null, dbId: a.dbId && byId[a.dbId] ? a.dbId : null };
      }).slice(0, 24),
      counts: delta.counts && typeof delta.counts === "object" ? delta.counts : null
    };
    return { ok: true, patched: patched, added: added, scores: scores, prices: prices, at: delta.retrievedAt };
  }

  /* ---------- the browser lifecycle ---------- */

  function readCache() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return isDelta(d) && Date.now() - Date.parse(d.retrievedAt) < MAX_AGE_MS ? d : null;
    } catch (e) { return null; }
  }
  function writeCache(d) {
    try { if (root.localStorage) root.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* quota or private mode */ }
  }
  function newest(a, b) {
    if (!a) return b;
    if (!b) return a;
    return Date.parse(a.retrievedAt) >= Date.parse(b.retrievedAt) ? a : b;
  }
  function emit(result) {
    state.last = result;
    listeners.slice().forEach(function (fn) { try { fn(result); } catch (e) { /* a broken view must not stop the others */ } });
    try { root.dispatchEvent(new root.CustomEvent("whichai:data", { detail: result })); } catch (e) { /* old browsers, node */ }
  }

  function boot() {
    var DB = root.PromptCompassModelsDB;
    if (!DB) return null;
    var seed = isDelta(root.WhichAILiveSeed) ? root.WhichAILiveSeed : null;
    var best = newest(seed, readCache());
    if (!best) return null;
    var r = applyDelta(DB, best);
    if (r.ok) {
      state.applied = best.retrievedAt;
      state.source = best === seed ? "build" : "cache";
      state.last = r;
    }
    return r;
  }

  function refresh() {
    if (typeof root.fetch !== "function" || state.fetching) return Promise.resolve(null);
    if (root.navigator && root.navigator.onLine === false) return Promise.resolve(null);
    state.fetching = true;
    return root.fetch(ENDPOINT, { headers: { Accept: "application/json" } }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.json();
    }).then(function (d) {
      state.fetching = false;
      if (!isDelta(d)) { state.error = (d && d.status) || "invalid"; return null; }
      if (state.applied && Date.parse(d.retrievedAt) <= Date.parse(state.applied)) return null;
      var r = applyDelta(root.PromptCompassModelsDB, d);
      if (!r.ok) return null;
      state.applied = d.retrievedAt;
      state.source = "network";
      state.error = null;
      writeCache(d);
      emit(r);
      return r;
    }).catch(function (e) {
      state.fetching = false;
      state.error = String((e && e.message) || e);
      return null;
    });
  }

  /* "2 hours ago" in the reader's language, with no translation table. */
  function ago(lang) {
    if (!state.applied) return null;
    var s = Math.max(0, (Date.now() - Date.parse(state.applied)) / 1000);
    var steps = [[60, "second"], [3600, "minute"], [86400, "hour"], [Infinity, "day"]];
    var div = { second: 1, minute: 60, hour: 3600, day: 86400 };
    for (var i = 0; i < steps.length; i++) {
      if (s < steps[i][0]) {
        var unit = steps[i][1];
        var v = -Math.round(s / div[unit]);
        try { return new Intl.RelativeTimeFormat(lang || "en", { numeric: "auto" }).format(v, unit); }
        catch (e) { return Math.abs(v) + " " + unit + (Math.abs(v) === 1 ? "" : "s") + " ago"; }
      }
    }
    return null;
  }

  var Live = {
    applyDelta: applyDelta,
    isDelta: isDelta,
    cleanAdded: cleanAdded,
    boot: boot,
    refresh: refresh,
    ago: ago,
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    state: function () { return { applied: state.applied, source: state.source, error: state.error, last: state.last }; },
    freeRoutes: function () { var db = root.PromptCompassModelsDB; return db && db.live ? db.live.freeRoutes : []; },
    arrivals: function () { var db = root.PromptCompassModelsDB; return db && db.live ? db.live.arrivals : []; }
  };
  root.WhichAILiveCatalog = Live;
  if (typeof module !== "undefined" && module.exports) module.exports = Live;

  /* In a page: apply what we already have now, ask for fresher data once the
     page has settled. Never in Node (build, tests), which call these directly. */
  if (typeof document !== "undefined" && root.PromptCompassModelsDB) {
    boot();
    var go = function () { setTimeout(refresh, 300); };
    if (document.readyState === "complete") go();
    else root.addEventListener("load", go);
  }
})();
