/* GET /api/live - a live public catalog, consumed by the browser without a
   deploy or GitHub Action. Warm memory and CDN caches are not durable storage. */
"use strict";
const L = require("./_lib.js");
const Core = require("./_live-core.js");
const service = Core.createService({ catalog: L.DB });

module.exports = async function handler(req, res) {
  if (!L.guard(req, res)) return;
  const result = await service.get();
  // Short CDN stale window. Browser computes age from retrievedAt as well.
  const ttl = result.status === "fresh" ? 3600 : 60;
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=" + ttl + ", stale-while-revalidate=300");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const body = JSON.stringify(result), tag = L.etagOf(body);
  res.setHeader("ETag", tag);
  res.statusCode = req.headers["if-none-match"] === tag ? 304 : 200;
  return res.end(req.method === "HEAD" || res.statusCode === 304 ? undefined : body);
};
