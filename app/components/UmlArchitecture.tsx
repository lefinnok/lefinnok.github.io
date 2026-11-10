const STAGES = [
  {
    num: "01",
    title: "Input",
    text: "The current diagram and your message. The demo keeps conversation state and supports class, sequence, activity, use case, component, state and object diagrams.",
  },
  {
    num: "02",
    title: "Prompt",
    text: "A fixed system prompt sets the role and the output contract. The current PlantUML source is included so an edit is targeted, not a full regeneration.",
  },
  {
    num: "03",
    title: "Model",
    text: "Any OpenAI-compatible endpoint with your own key, at temperature 0.2. The shared proxy is gone, so no model call happens without your key.",
  },
  {
    num: "04",
    title: "Parse",
    text: "The response must start with CODE or NEED_CLARIFICATION. The parser extracts the fenced block, strips stray plantuml lines and repairs missing @startuml / @enduml delimiters.",
  },
  {
    num: "05",
    title: "Encode",
    text: "UTF-8, raw zlib deflate, Base64, then PlantUML's custom URL alphabet. This runs in the browser with pako; no source leaves for encoding.",
  },
  {
    num: "06",
    title: "Render",
    text: "PlantUML's public server receives only the encoded source and returns SVG. The image, PNG export and editor link all come from that one artifact.",
  },
];

export function UmlArchitecture() {
  return (
    <div className="uml-arch">
      <ol className="uml-arch__flow">
        {STAGES.map((stage) => (
          <li key={stage.num}>
            <span className="uml-arch__num">{stage.num}</span>
            <div>
              <h4>{stage.title}</h4>
              <p>{stage.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <aside className="uml-arch__side">
        <div className="uml-arch__note">
          <span className="eyebrow">Trust boundary</span>
          <p>
            Your key stays in this browser session. The page calls your
            endpoint directly. PlantUML only ever receives encoded diagram
            source, never your key or conversation.
          </p>
        </div>

        <div className="uml-arch__note">
          <span className="eyebrow">Output contract</span>
          <pre>{`CODE:
@startuml
...
@enduml

or

NEED_CLARIFICATION:
<questions>`}</pre>
          <p>
            The model is not allowed to draw. It proposes text; deterministic
            code parses, encodes and renders it.
          </p>
        </div>

        <div className="uml-arch__note">
          <span className="eyebrow">Why it is interesting</span>
          <p>
            Every boundary can fail visibly. A malformed response is rejected,
            an ambiguous request comes back as a question, and a bad diagram is
            still inspectable as source.
          </p>
        </div>
      </aside>
    </div>
  );
}
