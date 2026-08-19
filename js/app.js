/*
 * WhichAI - UI wiring (v0.20.0)
 * Plain JS, no framework, no build step.
 * Depends on js/engine.js and js/benchmarks.js (loaded first).
 */
(function () {
  "use strict";

  var Engine = window.PromptCompassEngine;
  var Bench = window.PromptCompassBenchmarks || null;
  var Chains = window.PromptCompassChains || null;
  var I18n = window.PromptCompassI18n || null;
  var Brands = window.WhichAIBrands || null;

  var $goal = document.getElementById("goal");
  var $context = document.getElementById("context");
  var $taskType = document.getElementById("task-type");
  var $format = document.getElementById("format");
  var $length = document.getElementById("length");
  var $tone = document.getElementById("tone");
  var $generate = document.getElementById("generate");
  var $goalError = document.getElementById("goal-error");
  var $modelsError = document.getElementById("models-error");
  var $emptyState = document.getElementById("empty-state");
  var $resultsWrap = document.getElementById("results-wrap");
  var $tabs = document.getElementById("tabs");
  var $panels = document.getElementById("panels");
  var $detectHint = document.getElementById("detect-hint");
  var $loadExample = document.getElementById("load-example");
  var $routerCard = document.getElementById("router-card");
  var $generatorView = document.getElementById("generator-view");
  var $guideView = document.getElementById("guide-view");
  var $guideGrid = document.getElementById("guide-grid");
  var $guideUpdated = document.getElementById("guide-updated");
  var $navGenerator = document.getElementById("nav-generator");
  var $navGuide = document.getElementById("nav-guide");
  var $navCompare = document.getElementById("nav-compare");
  var $navSettings = document.getElementById("nav-settings");
  var $compareView = document.getElementById("compare-view");
  var $compareEmpty = document.getElementById("compare-empty");
  var $compareEditor = document.getElementById("compare-editor");
  var $compareMeta = document.getElementById("compare-meta");
  var $compareGrid = document.getElementById("compare-grid");
  var $compareSave = document.getElementById("compare-save");
  var $compareSaved = document.getElementById("compare-saved");
  var $compareNewver = document.getElementById("compare-newver");
  var $compareExport = document.getElementById("compare-export");
  var $historyList = document.getElementById("history-list");
  var $toCompare = document.getElementById("to-compare");
  var $settingsView = document.getElementById("settings-view");
  var $geminiKey = document.getElementById("gemini-key");
  var $geminiModel = document.getElementById("gemini-model");
  var $groqKey = document.getElementById("groq-key");
  var $groqModel = document.getElementById("groq-model");
  var $openrouterKey = document.getElementById("openrouter-key");
  var $orModelInputs = {
    nemotron: document.getElementById("or-model-nemotron"),
    qwen: document.getElementById("or-model-qwen"),
    glm: document.getElementById("or-model-glm"),
    kimi: document.getElementById("or-model-kimi"),
    deepseek: document.getElementById("or-model-deepseek")
  };
  var $settingsSave = document.getElementById("settings-save");
  var $settingsSaved = document.getElementById("settings-saved");
  var $prefsReset = document.getElementById("prefs-reset");
  var $chainsView = document.getElementById("chains-view");
  var $navChains = document.getElementById("nav-chains");
  var $chainGoal = document.getElementById("chain-goal");
  var $chainGoalError = document.getElementById("chain-goal-error");
  var $chainContext = document.getElementById("chain-context");
  var $chainTaskType = document.getElementById("chain-task-type");
  var $chainDetect = document.getElementById("chain-detect");
  var $chainBuild = document.getElementById("chain-build");
  var $chainStepsWrap = document.getElementById("chain-steps-wrap");
  var $chainSteps = document.getElementById("chain-steps");
  var $chainSave = document.getElementById("chain-save");
  var $chainSaved = document.getElementById("chain-saved");
  var $chainRunAll = document.getElementById("chain-runall");
  var $chainExport = document.getElementById("chain-export");
  var $chainRunAllStatus = document.getElementById("chain-runall-status");
  var $chainShare = document.getElementById("chain-share");
  var $chainHistoryList = document.getElementById("chain-history-list");
  var $langSelect = document.getElementById("lang-select");
  var $themeToggle = document.getElementById("theme-toggle");
  var $langNote = document.getElementById("lang-note");
  var $aboutView = document.getElementById("about-view");
  var $navAbout = document.getElementById("nav-about");
  var $mergeView = document.getElementById("merge-view");
  var $compareMerge = document.getElementById("compare-merge");
  var $refineBtn = document.getElementById("refine-goal");
  var $refineBox = document.getElementById("refine-box");
  var $refineText = document.getElementById("refine-text");
  var $refineApply = document.getElementById("refine-apply");
  var $refineDiscard = document.getElementById("refine-discard");
  var $refineStatus = document.getElementById("refine-status");

  var results = [];
  var dbShowDetail = null;
  var GENMODE_KEY = "pc_genmode";
  var recommendedAppId = null;
  var guideBuilt = false;
  var lastGen = null;
  var activeCmp = null;
  var activeChain = null;
  var viewInitDone = false;

  var STORAGE_KEY = "pc_comparisons_v1";
  var SETTINGS_KEY = "pc_settings_v1";
  var PREFS_KEY = "pc_prefs_v1";
  var CHAINS_KEY = "pc_chains_v1";
  var LANG_KEY = "pc_lang";
  var THEME_KEY = "pc_theme";
  var DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
  var DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
  var APP_VERSION = "v0.30";
  var BRAND = "WhichAI";
  var TASK_ICONS = {
    writing: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z"/><path d="M13.5 7.5l3 3"/></svg>',
    coding: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/></svg>',
    analysis: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>',
    research: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    brainstorming: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 014 10.5c-.8.7-1 1.5-1 2.5h-6c0-1-.2-1.8-1-2.5A6 6 0 0112 3z"/></svg>',
    education: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8l10-4 10 4-10 4L2 8z"/><path d="M6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>',
    business: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a3 3 0 016 0v2"/><path d="M3 13h18"/></svg>',
    general: '<svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 15l.9 2.6L22.5 18l-2.6.9L19 21.5l-.9-2.6L15.5 18l2.6-.9L19 15z"/></svg>'
  };
  var DEFAULT_OR_MODELS = { nemotron: "nvidia/nemotron-3-ultra-550b-a55b:free", qwen: "qwen/qwen3-coder:free", glm: "", kimi: "", deepseek: "" };

  /* ---------- Language & theme (v0.12) ---------- */

  var currentLang = "en";
  try { currentLang = localStorage.getItem(LANG_KEY) || "en"; } catch (e) { /* ignore */ }
  if (I18n && !I18n.STRINGS[currentLang]) currentLang = "en";

  function T(key) {
    return I18n ? I18n.t(currentLang, key) : key;
  }

  function setBrandMark(el, subject, label, options) {
    if (Brands && Brands.setMark(el, subject, label, options)) return;
    if (el) el.textContent = label || "";
  }

  function tl(taskKey) {
    var v = I18n ? I18n.t(currentLang, "task_" + taskKey) : null;
    return v || (Engine.TASK_TYPES[taskKey] ? Engine.TASK_TYPES[taskKey].label : taskKey);
  }

  function setFirstText(el, text) {
    if (!el) return;
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) { el.childNodes[i].nodeValue = text; return; }
    }
    el.insertBefore(document.createTextNode(text), el.firstChild);
  }

  function setText(sel, key) {
    var el = document.querySelector(sel);
    if (el) el.textContent = T(key);
  }

  function applyLanguage(lang) {
    currentLang = I18n && I18n.STRINGS[lang] ? lang : "en";
    try { localStorage.setItem(LANG_KEY, currentLang); } catch (e) { /* ignore */ }
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    if ($langSelect) $langSelect.value = currentLang;

    setText("#nav-generator", "navGenerator");
    setText("#nav-guide", "navGuide");
    setText("#nav-compare", "navCompare");
    setText("#nav-chains strong", "navChains");
    setText("#nav-settings strong", "navSettings");
    setText("#nav-more", "navMore");
    setText("#nav-stack strong", "navStack");
    setText("#nav-doctor strong", "navDoctor");
    setText("#nav-glossary strong", "footGlossary");
    setText("#nav-radar strong", "navRadar");
    setText("#nav-radar-sub", "navRadarSub");
    setText("#nav-arena strong", "navArena");
    setText("#nav-arena-sub", "navArenaSub");
    setText("#nav-topics strong", "navTopics");
    setText("#nav-topics-sub", "navTopicsSub");
    setText("#foot-support", "footSupport");
    setText("#support-title", "supportTitle");
    setText("#support-text", "supportText");
    var supBtn = document.getElementById("support-btn");
    if (supBtn) supBtn.textContent = T("supportBtn");
    if (window.WhichAIWelcome) window.WhichAIWelcome.setLanguage(T);
    setText("#nav-chains-sub", "navChainsSub");
    setText("#nav-stack-sub", "navStackSub");
    setText("#nav-doctor-sub", "navDoctorSub");
    setText("#nav-glossary-sub", "navGlossarySub");
    setText("#nav-about-sub", "navAboutSub");
    setText("#nav-settings-sub", "navSettingsSub");
    setText("#open-doctor", "navDoctor");
    setText("#privacy-text", "privacyPill");
    var pill = document.querySelector(".badge-privacy");
    if (pill) pill.title = T("privacyTip");
    setText("#form-title", "genTitle");
    setText("#generator-view .card-subtitle", "genSubtitle");
    setFirstText(document.querySelector('label[for="goal"]'), T("goalLabel"));
    setText("#load-example", "tryExample");
    if ($goal) $goal.placeholder = T("goalPh");
    setText("#goal-error", "goalErr");
    setFirstText(document.querySelector('label[for="context"]'), T("contextLabel"));
    var o1 = document.querySelector('label[for="context"] .optional');
    if (o1) o1.textContent = T("optionalTag");
    if ($context) $context.placeholder = T("contextPh");
    setText('label[for="task-type"]', "taskLabel");
    setText('label[for="format"]', "formatLabel");
    setText('label[for="length"]', "lengthLabel");
    setText('label[for="tone"]', "toneLabel");
    setText("#models-label", "targetsLabel");
    var gl = document.querySelectorAll(".model-group-label");
    if (gl[0]) setFirstText(gl[0], T("groupAssistants"));
    if (gl[1]) setFirstText(gl[1], T("groupEco"));
    if (gl[2]) setFirstText(gl[2], T("groupOpen"));
    setText("#models-error", "modelsErr");
    setText("#generate", "generateBtn");
    setText("#empty-state > p", "emptyLead");
    var steps = document.querySelectorAll(".steps-strip li");
    ["step1", "step2", "step3"].forEach(function (k, i) {
      if (!steps[i]) return;
      for (var n = 0; n < steps[i].childNodes.length; n++) {
        if (steps[i].childNodes[n].nodeType === 3) { steps[i].childNodes[n].nodeValue = " " + T(k); break; }
      }
    });
    setText(".trust-line", "trustLine");
    setText(".results-head .results-title", "resultsTitle");
    setText("#to-compare", "toCompareBtn");
    setText("#guide-view .guide-head h1", "guideTitle");
    var gs = document.querySelector("#guide-view .guide-head p:not(.guide-updated)");
    if (gs) gs.textContent = T("guideSub");
    setText(".catalog h2", "catalogTitle");
    setText("#nav-about strong", "navAbout");
    var dbi = document.getElementById("db-search");
    if (dbi) dbi.placeholder = T("dbSearchPh");
    var dbh = document.getElementById("db-hint");
    var DBx = window.PromptCompassModelsDB || null;
    if (dbh && DBx) dbh.textContent = DBx.models.length + " " + T("dbHint");
    setText("#compare-view .guide-head h1", "compareTitle");
    var cs = document.querySelector("#compare-view .guide-head p");
    if (cs) cs.textContent = T("compareSub");
    var ce = document.querySelector("#compare-empty p");
    if (ce) {
      setFirstText(ce, T("compareEmptyText"));
      var cea = ce.querySelector("a");
      if (cea) cea.textContent = T("goGenerator");
    }
    setText("#compare-save", "saveCmp");
    setText("#compare-newver", "newVersion");
    setText("#compare-export", "exportMd");
    setText("#compare-history h2", "savedCmps");
    setText("#chains-view .guide-head h1", "chainsTitle");
    var chs = document.querySelector("#chains-view .guide-head p");
    if (chs) chs.textContent = T("chainsSub");
    setFirstText(document.querySelector('label[for="chain-goal"]'), T("goalLabel"));
    setText("#chain-goal-error", "goalErr");
    setFirstText(document.querySelector('label[for="chain-context"]'), T("contextLabel"));
    var o2 = document.querySelector('label[for="chain-context"] .optional');
    if (o2) o2.textContent = T("optionalTag");
    setText('label[for="chain-task-type"]', "taskLabel");
    setText("#chain-build", "buildChain");
    setText("#chain-save", "saveChain");
    setText("#chains-view .history h2", "savedChains");
    setText("#settings-view .guide-head h1", "settingsTitle");
    var ss = document.querySelector("#settings-view .guide-head p");
    if (ss) ss.textContent = T("settingsSub");
    setText("#settings-save", "saveSettings");
    setText("#prefs-reset", "prefsReset");
    var fEl = document.querySelector(".site-footer p");
    if (fEl) fEl.textContent = BRAND + " " + APP_VERSION + " \u00b7 Growth \u00b7 " + T("footerText");

    setText("#refine-goal", "refineBtn");
    setText("#refine-hint", "refineHint");
    setText("#refine-label", "refineLabel");
    setText("#refine-apply", "refineApply");
    setText("#refine-discard", "refineDiscard");
    setText("#set-guide-title", "setGuideTitle");
    ["gemini", "groq", "openrouter"].forEach(function (pv) {
      var tb = document.getElementById("test-" + pv);
      if (tb) tb.textContent = T("setTestBtn");
    });
    setText("#compare-merge", "mergeOpenBtn");
    setText("#merge-title", "mergeTitle");
    setText("#merge-sub", "mergeSub");
    setText("#merge-back", "mergeBack");
    setText("#merge-empty-text", "mergeEmpty");
    setText("#merge-highlight-label", "mergeHighlight");
    setText("#merge-draft-label", "mergeDraftLabel");
    var mdta = document.getElementById("merge-draft");
    if (mdta) mdta.placeholder = T("mergeDraftPh");
    setText("#merge-copy", "mergeCopy");
    setText("#merge-export", "exportMd");
    setText("#merge-clear", "mergeClear");
    setText("#merge-addsource-title", "mergeAddSource");
    var msn = document.getElementById("merge-src-name");
    if (msn) msn.placeholder = T("mergeSourceName");
    var mst = document.getElementById("merge-src-text");
    if (mst) mst.placeholder = T("mergeSourcePh");
    setText("#merge-src-add", "mergeSourceAdd");
    if ($themeToggle) { $themeToggle.title = T("themeTip"); $themeToggle.setAttribute("aria-label", T("themeTip")); }
    if (window.WhichAIMerge) window.WhichAIMerge.onLanguageChange();

    setText("#foot-faq", "footFaq");
    setText("#foot-similar", "footSimilar");
    setText("#foot-contribute", "footContribute");
    setText("#foot-glossary", "footGlossary");
    setText("#mode-goal", "modeGoal");
    setText("#mode-finder", "modeFinder");
    setText("#cmp-tab-outputs", "cmpTabOutputs");
    setText("#cmp-tab-specs", "cmpTabSpecs");
    setText("#glossary-title", "glossTitle");
    setText("#glossary-sub", "glossSub");
    var gse = document.getElementById("glossary-search");
    if (gse) gse.placeholder = T("glossSearchPh");
    setText("#insights-title", "insightsTitle");
    setText("#chart-top-title", "chartTopTitle");
    setText("#chart-pp-title", "chartPpTitle");
    setText("#chain-map-title", "chainMapTitle");
    setText("#chain-addstep", "chainAddStep");
    if (window.WhichAIFinder) window.WhichAIFinder.rerender();
    if (window.WhichAIModelCompare) window.WhichAIModelCompare.rerender();
    if (window.WhichAIStack) window.WhichAIStack.rerender();
    if (window.WhichAIDoctor) window.WhichAIDoctor.rerender();
    if (window.WhichAIRadar) window.WhichAIRadar.rerender();
    if (window.WhichAIArena) window.WhichAIArena.rerender();
    if (window.WhichAITopics) window.WhichAITopics.rerender();
    if (window.WhichAISupport) window.WhichAISupport.relabel();
    renderDemo();
    var glv = document.getElementById("glossary-view");
    if (glv && !glv.hidden) initGlossary();

    setText("#keymode-label", "keymodeLabel");
    setText("#keymode-session-lbl", "keymodeSession");
    setText("#keymode-local-lbl", "keymodeLocal");
    setText("#keymode-hint", "keymodeHint");
    setText("#keys-clear", "keysClear");
    setText("#keymode-warn", "keymodeWarn");
    setText("#key-risk-title", "keyRiskTitle");
    setText("#data-title", "dataTitle");
    setText("#data-hint", "dataHint");
    setText("#data-export", "dataExport");
    setText("#data-import", "dataImport");
    setText("#data-wipe", "dataWipe");

    var optMap = { none: "optNone", prose: "optProse", markdown: "optMarkdown", bullets: "optBullets", table: "optTable", json: "optJson", code: "optCode", short: "optShort", medium: "optMedium", long: "optLong", professional: "optProfessional", friendly: "optFriendly", casual: "optCasual", persuasive: "optPersuasive", academic: "optAcademic" };
    [$format, $length, $tone].forEach(function (sel) {
      if (!sel) return;
      for (var i = 0; i < sel.options.length; i++) {
        var k = optMap[sel.options[i].value];
        if (k) sel.options[i].textContent = T(k);
      }
    });
    [$taskType, $chainTaskType].forEach(function (sel) {
      if (!sel) return;
      for (var i = 0; i < sel.options.length; i++) {
        var v = sel.options[i].value;
        sel.options[i].textContent = v === "auto" ? T("autoDetect") : tl(v);
      }
    });

    if ($langNote) {
      var note = T("langNote");
      $langNote.textContent = currentLang === "en" ? "" : note;
      $langNote.hidden = currentLang === "en" || !note;
    }
  }

  var THEMES = ["light", "dark", "sepia"];
  var THEME_ICONS = { light: "☀", dark: "☾", sepia: "◐" };
  var THEME_COLORS = { light: "#ffffff", dark: "#17181c", sepia: "#f3ead9" };
  var themeFadeTimer = null;

  function applyTheme(theme, animate) {
    if (THEMES.indexOf(theme) === -1) theme = "light";
    var rootEl = document.documentElement;
    if (animate && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      rootEl.classList.add("theme-fade");
      if (themeFadeTimer) clearTimeout(themeFadeTimer);
      themeFadeTimer = setTimeout(function () { rootEl.classList.remove("theme-fade"); }, 450);
    }
    rootEl.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    if ($themeToggle) {
      $themeToggle.textContent = THEME_ICONS[theme] || "☾";
      $themeToggle.title = T("themeTip");
      $themeToggle.setAttribute("aria-label", T("themeTip"));
    }
    var mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute("content", THEME_COLORS[theme] || "#17181c");
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") || "light";
    var i = THEMES.indexOf(cur);
    applyTheme(THEMES[(i + 1) % THEMES.length], true);
  }

  function initLangTheme() {
    if (I18n && $langSelect) {
      I18n.LANGS.forEach(function (l) {
        var o = document.createElement("option");
        o.value = l.code;
        o.textContent = l.label;
        $langSelect.appendChild(o);
      });
      $langSelect.value = currentLang;
      $langSelect.addEventListener("change", function () { applyLanguage($langSelect.value); });
    }
    if ($themeToggle) {
      $themeToggle.addEventListener("click", function () {
        $themeToggle.classList.remove("spin");
        void $themeToggle.offsetWidth;
        $themeToggle.classList.add("spin");
        toggleTheme();
      });
      var cur = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(cur, false);
    }
    applyLanguage(currentLang);
  }

  /* ---------- Settings (BYOK - keys live only in this browser) ---------- */

  var KEYMODE_KEY = "pc_keymode";

  function keyMode() {
    try {
      var m = localStorage.getItem(KEYMODE_KEY);
      if (m === "session" || m === "local") return m;
      return localStorage.getItem(SETTINGS_KEY) ? "local" : "session";
    } catch (e) { return "session"; }
  }

  function loadSettings() {
    var s = {};
    try {
      var raw = (keyMode() === "local" ? localStorage.getItem(SETTINGS_KEY) : sessionStorage.getItem(SETTINGS_KEY)) ||
        localStorage.getItem(SETTINGS_KEY) || sessionStorage.getItem(SETTINGS_KEY);
      s = JSON.parse(raw) || {};
    } catch (e) {
      s = {};
    }
    s.geminiKey = s.geminiKey || "";
    s.groqKey = s.groqKey || "";
    s.geminiModel = s.geminiModel || DEFAULT_GEMINI_MODEL;
    s.groqModel = s.groqModel || DEFAULT_GROQ_MODEL;
    s.openrouterKey = s.openrouterKey || "";
    s.orModels = s.orModels || {};
    for (var orf in DEFAULT_OR_MODELS) {
      if (s.orModels[orf] == null) s.orModels[orf] = DEFAULT_OR_MODELS[orf];
    }
    return s;
  }

  var settings = loadSettings();

  function initSettingsForm() {
    $geminiKey.value = settings.geminiKey;
    $geminiModel.value = settings.geminiModel;
    $groqKey.value = settings.groqKey;
    $groqModel.value = settings.groqModel;
    if ($openrouterKey) $openrouterKey.value = settings.openrouterKey;
    for (var f in $orModelInputs) {
      if ($orModelInputs[f]) $orModelInputs[f].value = settings.orModels[f] || "";
    }
    wireKeyTest("gemini");
    wireKeyTest("groq");
    wireKeyTest("openrouter");
    initKeyMode();
    initDataTools();
  }

  /* ---------- v0.23: key storage mode (session-first), clear keys ---------- */

  function initKeyMode() {
    var rs = document.getElementById("keymode-session");
    var rl = document.getElementById("keymode-local");
    if (!rs || !rl) return;
    (keyMode() === "local" ? rl : rs).checked = true;
    var warn = document.getElementById("keymode-warn");
    function paintWarn() { if (warn) warn.hidden = keyMode() !== "local"; }
    paintWarn();
    function setMode(mode) {
      try {
        localStorage.setItem(KEYMODE_KEY, mode);
        var dst = mode === "local" ? localStorage : sessionStorage;
        var other = mode === "local" ? sessionStorage : localStorage;
        dst.setItem(SETTINGS_KEY, JSON.stringify(settings));
        other.removeItem(SETTINGS_KEY);
      } catch (e) { /* ignore */ }
      paintWarn();
    }
    rs.addEventListener("change", function () { if (rs.checked) setMode("session"); });
    rl.addEventListener("change", function () { if (rl.checked) setMode("local"); });
    initKeyReveal();
    var clearBtn = document.getElementById("keys-clear");
    var clearSt = document.getElementById("keys-clear-status");
    if (clearBtn) clearBtn.addEventListener("click", function () {
      settings.geminiKey = "";
      settings.groqKey = "";
      settings.openrouterKey = "";
      $geminiKey.value = "";
      $groqKey.value = "";
      if ($openrouterKey) $openrouterKey.value = "";
      try {
        var dst = keyMode() === "local" ? localStorage : sessionStorage;
        dst.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) { /* ignore */ }
      if (clearSt) { setRunStatus(clearSt, T("keysCleared"), false); setTimeout(function () { clearSt.hidden = true; }, 2400); }
    });
  }

  /* ---------- v0.30: show/hide a pasted key without retyping it ---------- */

  function initKeyReveal() {
    var btns = document.querySelectorAll(".key-reveal");
    Array.prototype.forEach.call(btns, function (btn) {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", function () {
        var input = document.getElementById(btn.getAttribute("data-key-target"));
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-pressed", show ? "true" : "false");
        btn.textContent = show ? T("keyHide") : T("keyShow");
      });
      btn.textContent = T("keyShow");
    });
  }

  /* ---------- v0.23: export / import / wipe local data ---------- */

  function pcKeys(store) {
    var out = [];
    try {
      for (var i = 0; i < store.length; i++) {
        var k = store.key(i);
        if (k && k.indexOf("pc_") === 0) out.push(k);
      }
    } catch (e) { /* ignore */ }
    return out;
  }

  function initDataTools() {
    var ex = document.getElementById("data-export");
    var im = document.getElementById("data-import");
    var wp = document.getElementById("data-wipe");
    var fi = document.getElementById("data-file");
    var st = document.getElementById("data-status");
    if (!ex || !im || !wp || !fi) return;
    ex.addEventListener("click", function () {
      var dump = { app: "WhichAI", version: APP_VERSION, exported: new Date().toISOString(), local: {}, session: {} };
      pcKeys(localStorage).forEach(function (k) { dump.local[k] = localStorage.getItem(k); });
      pcKeys(sessionStorage).forEach(function (k) { dump.session[k] = sessionStorage.getItem(k); });
      var blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "whichai-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
    im.addEventListener("click", function () { fi.click(); });
    fi.addEventListener("change", function () {
      var f = fi.files && fi.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var dump = JSON.parse(reader.result);
          if (!dump || dump.app !== "WhichAI" || typeof dump.local !== "object") throw new Error("bad");
          if (!window.confirm(T("dataImportAsk"))) { fi.value = ""; return; }
          Object.keys(dump.local || {}).forEach(function (k) {
            if (k.indexOf("pc_") === 0) try { localStorage.setItem(k, dump.local[k]); } catch (e) { /* ignore */ }
          });
          Object.keys(dump.session || {}).forEach(function (k) {
            if (k.indexOf("pc_") === 0) try { sessionStorage.setItem(k, dump.session[k]); } catch (e) { /* ignore */ }
          });
          setRunStatus(st, T("dataImported"), false);
          setTimeout(function () { location.reload(); }, 900);
        } catch (e) {
          setRunStatus(st, T("dataImportBad"), true);
        }
        fi.value = "";
      };
      reader.readAsText(f);
    });
    wp.addEventListener("click", function () {
      if (!window.confirm(T("dataWipeAsk"))) return;
      pcKeys(localStorage).forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
      pcKeys(sessionStorage).forEach(function (k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } });
      location.reload();
    });
  }

  function saveSettings() {
    settings.geminiKey = $geminiKey.value.trim();
    settings.geminiModel = $geminiModel.value.trim() || DEFAULT_GEMINI_MODEL;
    settings.groqKey = $groqKey.value.trim();
    settings.groqModel = $groqModel.value.trim() || DEFAULT_GROQ_MODEL;
    if ($openrouterKey) settings.openrouterKey = $openrouterKey.value.trim();
    for (var f2 in $orModelInputs) {
      if ($orModelInputs[f2]) settings.orModels[f2] = $orModelInputs[f2].value.trim();
    }
    var ok = true;
    try {
      var dst = keyMode() === "local" ? localStorage : sessionStorage;
      var other = keyMode() === "local" ? sessionStorage : localStorage;
      dst.setItem(SETTINGS_KEY, JSON.stringify(settings));
      other.removeItem(SETTINGS_KEY);
    } catch (e) {
      ok = false;
    }
    $settingsSaved.textContent = ok
      ? "Saved - keys stay in this browser only."
      : "Could not save - browser storage unavailable.";
    $settingsSaved.hidden = false;
    setTimeout(function () { $settingsSaved.hidden = true; }, 2600);
  }

  /* ---------- Preference memory (Phase 4): remember last used options ---------- */

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        taskType: $taskType.value,
        format: $format.value,
        length: $length.value,
        tone: $tone.value,
        models: selectedModels()
      }));
    } catch (e) { /* ignore */ }
  }

  function applyPrefs() {
    var p = {};
    try {
      p = JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
    } catch (e) {
      p = {};
    }
    function setSel(el, val) {
      if (!val) return;
      for (var i = 0; i < el.options.length; i++) {
        if (el.options[i].value === val) { el.value = val; return; }
      }
    }
    setSel($taskType, p.taskType);
    setSel($format, p.format);
    setSel($length, p.length);
    setSel($tone, p.tone);
    if (p.models && p.models.length) {
      Array.prototype.slice.call(document.querySelectorAll(".model-check input")).forEach(function (cb) {
        cb.checked = p.models.indexOf(cb.value) !== -1;
      });
    }
  }

  function resetPrefs() {
    try { localStorage.removeItem(PREFS_KEY); } catch (e) { /* ignore */ }
    $taskType.value = "auto";
    $format.value = "none";
    $length.value = "none";
    $tone.value = "none";
    Array.prototype.slice.call(document.querySelectorAll(".model-check input")).forEach(function (cb) {
      cb.checked = cb.value !== "llama";
    });
    $settingsSaved.textContent = "Preferences reset to defaults.";
    $settingsSaved.hidden = false;
    setTimeout(function () { $settingsSaved.hidden = true; }, 2200);
  }

  /* ---------- API runners (direct browser calls, user's own free keys) ---------- */

  var RUNNERS = {
    gemini: {
      provider: "Gemini API",
      keyName: "Google AI Studio",
      hasKey: function (s) { return !!s.geminiKey; },
      call: function (s, prompt) {
        var model = s.geminiModel || DEFAULT_GEMINI_MODEL;
        return fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" +
            encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(s.geminiKey),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        ).then(function (r) { return r.json(); }).then(function (data) {
          if (data.error) throw new Error(data.error.message || "API error");
          var text = "";
          try {
            text = data.candidates[0].content.parts.map(function (p) { return p.text || ""; }).join("");
          } catch (e) { /* fall through */ }
          if (!text) throw new Error("Empty response from the API.");
          return text;
        });
      }
    },
    llama: {
      provider: "Groq API",
      keyName: "Groq",
      hasKey: function (s) { return !!s.groqKey; },
      call: function (s, prompt) {
        var model = s.groqModel || DEFAULT_GROQ_MODEL;
        return fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + s.groqKey
          },
          body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }] })
        }).then(function (r) { return r.json(); }).then(function (data) {
          if (data.error) throw new Error(data.error.message || "API error");
          var text = "";
          try {
            text = data.choices[0].message.content || "";
          } catch (e) { /* fall through */ }
          if (!text) throw new Error("Empty response from the API.");
          return text;
        });
      }
    },
    nemotron: orRunner("nemotron"),
    qwen: orRunner("qwen"),
    glm: orRunner("glm"),
    kimi: orRunner("kimi"),
    deepseek: orRunner("deepseek")
  };

  function orRunner(family) {
    return {
      provider: "OpenRouter API",
      keyName: "OpenRouter",
      hasKey: function (s) { return !!s.openrouterKey; },
      call: function (s, prompt) {
        var model = (s.orModels && s.orModels[family] ? s.orModels[family] : "").trim();
        if (!model) {
          return Promise.reject(new Error("No OpenRouter model ID set for this family. Add one in Settings - IDs ending in \":free\" cost nothing (openrouter.ai/models)."));
        }
        return fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + s.openrouterKey,
            "X-Title": "WhichAI"
          },
          body: JSON.stringify({ model: model, messages: [{ role: "user", content: prompt }] })
        }).then(function (r) { return r.json(); }).then(function (data) {
          if (data.error) throw new Error(data.error.message || "API error");
          var text = "";
          try { text = data.choices[0].message.content || ""; } catch (e) { /* fall through */ }
          if (!text) throw new Error("Empty response from the API.");
          return text;
        });
      }
    };
  }

  function runEntry(entry, ta, btn, statusEl) {
    var runner = RUNNERS[entry.model];
    if (!runner) return;
    if (!runner.hasKey(settings)) {
      setRunStatus(statusEl, "No API key - open Settings and paste your " + runner.keyName + " key.", true);
      return;
    }
    btn.disabled = true;
    var orig = btn.textContent;
    btn.textContent = "Running…";
    setRunStatus(statusEl, "Calling " + runner.provider + "…", false);
    runner.call(settings, entry.prompt).then(function (text) {
      entry.output = text;
      ta.value = text;
      setRunStatus(statusEl, "Done - response inserted. Now score it.", false);
    }).catch(function (err) {
      setRunStatus(statusEl, "Error: " + (err && err.message ? err.message : "request failed"), true);
    }).then(function () {
      btn.disabled = false;
      btn.textContent = orig;
    });
  }

  function setRunStatus(el, msg, isError) {
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
    el.hidden = false;
  }

  /* ---------- v0.21: API key tests (Settings) ---------- */

  var PROVIDER_TESTS = {
    gemini: function () {
      var k = $geminiKey.value.trim();
      if (!k) return Promise.reject(new Error(T("setKeyMissing")));
      return fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(k))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) throw new Error(d.error.message || "invalid key");
          return (d.models || []).length + " models reachable";
        });
    },
    groq: function () {
      var k = $groqKey.value.trim();
      if (!k) return Promise.reject(new Error(T("setKeyMissing")));
      return fetch("https://api.groq.com/openai/v1/models", { headers: { "Authorization": "Bearer " + k } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) throw new Error(d.error.message || "invalid key");
          return (d.data || []).length + " models reachable";
        });
    },
    openrouter: function () {
      var k = $openrouterKey ? $openrouterKey.value.trim() : "";
      if (!k) return Promise.reject(new Error(T("setKeyMissing")));
      return fetch("https://openrouter.ai/api/v1/auth/key", { headers: { "Authorization": "Bearer " + k } })
        .then(function (r) {
          if (r.status === 401 || r.status === 403) throw new Error("invalid key");
          return r.json();
        })
        .then(function (d) {
          if (d.error) throw new Error((d.error && d.error.message) || "invalid key");
          var lbl = d.data && d.data.label ? 'key "' + d.data.label + '"' : "key accepted";
          return lbl;
        });
    }
  };

  function wireKeyTest(provider) {
    var btn = document.getElementById("test-" + provider);
    var st = document.getElementById("test-" + provider + "-status");
    if (!btn || !st) return;
    btn.addEventListener("click", function () {
      btn.disabled = true;
      setRunStatus(st, T("setTesting"), false);
      PROVIDER_TESTS[provider]().then(function (detail) {
        setRunStatus(st, T("setKeyOk") + (detail ? " \u00b7 " + detail : ""), false);
        st.classList.add("ok");
      }).catch(function (err) {
        st.classList.remove("ok");
        setRunStatus(st, T("setKeyFail") + " " + (err && err.message ? err.message : "request failed"), true);
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ---------- v0.21: Refine goal with AI (BYOK, human-reviewed) ---------- */

  var REFINE_META =
    "You are an expert prompt engineer. Rewrite the goal below so it is clearer and more complete for an AI assistant: " +
    "keep exactly the same intent and the same language, make implicit details explicit (deliverable, audience, constraints, success criteria) " +
    "only when they are clearly implied, and keep it under 120 words. Return ONLY the rewritten goal text \u00b7 no preamble, no quotes, no markdown.";

  function pickRefineRunner() {
    if (settings.geminiKey) return "gemini";
    if (settings.groqKey) return "llama";
    if (settings.openrouterKey) {
      if ((settings.orModels.nemotron || "").trim()) return "nemotron";
      if ((settings.orModels.qwen || "").trim()) return "qwen";
    }
    return null;
  }

  function refineGoal() {
    var goal = $goal.value.trim();
    if (!goal) { $goalError.hidden = false; $goal.focus(); return; }
    $goalError.hidden = true;
    var rid = pickRefineRunner();
    if (!rid) { setRunStatus($refineStatus, T("refineNeedKey"), true); $refineBox.hidden = false; $refineText.value = ""; return; }
    $refineBtn.disabled = true;
    $refineBox.hidden = false;
    setRunStatus($refineStatus, T("refineWorking"), false);
    var ctx = $context.value.trim();
    var meta = REFINE_META + "\n\nGOAL:\n" + goal + (ctx ? "\n\nBACKGROUND (only to disambiguate \u00b7 do not merge it into the goal):\n" + ctx : "");
    RUNNERS[rid].call(settings, meta).then(function (text) {
      $refineText.value = (text || "").trim();
      $refineStatus.hidden = true;
    }).catch(function (err) {
      setRunStatus($refineStatus, T("refineErr") + " " + (err && err.message ? err.message : "request failed"), true);
    }).then(function () { $refineBtn.disabled = false; });
  }

  /* ---------- Init: populate task types from the engine ---------- */

  var autoOpt = document.createElement("option");
  autoOpt.value = "auto";
  autoOpt.textContent = T("autoDetect");
  $taskType.appendChild(autoOpt);

  Engine.TASK_ORDER.forEach(function (key) {
    var opt = document.createElement("option");
    opt.value = key;
    opt.textContent = tl(key);
    $taskType.appendChild(opt);
  });
  $taskType.value = "auto";

  /* ---------- Views (hash routing + smooth scroll) ---------- */

  function setView(name) {
    $generatorView.hidden = name !== "generator";
    $guideView.hidden = name !== "guide";
    $compareView.hidden = name !== "compare";
    $chainsView.hidden = name !== "chains";
    $aboutView.hidden = name !== "about";
    $settingsView.hidden = name !== "settings";
    var glossaryView = document.getElementById("glossary-view");
    if (glossaryView) glossaryView.hidden = name !== "glossary";
    var stackView = document.getElementById("stack-view");
    if (stackView) stackView.hidden = name !== "stack";
    var doctorView = document.getElementById("doctor-view");
    if (doctorView) doctorView.hidden = name !== "doctor";
    var radarView = document.getElementById("radar-view");
    if (radarView) radarView.hidden = name !== "radar";
    var arenaView = document.getElementById("arena-view");
    if (arenaView) arenaView.hidden = name !== "arena";
    var topicsView = document.getElementById("topics-view");
    if (topicsView) topicsView.hidden = name !== "topics";
    if ($mergeView) $mergeView.hidden = name !== "merge";
    $navGenerator.classList.toggle("active", name === "generator");
    $navGuide.classList.toggle("active", name === "guide");
    $navCompare.classList.toggle("active", name === "compare" || name === "merge");
    $navChains.classList.toggle("active", name === "chains");
    $navAbout.classList.toggle("active", name === "about");
    $navSettings.classList.toggle("active", name === "settings");
    var navStack = document.getElementById("nav-stack");
    var navDoctor = document.getElementById("nav-doctor");
    var navGlossary = document.getElementById("nav-glossary");
    if (navStack) navStack.classList.toggle("active", name === "stack");
    if (navDoctor) navDoctor.classList.toggle("active", name === "doctor");
    if (navGlossary) navGlossary.classList.toggle("active", name === "glossary");
    var navRadar = document.getElementById("nav-radar");
    if (navRadar) navRadar.classList.toggle("active", name === "radar");
    var navArena = document.getElementById("nav-arena");
    if (navArena) navArena.classList.toggle("active", name === "arena");
    var navTopics = document.getElementById("nav-topics");
    if (navTopics) navTopics.classList.toggle("active", name === "topics");
    var moreBtn = document.getElementById("nav-more");
    if (moreBtn) moreBtn.classList.toggle("active", ["chains", "stack", "doctor", "glossary", "about", "settings", "radar", "arena", "topics"].indexOf(name) !== -1);
    closeMorePanel();
    if (name === "guide" && !guideBuilt) buildGuide();
    if (name === "compare") renderCompare();
    if (name === "chains") renderChainHistory();
    if (name === "glossary") initGlossary();
    if (name === "topics" && window.WhichAITopics) {
      window.WhichAITopics.init(document.getElementById("topics-wrap"), { T: T });
    }
    if (name === "arena" && window.WhichAIArena) {
      window.WhichAIArena.init(document.getElementById("arena-wrap"), {
        T: T,
        openSettings: function () { location.hash = "#settings"; },
        families: function () {
          return Engine.MODEL_ORDER.filter(function (f) { return RUNNERS[f]; }).map(function (f) {
            var ok = false;
            try {
              if (f === "gemini") ok = !!settings.geminiKey;
              else if (f === "llama") ok = !!settings.groqKey;
              else ok = !!settings.openrouterKey && !!(settings.orModels && (settings.orModels[f] || "").trim());
            } catch (e) { ok = false; }
            return { id: f, label: Engine.MODELS[f].label, available: ok };
          });
        },
        run: function (f, prompt) { return RUNNERS[f].call(settings, prompt); }
      });
    }
    if (name === "radar" && window.WhichAIRadar) {
      window.WhichAIRadar.init(document.getElementById("radar-wrap"), {
        T: T,
        openModel: openModelById,
        isWatched: isWatched,
        toggleWatch: toggleWatch,
        getSeen: getRadarSeen,
        setSeen: setRadarSeen
      });
    }
    if (name === "stack" && window.WhichAIStack) {
      window.WhichAIStack.init(document.getElementById("stack-wrap"), {
        T: T,
        openModel: openModelById,
        openFinder: function () { location.hash = "#finder"; }
      });
    }
    if (name === "doctor" && window.WhichAIDoctor) {
      window.WhichAIDoctor.init(document.getElementById("doctor-wrap"), {
        T: T,
        copy: copyPrompt,
        useInGenerator: function (text) {
          if (text) $goal.value = text;
          setGenMode("goal", true);
          if (location.hash) location.hash = ""; else setView("generator");
          $goal.focus();
        }
      });
    }
    if (name === "merge" && window.WhichAIMerge) window.WhichAIMerge.render();
    if (viewInitDone) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncViewToHash() {
    var h = location.hash;
    var isChains = h.indexOf("#chains") === 0;
    var isMerge = h.indexOf("#merge") === 0;
    var isAbout = h.indexOf("#about") === 0;
    var isGlossary = h.indexOf("#glossary") === 0;
    var isCompare = h.indexOf("#compare") === 0;
    var isFinder = h.indexOf("#finder") === 0;
    var isModel = h.indexOf("#model=") === 0;
    var isStack = h.indexOf("#stack") === 0;
    var isDoctor = h.indexOf("#doctor") === 0;
    var isRadar = h.indexOf("#radar") === 0;
    var isArena = h.indexOf("#arena") === 0;
    var isTopics = h.indexOf("#topics") === 0;
    if (isModel) { openModelById(decodeURIComponent(h.slice(7))); return; }
    setView(h === "#guide" ? "guide" : isCompare ? "compare" : isChains ? "chains" : isMerge ? "merge" : isAbout ? "about" : isGlossary ? "glossary" : isStack ? "stack" : isDoctor ? "doctor" : isRadar ? "radar" : isArena ? "arena" : isTopics ? "topics" : h === "#settings" ? "settings" : "generator");
    if (isChains) importChainFromHash();
    if (isCompare) {
      // Model comparison is the default; outputs win only when explicitly asked
      // for or when an output comparison is already in progress.
      var tab = h.indexOf("#compare-specs") === 0 ? "specs"
        : h.indexOf("#compare-outputs") === 0 ? "outputs"
        : (activeCmp ? "outputs" : "specs");
      setCompareTab(tab);
    }
    if (isFinder) setGenMode("finder", false);
    if (isAbout && h.length > "#about".length) {
      var anchor = document.getElementById(h.slice(1));
      if (anchor) setTimeout(function () { anchor.scrollIntoView({ behavior: "smooth", block: "start" }); }, 160);
    }
  }

  /* ---------- v0.25: official links, watchlist, radar seen-state ---------- */

  function linkForModel(m) {
    var DBx = window.PromptCompassModelsDB || null;
    if (!m || !DBx) return null;
    if (m.url) return m.url;
    if (m.family && DBx.links && DBx.links[m.family]) return DBx.links[m.family];
    if (DBx.vendorLinks && DBx.vendorLinks[m.vendor]) return DBx.vendorLinks[m.vendor];
    return null;
  }

  function linkForFamily(fam) {
    var DBx = window.PromptCompassModelsDB || null;
    return DBx && DBx.links && DBx.links[fam] ? DBx.links[fam] : null;
  }

  function officialAnchor(url, label, primary) {
    var a = document.createElement("a");
    a.className = primary ? "btn-copy btn-official" : "btn-link btn-official";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label + " \u2197";
    return a;
  }

  var WATCH_KEY = "pc_watch_v1";
  var RADAR_SEEN_KEY = "pc_radar_seen";

  function getWatchlist() {
    try { return JSON.parse(localStorage.getItem(WATCH_KEY)) || []; } catch (e) { return []; }
  }
  function isWatched(id) { return getWatchlist().indexOf(id) !== -1; }
  function toggleWatch(id) {
    var w = getWatchlist();
    var i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i, 1);
    try { localStorage.setItem(WATCH_KEY, JSON.stringify(w)); } catch (e) { /* ignore */ }
  }
  function getRadarSeen() {
    try { return localStorage.getItem(RADAR_SEEN_KEY) || ""; } catch (e) { return ""; }
  }
  function setRadarSeen(iso) {
    try { localStorage.setItem(RADAR_SEEN_KEY, iso); } catch (e) { /* ignore */ }
    updateRadarDot();
  }
  function updateRadarDot() {
    var b = document.getElementById("nav-more");
    var ch = window.WhichAIChanges || null;
    if (!b || !ch) return;
    var unseen = ch.unseenCount(getRadarSeen());
    b.classList.toggle("has-dot", unseen > 0);
  }

  /* ---------- v0.24: "More" nav menu ---------- */

  function closeMorePanel() {
    var p = document.getElementById("nav-more-panel");
    var b = document.getElementById("nav-more");
    if (p && !p.hidden) p.hidden = true;
    if (b) b.setAttribute("aria-expanded", "false");
  }

  function initMoreMenu() {
    var b = document.getElementById("nav-more");
    var p = document.getElementById("nav-more-panel");
    if (!b || !p) return;
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = p.hidden;
      if (open) {
        var header = document.querySelector(".site-header");
        if (header) p.style.top = (header.getBoundingClientRect().bottom + 6) + "px";
        p.hidden = false;
        b.setAttribute("aria-expanded", "true");
      } else {
        closeMorePanel();
      }
    });
    p.addEventListener("click", function () { closeMorePanel(); });
    document.addEventListener("click", function (e) {
      if (!p.hidden && !p.contains(e.target) && e.target !== b) closeMorePanel();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMorePanel();
    });
  }

  /* ---------- v0.24: precompiled demo in the empty state ---------- */

  function renderDemo() {
    var box = document.getElementById("demo-card");
    if (!box || !Bench) return;
    var task = "research";
    var rec = Bench.recommend(task);
    var best = Bench.apps[rec.ranking[0].app];
    var freeAlt = null;
    for (var i = 1; i < rec.ranking.length; i++) {
      var app = Bench.apps[rec.ranking[i].app];
      if (app && app.freeModel) { freeAlt = { id: rec.ranking[i].app, app: app, note: rec.ranking[i].note }; break; }
    }
    var exGoal = "Summarize 30 academic PDFs with citations, spending under $20/month";
    box.innerHTML = "";
    box.hidden = false;
    var tag = document.createElement("p");
    tag.className = "demo-tag";
    tag.textContent = T("demoTitle");
    box.appendChild(tag);
    var g = document.createElement("p");
    g.className = "demo-goal";
    g.textContent = "\u201c" + exGoal + "\u201d";
    box.appendChild(g);
    var best1 = document.createElement("p");
    best1.className = "demo-line";
    var b1 = document.createElement("strong");
    b1.appendChild(document.createTextNode(T("demoBest") + " "));
    var bestMark = Brands && Brands.createMark(rec.ranking[0].app, best.label, { wordmark: true, providerWordmark: true });
    if (bestMark) b1.appendChild(bestMark);
    else b1.appendChild(document.createTextNode(best.label));
    best1.appendChild(b1);
    best1.appendChild(document.createTextNode(" \u00b7 " + rec.ranking[0].note.split(";")[0].split(".")[0] + "."));
    box.appendChild(best1);
    if (freeAlt) {
      var alt = document.createElement("p");
      alt.className = "demo-line demo-alt";
      alt.appendChild(document.createTextNode(T("demoAlt") + " "));
      var altMark = Brands && Brands.createMark(freeAlt.id, freeAlt.app.label, { wordmark: true, providerWordmark: true });
      if (altMark) alt.appendChild(altMark);
      else alt.appendChild(document.createTextNode(freeAlt.app.label));
      alt.appendChild(document.createTextNode(" \u00b7 " + freeAlt.app.freeModel));
      box.appendChild(alt);
    }
    var acts = document.createElement("div");
    acts.className = "compare-actions demo-actions";
    var tryB = document.createElement("button");
    tryB.type = "button";
    tryB.className = "btn-copy";
    tryB.textContent = T("demoTry");
    tryB.addEventListener("click", function () {
      $goal.value = exGoal;
      $context.value = "";
      $taskType.value = "auto";
      onGenerate();
    });
    var mineB = document.createElement("button");
    mineB.type = "button";
    mineB.className = "btn-primary btn-inline";
    mineB.textContent = T("demoYours");
    mineB.addEventListener("click", function () { setGenMode("finder", true); });
    acts.appendChild(mineB);
    acts.appendChild(tryB);
    box.appendChild(acts);
  }

  /* ---------- v0.22: generator mode (goal vs guided finder) ---------- */

  function setGenMode(mode, persist) {
    var isFinder = mode === "finder";
    $generatorView.classList.toggle("finder-on", isFinder);
    var fw = document.getElementById("finder-wrap");
    if (fw) fw.hidden = !isFinder;
    var mg = document.getElementById("mode-goal");
    var mf = document.getElementById("mode-finder");
    if (mg) { mg.classList.toggle("active", !isFinder); mg.setAttribute("aria-selected", String(!isFinder)); }
    if (mf) { mf.classList.toggle("active", isFinder); mf.setAttribute("aria-selected", String(isFinder)); }
    if (isFinder && window.WhichAIFinder && fw) {
      window.WhichAIFinder.init(fw, {
        T: T,
        openModel: openModelById,
        useModel: function (family, task) {
          var cb = document.querySelector('.model-check input[value="' + family + '"]');
          if (cb) cb.checked = true;
          if (task && Engine.TASK_TYPES[task]) { $taskType.value = task; $detectHint.hidden = true; }
          setGenMode("goal", true);
          if (location.hash) location.hash = ""; else setView("generator");
          $goal.focus();
        },
        switchToGoal: function () { setGenMode("goal", true); }
      });
    }
    if (persist) { try { localStorage.setItem(GENMODE_KEY, mode); } catch (e) { /* ignore */ } }
  }

  /* ---------- v0.22: compare subtabs (outputs vs specs) ---------- */

  function setCompareTab(which) {
    var ow = document.getElementById("cmp-outputs-wrap");
    var swp = document.getElementById("cmp-specs-wrap");
    var bo = document.getElementById("cmp-tab-outputs");
    var bs = document.getElementById("cmp-tab-specs");
    var specs = which === "specs";
    if (ow) ow.hidden = specs;
    if (swp) swp.hidden = !specs;
    if (bo) { bo.classList.toggle("active", !specs); bo.setAttribute("aria-selected", String(!specs)); }
    if (bs) { bs.classList.toggle("active", specs); bs.setAttribute("aria-selected", String(specs)); }
    if (specs && window.WhichAIModelCompare && swp) {
      window.WhichAIModelCompare.init(swp, { T: T, openModel: openModelById });
    }
  }

  /* ---------- v0.22: open a model detail from anywhere ---------- */

  function openModelById(id) {
    var DBx = window.PromptCompassModelsDB || null;
    if (!DBx) return;
    var m = null;
    DBx.models.forEach(function (x) { if (x.id === id) m = x; });
    if (!m) return;
    if (location.hash !== "#guide") location.hash = "#guide"; else setView("guide");
    if (!guideBuilt) buildGuide();
    var s = document.getElementById("db-search");
    if (s) {
      s.value = m.name;
      try { s.dispatchEvent(new Event("input")); } catch (e) { /* ignore */ }
    }
    if (dbShowDetail) dbShowDetail(m);
    setTimeout(function () {
      var d = document.getElementById("db-detail");
      if (d && !d.hidden) d.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  }

  /* ---------- v0.22: glossary ---------- */

  function initGlossary() {
    var G = window.WhichAIGlossary || null;
    var list = document.getElementById("glossary-list");
    var search = document.getElementById("glossary-search");
    var count = document.getElementById("glossary-count");
    if (!G || !list) return;
    function renderGl(q) {
      var terms = G.filter(q);
      list.innerHTML = "";
      if (count) count.textContent = terms.length + " " + T("glossCount");
      if (!terms.length) {
        var p = document.createElement("p");
        p.className = "router-meta";
        p.textContent = T("glossNoRes");
        list.appendChild(p);
        return;
      }
      terms.forEach(function (t) {
        var d = document.createElement("details");
        d.className = "faq gl-item";
        var s = document.createElement("summary");
        s.textContent = t.term;
        d.appendChild(s);
        var def = document.createElement("p");
        def.className = "gl-def";
        def.textContent = t.def;
        d.appendChild(def);
        if (t.ex) {
          var ex = document.createElement("p");
          ex.className = "gl-ex";
          ex.textContent = t.ex;
          d.appendChild(ex);
        }
        if (t.link) {
          var lp = document.createElement("p");
          lp.className = "gl-link";
          var a = document.createElement("a");
          a.href = t.link.hash;
          a.textContent = t.link.label + " \u2192";
          lp.appendChild(a);
          d.appendChild(lp);
        }
        list.appendChild(d);
      });
    }
    if (search && !search.getAttribute("data-wired")) {
      search.setAttribute("data-wired", "1");
      search.addEventListener("input", function () { renderGl(search.value); });
    }
    renderGl(search ? search.value : "");
  }

  /* ---------- v0.22: market insight charts (Model guide) ---------- */

  function renderInsights() {
    var C = window.WhichAICharts || null;
    var DBx = window.PromptCompassModelsDB || null;
    var wrap = document.getElementById("insights-wrap");
    if (!C || !DBx || !wrap) return;
    wrap.hidden = false;
    var note = document.getElementById("insights-note");
    if (note) note.textContent = "Measured scores only (no estimates). " + DBx.scaleNote;

    var top = DBx.models
      .filter(function (m) { return m.score && m.score.aa && !m.score.est && (m.status === "public" || m.status === "preview"); })
      .sort(function (a, b) { return b.score.aa - a.score.aa; })
      .slice(0, 12);
    var topEl = document.getElementById("chart-top");
    if (topEl) {
      topEl.innerHTML = C.barChart(top.map(function (m) {
        return { label: m.name, value: m.score.aa };
      }), { max: 65, aria: "Top 12 models by AA Intelligence Index" });
    }

    var pp = DBx.models.filter(function (m) {
      return m.spec && m.spec.priceIn != null && m.spec.priceOut != null && m.score && m.score.aa && !m.score.est;
    });
    var ppEl = document.getElementById("chart-pp");
    if (ppEl && pp.length >= 4) {
      var pts = pp.map(function (m, i) {
        return {
          x: (3 * m.spec.priceIn + m.spec.priceOut) / 4,
          y: m.score.aa,
          label: m.name,
          labelDy: (i % 2) ? 16 : 0
        };
      });
      ppEl.innerHTML = C.scatter(pts, {
        xLabel: "Blended API price, $ per 1M tokens (3:1 input:output)",
        yLabel: "AA Intelligence Index",
        aria: "Price versus performance scatter plot"
      });
      var ppNote = document.getElementById("chart-pp-note");
      if (ppNote) ppNote.textContent = "Top-left = more intelligence per dollar. Prices from vendor pages (July 2026); index from the July 16 snapshot. Only models with published price AND measured score are plotted.";
    }
  }

  /* ---------- v0.22: chains visual roadmap ---------- */

  function renderChainMap() {
    var map = document.getElementById("chain-map");
    if (!map) return;
    map.innerHTML = "";
    if (!activeChain) return;
    var total = activeChain.steps.length;
    activeChain.steps.forEach(function (step, i) {
      var node = document.createElement("div");
      node.className = "chain-node" + ((step.output || "").trim() ? " done" : "");
      node.setAttribute("role", "listitem");
      var head = document.createElement("div");
      head.className = "chain-node-head";
      var n = document.createElement("span");
      n.className = "step-n";
      n.textContent = i + 1;
      var nm = document.createElement("span");
      nm.className = "chain-node-name";
      nm.textContent = step.name;
      head.appendChild(n);
      head.appendChild(nm);
      node.appendChild(head);
      var modelLbl = Engine.MODELS[step.model] ? Engine.MODELS[step.model].label : step.model;
      var mc = document.createElement("span");
      mc.className = "chain-node-model";
      setBrandMark(mc, step.model, modelLbl + (RUNNERS[step.model] ? " \u00b7 auto-run" : ""), { providerWordmark: true });
      node.appendChild(mc);
      var de = document.createElement("p");
      de.className = "chain-node-desc";
      de.textContent = trunc(step.description || "", 74);
      node.appendChild(de);
      var io = document.createElement("p");
      io.className = "chain-io";
      io.textContent = "In: " + (i === 0 ? "your goal" : "output of step " + i) +
        " \u00b7 Out: " + (i === total - 1 ? "final result" : "feeds step " + (i + 2));
      node.appendChild(io);
      node.addEventListener("click", function () {
        var card = $chainSteps.children[i];
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      map.appendChild(node);
    });
  }

  function moveChainStep(from, to) {
    if (!activeChain) return;
    if (to < 0 || to >= activeChain.steps.length) return;
    var s = activeChain.steps.splice(from, 1)[0];
    activeChain.steps.splice(to, 0, s);
    renderChain();
  }

  function addChainStep() {
    if (!activeChain) return;
    var reco = Bench ? Bench.recommend(activeChain.taskType).ranking[0].app : "claude";
    activeChain.steps.push({
      tplId: "custom-" + Date.now(),
      name: "Custom step",
      description: "Your own step \u00b7 edit the instruction below ({goal} inserts your goal).",
      instruction: "Continue working toward this goal: \"{goal}\". Describe here what this step must deliver.",
      model: reco,
      output: "",
      custom: true
    });
    renderChain();
  }

  window.addEventListener("hashchange", syncViewToHash);

  /* ---------- Typewriter effect (fast, word-by-word) ---------- */

  var twTimer = null;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function typewrite(el, text) {
    if (reducedMotion) {
      el.textContent = text;
      return;
    }
    if (twTimer) {
      clearInterval(twTimer);
      twTimer = null;
    }
    var tokens = text.split(/(\s+)/);
    var i = 0;
    var acc = "";
    el.textContent = "\u258d";
    twTimer = setInterval(function () {
      for (var k = 0; k < 6 && i < tokens.length; k++, i++) acc += tokens[i];
      if (i >= tokens.length) {
        el.textContent = acc;
        clearInterval(twTimer);
        twTimer = null;
      } else {
        el.textContent = acc + "\u258d";
      }
    }, 12);
  }

  /* ---------- Examples ---------- */

  var EXAMPLES = [
    {
      goal: "Write a landing page headline and subheadline for a budgeting app aimed at freelancers",
      context: "The app is called Coinly. It automatically sets aside money for taxes. Audience: freelancers aged 25-40 who hate spreadsheets.",
      format: "markdown", length: "short", tone: "persuasive"
    },
    {
      goal: "Build a Python script that renames all photos in a folder using the date they were taken",
      context: "Photos come from different cameras and phones, so file naming is inconsistent. I want a dry-run mode that previews changes before applying them.",
      format: "code", length: "medium", tone: "none"
    },
    {
      goal: "Explain how HTTPS keeps a connection secure to someone with no technical background",
      context: "The reader is a curious teenager. Use everyday analogies.",
      format: "prose", length: "medium", tone: "friendly"
    },
    {
      goal: "Generate 10 name ideas for a podcast about AI for non-technical listeners",
      context: "Tone of the show: practical, curious, jargon-free. Each episode answers one everyday question about AI.",
      format: "bullets", length: "short", tone: "none"
    }
  ];

  var exampleIndex = 0;

  function loadExample() {
    var ex = EXAMPLES[exampleIndex % EXAMPLES.length];
    exampleIndex++;
    $goal.value = ex.goal;
    $context.value = ex.context;
    $taskType.value = "auto";
    $format.value = ex.format;
    $length.value = ex.length;
    $tone.value = ex.tone;
    $goalError.hidden = true;
    $detectHint.hidden = true;
    $goal.focus();
  }

  /* ---------- Generate ---------- */

  function selectedModels() {
    return Array.prototype.slice
      .call(document.querySelectorAll(".model-check input:checked"))
      .map(function (cb) { return cb.value; });
  }

  function onGenerate() {
    $goalError.hidden = true;
    $modelsError.hidden = true;

    var goal = $goal.value.trim();
    var models = selectedModels();

    if (!goal) {
      $goalError.hidden = false;
      $goal.focus();
      return;
    }
    if (models.length === 0) {
      $modelsError.hidden = false;
      return;
    }

    var taskType = $taskType.value;
    if (taskType === "auto") {
      taskType = Engine.detectTaskType(goal + " " + $context.value.trim());
      $detectHint.textContent = T("detected") + " " + tl(taskType);
      $detectHint.hidden = false;
    } else {
      $detectHint.hidden = true;
    }

    results = Engine.generate({
      goal: goal,
      context: $context.value.trim(),
      taskType: taskType,
      format: $format.value,
      length: $length.value,
      tone: $tone.value,
      models: models
    });

    lastGen = { goal: goal, context: $context.value.trim(), taskType: taskType };
    savePrefs();

    renderRouter(taskType);
    renderResults();
  }

  /* ---------- Shared: ranking details block ---------- */

  function buildRankingDetails(rec) {
    var details = document.createElement("details");
    details.className = "router-details";
    var dsum = document.createElement("summary");
    dsum.textContent = T("fullRanking");
    details.appendChild(dsum);

    var ol = document.createElement("ol");
    ol.className = "router-rank";
    rec.ranking.forEach(function (item) {
      var app = Bench.apps[item.app];
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.className = "router-app";
      setBrandMark(name, item.app, app.label, { wordmark: true });
      li.appendChild(name);
      li.appendChild(document.createTextNode(" (" + app.vendor + ") - " + item.note));
      var free = document.createElement("span");
      free.className = "router-free";
      free.textContent = T("freeTier") + " " + app.freeModel;
      li.appendChild(free);
      ol.appendChild(li);
    });
    details.appendChild(ol);

    var meta = document.createElement("p");
    meta.className = "router-meta";
    meta.textContent = Bench.CONFIDENCE_NOTES[rec.confidence] + " " + Bench.disclaimer;
    details.appendChild(meta);

    var srcP = document.createElement("p");
    srcP.className = "router-meta";
    srcP.appendChild(document.createTextNode(T("sourcesLabel") + " "));
    var first = true;
    rec.sourceIds.forEach(function (sid) {
      var src = null;
      Bench.sources.forEach(function (s) { if (s.id === sid) src = s; });
      if (!src) return;
      if (!first) srcP.appendChild(document.createTextNode(" · "));
      first = false;
      var a = document.createElement("a");
      a.href = src.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = src.label;
      srcP.appendChild(a);
    });
    details.appendChild(srcP);

    return details;
  }

  /* ---------- Model router card (generator view) ---------- */

  function renderRouter(taskType) {
    recommendedAppId = null;
    if (!Bench || !$routerCard) {
      if ($routerCard) $routerCard.hidden = true;
      return;
    }

    var rec = Bench.recommend(taskType);
    recommendedAppId = rec.ranking[0].app;
    $routerCard.innerHTML = "";

    var head = document.createElement("div");
    head.className = "router-head";
    var title = document.createElement("span");
    title.className = "router-title";
    title.textContent = T("routerTitle");
    var updated = document.createElement("span");
    updated.className = "badge";
    updated.textContent = T("benchLabel") + " " + Bench.updated;
    head.appendChild(title);
    head.appendChild(updated);
    $routerCard.appendChild(head);

    var pick = document.createElement("p");
    pick.className = "router-pick";
    pick.appendChild(document.createTextNode(T("bestPick") + " "));
    var strong = document.createElement("strong");
    setBrandMark(strong, recommendedAppId, Bench.apps[recommendedAppId].label, { wordmark: true });
    pick.appendChild(strong);
    $routerCard.appendChild(pick);

    var summary = document.createElement("p");
    summary.className = "router-summary";
    summary.textContent = rec.summary;
    $routerCard.appendChild(summary);

    $routerCard.appendChild(buildRankingDetails(rec));
    $routerCard.hidden = false;
  }

  /* ---------- Model guide view ---------- */

  function buildGuide() {
    if (!Bench || !$guideGrid) return;
    guideBuilt = true;
    $guideGrid.innerHTML = "";
    if ($guideUpdated) $guideUpdated.textContent = "Benchmark snapshot: " + Bench.updated + ". " + Bench.disclaimer;
    if (window.WhichAIApi) window.WhichAIApi.renderStatus(document.getElementById("api-status"));

    Engine.TASK_ORDER.forEach(function (key) {
      var rec = Bench.taskTypes[key];
      if (!rec) return;
      var topApp = Bench.apps[rec.ranking[0].app];

      var card = document.createElement("div");
      card.className = "card guide-card";

      var head = document.createElement("div");
      head.className = "router-head";
      var task = document.createElement("span");
      task.className = "guide-task";
      task.innerHTML = TASK_ICONS[key] || "";
      var taskLbl = document.createElement("span");
      taskLbl.textContent = tl(key);
      task.appendChild(taskLbl);
      var conf = document.createElement("span");
      conf.className = "badge";
      conf.textContent = rec.confidence + " confidence";
      head.appendChild(task);
      head.appendChild(conf);
      card.appendChild(head);

      var pick = document.createElement("p");
      pick.className = "router-pick";
      pick.appendChild(document.createTextNode(T("bestPick") + " "));
      var strong = document.createElement("strong");
      setBrandMark(strong, rec.ranking[0].app, topApp.label, { wordmark: true });
      pick.appendChild(strong);
      card.appendChild(pick);

      var summary = document.createElement("p");
      summary.className = "router-summary";
      summary.textContent = rec.summary;
      card.appendChild(summary);

      card.appendChild(buildRankingDetails(rec));

      var cta = document.createElement("button");
      cta.type = "button";
      cta.className = "btn-link guide-cta";
      cta.textContent = "Write a prompt for this task →";
      cta.addEventListener("click", function () {
        $taskType.value = key;
        $detectHint.hidden = true;
        location.hash = "";
        setView("generator");
        $goal.focus();
      });
      card.appendChild(cta);

      $guideGrid.appendChild(card);
    });

    buildCatalog();
    buildModelDb();
    renderInsights();
  }

  function buildCatalog() {
    var wrap = document.getElementById("catalog-wrap");
    var grid = document.getElementById("catalog-grid");
    var note = document.getElementById("catalog-note");
    if (!wrap || !grid || !Bench || !Bench.catalog) return;
    wrap.hidden = false;
    note.textContent = "Who is who on the market, grouped by what they are for. Snapshot: " + Bench.updated + ". " + Bench.disclaimer;
    grid.innerHTML = "";
    Bench.catalog.forEach(function (cat) {
      var card = document.createElement("div");
      card.className = "card guide-card";
      var head = document.createElement("div");
      head.className = "router-head";
      var t = document.createElement("span");
      t.className = "guide-task";
      t.textContent = cat.label;
      head.appendChild(t);
      card.appendChild(head);
      var blurb = document.createElement("p");
      blurb.className = "router-summary";
      blurb.textContent = cat.blurb;
      card.appendChild(blurb);
      var ul = document.createElement("ul");
      ul.className = "catalog-list";
      var VISIBLE = 5;
      cat.models.forEach(function (m, i) {
        var li = document.createElement("li");
        if (i >= VISIBLE) li.className = "catalog-extra";
        var name = document.createElement("span");
        name.className = "router-app";
        setBrandMark(name, m.vendor, m.name, { small: true });
        li.appendChild(name);
        li.appendChild(document.createTextNode(" - " + m.vendor));
        var access = document.createElement("span");
        access.className = "router-free";
        access.textContent = "Access: " + m.access;
        li.appendChild(access);
        var noteEl = document.createElement("span");
        noteEl.className = "catalog-model-note";
        noteEl.textContent = m.note;
        li.appendChild(noteEl);
        ul.appendChild(li);
      });
      card.appendChild(ul);
      /* Categories hold very different numbers of models. Folding the tail
         keeps the three columns close in height, which is what made the
         previous layout hard to scan. */
      if (cat.models.length > VISIBLE) {
        var hidden = cat.models.length - VISIBLE;
        var more = document.createElement("button");
        more.type = "button";
        more.className = "btn-link catalog-more";
        more.setAttribute("aria-expanded", "false");
        more.textContent = T("catalogShowAll") + " (" + cat.models.length + ")";
        more.addEventListener("click", function () {
          var open = card.classList.toggle("catalog-open");
          more.setAttribute("aria-expanded", open ? "true" : "false");
          more.textContent = open ? T("catalogShowLess") : T("catalogShowAll") + " (" + cat.models.length + ")";
        });
        more.title = hidden + " more in this category";
        card.appendChild(more);
      }
      grid.appendChild(card);
    });
  }


  function buildModelDb() {
    var wrap = document.getElementById("modeldb-wrap");
    var resultsEl = document.getElementById("db-results");
    var detailEl = document.getElementById("db-detail");
    var search = document.getElementById("db-search");
    var hint = document.getElementById("db-hint");
    var DB = window.PromptCompassModelsDB || null;
    if (!wrap || !resultsEl || !DB) {
      if (wrap) wrap.hidden = true;
      return;
    }
    if (hint) hint.textContent = DB.models.length + " " + T("dbHint");

    function chipEl(text, cls) {
      var el = document.createElement("span");
      el.className = "chip " + cls;
      el.textContent = text;
      return el;
    }

    function showDetail(m, hitEl) {
      // toggle: clicking the open model again closes it
      if (!detailEl.hidden && detailEl.getAttribute("data-mid") === m.id) {
        detailEl.hidden = true;
        detailEl.removeAttribute("data-mid");
        var openHit0 = resultsEl.querySelector(".db-hit.open");
        if (openHit0) openHit0.classList.remove("open");
        return;
      }
      // open as an accordion right under the clicked row
      if (!hitEl) hitEl = resultsEl.querySelector('.db-hit[data-mid="' + m.id + '"]');
      var prevOpen = resultsEl.querySelector(".db-hit.open");
      if (prevOpen) prevOpen.classList.remove("open");
      if (hitEl) {
        hitEl.classList.add("open");
        resultsEl.insertBefore(detailEl, hitEl.nextSibling);
      } else if (detailEl.parentNode !== resultsEl) {
        resultsEl.insertBefore(detailEl, resultsEl.firstChild);
      }
      detailEl.setAttribute("data-mid", m.id);
      detailEl.innerHTML = "";
      detailEl.hidden = false;
      var card = document.createElement("div");
      card.className = "card db-detail-card";

      var head = document.createElement("div");
      head.className = "db-row-head";
      var name = document.createElement("span");
      name.className = "panel-model";
      setBrandMark(name, m, m.name, { className: "ai-brand-lockup", providerWordmark: true });
      var vend = document.createElement("small");
      vend.textContent = m.vendor;
      name.appendChild(vend);
      head.appendChild(name);
      var score = document.createElement("span");
      score.className = "badge";
      score.textContent = m.score && m.score.aa
        ? "AA " + (m.score.est ? "~" : "") + m.score.aa + (m.score.est ? " est." : "")
        : "AA n/a";
      head.appendChild(score);
      card.appendChild(head);

      var chips = document.createElement("div");
      chips.className = "db-chips";
      chips.appendChild(chipEl(m.status, "chip-" + m.status));
      m.tags.forEach(function (t) {
        if (t !== m.status) chips.appendChild(chipEl(t === "prompt-target" ? "in Generator" : t, "chip-" + t));
      });
      (m.labels || []).forEach(function (l) {
        chips.appendChild(chipEl(l, "chip-label"));
      });
      card.appendChild(chips);

      if (m.spec) {
        var sp = document.createElement("div");
        sp.className = "db-specs";
        [["released", "mcReleased"], ["ctx", "mcCtx"], ["modal", "mcModal"], ["speed", "mcSpeed"]].forEach(function (f) {
          if (m.spec[f[0]] == null) return;
          var cell = document.createElement("div");
          cell.className = "db-spec";
          var b = document.createElement("b");
          b.textContent = T(f[1]);
          cell.appendChild(b);
          cell.appendChild(document.createTextNode(m.spec[f[0]]));
          sp.appendChild(cell);
        });
        if (m.spec.priceIn != null && m.spec.priceOut != null) {
          var pc = document.createElement("div");
          pc.className = "db-spec";
          var pb = document.createElement("b");
          pb.textContent = T("mcPrice");
          pc.appendChild(pb);
          pc.appendChild(document.createTextNode("$" + m.spec.priceIn + " / $" + m.spec.priceOut + (m.spec.note ? " \u00b7 " + m.spec.note : "")));
          sp.appendChild(pc);
        } else if (m.spec.note) {
          var nc = document.createElement("div");
          nc.className = "db-spec";
          var nb = document.createElement("b");
          nb.textContent = "Note";
          nc.appendChild(nb);
          nc.appendChild(document.createTextNode(m.spec.note));
          sp.appendChild(nc);
        }
        if (sp.children.length) card.appendChild(sp);
      }

      if (m.score && m.score.cat) {
        var cats = [["coding", "Coding"], ["reasoning", "Reasoning"], ["writing", "Writing"], ["agents", "Agents & tools"]];
        var bars = document.createElement("div");
        bars.className = "cat-bars";
        cats.forEach(function (c) {
          var v = m.score.cat[c[0]];
          if (v == null) return;
          var row = document.createElement("div");
          row.className = "cat-row";
          var lab = document.createElement("span");
          lab.className = "cat-label";
          lab.textContent = c[1];
          var track = document.createElement("span");
          track.className = "cat-track";
          var fill = document.createElement("span");
          fill.className = "cat-fill";
          var wPct = Math.max(2, Math.min(100, v));
          fill.style.width = "0%";
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { fill.style.width = wPct + "%"; });
          });
          track.appendChild(fill);
          var val = document.createElement("span");
          val.className = "cat-val";
          val.textContent = v;
          row.appendChild(lab);
          row.appendChild(track);
          row.appendChild(val);
          bars.appendChild(row);
        });
        card.appendChild(bars);
        var catNote = document.createElement("p");
        catNote.className = "router-meta";
        catNote.textContent = "Category scores (0–100) are WhichAI blended ratings: public category leaderboards plus editorial judgment - guidance, not official measurements.";
        card.appendChild(catNote);
      }

      var acc = document.createElement("p");
      acc.className = "router-free";
      acc.textContent = "Access: " + m.access;
      card.appendChild(acc);

      var rev = document.createElement("p");
      rev.className = "db-review";
      rev.textContent = m.review;
      card.appendChild(rev);

      var srcLine = document.createElement("p");
      srcLine.className = "router-meta";
      srcLine.textContent = DB.scaleNote + (DB.specNote ? " " + DB.specNote : "");
      card.appendChild(srcLine);

      if (m.score && m.score.est) {
        var est = document.createElement("p");
        est.className = "router-meta";
        est.textContent = "The score shown is a WhichAI estimate from adjacent benchmarks - not an official measurement.";
        card.appendChild(est);
      }

      var actions = document.createElement("div");
      actions.className = "compare-actions";
      if (m.family && m.tags.indexOf("prompt-target") !== -1) {
        var useBtn = document.createElement("button");
        useBtn.type = "button";
        useBtn.className = "btn-copy";
        useBtn.textContent = "Use in Generator →";
        useBtn.addEventListener("click", function () {
          var cb = document.querySelector('.model-check input[value="' + m.family + '"]');
          if (cb) cb.checked = true;
          location.hash = "";
          setView("generator");
          $goal.focus();
        });
        actions.appendChild(useBtn);
      }
      var offUrl = linkForModel(m);
      if (offUrl) actions.appendChild(officialAnchor(offUrl, T("officialSite"), true));
      var watchBtn = document.createElement("button");
      watchBtn.type = "button";
      watchBtn.className = "btn-copy radar-star" + (isWatched(m.id) ? " on" : "");
      watchBtn.textContent = (isWatched(m.id) ? "\u2605 " + T("radarUnfollow") : "\u2606 " + T("radarFollow"));
      watchBtn.addEventListener("click", function () {
        toggleWatch(m.id);
        watchBtn.classList.toggle("on", isWatched(m.id));
        watchBtn.textContent = (isWatched(m.id) ? "\u2605 " + T("radarUnfollow") : "\u2606 " + T("radarFollow"));
      });
      actions.appendChild(watchBtn);
      var cmpBtn = document.createElement("button");
      cmpBtn.type = "button";
      cmpBtn.className = "btn-copy";
      cmpBtn.textContent = T("specCompareBtn");
      cmpBtn.addEventListener("click", function () {
        if (window.WhichAIModelCompare) window.WhichAIModelCompare.compareWith(m.id);
        location.hash = "#compare-specs";
      });
      actions.appendChild(cmpBtn);
      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "btn-link";
      closeBtn.textContent = "Close";
      closeBtn.addEventListener("click", function () { detailEl.hidden = true; });
      actions.appendChild(closeBtn);
      card.appendChild(actions);

      detailEl.appendChild(card);
    }

    var FILTER_TAGS = [
      ["prompt-target", "In Generator"], ["auto-run", "Auto-run"], ["free", "Free"],
      ["open-weights", "Open weights"], ["api", "API"], ["private", "Private"],
      ["preview", "Preview"], ["legacy", "Legacy"], ["rumored", "Rumored"]
    ];
    var FILTER_LABELS = [
      "coding", "reasoning", "writing", "research", "agents", "speed", "value",
      "multilingual", "vision", "long-context", "local", "enterprise"
    ];
    var activeTags = [];
    var activeLabels = [];

    function toggleIn(arr, v) {
      var i = arr.indexOf(v);
      if (i === -1) arr.push(v); else arr.splice(i, 1);
    }

    function buildFilters() {
      var fWrap = document.getElementById("db-filters");
      if (!fWrap || fWrap.getAttribute("data-wired")) return;
      fWrap.setAttribute("data-wired", "1");
      function addChip(text, cls, onToggle) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "chip chip-toggle " + cls;
        b.textContent = text;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {
          var on = b.getAttribute("aria-pressed") === "true";
          b.setAttribute("aria-pressed", on ? "false" : "true");
          b.classList.toggle("chip-on", !on);
          onToggle();
          render(search ? search.value : "");
        });
        fWrap.appendChild(b);
      }
      FILTER_TAGS.forEach(function (t) {
        addChip(t[1], "chip-" + t[0], function () { toggleIn(activeTags, t[0]); });
      });
      FILTER_LABELS.forEach(function (l) {
        addChip(l, "chip-label", function () { toggleIn(activeLabels, l); });
      });
    }
    buildFilters();

    function render(q) {
      q = (q || "").toLowerCase().trim();
      if (detailEl.parentNode === resultsEl) {
        resultsEl.parentNode.insertBefore(detailEl, resultsEl.nextSibling);
      }
      resultsEl.innerHTML = "";
      detailEl.hidden = true;
      detailEl.removeAttribute("data-mid");
      if (!q && !activeTags.length && !activeLabels.length) return;
      var matches = DB.models.filter(function (m) {
        var ok = activeTags.every(function (t) { return m.tags.indexOf(t) !== -1; }) &&
          activeLabels.every(function (l) { return (m.labels || []).indexOf(l) !== -1; });
        if (!ok) return false;
        if (!q) return true;
        return (m.name + " " + m.vendor + " " + m.status + " " + m.tags.join(" ") + " " +
          (m.labels || []).join(" ") + " " + m.review + " " + m.access)
          .toLowerCase().indexOf(q) !== -1;
      });
      if (!matches.length) {
        var pEl = document.createElement("p");
        pEl.className = "router-meta";
        pEl.textContent = T("dbNoResults");
        resultsEl.appendChild(pEl);
        return;
      }
      matches.slice(0, 20).forEach(function (m) {
        var hit = document.createElement("button");
        hit.type = "button";
        hit.className = "db-hit";
        hit.setAttribute("data-mid", m.id);
        var left = document.createElement("span");
        var nm = document.createElement("strong");
        setBrandMark(nm, m, m.name, { small: true });
        left.appendChild(nm);
        if (m.tags.indexOf("prompt-target") !== -1) {
          var gm = document.createElement("span");
          gm.className = "db-gen-mark";
          gm.title = "Available as a target in the Generator";
          gm.textContent = "✦";
          left.appendChild(gm);
        }
        var vd = document.createElement("small");
        vd.textContent = m.vendor + " · " + m.status;
        left.appendChild(vd);
        hit.appendChild(left);
        var sc = document.createElement("span");
        sc.className = "badge";
        sc.textContent = m.score && m.score.aa ? "AA " + (m.score.est ? "~" : "") + m.score.aa : "n/a";
        hit.appendChild(sc);
        hit.addEventListener("click", function () { showDetail(m, hit); });
        resultsEl.appendChild(hit);
      });
      if (matches.length > 20) {
        var more = document.createElement("p");
        more.className = "router-meta";
        more.textContent = "+" + (matches.length - 20) + " more - refine your search or add a filter.";
        resultsEl.appendChild(more);
      }
    }

    if (search && !search.getAttribute("data-wired")) {
      search.setAttribute("data-wired", "1");
      search.addEventListener("input", function () { render(search.value); });
    }
    dbShowDetail = showDetail;
    render(search ? search.value : "");
  }

  /* ---------- Compare view: manual paste, auto-run, scoring, versioning ---------- */

  function normalizeCmp(c) {
    if (!c.goalId) c.goalId = c.id;
    if (!c.version) c.version = 1;
    return c;
  }

  function lsGet() {
    try {
      var list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      return list.map(normalizeCmp);
    } catch (e) {
      return [];
    }
  }

  function lsSet(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function trunc(s, n) {
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  function winnersOf(entries) {
    var max = 0;
    entries.forEach(function (e) { if (e.score > max) max = e.score; });
    if (max === 0) return [];
    return entries.filter(function (e) { return e.score === max; }).map(function (e) { return e.model; });
  }

  function startComparison() {
    if (!results.length || !lastGen) return;
    var id = "c" + Date.now();
    activeCmp = {
      id: id,
      goalId: id,
      version: 1,
      createdAt: Date.now(),
      goal: lastGen.goal,
      context: lastGen.context,
      taskType: lastGen.taskType,
      entries: results.map(function (r) {
        return { model: r.id, label: r.label, vendor: r.vendor, prompt: r.prompt, output: "", score: 0 };
      })
    };
    location.hash = "#compare";
  }

  function newVersion() {
    if (!activeCmp) return;
    var clone = JSON.parse(JSON.stringify(activeCmp));
    clone.id = "c" + Date.now();
    clone.createdAt = Date.now();
    clone.version = (activeCmp.version || 1) + 1;
    clone.entries.forEach(function (e) { e.output = ""; e.score = 0; });
    activeCmp = clone;
    renderCompare();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildExportMarkdown(cmp) {
    var taskLabel = Engine.TASK_TYPES[cmp.taskType] ? Engine.TASK_TYPES[cmp.taskType].label : cmp.taskType;
    var lines = [];
    lines.push("# WhichAI comparison");
    lines.push("");
    lines.push("- Goal: " + cmp.goal);
    if (cmp.context) lines.push("- Context: " + cmp.context);
    lines.push("- Task type: " + taskLabel);
    lines.push("- Version: v" + cmp.version);
    lines.push("- Date: " + new Date(cmp.createdAt).toLocaleString());
    var winners = winnersOf(cmp.entries);
    lines.push("- Result: " + (winners.length === 0 ? "not scored" : winners.length > 1 ? "tie" : "winner " + winners[0]));
    lines.push("");
    cmp.entries.forEach(function (e) {
      lines.push("## " + e.label + " (" + e.vendor + ") - " + (e.score ? e.score + "/5" : "not scored"));
      lines.push("");
      lines.push("### Prompt");
      lines.push("");
      lines.push("```");
      lines.push(e.prompt);
      lines.push("```");
      lines.push("");
      lines.push("### Output");
      lines.push("");
      lines.push(e.output ? e.output : "_(not pasted)_");
      lines.push("");
    });
    lines.push("---");
    lines.push("Generated with WhichAI - https://whichai.wiki");
    return lines.join("\n");
  }

  function exportComparison() {
    if (!activeCmp) return;
    var md = buildExportMarkdown(activeCmp);
    var blob = new Blob([md], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "whichai-comparison-v" + activeCmp.version + ".md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function renderCompare() {
    renderHistory();

    if (!activeCmp) {
      $compareEmpty.hidden = false;
      $compareEditor.hidden = true;
      return;
    }

    $compareEmpty.hidden = true;
    $compareEditor.hidden = false;

    var taskLabel = Engine.TASK_TYPES[activeCmp.taskType]
      ? Engine.TASK_TYPES[activeCmp.taskType].label
      : activeCmp.taskType;
    $compareMeta.textContent =
      "Goal: " + activeCmp.goal + "  ·  Task: " + taskLabel + "  ·  v" + activeCmp.version + "  ·  " +
      new Date(activeCmp.createdAt).toLocaleString();

    $compareGrid.innerHTML = "";

    activeCmp.entries.forEach(function (entry) {
      var col = document.createElement("div");
      col.className = "card compare-col";
      col.setAttribute("data-model", entry.model);

      var head = document.createElement("div");
      head.className = "compare-col-head";
      var title = document.createElement("span");
      title.className = "panel-model";
      setBrandMark(title, entry.model, entry.label, { wordmark: true, providerWordmark: true });
      var vendor = document.createElement("small");
      vendor.textContent = entry.vendor;
      title.appendChild(vendor);
      var win = document.createElement("span");
      win.className = "win-badge";
      win.textContent = "Winner";
      win.hidden = true;
      head.appendChild(title);
      head.appendChild(win);
      col.appendChild(head);

      // Prompt used (collapsible, editable, copyable)
      var det = document.createElement("details");
      det.className = "compare-prompt";
      var dsum = document.createElement("summary");
      dsum.textContent = "Prompt used (editable)";
      det.appendChild(dsum);
      var promptTa = document.createElement("textarea");
      promptTa.className = "prompt-edit";
      promptTa.value = entry.prompt;
      promptTa.rows = 10;
      promptTa.addEventListener("input", function () { entry.prompt = promptTa.value; });
      det.appendChild(promptTa);
      var copyBtn = document.createElement("button");
      copyBtn.className = "btn-copy";
      copyBtn.type = "button";
      copyBtn.textContent = T("copyPrompt");
      copyBtn.addEventListener("click", function () { copyPrompt(entry.prompt, copyBtn); });
      det.appendChild(copyBtn);
      col.appendChild(det);

      // Output row: label + optional auto-run button
      var runner = RUNNERS[entry.model];
      var labRow = document.createElement("div");
      labRow.className = "run-row";
      var lab = document.createElement("label");
      lab.className = "compare-label";
      lab.textContent = runner ? entry.label + "'s answer" : "Paste " + entry.label + "'s answer";
      labRow.appendChild(lab);
      var cmpUrl = linkForFamily(entry.model);
      if (cmpUrl) labRow.appendChild(officialAnchor(cmpUrl, T("officialOpen") + " " + entry.label, false));
      var statusEl = document.createElement("p");
      statusEl.className = "run-status";
      statusEl.hidden = true;
      var ta = document.createElement("textarea");
      if (runner) {
        var runBtn = document.createElement("button");
        runBtn.type = "button";
        runBtn.className = "btn-link";
        runBtn.textContent = "Run via " + runner.provider;
        runBtn.addEventListener("click", function () { runEntry(entry, ta, runBtn, statusEl); });
        labRow.appendChild(runBtn);
      }
      col.appendChild(labRow);

      ta.className = "compare-output";
      ta.rows = 9;
      ta.placeholder = runner
        ? "Click \"Run via " + runner.provider + "\" (needs your free key in Settings), or paste the answer manually"
        : "Run the prompt in " + entry.label + ", then paste the answer here";
      ta.value = entry.output;
      ta.addEventListener("input", function () { entry.output = ta.value; });
      col.appendChild(ta);
      col.appendChild(statusEl);

      // Star scoring
      var starsRow = document.createElement("div");
      starsRow.className = "stars";
      var starBtns = [];
      for (var s = 1; s <= 5; s++) {
        (function (val) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "star";
          b.textContent = "★";
          b.setAttribute("aria-label", val + " of 5");
          b.addEventListener("click", function () {
            entry.score = entry.score === val ? 0 : val;
            paintStars();
            updateWinnerBadges();
          });
          starBtns.push(b);
          starsRow.appendChild(b);
        })(s);
      }
      var scoreLabel = document.createElement("span");
      scoreLabel.className = "score-label";
      starsRow.appendChild(scoreLabel);
      col.appendChild(starsRow);

      function paintStars() {
        starBtns.forEach(function (b, i) {
          b.classList.toggle("on", i < entry.score);
        });
        scoreLabel.textContent = entry.score ? entry.score + "/5" : T("notScored");
      }
      paintStars();

      $compareGrid.appendChild(col);
    });

    updateWinnerBadges();
  }

  function updateWinnerBadges() {
    if (!activeCmp) return;
    var winners = winnersOf(activeCmp.entries);
    Array.prototype.slice.call($compareGrid.children).forEach(function (col) {
      var badge = col.querySelector(".win-badge");
      var isWin = winners.indexOf(col.getAttribute("data-model")) !== -1;
      badge.hidden = !isWin;
      badge.textContent = winners.length > 1 ? T("tied") : T("winner");
      col.classList.toggle("compare-win", isWin);
    });
  }

  function saveComparison() {
    if (!activeCmp) return;
    var list = lsGet();
    var idx = -1;
    list.forEach(function (c, i) { if (c.id === activeCmp.id) idx = i; });
    if (idx >= 0) list[idx] = activeCmp;
    else list.push(activeCmp);
    var ok = lsSet(list);
    $compareSaved.textContent = ok ? "Saved." : "Could not save - browser storage unavailable.";
    $compareSaved.hidden = false;
    setTimeout(function () { $compareSaved.hidden = true; }, 2200);
    renderHistory();
  }

  function renderHistory() {
    if (!$historyList) return;
    var list = lsGet();
    $historyList.innerHTML = "";

    if (!list.length) {
      var p = document.createElement("p");
      p.className = "router-meta";
      p.textContent = "Nothing saved yet. Saved comparisons stay in this browser only.";
      $historyList.appendChild(p);
      return;
    }

    list.slice().reverse().forEach(function (cmp) {
      var row = document.createElement("div");
      row.className = "history-item";

      var info = document.createElement("div");
      var goalEl = document.createElement("div");
      goalEl.className = "history-goal";
      goalEl.textContent = trunc(cmp.goal, 90);
      var metaEl = document.createElement("div");
      metaEl.className = "history-meta";
      var taskLabel = Engine.TASK_TYPES[cmp.taskType] ? Engine.TASK_TYPES[cmp.taskType].label : cmp.taskType;
      var winners = winnersOf(cmp.entries);
      var winText = winners.length === 0
        ? T("notScored")
        : (winners.length > 1 ? T("tie") : T("winnerPrefix") + " " + winners.map(function (m) {
            var e = null;
            cmp.entries.forEach(function (x) { if (x.model === m) e = x; });
            return e ? e.label : m;
          }).join(", "));
      metaEl.textContent = new Date(cmp.createdAt).toLocaleString() + " · " + taskLabel + " · v" + cmp.version + " · " + winText;
      info.appendChild(goalEl);
      info.appendChild(metaEl);

      var actions = document.createElement("div");
      actions.className = "history-actions";
      var openB = document.createElement("button");
      openB.type = "button";
      openB.className = "btn-link";
      openB.textContent = T("openBtn");
      openB.addEventListener("click", function () {
        activeCmp = normalizeCmp(JSON.parse(JSON.stringify(cmp)));
        renderCompare();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      var delB = document.createElement("button");
      delB.type = "button";
      delB.className = "btn-link danger";
      delB.textContent = T("deleteBtn");
      delB.addEventListener("click", function () {
        if (!window.confirm("Delete this comparison?")) return;
        var remaining = lsGet().filter(function (c) { return c.id !== cmp.id; });
        lsSet(remaining);
        renderHistory();
      });
      actions.appendChild(openB);
      actions.appendChild(delB);

      row.appendChild(info);
      row.appendChild(actions);
      $historyList.appendChild(row);
    });
  }

  /* ---------- Chains (Phase 4): multi-step workflows ---------- */

  function chainLsGet() {
    try { return JSON.parse(localStorage.getItem(CHAINS_KEY)) || []; } catch (e) { return []; }
  }

  function chainLsSet(list) {
    try { localStorage.setItem(CHAINS_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }

  function buildChain() {
    $chainGoalError.hidden = true;
    var goal = $chainGoal.value.trim();
    if (!goal) { $chainGoalError.hidden = false; $chainGoal.focus(); return; }
    if (!Chains) return;
    var context = $chainContext.value.trim();
    var tt = $chainTaskType.value;
    if (tt === "auto") {
      tt = Engine.detectTaskType(goal + " " + context);
      $chainDetect.textContent = T("detected") + " " + tl(tt);
      $chainDetect.hidden = false;
    } else {
      $chainDetect.hidden = true;
    }
    var reco = Bench ? Bench.recommend(tt).ranking[0].app : "claude";
    activeChain = {
      id: "ch" + Date.now(),
      createdAt: Date.now(),
      goal: goal,
      context: context,
      taskType: tt,
      steps: Chains.get(tt).map(function (t) {
        return { tplId: t.id, name: t.name, description: t.description, instruction: t.instruction, model: reco, output: "" };
      })
    };
    renderChain();
  }

  function buildStepPrompt(index) {
    var step = activeChain.steps[index];
    var stepGoal = step.instruction.split("{goal}").join(activeChain.goal);
    var ctx = activeChain.context || "";
    if (index > 0) {
      var prev = (activeChain.steps[index - 1].output || "").trim();
      if (prev) {
        ctx += (ctx ? "\n\n" : "") + "Output of the previous step (use it as your starting material):\n" + prev;
      } else {
        ctx += (ctx ? "\n\n" : "") + "Note: the previous step's output is not available yet - state this and proceed as best you can.";
      }
    }
    return Engine.generate({
      goal: stepGoal,
      context: ctx,
      taskType: activeChain.taskType,
      models: [step.model]
    })[0].prompt;
  }

  function renderChain() {
    if (!activeChain) { $chainStepsWrap.hidden = true; renderChainHistory(); return; }
    $chainStepsWrap.hidden = false;
    $chainSteps.innerHTML = "";

    activeChain.steps.forEach(function (step, i) {
      var card = document.createElement("div");
      card.className = "card chain-step";

      var head = document.createElement("div");
      head.className = "chain-step-head";
      var title = document.createElement("span");
      title.className = "panel-model";
      title.textContent = "Step " + (i + 1) + " · " + step.name;
      var modelSel = document.createElement("select");
      modelSel.className = "chain-model";
      Engine.MODEL_ORDER.forEach(function (mid) {
        var o = document.createElement("option");
        o.value = mid;
        o.textContent = Engine.MODELS[mid].label + (RUNNERS[mid] ? " (auto-run)" : "");
        modelSel.appendChild(o);
      });
      modelSel.value = step.model;
      head.appendChild(title);
      var headRight = document.createElement("div");
      headRight.className = "chain-step-tools";
      var chainBrand = document.createElement("span");
      chainBrand.className = "chain-selected-brand";
      function refreshChainBrand() {
        var chainLabel = Engine.MODELS[modelSel.value] ? Engine.MODELS[modelSel.value].label : modelSel.value;
        setBrandMark(chainBrand, modelSel.value, chainLabel, { providerWordmark: true });
      }
      refreshChainBrand();
      headRight.appendChild(chainBrand);
      headRight.appendChild(modelSel);
      function mkTool(txt, key, enabled, fn) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn-copy";
        b.textContent = txt;
        b.title = T(key);
        b.setAttribute("aria-label", T(key));
        b.disabled = !enabled;
        b.addEventListener("click", fn);
        headRight.appendChild(b);
      }
      mkTool("\u2191", "chainMoveUp", i > 0, function () { moveChainStep(i, i - 1); });
      mkTool("\u2193", "chainMoveDown", i < activeChain.steps.length - 1, function () { moveChainStep(i, i + 1); });
      mkTool("\u2715", "chainRemoveStep", activeChain.steps.length > 1, function () {
        if (!window.confirm("Remove this step?")) return;
        activeChain.steps.splice(i, 1);
        renderChain();
      });
      head.appendChild(headRight);
      card.appendChild(head);

      var desc = document.createElement("p");
      desc.className = "chain-desc";
      desc.textContent = step.description;
      card.appendChild(desc);

      if (step.custom) {
        var instrTa = document.createElement("textarea");
        instrTa.className = "chain-custom-instr";
        instrTa.rows = 2;
        instrTa.value = step.instruction;
        instrTa.addEventListener("input", function () { step.instruction = instrTa.value; });
        card.appendChild(instrTa);
      }

      var det = document.createElement("details");
      det.className = "compare-prompt";
      var dsum = document.createElement("summary");
      dsum.textContent = T("promptForStep");
      det.appendChild(dsum);
      var pre = document.createElement("pre");
      pre.className = "prompt-text prompt-text-sm";
      det.appendChild(pre);
      det.addEventListener("toggle", function () {
        if (det.open) pre.textContent = buildStepPrompt(i);
      });
      var copyBtn = document.createElement("button");
      copyBtn.className = "btn-copy";
      copyBtn.type = "button";
      copyBtn.textContent = T("copyPrompt");
      copyBtn.addEventListener("click", function () { copyPrompt(buildStepPrompt(i), copyBtn); });
      det.appendChild(copyBtn);
      card.appendChild(det);

      var labRow = document.createElement("div");
      labRow.className = "run-row";
      var lab = document.createElement("label");
      lab.className = "compare-label";
      lab.textContent = T("stepOutput");
      labRow.appendChild(lab);
      var statusEl = document.createElement("p");
      statusEl.className = "run-status";
      statusEl.hidden = true;
      var ta = document.createElement("textarea");
      var runBtn = document.createElement("button");
      runBtn.type = "button";
      runBtn.className = "btn-link";
      function refreshRunBtn() {
        var runner = RUNNERS[step.model];
        runBtn.hidden = !runner;
        if (runner) runBtn.textContent = "Run via " + runner.provider;
      }
      refreshRunBtn();
      runBtn.addEventListener("click", function () {
        var runner = RUNNERS[step.model];
        if (!runner) return;
        if (!runner.hasKey(settings)) {
          setRunStatus(statusEl, "No API key - open Settings and paste your " + runner.keyName + " key.", true);
          return;
        }
        runBtn.disabled = true;
        var orig = runBtn.textContent;
        runBtn.textContent = "Running…";
        setRunStatus(statusEl, "Calling " + runner.provider + "…", false);
        runner.call(settings, buildStepPrompt(i)).then(function (text) {
          step.output = text;
          ta.value = text;
          setRunStatus(statusEl, "Done - this output will feed the next step.", false);
        }).catch(function (err) {
          setRunStatus(statusEl, "Error: " + (err && err.message ? err.message : "request failed"), true);
        }).then(function () {
          runBtn.disabled = false;
          runBtn.textContent = orig;
        });
      });
      labRow.appendChild(runBtn);
      card.appendChild(labRow);

      ta.className = "compare-output";
      ta.rows = 7;
      ta.placeholder = "Paste this step's answer here (or use auto-run). It will be included in the next step's prompt.";
      ta.value = step.output;
      ta.addEventListener("input", function () { step.output = ta.value; });
      ta.addEventListener("change", renderChainMap);
      card.appendChild(ta);
      card.appendChild(statusEl);

      modelSel.addEventListener("change", function () {
        step.model = modelSel.value;
        refreshChainBrand();
        refreshRunBtn();
        renderChainMap();
        if (det.open) pre.textContent = buildStepPrompt(i);
      });

      $chainSteps.appendChild(card);
    });

    renderChainMap();
    renderChainHistory();
  }

  function saveChain() {
    if (!activeChain) return;
    var list = chainLsGet();
    var idx = -1;
    list.forEach(function (c, i) { if (c.id === activeChain.id) idx = i; });
    if (idx >= 0) list[idx] = activeChain;
    else list.push(activeChain);
    var ok = chainLsSet(list);
    $chainSaved.textContent = ok ? "Saved." : "Could not save - browser storage unavailable.";
    $chainSaved.hidden = false;
    setTimeout(function () { $chainSaved.hidden = true; }, 2200);
    renderChainHistory();
  }

  function renderChainHistory() {
    if (!$chainHistoryList) return;
    var list = chainLsGet();
    $chainHistoryList.innerHTML = "";
    if (!list.length) {
      var p = document.createElement("p");
      p.className = "router-meta";
      p.textContent = "Nothing saved yet. Saved chains stay in this browser only.";
      $chainHistoryList.appendChild(p);
      return;
    }
    list.slice().reverse().forEach(function (ch) {
      var row = document.createElement("div");
      row.className = "history-item";
      var info = document.createElement("div");
      var goalEl = document.createElement("div");
      goalEl.className = "history-goal";
      goalEl.textContent = trunc(ch.goal, 90);
      var metaEl = document.createElement("div");
      metaEl.className = "history-meta";
      var taskLabel = Engine.TASK_TYPES[ch.taskType] ? Engine.TASK_TYPES[ch.taskType].label : ch.taskType;
      var filled = ch.steps.filter(function (st) { return (st.output || "").trim(); }).length;
      metaEl.textContent = new Date(ch.createdAt).toLocaleString() + " · " + taskLabel + " · " + ch.steps.length + " steps · " + filled + "/" + ch.steps.length + " outputs";
      info.appendChild(goalEl);
      info.appendChild(metaEl);
      var actions = document.createElement("div");
      actions.className = "history-actions";
      var openB = document.createElement("button");
      openB.type = "button";
      openB.className = "btn-link";
      openB.textContent = T("openBtn");
      openB.addEventListener("click", function () {
        activeChain = JSON.parse(JSON.stringify(ch));
        $chainGoal.value = activeChain.goal;
        $chainContext.value = activeChain.context || "";
        $chainTaskType.value = activeChain.taskType;
        $chainDetect.hidden = true;
        renderChain();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      var delB = document.createElement("button");
      delB.type = "button";
      delB.className = "btn-link danger";
      delB.textContent = T("deleteBtn");
      delB.addEventListener("click", function () {
        if (!window.confirm("Delete this chain?")) return;
        chainLsSet(chainLsGet().filter(function (c) { return c.id !== ch.id; }));
        renderChainHistory();
      });
      actions.appendChild(openB);
      actions.appendChild(delB);
      row.appendChild(info);
      row.appendChild(actions);
      $chainHistoryList.appendChild(row);
    });
  }

  function runAllSteps() {
    if (!activeChain || !$chainRunAll) return;
    var i = 0;
    $chainRunAll.disabled = true;
    var orig = $chainRunAll.textContent;
    function finish(msg, isErr) {
      $chainRunAll.disabled = false;
      $chainRunAll.textContent = orig;
      renderChain();
      setRunStatus($chainRunAllStatus, msg, isErr);
    }
    function next() {
      if (i >= activeChain.steps.length) {
        finish("All steps completed - outputs are filled in below.", false);
        return;
      }
      var step = activeChain.steps[i];
      if ((step.output || "").trim()) { i++; next(); return; }
      var runner = RUNNERS[step.model];
      var label = Engine.MODELS[step.model] ? Engine.MODELS[step.model].label : step.model;
      if (!runner) {
        finish("Stopped at step " + (i + 1) + ": " + label + " has no auto-run. Copy its prompt, paste the answer in the step output, then press Run all again to continue.", true);
        return;
      }
      if (!runner.hasKey(settings)) {
        finish("Stopped at step " + (i + 1) + ": no " + runner.keyName + " key. Add it in Settings, then press Run all again.", true);
        return;
      }
      $chainRunAll.textContent = "Running step " + (i + 1) + " of " + activeChain.steps.length + "\u2026";
      setRunStatus($chainRunAllStatus, "Step " + (i + 1) + " \u00b7 calling " + runner.provider + "\u2026", false);
      runner.call(settings, buildStepPrompt(i)).then(function (text) {
        step.output = text;
        i++;
        next();
      }).catch(function (err) {
        finish("Error at step " + (i + 1) + ": " + (err && err.message ? err.message : "request failed"), true);
      });
    }
    next();
  }

  function exportChain() {
    if (!activeChain) return;
    var lines = ["# WhichAI chain", "", "- Goal: " + activeChain.goal];
    if (activeChain.context) lines.push("- Context: " + activeChain.context);
    lines.push("- Task type: " + activeChain.taskType);
    lines.push("- Exported: " + new Date().toISOString().slice(0, 10), "");
    activeChain.steps.forEach(function (step, i) {
      var label = Engine.MODELS[step.model] ? Engine.MODELS[step.model].label : step.model;
      lines.push("## Step " + (i + 1) + " \u00b7 " + step.name + " (" + label + ")", "");
      lines.push("### Prompt", "", "\u0060\u0060\u0060", buildStepPrompt(i), "\u0060\u0060\u0060", "");
      lines.push("### Output", "", (step.output || "").trim() ? step.output : "_(not filled)_", "");
    });
    var blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "whichai-chain.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  function shareChain(btn) {
    if (!activeChain) return;
    var payload = {
      g: activeChain.goal,
      c: activeChain.context || "",
      t: activeChain.taskType,
      m: activeChain.steps.map(function (st) { return st.model; })
    };
    var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    var url = location.origin + location.pathname + "#chains?d=" + encodeURIComponent(b64);
    copyPrompt(url, btn);
  }

  var chainImportedParam = null;
  function importChainFromHash() {
    var h = location.hash || "";
    var idx = h.indexOf("?d=");
    if (h.indexOf("#chains") !== 0 || idx === -1) return;
    var param = h.slice(idx + 3);
    if (param === chainImportedParam) return;
    chainImportedParam = param;
    try {
      var b64 = decodeURIComponent(param);
      var payload = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (!payload || typeof payload.g !== "string" || !payload.g.trim()) return;
      var tt = Engine.TASK_ORDER.indexOf(payload.t) !== -1 ? payload.t : Engine.detectTaskType(payload.g);
      var reco = Bench ? Bench.recommend(tt).ranking[0].app : "claude";
      $chainGoal.value = payload.g;
      $chainContext.value = payload.c || "";
      $chainTaskType.value = tt;
      activeChain = {
        id: "ch" + Date.now(),
        createdAt: Date.now(),
        goal: payload.g.slice(0, 4000),
        context: (payload.c || "").slice(0, 4000),
        taskType: tt,
        steps: Chains.get(tt).map(function (t, i) {
          var m = payload.m && payload.m[i] && Engine.MODELS[payload.m[i]] ? payload.m[i] : reco;
          return { tplId: t.id, name: t.name, description: t.description, instruction: t.instruction, model: m, output: "" };
        })
      };
      renderChain();
    } catch (e) { /* malformed share link - ignore silently */ }
  }

  function initChains() {
    if (!$chainTaskType) return;
    var aOpt = document.createElement("option");
    aOpt.value = "auto";
    aOpt.textContent = T("autoDetect");
    $chainTaskType.appendChild(aOpt);
    Engine.TASK_ORDER.forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = tl(key);
      $chainTaskType.appendChild(opt);
    });
    $chainTaskType.value = "auto";
    $chainBuild.addEventListener("click", buildChain);
    $chainSave.addEventListener("click", saveChain);
    if ($chainRunAll) $chainRunAll.addEventListener("click", runAllSteps);
    if ($chainExport) $chainExport.addEventListener("click", exportChain);
    if ($chainShare) $chainShare.addEventListener("click", function () { shareChain($chainShare); });
    var addBtn = document.getElementById("chain-addstep");
    if (addBtn) addBtn.addEventListener("click", addChainStep);
  }

  /* ---------- Render prompts (with typewriter) ---------- */

  var panelPres = [];
  var panelAnimated = [];

  function renderResults() {
    $tabs.innerHTML = "";
    $panels.innerHTML = "";
    panelPres = [];
    panelAnimated = [];
    if (twTimer) {
      clearInterval(twTimer);
      twTimer = null;
    }

    var selectedIndex = 0;
    results.forEach(function (r, i) {
      if (r.id === recommendedAppId) selectedIndex = i;
    });

    results.forEach(function (r, i) {
      var tab = document.createElement("button");
      tab.className = "tab" + (r.id === recommendedAppId ? " tab-reco" : "");
      tab.type = "button";
      setBrandMark(tab, r.id, r.label, { wordmark: true, small: true });
      tab.setAttribute("role", "tab");
      if (r.id === recommendedAppId) tab.title = "Recommended for this task";
      tab.addEventListener("click", function () { selectTab(i); });
      $tabs.appendChild(tab);

      var panel = document.createElement("div");
      panel.className = "panel card";

      var toolbar = document.createElement("div");
      toolbar.className = "panel-toolbar";

      var title = document.createElement("span");
      title.className = "panel-model";
      setBrandMark(title, r.id, r.label, { wordmark: true, providerWordmark: true });
      var vendor = document.createElement("small");
      vendor.textContent = r.vendor;
      title.appendChild(vendor);

      var copyBtn = document.createElement("button");
      copyBtn.className = "btn-copy";
      copyBtn.type = "button";
      copyBtn.textContent = T("copy");
      copyBtn.addEventListener("click", function () { copyPrompt(r.prompt, copyBtn); });

      toolbar.appendChild(title);
      var tbBtns = document.createElement("div");
      tbBtns.className = "panel-btns";
      var famUrl = linkForFamily(r.id);
      if (famUrl) tbBtns.appendChild(officialAnchor(famUrl, T("officialOpen") + " " + r.label, true));
      tbBtns.appendChild(copyBtn);
      toolbar.appendChild(tbBtns);
      panel.appendChild(toolbar);

      var pre = document.createElement("pre");
      pre.className = "prompt-text";
      pre.textContent = "";
      panel.appendChild(pre);
      panelPres.push(pre);
      panelAnimated.push(false);

      var meta = document.createElement("p");
      meta.className = "prompt-meta";
      meta.textContent = r.words + " words · " + r.chars + " characters";
      panel.appendChild(meta);

      var why = document.createElement("details");
      why.className = "why";
      var summary = document.createElement("summary");
      summary.appendChild(document.createTextNode(T("whyPrefix") + " "));
      var whyMark = Brands && Brands.createMark(r.id, r.label, { providerWordmark: true, small: true });
      if (whyMark) summary.appendChild(whyMark);
      else summary.appendChild(document.createTextNode(r.label));
      why.appendChild(summary);
      var ul = document.createElement("ul");
      r.why.forEach(function (reason) {
        var li = document.createElement("li");
        li.textContent = reason;
        ul.appendChild(li);
      });
      why.appendChild(ul);
      panel.appendChild(why);

      $panels.appendChild(panel);
    });

    $emptyState.hidden = true;
    $resultsWrap.hidden = false;
    selectTab(selectedIndex);
  }

  function selectTab(index) {
    var tabs = $tabs.children;
    var panels = $panels.children;
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute("aria-selected", i === index ? "true" : "false");
      panels[i].hidden = i !== index;
      // Any non-active panel shows its full text instantly (in case its animation was interrupted).
      if (i !== index && panelPres[i] && results[i]) {
        panelPres[i].textContent = results[i].prompt;
      }
    }
    if (panelPres[index] && results[index]) {
      if (!panelAnimated[index]) {
        panelAnimated[index] = true;
        typewrite(panelPres[index], results[index].prompt);
      } else if (!twTimer) {
        panelPres[index].textContent = results[index].prompt;
      }
    }
  }

  /* ---------- Copy ---------- */

  function copyPrompt(text, btn) {
    var original = btn.textContent;
    function done() {
      btn.textContent = T("copied");
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1600);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------- Events & init ---------- */

  $generate.addEventListener("click", onGenerate);
  $loadExample.addEventListener("click", loadExample);
  $toCompare.addEventListener("click", startComparison);
  $compareSave.addEventListener("click", saveComparison);
  $compareNewver.addEventListener("click", newVersion);
  $compareExport.addEventListener("click", exportComparison);
  $settingsSave.addEventListener("click", saveSettings);
  if ($refineBtn) $refineBtn.addEventListener("click", refineGoal);
  if ($refineApply) $refineApply.addEventListener("click", function () {
    var t = $refineText.value.trim();
    if (t) $goal.value = t;
    $refineBox.hidden = true;
  });
  if ($refineDiscard) $refineDiscard.addEventListener("click", function () { $refineBox.hidden = true; });
  if ($compareMerge) $compareMerge.addEventListener("click", function () {
    if (!window.WhichAIMerge) return;
    var srcs = [];
    if (activeCmp) {
      activeCmp.entries.forEach(function (e) {
        if ((e.output || "").trim()) srcs.push({ label: e.label, text: e.output });
      });
    }
    window.WhichAIMerge.load(srcs, activeCmp ? { goal: activeCmp.goal } : {});
    location.hash = "#merge";
  });
  $prefsReset.addEventListener("click", resetPrefs);

  [$goal, $context].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onGenerate();
      }
    });
  });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      if (!reg) return;
      reg.addEventListener("updatefound", function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", function () {
          if (nw.state === "installed" && navigator.serviceWorker.controller) showUpdateToast();
        });
      });
    }).catch(function () { /* PWA is optional - never block the app */ });
  }

  function showUpdateToast() {
    if (document.getElementById("update-toast")) return;
    var t = document.createElement("div");
    t.id = "update-toast";
    t.className = "update-toast";
    var s = document.createElement("span");
    s.textContent = T("updateReady");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn-primary btn-inline";
    b.textContent = T("updateReload");
    b.addEventListener("click", function () { location.reload(); });
    t.appendChild(s);
    t.appendChild(b);
    document.body.appendChild(t);
  }

  function initNavAutoScroll() {
    var nav = document.querySelector(".site-nav");
    if (!nav) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var stopped = false;
    var dir = 1;
    var raf = null;
    var last = null;
    var holdUntil = 0;
    function stop() {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
    }
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach(function (ev) {
      nav.addEventListener(ev, stop, { passive: true });
    });
    function tick(ts) {
      if (stopped) return;
      raf = requestAnimationFrame(tick);
      var max = nav.scrollWidth - nav.clientWidth;
      if (max <= 4) { last = ts; return; }
      if (last != null && ts >= holdUntil) {
        var dt = Math.min((ts - last) / 1000, 0.05);
        nav.scrollLeft += dir * 16 * dt;
        if (dir === 1 && nav.scrollLeft >= max - 0.5) { dir = -1; holdUntil = ts + 1400; }
        else if (dir === -1 && nav.scrollLeft <= 0.5) { dir = 1; holdUntil = ts + 1400; }
      }
      last = ts;
    }
    raf = requestAnimationFrame(tick);
  }
  initNavAutoScroll();
  initMoreMenu();
  updateRadarDot();

  /* v0.29: brand click returns to the minimal welcome */
  (function initBrandHome() {
    var brand = document.querySelector(".brand");
    if (!brand || !window.WhichAIWelcome || !window.WhichAIWelcome.show) return;
    brand.classList.add("brand-clickable");
    brand.setAttribute("role", "button");
    brand.setAttribute("tabindex", "0");
    brand.setAttribute("aria-label", "WhichAI home");
    function goHome() { window.WhichAIWelcome.show(); }
    brand.addEventListener("click", goHome);
    brand.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); }
    });
  })();

  if (window.WhichAISupport) window.WhichAISupport.init({ T: T });

  var openDoctorBtn = document.getElementById("open-doctor");
  if (openDoctorBtn) openDoctorBtn.addEventListener("click", function () {
    var txt = $goal.value.trim();
    location.hash = "#doctor";
    if (txt && window.WhichAIDoctor) setTimeout(function () { window.WhichAIDoctor.load(txt); }, 60);
  });

  /* ---------- v0.22 init: modes, subtabs, footer ---------- */
  (function initV22() {
    var mg = document.getElementById("mode-goal");
    var mf = document.getElementById("mode-finder");
    if (mg) mg.addEventListener("click", function () { setGenMode("goal", true); });
    if (mf) mf.addEventListener("click", function () { setGenMode("finder", true); });
    var savedMode = "goal";
    try { savedMode = localStorage.getItem(GENMODE_KEY) || "goal"; } catch (e) { /* ignore */ }
    setGenMode(savedMode === "finder" ? "finder" : "goal", false);

    var bo = document.getElementById("cmp-tab-outputs");
    var bs = document.getElementById("cmp-tab-specs");
    if (bo) bo.addEventListener("click", function () {
      if (location.hash === "#compare-outputs") setCompareTab("outputs"); else location.hash = "#compare-outputs";
    });
    if (bs) bs.addEventListener("click", function () {
      if (location.hash === "#compare-specs") setCompareTab("specs"); else location.hash = "#compare-specs";
    });

    // Footer links: force handling when the hash is already the target
    Array.prototype.slice.call(document.querySelectorAll(".footer-links a")).forEach(function (a) {
      a.addEventListener("click", function () {
        var target = a.getAttribute("href");
        if (location.hash === target) syncViewToHash();
      });
    });
    window.WhichAIApp = { openModel: openModelById };
  })();

  initSettingsForm();
  applyPrefs();
  initChains();
  initLangTheme();
  syncViewToHash();
  viewInitDone = true;
})();
