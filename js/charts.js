/*
 * WhichAI - Minimal SVG chart helpers (v0.22.0)
 * Pure functions returning SVG strings. No libraries, theme-aware via CSS variables
 * (inline SVG inherits custom properties from the page). All inputs are local data
 * from models-db.js - labels are still escaped defensively.
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmt(n) {
    return (Math.round(n * 10) / 10).toString();
  }

  /**
   * Horizontal bar chart.
   * items: [{ label, value, sub (small right note), est (bool) }]
   * opts: { max (default: max value), unit, height per row }
   */
  function barChart(items, opts) {
    opts = opts || {};
    var rowH = opts.rowH || 30;
    var labelW = opts.labelW || 148;
    var valueW = 46;
    var W = 560;
    var barW = W - labelW - valueW - 12;
    var H = items.length * rowH + 6;
    var dataMax = items.reduce(function (m, it) { return Number.isFinite(it.value) ? Math.max(m, it.value) : m; }, 0);
    var max = Math.max(1, Number.isFinite(opts.max) ? opts.max : 0, dataMax);
    var out = '<svg class="wc-chart wc-bars" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.aria || "Bar chart") + '" preserveAspectRatio="xMinYMin meet">';
    out += "<desc>" + items.map(function (it) { return esc(it.label) + ": " + (Number.isFinite(it.value) ? fmt(it.value) : "not available") + (it.est ? " (estimate)" : ""); }).join("; ") + "</desc>";
    items.forEach(function (it, i) {
      var y = i * rowH + 4;
      var valid = Number.isFinite(it.value) && it.value >= 0;
      var valueText = valid ? fmt(it.value) : "n/a";
      var w = valid ? (it.value / max) * barW : 0;
      var name = esc(it.label) + (it.est ? " ~" : "");
      out += '<g class="wc-row">';
      out += '<title>' + name + ": " + valueText + (opts.unit ? " " + esc(opts.unit) : "") + (it.est ? " (WhichAI estimate)" : "") + "</title>";
      out += '<text x="' + (labelW - 8) + '" y="' + (y + rowH / 2 + 1) + '" text-anchor="end" dominant-baseline="middle" class="wc-label">' + name + "</text>";
      out += '<rect x="' + labelW + '" y="' + (y + 5) + '" width="' + barW + '" height="' + (rowH - 14) + '" rx="6" class="wc-track"></rect>';
      if (w > 0) out += '<rect x="' + labelW + '" y="' + (y + 5) + '" width="' + fmt(w) + '" height="' + (rowH - 14) + '" rx="6" class="wc-fill' + (it.est ? " wc-est" : "") + '" style="--wc-w:' + fmt(w) + 'px"></rect>';
      out += '<text x="' + (labelW + barW + 8) + '" y="' + (y + rowH / 2 + 1) + '" dominant-baseline="middle" class="wc-value">' + valueText + "</text>";
      out += "</g>";
    });
    out += "</svg>";
    return out;
  }

  /* $0.03, $0.1, $0.3, $1, $3, $10, $30...: a log axis people can read. */
  function logTicks(min, max) {
    var out = [];
    for (var e = Math.floor(Math.log10(min)) - 1; e <= Math.ceil(Math.log10(max)) + 1; e++) {
      [1, 3].forEach(function (m) {
        var v = Number((m * Math.pow(10, e)).toPrecision(12));
        if (v >= min * 0.999 && v <= max * 1.001) out.push(v);
      });
    }
    return out;
  }
  function money(v) {
    if (v >= 1) return "$" + (Math.round(v * 10) / 10).toString();
    return "$" + Number(v.toPrecision(2)).toString();
  }

  /* The price/performance frontier: walking from cheap to expensive, a model
     belongs to it when nothing cheaper scores as well. */
  function frontierOf(points) {
    var sorted = points.slice().sort(function (a, b) { return a.x - b.x || b.y - a.y; });
    var best = -Infinity, out = [];
    sorted.forEach(function (p) { if (p.y > best) { best = p.y; out.push(p); } });
    return out;
  }

  /**
   * Scatter plot (price vs performance).
   * points: [{ x, y, label, est, id, cls, quiet }] - x = blended $/1M tokens, y = index score.
   * opts: { logX, frontier, xLabel, yLabel, aria, freeLabel, width, height }
   * With logX a price of 0 sits in a "free" lane left of the axis instead of
   * breaking the scale; ids end up in data-id so a page can link dots to chips.
   */
  function scatter(points, opts) {
    opts = opts || {};
    points = points.filter(function (p) { return p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0; });
    var W = opts.width || 560, H = opts.height || 330;
    var log = !!opts.logX;
    var free = log ? points.filter(function (p) { return p.x <= 0; }) : [];
    var priced = log ? points.filter(function (p) { return p.x > 0; }) : points;
    var padL = 46 + (free.length ? 34 : 0), padR = 16, padT = 16, padB = 40;
    var xs = priced.map(function (p) { return p.x; });
    var ys = points.map(function (p) { return p.y; });
    var xMin, xMax, ticks;
    if (log) {
      var lo = xs.length ? Math.min.apply(null, xs) : 0.1, hi = xs.length ? Math.max.apply(null, xs) : 10;
      xMin = Math.pow(10, Math.floor(Math.log10(lo) * 2) / 2);
      xMax = Math.pow(10, Math.ceil(Math.log10(hi) * 2) / 2);
      if (xMax <= xMin) xMax = xMin * 10;
      ticks = logTicks(xMin, xMax);
    } else {
      xMax = Math.max(1, Math.max.apply(null, xs.length ? xs : [1]) * 1.15);
      xMin = 0;
      ticks = [0, 1, 2, 3, 4].map(function (i) { return xMin + (i / 4) * (xMax - xMin); });
    }
    /* round y bounds to a readable step, so ticks read 0, 10, 20... */
    var ySpan = points.length ? Math.max.apply(null, ys) - Math.min.apply(null, ys) : 100;
    var yStep = ySpan > 40 ? 10 : ySpan > 16 ? 5 : 2;
    var yMax = points.length ? Math.ceil((Math.max.apply(null, ys) + yStep * 0.3) / yStep) * yStep : 100;
    var yMin = points.length ? Math.max(0, Math.floor((Math.min.apply(null, ys) - yStep * 0.3) / yStep) * yStep) : 0;
    function X(v) {
      if (log) {
        if (v <= 0) return padL - 22;
        return padL + ((Math.log10(v) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))) * (W - padL - padR);
      }
      return padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR);
    }
    function Y(v) { return H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB); }
    var out = '<svg class="wc-chart wc-scatter' + (log ? " wc-log" : "") + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.aria || "Scatter chart") + '" preserveAspectRatio="xMinYMin meet">';
    // gridlines + axis labels
    var ySteps = Math.max(1, Math.round((yMax - yMin) / yStep)), i;
    if (ySteps > 8) { yStep *= 2; ySteps = Math.ceil((yMax - yMin) / yStep); yMax = yMin + ySteps * yStep; }
    for (i = 0; i <= ySteps; i++) {
      var yv = yMin + i * yStep;
      out += '<line x1="' + padL + '" y1="' + fmt(Y(yv)) + '" x2="' + (W - padR) + '" y2="' + fmt(Y(yv)) + '" class="wc-grid"></line>';
      out += '<text x="' + (padL - 7) + '" y="' + fmt(Y(yv)) + '" text-anchor="end" dominant-baseline="middle" class="wc-tick">' + fmt(yv) + "</text>";
    }
    ticks.forEach(function (xv) {
      if (log) out += '<line x1="' + fmt(X(xv)) + '" y1="' + padT + '" x2="' + fmt(X(xv)) + '" y2="' + (H - padB) + '" class="wc-grid wc-grid-v"></line>';
      out += '<text x="' + fmt(X(xv)) + '" y="' + (H - padB + 16) + '" text-anchor="middle" class="wc-tick">' + (log ? money(xv) : "$" + fmt(xv)) + "</text>";
    });
    if (free.length) {
      out += '<rect x="' + (padL - 34) + '" y="' + padT + '" width="24" height="' + (H - padT - padB) + '" rx="8" class="wc-free-lane"></rect>';
      out += '<text x="' + (padL - 22) + '" y="' + (H - padB + 16) + '" text-anchor="middle" class="wc-tick wc-free-tick">' + esc(opts.freeLabel || "Free") + "</text>";
    }
    out += '<text x="' + ((padL + W - padR) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" class="wc-axis">' + esc(opts.xLabel || "") + "</text>";
    out += '<text x="12" y="' + ((padT + H - padB) / 2) + '" text-anchor="middle" class="wc-axis" transform="rotate(-90 12 ' + ((padT + H - padB) / 2) + ')">' + esc(opts.yLabel || "") + "</text>";
    if (opts.frontier && priced.length > 2) {
      var fr = frontierOf(priced);
      var d = "";
      fr.forEach(function (p, k) {
        var px = fmt(X(p.x)), py = fmt(Y(p.y));
        if (!k) d += "M" + px + " " + py;
        else d += " H" + px + " V" + py;
      });
      out += '<path d="' + d + '" class="wc-frontier"></path>';
      fr.forEach(function (p) { p.onFrontier = true; });
    }
    /* Greedy label placement: try a few vertical offsets and keep the first
       that does not overlap a label already placed. Cheap, and enough for the
       dozen labels a readable scatter carries. */
    var placed = [];
    /* Returns a free baseline near y, or null: a label that cannot be placed
       without overlapping another stays hidden (its dot keeps the tooltip). */
    function freeSpot(x, y, w, anchor) {
      var offs = [0, 13, -13, 26, -26];
      for (var k = 0; k < offs.length; k++) {
        var yy = y + offs[k];
        var x0 = anchor === "end" ? x - w : x, x1 = x0 + w;
        if (yy - 10 < 2) continue;
        var hit = placed.some(function (b) { return x0 < b[2] && x1 > b[0] && yy - 10 < b[3] && yy + 2 > b[1]; });
        if (!hit) { placed.push([x0, yy - 10, x1, yy + 2]); return yy; }
      }
      return null;
    }
    function isQuiet(p) {
      if (p.quiet != null) return !!p.quiet;
      return opts.frontier ? !(p.onFrontier || p.top) : false;
    }
    /* Quiet points first, so labelled ones (and their labels) sit on top. */
    var order = points.slice().sort(function (a, b) { return (isQuiet(b) ? 1 : 0) - (isQuiet(a) ? 1 : 0); });
    /* Labels are placed in the caller's order (strongest first), so a
       crowded corner keeps the labels that matter and hides the rest
       instead of overlapping them. A hidden label stays in the SVG for the
       page to reveal on hover. */
    var marks = order.map(function (p) {
      var cx = X(p.x), cy = Y(p.y);
      var anchor = cx > W - 140 ? "end" : "start";
      return { p: p, cx: cx, cy: cy, anchor: anchor, tx: anchor === "end" ? cx - 9 : cx + 9, quiet: isQuiet(p), ty: null };
    });
    marks.filter(function (m) { return !m.quiet; }).forEach(function (m) {
      m.ty = freeSpot(m.tx, m.cy - 6, String(m.p.label || "").length * 6.6 + (m.p.est ? 12 : 0), m.anchor);
      if (m.ty === null) m.quiet = true;
    });
    marks.forEach(function (m, k) {
      var p = m.p;
      var name = esc(p.label) + (p.est ? " ~" : "");
      var price = p.x > 0 ? "$" + fmt(p.x) + "/1M blended" : (opts.freeLabel || "Free");
      out += '<g class="wc-pt' + (p.cls ? " " + esc(p.cls) : "") + (p.onFrontier ? " wc-on-frontier" : "") + (m.quiet ? " wc-quiet" : "") + '"' +
        (p.id ? ' data-id="' + esc(p.id) + '"' : "") + ' style="--k:' + k + '"><title>' + name + " - " + price + " · score " + fmt(p.y) + "</title>";
      out += '<circle cx="' + fmt(m.cx) + '" cy="' + fmt(m.cy) + '" r="5.5" class="wc-dot' + (p.est ? " wc-est" : "") + '"></circle>';
      out += '<text x="' + fmt(m.tx) + '" y="' + fmt(m.ty === null ? m.cy - 6 : m.ty) + '" text-anchor="' + m.anchor + '" class="wc-ptlabel">' + name + "</text></g>";
    });
    out += "</svg>";
    return out;
  }

  /**
   * Grouped horizontal bars - compare 2-3 models across categories.
   * cats: ["Coding", ...]; series: [{ name, values: [..], cls }]
   */
  function groupedBars(cats, series, opts) {
    opts = opts || {};
    var barH = 12, gap = 3, groupPad = 15;
    var labelW = 118, valueW = 8;
    var W = 560;
    var groupH = series.length * (barH + gap) + groupPad;
    var legendH = Math.max(24, series.length * 22);
    var H = cats.length * groupH + legendH + 4;
    var barW = W - labelW - valueW - 40;
    var max = opts.max || 100;
    var out = '<svg class="wc-chart wc-grouped" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.aria || "Category comparison") + '" preserveAspectRatio="xMinYMin meet">';
    // legend
    var lx = labelW;
    series.forEach(function (s, si) {
      out += '<rect x="' + lx + '" y="' + (6 + si * 22) + '" width="10" height="10" rx="3" class="wc-s' + (si + 1) + '"></rect>';
      out += '<text x="' + (lx + 15) + '" y="' + (15 + si * 22) + '" class="wc-label">' + esc(s.name) + "</text>";
    });
    cats.forEach(function (cat, ci) {
      var gy = legendH + ci * groupH + 4;
      out += '<text x="' + (labelW - 8) + '" y="' + (gy + (series.length * (barH + gap)) / 2 + 1) + '" text-anchor="end" dominant-baseline="middle" class="wc-label">' + esc(cat) + "</text>";
      series.forEach(function (s, si) {
        var v = s.values && Number.isFinite(s.values[ci]) && s.values[ci] >= 0 ? s.values[ci] : null;
        var y = gy + si * (barH + gap);
        var w = v == null ? 0 : Math.min(1, v / max) * barW;
        out += "<g><title>" + esc(s.name) + " - " + esc(cat) + ": " + (v == null ? "not available" : v) + "</title>";
        out += '<rect x="' + labelW + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="5" class="wc-track"></rect>';
        if (v != null) {
          out += '<rect x="' + labelW + '" y="' + y + '" width="' + fmt(w) + '" height="' + barH + '" rx="5" class="wc-fillbar wc-s' + (si + 1) + '"></rect>';
          out += '<text x="' + (labelW + barW + 6) + '" y="' + (y + barH - 2.5) + '" class="wc-value wc-value-sm">' + v + "</text>";
        } else {
          out += '<text x="' + (labelW + 6) + '" y="' + (y + barH - 2.5) + '" class="wc-tick">-</text>';
        }
        out += "</g>";
      });
    });
    out += "</svg>";
    return out;
  }

  var Charts = { barChart: barChart, scatter: scatter, groupedBars: groupedBars, frontierOf: frontierOf, logTicks: logTicks, esc: esc };
  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAICharts = Charts;
  if (typeof module !== "undefined" && module.exports) module.exports = Charts;
})();
