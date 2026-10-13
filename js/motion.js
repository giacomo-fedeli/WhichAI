/*
 * WhichAI - motion: one page, six chapters, visibly connected (v0.36.0)
 *
 * The site is a single scroll now, so movement carries the story:
 *   - progress   a hairline under the header and a chapter rail that fill as
 *                you read, and the chapter you are in, named in the header
 *   - accent     every chapter owns a colour; crossing from one chapter into
 *                the next blends the page accent between the two
 *   - reveal     blocks enter once, softly, when they reach the screen
 *   - mount      heavy chapters render only when the reader gets near them
 *   - morph      a "bridge" at the end of a chapter hands one element to the
 *                next one: a ghost lifts off the source, stays in view while
 *                you scroll, reshapes itself and lands on its target
 *   - flip       lists that reorder (tiers, filters) glide to their new place
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
  var morphs = [];     // { key, from, to, a, b, ghost, la, lb, state }
  var mounts = [];     // { el, fn, done }
  var listeners = [];  // onChapter callbacks
  var current = -1;
  var vh = 800, sy = 0, queued = false, dirty = true;
  var bar = null, railFill = null, railLinks = [];
  var io = null, mountIo = null;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rgbOf(s) {
    var p = String(s || "").trim().split(/[\s,]+/).map(Number);
    return p.length === 3 && p.every(function (n) { return n >= 0 && n <= 255; }) ? p : [37, 99, 235];
  }
  function docRect(el) {
    if (!el || !el.getBoundingClientRect) return null;
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { left: r.left, top: r.top + sy, width: r.width, height: r.height };
  }

  /* ---------- measuring: once per layout change, never per frame ---------- */

  var docH = 0;

  function moved(r1, r2) {
    return !r1 || !r2 || Math.abs(r1.width - r2.width) > 1 || Math.abs(r1.height - r2.height) > 1;
  }

  function measure() {
    vh = root.innerHeight || 800;
    docH = doc.documentElement.scrollHeight || vh;
    chapters.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      c.top = r.top + sy;
      c.bottom = r.bottom + sy;
    });
    morphs.forEach(function (m) {
      /* Ends are looked up again on every measure: a chapter that renders
         later (lazy mount, new data) can provide its target when it exists. */
      var from = doc.querySelector('[data-morph-from="' + m.key + '"]');
      var to = doc.querySelector('[data-morph-to="' + m.key + '"]');
      if (from !== m.from || to !== m.to) {
        if (m.ghost) { m.ghost.remove(); m.ghost = null; }
        if (m.from) m.from.style.opacity = "";
        if (m.to) m.to.style.opacity = "";
        m.state = "idle";
        m.from = from;
        m.to = to;
      }
      var a = docRect(m.from), b = docRect(m.to);
      /* Opacity never changes geometry, so a ghost in flight can be measured;
         if the source or target changed size, rebuild it on the next frame. */
      if (m.state === "flying" && (moved(a, m.a) || moved(b, m.b))) {
        if (m.ghost) { m.ghost.remove(); m.ghost = null; }
        m.state = "idle";
      }
      m.a = a;
      m.b = b;
    });
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
    if (!reduced) morphs.forEach(paintMorph);
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
    doc.documentElement.style.setProperty("--accent-rgb", rgb.join(" "));
  }

  /* ---------- the morph: a ghost that carries one chapter into the next ---------- */

  function stripIds(node) {
    if (node.removeAttribute) {
      node.removeAttribute("id");
      node.removeAttribute("data-morph-from");
      node.removeAttribute("data-morph-to");
      node.removeAttribute("data-reveal");
    }
    var kids = node.children || [];
    for (var i = 0; i < kids.length; i++) stripIds(kids[i]);
    return node;
  }

  function layer(src, rect) {
    var l = doc.createElement("div");
    l.className = "ghost-layer";
    var clone = stripIds(src.cloneNode(true));
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.margin = "0";
    clone.style.opacity = "1";
    clone.style.transform = "none";
    l.appendChild(clone);
    return l;
  }

  function buildGhost(m) {
    if (m.ghost) m.ghost.remove();
    var g = doc.createElement("div");
    g.className = "morph-ghost";
    g.setAttribute("aria-hidden", "true");
    m.la = layer(m.from, m.a);
    m.lb = layer(m.to, m.b);
    g.appendChild(m.la);
    g.appendChild(m.lb);
    doc.body.appendChild(g);
    m.ghost = g;
  }

  function land(m, p) {
    if (m.ghost) { m.ghost.remove(); m.ghost = null; }
    m.state = "idle";
    m.from.style.opacity = "";
    m.to.style.opacity = "";
    m.from.classList.toggle("morph-left", p >= 1);
    m.to.classList.toggle("morph-landed", p >= 1);
  }

  function progress(m) {
    var aC = m.a.top + m.a.height / 2, bC = m.b.top + m.b.height / 2;
    if (bC - aC < 80) return null;
    return (sy + vh * 0.5 - aC) / (bC - aC);
  }

  function paintMorph(m) {
    if (!m.from || !m.to) return;
    if (!m.a || !m.b || !m.from.isConnected || !m.to.isConnected) { if (m.ghost || m.state !== "idle") land(m, 0); return; }
    var p = progress(m);
    if (p === null) return;
    if (p <= 0 || p >= 1) {
      if (m.ghost || m.state !== "idle" || m.from.style.opacity || m.to.style.opacity) land(m, p);
      else { m.from.classList.toggle("morph-left", p >= 1); m.to.classList.toggle("morph-landed", p >= 1); }
      return;
    }
    /* A morph that settled while the reader paused stays put: landed on its
       target until the reader leaves the bridge, or back on its source
       until they scroll on. */
    if (m.state === "settling") return;
    if (m.state === "settled") {
      if (m.settleDir === "end" || p < m.settleP + 0.04) return;
      m.state = "idle";
    }
    if (m.state !== "flying" || !m.ghost) { m.state = "flying"; buildGhost(m); }
    var e = ease(p);
    var w = lerp(m.a.width, m.b.width, e);
    var h = lerp(m.a.height, m.b.height, e);
    var x = lerp(m.a.left, m.b.left, e);
    /* Linear in p: the ghost rides the reading line between the two places. */
    var y = lerp(m.a.top, m.b.top, p) - sy;
    var g = m.ghost;
    g.style.width = w.toFixed(1) + "px";
    g.style.height = h.toFixed(1) + "px";
    g.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    var lift = Math.sin(Math.PI * p);
    g.style.boxShadow = "0 " + (8 + 28 * lift).toFixed(0) + "px " + (24 + 50 * lift).toFixed(0) + "px -18px rgba(15,17,21," + (0.18 + 0.22 * lift).toFixed(2) + ")";
    var fadeA = clamp(1 - (e - 0.25) / 0.5, 0, 1);
    m.la.style.opacity = fadeA.toFixed(3);
    m.la.firstChild.style.transform = "scale(" + (w / m.a.width).toFixed(4) + ")";
    m.lb.style.opacity = (1 - fadeA).toFixed(3);
    m.lb.firstChild.style.transform = "scale(" + (w / m.b.width).toFixed(4) + ")";
    m.from.style.opacity = clamp(1 - p * 4, 0.12, 1).toFixed(3);
    m.to.style.opacity = "0";
  }

  /* Nobody reads a page through a floating ghost: when scrolling stops
     mid-bridge, the ghost glides to the nearer end and lands there. */
  function settleAll() {
    if (reduced) return;
    morphs.forEach(function (m) {
      if (m.state !== "flying" || !m.ghost || !m.a || !m.b) return;
      var p = progress(m);
      if (p === null) return;
      var toEnd = p >= 0.5;
      var r = toEnd ? m.b : m.a;
      var g = m.ghost;
      m.state = "settling";
      g.classList.add("is-settling");
      g.style.width = r.width.toFixed(1) + "px";
      g.style.height = r.height.toFixed(1) + "px";
      g.style.transform = "translate3d(" + r.left.toFixed(1) + "px," + (r.top - sy).toFixed(1) + "px,0)";
      m.la.style.opacity = toEnd ? "0" : "1";
      m.lb.style.opacity = toEnd ? "1" : "0";
      m.la.firstChild.style.transform = "scale(" + (r.width / m.a.width).toFixed(4) + ")";
      m.lb.firstChild.style.transform = "scale(" + (r.width / m.b.width).toFixed(4) + ")";
      setTimeout(function () {
        if (m.state !== "settling") return;
        land(m, toEnd ? 1 : 0);
        m.state = "settled";
        m.settleDir = toEnd ? "end" : "start";
        m.settleP = p;
      }, 300);
    });
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
      var froms = doc.querySelectorAll("[data-morph-from]");
      Array.prototype.forEach.call(froms, function (from) {
        var key = from.getAttribute("data-morph-from");
        if (morphs.some(function (m) { return m.key === key; })) return;
        morphs.push({ key: key, from: null, to: null, a: null, b: null, ghost: null, state: "idle" });
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
      var idle = null;
      root.addEventListener("scroll", function () {
        schedule();
        if (idle) clearTimeout(idle);
        idle = setTimeout(settleAll, 180);
      }, { passive: true });
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
      /* Content changed: the clones inside a ghost may be outdated. */
      morphs.forEach(function (m) { if (m.ghost) { m.ghost.remove(); m.ghost = null; m.state = "idle"; } });
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
    _ease: ease,
    _morphs: function () { return morphs.map(function (m) { return m.key; }); }
  };

  root.WhichAIMotion = Motion;
  if (typeof module !== "undefined" && module.exports) module.exports = Motion;
})();
