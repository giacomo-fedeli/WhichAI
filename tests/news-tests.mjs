/* WhichAI - the Radar news wire (v0.36).
   Offline: every upstream (lab RSS, Atom, Hacker News, Hugging Face) is a
   small fixture served by an injected fetcher, so the suite runs anywhere
   and protects what matters: only titles and links get through, nothing
   upstream can inject markup or a non-https link, one broken source never
   takes the others down, and an outage never blanks a good wire.
   Run: node tests/news-tests.mjs                                         */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Core = require("../api/_news-core.js");

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; failures.push(name + (detail ? " - " + detail : "")); console.log("FAIL  " + name + (detail ? " - " + detail : "")); }
}

const NOW = Date.parse("2026-10-13T12:00:00Z");
const day = (n) => new Date(NOW - n * 86400000);
const rfc = (n) => day(n).toUTCString();
const iso = (n) => day(n).toISOString();

const OPENAI_RSS = `<?xml version="1.0"?><rss><channel><title>OpenAI News</title>
<item><title><![CDATA[Introducing GPT-6.2]]></title><link>https://openai.com/index/introducing-gpt-6-2/</link><pubDate>${rfc(1)}</pubDate></item>
<item><title>Acme cuts support costs 40% with ChatGPT</title><link>https://openai.com/index/acme/</link><pubDate>${rfc(2)}</pubDate></item>
<item><title>How Globex scales research with Codex</title><link>https://openai.com/index/globex/</link><pubDate>${rfc(3)}</pubDate></item>
<item><title>Safety &amp; alignment update &lt;b&gt;bold&lt;/b&gt;</title><link>https://openai.com/index/safety/</link><pubDate>${rfc(4)}</pubDate></item>
<item><title>Ancient post</title><link>https://openai.com/index/old/</link><pubDate>${rfc(200)}</pubDate></item>
<item><title>From the future</title><link>https://openai.com/index/future/</link><pubDate>${new Date(NOW + 9 * 86400000).toUTCString()}</pubDate></item>
<item><title>Bad link</title><link>javascript:alert(1)</link><pubDate>${rfc(1)}</pubDate></item>
<item><title>Plain http</title><link>http://openai.com/index/plain/</link><pubDate>${rfc(1)}</pubDate></item>
</channel></rss>`;

const DEEPMIND_ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
<entry><title type="html">Gemini 3.7 &#8211; what&#39;s new</title><link rel="alternate" href="https://deepmind.google/blog/gemini-3-7/"/><published>${iso(2)}</published></entry>
<entry><title>Untitled with no date</title><link href="https://deepmind.google/blog/nodate/"/></entry>
</feed>`;

const MISTRAL_RSS = `<rss><channel><item><title>Mistral Medium 4</title><link>https://mistral.ai/news/medium-4</link><pubDate>${rfc(5)}</pubDate></item></channel></rss>`;
const TECHCRUNCH_RSS = `<rss><channel>
<item><title>Anthropic raises again</title><link>https://techcrunch.com/2026/10/11/anthropic/</link><pubDate>${rfc(2)}</pubDate></item>
<item><title>A new bike-sharing startup</title><link>https://techcrunch.com/2026/10/11/bikes/</link><pubDate>${rfc(2)}</pubDate></item>
<item><title>Introducing GPT-6.2 (duplicate URL with tracking)</title><link>https://openai.com/index/introducing-gpt-6-2/?utm_source=tc</link><pubDate>${rfc(1)}</pubDate></item>
</channel></rss>`;
const HF_BLOG = `<rss><channel><item><title>Open weights, open eval</title><link>https://huggingface.co/blog/open-eval</link><pubDate>${rfc(6)}</pubDate></item></channel></rss>`;

