/*
 * WhichAI - one-time migration to the official Artificial Analysis scale
 * (October 3, 2026, session 36). Kept for provenance: it documents exactly
 * how every number in js/models-db.js was produced. It refuses to run twice.
 *
 * Why it exists. Until v0.34 the catalog's "AA index" came from the BenchLM
 * mirror, whose numbers sit on a different scale from the index Artificial
 * Analysis publishes itself (Claude Opus 5: 63.0 on the mirror, 50.8 official;
 * OfficeChai, Sept 22 2026, reports the official values: Opus 5.5 58, GPT-6
 * Astra 53, Fable 5.1 53, Opus 5 51). OpenRouter relays the OFFICIAL values in
 * its public model list, for free and without a key, so from v0.35 the site
 * reads them automatically. This script moves the static catalog onto the
 * same scale, so the offline fallback and the live data never disagree:
 *
 *   1. every entry gets an `or` list: the OpenRouter routes it is sold under
 *   2. an entry with an official measurement takes it (est:false, src:"aa")
 *   3. an entry measured only on the old scale is converted with a monotone
 *      fit over the 54 models measured on both (est:true, src:"converted",
 *      was:<old value>) - an estimate, shown with "~", never ranked
 *   4. unmeasured guesses are converted the same way and stay unranked
 *
 * Run once: node tools/migrations/2026-10-03-official-aa-scale.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
globalThis.window = globalThis;

const FILE = new URL("../../js/models-db.js", import.meta.url);
const FIXTURE = new URL("../../tests/fixtures/openrouter-2026-10-03.json", import.meta.url);
const WHEN = Date.parse("2026-10-03T18:46:00Z");

const OR = {"gpt-6":["openai/gpt-6-astra"],"gpt-5-6-sol":["openai/gpt-5.6-sol"],"gpt-5-6-terra":["openai/gpt-5.6-terra"],"gpt-5-6-luna":["openai/gpt-5.6-luna"],"gpt-5-5":["openai/gpt-5.5"],"gpt-5-5-pro":["openai/gpt-5.5-pro"],"gpt-5-4":["openai/gpt-5.4"],"gpt-5-4-mini":["openai/gpt-5.4-mini"],"gpt-5-4-nano":["openai/gpt-5.4-nano"],"gpt-5-3-codex":["openai/gpt-5.3-codex"],"gpt-5-2":["openai/gpt-5.2"],"gpt-5-1":["openai/gpt-5.1"],"gpt-5":["openai/gpt-5"],"o3-pro":["openai/o3-pro"],"o3":["openai/o3"],"gpt-4-1":["openai/gpt-4.1"],"gpt-4o":["openai/gpt-4o"],"gpt-oss-120b":["openai/gpt-oss-120b"],"gpt-oss-20b":["openai/gpt-oss-20b"],"claude-opus-5":["anthropic/claude-opus-5"],"fable-5-1":["anthropic/claude-fable-5.1"],"fable-5":["anthropic/claude-fable-5"],"opus-4-8":["anthropic/claude-opus-4.8"],"opus-4-7":["anthropic/claude-opus-4.7"],"sonnet-5":["anthropic/claude-sonnet-5"],"sonnet-4-6":["anthropic/claude-sonnet-4.6"],"haiku-4-5":["anthropic/claude-haiku-4.5"],"opus-4-6":["anthropic/claude-opus-4.6"],"opus-4-5":["anthropic/claude-opus-4.5"],"claude-4-1-opus":["anthropic/claude-opus-4.1"],"gemini-3-1-pro":["google/gemini-3.1-pro","google/gemini-3.1-pro-preview"],"gemini-3-8-flash":["google/gemini-3.8-flash"],"gemini-3-7-flash":["google/gemini-3.7-flash"],"gemini-3-6-flash":["google/gemini-3.6-flash"],"gemini-3-5-flash-lite":["google/gemini-3.5-flash-lite"],"gemini-3-5-flash":["google/gemini-3.5-flash"],"gemini-3-flash":["google/gemini-3-flash","google/gemini-3-flash-preview"],"gemini-3-1-flash-lite":["google/gemini-3.1-flash-lite","google/gemini-3.1-flash-lite-preview"],"gemini-2-5-pro":["google/gemini-2.5-pro"],"gemini-2-5-flash":["google/gemini-2.5-flash"],"gemma-4-31b":["google/gemma-4-31b-it"],"gemma-3-27b":["google/gemma-3-27b-it"],"grok-4-6":["x-ai/grok-4.6"],"grok-4-5":["x-ai/grok-4.5"],"grok-4-3":["x-ai/grok-4.3"],"grok-build-0-1":["x-ai/grok-build-0.1"],"muse-spark-1-3":["meta/muse-spark-1.3"],"muse-spark-1-2":["meta/muse-spark-1.2"],"muse-spark-1-1":["meta/muse-spark-1.1"],"llama-4-maverick":["meta-llama/llama-4-maverick"],"llama-4-scout":["meta-llama/llama-4-scout"],"llama-3-3-70b":["meta-llama/llama-3.3-70b-instruct"],"llama-3-1-405b":["meta-llama/llama-3.1-405b-instruct"],"phi-4":["microsoft/phi-4"],"sonar":["perplexity/sonar"],"sonar-pro":["perplexity/sonar-pro"],"deepseek-v4-pro":["deepseek/deepseek-v4-pro"],"deepseek-v4-flash":["deepseek/deepseek-v4-flash"],"deepseek-v3-2":["deepseek/deepseek-v3.2"],"deepseek-r1":["deepseek/deepseek-r1"],"qwen-3-7-max":["qwen/qwen3.7-max"],"qwen-3-7-plus":["qwen/qwen3.7-plus"],"qwen-3-6-plus":["qwen/qwen3.6-plus"],"qwen-3-6-27b":["qwen/qwen3.6-27b"],"qwen-3-5-397b":["qwen/qwen3.5-397b-a17b"],"qwen3-coder":["qwen/qwen3-coder"],"kimi-k3":["moonshotai/kimi-k3"],"kimi-k2-6":["moonshotai/kimi-k2.6"],"kimi-k2-7-code":["moonshotai/kimi-k2.7-code"],"kimi-k2-5":["moonshotai/kimi-k2.5"],"glm-5-3":["z-ai/glm-5.3"],"glm-5-3-flash":["z-ai/glm-5.3-flash"],"glm-5-2":["z-ai/glm-5.2"],"glm-5-1":["z-ai/glm-5.1"],"glm-5":["z-ai/glm-5"],"hy3":["tencent/hy3","tencent/hy3-preview"],"mimo-v2-5-pro":["xiaomi/mimo-v2.5-pro"],"step-3-7-flash":["stepfun/step-3.7-flash"],"minimax-m3":["minimax/minimax-m3"],"minimax-m2-7":["minimax/minimax-m2.7"],"inkling":["thinkingmachines/inkling"],"nemotron-3-ultra":["nvidia/nemotron-3-ultra-550b-a55b"],"nemotron-3-super":["nvidia/nemotron-3-super-120b-a12b"],"mistral-medium-3-5":["mistralai/mistral-medium-3-5"],"mistral-large-3":["mistralai/mistral-large-2512"],"mistral-small-4":["mistralai/mistral-small-2603"],"ministral-3-14b":["mistralai/ministral-14b-2512"],"mercury-2":["inception/mercury-2"],"command-a-plus":["cohere/command-a-plus"],"trinity-large":["arcee-ai/trinity-large-thinking"],"reka-flash-3":["rekaai/reka-flash-3"]};

let src = readFileSync(FILE, "utf8");
if (src.includes('scaleVersion: "aa-official"')) {
  console.log("Already migrated: js/models-db.js is on the official scale. Nothing to do.");
  process.exit(0);
}

const DB = require("../../js/models-db.js");
const Live = require("../../api/_live-core.js");
const Core = require("../../api/_catalog-core.js");
DB.models.forEach((m) => { if (OR[m.id]) m.or = OR[m.id]; });
const live = Live.normalize(JSON.parse(readFileSync(FIXTURE, "utf8")), DB, WHEN);
const delta = Core.computeDelta(DB, live, { now: WHEN });

/* Monotone fit old -> official over the models measured on both scales. */
const pairs = [];
DB.models.forEach((m) => {
  const p = delta.patches[m.id];
  if (p && p.score && m.score && typeof m.score.aa === "number" && !m.score.est) pairs.push([m.score.aa, p.score.aa]);
});
pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const blocks = pairs.map((p) => ({ x: p[0], s: p[1], n: 1 }));
for (let i = 0; i < blocks.length - 1;) {
  if (blocks[i].s / blocks[i].n > blocks[i + 1].s / blocks[i + 1].n) {
    blocks[i].x = (blocks[i].x * blocks[i].n + blocks[i + 1].x * blocks[i + 1].n) / (blocks[i].n + blocks[i + 1].n);
    blocks[i].s += blocks[i + 1].s; blocks[i].n += blocks[i + 1].n; blocks.splice(i + 1, 1);
    if (i > 0) i--;
  } else i++;
}
const knots = blocks.map((b) => [b.x, b.s / b.n]);
const n = pairs.length, sx = pairs.reduce((a, p) => a + p[0], 0), sy = pairs.reduce((a, p) => a + p[1], 0);
const sxx = pairs.reduce((a, p) => a + p[0] * p[0], 0), sxy = pairs.reduce((a, p) => a + p[0] * p[1], 0);
const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
function convert(x) {
  if (x <= knots[0][0]) return Math.max(0, x * knots[0][1] / knots[0][0]);
  const last = knots[knots.length - 1];
  if (x >= last[0]) return last[1] + (x - last[0]) * slope;
  for (let i = 0; i < knots.length - 1; i++) {
    const a = knots[i], b = knots[i + 1];
    if (x >= a[0] && x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] || 1);
  }
  return x;
}
const r1 = (v) => Math.round(v * 10) / 10;

