export function TShape() {
  return (
    <div className="t-frame">
      <svg
        className="t-frame__diagram"
        viewBox="0 0 620 190"
        fill="none"
        aria-hidden="true"
      >
        <text x="28" y="14" style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "1.6px", fill: "var(--muted)" }}>
          RANGE
        </text>
        <path d="M28 38H592" stroke="currentColor" strokeOpacity="0.55" />
        <path d="M28 32V44M592 32V44" stroke="currentColor" strokeOpacity="0.55" />
        <path d="M310 38V172" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="310" cy="38" r="3.5" fill="var(--accent)" />

        <g style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.8px", fill: "currentColor" }}>
          <text x="28" y="28">MANAGEMENT</text>
          <text x="126" y="28">FINANCE</text>
          <text x="214" y="28">LEADERSHIP</text>
          <text x="326" y="28">COMMUNICATION</text>
          <text x="452" y="28">ART / DESIGN</text>
          <text x="552" y="28">TECHNOLOGY</text>
        </g>

        <g style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.2px", fill: "currentColor", opacity: 0.8 }}>
          <text x="326" y="92">AI / ML</text>
          <text x="326" y="112">SYSTEMS</text>
        </g>

        <text
          x="310"
          y="184"
          textAnchor="middle"
          style={{ fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "1.6px", fill: "var(--muted)" }}
        >
          DEPTH
        </text>
      </svg>

      <div className="t-frame__copy">
        <p>
          <span>Bar / range</span>
          Management, finance, leadership, communication, art and design, and
          technology. I can move across all of them and connect them, which is
          usually where the useful idea is.
        </p>
        <p>
          <span>Stem / depth</span>
          AI and ML, and the systems that make them work. Technology is the
          specialization; these are the technical depths.
        </p>
      </div>
    </div>
  );
}
