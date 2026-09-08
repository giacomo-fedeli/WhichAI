/*
 * WhichAI - the stage (v0.33.0)
 *
 * Decides whether this device should render the 3D model constellation at all,
 * loads it only if the answer is yes, and provides a 2D fallback that is not
 * an apology - it is the same data, drawn flat.
 *
 * The gate matters more than the scene. A 133 KB shader-heavy layer is a gift
 * on a laptop and a tax on a four-year-old phone, so it is never in the
 * critical path: the page is complete and usable before this file decides
 * anything, and it declines on its own for
 *
 *   - prefers-reduced-motion            (an accessibility setting, not a hint)
 *   - Save-Data / 2g / slow-2g          (the user told the browser to be frugal)
 *   - deviceMemory below 4 GB           (where the frame budget will not hold)
 *   - no WebGL                          (nothing to fall back from)
 *   - a hidden tab                      (nothing to animate for)
 *
 * It also stops the render loop whenever the canvas leaves the viewport or the
 * tab is backgrounded, so an idle WhichAI tab costs nothing.
 */
(function () {
  "use strict";

  var SCENE_SRC = "js/scene3d.js";
  var loading = null;
  var stages = [];

  function prefersReducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  function saveData() {
    var c = navigator.connection || navigator.webkitConnection;
    if (!c) return false;
    if (c.saveData) return true;
    return /(^|-)2g$/.test(String(c.effectiveType || ""));
  }

  function weakDevice() {
    if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory < 4) return true;
    if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2) return true;
    return false;
  }

  function webglAvailable() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  /* One decision, made once, explainable in one string. The reason is exposed
     so the page can say honestly why it chose the flat version. */
  /* An explicit override, for demos, screenshots and anyone who wants the
     heavy version on a device we judged too weak. ?stage=3d or ?stage=flat,
     remembered for the session so it survives navigation. */
  function override() {
    var v = null;
    try {
      var q = new URLSearchParams(location.search).get("stage");
      if (q === "3d" || q === "flat") { sessionStorage.setItem("pc_stage", q); v = q; }
      else v = sessionStorage.getItem("pc_stage");
    } catch (e) { /* private mode, no override */ }
    return v;
  }

  function verdict() {
    var forced = override();
    if (forced === "3d") return { use3d: true, reason: "forced" };
    if (forced === "flat") return { use3d: false, reason: "forced-flat" };
    if (prefersReducedMotion()) return { use3d: false, reason: "reduced-motion" };
    if (saveData()) return { use3d: false, reason: "save-data" };
    if (weakDevice()) return { use3d: false, reason: "device" };
    if (!webglAvailable()) return { use3d: false, reason: "no-webgl" };
    return { use3d: true, reason: "ok" };
  }

  function loadScene() {
    if (window.WhichAIScene) return Promise.resolve(window.WhichAIScene);
    if (loading) return loading;
    loading = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = SCENE_SRC;
      s.async = true;
      s.onload = function () { resolve(window.WhichAIScene || null); };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return loading;
  }

  /* ---------- 2D fallback ---------- */

  /* Not a placeholder: the same models, the same colours, the same meaning,
     drawn with 2D canvas at a fraction of the cost. On a reduced-motion
     device it renders once and never animates. */
  function Flat(canvas, models, opts) {
    this.canvas = canvas;
    try { this.ctx = canvas.getContext("2d"); } catch (e) { this.ctx = null; }
    this.still = !!(opts && opts.still);
    this.progress = 0;
    this.pointer = { x: 0, y: 0 };
    this.t = 0;
    var measured = models.filter(function (m) { return m.score && typeof m.score.aa === "number"; });
    var scores = measured.map(function (m) { return m.score.aa; });
    var minS = Math.min.apply(null, scores), maxS = Math.max.apply(null, scores);
    var COLORS = {
      claude: "#d97757", chatgpt: "#10a37f", gemini: "#4285f4", perplexity: "#20a5b8",
      grok: "#c8c8ce", copilot: "#4f8ef7", meta: "#0866ff", llama: "#0866ff",
      glm: "#c04af0", kimi: "#7c5cff", nemotron: "#76b900", deepseek: "#4d6bfe", qwen: "#ff6a3d"
    };
    this.dots = models.map(function (m, i) {
      var aa = m.score && typeof m.score.aa === "number" ? m.score.aa : null;
      var s = aa == null ? 0 : (aa - minS) / Math.max(1e-6, maxS - minS);
      var seed = (i * 2654435761) % 1000 / 1000;
      var seed2 = (i * 40503) % 1000 / 1000;
      return {
        s: s, seed: seed, seed2: seed2, aa: aa,
        color: COLORS[m.family] || "#8b93a7",
        r: aa == null ? 1.1 : 1.4 + s * 3.4,
        a: aa == null ? 0.2 : 0.35 + s * 0.5
      };
    });
  }

  Flat.prototype.resize = function () {
    if (!this.ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth || 1;
    this.h = this.canvas.clientHeight || 1;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  Flat.prototype.draw = function () {
    var ctx = this.ctx, w = this.w, h = this.h;
    if (!ctx || !w || !h) return;
    ctx.clearRect(0, 0, w, h);
    var p = this.progress;
    for (var i = 0; i < this.dots.length; i++) {
      var d = this.dots[i];
      /* Same idea as the 3D formations: scattered at the top of the page,
         organised into a ranked column as the reader descends. */
      var cx = (d.seed - 0.5) * w * 0.9 + w / 2;
      var cy = (1 - d.s) * h * 0.78 + h * 0.11 + (d.seed2 - 0.5) * h * 0.16;
      var lx = w / 2 + ((i % 7) - 3) * (w * 0.075);
      var ly = h * 0.12 + Math.floor(i / 7) * (h * 0.028);
      var x = cx + (lx - cx) * p + (this.offset || 0);
      var y = cy + (ly - cy) * p;
      if (!this.still) {
        var t = this.t + d.seed * 6.28;
        x += Math.sin(t) * 4 * (1 - p);
        y += Math.cos(t * 0.8) * 3 * (1 - p);
      }
      x += this.pointer.x * 14 * (0.3 + d.s);
      y += this.pointer.y * 10 * (0.3 + d.s);
      ctx.globalAlpha = d.a;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  Flat.prototype.setProgress = function (p) { this.progress = p < 0 ? 0 : p > 1 ? 1 : p; };
  Flat.prototype.setOffset = function (x) { this.offset = x; };
  Flat.prototype.setPointer = function (x, y) { this.pointer.x = x; this.pointer.y = y; };
  Flat.prototype.pick = function () { return null; };
  Flat.prototype.start = function () {
    var self = this;
    if (!this.ctx) return;
    if (this.still) { this.draw(); return; }
    if (this.raf) return;
    var loop = function () { self.t += 0.012; self.draw(); self.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  };
  Flat.prototype.stop = function () { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } };
  Flat.prototype.destroy = function () { this.stop(); };

  /* ---------- stage ---------- */

  function Stage(canvas, opts) {
    this.canvas = canvas;
    this.opts = opts || {};
    this.engine = null;
    this.kind = null;
    this.visible = false;
    this.destroyed = false;
  }

  Stage.prototype.mount = function () {
    var self = this;
    var db = window.PromptCompassModelsDB;
    if (!db || !db.models || !db.models.length || !this.canvas) return Promise.resolve(null);
    var models = db.models;
    var v = verdict();
    this.verdict = v;

    var finish = function (engine, kind) {
      if (self.destroyed) { if (engine) engine.destroy(); return null; }
      self.engine = engine;
      self.kind = kind;
      self.canvas.setAttribute("data-stage", kind);
      engine.resize();
      self._observe();
      self._wirePointer();
      if (self.opts.onReady) self.opts.onReady(kind, v.reason);
      return engine;
    };

    if (!v.use3d) {
      var flat = new Flat(this.canvas, models, { still: v.reason === "reduced-motion" });
      /* No drawing surface at all: the page is complete without a background,
         so the honest move is to leave the canvas empty rather than to fail. */
      if (!flat.ctx) { this.kind = "none"; if (this.opts.onReady) this.opts.onReady("none", "no-canvas"); return Promise.resolve(null); }
      return Promise.resolve(finish(flat, "flat"));
    }

    return loadScene().then(function (Scene) {
      var engine = Scene ? Scene.create(self.canvas, models, { onHover: self.opts.onHover || null }) : null;
      if (engine) return finish(engine, "webgl");
      var fb = new Flat(self.canvas, models, {});
      if (!fb.ctx) { self.kind = "none"; if (self.opts.onReady) self.opts.onReady("none", "no-canvas"); return null; }
      return finish(fb, "flat");
    });
  };

  /* Never animate what nobody is looking at. */
  Stage.prototype._observe = function () {
    var self = this;
    var run = function () {
      if (self.destroyed || !self.engine) return;
      if (self.visible && !document.hidden) self.engine.start();
      else self.engine.stop();
    };
    if ("IntersectionObserver" in window) {
      this.io = new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        run();
      }, { rootMargin: "120px" });
      this.io.observe(this.canvas);
    } else {
      this.visible = true;
    }
    this._onVis = run;
    document.addEventListener("visibilitychange", run);
    this._onResize = function () { if (self.engine) self.engine.resize(); };
    window.addEventListener("resize", this._onResize, { passive: true });
    run();
  };

  Stage.prototype._wirePointer = function () {
    var self = this, c = this.canvas;
    var norm = function (clientX, clientY) {
      var r = c.getBoundingClientRect();
      return {
        x: ((clientX - r.left) / Math.max(1, r.width)) * 2 - 1,
        y: ((clientY - r.top) / Math.max(1, r.height)) * 2 - 1
      };
    };
    this._onMove = function (e) {
      var n = norm(e.clientX, e.clientY);
      self.engine.setPointer(n.x, n.y);
      if (self.opts.onHover && self.engine.pick) {
        var hit = self.engine.pick(e.clientX, e.clientY);
        self.opts.onHover(hit ? hit.point.model : null, hit);
      }
    };
    this._onLeave = function () {
      self.engine.setPointer(0, 0);
      if (self.opts.onHover) self.opts.onHover(null, null);
    };
    /* Touch: one finger orbits. The page must still scroll, so we only take
       over once the gesture is clearly horizontal. */
    var start = null, taken = false;
    this._onTouchStart = function (e) {
      var t = e.touches[0];
      start = { x: t.clientX, y: t.clientY };
      taken = false;
    };
    this._onTouchMove = function (e) {
      if (!start) return;
      var t = e.touches[0];
      var dx = t.clientX - start.x, dy = t.clientY - start.y;
      if (!taken && Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > 10) taken = true;
      if (!taken) return;
      e.preventDefault();
      var n = norm(t.clientX, t.clientY);
      self.engine.setPointer(n.x, n.y);
    };
    this._onTouchEnd = function () {
      start = null;
      if (taken) self.engine.setPointer(0, 0);
      taken = false;
    };
    c.addEventListener("pointermove", this._onMove, { passive: true });
    c.addEventListener("pointerleave", this._onLeave, { passive: true });
    c.addEventListener("touchstart", this._onTouchStart, { passive: true });
    c.addEventListener("touchmove", this._onTouchMove, { passive: false });
    c.addEventListener("touchend", this._onTouchEnd, { passive: true });
  };

  Stage.prototype.setProgress = function (p) { if (this.engine) this.engine.setProgress(p); };
  Stage.prototype.setOffset = function (x) { if (this.engine && this.engine.setOffset) this.engine.setOffset(x); };

  Stage.prototype.destroy = function () {
    this.destroyed = true;
    if (this.io) this.io.disconnect();
    if (this._onVis) document.removeEventListener("visibilitychange", this._onVis);
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    if (this.canvas && this._onMove) {
      this.canvas.removeEventListener("pointermove", this._onMove);
      this.canvas.removeEventListener("pointerleave", this._onLeave);
      this.canvas.removeEventListener("touchstart", this._onTouchStart);
      this.canvas.removeEventListener("touchmove", this._onTouchMove);
      this.canvas.removeEventListener("touchend", this._onTouchEnd);
    }
    if (this.engine) this.engine.destroy();
    this.engine = null;
  };

  var Stages = {
    verdict: verdict,
    create: function (canvas, opts) {
      var s = new Stage(canvas, opts);
      stages.push(s);
      return s;
    },
    destroyAll: function () {
      stages.forEach(function (s) { s.destroy(); });
      stages = [];
    }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAIStage = Stages;
  if (typeof module !== "undefined" && module.exports) module.exports = Stages;
})();
