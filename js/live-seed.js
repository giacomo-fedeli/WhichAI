/*
 * WhichAI - live data seed (v0.35.0)
 * Empty in the repository on purpose. At every deploy tools/build.mjs writes
 * dist/js/live-seed.js with the catalog delta computed from that moment's
 * public data (OpenRouter + Artificial Analysis), so the very first paint is
 * already current, before /api/catalog has answered and even with no network.
 */
window.WhichAILiveSeed = null;
