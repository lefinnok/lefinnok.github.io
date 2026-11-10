import type { FigureKind } from "~/lib/content";

const label = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  letterSpacing: "1.4px",
  fill: "currentColor",
};

export function CaseFigure({ kind }: { kind: FigureKind }) {
  if (kind === "pipeline") {
    const stages = [
      { x: 30, title: "UNDERSTAND", sub: "intent, questions, aspects" },
      { x: 230, title: "GATHER", sub: "sources, provenance, verification" },
      { x: 430, title: "MODEL", sub: "Bayesian, MDP, multi-criteria" },
      { x: 630, title: "REPORT", sub: "narration, quality, uncertainty" },
    ];
    return (
      <svg viewBox="0 0 800 300" fill="none" aria-hidden="true">
        {stages.map((stage, i) => (
          <g key={stage.title}>
            <rect x={stage.x} y={80} width={150} height={90} stroke="currentColor" strokeWidth="1" />
            <text x={stage.x + 12} y={106} style={label}>{stage.title}</text>
            <text x={stage.x + 12} y={128} style={{ ...label, fontSize: 8, letterSpacing: "0.4px", opacity: 0.7 }}>
              {stage.sub.split(", ")[0]}
            </text>
            <text x={stage.x + 12} y={144} style={{ ...label, fontSize: 8, letterSpacing: "0.4px", opacity: 0.7 }}>
              {stage.sub.split(", ")[1] ?? ""}
            </text>
            {i < stages.length - 1 && (
              <path d={`M${stage.x + 150} 125 H${stage.x + 190}`} stroke="currentColor" strokeWidth="1" />
            )}
          </g>
        ))}
        <text x={30} y={40} style={{ ...label, fill: "var(--accent)" }}>INTERPRETATION</text>
        <text x={430} y={40} style={{ ...label, fill: "var(--accent)" }}>COMPUTATION</text>
        <path d="M30 220 H780" stroke="currentColor" strokeOpacity=".25" />
        <text x={30} y={248} style={{ ...label, letterSpacing: "0.4px", opacity: 0.75 }}>
          the language model never performs arithmetic
        </text>
        <text x={30} y={268} style={{ ...label, letterSpacing: "0.4px", opacity: 0.75 }}>
          every stage writes a typed record to the session
        </text>
      </svg>
    );
  }

  if (kind === "evaluation") {
    const models = [
      { name: "gemini", version: "2.0-flash-001" },
      { name: "gpt-4o-mini", version: "2024-07-18" },
      { name: "deepseek-chat", version: "V3" },
      { name: "claude-3.5", version: "haiku" },
      { name: "kimi", version: "K2.5" },
    ];
    const baseline = [38, 32, 33, 32, 43];
    const pipeline = [56, 61, 64, 58, 72];
    return (
      <svg viewBox="0 0 800 300" fill="none" aria-hidden="true">
        <path d="M60 250 H760" stroke="currentColor" strokeOpacity=".4" />
        <path d="M60 40 V250" stroke="currentColor" strokeOpacity=".4" />
        {models.map((model, i) => {
          const x = 90 + i * 135;
          const b = (baseline[i] / 100) * 190;
          const p = (pipeline[i] / 100) * 190;
          return (
            <g key={model.name}>
              <rect x={x} y={250 - b} width={34} height={b} fill="currentColor" opacity=".25" />
              <rect x={x + 40} y={250 - p} width={34} height={p} fill="var(--accent)" />
              <text x={x + 2} y={268} style={{ ...label, fontSize: 8 }}>{model.name}</text>
              <text x={x + 2} y={280} style={{ ...label, fontSize: 7, opacity: 0.55 }}>{model.version}</text>
            </g>
          );
        })}
        <rect x={600} y={50} width={12} height={12} fill="currentColor" opacity=".25" />
        <text x={620} y={60} style={{ ...label, fontSize: 8, letterSpacing: "0.4px" }}>raw chat</text>
        <rect x={600} y={74} width={12} height={12} fill="var(--accent)" />
        <text x={620} y={84} style={{ ...label, fontSize: 8, letterSpacing: "0.4px" }}>with pipeline</text>
      </svg>
    );
  }

  if (kind === "workspaces") {
    const left = [
      { role: "ADMIN", route: "/admin" },
      { role: "VOLUNTEER", route: "/scan + /desk" },
      { role: "JUDGE", route: "/judge" },
      { role: "JAMMER", route: "/me" },
    ];
    const right = [
      { role: "SUBMISSION", route: "/queue" },
      { role: "PRESENTATION", route: "/stage" },
      { role: "MC", route: "/mc" },
      { role: "VISITOR", route: "/v" },
    ];
    const centres = [53, 121, 189, 257];

    return (
      <svg viewBox="0 0 800 300" fill="none" aria-hidden="true">
        <rect x={330} y={115} width={140} height={60} stroke="currentColor" strokeWidth="1" />
        <text x={352} y={141} style={label}>EVENT</text>
        <text x={352} y={157} style={{ ...label, fontSize: 8, opacity: 0.7 }}>one binary</text>

        <path d="M330 145H245M245 53V257" stroke="currentColor" strokeOpacity=".25" />
        <path d="M470 145H555M555 53V257" stroke="currentColor" strokeOpacity=".25" />
        {centres.map((y) => (
          <path key={`l${y}`} d={`M245 ${y}H160`} stroke="currentColor" strokeOpacity=".25" />
        ))}
        {centres.map((y) => (
          <path key={`r${y}`} d={`M555 ${y}H640`} stroke="currentColor" strokeOpacity=".25" />
        ))}

        {left.map((entry, i) => (
          <g key={entry.role}>
            <rect x={60} y={centres[i] - 18} width={100} height={36} stroke="currentColor" strokeWidth="1" fill="var(--paper-2)" />
            <text x={68} y={centres[i] - 2} style={{ ...label, fontSize: 9 }}>{entry.role}</text>
            <text x={68} y={centres[i] + 11} style={{ ...label, fontSize: 7, opacity: 0.55 }}>{entry.route}</text>
          </g>
        ))}

        {right.map((entry, i) => (
          <g key={entry.role}>
            <rect x={640} y={centres[i] - 18} width={100} height={36} stroke="currentColor" strokeWidth="1" fill="var(--paper-2)" />
            <text x={648} y={centres[i] - 2} style={{ ...label, fontSize: 9 }}>{entry.role}</text>
            <text x={648} y={centres[i] + 11} style={{ ...label, fontSize: 7, opacity: 0.55 }}>{entry.route}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (kind === "commitgraph") {
    return (
      <svg viewBox="0 0 800 300" fill="none" aria-hidden="true">
        <path d="M40 260 H760" stroke="currentColor" strokeOpacity=".3" />
        <path d="M40 40 V260" stroke="currentColor" strokeOpacity=".3" />
        <path
          d="M40 250 C 150 240, 220 210, 300 190 S 470 130, 560 100 S 680 70, 760 55"
          stroke="var(--accent)"
          strokeWidth="1.6"
        />
        {[40, 300, 560, 760].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={[250, 190, 100, 55][i]} r="4" fill="currentColor" />
            <text x={x - 8} y={280} style={{ ...label, fontSize: 8 }}>
              {["MAR", "JUN", "SEP", "NOV"][i]}
            </text>
          </g>
        ))}
        <text x={560} y={40} style={{ ...label, fontSize: 8, letterSpacing: "0.4px" }}>
          1,656 commits
        </text>
      </svg>
    );
  }

  return null;
}
