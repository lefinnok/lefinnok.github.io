import type { Route } from "./+types/craft-project";
import { Link, useParams } from "react-router";
import { DemoBlock } from "~/components/DemoBlock";
import { LineArt } from "~/components/LineArt";
import { getCraftProject } from "~/data/craftProjects";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = ({ params }) => {
  const project = getCraftProject(params.slug ?? "");
  return pageMeta({
    title: project ? `${project.title} | Lefinno Kwok` : "Project | Lefinno Kwok",
    description: project?.summary,
    path: project ? `/craft/${project.slug}` : "/craft",
  });
};

export default function CraftProjectPage() {
  const { slug } = useParams();
  const project = getCraftProject(slug ?? "");

  if (!project) {
    return (
      <section className="container" style={{ padding: "96px 0" }}>
        <span className="mono">404</span>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(36px, 5vw, 64px)" }}>
          Project not found
        </h1>
        <Link className="btn" to="/craft" style={{ marginTop: 20 }}>
          Back to craft
        </Link>
      </section>
    );
  }

  const isCase = project.slug === "eccentricity";

  return (
    <>
      <section className="container page-hero">
        <span className="eyebrow">Craft / {project.year}</span>
        <h1>{project.title}</h1>
        <p className="lede">{project.summary}</p>
        <div className="card__tags" style={{ marginTop: 18 }}>
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="hero-actions">
          {isCase ? (
            <Link className="btn btn--solid" to="/craft/case/eccentricity">
              Read the case study
            </Link>
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
          <Link className="btn" to="/craft">
            All craft
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {project.demo ? (
            <DemoBlock componentName={project.demo} title={`${project.title} demo`} />
          ) : (
            <figure className="figure">
              <LineArt variant={project.art} className="" />
              <figcaption className="figcaption">
                {project.title}, {project.year}
              </figcaption>
            </figure>
          )}
        </div>
      </section>
    </>
  );
}
