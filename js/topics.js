/*
 * WhichAI - AI Debates: the big topics, summarized honestly (v0.29.0)
 * Curated summaries of the most discussed AI-and-society questions, with
 * numbers people actually cite and both sides of each argument. English
 * content by policy; every claim links a source. Updated with data refreshes.
 * This is a reading section, not advice (investment, career or legal).
 */
(function () {
  "use strict";

  var UPDATED = "2026-07-30";

  var TOPICS = [
    { id: "energy", tag: "Environment", title: "Energy, water and data centers",
      question: "Is AI's footprint a real problem or a manageable cost?",
      summary: "Training and running AI needs vast data centers, and their electricity and water use has become the loudest environmental debate in tech. The growth is real and fast; so are the efficiency responses. Both things are true at once, which is why the argument does not end.",
      numbers: [
        { v: "415 → ~945 TWh", label: "global data-center electricity, 2024 to 2030 (IEA projection)" },
        { v: "4.2-6.6 bn m³", label: "projected global AI water withdrawal by 2027 (UC Riverside study)" },
        { v: "~5th largest 'country'", label: "where data centers would rank by power use on aggressive 2026 estimates" }
      ],
      sideA: "The concern: demand is doubling in six years, grids and local water basins feel it first, and efficiency gains keep getting eaten by scale (Jevons paradox). Communities near new builds report higher bills and water stress.",
      sideB: "The counter-view: data centers are still a single-digit share of global electricity; the industry is moving to closed-loop zero-water cooling (Microsoft) and 120% water-replenish pledges (Google), and AI itself optimizes grids and materials science.",
      status: "Where it stands (July 2026): disclosure is improving, regulation is starting to ask for per-site numbers, and the honest answer is that growth is currently outpacing efficiency.",
      sources: [
        { label: "IEA, Energy and AI", url: "https://www.iea.org/reports/energy-and-ai" },
        { label: "Making AI Less Thirsty (UC Riverside, arXiv)", url: "https://arxiv.org/abs/2304.03271" },
        { label: "Consumer Reports on data centers", url: "https://www.consumerreports.org/data-centers/ai-data-centers-impact-on-electric-bills-water-and-more-a1040338678/" },
        { label: "Brookings on AI energy policy", url: "https://www.brookings.edu/articles/global-energy-demands-within-the-ai-regulatory-landscape/" }
      ] },

    { id: "jobs", tag: "Work", title: "Jobs: displacement vs augmentation",
      question: "Is AI taking jobs, changing them, or both?",
      summary: "2026 is the first year with real displacement numbers instead of surveys. They are smaller than the scariest headlines and bigger than zero, and they hit entry-level roles hardest. Meanwhile new AI-adjacent roles are growing, just not for the same people.",
      numbers: [
        { v: "~16,000/month", label: "net US job losses attributed to AI (Goldman Sachs, April 2026: 25k displaced, 9k added)" },
        { v: "-20% since 2024", label: "employment for 22-25 year old software developers, while 30+ kept growing (Stanford HAI AI Index)" },
        { v: "92M / 170M", label: "roles displaced vs created globally by 2030 (WEF Future of Jobs projection)" }
      ],
      sideA: "The concern: the entry-level ladder is being pulled up. Junior coding, clerical and support tasks automate first, so the people displaced are rarely the ones hired for the new roles.",
      sideB: "The counter-view: net global projections stay positive, most firms report augmentation rather than replacement, and every previous automation wave created categories nobody predicted.",
      status: "Where it stands (July 2026): measurable but concentrated displacement; the policy debate has shifted from 'will it happen' to reskilling and who pays for it.",
      sources: [
        { label: "SHRM, AI and job displacement risk (2026 report)", url: "https://www.shrm.org/topics-tools/research/automation-generative-ai-and-job-displacement-risk-in-u-s--employment/2026-full-report" },
        { label: "Stanford HAI AI Index", url: "https://hai.stanford.edu/ai-index" },
        { label: "WEF Future of Jobs Report", url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/" }
      ] },

    { id: "bubble", tag: "Economy", title: "The AI bubble question",
      question: "Is the AI build-out a bubble or the biggest infrastructure cycle ever?",
      summary: "Big Tech capex is heading past $600B a year while measured AI revenue is an order of magnitude smaller. Whether that gap is a bubble or a rational bet on future demand is the sharpest disagreement in finance right now, and serious people sit on both sides.",
      numbers: [
        { v: ">$600B in 2026", label: "US Big Tech capex, about 23% of revenue, double pre-ChatGPT intensity" },
        { v: "$765B → $1.6T", label: "Goldman Sachs modeled annual AI capex, 2026 to 2031" },
        { v: "~$600B vs ~tens of B", label: "annual AI revenue needed to justify the spend vs what is measurable today" }
      ],
      sideA: "The concern: revenue is not catching up, GPU fleets depreciate fast, valuations price in perfection, and AI capex is itself propping up GDP, so a slowdown would hit twice.",
      sideB: "The counter-view: unlike 2000, the spenders are the most profitable companies in history using cash, not debt; compute is a scarce productive asset; and infrastructure overbuild historically leaves useful capacity even when investors lose.",
      status: "Where it stands (July 2026): capex keeps accelerating, analysts keep publishing duelling frameworks, and nobody has the counterfactual. Not investment advice.",
      sources: [
        { label: "Goldman Sachs, Tracking Trillions", url: "https://www.goldmansachs.com/insights/articles/tracking-trillions-the-assumptions-shaping-scale-of-the-ai-build-out" },
        { label: "Fidelity, five bubble signs", url: "https://www.fidelity.com/learning-center/trading-investing/ai-bubble" },
        { label: "Boom, Bubble, or Buildout? (arXiv multi-method study)", url: "https://arxiv.org/abs/2606.01575" }
      ] },

    { id: "copyright", tag: "Law", title: "Copyright and training data",
      question: "Can models train on the open web without paying?",
      summary: "Publishers, authors and artists say training on their work without license is mass infringement; labs argue fair use and point to transformation. Courts are deciding case by case, while licensing deals grow in parallel: the market may settle it before the law does.",
      numbers: [
        { v: "Dozens of suits", label: "active US training-data cases, led by The New York Times v. OpenAI and Microsoft" },
        { v: "2 reports", label: "US Copyright Office studies on AI, digital replicas and copyrightability" }
      ],
      sideA: "The concern: creators' work built these models and they see no compensation; opt-outs came late and are hard to verify; style imitation hits working artists hardest.",
      sideB: "The counter-view: training is argued to be transformative like search indexing was; blocking it in one country just moves it elsewhere; and licensing markets (news, stock media, music) are already forming.",
      status: "Where it stands (July 2026): no final precedent; a mixed pattern of settlements, licensing deals and ongoing suits. Expect years, not months.",
      sources: [
        { label: "NYT lawsuit coverage (NYT)", url: "https://www.nytimes.com/2023/12/27/business/media/new-york-times-open-ai-microsoft-lawsuit.html" },
        { label: "US Copyright Office, AI studies", url: "https://www.copyright.gov/ai/" }
      ] },

    { id: "regulation", tag: "Policy", title: "Safety and regulation",
      question: "Who sets the rules, and are they working?",
      summary: "The EU AI Act is now the world's most complete AI law, phasing in obligations for general-purpose models. The US remains a patchwork of state laws and voluntary frontier-lab commitments. The debate is whether rules this early protect people or just entrench incumbents.",
      numbers: [
        { v: "Aug 2025 →", label: "EU AI Act obligations for general-purpose AI models phasing in" },
        { v: "risk tiers", label: "the Act's model: banned uses, high-risk systems, transparency duties for the rest" }
      ],
      sideA: "The concern: voluntary safety frameworks are unenforceable, incidents are reported by the same labs being judged, and capability growth is outpacing evaluation science.",
      sideB: "The counter-view: heavy early rules freeze the market for small players (compliance is a fixed cost), the worst harms are already illegal under existing law, and the EU risks regulating an industry it does not host.",
      status: "Where it stands (July 2026): compliance deadlines are becoming real engineering work; every major lab now publishes a frontier-safety framework; enforcement remains the open question.",
      sources: [
        { label: "European Commission, AI Act framework", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" },
        { label: "AI Act explorer", url: "https://artificialintelligenceact.eu/" }
      ] },

    { id: "open-vs-closed", tag: "Ecosystem", title: "Open weights vs closed models",
      question: "Should frontier capability be downloadable?",
      summary: "July 2026 made this concrete: Kimi K3's 2.8T-parameter weights and Thinking Machines' Inkling shipped as open downloads while the top two closed models sit barely ahead. Open advocates call it safety-through-scrutiny and sovereignty; critics call it irreversible proliferation.",
      numbers: [
        { v: "2.8T params", label: "Kimi K3, the largest open-weight release ever (weights on Hugging Face, July 27)" },
        { v: "~3-6 points", label: "AA-index gap between the best open and best closed models on the July snapshot" }
      ],
      sideA: "The concern: once weights ship, misuse controls are gone forever; fine-tuning strips safety training cheaply; the frontier gap is now months, not years.",
      sideB: "The counter-view: open weights enable independent audit, local privacy, national sovereignty and price competition; concentrated closed power is its own risk; most documented misuse still uses closed apps.",
      status: "Where it stands (July 2026): the gap keeps shrinking, both US and Chinese labs now release open frontier-class weights, and policy has no settled answer.",
      sources: [
        { label: "Kimi K3 tech blog", url: "https://www.kimi.com/blog/kimi-k3" },
        { label: "Thinking Machines, Inkling", url: "https://thinkingmachines.ai/news/introducing-inkling/" },
        { label: "VentureBeat on the K3 release", url: "https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems" }
      ] }
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var deps = null;
  var root = null;

  function render() {
    if (!root) return;
    root.innerHTML = "";
    var head = el("div", "guide-head");
    head.appendChild(el("h1", null, deps.T("topicsTitle")));
    head.appendChild(el("p", null, deps.T("topicsSub")));
    head.appendChild(el("p", "guide-updated", "Updated " + UPDATED + " · " + TOPICS.length + " debates"));
    root.appendChild(head);

    var list = el("div", "topics-list");
    TOPICS.forEach(function (t) {
      var d = document.createElement("details");
      d.className = "faq topic-item";
      var s = document.createElement("summary");
      var sWrap = el("span", "topic-sum");
      var chip = el("span", "chip chip-label topic-tag", t.tag);
      sWrap.appendChild(chip);
      var tt = el("span", "topic-title", t.title);
      sWrap.appendChild(tt);
      var q = el("span", "topic-q", t.question);
      sWrap.appendChild(q);
      s.appendChild(sWrap);
      d.appendChild(s);

      var body = el("div", "topic-body");
      body.appendChild(el("p", "topic-summary", t.summary));

      if (t.numbers && t.numbers.length) {
        body.appendChild(el("p", "finder-block-title", deps.T("topicsNumbers")));
        var nums = el("div", "topic-nums");
        t.numbers.forEach(function (n) {
          var pill = el("div", "topic-num");
          pill.appendChild(el("strong", null, n.v));
          pill.appendChild(el("span", null, n.label));
          nums.appendChild(pill);
        });
        body.appendChild(nums);
      }

      var sides = el("div", "topic-sides");
      var sa = el("div", "topic-side");
      sa.appendChild(el("p", "finder-block-title", deps.T("topicsCaseA")));
      sa.appendChild(el("p", "topic-side-text", t.sideA));
      var sb = el("div", "topic-side");
      sb.appendChild(el("p", "finder-block-title", deps.T("topicsCaseB")));
      sb.appendChild(el("p", "topic-side-text", t.sideB));
      sides.appendChild(sa);
      sides.appendChild(sb);
      body.appendChild(sides);

      body.appendChild(el("p", "topic-status", t.status));

      var srcP = el("p", "router-meta topic-srcs");
      srcP.appendChild(document.createTextNode(deps.T("sourcesLabel") + " "));
      t.sources.forEach(function (srcItem, i) {
        if (i) srcP.appendChild(document.createTextNode(" · "));
        var a = document.createElement("a");
        a.href = srcItem.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = srcItem.label;
        srcP.appendChild(a);
      });
      body.appendChild(srcP);

      d.appendChild(body);
      list.appendChild(d);
    });
    root.appendChild(list);
    root.appendChild(el("p", "router-meta topics-disclaimer", deps.T("topicsDisclaimer")));
  }

  var Topics = {
    TOPICS: TOPICS,
    UPDATED: UPDATED,
    init: function (rootEl, dependencies) { root = rootEl; deps = dependencies; render(); },
    rerender: function () { if (root && deps) render(); }
  };

  var g = typeof window !== "undefined" ? window : globalThis;
  g.WhichAITopics = Topics;
  if (typeof module !== "undefined" && module.exports) module.exports = Topics;
})();