/* Edit the source text block by block: comments, order and formatting stay. */
const starts = [...src.matchAll(/\{ id: "([^"]+)"/g)].map((m) => ({ id: m[1], at: m.index }));
const tally = { official: 0, converted: 0, guesses: 0, mapped: 0 };
let out = "", cursor = 0;
starts.forEach((s, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].at : src.indexOf("\n    ]", s.at);
  let block = src.slice(s.at, end);
  const m = DB.models.find((x) => x.id === s.id);
  const p = delta.patches[s.id];
  if (OR[s.id]) {
    block = block.replace(/status: "([a-z]+)",/, 'status: "$1", or: ' + JSON.stringify(OR[s.id]).replace(/","/g, '", "') + ",");
    tally.mapped++;
  }
  block = block.replace(/score: \{ aa: (null|[\d.]+), (guess: ([\d.]+), )?est: (true|false),/, (all, aa, g, guess) => {
    if (p && p.score) {
      tally.official++;
      const extra = (p.score.coding != null ? ", coding: " + p.score.coding : "") + (p.score.agentic != null ? ", agentic: " + p.score.agentic : "");
      return "score: { aa: " + p.score.aa + ", est: false, src: \"aa\"" + extra + ", at: \"2026-10-03\",";
    }
    if (aa !== "null") {
      tally.converted++;
      return "score: { aa: " + r1(convert(parseFloat(aa))) + ", est: true, src: \"converted\", was: " + aa + ",";
    }
    if (guess) {
      tally.guesses++;
      return "score: { aa: null, guess: " + Math.round(convert(parseFloat(guess))) + ", est: true, src: \"guess\",";
    }
    return all;
  });
  out += src.slice(cursor, s.at) + block;
  cursor = end;
});
out += src.slice(cursor);

/* The header and the notes say where the numbers come from now. */
out = out.replace(/ \* Overall score \("aa"\):[\s\S]*?\* Category scores/, ` * Overall score ("aa"): Artificial Analysis Intelligence Index on the OFFICIAL scale
 * (the number published on artificialanalysis.ai), read from OpenRouter's public
 * model list. src:"aa" = official measurement; src:"converted" = measured only on
 * the older BenchLM-mirror scale and converted (est:true, shown with "~", never
 * ranked); src:"guess" = nobody has measured it. The live site refreshes every
 * number automatically through /api/catalog (see js/live-catalog.js): this file
 * is the offline fallback and the editorial layer (reviews, caveats, categories).
 * Category scores`);
out = out.replace(/updated: "[^"]+",/, 'updated: "October 3, 2026",\n    scaleVersion: "aa-official",');
out = out.replace(/scaleNote: "[^"]*",/, 'scaleNote: "Artificial Analysis Intelligence Index, official scale (the number published on artificialanalysis.ai), relayed by OpenRouter. Static snapshot retrieved October 3, 2026; the live site refreshes it automatically every hour. A value marked ~ is converted from the older BenchLM-mirror scale because no current official measurement is published; models nobody has measured carry no index score and never enter a ranking.",');
out = out.replace(/specNote: "[^"]*",/, 'specNote: "Context, price, modality and listing dates come from the public OpenRouter model list (refreshed automatically on the live site; static copy retrieved October 3, 2026) and vendor pages. Missing values are not published or not yet verified - shown as -.",');

writeFileSync(FILE, out);
console.log("Migrated js/models-db.js to the official AA scale:", tally);
console.log("Fit: " + pairs.length + " pairs, " + knots.length + " monotone knots, tail slope " + slope.toFixed(3));
