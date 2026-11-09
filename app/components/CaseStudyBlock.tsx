import { useEffect, useState } from "react";
import type { CaseStudy } from "~/lib/content";
import { CaseFigure } from "./CaseFigure";

export function CaseStudyBlock({ study }: { study: CaseStudy }) {
  const anchor = `case-${study.slug}`;
  const [open, setOpen] = useState(() =>
    typeof window !== "undefined" && window.location.hash === `#${anchor}`
  );

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === `#${anchor}`) setOpen(true);
    };
    const onOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail === anchor) setOpen(true);
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("anchor:open", onOpen);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("anchor:open", onOpen);
    };
  }, [anchor]);

  const thumbKind =
    study.sections.find((section) => section.figure)?.figure?.kind ?? "pipeline";
  const headline = study.meta.find((item) => item.label === "Period")?.value ?? "";

  return (
    <article id={anchor} className={`case-block ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="case-block__toggle"
        aria-expanded={open}
        aria-controls={`${anchor}-body`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="case-block__thumb" aria-hidden="true">
          <CaseFigure kind={thumbKind} />
        </span>
        <span className="case-block__intro">
          <span className="eyebrow">Case study</span>
          <span className="case-block__title">{study.title}</span>
          <span className="case-block__line">{study.subtitle}</span>
          <span className="case-block__meta-line">
            {headline ? `${headline} · ` : ""}
            {study.meta[0]?.value}
          </span>
        </span>
        <span className="case-block__action">{open ? "Collapse" : "Read case"}</span>
      </button>

      {open ? (
        <div className="case-block__body" id={`${anchor}-body`}>
          <p className="case-block__lede">{study.lede}</p>
          <div className="case-meta">
            {study.meta.map((item) => (
              <div key={item.label}>
                {item.label}
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

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
      ) : null}
    </article>
  );
}
