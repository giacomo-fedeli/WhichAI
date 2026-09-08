/*
 * WhichAI - Shareable result cards (v0.25.0)
 * Draws a 1200x630 PNG (OG size) on a canvas, then uses the native share
 * sheet where available and falls back to a download. 100% client-side.
 */
(function () {
  "use strict";

  var W = 1200, H = 630;

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw(data) {
    var c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    var ctx = c.getContext("2d");

    // background: dark with aurora glows (premium look in every theme)
    ctx.fillStyle = "#101116";
    ctx.fillRect(0, 0, W, H);
    var g1 = ctx.createRadialGradient(220, 90, 0, 220, 90, 520);
    g1.addColorStop(0, "rgba(59, 130, 246, 0.28)");
    g1.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    var g2 = ctx.createRadialGradient(1020, 560, 0, 1020, 560, 560);
    g2.addColorStop(0, "rgba(139, 92, 246, 0.24)");
    g2.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // compass mark
    ctx.strokeStyle = "#e7e9ee";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(96, 96, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.moveTo(112, 80);
    ctx.lineTo(102, 102);
    ctx.lineTo(80, 112);
    ctx.lineTo(90, 90);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#e7e9ee";
    ctx.font = "700 40px Inter, system-ui, sans-serif";
    ctx.fillText("WhichAI", 150, 110);

    if (data.badge) {
      ctx.font = "600 22px Inter, system-ui, sans-serif";
      var bw = ctx.measureText(data.badge).width + 36;
      roundRect(ctx, W - 80 - bw, 72, bw, 44, 22);
      ctx.strokeStyle = "rgba(231, 233, 238, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#9aa1ad";
      ctx.fillText(data.badge, W - 80 - bw + 18, 101);
    }

    // title + subtitle
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 58px Inter, system-ui, sans-serif";
    ctx.fillText(clip(ctx, data.title || "", W - 160), 80, 218);
    if (data.subtitle) {
      ctx.fillStyle = "#9aa1ad";
      ctx.font = "400 28px Inter, system-ui, sans-serif";
      ctx.fillText(clip(ctx, data.subtitle, W - 160), 80, 262);
    }

    // rows
    var y = 316;
    (data.rows || []).slice(0, 4).forEach(function (row) {
      roundRect(ctx, 80, y - 34, W - 160, 56, 16);
      ctx.fillStyle = "rgba(231, 233, 238, 0.06)";
      ctx.fill();
      ctx.fillStyle = "#60a5fa";
      ctx.font = "700 26px Inter, system-ui, sans-serif";
      var label = clip(ctx, row.label || "", 330);
      ctx.fillText(label, 104, y + 2);
      ctx.fillStyle = "#e7e9ee";
      ctx.font = "400 26px Inter, system-ui, sans-serif";
      ctx.fillText(clip(ctx, row.value || "", W - 560), 460, y + 2);
      y += 72;
    });

    // footer
    ctx.fillStyle = "#9aa1ad";
    ctx.font = "500 24px Inter, system-ui, sans-serif";
    ctx.fillText("whichai.wiki · free, private, no account", 80, H - 52);
    return c;
  }

  function clip(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (text.length > 1 && ctx.measureText(text + "…").width > maxW) text = text.slice(0, -1);
    return text + "…";
  }

  /** share(data) -> native share sheet where possible, else PNG download. */
  function share(data, doneCb) {
    var canvas = draw(data);
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var file = null;
      try { file = new File([blob], "whichai-result.png", { type: "image/png" }); } catch (e) { /* older browsers */ }
      if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: "WhichAI", text: (data.title || "") + " · whichai.wiki" })
          .then(function () { if (doneCb) doneCb("shared"); })
          .catch(function (err) {
            // Closing the native share sheet is a choice, not a failed export.
            if (err && err.name === "AbortError") return;
            download(blob, doneCb);
          });
      } else {
        download(blob, doneCb);
      }
    }, "image/png");
  }

  function download(blob, doneCb) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "whichai-result.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    if (doneCb) doneCb("downloaded");
  }

  var Share = { share: share, _draw: draw };
  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAIShare = Share;
  if (typeof module !== "undefined" && module.exports) module.exports = Share;
})();
