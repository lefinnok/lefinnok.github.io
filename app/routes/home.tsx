import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Chooser } from "~/components/Chooser";
import { SectionHead } from "~/components/SectionHead";
import { CaseCard } from "~/components/CaseCard";
import { ProjectCard } from "~/components/ProjectCard";
import { DemoSurface } from "~/components/DemoSurface";
import { TrackLink } from "~/components/TrackLink";
import ComputerAutoDemo from "~/components/homepage/ComputerAutoDemo";
import GestureSkeletonPreview from "~/components/homepage/GestureSkeletonPreview";
import { caseStudies } from "~/data/caseStudies";
import { craftProjects } from "~/data/craftProjects";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Lefinno Kwok | Engineering and craft",
    path: "/",
  });

const featuredCases = caseStudies;
const featuredCraft = craftProjects.filter((project) =>
  ["eccentricity", "8-bit-computer", "binmin"].includes(project.slug)
);

export default function Home() {
  return (
    <>
      <Chooser />

      <section className="home-section">
        <div className="container">
          <SectionHead num="01" title="Live" range="In the browser" />
          <div className="demo-grid">
            <div className="media-card">
              <h3>8-bit computer</h3>
              <p>
                A CPU built from discrete transistor logic, running a program.
                The full simulator lets you step microcode, edit assembly and
                inspect the bus.
              </p>
              <DemoSurface>
                <ComputerAutoDemo />
              </DemoSurface>
              <Link className="mono accent" to="/craft/8-bit-computer">
                Open the simulator
              </Link>
            </div>
            <div className="media-card">
              <h3>Gesture recognition</h3>
              <p>
                A recogniser that needs one reference image and no training.
                It compares hand graphs by their spectra, live from a webcam.
              </p>
              <DemoSurface>
                <GestureSkeletonPreview />
              </DemoSurface>
              <Link className="mono accent" to="/craft/gesture-recognition">
                Try the demo
              </Link>
            </div>
          </div>
          <div className="hero-actions" style={{ marginTop: 22 }}>
            <Link className="btn" to="/demos">
              All eight demos
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <SectionHead num="02" title="Selected work" range="2025 to 2027" />
          <div className="cards">
            {featuredCases.map((study, index) => (
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
