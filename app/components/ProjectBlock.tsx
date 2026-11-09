import type { CraftProject } from "~/lib/content";
import { DemoSurface } from "./DemoSurface";
import { FbxModelViewer } from "./FbxModelViewer";

export function ProjectBlock({
  project,
  showModel = true,
}: {
  project: CraftProject;
  showModel?: boolean;
}) {
  return (
    <article className="project-block" id={`project-${project.slug}`}>
      <header className="project-block__head">
        <span className="mono accent">{project.year}</span>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="card__tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </header>

      {showModel && project.model ? (
        <DemoSurface>
          <FbxModelViewer config={project.model} height={300} />
        </DemoSurface>
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
    </article>
  );
}
