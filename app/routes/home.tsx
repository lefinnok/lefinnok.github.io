import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Chooser } from "~/components/Chooser";
import { SectionHead } from "~/components/SectionHead";
import { CaseCard } from "~/components/CaseCard";
import { ProjectCard } from "~/components/ProjectCard";
import { DemoSurface } from "~/components/DemoSurface";
import { TrackLink } from "~/components/TrackLink";
import { LineArt } from "~/components/LineArt";
import ComputerAutoDemo from "~/components/homepage/ComputerAutoDemo";
import { caseStudies } from "~/data/caseStudies";
import { craftProjects } from "~/data/craftProjects";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Lefinno Kwok | Engineering and craft",
    path: "/",
  });

const featuredCraft = craftProjects.filter((project) =>
  ["eccentricity", "8-bit-computer", "binmin"].includes(project.slug)
);

export default function Home() {
  return (
    <>
      <Chooser />

      <section className="home-section">
        <div className="container">
          <SectionHead num="01" title="Two ways in" range="Live work" />
          <div className="live-split">
            <div className="live-panel live-panel--paper">
              <span className="eyebrow">Engineering</span>
              <h3>How a service fits together</h3>
              <p>
                Typed clients, a gateway, service boundaries and a build path.
                The paper side of the practice: correctness, integration and
                evidence.
              </p>
              <LineArt variant="connector" className="" />
              <Link className="mono accent" to="/engineering">
                Enter engineering →
              </Link>
            </div>

            <div className="live-panel live-panel--ink">
              <span className="eyebrow" style={{ color: "#a9a399" }}>
                Craft
              </span>
              <h3>The CPU running</h3>
              <p>
                A transistor-level computer executing a program. Live, not a
                recording. The black side of the practice: experience, finish
                and play.
              </p>
              <DemoSurface>
                <ComputerAutoDemo />
              </DemoSurface>
              <Link className="mono" style={{ color: "#d97757" }} to="/demos/cpu-simulator">
                Open the simulator →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <SectionHead num="02" title="Selected work" range="2025 to 2027" />
          <div className="cards">
            {caseStudies.map((study, index) => (
              <CaseCard key={study.slug} study={study} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-section section--dark">
        <div className="container">
          <SectionHead num="03" title="From craft" range="2018 to 2026" />
          <div className="project-grid">
            {featuredCraft.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="next-track">
        <div className="container">
          <TrackLink
            to="/contact"
            kicker="Next"
            title="Start a conversation"
            text="Available for AI platform roles and game development. The CV is one page; the work here is the long version."
          />
        </div>
      </section>
    </>
  );
}
