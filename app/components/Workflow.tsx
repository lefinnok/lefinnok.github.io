const STEPS = [
  {
    num: "01",
    title: "Frame",
    text: "What decision does this serve? What must be true? What does being wrong cost? Constraints come before features.",
  },
  {
    num: "02",
    title: "Model",
    text: "Boundaries, data, interfaces and failure modes. I draw to think, not to decorate. The service and hardware drawings below come out of this step.",
  },
  {
    num: "03",
    title: "Build the narrow path",
    text: "A walking skeleton through every real boundary: one typed request, one real write, one visible result. Then widen it.",
  },
  {
    num: "04",
    title: "Verify",
    text: "Tests, evaluation, logs and provenance. If a number cannot be reproduced or explained, it is not finished.",
  },
  {
    num: "05",
    title: "Operate and hand over",
    text: "Runbooks, offline paths, audit trails and a system someone else can run. The work ends when it can be operated without me.",
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
        Two artifacts from this path are below: a service shape and a hardware
        path. They are examples, not a taxonomy of the work I can do.
      </p>
    </div>
  );
}
