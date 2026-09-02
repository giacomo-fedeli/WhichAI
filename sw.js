/* WhichAI service worker: network-first, precached shell, offline fallback.
   Bump CACHE on every release so old assets never linger. */
var CACHE = "whichai-v0.32.0";
var SHELL = [
  "./", "index.html", "styles.css", "manifest.webmanifest",
  "js/engine.js", "js/benchmarks.js", "js/chains.js", "js/i18n.js", "js/models-db.js",
  "js/merge.js", "js/charts.js", "js/glossary.js", "js/finder.js", "js/modelcompare.js", "js/stack.js", "js/doctor.js", "js/changes.js", "js/radar.js", "js/sharecard.js", "js/arena.js", "js/config.js", "js/api.js", "js/support.js", "js/topics.js", "js/brands.js", "js/welcome.js", "js/app.js",
  "assets/brands/claude-color.svg", "assets/brands/claude-text.svg", "assets/brands/openai.svg", "assets/brands/openai-text.svg",
  "assets/brands/gemini-color.svg", "assets/brands/gemini-text.svg", "assets/brands/perplexity-color.svg", "assets/brands/perplexity-text.svg",
  "assets/brands/grok.svg", "assets/brands/grok-text.svg", "assets/brands/copilot-color.svg", "assets/brands/copilot-text.svg",
  "assets/brands/meta-color.svg", "assets/brands/meta-text.svg", "assets/brands/zhipu-color.svg", "assets/brands/zhipu-text.svg",
  "assets/brands/kimi-color.svg", "assets/brands/kimi-text.svg", "assets/brands/nvidia-color.svg", "assets/brands/nvidia-text.svg",
  "assets/brands/deepseek-color.svg", "assets/brands/deepseek-text.svg", "assets/brands/qwen-color.svg", "assets/brands/qwen-text.svg",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // never touch provider calls or fonts
  // The WhichAI API is always live or explicitly absent: caching it here would
  // hand the app a stale catalog while hiding that the backend is down.
  if (url.pathname.indexOf("/api/") === 0) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        if (hit) return hit;
        if (e.request.mode === "navigate") return caches.match("index.html");
        return Response.error();
      });
    })
  );
});
