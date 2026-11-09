import type { CaseStudy } from "~/lib/content";

export const caseStudies: CaseStudy[] = [
  {
    slug: "pdss",
    track: "engineering",
    title: "Probabilistic Decision Support",
    subtitle: "Natural language over models that can be audited",
    lede: "A decision support system where the language model interprets the question and never does the arithmetic. Every fact carries provenance, every model returns uncertainty, and every recommendation can be traced to its source.",
    meta: [
      { label: "Role", value: "Design, build and evaluation, solo" },
      { label: "Period", value: "2025 to 2026" },
      { label: "Stack", value: "Go, Python, React, SQLite" },
      { label: "Context", value: "HKU COMP4801 capstone" },
    ],
    sections: [
      {
        id: "problem",
        heading: "The problem",
        paragraphs: [
          "People already make consequential decisions with chat assistants: where to travel, which offer to accept, which vendor to choose. The answers are fluent and almost impossible to check. Meanwhile the tools that could actually model the decision, Bayesian networks, Markov decision processes, multi-criteria analysis, require a specialist and a week of setup.",
          "The obvious shortcut, asking a model to reason probabilistically, fails for a structural reason: the model is generating plausible text, not computing a posterior. It will produce a confident ranking and no way to verify it.",
        ],
      },
      {
        id: "architecture",
        heading: "The model is an interpreter, not a calculator",
        paragraphs: [
          "The system separates interpretation from computation. A fourteen-stage pipeline extracts intent, asks clarifying questions, decomposes the decision into aspects, gathers evidence, selects a model family, and only then hands the problem to a numerical engine.",
          "The engine is deliberately boring: variable elimination for Bayesian networks, value iteration for decision processes, TOPSIS and weighted sum for multi-criteria problems, with Monte Carlo runs for uncertainty. The language model never sees the arithmetic. A faulty model produces a wrong answer that can be inspected, which is the point.",
        ],
        figure: { kind: "pipeline", caption: "Pipeline: interpretation on the left, computation on the right" },
      },
      {
        id: "provenance",
        heading: "Evidence that can be graded",
        paragraphs: [
          "A recommendation is only as good as the facts behind it, so every gathered fact carries a source, a retrieval query, a timestamp and a trust tier. The tiers follow the logic of clinical evidence grading: curated APIs are treated as high quality, live web extracts as moderate, model knowledge as very low.",
          "A verification pass splits compound facts into atomic claims, rewrites them to stand alone, and checks each against a web search, with a hard budget per session. Users see the evidence before modelling and can approve, reject or request more research per aspect. Contradictions between sources are surfaced rather than averaged away.",
        ],
      },
      {
        id: "evaluation",
        heading: "Measuring it, then admitting a flaw",
        paragraphs: [
          "The evaluation compared the pipeline against raw chat baselines across five language models and four decision scenarios, scoring factual accuracy, source attribution, model rigour, uncertainty, consistency and traceability.",
          "Halfway through, I found that the multi-turn baselines were not actually multi-turn: the script ended the conversation when a model answered without a question mark. Every multi-turn score was contaminated. I stripped all sixty runs, fixed the protocol, re-ran them, and wrote the correction into the report. The pipeline lifted composite quality by 8 to 89 percent, with the largest gains in attribution and traceability, and the weakest stage was still the modelling boundary where structured output failed.",
        ],
        figure: { kind: "evaluation", caption: "Composite quality by model, with and without the pipeline" },
      },
      {
        id: "limits",
        heading: "What I would change",
        paragraphs: [
          "The model stage needs constrained decoding or a stronger schema repair loop; the current version falls back to heuristics more often than I would like. Cross-verification should use genuinely different model families rather than tiers of one provider. And the system needs a formal user study, not just an offline evaluation, because the interesting question is whether a non-specialist makes a better decision, not whether a judge prefers the report.",
        ],
      },
    ],
    outcome: [
      "One thousand and sixty-nine tests passing at the recorded snapshot.",
      "A sixty-six page report documenting the architecture, the evaluation and the limitations.",
      "A disclosed and corrected methodology flaw, rather than a replaced number.",
    ],
  },
  {
    slug: "ggjhk-platform",
    track: "engineering",
    title: "GGJHK Event Platform",
    subtitle: "Three hundred jammers, one VPS, three weeks to launch",
    lede: "A bilingual operations platform for the Hong Kong game jam: registration, QR check-in, teams, submissions, judging, stage control and certificates. Built solo on roughly ten hours a week, with registration as the hard milestone.",
    meta: [
      { label: "Role", value: "Sole developer and operator" },
      { label: "Period", value: "2026 to 2027 event" },
      { label: "Stack", value: "Go, SQLite, Caddy, systemd" },
      { label: "Context", value: "Volunteer build for GGJHK" },
    ],
    sections: [
      {
        id: "deadline",
        heading: "A deadline, not a product roadmap",
        paragraphs: [
          "The event needs registration live on 1 December and the jam runs at the end of January, for 300 to 400 participants and about sixty teams. The budget is one small VPS, the venue wifi is temporary and weak, and the people editing content are volunteers, not engineers.",
          "That shape decides the architecture. A single Go binary with SQLite, one process, one filesystem, no managed services. Everything that can be printed has a printed fallback, because the network at the venue is the least reliable component in the system.",
        ],
      },
      {
        id: "workspaces",
        heading: "Eight roles, eight workspaces",
        paragraphs: [
          "Volunteers, judges, the MC, the stage team and jammers all need different screens and different permissions. Rather than one dense admin panel, the platform gives each role its own workspace with its own navigation, guarded on the server. A person can hold several roles and switch between them.",
          "The check-in flow is the one that matters on the day: a QR scan, a two-step confirmation, a manual fallback at the desk, and a printed roster if the scanner fails.",
        ],
        figure: { kind: "workspaces", caption: "Role map: one route guard per workspace" },
      },
      {
        id: "review",
        heading: "The bugs that would have broken the room",
        paragraphs: [
          "A structured review before launch found three problems that no unit test would have caught. Login rate limiting was keyed on IP address alone, which is reasonable on the web and catastrophic at a venue where four hundred people share one NAT address: the eleventh attempt would lock the room out. The proxy policy disabled camera access, which would have silently killed the QR scanner. Check-in timestamps were rendered in UTC, eight hours off local time.",
          "None of these were code quality problems. They were deployment context problems, and they are the reason the review looked at where the system runs, not just what it computes.",
        ],
      },
      {
        id: "limits",
        heading: "What I would change",
        paragraphs: [
          "I would load-test the check-in path on real hardware earlier, and I would cut the certificate designer from the first release. It is the most intricate surface in the system and it is not on the critical path. The lesson is that the first feature you build should be the one that makes the product exist, and everything else should be able to wait a week.",
        ],
      },
    ],
    outcome: [
      "Eight role workspaces, 168 tests and seven acceptance suites at handover.",
      "About 871 interface strings in English and Traditional Chinese.",
      "A deployment that fits on one VPS with Caddy, systemd and nightly backups.",
    ],
  },
  {
    slug: "eccentricity",
    track: "craft",
    title: "Eccentricity",
    subtitle: "From a forty-eight hour jam to a Steam release",
    lede: "A steampunk engineering roguelike about building chain-reaction power grids. It started as a Ludum Dare entry and became a commercial production with a team, a data pipeline, tests and a release process.",
    meta: [
      { label: "Role", value: "Co-developer and technical lead" },
      { label: "Period", value: "2025 to now" },
      { label: "Stack", value: "Godot, GDScript, Python" },
      { label: "Context", value: "Chefs Hat Studio" },
    ],
    sections: [
      {
        id: "origin",
        heading: "A jam build that deserved better",
        paragraphs: [
          "The first version was made for Ludum Dare 58 in 2025. You arrange machines on a grid, chain their effects, and try to meet a rising power quota before the system breaks. The jam build had hardcoded mechanics, hand-tuned numbers and no data pipeline, which is fine for forty-eight hours and impossible to extend.",
          "The commercial rebuild started in March 2026. It is the same idea with a real foundation: item definitions, effect composition, balance data, save architecture, UI systems and tests.",
        ],
        figure: { kind: "commitgraph", caption: "The rebuild: 1,656 commits and 482 scenes since March 2026" },
      },
      {
        id: "rebuild",
        heading: "What a production needs",
        paragraphs: [
          "The work is mostly invisible: a data pipeline that turns spreadsheets into resources, a test suite that catches broken item interactions, encrypted Windows and macOS builds, export presets, and a release process that a small team can repeat without me in the room.",
          "I lead the technical side and co-develop with the team. JH Yoon tunes UI and game feel, and the artists own the visual language. My job is to keep the systems coherent while other people change them, which is a different skill from writing everything myself.",
        ],
      },
      {
        id: "playtest",
        heading: "Watching people misunderstand the game",
        paragraphs: [
          "We ran public playtests, including a large round where I watched players fail to understand systems I thought were obvious. The breakage formula, the shop economy and the tutorial all changed because of what people did, not what they said.",
          "The most useful signal was where players stopped reading. The game has a lot of text, and every panel that did not earn its space got cut.",
        ],
      },
      {
        id: "limits",
        heading: "What I would change",
        paragraphs: [
          "I would build a smaller vertical slice before rebuilding the whole game, and I would add telemetry earlier. We made some decisions twice because we were guessing at player behaviour. The jam version proved the idea; the production version is proving the team.",
        ],
      },
    ],
    outcome: [
      "A Steam page and a commercial release in production.",
      "1,656 commits across 482 scenes since the rebuild began.",
      "A release pipeline with encrypted builds for Windows and macOS.",
    ],
    links: [{ label: "Steam page", url: "https://store.steampowered.com/app/4191840/Eccentricity/" }],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
