import { useEffect, useState } from "react";
import { Link } from "react-router";

interface DemoFrameProps {
  kicker: string;
  title: string;
  description?: string;
  year?: string;
  context?: string;
  tone?: "ink" | "paper";
  related?: { label: string; url: string };
  showHeader?: boolean;
  children: React.ReactNode;
}

export function DemoFrame({
  kicker,
  title,
  description,
  year,
  context,
  tone = "ink",
  related,
  showHeader = true,
  children,
}: DemoFrameProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  return (
    <article className={`demo-frame ${expanded ? "is-expanded" : ""}`}>
      {showHeader ? (
      <header className="demo-frame__head">
        <div>
          <span className="eyebrow">{kicker}</span>
          <h3>{title}</h3>
          {year ? <span className="demo-year">{year}</span> : null}
          {description ? <p>{description}</p> : null}
          {context ? <p className="demo-context">{context}</p> : null}
        </div>
        <div className="demo-frame__actions">
          {related ? (
            <Link className="mono demo-related" to={related.url}>
              {related.label} ↗
            </Link>
          ) : null}
          <button
            type="button"
            className="btn demo-expand"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? "Close" : "Expand"}
          </button>
        </div>
      </header>
      ) : null}

      <div className={`demo-frame__stage demo-frame__stage--${tone}`}>
        {children}
      </div>

      <footer className="demo-frame__foot">
        <span className="mono">Interactive · runs in the browser</span>
        <span className="mono">{tone === "ink" ? "Ink stage" : "Paper stage"}</span>
      </footer>
    </article>
  );
}
