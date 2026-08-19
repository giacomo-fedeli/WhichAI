/*
 * WhichAI - visit counter + donations (v0.29.0)
 * Both features are driven by js/config.js and stay hidden until configured.
 * Counter: GoatCounter (privacy-friendly, no cookies). We load its tiny
 * count script and read the PUBLIC total back, so the number shown is real.
 */
(function () {
  "use strict";

  var deps = null; // { T }

  function cfg() { return window.WhichAIConfig || {}; }

  function fmt(nStr) {
    // GoatCounter returns a formatted string like "12 345"; normalize spacing
    return String(nStr == null ? "" : nStr).replace(/\s+/g, " ");
  }

  function initCounter() {
    var code = (cfg().goatCode || "").trim();
    var slots = [document.getElementById("visit-counter"), document.getElementById("welcome-visits")].filter(Boolean);
    if (!code) { slots.forEach(function (s) { s.hidden = true; }); return; }

    // 1) count this visit (async, non-blocking, no cookies)
    if (!document.querySelector('script[data-goatcounter]')) {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://gc.zgo.at/count.js";
      s.setAttribute("data-goatcounter", "https://" + code + ".goatcounter.com/count");
      document.body.appendChild(s);
    }

    // 2) show the real public total (only where fetch exists: an old webview
    //    or a test harness must degrade to "no counter", never to a crash)
    if (typeof fetch !== "function") return;
    fetch("https://" + code + ".goatcounter.com/counter/TOTAL.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || d.count == null) return;
        slots.forEach(function (slot) {
          slot.textContent = "";
          var eye = document.createElement("span");
          eye.className = "vc-dot";
          eye.setAttribute("aria-hidden", "true");
          slot.appendChild(eye);
          var strong = document.createElement("strong");
          strong.textContent = fmt(d.count);
          slot.appendChild(strong);
          slot.appendChild(document.createTextNode(" " + deps.T("visitsLabel")));
          slot.hidden = false;
        });
      })
      .catch(function () { /* stay hidden on failure - never show a fake number */ });
  }

  function initDonate() {
    var url = (cfg().donateUrl || "").trim();
    var footLink = document.getElementById("foot-support");
    var aboutCard = document.getElementById("about-support");
    var aboutBtn = document.getElementById("support-btn");
    if (!url) {
      if (footLink) footLink.hidden = true;
      if (aboutCard) aboutCard.hidden = true;
      return;
    }
    if (footLink) {
      footLink.href = url;
      footLink.hidden = false;
    }
    if (aboutCard) aboutCard.hidden = false;
    if (aboutBtn) aboutBtn.href = url;
  }

  var Support = {
    init: function (dependencies) {
      deps = dependencies;
      initCounter();
      initDonate();
    },
    relabel: function () { if (deps) { initDonate(); } }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.WhichAISupport = Support;
  if (typeof module !== "undefined" && module.exports) module.exports = Support;
})();
