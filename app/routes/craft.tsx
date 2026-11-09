import type { Route } from "./+types/craft";
import { Link } from "react-router";
import { SectionHead } from "~/components/SectionHead";
import { ProjectCard } from "~/components/ProjectCard";
import { DemoBlock } from "~/components/DemoBlock";
import { LineArt } from "~/components/LineArt";
import { craftProjects } from "~/data/craftProjects";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Craft | Lefinno Kwok",
    description:
      "Games, hardware and interactive work: a Steam release, a transistor computer, jams and installations.",
    path: "/craft",
  });

const eras = [
  { year: "2018", title: "First game", text: "Space Saver, Ludum Dare, high school." },
  { year: "2020", title: "Transistor computer", text: "Discrete logic, custom instruction set." },
  { year: "2022", title: "Retro handheld", text: "Custom PCB, firmware, enclosure." },
  { year: "2025", title: "Eccentricity", text: "Jam build to commercial production." },
  { year: "2026", title: "Studio work", text: "Steam page, Binmin, contract development." },
];

export default function Craft() {
  return (
    <>
      <section className="container page-hero">
        <span className="eyebrow">Craft / 02</span>
        <h1>I make things you can play with.</h1>
        <p className="lede">
          Games, hardware and interactive work, judged on experience and
          finish. Some of it is commercial, some of it is a jam, all of it is
          built to be used by someone other than me.
        </p>
        <div className="hero-actions">
          <Link className="btn btn--solid" to="/craft/eccentricity">
            Eccentricity
          </Link>
          <Link className="btn" to="/contact">
            Get in touch
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead num="01" title="In production" range="2025 to now" />
          <div className="feature">
            <div className="feature__body">
              <span className="mono accent">Case 01</span>
              <h2>Eccentricity</h2>
              <p>
                A steampunk engineering roguelike about building chain-reaction
                power grids. It started as a Ludum Dare entry and became a
                commercial release with a data pipeline, tests and a repeatable
                build process.
              </p>
              <div className="hero-actions" style={{ marginTop: 8 }}>
                <Link className="btn" to="/craft/case/eccentricity">
                  Read the case study
                </Link>
                <a
                  className="btn"
                  href="https://store.steampowered.com/app/4191840/Eccentricity/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Steam
                </a>
              </div>
            </div>
            <div className="feature__art">
              <LineArt variant="arch" className="" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead num="02" title="Chronology" range="2018 to 2026" />
          <div className="timeline" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            {eras.map((era) => (
              <div className="tl" key={era.year}>
                <div className="tl__year">{era.year}</div>
                <strong>{era.title}</strong>
                <span>{era.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHead num="03" title="Projects" range="Selected" />
          <div className="project-grid">
            {craftProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead num="04" title="Demos" range="In the browser" />
          <p className="lede" style={{ marginTop: 0, marginBottom: 28 }}>
            Two of the systems are small enough to run here. The first is a
            transistor-level computer with a microcode stepper and assembler.
            The second is a gesture recogniser that needs one reference image
            and no training.
          </p>
          <div style={{ display: "grid", gap: 28 }}>
            <DemoBlock componentName="TransistorSimulator" title="8-bit computer simulator" />
            <DemoBlock componentName="GestureRecognitionDemo" title="Gesture recognition" />
          </div>
        </div>
      </section>
    </>
  );
}
