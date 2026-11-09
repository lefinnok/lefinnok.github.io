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
    const models = ["gemini", "gpt-4o", "deepseek", "haiku", "kimi"];
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
            <g key={model}>
              <rect x={x} y={250 - b} width={34} height={b} fill="currentColor" opacity=".25" />
              <rect x={x + 40} y={250 - p} width={34} height={p} fill="var(--accent)" />
              <text x={x + 8} y={272} style={{ ...label, fontSize: 8 }}>{model}</text>
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
    const roles = ["ADMIN", "VOLUNTEER", "DESK", "QUEUE", "STAGE", "MC", "JUDGE", "JAMMER"];
    return (
      <svg viewBox="0 0 800 300" fill="none" aria-hidden="true">
        <rect x={330} y={120} width={140} height={60} stroke="currentColor" strokeWidth="1" />
        <text x={352} y={146} style={label}>EVENT</text>
        <text x={352} y={162} style={{ ...label, fontSize: 8, opacity: 0.7 }}>one binary</text>
        {roles.map((role, i) => {
          const angle = (i / roles.length) * Math.PI * 2 - Math.PI / 2;
          const cx = 400 + Math.cos(angle) * 250;
          const cy = 150 + Math.sin(angle) * 105;
          return (
            <g key={role}>
              <path d={`M400 150 L${cx} ${cy}`} stroke="currentColor" strokeOpacity=".3" />
              <rect x={cx - 46} y={cy - 14} width={92} height={28} stroke="currentColor" strokeWidth="1" fill="var(--paper-2)" />
              <text x={cx - 38} y={cy + 4} style={{ ...label, fontSize: 8 }}>{role}</text>
            </g>
          );
        })}
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
