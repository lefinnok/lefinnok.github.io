import type { Route } from "./+types/demos";
import { Link } from "react-router";
import { demos } from "~/data/demos";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Demos | Lefinno Kwok",
    description:
      "Interactive demos: a transistor-level CPU, gesture recognition, a UML generator, machine learning playgrounds, architecture diagrams and 3D models.",
    path: "/demos",
  });

export default function Demos() {
  return (
    <>
      <section className="container page-hero">
        <span className="eyebrow">Demos / 03</span>
        <h1>Eight things that run here.</h1>
        <p className="lede">
          Not screenshots. Each one is a working system from the projects,
          rebuilt to live inside this site. The explainers are inside each
          demo, behind the How it works control.
        </p>
        <div className="hero-actions">
          <Link className="btn btn--solid" to="/demos/cpu-simulator">
            Start with the CPU
          </Link>
          <Link className="btn" to="/craft">
            See the craft
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="demos-grid">
            {demos.map((demo) => (
              <Link key={demo.slug} to={`/demos/${demo.slug}`} className="demo-card">
                <span className="eyebrow">{demo.kicker}</span>
                <h3>{demo.title}</h3>
                <p>{demo.description}</p>
                <div className="card__tags">
                  {demo.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <span className="demo-card__open">Open demo →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="next-track">
        <div className="container">
          <p className="mono" style={{ color: "var(--muted)" }}>
            The demos also appear where they belong: the CPU and gesture
            recognition on Craft, the UML generator on Engineering, the
            diagrams in Capabilities.
          </p>
        </div>
      </section>
    </>
  );
}
