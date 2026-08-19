/*
 * WhichAI - production build (v0.30.0)
 *
 * The repository keeps readable, commented sources; production gets a
 * minified copy. Run: node tools/build.mjs  ->  dist/
 *
 * What it does:
 *   - minifies every js/*.js and styles.css with esbuild (comments, the
 *     methodology notes inside them and local variable names all go away)
 *   - collapses HTML whitespace and drops HTML comments, leaving inline
 *     <script> bodies byte-identical so the CSP sha256 hash stays valid
 *   - recomputes and rewrites that CSP hash anyway, so an edit to the
 *     inline theme script can never silently break the policy
 *   - copies the static wiki, assets, icons, data, manifest, sw.js
 *   - leaves api/ where Vercel expects it (repo root), never in dist/
 *
 * Honest limit: minification is not protection. Anything the browser runs,
 * the browser can show. The parts that must not be copied wholesale live
 * behind /api. This step raises the effort, it does not make it secret.
 */
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");

/* Copied verbatim: already-generated HTML, binary assets, metadata. */
const COPY_DIRS = ["assets", "icons", "models", "best-ai-for", "glossary", "compare", "topics", "data"];
const COPY_FILES = ["manifest.webmanifest", "robots.txt", "sitemap.xml", "og-image.png", "sw.js", "googlebec30452573f9596.html"];
/* Never shipped: sources of truth for humans and machines, not for browsers. */
const EXCLUDE_DATA = ["refresh-report.json", "refresh-report.md"];

const bytes = (n) => (n < 1024 ? n + " B" : (n / 1024).toFixed(1) + " KB");

async function minifyJs() {
  const dir = path.join(ROOT, "js");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".js"));
  await mkdir(path.join(OUT, "js"), { recursive: true });
  let before = 0, after = 0;
  for (const f of files) {
    const src = await readFile(path.join(dir, f), "utf8");
    const res = await build({
      stdin: { contents: src, loader: "js", sourcefile: f },
      write: false,
      minify: true,
      target: ["es2018"],
      /* Without this esbuild escapes every non-ASCII character, which would
         inflate the 11-language i18n file (Arabic, Japanese, Russian) by ~40%. */
      charset: "utf8",
      legalComments: "none",
      logLevel: "silent"
    });
    const out = res.outputFiles[0].text;
    await writeFile(path.join(OUT, "js", f), out);
    before += Buffer.byteLength(src);
    after += Buffer.byteLength(out);
  }
  return { files: files.length, before, after };
}

async function minifyCss() {
  const src = await readFile(path.join(ROOT, "styles.css"), "utf8");
  const res = await build({
    stdin: { contents: src, loader: "css", sourcefile: "styles.css" },
    write: false,
    minify: true,
    charset: "utf8",
    legalComments: "none",
    logLevel: "silent"
  });
  const out = res.outputFiles[0].text;
  await writeFile(path.join(OUT, "styles.css"), out);
  return { before: Buffer.byteLength(src), after: Buffer.byteLength(out) };
}

/* Whitespace only: never reformat inside script/style/pre/textarea, so the
   inline theme script keeps the exact bytes the CSP hash was computed over. */
function squeezeHtml(html) {
  const keep = [];
  const stash = html.replace(/<(script|style|pre|textarea)([\s\S]*?)<\/\1>/gi, (m) => {
    keep.push(m);
    return " KEEPSLOT" + (keep.length - 1) + " ";
  });
  const squeezed = stash
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/\n\s*\n/g, "\n")
    .replace(/>\s+</g, "><")
    .trim();
  return squeezed.replace(/ KEEPSLOT(\d+) /g, (_, i) => keep[Number(i)]);
}

function refreshCspHash(html) {
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (!inline.length) return html;
  const hashes = inline.map((m) => "'sha256-" + createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
  return html.replace(/(script-src [^;"]*)/, (line) => {
    const cleaned = line.replace(/'sha256-[A-Za-z0-9+/=]+'/g, "").replace(/\s+/g, " ").trim();
    return cleaned + " " + hashes.join(" ");
  });
}

async function buildHtml() {
  const src = await readFile(path.join(ROOT, "index.html"), "utf8");
  const out = refreshCspHash(squeezeHtml(src));
  await writeFile(path.join(OUT, "index.html"), out);
  return { before: Buffer.byteLength(src), after: Buffer.byteLength(out) };
}

async function copyStatic() {
  let n = 0;
  for (const d of COPY_DIRS) {
    const from = path.join(ROOT, d);
    if (!existsSync(from)) continue;
    await cp(from, path.join(OUT, d), {
      recursive: true,
      filter: (s) => !EXCLUDE_DATA.includes(path.basename(s))
    });
    n++;
  }
  for (const f of COPY_FILES) {
    const from = path.join(ROOT, f);
    if (!existsSync(from)) continue;
    await cp(from, path.join(OUT, f));
    n++;
  }
  return n;
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const js = await minifyJs();
  const css = await minifyCss();
  const html = await buildHtml();
  const copied = await copyStatic();

  const saved = js.before - js.after + (css.before - css.after) + (html.before - html.after);
  console.log("WhichAI production build -> dist/");
  console.log("  js      " + js.files + " files  " + bytes(js.before) + " -> " + bytes(js.after));
  console.log("  css     " + bytes(css.before) + " -> " + bytes(css.after));
  console.log("  html    " + bytes(html.before) + " -> " + bytes(html.after));
  console.log("  copied  " + copied + " static entries");
  console.log("  saved   " + bytes(saved) + " over the wire");

  /* A build that produced a broken CSP or lost a script would be worse than
     no build at all, so verify before anyone can deploy it. */
  const outHtml = await readFile(path.join(OUT, "index.html"), "utf8");
  const scriptCount = (outHtml.match(/<script src="js\//g) || []).length;
  const srcHtml = await readFile(path.join(ROOT, "index.html"), "utf8");
  const srcCount = (srcHtml.match(/<script src="js\//g) || []).length;
  const inlineBody = (outHtml.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || "";
  const hash = "sha256-" + createHash("sha256").update(inlineBody, "utf8").digest("base64");
  const ok = scriptCount === srcCount && outHtml.includes(hash) && (await stat(path.join(OUT, "js", "app.js"))).size > 0;
  if (!ok) {
    console.error("BUILD CHECK FAILED: scripts " + scriptCount + "/" + srcCount + ", csp hash present: " + outHtml.includes(hash));
    process.exit(1);
  }
  console.log("  check   ok (" + scriptCount + " scripts, CSP hash matches)");
}

main().catch((e) => { console.error(e); process.exit(1); });
