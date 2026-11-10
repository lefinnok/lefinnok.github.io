const NOTES = [
  {
    title: "Listen",
    text: "Usually starts with talking to everyone who touches the problem: users, operators, buyers, the people who maintain it. Separating the request from the need is most of the work.",
  },
  {
    title: "Imagine and estimate",
    text: "Then research, references, raw material and resources, a few rough alternatives, and a guess at effort and risk before committing to one.",
  },
  {
    title: "Structure",
    text: "At some point the idea has to take a technical shape: boundaries, data, interfaces, failure modes and a build order.",
  },
  {
    title: "Build",
    text: "Building tends to happen in slices. Integrate early, put working pieces in front of the people who asked, and let feedback change the plan.",
  },
  {
    title: "Prove and hand over",
    text: "Eventually it has to survive real inputs and real operators. Documentation, a runbook, and enough context that someone else can run it.",
  },
];

export function Workflow() {
  return (
    <div className="workflow-wrap">
      <ul className="workflow">
        {NOTES.map((note) => (
          <li key={note.title} className="workflow__step">
            <h4>{note.title}</h4>
            <p>{note.text}</p>
          </li>
        ))}
      </ul>
      <p className="workflow__caption">
        A sketch, not a procedure. The order changes, the loops are real, and
        listening and building keep feeding each other. The two artifacts below
        are examples from that practice, not a taxonomy of the work I can do.
      </p>
    </div>
  );
}