const HN_HITS = {
  OpenAI: [
    { objectID: "41000001", title: "OpenAI ships GPT-6.2", url: "https://example.com/gpt62", points: 900, created_at: iso(1) },
    { objectID: "41000002", title: "Show HN: my sourdough timer", url: "https://example.com/bread", points: 400, created_at: iso(1) }
  ],
  Anthropic: [
    { objectID: "41000001", title: "OpenAI ships GPT-6.2", url: "https://example.com/gpt62", points: 900, created_at: iso(1) },
    { objectID: "41000003", title: "Claude <script>alert(1)</script> gets memory", url: null, points: 300, created_at: iso(2) }
  ]
};
const HF_TRENDING = [
  { id: "qwen/Qwen3.8-27B", pipeline_tag: "text-generation", likes: 1200, createdAt: iso(3) },
  { id: "someone/Qwen3.8-27B-GGUF", pipeline_tag: "text-generation", likes: 300, createdAt: iso(3) },
  { id: "lab/stable-pictures", pipeline_tag: "text-to-image", likes: 900, createdAt: iso(3) },
  { id: "bad id with spaces", pipeline_tag: "text-generation", likes: 5, createdAt: iso(3) },
  { id: "old/model", pipeline_tag: "text-generation", likes: 50, createdAt: iso(400) }
];

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, text: async () => body };
}
function makeFetcher(overrides) {
  const calls = [];
  const fn = async (url) => {
    calls.push(url);
    const o = overrides || {};
    for (const k of Object.keys(o)) if (url.includes(k)) { const v = o[k]; if (v instanceof Error) throw v; return response(v[0], v[1]); }
    if (url.includes("openai.com/news/rss")) return response(200, OPENAI_RSS);
    if (url.includes("deepmind.google")) return response(200, DEEPMIND_ATOM);
    if (url.includes("mistral.ai")) return response(200, MISTRAL_RSS);
    if (url.includes("techcrunch.com")) return response(200, TECHCRUNCH_RSS);
    if (url.includes("huggingface.co/blog")) return response(200, HF_BLOG);
    if (url.includes("huggingface.co/api/models")) return response(200, JSON.stringify(HF_TRENDING));
    if (url.includes("hn.algolia.com")) {
      const q = decodeURIComponent((url.match(/query=([^&]*)/) || [])[1] || "");
      return response(200, JSON.stringify({ hits: HN_HITS[q] || [] }));
    }
    return response(404, "");
  };
  fn.calls = calls;
  return fn;
}

/* ---------- 1. parsing and hygiene ---------- */
{
  const rss = Core.parseFeed(OPENAI_RSS);
  check("feed: RSS items parsed with CDATA titles", rss.some((i) => i.title === "Introducing GPT-6.2"));
  check("feed: entities decoded, markup stripped", rss.some((i) => i.title === "Safety & alignment update bold"));
  check("feed: javascript: and http: links dropped", !rss.some((i) => /javascript|^http:/.test(i.url)));
  const atom = Core.parseFeed(DEEPMIND_ATOM);
  check("feed: Atom entries read via rel=alternate", atom.length === 1 && atom[0].url === "https://deepmind.google/blog/gemini-3-7/");
  check("feed: numeric entities decoded", atom[0].title === "Gemini 3.7 – what's new");
  check("feed: undated entries skipped", !atom.some((i) => /nodate/.test(i.url)));
  check("clean: no angle brackets ever survive", !/[<>]/.test(Core.clean("<img src=x onerror=alert(1)>hi &lt;script&gt;")));
  check("httpsUrl: rejects quotes and spaces", Core.httpsUrl('https://a.com/"x') === null && Core.httpsUrl("https://a.com/a b") === null);
  check("httpsUrl: accepts a normal https link", Core.httpsUrl("https://openai.com/index/x/") === "https://openai.com/index/x/");
  check("garbage in, empty out", Core.parseFeed("not xml at all").length === 0 && Core.parseFeed(null).length === 0);
}

/* ---------- 2. per-source rules ---------- */
{
  const f = makeFetcher();
  const src = (id) => Core.SOURCES.find((s) => s.id === id);
  const openai = await Core.readSource(src("openai"), f, NOW);
  check("labs: customer stories are not launches", !openai.some((i) => /Acme|Globex/.test(i.title)));
  check("labs: the launch is kept", openai.some((i) => i.title === "Introducing GPT-6.2"));
  check("window: older than 45 days dropped", !openai.some((i) => /Ancient/.test(i.title)));
  check("window: future-dated posts dropped", !openai.some((i) => /future/.test(i.title)));
  check("items carry source, name and kind", openai.every((i) => i.source === "openai" && i.sourceName === "OpenAI" && i.kind === "lab"));

  const tc = await Core.readSource(src("techcrunch"), f, NOW);
  check("press: only AI headlines", tc.some((i) => /Anthropic/.test(i.title)) && !tc.some((i) => /bike/.test(i.title)));

  const hn = await Core.readSource(src("hn"), f, NOW);
  check("hn: one query per topic", f.calls.filter((u) => u.includes("hn.algolia.com")).length === Core.HN_QUERIES.length);
  check("hn: duplicates across queries merged", hn.filter((i) => /GPT-6\.2/.test(i.title)).length === 1);
  check("hn: off-topic stories dropped", !hn.some((i) => /sourdough/.test(i.title)));
  check("hn: sorted by points", hn[0].score >= hn[hn.length - 1].score);
  const noUrl = hn.find((i) => /memory/.test(i.title));
  check("hn: a text post links to its discussion", noUrl && noUrl.url === "https://news.ycombinator.com/item?id=41000003");
  check("hn: markup in a title is neutralised", noUrl && !/[<>]/.test(noUrl.title));
  check("hn: every item links to its discussion", hn.every((i) => /^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/.test(i.discuss)));

  const hf = await Core.readSource(src("hf-trending"), f, NOW);
  check("hf: language models only", hf.length === 1 && hf[0].model === "qwen/Qwen3.8-27B");
  check("hf: links to the model page", hf[0].url === "https://huggingface.co/qwen/Qwen3.8-27B");
}

