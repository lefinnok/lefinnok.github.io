import { Link } from "react-router";
import type { CaseStudy } from "~/lib/content";
import { LineArt } from "./LineArt";

export function CaseCard({
  study,
  index,
}: {
  study: CaseStudy;
  index: number;
}) {
  return (
    <Link to={`/${study.track}/case/${study.slug}`} className="card">
      <div className="card__art">
        <LineArt variant={study.track === "engineering" ? "connector" : "arch"} className="" />
      </div>
      <span className="mono accent">Case {String(index + 1).padStart(2, "0")}</span>
      <h3>{study.title}</h3>
      <p>{study.subtitle}</p>
      <div className="card__meta">Read the case study →</div>
    </Link>
  );
}
