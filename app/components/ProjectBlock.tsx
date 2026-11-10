import { useEffect, useState } from "react";
import type { CraftProject } from "~/lib/content";
import { ModelFrame } from "./ModelFrame";
import { FbxModelViewer } from "./FbxModelViewer";
import { LineArt } from "./LineArt";

export function ProjectBlock({
  project,
  showModel = true,
}: {
  project: CraftProject;
  showModel?: boolean;
}) {
  const anchor = `project-${project.slug}`;
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

  return (
    <article id={anchor} className={`project-block ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="project-block__toggle"
        aria-expanded={open}
        aria-controls={`${anchor}-body`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="project-block__thumb" aria-hidden="true">
          <LineArt variant={project.art} className="" />
        </span>
        <span className="project-block__intro">
          <span className="mono accent">{project.year}</span>
          <span className="project-block__title">{project.title}</span>
          <span className="project-block__line">{project.summary}</span>
          <span className="card__tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </span>
        </span>
        <span className="project-block__action">{open ? "Collapse" : "Open"}</span>
      </button>

      {open ? (
        <div className="project-block__body" id={`${anchor}-body`}>
          {project.details?.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="project-block__detail">
              {paragraph}
            </p>
          ))}
          {showModel && project.model ? (
            <ModelFrame
              label={project.model.label ?? "3D model"}
              meta={`${project.year} · ${project.model.path.split(".").pop()?.toUpperCase()}`}
              dimensions={project.model.dimensions}
            >
              <FbxModelViewer config={project.model} height={320} />
            </ModelFrame>
          ) : null}
          <div className="hero-actions">
            {project.demo ? (
              <a className="btn" href={`#demo-${project.slug}`}>
                Open the demo
              </a>
            ) : null}
            {project.links?.map((link) => (
              <a
                key={link.url}
                className="btn"
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
