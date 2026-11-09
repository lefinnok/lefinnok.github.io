import type { Route } from "./+types/case-study";
import { Link, useParams } from "react-router";
import { CaseFigure } from "~/components/CaseFigure";
import { caseStudies, getCaseStudy } from "~/data/caseStudies";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = ({ params }) => {
  const study = getCaseStudy(params.slug ?? "");
  const meta = pageMeta({
    title: study ? `${study.title} | Lefinno Kwok` : "Case study | Lefinno Kwok",
    description: study?.lede,
    path: study ? `/${study.track}/case/${study.slug}` : "/engineering",
  });
  return study ? meta : [...meta, { name: "robots", content: "noindex" }];
};

export default function CaseStudyPage() {
  const { slug } = useParams();
  const study = getCaseStudy(slug ?? "");

  if (!study) {
    return (
      <section className="container" style={{ padding: "96px 0" }}>
        <span className="mono">404</span>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(36px, 5vw, 64px)" }}>
          Case study not found
        </h1>
        <Link className="btn" to="/engineering" style={{ marginTop: 20 }}>
          Back to engineering
        </Link>
      </section>
    );
  }

  const siblings = caseStudies.filter((item) => item.track === study.track);
  const index = siblings.findIndex((item) => item.slug === study.slug);
  const previous = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;

  return (
    <>
      <section className="container case-hero">
        <span className="eyebrow">
          {study.track === "engineering" ? "Engineering" : "Craft"} / Case study
        </span>
        <h1>{study.title}</h1>
        <p className="lede">{study.lede}</p>
        <div className="case-meta">
          {study.meta.map((item) => (
            <div key={item.label}>
              {item.label}
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="case-body">
        <div className="container">
          <div className="case-body__inner">
            {study.sections.map((section) => (
              <div className="case-section" key={section.id}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.figure ? (
                  <figure className="figure">
                    <CaseFigure kind={section.figure.kind} />
                    <figcaption className="figcaption">
                      {section.figure.caption}
                    </figcaption>
                  </figure>
                ) : null}
              </div>
            ))}

            <div className="case-section">
              <h2>Outcome</h2>
              <ul>
                {study.outcome.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {study.links ? (
              <div className="hero-actions">
                {study.links.map((link) => (
                  <a
                    key={link.url}
                    className="btn"
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}

            <nav className="case-nav" aria-label="Case studies">
              {previous ? (
                <Link to={`/${previous.track}/case/${previous.slug}`}>
                  ← {previous.title}
                </Link>
              ) : (
                <span />
              )}
              <Link to={study.track === "engineering" ? "/engineering" : "/craft"}>
                All {study.track}
              </Link>
              {next ? (
                <Link to={`/${next.track}/case/${next.slug}`}>{next.title} →</Link>
              ) : (
                <span />
              )}
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
