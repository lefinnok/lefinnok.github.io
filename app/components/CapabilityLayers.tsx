const LAYERS = [
  {
    num: "01",
    label: "General / range",
    title: "Soft skills and interests",
    items: [
      "Management",
      "Finance",
      "Leadership",
      "Communication",
      "Art and design",
      "History",
      "Philosophy",
    ],
    className: "layer--general",
  },
  {
    num: "02",
    label: "Technology",
    title: "The buildable range",
    items: [
      "Platform engineering",
      "Product",
      "Software",
      "Electronics",
      "Hardware at transistor level",
      "Mechanical and chassis design",
    ],
    className: "layer--technology",
  },
  {
    num: "03",
    label: "Specialization",
    title: "The technical depth",
    items: ["AI and ML", "Systems"],
    className: "layer--specialization",
  },
];

export function CapabilityLayers() {
  return (
    <div className="capability-layers">
      <div className="capability-layers__diagram">
        {LAYERS.map((layer) => (
          <div key={layer.num} className={`capability-layer ${layer.className}`}>
            <div className="capability-layer__head">
              <span className="capability-layer__num">{layer.num}</span>
              <span className="capability-layer__label">{layer.label}</span>
            </div>
            <h4>{layer.title}</h4>
            <ul>
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="capability-layers__notes">
        <p>
          <span>Range</span>
          The wide layer is how I read people, money, taste and context:
          management and finance, leadership and communication, art and design,
          history and philosophy.
        </p>
        <p>
          <span>Technology</span>
          Narrower and longer: the technical range that makes an idea
          buildable. Platform and product, software, electronics, hardware down
          to transistor level, mechanical and chassis design.
        </p>
        <p>
          <span>Depth</span>
          The narrow end is the specialization: AI and ML, and the systems that
          make them operable.
        </p>
      </div>
    </div>
  );
}
