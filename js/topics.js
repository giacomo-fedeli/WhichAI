/* WhichAI - AI Debates (v0.36). English editorial content; translated controls.
 * Evidence is linked at the claim, dated and distinguished from projections.
 * Reviewed summaries are not live news. Model feeds do not verify law or social
 * research. TOPICS/UPDATED/init/rerender stay compatible with the SEO generator.
 * v0.36: a deck of six cards and one open debate, the two sides face to face,
 * and each debate links into the tool that acts on it. Law and policy debates
 * point to ComplyAI.wiki for checking one's own obligations.
 */
(function () {
  "use strict";
  var UPDATED = "2026-09-07";
  var TOPICS = [
    { id: "energy", tag: "Environment", tagKey: "topicsTagEnvironment", title: "Energy, water and data centers",
      question: "Can AI become more efficient while its total footprint grows?",
      summary: "Yes. A cheaper query can encourage more use, and video or long-running agents need different amounts of work from a short text answer. Global electricity totals and local water stress also measure different problems. Ask which workload, in which place, with which energy supply.",
      numbers: [
        { v: "485 TWh", label: "Global data-center electricity in 2025, including non-AI workloads", kind: "estimate", period: "2025", source: 0 },
        { v: "~950 TWh", label: "Global data-center electricity in the IEA central projection for 2030", kind: "projection", period: "2030", source: 0 }
      ],
      evidenceNote: "The IEA's 2026 outlook replaces its earlier 415-to-945 TWh comparison. Neither total is AI-only. Berkeley Lab separately models direct cooling water and water associated with electricity; withdrawal and consumption are not interchangeable.",
      sideA: "Concentrated demand can strain grid connections and local resources even with a modest global share. Longer reasoning, video and agent workloads can outweigh efficiency gains. A national average cannot tell a community who pays for infrastructure or whether its watershed can support a site.",
      sideB: "Better hardware and software lower energy per task. New clean supply, storage and flexible scheduling can help; electricity-price effects depend on spare capacity and tariff design. These are options to assess locally, not a guarantee that growth is harmless.",
      status: "The 2026 IEA outlook projects roughly doubled data-center electricity demand by 2030. Local outcomes remain conditional on siting, workload growth and energy-system choices.",
      uncertainty: "There is no universal 'water per prompt' value across models, locations and cooling systems. Public per-model energy disclosure is insufficient for a fair environmental leaderboard.",
      watch: ["Energy per completed task, including retries and tool calls", "Site-level water consumption and watershed stress, beyond global replenishment pledges", "Who funds grid upgrades, and whether clean supply matches operating hours"],
      decisions: [
        { id: "use", label: "Choose my everyday AI", text: "Compare a compact model and a larger model on the same task. Keep the smaller option when quality is sufficient, request an appropriately short output, and reuse results. This reduces avoidable computation; WhichAI cannot measure your provider's energy or water use.", href: "#compare", action: "topicsCompareModels" },
        { id: "buy", label: "Evaluate a provider", text: "Ask for hosting region, operational energy mix, site-level water metrics and the method used to allocate them to your workload. Compare like-for-like boundaries before accepting an environmental claim.", href: "#market", action: "topicsSeeMarket" },
        { id: "local", label: "Understand a local project", text: "Read the utility connection plan and local water assessment. Look for seasonal stress, backup generation, cost allocation and enforceable reporting. A global AI footprint number cannot answer these local questions." }
      ],
      sources: [
        { label: "IEA, Key Questions on Energy and AI (2026)", url: "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary" },
        { label: "Berkeley Lab, US data-center energy and water methodology (2024)", url: "https://bies.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report" }
      ] },
    { id: "jobs", tag: "Work", tagKey: "topicsTagWork", title: "Jobs: displacement vs augmentation",
      question: "Which tasks improve with AI, and who receives the gains?",
      summary: "Task productivity, job exposure and actual job losses are different measures. AI can help one group while making another workflow slower. Whether saved time becomes better services, fewer roles or new work depends on demand and management decisions as well as model capability.",
      numbers: [
        { v: "+14%", label: "Issues resolved per hour with AI assistance in a study of 5,179 support agents", kind: "research", period: "2023 working-paper revision", source: 0 },
        { v: "+19% time", label: "Completion time in METR's early-2025 study of 16 experienced developers and 246 tasks", kind: "research", period: "February-June 2025", source: 1 }
      ],
      evidenceNote: "These are different settings and cannot be averaged. METR's February 2026 follow-up reports participant/task selection and time-measurement problems; it does not establish a dependable current speedup. The older slowdown is not today's universal result.",
      sideA: "Even when average output improves, workers can lose bargaining power or the entry-level tasks through which they learn. Cutting roles before checking errors and mentoring can transfer costs to customers and remaining staff. Company efficiency does not guarantee a benefit for each worker.",
      sideB: "The support-agent study found larger gains for less experienced workers, suggesting a route to spreading expertise. AI may remove repetitive work and make new services viable. Results depend on workflow design, supervision and how saved time is used.",
      status: "The evidence supports variation across people, tasks and tool generations. These studies do not estimate economy-wide net job losses, and WhichAI does not infer such a number from them.",
      uncertainty: "Exposure scores describe tasks that might change, not redundancy forecasts. Self-reported speed and benchmark scores do not establish quality-adjusted output or long-term learning.",
      watch: ["Time and quality measured together, with an appropriate comparison", "Junior hiring, mentoring and wage changes within the same occupation", "Whether time savings survive review, corrections and customer outcomes"],
      decisions: [
        { id: "use", label: "Improve my own workflow", text: "Define success for a repeatable task before using AI. Alternate comparable tasks with and without assistance. Log time, corrections and quality, including review. Choose a workflow from the result rather than trusting how fast it feels.", href: "#find", action: "topicsFindAI" },
        { id: "team", label: "Introduce AI in a team", text: "Start with a small pilot and human review. Measure quality and workload for junior and senior staff separately. Decide how saved time will fund learning or service improvement before changing staffing.", href: "#stack", action: "topicsReviewStack" },
        { id: "learn", label: "Protect my learning", text: "Attempt the task first, request targeted feedback, then explain the answer without the model. Keep examples of independent judgment and verification. Practice the skill an automated draft would otherwise replace.", href: "#doctor", action: "topicsImprovePrompt" }
      ],
      sources: [
        { label: "Brynjolfsson, Li & Raymond, NBER working paper 31161 (2023 revision)", url: "https://www.nber.org/papers/w31161" },
        { label: "METR, randomized developer study (July 2025)", url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/" },
        { label: "METR, experiment redesign and selection limitations (February 2026)", url: "https://metr.org/blog/2026-02-24-uplift-update/" }
      ] },
    { id: "bubble", tag: "Economy", tagKey: "topicsTagEconomy", title: "The AI investment question",
      question: "What would show that the infrastructure build-out is paying off?",
      summary: "Real demand and overinvestment can coexist. The question is whether useful, paid workloads produce enough cash over the equipment's lifetime. Spending, cloud revenue and future contracts cover different scopes; displaying them together does not calculate AI profitability.",
      numbers: [
        { v: ">$400B", label: "2025 capital expenditure across five large technology companies in the IEA analysis; not AI-only", kind: "estimate", period: "2025", source: 0 },
        { v: "$59.3B", label: "Microsoft Cloud revenue in FY2026 Q4, including products beyond AI", kind: "reported", period: "Quarter ended June 2026", source: 1 }
      ],
      evidenceNote: "Annual multi-company expenditure and one company's quarterly cloud revenue are not a return-on-investment ratio. Microsoft Cloud includes established software services; IEA's 2026 spending growth is an estimate, not completed expenditure.",
      sideA: "If usage disappoints, depreciation, financing and energy commitments remain. Faster chips can make existing capacity less competitive. IEA's 2026 analysis says capital-market financing is increasingly important, so the earlier claim that this is all funded from cash is too broad.",
      sideB: "Microsoft's cloud growth demonstrates a substantial operating business, though it does not isolate AI profit. Infrastructure can serve several products, and sustained demand can turn constrained capacity into productive assets. The question is the price and timing of those returns.",
      status: "The disclosures establish substantial investment and revenue, not a verdict on every valuation. WhichAI does not predict a crash, market returns or a break-even date.",
      uncertainty: "AI revenue and costs are not consistently disclosed as separate audited segments. Contracts are not cash collected, and cloud growth cannot all be attributed to AI.",
      watch: ["Recurring paid usage and renewals after pilots or promotions", "Cash after capital spending, financing and depreciation assumptions", "Capacity utilization and customer concentration over consistent reporting periods"],
      decisions: [
        { id: "use", label: "Choose a subscription", text: "List repeated tasks and compare useful outputs from free and paid options. Count correction time. Review the subscription against real use after a month; industry growth does not establish personal value.", href: "#stack", action: "topicsReviewStack" },
        { id: "team", label: "Assess an AI project", text: "Define a business outcome, baseline and fixed pilot budget. Include integration, review, retraining and exit costs. Expand when measured benefits survive these costs, not merely when a demo looks impressive.", href: "#market", action: "topicsSeeMarket" },
        { id: "read", label: "Read an investment headline", text: "Check the original filing, period and whether the figure covers AI or the whole company. Separate actual cash spending from guidance and contracts. This checklist interrogates claims; it is not a recommendation to buy or sell securities." }
      ],
      sources: [
        { label: "IEA, technology investment and financing analysis (2026)", url: "https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary" },
        { label: "Microsoft, FY2026 Q4 earnings release (July 2026)", url: "https://www.microsoft.com/en-us/investor/earnings/fy-2026-q4/press-release-webcast" }
      ] },
    { id: "copyright", tag: "Law", tagKey: "topicsTagLaw", title: "Copyright and training data",
      question: "What changes when you train, retrieve or publish with AI?",
      summary: "Data acquisition, model training, retrieved passages and generated outputs raise distinct questions. Access to a page is not automatically a license to reproduce it. A training dispute also does not determine ownership or infringement for every output you publish.",
      numbers: [
        { v: "3 report parts", label: "US Copyright Office studies address replicas, output copyrightability and training; Part 3 is pre-publication", kind: "guidance", period: "2024-2025 publications", source: 0 },
        { v: "4 factors", label: "US fair-use analysis considers purpose, nature, amount and market effect together", kind: "guidance", period: "US law; Part 3 analysis, May 2025", source: 1 }
      ],
      evidenceNote: "The Copyright Office report is policy analysis, not a court judgment or blanket license. Its page still labels Part 3 pre-publication at this review. Fair use is a US doctrine; local exceptions and contracts differ.",
      sideA: "Training and outputs can affect creators' licensing and sales markets. Where acquisition was unlawful or outputs substitute for protected expression, 'the model learned patterns' is not a complete answer. Creators need practical ways to discover use and negotiate permissions.",
      sideB: "Some uses support research, analysis or other transformative purposes. Individual permission for every input can create costly barriers, especially for smaller developers. The Copyright Office examines varying uses and licensing mechanisms rather than treating all training alike.",
      status: "The answer depends on jurisdiction, material, acquisition, use and output. This page explains questions to investigate; it does not clear a dataset or publication for legal use.",
      uncertainty: "Check the license for the intended use. No obvious verbatim copying does not mean a model is legally cleared, and a public URL does not establish that its contents are public domain.",
      watch: ["Published judgments and their precise factual scope, including appeals", "Training-data disclosures, license terms and workable opt-out mechanisms", "Evidence of reproduced expression or market substitution in a particular output"],
      decisions: [
        { id: "publish", label: "Publish an AI-assisted work", text: "Keep records of inputs and substantive creative edits. Check quotations, images, licenses and suspiciously familiar passages. For a commercially significant release, have the material and jurisdiction assessed by a qualified professional.", href: "#doctor", action: "topicsImprovePrompt" },
        { id: "data", label: "Build a dataset or RAG tool", text: "Inventory each source, permission, license and retention rule. Separate permission to retrieve from permission to redistribute. Use licensed or public-domain material where suitable and keep provenance available for review." },
        { id: "create", label: "Understand my rights as a creator", text: "Preserve dated originals and agreements, identify the specific use of concern, and read the relevant terms. Seek advice on the facts before assuming that any training or stylistic resemblance has the same legal result." }
      ],
      sources: [
        { label: "US Copyright Office, AI report series and publication status", url: "https://www.copyright.gov/ai/" },
        { label: "US Copyright Office, Part 3: Generative AI Training (May 2025, pre-publication)", url: "https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-3-Generative-AI-Training-Report-Pre-Publication-Version.pdf" }
      ] },
    { id: "regulation", tag: "Policy", tagKey: "topicsTagPolicy", title: "Safety and regulation",
      question: "How do rules become safer systems in practice?",
      summary: "A risk framework, a voluntary code and binding law do different jobs. Useful governance connects a use case to evaluations, accountable people and a response to failure. Neither a compliance badge nor a benchmark score proves that an application is safe.",
      numbers: [
        { v: "2 Aug 2026", label: "General EU AI Act application date, with exceptions and staged obligations", kind: "guidance", period: "Commission overview updated August 2026", source: 0 },
        { v: "2027 / 2028", label: "Revised high-risk dates: 2 December 2027 for listed areas; 2 August 2028 for regulated-product systems", kind: "guidance", period: "AI Omnibus timeline described by the Commission", source: 0 }
      ],
      evidenceNote: "GPAI obligations began in August 2025; prohibited practices and AI literacy had earlier dates. The Commission reports the AI Omnibus entered into force in July 2026. Check the official timeline and use case rather than applying one deadline to every system.",
      sideA: "Without accountability, incident handling and external scrutiny, written safety promises are hard to enforce. Harm can arise from connections to data and tools even when a base model passes evaluations. Duties need to reach the application and affected people.",
      sideB: "Proportionate requirements can focus effort on higher-risk uses. NIST's voluntary framework organizes work without treating every chatbot as a critical system. Clear guidance and reusable evaluation evidence can reduce duplicated effort for smaller teams.",
      status: "The Commission overview now includes enacted simplification and later high-risk dates. NIST says AI RMF 1.0 is being revised. Versions, dates and jurisdiction are part of the evidence.",
      uncertainty: "Obligations depend on role, sector, jurisdiction and intended use. A voluntary framework does not establish legal compliance; a base-model evaluation does not certify all downstream uses.",
      watch: ["Enforcement and incident reports showing how obligations are applied", "Evaluations covering the workflow, users and tool permissions", "Current legal text and guidance, distinguishing drafts from adopted rules"],
      decisions: [
        { id: "use", label: "Use an AI tool responsibly", text: "Decide what the system may do and what requires human review. Verify high-impact outputs against dependable sources. Limit permissions and make it easy for a person to question or correct a result.", href: "#find", action: "topicsFindAI" },
        { id: "build", label: "Prepare an AI application", text: "Document the use case, users, data, failure modes and responsible owner. Map them to current requirements for your role and jurisdiction, then test the whole workflow. Obtain professional advice where legal classification matters." },
        { id: "evaluate", label: "Evaluate a safety claim", text: "Ask which version was tested, on what tasks, with what failure threshold and by whom. Look for limitations and an incident process. Refusal rates alone do not measure reliability, fairness or protection from harmful actions.", href: "#compare", action: "topicsCompareModels" }
      ],
      sources: [
        { label: "European Commission, AI Act and current application timeline", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" },
        { label: "NIST, AI Risk Management Framework and revision status", url: "https://www.nist.gov/itl/ai-risk-management-framework" }
      ] },
    { id: "open-vs-closed", tag: "Ecosystem", tagKey: "topicsTagEcosystem", title: "Open weights vs closed models",
      question: "What control do you gain, and what responsibility comes with it?",
      summary: "Downloadable weights enable local operation and modification. They do not automatically provide training data, unrestricted permissions, affordable hardware or a secure application. Hosted models trade some control for managed infrastructure; the comparison starts with your requirements.",
      numbers: [
        { v: "4 freedoms", label: "OSI's definition covers use, study, modification and sharing, with the needed components", kind: "definition", period: "Open Source AI Definition 1.0", source: 0 },
        { v: "2024 report", label: "NTIA recommended monitoring marginal risks and benefits instead of immediate blanket restrictions", kind: "guidance", period: "Historical recommendation, July 2024", source: 1 }
      ],
      evidenceNote: "The NTIA report is a dated recommendation, not current US law. Open weights and OSI-compliant open-source AI are different claims. This debate does not invent a universal capability gap between open and closed systems.",
      sideA: "Released weights can be copied and modified beyond the provider's control. Application safeguards matter, but a provider cannot revoke every local copy after finding a problem. Evaluation should examine the extra harmful capability access adds over existing alternatives.",
      sideB: "Independent access supports reproducibility, adaptation, competition and use without a model API. These benefits can matter even when a hosted competitor scores higher. Openness aids scrutiny, but the license and released components determine what is possible.",
      status: "Compare the release, license, hardware and deployment. A closed API can be practical; an open release can be valuable without leading on every task.",
      uncertainty: "Local inference keeps data local only if the surrounding application, logs and integrations do too. Download access does not establish an OSI license, full reproducibility or harmlessness.",
      watch: ["Actual downloadable artifacts, license terms and restrictions", "Independent evaluations on relevant tasks and the chosen serving setup", "Operating cost, update responsibility and data flows in the application"],
      decisions: [
        { id: "privacy", label: "Keep sensitive data local", text: "Trace retrieval, telemetry, logs and extensions. Verify that the model fits your hardware and the application works offline as intended. Weights alone do not provide an end-to-end privacy guarantee.", href: "#ranking", action: "topicsExploreModels" },
        { id: "build", label: "Build a product", text: "Compare license permissions, quality, serving cost and maintenance. Plan an evaluation set and an exit route from the provider or serving stack. Test the exact model and configuration you will ship.", href: "#compare", action: "topicsCompareModels" },
        { id: "learn", label: "Research or learn", text: "Check which weights, code and data information are released and whether the experiment is reproducible. Record versions and limitations. Downloads enable scrutiny; they do not establish that scrutiny has already occurred.", href: "#glossary", action: "topicsLearnTerms" }
      ],
      sources: [
        { label: "Open Source Initiative, Open Source AI Definition 1.0", url: "https://opensource.org/ai/open-source-ai-definition" },
        { label: "NTIA, open model weights report (July 2024)", url: "https://www.ntia.gov/programs-and-initiatives/artificial-intelligence/open-model-weights-report" }
      ] }
  ];
  var root = null, deps = null;
  var state = { query: "", category: "all", active: null, decisions: {} };
  var COMPLY = { url: "https://complyai.wiki", topics: { copyright: 1, regulation: 1 } };
  var FALLBACK = {
    topicsReviewed: "Reviewed", topicsCount: "debates", topicsEvidence: "Evidence, with context",
    topicsUncertainty: "What remains uncertain", topicsWatch: "What would change the picture",
    topicsDecision: "Choose your next step", topicsChoose: "Select your situation",
    topicsDecisionNote: "Practical editorial guidance. Your selection stays in this page; no AI call or account is needed.",
    topicsReadSource: "Read source", topicsReadPage: "Open reading page",
    topicsReviewNote: "Source review and model-feed refresh are separate. Each figure retains its original period; these summaries are not live news.",
    topicsEstimate: "Estimate", topicsProjection: "Projection", topicsResearch: "Study result", topicsReported: "Company disclosure",
    topicsGuidance: "Policy or guidance", topicsDefinition: "Definition",
    topicsCompareModels: "Compare models", topicsFindAI: "Find the right AI", topicsSeeMarket: "See what AI costs",
    topicsImprovePrompt: "Improve a prompt", topicsReviewStack: "Review my AI stack", topicsExploreModels: "Explore models", topicsLearnTerms: "Explore the glossary",
    topicsCaseA: "The concern", topicsCaseB: "The counter-view", topicsStatus: "Where it stands",
    topicsDisclaimer: "Curated summaries of public reporting and research. Not investment, career or legal advice.",
    complyTitle: "Your own obligations", complyText: "Check which EU AI Act and GDPR duties apply to your organisation, step by step, on ComplyAI.", complyGo: "Open ComplyAI.wiki"
  };
  function tr(key) { var value = deps && deps.T ? deps.T(key) : key; return value && value !== key ? value : FALLBACK[key] || key; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function content(tag, cls, text) { var node = el(tag, cls, text); node.lang = "en"; node.dir = "ltr"; return node; }
  function kindLabel(kind) { return tr("topics" + kind.charAt(0).toUpperCase() + kind.slice(1)); }
  function tagLabel(t) { return tr(t.tagKey) === t.tagKey ? t.tag : tr(t.tagKey); }
  function sourceLink(source, label) {
    var a = el("a", "topic-source-link", label || source.label);
    if (/^https:\/\//.test(source.url)) a.href = source.url;
    a.target = "_blank"; a.rel = "noopener noreferrer"; return a;
  }
  function filterTopics(query, category) {
    var words = String(query || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    return TOPICS.filter(function (topic) {
      if (category && category !== "all" && topic.id !== category) return false;
      var text = [topic.title, topic.tag, topic.question, topic.summary, topic.sideA, topic.sideB, topic.uncertainty, topic.evidenceNote].concat(topic.watch, topic.numbers.map(function (n) { return n.label; })).join(" ").toLowerCase();
      return words.every(function (word) { return text.indexOf(word) !== -1; });
    });
  }
  function getDecision(topicId, decisionId) {
    var topic = TOPICS.find(function (t) { return t.id === topicId; });
    return topic ? topic.decisions.find(function (d) { return d.id === decisionId; }) || null : null;
  }

  /* ---------- the deck: six cards, one open ---------- */

  function deckCard(t, i) {
    var b = el("button", "deb-card" + (state.active === t.id ? " is-on" : ""));
    b.type = "button";
    b.id = "deb-tab-" + t.id;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", state.active === t.id ? "true" : "false");
    b.setAttribute("aria-controls", "deb-panel");
    b.tabIndex = state.active === t.id ? 0 : -1;
    b.style.setProperty("--i", String(i));
    b.appendChild(el("span", "chip deb-tag deb-tag-" + t.id, tagLabel(t)));
    var num = el("span", "deb-num");
    num.appendChild(content("strong", null, t.numbers[0].v));
    num.appendChild(content("small", null, t.numbers[0].label));
    b.appendChild(num);
    b.appendChild(content("span", "deb-card-title", t.title));
    b.appendChild(content("span", "deb-card-q", t.question));
    b.addEventListener("click", function () { open(t.id, true); });
    return b;
  }

  function onDeckKey(e) {
    var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!keys[e.key]) return;
    e.preventDefault();
    var i = TOPICS.findIndex(function (t) { return t.id === state.active; });
    var next = TOPICS[(i + keys[e.key] + TOPICS.length) % TOPICS.length];
    open(next.id, true);
    var tab = document.getElementById("deb-tab-" + next.id);
    if (tab) tab.focus();
  }

  /* ---------- one debate, both sides face to face ---------- */

  function panel(t) {
    var p = el("div", "deb-panel");
    p.id = "deb-panel";
    p.setAttribute("role", "tabpanel");
    p.setAttribute("aria-labelledby", "deb-tab-" + t.id);
    var head = el("div", "deb-head");
    head.appendChild(el("span", "chip deb-tag deb-tag-" + t.id, tagLabel(t)));
    head.appendChild(content("h3", "deb-title", t.title));
    head.appendChild(content("p", "deb-q", t.question));
    p.appendChild(head);
    p.appendChild(content("p", "deb-summary", t.summary));

    p.appendChild(el("h4", "deb-sub", tr("topicsEvidence")));
    var nums = el("div", "topic-nums");
    t.numbers.forEach(function (n) {
      var card = el("div", "topic-num");
      card.appendChild(el("span", "topic-evidence-kind chip", kindLabel(n.kind)));
      card.appendChild(content("strong", null, n.v));
      card.appendChild(content("span", null, n.label));
      card.appendChild(content("small", "router-meta", n.period));
      card.appendChild(sourceLink(t.sources[n.source], tr("topicsReadSource")));
      nums.appendChild(card);
    });
    p.appendChild(nums);
    p.appendChild(content("p", "topic-evidence-note", t.evidenceNote));

    var sides = el("div", "deb-sides");
    [["topicsCaseA", t.sideA, "a"], ["topicsCaseB", t.sideB, "b"]].forEach(function (side, k) {
      if (k === 1) sides.appendChild(el("span", "deb-vs", "vs"));
      var node = el("section", "topic-side deb-side deb-side-" + side[2]);
      node.appendChild(el("h4", "deb-side-title", tr(side[0])));
      node.appendChild(content("p", "topic-side-text", side[1]));
      sides.appendChild(node);
    });
    p.appendChild(sides);

    var stand = el("div", "deb-status");
    stand.appendChild(el("h4", "deb-sub", tr("topicsStatus")));
    stand.appendChild(content("p", "topic-status", t.status));
    p.appendChild(stand);

    var grid = el("div", "topic-insight-grid");
    var unknown = el("section", "topic-insight");
    unknown.appendChild(el("h4", "deb-sub", tr("topicsUncertainty")));
    unknown.appendChild(content("p", null, t.uncertainty));
    grid.appendChild(unknown);
    var watch = el("section", "topic-insight");
    watch.appendChild(el("h4", "deb-sub", tr("topicsWatch")));
    var ul = el("ul");
    t.watch.forEach(function (item) { ul.appendChild(content("li", null, item)); });
    watch.appendChild(ul);
    grid.appendChild(watch);
    p.appendChild(grid);

    var decision = el("section", "topic-decision");
    var selectId = "topic-decision-" + t.id;
    var label = el("label", "deb-sub", tr("topicsDecision"));
    label.htmlFor = selectId;
    decision.appendChild(label);
    var select = el("select");
    select.id = selectId;
    var ph = el("option", null, tr("topicsChoose"));
    ph.value = "";
    select.appendChild(ph);
    t.decisions.forEach(function (item) { var o = content("option", null, item.label); o.value = item.id; select.appendChild(o); });
    select.value = state.decisions[t.id] || "";
    decision.appendChild(select);
    var result = el("div", "topic-decision-result");
    result.id = selectId + "-result";
    result.setAttribute("aria-live", "polite");
    select.setAttribute("aria-controls", result.id);
    function show() {
      state.decisions[t.id] = select.value;
      result.replaceChildren();
      var choice = getDecision(t.id, select.value);
      result.hidden = !choice;
      if (!choice) return;
      result.appendChild(content("p", null, choice.text));
      if (choice.href) { var a = el("a", "btn-ghost", tr(choice.action) + " →"); a.href = choice.href; result.appendChild(a); }
    }
    select.addEventListener("change", show);
    show();
    decision.appendChild(result);
    decision.appendChild(el("p", "router-meta", tr("topicsDecisionNote")));
    p.appendChild(decision);

    if (COMPLY.topics[t.id]) {
      var cp = el("a", "deb-comply");
      cp.href = COMPLY.url;
      cp.target = "_blank";
      cp.rel = "noopener";
      cp.appendChild(el("strong", null, tr("complyTitle")));
      cp.appendChild(el("span", null, tr("complyText")));
      cp.appendChild(el("span", "deb-comply-go", tr("complyGo") + " ↗"));
      p.appendChild(cp);
    }

    var srcs = el("p", "router-meta topic-srcs");
    srcs.appendChild(document.createTextNode(tr("sourcesLabel") + " "));
    t.sources.forEach(function (item, i) { if (i) srcs.appendChild(document.createTextNode(" · ")); var a = sourceLink(item); a.lang = "en"; srcs.appendChild(a); });
    p.appendChild(srcs);
    var actions = el("div", "topic-actions");
    var permalink = el("a", "btn-link", tr("topicsReadPage") + " ↗");
    permalink.href = "/topics/" + t.id + ".html";
    actions.appendChild(permalink);
    p.appendChild(actions);
    return p;
  }

  function open(id, animate) {
    if (!TOPICS.some(function (t) { return t.id === id; })) return;
    state.active = id;
    var deck = root && root.querySelector(".deb-deck");
    if (deck) Array.prototype.forEach.call(deck.children, function (b) {
      var on = b.id === "deb-tab-" + id;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    var old = root && root.querySelector(".deb-panel");
    var t = TOPICS.find(function (x) { return x.id === id; });
    var fresh = panel(t);
    if (old) old.replaceWith(fresh); else if (root) root.insertBefore(fresh, root.querySelector(".topics-disclaimer"));
    if (animate) { fresh.classList.add("is-entering"); requestAnimationFrame(function () { requestAnimationFrame(function () { fresh.classList.remove("is-entering"); }); }); }
    if (window.WhichAIMotion) window.WhichAIMotion.refresh();
  }

  function render() {
    if (!root) return;
    if (!state.active) state.active = TOPICS[0].id;
    root.replaceChildren();
    var meta = el("p", "deb-meta", tr("topicsReviewed") + " " + UPDATED + " · " + TOPICS.length + " " + tr("topicsCount") + " · " + tr("topicsReviewNote"));
    root.appendChild(meta);
    var deck = el("div", "deb-deck");
    deck.setAttribute("role", "tablist");
    deck.setAttribute("aria-label", tr("topicsTitle"));
    TOPICS.forEach(function (t, i) { deck.appendChild(deckCard(t, i)); });
    deck.addEventListener("keydown", onDeckKey);
    root.appendChild(deck);
    root.appendChild(el("p", "router-meta topics-disclaimer", tr("topicsDisclaimer")));
    open(state.active, false);
  }

  var Topics = { TOPICS: TOPICS, UPDATED: UPDATED, filter: filterTopics, getDecision: getDecision, COMPLY: COMPLY,
    init: function (rootEl, dependencies) { root = rootEl; deps = dependencies; render(); },
    rerender: function () { if (root && deps) render(); },
    open: function (id) { if (root) open(id, true); else state.active = id; }
  };
  var g = typeof window !== "undefined" ? window : globalThis; g.WhichAITopics = Topics;
  if (typeof module !== "undefined" && module.exports) module.exports = Topics;
})();
