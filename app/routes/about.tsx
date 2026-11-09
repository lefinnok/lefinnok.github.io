import type { Route } from "./+types/about";
import { Link } from "react-router";
import { SectionHead } from "~/components/SectionHead";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "About | Lefinno Kwok",
    description:
      "AI platform engineer in Hong Kong. Enterprise AI delivery on one side, games and hardware on the other.",
    path: "/about",
  });

const eras = [
  {
    year: "2015 to 2020",
    title: "Making",
    text: "Microcontrollers, a game jam entry, and an 8-bit computer built from discrete transistors.",
  },
  {
    year: "2021 to 2024",
    title: "Working",
    text: "Embedded video at a startup, automation at HKSTP, then enterprise delivery at Deloitte.",
  },
  {
    year: "2025",
    title: "Research",
    text: "A solo capstone on probabilistic decision support, evaluated against five language models.",
  },
  {
    year: "2026",
    title: "Now",
    text: "Analyst at Deloitte, studio owner at Chefs Hat, and a 400-person event platform in production.",
  },
];

export default function About() {
  return (
    <>
      <section className="container about-hero">
        <div>
          <span className="eyebrow">About</span>
          <h1>Two registers, one builder.</h1>
          <p>
            I am an AI platform engineer in Hong Kong. I build systems where
            correctness matters, and I make games and hardware where experience
            matters. The two are not a side project and a job; they are the same
            practice applied to different materials.
          </p>
          <p>
            I studied computer science at HKU, worked across an embedded
            startup, a science park and a consultancy, and now deploy an
            enterprise AI platform. What I care about is the unglamorous middle:
            provenance, audit trails, integration, tests, release processes, the
            parts that make a system trustworthy rather than impressive.
          </p>
          <p>
            The rest of the time I make things: a steampunk roguelike on Steam, a
            computer from transistors, a rhythm game in three days, an
            interactive installation that recognises gestures from one image.
          </p>
        </div>
        <div className="about-facts">
          <div>
            Based in
            <strong>Hong Kong</strong>
          </div>
          <div>
            Languages
            <strong>Cantonese, Mandarin, English</strong>
          </div>
          <div>
            Education
            <strong>BEng Computer Science, HKU</strong>
          </div>
          <div>
            Currently
            <strong>Analyst, Deloitte</strong>
          </div>
          <div>
            Studio
            <strong>Chefs Hat Studio</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead num="01" title="Trajectory" range="2015 to now" />
          <div className="trajectory">
            {eras.map((era) => (
              <div className="era" key={era.year}>
                <div className="era__year">{era.year}</div>
                <h3>{era.title}</h3>
                <p>{era.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead num="02" title="What I work with" />
          <div className="skill-grid">
            <div className="skill-block">
              <h3>Engineering</h3>
              <p>
                Go, Rust, Java, Python and TypeScript. LLM orchestration and
                evaluation, Bayesian and decision models, integration
                middleware, identity and data access, Linux and container
                deployment.
              </p>
            </div>
            <div className="skill-block">
              <h3>Craft</h3>
              <p>
                Godot and GDScript, Unity and C#, shaders, game systems and
                production pipelines. KiCad, embedded C and 3D printing for
                hardware. Line art and interface design for the web.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead num="03" title="Elsewhere" />
          <div className="hero-actions" style={{ marginTop: 0 }}>
            <Link className="btn" to="/engineering">
              Engineering
            </Link>
            <Link className="btn" to="/craft">
              Craft
            </Link>
            <Link className="btn" to="/contact">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
