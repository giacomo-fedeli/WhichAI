/*
 * WhichAI API - shared helpers (v0.30.0)
 * Runtime: Vercel Serverless Functions (Node.js). The data modules in js/ are
 * plain IIFEs that also export via module.exports, so the same source powers
 * the browser and the server: one source of truth, zero duplication.
 */
"use strict";

var DB = require("../js/models-db.js");
var Bench = require("../js/benchmarks.js");
var Engine = require("../js/engine.js");

var API_VERSION = "1.0.0";
var APP_VERSION = "v0.30";

function meta() {
  return {
    project: "WhichAI",
    site: "https://whichai.wiki",
    apiVersion: API_VERSION,
    appVersion: APP_VERSION,
    license: "CC BY 4.0 (attribution: WhichAI, whichai.wiki)",
    dataUpdated: DB.updated,
    benchmarkUpdated: Bench.updated,
    scaleNote: DB.scaleNote,
    specNote: DB.specNote
  };
}

/* Weak ETag over the payload: lets browsers and the Vercel edge cache
   revalidate cheaply instead of re-downloading the whole catalog. */
function etagOf(payload) {
  var s = typeof payload === "string" ? payload : JSON.stringify(payload);
  var h1 = 0x811c9dc5, h2 = 0x01000193;
  for (var i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = (h1 * 0x01000193) >>> 0;
    h2 = (h2 ^ (s.charCodeAt(i) + i)) >>> 0;
    h2 = (h2 * 16777619) >>> 0;
  }
  return 'W/"' + h1.toString(36) + h2.toString(36) + '"';
}

function send(req, res, status, body, maxAge) {
  var json = JSON.stringify(body);
  var tag = etagOf(json);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("ETag", tag);
  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=" + (maxAge || 3600) + ", stale-while-revalidate=86400"
  );
  if (req.headers["if-none-match"] === tag) {
    res.statusCode = 304;
    return res.end();
  }
  res.statusCode = status;
  if (req.method === "HEAD") return res.end();
  res.end(json);
}

function fail(req, res, status, message, hint) {
  var body = { error: message, status: status };
  if (hint) body.hint = hint;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

/* Every endpoint is read-only by design: GET and OPTIONS, nothing else. */
function guard(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.statusCode = 204;
    res.end();
    return false;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    fail(req, res, 405, "Method not allowed", "This API is read-only: use GET.");
    return false;
  }
  return true;
}

/* req.query exists on Vercel; the fallback keeps the endpoints testable
   with a plain node:http server locally and in CI. */
function query(req) {
  if (req.query && typeof req.query === "object") return req.query;
  var url = new URL(req.url || "/", "http://localhost");
  var out = {};
  url.searchParams.forEach(function (v, k) { out[k] = v; });
  return out;
}

function intParam(v, def, min, max) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

module.exports = { DB: DB, Bench: Bench, Engine: Engine, meta: meta, send: send, fail: fail, guard: guard, query: query, intParam: intParam, etagOf: etagOf, API_VERSION: API_VERSION, APP_VERSION: APP_VERSION };