/* ---------- 3. the wire ---------- */
{
  const wire = await Core.collect(makeFetcher(), NOW);
  check("wire: schema", Core.isWire(wire) && wire.generatedAt === new Date(NOW).toISOString());
  check("wire: every source reports", wire.sources.length === Core.SOURCES.length && wire.sources.every((s) => s.ok));
  check("wire: newest first", wire.items.every((i, k) => k === 0 || wire.items[k - 1].date >= i.date));
  check("wire: same story from two sources appears once", wire.items.filter((i) => /introducing-gpt-6-2/.test(i.url)).length === 1);
  check("wire: capped", wire.items.length <= 60);
  const KEYS = new Set(["source", "sourceName", "kind", "title", "url", "date", "score", "discuss", "model"]);
  check("wire: items carry titles and links only (no article text)", wire.items.every((i) => Object.keys(i).every((k) => KEYS.has(k))));
  check("wire: every link is https", wire.items.every((i) => /^https:\/\//.test(i.url)));

  const broken = await Core.collect(makeFetcher({ "mistral.ai": [500, ""], "deepmind.google": new Error("timeout") }), NOW);
  const m = broken.sources.find((s) => s.id === "mistral");
  check("fail-soft: a 500 is reported, not thrown", m && m.ok === false && /500/.test(m.error));
  check("fail-soft: a timeout is reported", broken.sources.find((s) => s.id === "deepmind").ok === false);
  check("fail-soft: the other sources still arrive", broken.items.some((i) => i.source === "openai") && broken.items.some((i) => i.source === "hn"));
  const bad = await Core.collect(makeFetcher({ "huggingface.co/api": [200, "{not json"] }), NOW);
  check("fail-soft: malformed JSON is one failed source", bad.sources.find((s) => s.id === "hf-trending").ok === false && bad.items.length > 0);
}

/* ---------- 4. the service: cache and outage memory ---------- */
{
  let t = NOW, down = false, calls = 0;
  const inner = makeFetcher();
  const fetcher = async (u, o) => { calls++; if (down) throw new Error("offline"); return inner(u, o); };
  const svc = Core.createService({ fetcher, clock: () => t });
  const a = await svc.get();
  const c1 = calls;
  await svc.get();
  check("service: second call within 30 min is cached", calls === c1);
  t += Core.TTL_MS + 1000; down = true;
  const b = await svc.get();
  check("service: an outage keeps the last good wire", b.items.length === a.items.length && b.items.length > 0);
  const fresh = Core.createService({ fetcher: async () => { throw new Error("offline"); }, clock: () => NOW });
  const c = await fresh.get();
  check("service: first-ever outage answers an empty wire, not an error", Core.isWire(c) && c.items.length === 0 && c.sources.every((s) => !s.ok));
}

/* ---------- 5. the endpoint, through the local dev server ---------- */
{
  const realFetch = globalThis.fetch;
  let upstreamDown = false;
  const stub = makeFetcher();
  globalThis.fetch = (url, opts) => {
    const u = String(url);
    if (u.startsWith("http://127.0.0.1")) return realFetch(url, opts);
    if (upstreamDown) return Promise.reject(new Error("offline"));
    return stub(u, opts);
  };
  const { createServer } = await import("../tools/api-dev.mjs");
  const server = createServer();
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const res = await realFetch(base + "/api/news");
  const json = await res.json();
  check("endpoint: 200 with a fresh wire", res.status === 200 && json.status === "fresh" && json.items.length > 0);
  check("endpoint: cached at the edge for 30 minutes", /s-maxage=1800/.test(res.headers.get("cache-control") || ""));
  check("endpoint: CORS open like the rest of the API", res.headers.get("access-control-allow-origin") === "*");
  const post = await realFetch(base + "/api/news", { method: "POST" });
  check("endpoint: read-only", post.status === 405);
  check("endpoint: no user data in the payload", !/"(apikey|token|cookie|session|email)"/i.test(JSON.stringify(json)));
  server.close();
  globalThis.fetch = realFetch;
}

console.log("\n" + pass + " passed, " + fail + " failed");
if (fail) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
