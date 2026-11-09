import type { CaseStudy } from "~/lib/content";
import { CaseFigure } from "./CaseFigure";

export function CaseStudyBlock({ study }: { study: CaseStudy }) {
  return (
    <article className="case-block" id={`case-${study.slug}`}>
      <header className="case-block__head">
        <span className="eyebrow">Case study</span>
        <h3>{study.title}</h3>
        <p className="case-block__lede">{study.lede}</p>
        <div className="case-meta">
          {study.meta.map((item) => (
            <div key={item.label}>
              {item.label}
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <div className="case-block__body">
        {study.sections.map((section) => (
          <section className="case-section" key={section.id}>
            <h4>{section.heading}</h4>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {section.figure ? (
              <figure className="figure">
                <CaseFigure kind={section.figure.kind} />
                <figcaption className="figcaption">
                  {section.figure.caption}
                </figcaption>
              </figure>
            ) : null}
          </section>
        ))}

        <section className="case-section">
          <h4>Outcome</h4>
          <ul>
            {study.outcome.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
        </section>
      </div>
    </article>
  );
}
