/* WhichAI · minimal welcome and shared-element morph entrance (v0.26)
 * Native CSS + Web Animations API. No video, canvas or third-party runtime.
 */
(function () {
  "use strict";

  var root = typeof window !== "undefined" ? window : globalThis;
  if (typeof document === "undefined") return;

  var body = document.body;
  var welcome = document.getElementById("welcome");
  var actions = Array.prototype.slice.call(document.querySelectorAll(".welcome-action"));
  var entered = false;
  var leaving = false;
  var reduced = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function stripIds(node) {
    if (!node || node.nodeType !== 1) return;
    node.removeAttribute("id");
    Array.prototype.slice.call(node.children || []).forEach(stripIds);
  }

  function setRoute(route) {
    if (!route || route === "more") {
      if (!route && root.location.hash) {
        if (root.history && root.history.replaceState) root.history.replaceState(null, "", root.location.pathname + root.location.search);
        else root.location.hash = "";
        root.dispatchEvent(new Event("hashchange"));
      }
      return;
    }
    if (root.location.hash !== route) root.location.hash = route;
    else root.dispatchEvent(new Event("hashchange"));
  }

  function focusDestination(route, target) {
    if (route === "more" && target) {
      target.click();
      target.focus({ preventScroll: true });
      return;
    }
    var activeView = document.querySelector(".view:not([hidden])");
    var heading = activeView && activeView.querySelector("h1, h2, textarea, button");
    if (heading) {
      if (!heading.matches("textarea, button, a, input, select")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    } else if (target) target.focus({ preventScroll: true });
  }

  function complete(route, target) {
    entered = true;
    leaving = false;
    body.classList.remove("welcome-active", "welcome-leaving", "welcome-header-ready");
    body.classList.add("app-entered", "app-reveal");
    if (welcome) welcome.setAttribute("aria-hidden", "true");
    Array.prototype.slice.call(document.querySelectorAll(".welcome-morph-clone")).forEach(function (n) { n.remove(); });
    root.scrollTo(0, 0);
    focusDestination(route, target);
  }

  function skip(route, target) {
    setRoute(route);
    complete(route, target);
  }

  function animateClone(source, target, delay, isBrand) {
    if (!source || !target || !source.getBoundingClientRect || !target.getBoundingClientRect) return null;
    var from = source.getBoundingClientRect();
    var to = target.getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return null;

    var clone = source.cloneNode(true);
    stripIds(clone);
    clone.classList.add("welcome-morph-clone");
    clone.removeAttribute("aria-label");
    clone.setAttribute("aria-hidden", "true");
    clone.style.left = from.left + "px";
    clone.style.top = from.top + "px";
    clone.style.width = from.width + "px";
    clone.style.height = from.height + "px";
    document.body.appendChild(clone);

    var dx = to.left - from.left;
    var dy = to.top - from.top;
    var sx = to.width / from.width;
    var sy = to.height / from.height;
    if (isBrand) sx = sy = Math.min(1, to.height / from.height);

    var finalTransform = "translate3d(" + dx + "px," + dy + "px,0) scale(" + sx + "," + sy + ")";
    var anim = clone.animate([
      { transform: "translate3d(0,0,0) scale(1,1)", opacity: 1, filter: "blur(0)", offset: 0, easing: "cubic-bezier(.16,1,.3,1)" },
      { transform: finalTransform, opacity: 0.96, filter: "blur(0)", offset: 0.76, easing: "ease-out" },
      { transform: finalTransform, opacity: 0, filter: "blur(1.5px)", offset: 1 }
    ], {
      duration: isBrand ? 860 : 820,
      delay: delay,
      fill: "forwards"
    });
    return { clone: clone, animation: anim };
  }

  function leave(sourceAction) {
    if (entered || leaving) return;
    var route = sourceAction.getAttribute("data-welcome-route") || "";
    var targetId = sourceAction.getAttribute("data-welcome-target");
    var selectedTarget = targetId ? document.getElementById(targetId) : null;
    leaving = true;

    if (reduced || !Element.prototype.animate) {
      skip(route, selectedTarget);
      return;
    }

    setRoute(route);
    body.classList.add("welcome-leaving", "app-reveal");
    var brandSource = document.getElementById("welcome-brand");
    var brandTarget = document.querySelector(".brand");
    animateClone(brandSource, brandTarget, 0, true);

    actions.forEach(function (action, index) {
      var dest = document.getElementById(action.getAttribute("data-welcome-target"));
      var item = animateClone(action, dest, 35 + index * 42, false);
      if (item && action === sourceAction) item.clone.classList.add("is-selected");
    });

    root.setTimeout(function () { body.classList.add("welcome-header-ready"); }, 330);
    /* The slowest menu clone ends at ~981 ms. Keep the welcome layer alive
       until every clone has reached its target and faded, avoiding a hard cut. */
    root.setTimeout(function () { complete(route, selectedTarget); }, 1050);
  }

  actions.forEach(function (action) {
    action.addEventListener("click", function () { leave(action); });
  });

  function setLanguage(t) {
    if (typeof t !== "function") return;
    var pairs = {
      "welcome-value": "welcomeValue",
      "welcome-generator": "welcomeGenerator",
      "welcome-guide": "welcomeGuide",
      "welcome-compare": "welcomeCompare",
      "welcome-explore": "welcomeExplore"
    };
    Object.keys(pairs).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = t(pairs[id]);
    });
    var nav = document.querySelector(".welcome-menu");
    if (nav) nav.setAttribute("aria-label", t("welcomeNavLabel"));
  }

  function show() {
    if (!welcome) return;
    leaving = false;
    entered = false;
    Array.prototype.slice.call(document.querySelectorAll(".welcome-morph-clone")).forEach(function (n) { n.remove(); });
    body.classList.remove("app-entered", "app-reveal", "welcome-leaving", "welcome-header-ready");
    body.classList.add("welcome-active");
    welcome.removeAttribute("aria-hidden");
    if (root.location.hash) {
      if (root.history && root.history.replaceState) root.history.replaceState(null, "", root.location.pathname + root.location.search);
      else root.location.hash = "";
      root.dispatchEvent(new Event("hashchange"));
    }
    root.scrollTo(0, 0);
  }

  root.WhichAIWelcome = { leave: leave, skip: skip, setLanguage: setLanguage, show: show };

  if (!welcome || root.location.hash) {
    complete(root.location.hash || "", null);
  } else {
    welcome.removeAttribute("aria-hidden");
    root.addEventListener("hashchange", function () {
      if (!entered && !leaving && root.location.hash) complete(root.location.hash, null);
    });
  }
})();
