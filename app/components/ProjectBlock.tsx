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
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash !== `#${anchor}`) return;
      setOpen(true);
      requestAnimationFrame(() => {
        document.getElementById(anchor)?.scrollIntoView({ block: "start" });
      });
    };
    const onOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail === anchor) setOpen(true);
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("anchor:open", onOpen);
    sync();
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
        onMouseEnter={() => preview === false && !open && setPreview(true)}
        onMouseLeave={() => setPreview(false)}
        onFocus={() => !open && setPreview(true)}
        onBlur={() => setPreview(false)}
        onClick={() => {
          setPreview(false);
          setOpen((value) => !value);
        }}
      >
        <span className="project-block__thumb" aria-hidden="true">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt="" loading="lazy" decoding="async" />
          ) : (
            <LineArt variant={project.art} className="" />
          )}
          {preview && project.model ? (
            <span className="project-block__preview">
              <FbxModelViewer
                config={{
                  ...project.model,
                  scale:
                    (project.model.scale ?? 0.1) *
                    ({ eccentricity: 2, "8-bit-computer": 2.3, binmin: 1.7, "gesture-recognition": 1.5, "retro-handheld": 1.9, "intern-medallion": 1.1, "space-saver": 1.6 }[project.slug] ?? 1.5),
                }}
                height="100%"
                rotationSpeed={0.012}
              />
            </span>
          ) : null}
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
