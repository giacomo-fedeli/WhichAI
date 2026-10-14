/*
 * WhichAI - motion: one page, six chapters, visibly connected (v0.37.0)
 *
 * The site is a single scroll, so movement carries the story:
 *   - progress   a hairline under the header and a chapter rail that fill as
 *                you read, and the chapter you are in, named in the header
 *   - accent     every chapter owns a colour; crossing from one chapter into
 *                the next blends the page accent between the two
 *   - reveal     blocks enter once, softly, when they reach the screen
 *   - mount      heavy chapters render only when the reader gets near them
 *   - flip       lists that reorder (tiers, filters) glide to their new place
 *   - frames     every frame's geometry is handed to listeners (the dot field
 *                behind the page, js/dotfield.js, draws its transitions from it)
 *
 * v0.37 removed the "morph" ghosts that carried a card from one chapter to the
 * next: they had to settle somewhere when the reader stopped half-way, and the
 * settling read as a jolt. The connection is now drawn by the dot field, which
 * is a pure function of the scroll position and simply stops when you do.
 *
 * Only transform and opacity move every frame, geometry is measured once per
 * layout change, and everything turns itself off for prefers-reduced-motion.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var doc = root.document;
  var reduced = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var chapters = [];   // { el, id, rgb:[r,g,b], top, bottom }
  var mounts = [];     // { el, fn, done }
  var listeners = [];  // onChapter callbacks
  var frameFns = [];   // onFrame callbacks
  var current = -1;
  var vh = 800, vw = 1200, sy = 0, queued = false, dirty = true;
  var accentRgb = [37, 99, 235];
  var layoutVersion = 0;
  var bar = null, railFill = null, railLinks = [];
  var io = null, mountIo = null;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rgbOf(s) {
    var p = String(s || "").trim().split(/[\s,]+/).map(Number);
    return p.length === 3 && p.every(function (n) { return n >= 0 && n <= 255; }) ? p : [37, 99, 235];
  }

  /* ---------- measuring: once per layout change, never per frame ---------- */

  var docH = 0;

  function measure() {
    vh = root.innerHeight || 800;
    vw = root.innerWidth || 1200;
    docH = doc.documentElement.scrollHeight || vh;
    chapters.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      c.top = r.top + sy;
      c.bottom = r.bottom + sy;
    });
    layoutVersion++;
    dirty = false;
  }

  function schedule() {
    if (queued) return;
    queued = true;
    (root.requestAnimationFrame || setTimeout)(frame);
  }

  function frame() {
    queued = false;
    sy = root.scrollY || root.pageYOffset || 0;
    if (dirty) measure();
    paintProgress();
    paintAccent();
    if (frameFns.length) {
      var state = { sy: sy, vh: vh, vw: vw, chapters: chapters, rgb: accentRgb, layout: layoutVersion };
      frameFns.forEach(function (fn) { try { fn(state); } catch (e) { /* a broken listener must not stop the page */ } });
    }
  }

  /* ---------- progress, rail and the current chapter ---------- */

  function paintProgress() {
    var max = Math.max(1, docH - vh);
    var p = clamp(sy / max, 0, 1);
    if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (!chapters.length) return;
    var line = sy + vh * 0.42;
    var idx = 0;
    for (var i = 0; i < chapters.length; i++) if (line >= chapters[i].top) idx = i;
    var c = chapters[idx];
    var within = clamp((line - c.top) / Math.max(1, c.bottom - c.top), 0, 1);
    if (railFill) {
      var f = chapters.length > 1 ? (idx + within) / chapters.length : within;
      railFill.style.transform = "scaleY(" + clamp(f, 0, 1).toFixed(4) + ")";
    }
    if (idx !== current) {
      current = idx;
      railLinks.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("data-rail") === c.id); });
      chapters.forEach(function (ch, k) { ch.el.classList.toggle("is-current", k === idx); });
      listeners.forEach(function (fn) { try { fn(c.id, idx); } catch (e) { /* a broken listener must not stop the page */ } });
    }
  }

  function paintAccent() {
    if (!chapters.length) return;
    var line = sy + vh * 0.5;
    var i = 0;
    for (var k = 0; k < chapters.length; k++) if (line >= chapters[k].top) i = k;
    var a = chapters[i], b = chapters[i + 1];
    var rgb = a.rgb;
    if (b) {
      var zone = Math.min(vh * 0.7, (a.bottom - a.top) * 0.35);
      var t = clamp((line - (a.bottom - zone)) / Math.max(1, zone), 0, 1);
      rgb = [0, 1, 2].map(function (j) { return Math.round(lerp(a.rgb[j], b.rgb[j], t)); });
    }
    accentRgb = rgb;
    doc.documentElement.style.setProperty("--accent-rgb", rgb.join(" "));
  }

  /* ---------- reveal and lazy mount ---------- */

  function observeReveal(scope) {
    var els = (scope || doc).querySelectorAll("[data-reveal]:not(.is-in)");
    if (reduced || !io) { Array.prototype.forEach.call(els, function (el) { el.classList.add("is-in"); }); return; }
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  function runMount(m) {
    if (m.done) return;
    m.done = true;
    try { m.fn(m.el); } catch (e) { if (root.console) console.error("[WhichAI] mount failed:", e); }
    dirty = true;
    schedule();
  }

  /* ---------- public API ---------- */

  var Motion = {
    reduced: reduced,

    init: function (opts) {
      opts = opts || {};
      bar = doc.getElementById(opts.progress || "progress-bar");
      railFill = doc.getElementById(opts.railFill || "rail-fill");
      railLinks = Array.prototype.slice.call(doc.querySelectorAll("[data-rail]"));
      chapters = Array.prototype.slice.call(doc.querySelectorAll("[data-chapter]")).map(function (el) {
        return { el: el, id: el.getAttribute("data-chapter"), rgb: rgbOf(el.getAttribute("data-accent")), top: 0, bottom: 0 };
      });
      if (typeof root.IntersectionObserver === "function") {
        io = new root.IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
        mountIo = new root.IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            mounts.forEach(function (m) { if (m.el === en.target) runMount(m); });
            mountIo.unobserve(en.target);
          });
        }, { rootMargin: "900px 0px 900px 0px" });
      }
      observeReveal(doc);
      root.addEventListener("scroll", schedule, { passive: true });
      root.addEventListener("resize", function () { dirty = true; schedule(); });
      if (typeof root.ResizeObserver === "function") {
        new root.ResizeObserver(function () { dirty = true; schedule(); }).observe(doc.body);
      }
      dirty = true;
      schedule();
    },

    /** run fn(el) once, when el gets within ~one screen of the viewport */
    mount: function (el, fn) {
      if (!el || typeof fn !== "function") return;
      var m = { el: el, fn: fn, done: false };
      mounts.push(m);
      if (mountIo) mountIo.observe(el); else runMount(m);
    },
    /** force a pending mount now (deep links, a click from another chapter) */
    mountNow: function (el) { mounts.forEach(function (m) { if (m.el === el) runMount(m); }); },

    reveal: observeReveal,

    /** geometry changed outside of a resize (new content, filters) */
    refresh: function () {
      dirty = true;
      schedule();
    },

    /** fn({ sy, vh, vw, chapters:[{ id, top, bottom }], rgb, layout }) on
        every frame the page moves or changes size (layout counts re-measures);
        called once right away */
    onFrame: function (fn) {
      if (typeof fn !== "function") return;
      frameFns.push(fn);
      dirty = true;
      schedule();
    },

    onChapter: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    current: function () { return chapters[current] ? chapters[current].id : null; },

    /** FLIP: elements marked data-flip="key" glide from where they were to
        where mutate() puts them; newcomers pop in. */
    flip: function (container, mutate) {
      if (!container) { mutate(); return; }
      var canAnimate = !reduced && typeof container.animate === "function";
      var before = {};
      if (canAnimate) {
        Array.prototype.forEach.call(container.querySelectorAll("[data-flip]"), function (el) {
          before[el.getAttribute("data-flip")] = el.getBoundingClientRect();
        });
      }
      mutate();
      Motion.refresh();
      if (!canAnimate) return;
      var n = 0;
      Array.prototype.forEach.call(container.querySelectorAll("[data-flip]"), function (el) {
        var b = before[el.getAttribute("data-flip")];
        var a = el.getBoundingClientRect();
        if (!b) {
          el.animate([{ opacity: 0, transform: "scale(.82)" }, { opacity: 1, transform: "none" }],
            { duration: 320, delay: Math.min(240, n++ * 6), easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
          return;
        }
        var dx = b.left - a.left, dy = b.top - a.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
          { duration: 560, easing: "cubic-bezier(.2,.8,.2,1)" });
      });
    },

    /** count a number up from zero once it is on screen */
    count: function (el, to, decimals) {
      if (!el) return;
      var d = decimals || 0;
      var fmt = function (v) { return d ? v.toFixed(d) : String(Math.round(v)); };
      if (reduced || typeof root.requestAnimationFrame !== "function" || !isFinite(to)) { el.textContent = isFinite(to) ? fmt(to) : "-"; return; }
      var start = null, dur = 900;
      el.textContent = fmt(0);
      function step(ts) {
        if (start === null) start = ts;
        var t = clamp((ts - start) / dur, 0, 1);
        el.textContent = fmt(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) root.requestAnimationFrame(step);
      }
      root.requestAnimationFrame(step);
    },

    /* exposed for tests */
    _ease: ease
  };

  root.WhichAIMotion = Motion;
  if (typeof module !== "undefined" && module.exports) module.exports = Motion;
})();
