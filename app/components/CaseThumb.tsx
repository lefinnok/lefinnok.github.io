import type { FigureKind } from "~/lib/content";

const mono = {
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "1px",
  fill: "currentColor",
};

function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={accent ? "rgba(176,71,36,0.08)" : "none"}
        stroke={accent ? "#B04724" : "currentColor"}
        strokeWidth="1"
      />
      <text x={x + 8} y={y + 18} style={{ ...mono, fontSize: 12 }}>
        {label}
      </text>
      {sub ? (
        <text x={x + 8} y={y + 31} style={{ ...mono, fontSize: 9, opacity: 0.55 }}>
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export function CaseThumb({ kind }: { kind: FigureKind }) {
  if (kind === "pipeline") {
    return (
      <svg viewBox="0 0 320 210" fill="none" aria-hidden="true">
        <text x="16" y="24" style={{ ...mono, fontSize: 8, fill: "#B04724" }}>
          INTERPRETATION
        </text>
        <text x="176" y="24" style={{ ...mono, fontSize: 8, fill: "#B04724" }}>
          COMPUTATION
        </text>

        <Box x={14} y={44} w={62} h={44} label="ASK" sub="intent" />
        <Box x={92} y={44} w={62} h={44} label="GATHER" sub="sources" />
        <Box x={170} y={44} w={62} h={44} label="MODEL" sub="Bayes" accent />
        <Box x={248} y={44} w={62} h={44} label="REPORT" sub="typed" />

        <path d="M76 66 H92" stroke="currentColor" strokeOpacity=".45" />
        <path d="M154 66 H170" stroke="currentColor" strokeOpacity=".45" />
        <path d="M232 66 H248" stroke="currentColor" strokeOpacity=".45" />

        <path d="M16 120 H304" stroke="currentColor" strokeOpacity=".2" />
        <text x="16" y="142" style={{ ...mono, fontSize: 9, opacity: 0.65 }}>
          the language model never does arithmetic
        </text>
        <text x="16" y="158" style={{ ...mono, fontSize: 9, opacity: 0.65 }}>
          every stage writes a typed record
        </text>

        <circle cx="208" cy="102" r="2" fill="#B04724" />
        <path d="M208 104 V112" stroke="#B04724" strokeOpacity=".6" />
      </svg>
    );
  }

  if (kind === "workspaces") {
    return (
      <svg viewBox="0 0 320 210" fill="none" aria-hidden="true">
        <Box x={110} y={82} w={100} h={46} label="EVENT" sub="one binary" accent />

        <Box x={12} y={26} w={78} h={34} label="JAMMER" />
        <Box x={230} y={26} w={78} h={34} label="DESK" />
        <Box x={12} y={150} w={78} h={34} label="JUDGE" />
        <Box x={230} y={150} w={78} h={34} label="STAGE" />

        <path d="M90 43 H110 M210 43 H230" stroke="currentColor" strokeOpacity=".4" />
        <path d="M90 167 H110 M210 167 H230" stroke="currentColor" strokeOpacity=".4" />
        <path d="M160 82 V60 M160 128 V150" stroke="currentColor" strokeOpacity=".4" />

        <text x="12" y="202" style={{ ...mono, fontSize: 9, opacity: 0.55 }}>
          8 workspaces · one role guard per route
        </text>
      </svg>
    );
  }

  return null;
}
