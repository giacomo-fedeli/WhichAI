/*
 * WhichAI - the dot field behind the page (v0.37.0)
 *
 * A fine grid of dots covers the background, like dotted paper. Every
 * chapter lights its own pattern in it - five tier rows, two turning
 * spirals, radar rings and a sweep, rising price lines, two voices meeting
 * in the middle, a compass - and crossing from one chapter into the next
 * dissolves one pattern into the other, from the bottom up, as the new
 * chapter comes into view.
 *
 * What moves it is the scroll position and nothing else: stop scrolling and
 * the dots stop where they are, half-way through a change included (there is
 * no "settling"). While you read, the grid drifts upwards a little slower
 * than the page, and each pattern follows your reading (the rings travel,
 * the spirals turn, the lines move). The only motion that runs on its own is
 * the reaction to the reader: dots swell and make room around the pointer,
 * and a click on an empty part of the page sends a ripple through them.
 *
 * It never gets in the way of reading: dots stay faint behind headings and
 * text, cards cover them, and nothing captures the pointer.
 *
 * Cheap by construction: one canvas, a fixed number of dots drawn in five
 * batched paths, frames only while something changes, none while the tab is
 * hidden, a coarser grid on very large screens and slow devices, and a still
 * picture for prefers-reduced-motion. A browser without canvas shows none.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  var TAU = Math.PI * 2;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function gauss(d, s) { return Math.exp(-(d * d) / (2 * s * s)); }
  /* deterministic noise in [0, 1) */
  function hash(i, salt) {
    var x = Math.sin((i + 1) * 12.9898 + (salt || 0) * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }
  function wrapAngle(a) { a = a % TAU; return a < 0 ? a + TAU : a; }

  /* ---------- the patterns ----------
     prep(phi, W, H) runs once per frame with phi = the reading position in
     that chapter (0..1); at(x, y, P) returns how lit the dot at viewport
     pixel (x, y) is, 0..1. Distances are measured in screen heights so a
     pattern keeps its shape on any screen. */
  var BASE = 0.06;

  var FIELDS = {
    /* 01 - a tier list: five rows, a tile and a bar each, S brightest */
    ranking: {
      prep: function (phi, W, H) {
        var x0 = Math.max(16, W * 0.03), tile = Math.max(16, H * 0.034);
        var lens = [0.3, 0.45, 0.58, 0.7, 0.8], wts = [1, 0.86, 0.73, 0.62, 0.52];
        var grow = 0.86 + 0.14 * phi, drift = (phi - 0.5) * 0.1 * H, rows = [];
        var start = x0 + tile + 14;
        for (var b = 0; b < 5; b++) rows.push({ y: H * (0.19 + 0.155 * b) - drift, end: start + (W - start) * lens[b] * grow, w: wts[b] });
        return { x0: x0, tile: tile, start: start, rows: rows, s: H * 0.011, half: H * 0.022 };
      },
      at: function (x, y, P) {
        var best = 0;
        for (var b = 0; b < 5; b++) {
          var r = P.rows[b], dy = y - r.y;
          if (dy > P.half * 1.8 || dy < -P.half * 1.8) continue;
          if (x >= P.x0 && x <= P.x0 + P.tile) { if (dy <= P.half && dy >= -P.half) best = Math.max(best, r.w); continue; }
          if (x < P.start || x > r.end + 36) continue;
          var v = gauss(dy, P.s) * r.w * 0.9 * clamp((r.end + 36 - x) / 36, 0, 1);
          if (v > best) best = v;
        }
        return best;
      }
    },

    /* 02 - two rings that move towards each other as you read (a Venn) */
    compare: {
      prep: function (phi, W, H) {
        var R = H * 0.165, apart = R * (1.3 - 0.6 * phi), cx = W * 0.77, cy = H * 0.47;
        return { R: R, a: { x: cx - apart / 2 - R * 0.35, y: cy }, b: { x: cx + apart / 2 + R * 0.35, y: cy }, s: H * 0.009 };
      },
      at: function (x, y, P) {
        var best = 0;
        [P.a, P.b].forEach(function (c) {
          var d = Math.sqrt((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y));
          var v = Math.max(gauss(d - P.R, P.s) * 0.95, d < P.R ? 0.22 * (1 - d / P.R) + 0.1 : 0);
          if (v > best) best = v;
        });
        /* where the two overlap, the dots light up: what both have in common */
        var da = Math.hypot(x - P.a.x, y - P.a.y), db = Math.hypot(x - P.b.x, y - P.b.y);
        if (da < P.R && db < P.R) best = Math.max(best, 0.5);
        return best;
      }
    },

    /* 03 - a radar: rings travelling outwards and a sweep that turns */
    radar: {
      prep: function (phi, W, H) {
        return { x: W * 0.8, y: H * 0.46, H: H, ph: phi * 2.4, sweep: -Math.PI / 2 + phi * TAU * 1.15 };
      },
      at: function (x, y, P) {
        var dx = x - P.x, dy = y - P.y, r = Math.sqrt(dx * dx + dy * dy) / P.H;
        if (r > 1.05) return 0;
        var ring = Math.pow(0.5 + 0.5 * Math.cos(TAU * (r / 0.11 - P.ph)), 8) * Math.exp(-r / 0.55) * clamp((1.05 - r) / 0.25, 0, 1);
        var beam = 0;
        if (r < 0.62 && r > 0.02) {
          var behind = wrapAngle(P.sweep - Math.atan2(dy, dx));
          beam = Math.exp(-behind * 2.4) * clamp((0.62 - r) / 0.08, 0, 1) * 0.95;
        }
        return Math.max(ring * 0.95, beam);
      }
    },

    /* 04 - a market: three price lines rising left to right */
    market: {
      prep: function (phi, W, H) { return { W: W, H: H, ph: phi * 5 }; },
      at: function (x, y, P) {
        var X = x / P.W, Y = y / P.H, best = 0;
        for (var j = 0; j < 3; j++) {
          var off = (j - 1) * 0.27;
          var f = 0.78 - 0.5 * X + off + 0.045 * Math.sin(9 * X + P.ph + j * 1.7) + 0.022 * Math.sin(27 * X - P.ph * 0.6 + j);
          var v = gauss(Y - f, 0.011) * (j === 1 ? 1 : 0.6);
          if (v > best) best = v;
        }
        return best;
      }
    },

    /* 05 - two voices: waves from either side, meeting in the middle */
    debates: {
      prep: function (phi, W, H) {
        return { a: { x: W * 0.01, y: H * 0.4 }, b: { x: W * 0.99, y: H * 0.6 }, W: W, H: H, ph: phi * 2.6 };
      },
      at: function (x, y, P) {
        var v = 0;
        [P.a, P.b].forEach(function (s, k) {
          var d = Math.sqrt((x - s.x) * (x - s.x) + (y - s.y) * (y - s.y));
          var wave = Math.pow(0.5 + 0.5 * Math.cos(TAU * (d / (P.H * 0.1) - P.ph - k * 0.5)), 4);
          v += wave * Math.exp(-d / (P.W * 0.5)) * 1.05;
        });
        return Math.min(1, v);
      }
    },

    /* 06 - a compass, the WhichAI mark: two rings and eight rays */
    tools: {
      prep: function (phi, W, H) {
        return { x: W * 0.8, y: H * 0.5, H: H, rot: (phi - 0.5) * 0.7 };
      },
      at: function (x, y, P) {
        var dx = x - P.x, dy = y - P.y, d = Math.sqrt(dx * dx + dy * dy), r = d / P.H;
        if (r > 0.5) return 0;
        var v = Math.max(gauss(r - 0.27, 0.011) * 0.9, gauss(r - 0.18, 0.008) * 0.5);
        if (r < 0.36) {
          var th = Math.atan2(dy, dx) - P.rot + Math.PI / 2;
          for (var k = 0; k < 8; k++) {
            var cardinal = k % 2 === 0, len = cardinal ? 0.36 : 0.25;
            if (r > len) continue;
            var delta = Math.abs(((th - k * Math.PI / 4) % TAU + TAU + Math.PI) % TAU - Math.PI);
            if (delta > Math.PI / 2) continue;
            var ray = gauss(d * Math.sin(delta), P.H * 0.011) * (cardinal ? (k === 0 ? 1 : 0.8) : 0.55) * clamp((len - r) / 0.06, 0, 1);
            if (ray > v) v = ray;
          }
        }
        return v;
      }
    }
  };
  var ORDER = ["ranking", "compare", "radar", "market", "debates", "tools"];

  /* ---------- scroll -> where the story is ----------
     s runs from 0 (first chapter) to chapters - 1 (last). Crossing into the
     next chapter takes 72% of a screen: it starts when that chapter's top
     enters at the bottom (92%) and is complete when it reaches 20%. phi is the
     reading position inside each chapter, 0..1. Both are plain functions of
     the scroll position. */
  function storyAt(sy, vh, chapters, phis) {
    var s = 0, n = chapters.length;
    for (var i = 0; i + 1 < n; i++) {
      var y = chapters[i + 1].top - sy;
      s += clamp((vh * 0.92 - y) / (vh * 0.72), 0, 1);
    }
    if (phis) {
      for (var j = 0; j < n; j++) {
        phis[j] = clamp((sy + vh * 0.5 - chapters[j].top) / Math.max(1, chapters[j].bottom - chapters[j].top), 0, 1);
      }
    }
    return s;
  }

  /* ---------- the field ---------- */

  var canvas = null, ctx = null, Motion = null;
  var X0, Y0, I0, placedKey = "";
  var reduced = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var dpr = 1, vw = 0, vh = 0, gap = 28, cols = 0, rows = 0, N = 0, dark = false;
  var BX, BY, X, Y, I;
  var ids = [];
  var sT = 0, sD = 0, phiT = [], phiD = [], syT = 0, syD = 0;
  var rgb = [37, 99, 235];
  var masks = [], maskVersion = -1;
  var ptr = { x: -9999, y: -9999, tx: -9999, ty: -9999, str: 0, tstr: 0, last: 0 };
  var ripples = [];
  var bornT = 0, BORN_MS = 900;
  var raf = 0, lastT = 0, sizeTimer = 0, started = false, stillKey = "";
  var stats = { frames: 0, ms: 0 };
  /* eight looks, faint to bright (halftone: the dot grows with the light);
     the two faintest are neutral ink, the others take the chapter's colour */
  var RADIUS = [0.62, 0.8, 1.0, 1.2, 1.42, 1.66, 1.92, 2.2];
  var ALPHA_LIGHT = [0.1, 0.14, 0.24, 0.34, 0.44, 0.54, 0.64, 0.74];
  var ALPHA_DARK = [0.1, 0.15, 0.3, 0.42, 0.52, 0.62, 0.72, 0.84];
  var CUT = [0.12, 0.22, 0.34, 0.47, 0.6, 0.74, 0.87];
  var LOOKS = RADIUS.length, INK = 2;
  var MASK_SEL = ".ch-eyebrow, .ch-title, .ch-lede, .hero-actions, .step-head, .block-title";

  function now() { return root.performance && root.performance.now ? root.performance.now() : Date.now(); }

  function layout() {
    vw = root.innerWidth || 1200;
    vh = root.innerHeight || 800;
    dpr = Math.min(root.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    var nav = root.navigator || {};
    var slow = (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) || (nav.deviceMemory && nav.deviceMemory <= 2) || (nav.connection && nav.connection.saveData);
    /* a fine grid, about 4,000 dots at most: a wider gap on very large
       screens, half the dots on slow devices */
    gap = Math.max(vw < 700 ? 15 : 17, Math.sqrt(vw * vh / (slow ? 2000 : 4200)));
    cols = Math.ceil(vw / gap) + 1;
    rows = Math.ceil(vh / gap) + 2;
    N = cols * rows;
    BX = new Float32Array(N); BY = new Float32Array(N);
    X = new Float32Array(N); Y = new Float32Array(N); I = new Float32Array(N);
    X0 = new Float32Array(N); Y0 = new Float32Array(N); I0 = new Float32Array(N);
    placedKey = "";
    var ox = (vw - (cols - 1) * gap) / 2;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var i = r * cols + c;
      BX[i] = ox + c * gap;
      BY[i] = (r - 1) * gap;
    }
    maskVersion = -1;
  }

  /* text the dots must stay faint behind: measured in page coordinates once
     per layout change, shifted by the scroll every frame */
  function measureMasks(sy) {
    masks = [];
    var els = root.document.querySelectorAll(MASK_SEL);
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (!r.width || !r.height) continue;
      masks.push({ l: r.left - 10, r: r.right + 10, t: r.top + sy - 8, b: r.bottom + sy + 8 });
    }
  }

  /* lit level of every dot for story position s: a pure function of s, the
     reading phases and the scroll offset */
  function place(s, phis, sy, t0) {
    var n = ids.length;
    if (!n) return;
    var a = clamp(Math.floor(s), 0, n - 1), b = Math.min(a + 1, n - 1), t = clamp(s - a, 0, 1);
    if (reduced) { a = b = clamp(Math.round(s), 0, n - 1); t = 0; }
    var FA = FIELDS[ids[a]] || FIELDS.tools, FB = FIELDS[ids[b]] || FIELDS.tools;
    var PA = FA.prep(reduced ? 0.5 : phis[a] || 0, vw, vh);
    var PB = t > 0 ? FB.prep(phis[b] || 0, vw, vh) : null;
    /* the grid drifts up at an eighth of the page's speed, wrapping on itself */
    var drift = reduced ? 0 : ((sy * 0.12) % gap + gap) % gap;
    var born = bornT ? clamp((t0 - bornT) / BORN_MS, 0, 1) : 1;
    var vis = [];
    for (var m = 0; m < masks.length; m++) {
      var k = masks[m], top = k.t - sy, bot = k.b - sy;
      if (bot > -20 && top < vh + 20) vis.push({ l: k.l, r: k.r, t: top, b: bot });
    }
    for (var i = 0; i < N; i++) {
      var x = BX[i], y = BY[i] - drift;
      var v = FA.at(x, y, PA);
      if (PB) {
        /* the change climbs from the bottom of the screen, where the new
           chapter comes in; dots on the front rise a little, like a wave */
        var e = smooth(clamp((t - 0.34 * clamp(1 - y / vh, 0, 1)) / 0.66, 0, 1));
        if (e > 0) {
          var wb = FB.at(x, y, PB);
          var crest = 4 * e * (1 - e);
          v = v + (wb - v) * e + crest * 0.18;
          y -= crest * 5;
        }
      }
      v = BASE + (1 - BASE) * v;
      if (born < 1) v *= smooth(clamp(born * 1.6 - (1 - y / vh) * 0.6, 0, 1));
      for (var q = 0; q < vis.length; q++) {
        var R = vis[q];
        if (x > R.l && x < R.r && y > R.t && y < R.b) {
          var edge = Math.min(x - R.l, R.r - x, y - R.t, R.b - y);
          var cap = BASE + (v - BASE) * (1 - smooth(clamp(edge / 18, 0, 1)));
          if (cap < v) v = cap;
        }
      }
      X0[i] = x; Y0[i] = y; I0[i] = v;
    }
  }

  /* the reader: dots swell and make room around the pointer, ripples from clicks */
  function touch(t0) {
    var live = [];
    for (var k = 0; k < ripples.length; k++) {
      var age = (t0 - ripples[k].t0) / 1000;
      if (age < 1.4) live.push({ x: ripples[k].x, y: ripples[k].y, front: age * 560, fade: 1 - age / 1.4 });
    }
    if (ptr.str < 0.002 && !live.length) return;
    var R = vw < 700 ? 90 : 130, R2 = R * R;
    for (var i = 0; i < N; i++) {
      var x = X[i], y = Y[i], dx, dy, d;
      if (ptr.str >= 0.002) {
        dx = x - ptr.x; dy = y - ptr.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          d = Math.sqrt(d2) || 1;
          var f = 1 - d / R, f2 = f * f * ptr.str;
          X[i] = x + dx / d * f2 * 12;
          Y[i] = y + dy / d * f2 * 12;
          I[i] = Math.min(1, I[i] + f2 * 0.85);
        }
      }
      for (var q = 0; q < live.length; q++) {
        var w = live[q];
        dx = x - w.x; dy = y - w.y;
        d = Math.sqrt(dx * dx + dy * dy) || 1;
        var off = d - w.front;
        if (off > -90 && off < 90) {
          var wave = gauss(off, 26) * w.fade;
          X[i] += dx / d * wave * 7;
          Y[i] += dy / d * wave * 7;
          I[i] = Math.min(1, I[i] + wave * 0.7);
        }
      }
    }
  }

  var BUCKET;  // per dot: which look it gets this frame
  function draw() {
    var alpha = dark ? ALPHA_DARK : ALPHA_LIGHT;
    var ink = dark ? "230,232,238" : "23,24,28";
    var counts = [0, 0, 0, 0, 0, 0, 0, 0], i, b;
    if (!BUCKET || BUCKET.length !== N) BUCKET = new Uint8Array(N);
    for (i = 0; i < N; i++) {
      var v = I[i];
      b = 0;
      while (b < LOOKS - 1 && v >= CUT[b]) b++;
      var x = X[i], y = Y[i];
      if (y < -3 || y > vh + 3 || x < -3 || x > vw + 3) b = 255;
      else counts[b]++;
      BUCKET[i] = b;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    for (b = 0; b < LOOKS; b++) {
      if (!counts[b]) continue;
      var r = RADIUS[b], d = r * 2;
      ctx.beginPath();
      for (i = 0; i < N; i++) {
        if (BUCKET[i] !== b) continue;
        /* the faintest dots are too small for a circle to show: squares are cheaper */
        if (b < INK) ctx.rect(X[i] - r, Y[i] - r, d, d);
        else { ctx.moveTo(X[i] + r, Y[i]); ctx.arc(X[i], Y[i], r, 0, TAU); }
      }
      ctx.fillStyle = "rgba(" + (b < INK ? ink : rgb.join(",")) + "," + alpha[b] + ")";
      ctx.fill();
    }
  }

  /* ---------- the frame loop: runs only while something changes ---------- */

  function needsMore(t0) {
    if (Math.abs(sT - sD) > 0.0005 || Math.abs(syT - syD) > 0.3) return true;
    for (var i = 0; i < phiT.length; i++) if (Math.abs(phiT[i] - phiD[i]) > 0.0005) return true;
    if (Math.abs(ptr.tstr - ptr.str) > 0.002 || (ptr.str > 0.002 && (Math.abs(ptr.tx - ptr.x) > 0.3 || Math.abs(ptr.ty - ptr.y) > 0.3))) return true;
    if (ptr.str > 0.002 && t0 - ptr.last > 1400) return true;
    if (ripples.length) return true;
    return !!bornT;
  }

  function step() {
    raf = 0;
    if (!ctx || (root.document && root.document.hidden)) return;
    var t0 = now();
    var dt = clamp((t0 - (lastT || t0)) / 1000, 0, 0.05);
    lastT = t0;
    /* a short, critically damped follow: it soaks up a jumpy mouse and never
       carries on past where the scroll stopped */
    var k = reduced ? 1 : 1 - Math.exp(-dt / 0.085);
    if (Math.abs(sT - sD) > 1.5 || Math.abs(syT - syD) > vh * 2) { sD = sT; syD = syT; phiD = phiT.slice(); }
    sD += (sT - sD) * k;
    syD += (syT - syD) * k;
    for (var i = 0; i < phiT.length; i++) phiD[i] = (phiD[i] || 0) + (phiT[i] - (phiD[i] || 0)) * k;
    if (ptr.str > 0.002 && t0 - ptr.last > 1400) ptr.tstr = 0;
    var kp = 1 - Math.exp(-dt / 0.07), ks = 1 - Math.exp(-dt / (ptr.tstr > ptr.str ? 0.12 : 0.45));
    ptr.x += (ptr.tx - ptr.x) * kp; ptr.y += (ptr.ty - ptr.y) * kp;
    ptr.str += (ptr.tstr - ptr.str) * ks;
    ripples = ripples.filter(function (r) { return t0 - r.t0 < 1400; });
    if (bornT && t0 - bornT >= BORN_MS) bornT = 0;
    var c0 = now();
    /* the scroll-driven picture is recomputed only when the scroll moved;
       frames that only follow the pointer or a ripple reuse it */
    var key = sD.toFixed(4) + "|" + syD.toFixed(1) + "|" + phiD.map(function (p) { return p.toFixed(4); }).join(",") + "|" + (bornT ? t0 : 0) + "|" + maskVersion + "|" + N;
    if (key !== placedKey) { place(sD, phiD, syD, t0); placedKey = key; }
    X.set(X0); Y.set(Y0); I.set(I0);
    if (!reduced) touch(t0);
    draw();
    stats.frames++; stats.ms += now() - c0;
    if (needsMore(t0)) request();
  }
  function request() {
    if (raf || !ctx) return;
    raf = (root.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(step);
  }

  function onFrame(st) {
    if (!ctx) return;
    var chs = st.chapters || [];
    var idsNow = chs.map(function (c) { return c.id; });
    if (!started || idsNow.join(",") !== ids.join(",")) {
      ids = idsNow.length ? idsNow : ORDER.slice();
      layout();
    } else if ((st.vw && Math.abs(st.vw - vw) > 0.5) || (st.vh && Math.abs(st.vh - vh) > 0.5)) {
      /* phones resize while the address bar comes and goes: rebuild once
         the size has settled, keep drawing meanwhile */
      clearTimeout(sizeTimer);
      sizeTimer = setTimeout(function () { layout(); stillKey = ""; request(); }, 120);
    }
    if (st.rgb) rgb = st.rgb;
    if (st.layout !== maskVersion) { measureMasks(st.sy || 0); maskVersion = st.layout; }
    phiT.length = chs.length;
    syT = st.sy || 0;
    sT = storyAt(syT, st.vh || vh, chs, phiT);
    if (!started) {
      started = true;
      sD = sT; syD = syT;
      phiD = phiT.slice();
      if (!reduced) bornT = now();
    }
    if (reduced) {
      /* a still picture: redraw only when the chapter, size or colour changes */
      var key = Math.round(sT) + "|" + vw + "x" + vh + "|" + rgb.join(",") + "|" + maskVersion;
      if (key === stillKey) return;
      stillKey = key;
    }
    request();
  }

  /* ---------- the reader's hands ---------- */

  function isControl(el) {
    return !!(el && el.closest && el.closest("a, button, input, select, textarea, label, summary, details, [role='button'], [role='tab'], [role='option'], .card, .drawer, .topbar, .rail"));
  }
  function wire() {
    if (reduced) return;
    root.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (ptr.str < 0.01) { ptr.x = e.clientX; ptr.y = e.clientY; }
      ptr.tx = e.clientX; ptr.ty = e.clientY;
      ptr.tstr = 1; ptr.last = now();
      request();
    }, { passive: true });
    /* the pointer left the window: let the dots settle back where they belong */
    root.document.addEventListener("pointerout", function (e) { if (!e.relatedTarget) { ptr.tstr = 0; request(); } }, { passive: true });
    root.addEventListener("blur", function () { ptr.tstr = 0; request(); });
    root.document.addEventListener("click", function (e) {
      if (isControl(e.target)) return;
      if (ripples.length >= 3) ripples.shift();
      ripples.push({ x: e.clientX, y: e.clientY, t0: now() });
      request();
    }, { passive: true });
  }

  var Dots = {
    reduced: reduced,
    patterns: ORDER.slice(),
    /** canvasEl: the fixed <canvas>; motion: WhichAIMotion (the frame source) */
    init: function (canvasEl, motion) {
      if (ctx || !canvasEl || !motion || typeof motion.onFrame !== "function") return false;
      var c = null;
      try { c = canvasEl.getContext ? canvasEl.getContext("2d") : null; } catch (e) { c = null; }
      if (!c) { canvasEl.hidden = true; return false; }
      canvas = canvasEl; ctx = c; Motion = motion;
      var de = root.document.documentElement;
      dark = de.getAttribute("data-theme") === "dark";
      if (typeof root.MutationObserver === "function") {
        new root.MutationObserver(function () { dark = de.getAttribute("data-theme") === "dark"; stillKey = ""; request(); })
          .observe(de, { attributes: true, attributeFilter: ["data-theme"] });
      }
      root.document.addEventListener("visibilitychange", function () { if (!root.document.hidden) { lastT = 0; request(); } });
      wire();
      Motion.onFrame(onFrame);
      /* headings fade and slide in once: measure them again when they have landed */
      setTimeout(function () { if (Motion.refresh) Motion.refresh(); }, 1300);
      return true;
    },
    /* exposed for tests and tuning: patterns and the scroll mapping are
       plain functions; stats() is the average cost of a frame */
    _lit: function (id, x, y, W, H, phi) { var F = FIELDS[id]; return F ? F.at(x, y, F.prep(phi || 0, W, H)) : 0; },
    _storyAt: storyAt,
    stats: function () { return { frames: stats.frames, avgMs: stats.frames ? stats.ms / stats.frames : 0, dots: N, gap: gap }; }
  };

  root.WhichAIDots = Dots;
  if (typeof module !== "undefined" && module.exports) module.exports = Dots;
})();
