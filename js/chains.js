/*
 * PromptCompass - Chain templates (Phase 4, v0.9.0)
 * Multi-step workflow blueprints per task type. Each step's {goal} placeholder
 * is filled with the user's goal; the previous step's output is injected as context.
 */
(function () {
  "use strict";

  var TEMPLATES = {
    writing: [
      { id: "outline", name: "Outline & angle", description: "Define the sharpest angle and the structure before writing anything.", instruction: "Create a detailed outline for the following writing goal: \"{goal}\". Propose the sharpest angle, a structure with sections, and the key points for each section. Do not write the full text yet." },
      { id: "draft", name: "Full draft", description: "Write the complete first draft following the outline.", instruction: "Write the full draft for this goal: \"{goal}\". Follow the outline from the previous step closely." },
      { id: "revise", name: "Revise & tighten", description: "Polish the draft into the final version.", instruction: "Review and improve the draft from the previous step for this goal: \"{goal}\". Tighten wording, fix flow and repetition, strengthen the opening and closing. Return the final version, then list the 3 most important changes you made." }
    ],
    coding: [
      { id: "spec", name: "Spec & design", description: "Agree on inputs, outputs, edge cases and approach before coding.", instruction: "Write a short technical specification for this goal: \"{goal}\". Define inputs and outputs, edge cases, the chosen approach and the code structure. No code yet." },
      { id: "implement", name: "Implementation", description: "Write the complete, runnable code following the spec.", instruction: "Implement the solution for this goal: \"{goal}\", following the specification from the previous step. Deliver complete, runnable code with no placeholders." },
      { id: "review", name: "Review & tests", description: "Hunt bugs, add tests, deliver the corrected final version.", instruction: "Review the code from the previous step for this goal: \"{goal}\". Point out bugs, unhandled edge cases and improvements, then provide tests (or a test plan) and the corrected final version of the code." }
    ],
    analysis: [
      { id: "frame", name: "Frame the analysis", description: "Define questions, data, assumptions and method first.", instruction: "Define how to analyze this goal: \"{goal}\". List the key questions, the data needed, the assumptions and the method. No analysis yet." },
      { id: "analyze", name: "Run the analysis", description: "Perform the analysis, showing the reasoning.", instruction: "Perform the analysis for this goal: \"{goal}\", following the framing from the previous step. Show the reasoning behind each conclusion and flag weak evidence." },
      { id: "summarize", name: "Summary & recommendations", description: "Turn the analysis into findings and concrete recommendations.", instruction: "Turn the analysis from the previous step into an executive summary for this goal: \"{goal}\": key findings, limitations, and concrete recommendations." }
    ],
    research: [
      { id: "questions", name: "Research questions", description: "Break the topic into the questions that matter.", instruction: "Break this research goal into its key questions: \"{goal}\". For each question, note what a good answer needs and where the information likely lives." },
      { id: "findings", name: "Findings", description: "Answer each question, separating facts from interpretation.", instruction: "Answer the research questions from the previous step for this goal: \"{goal}\". Organize findings by theme and distinguish established facts from interpretation." },
      { id: "synthesis", name: "Synthesis", description: "Condense everything into a final brief.", instruction: "Synthesize the findings from the previous step into a final brief for this goal: \"{goal}\": what we know, what is uncertain, and the open questions worth pursuing." }
    ],
    brainstorming: [
      { id: "diverge", name: "Diverge", description: "Volume first: many ideas, zero filtering.", instruction: "Generate at least 15 distinct ideas for this goal: \"{goal}\". Mix safe, expected ideas with bold, unconventional ones. Do not filter or evaluate yet." },
      { id: "select", name: "Evaluate & select", description: "Score the candidates and pick the strongest.", instruction: "Evaluate the ideas from the previous step against this goal: \"{goal}\". Score the top candidates on impact and feasibility, and pick the best 2 with clear reasons." },
      { id: "develop", name: "Develop", description: "Turn the winning idea into something concrete.", instruction: "Develop the strongest idea selected in the previous step for this goal: \"{goal}\" into a concrete plan: what it looks like in practice, the first steps, and the main risks." }
    ],
    education: [
      { id: "map", name: "Learning map", description: "Order the concepts before diving in.", instruction: "Create a learning map for this goal: \"{goal}\": the concepts to master, in the right order, with one line on why each matters." },
      { id: "teach", name: "Explanation", description: "Learn the material with analogies and examples.", instruction: "Teach the material for this goal: \"{goal}\", following the learning map from the previous step. Use one concrete analogy or example per key concept." },
      { id: "practice", name: "Practice & check", description: "Test the understanding with graded questions.", instruction: "Based on the explanation from the previous step, create practice questions with answers for this goal: \"{goal}\" - ordered from easy to hard - plus a short self-assessment checklist." }
    ],
    business: [
      { id: "situation", name: "Situation & objective", description: "Clarify objective, audience and what success means.", instruction: "Clarify the business situation for this goal: \"{goal}\": the objective, the audience, the constraints, and what success looks like in measurable terms." },
      { id: "options", name: "Strategy options", description: "Compare distinct strategies and recommend one.", instruction: "Building on the previous step, propose 3 distinct strategies for this goal: \"{goal}\", with pros, cons and required effort for each. Recommend one and justify the choice." },
      { id: "plan", name: "Action plan", description: "Turn the strategy into steps, timeline and metrics.", instruction: "Turn the recommended strategy from the previous step into an action plan for this goal: \"{goal}\": concrete steps, timeline, and the metrics to track." }
    ],
    general: [
      { id: "plan", name: "Plan", description: "Break the goal into clear steps.", instruction: "Make a plan to accomplish this goal: \"{goal}\": break it into steps and note what each step needs." },
      { id: "execute", name: "Execute", description: "Deliver the complete result following the plan.", instruction: "Execute the plan from the previous step for this goal: \"{goal}\". Deliver the complete result." },
      { id: "review", name: "Review", description: "Critique the result and return the improved version.", instruction: "Critically review the result from the previous step against this goal: \"{goal}\". Point out weaknesses, fix them, and return the improved final version." }
    ]
  };

  // Keep completed text for inspection, but never reuse it as current after
  // an upstream edit. Run all will recompute marked steps in dependency order.
  function invalidateFrom(chain, index) {
    if (!chain || !Array.isArray(chain.steps)) return;
    chain.revision = (chain.revision || 0) + 1;
    chain.steps.slice(Math.max(0, index)).forEach(function (step) {
      if ((step.output || "").trim()) step.stale = true;
    });
  }

  function toShare(chain) {
    return { v: 2, g: chain.goal, c: chain.context || "", t: chain.taskType,
      s: chain.steps.map(function (step) {
        return { id: step.tplId, n: step.name, d: step.description || "", i: step.instruction,
          m: step.model, custom: !!step.custom };
      }) };
  }

  function fromShare(payload, engine, defaultModel) {
    if (!payload || typeof payload.g !== "string" || !payload.g.trim() || payload.g.length > 12000) return null;
    if (payload.c != null && typeof payload.c !== "string") return null;
    if ((payload.c || "").length > 20000) return null;
    var task = engine.TASK_ORDER.indexOf(payload.t) !== -1 ? payload.t : engine.detectTaskType(payload.g);
    var model = function (id) { return engine.MODEL_ORDER.indexOf(id) !== -1 ? id : defaultModel; };
    var steps;
    if (payload.v === 2) {
      if (!Array.isArray(payload.s) || !payload.s.length || payload.s.length > 12) return null;
      if (!payload.s.every(function (s) { return s && typeof s.i === "string" && s.i.trim() && s.i.length <= 12000 && typeof s.n === "string" && s.n.length <= 200; })) return null;
      steps = payload.s.map(function (s, i) {
        return { tplId: typeof s.id === "string" ? s.id.slice(0, 120) : "shared-" + i,
          name: s.n, description: typeof s.d === "string" ? s.d.slice(0, 1000) : "",
          instruction: s.i, model: model(s.m), custom: !!s.custom, output: "", stale: false };
      });
    } else {
      steps = Chains.get(task).map(function (s, i) {
        return { tplId: s.id, name: s.name, description: s.description, instruction: s.instruction,
          model: model(Array.isArray(payload.m) && payload.m[i]), output: "", stale: false };
      });
    }
    return { id: "ch" + Date.now(), createdAt: Date.now(), revision: 0,
      goal: payload.g.trim(), context: payload.c || "", taskType: task, steps: steps };
  }

  var Chains = {
    TEMPLATES: TEMPLATES,
    invalidateFrom: invalidateFrom,
    toShare: toShare,
    fromShare: fromShare,
    /** get(taskType) -> fresh copy of the step templates (falls back to "general"). */
    get: function (taskType) {
      var tpl = TEMPLATES[taskType] || TEMPLATES.general;
      return JSON.parse(JSON.stringify(tpl));
    }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.PromptCompassChains = Chains;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Chains;
  }
})();
