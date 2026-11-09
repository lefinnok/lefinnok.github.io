import { Link } from "react-router";
import type { CraftProject } from "~/lib/content";
import { LineArt } from "./LineArt";

export function ProjectCard({ project }: { project: CraftProject }) {
  return (
    <Link to={`/craft/${project.slug}`} className="card">
      <div className="card__art">
        <LineArt variant={project.art} className="" />
      </div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="card__tags">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="card__meta">
        {project.year}
        {project.demo ? " · interactive demo" : ""}
      </div>
    </Link>
  );
}
