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

  /**
   * Scatter plot (price vs performance).
   * points: [{ x, y, label, est }] - x = blended $/1M tokens, y = index score.
   */
  function scatter(points, opts) {
    opts = opts || {};
    points = points.filter(function (p) { return p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0; });
    var W = 560, H = 330;
    var padL = 46, padR = 16, padT = 16, padB = 40;
    var xs = points.map(function (p) { return p.x; });
    var ys = points.map(function (p) { return p.y; });
    var xMax = Math.max(1, Math.max.apply(null, xs) * 1.15);
    var xMin = 0;
    var yMax = points.length ? Math.max.apply(null, ys) + 3 : 100;
    var yMin = points.length ? Math.max(0, Math.min.apply(null, ys) - 4) : 0;
    function X(v) { return padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR); }
    function Y(v) { return H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB); }
    var out = '<svg class="wc-chart wc-scatter" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.aria || "Scatter chart") + '" preserveAspectRatio="xMinYMin meet">';
    // gridlines + axis labels
    var ySteps = 4, xSteps = 4, i;
    for (i = 0; i <= ySteps; i++) {
      var yv = yMin + (i / ySteps) * (yMax - yMin);
      out += '<line x1="' + padL + '" y1="' + fmt(Y(yv)) + '" x2="' + (W - padR) + '" y2="' + fmt(Y(yv)) + '" class="wc-grid"></line>';
      out += '<text x="' + (padL - 7) + '" y="' + fmt(Y(yv)) + '" text-anchor="end" dominant-baseline="middle" class="wc-tick">' + fmt(yv) + "</text>";
    }
    for (i = 0; i <= xSteps; i++) {
      var xv = xMin + (i / xSteps) * (xMax - xMin);
      out += '<text x="' + fmt(X(xv)) + '" y="' + (H - padB + 16) + '" text-anchor="middle" class="wc-tick">$' + fmt(xv) + "</text>";
    }
    out += '<text x="' + ((padL + W - padR) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" class="wc-axis">' + esc(opts.xLabel || "") + "</text>";
    out += '<text x="12" y="' + ((padT + H - padB) / 2) + '" text-anchor="middle" class="wc-axis" transform="rotate(-90 12 ' + ((padT + H - padB) / 2) + ')">' + esc(opts.yLabel || "") + "</text>";
    points.forEach(function (p) {
      var cx = X(p.x), cy = Y(p.y);
      var name = esc(p.label) + (p.est ? " ~" : "");
      out += '<g class="wc-pt"><title>' + name + " - $" + fmt(p.x) + "/1M blended · score " + fmt(p.y) + "</title>";
      out += '<circle cx="' + fmt(cx) + '" cy="' + fmt(cy) + '" r="5.5" class="wc-dot' + (p.est ? " wc-est" : "") + '"></circle>';
      var anchor = cx > W - 120 ? "end" : "start";
      var tx = anchor === "end" ? cx - 9 : cx + 9;
      var ty = cy + (p.labelDy || 0) - 6;
      out += '<text x="' + fmt(tx) + '" y="' + fmt(ty) + '" text-anchor="' + anchor + '" class="wc-ptlabel">' + name + "</text></g>";
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

  var Charts = { barChart: barChart, scatter: scatter, groupedBars: groupedBars, esc: esc };
  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAICharts = Charts;
  if (typeof module !== "undefined" && module.exports) module.exports = Charts;
})();
