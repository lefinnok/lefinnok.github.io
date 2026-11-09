import type { Route } from "./+types/demo-detail";
import { Link, useParams } from "react-router";
import { DemoBlock } from "~/components/DemoBlock";
import { demos, getDemo } from "~/data/demos";
import { craftProjects } from "~/data/craftProjects";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = ({ params }) => {
  const demo = getDemo(params.slug ?? "");
  const meta = pageMeta({
    title: demo ? `${demo.title} | Lefinno Kwok` : "Demo | Lefinno Kwok",
    description: demo?.description,
    path: demo ? `/demos/${demo.slug}` : "/demos",
  });
  return demo ? meta : [...meta, { name: "robots", content: "noindex" }];
};

export default function DemoDetail() {
  const { slug } = useParams();
  const demo = getDemo(slug ?? "");

  if (!demo) {
    return (
      <section className="container" style={{ padding: "96px 0" }}>
        <span className="mono">404</span>
        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(36px, 5vw, 64px)" }}>
          Demo not found
        </h1>
        <Link className="btn" to="/demos" style={{ marginTop: 20 }}>
          All demos
        </Link>
      </section>
    );
  }

  const index = demos.findIndex((item) => item.slug === demo.slug);
  const previous = index > 0 ? demos[index - 1] : undefined;
  const next = index < demos.length - 1 ? demos[index + 1] : undefined;
  const modelProjects = craftProjects.filter((project) => project.model);

  return (
    <>
      <section className="container page-hero">
        <span className="eyebrow">{demo.kicker} / Demo</span>
        <h1>{demo.title}</h1>
        <p className="lede">{demo.description}</p>
        <div className="hero-actions">
          {demo.related ? (
            <Link className="btn" to={demo.related.url}>
              {demo.related.label}
            </Link>
          ) : null}
          <Link className="btn" to="/demos">
            All demos
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {demo.component ? (
            <DemoBlock
              componentName={demo.component}
              title={demo.title}
              description={demo.description}
              kicker={demo.kicker}
              tone={demo.tone}
              related={demo.related}
              showHeader={false}
            />
          ) : (
            <div className="demo-frame">
              <header className="demo-frame__head">
                <div>
                  <span className="eyebrow">{demo.kicker}</span>
                  <h3>{demo.title}</h3>
                  <p>{demo.description}</p>
                </div>
              </header>
              <div className="demo-frame__stage demo-frame__stage--ink">
                <div className="model-links">
                  {modelProjects.map((project) => (
                    <Link key={project.slug} to={`/craft/${project.slug}`}>
                      <span className="mono">{project.year}</span>
                      <strong>{project.title}</strong>
                      <span className="mono accent">Open →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <nav className="case-nav container" aria-label="Demos">
        {previous ? <Link to={`/demos/${previous.slug}`}>← {previous.title}</Link> : <span />}
        <Link to="/demos">All demos</Link>
        {next ? <Link to={`/demos/${next.slug}`}>{next.title} →</Link> : <span />}
      </nav>
    </>
  );
}
