const STEPS = [
  {
    num: "01",
    title: "Listen",
    text: "Talk to everyone who touches the problem: users, operators, buyers, the people who maintain it. Separate the request from the need, and agree what success looks like.",
  },
  {
    num: "02",
    title: "Imagine and estimate",
    text: "Research references, gather the raw material and resources, sketch alternatives, and estimate effort and risk. Decide what is worth building before committing to it.",
  },
  {
    num: "03",
    title: "Structure",
    text: "Give the chosen idea a technical shape: boundaries, data, interfaces, failure modes and a build order. The smallest structure that can carry the whole idea.",
  },
  {
    num: "04",
    title: "Build",
    text: "Make it real in slices. Integrate early, put working pieces in front of the people who asked for it, and let their feedback change the plan.",
  },
  {
    num: "05",
    title: "Prove and hand over",
    text: "Test with real inputs and real operators. Document it, write the runbook, and stay close enough that someone else can run it without me.",
  },
];

export function Workflow() {
  return (
    <div className="workflow-wrap">
      <ol className="workflow">
        {STEPS.map((step) => (
          <li key={step.num} className="workflow__step">
            <span className="workflow__num">{step.num}</span>
            <h4>{step.title}</h4>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="workflow__caption">
        Not a waterfall: listening and building feed each other. Two artifacts
        from this path are below: a service shape and a hardware path. They are
        examples, not a taxonomy of the work I can do.
      </p>
    </div>
  );
}
