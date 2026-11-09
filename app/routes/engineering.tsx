import type { Route } from "./+types/engineering";
import { Link } from "react-router";
import { SectionHead } from "~/components/SectionHead";
import { Timeline } from "~/components/Timeline";
import { CaseCard } from "~/components/CaseCard";
import { TrackSubnav } from "~/components/TrackSubnav";
import { DemoBlock } from "~/components/DemoBlock";
import { DemoSurface } from "~/components/DemoSurface";
import { TrackLink } from "~/components/TrackLink";
import { LanguagesDiagram } from "~/components/LanguagesDiagram";
import { HardwarePipelineDiagram } from "~/components/HardwarePipelineDiagram";
import { caseStudies } from "~/data/caseStudies";
import { roles } from "~/data/roles";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Engineering | Lefinno Kwok",
    description:
      "Enterprise AI delivery, integration, infrastructure and a research-grade decision system. Case studies, demos and evidence.",
    path: "/engineering",
  });

const engineeringCases = caseStudies.filter((study) => study.track === "engineering");

const SECTIONS = [
  { id: "work", label: "Selected work" },
  { id: "interactive", label: "Interactive" },
  { id: "experience", label: "Experience" },
  { id: "capabilities", label: "Capabilities" },
  { id: "current", label: "Current" },
];

export default function Engineering() {
  return (
    <>
      <section className="container page-hero">
        <span className="eyebrow">Engineering / 01</span>
        <h1>I build AI systems that can be audited.</h1>
        <p className="lede">
          Integration, infrastructure and research for systems where being
          wrong is expensive. The work below is public; client engagements are
          described only at the level of the engagement.
        </p>
        <div className="hero-actions">
          <Link className="btn btn--solid" to="/engineering/case/pdss">
            Read the PDSS case
          </Link>
          <Link className="btn" to="/contact">
            Get in touch
          </Link>
        </div>
      </section>

      <TrackSubnav items={SECTIONS} label="Engineering sections" />

      <section className="section" id="work">
        <div className="container">
          <SectionHead num="01" title="Selected work" range="2025 to 2027" />
          <div className="cards cards--two">
            {engineeringCases.map((study, index) => (
              <CaseCard key={study.slug} study={study} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="interactive">
        <div className="container">
          <SectionHead num="02" title="Interactive" range="Run it here" />
          <p className="lede" style={{ marginTop: 0, marginBottom: 26 }}>
            The UML generator turns a natural-language description into a class
            diagram through an iterative conversation. This is the live demo,
            not a video.
          </p>
          <DemoBlock componentName="UmlGeneratorDemo" title="UML diagram generator" />
          <div className="hero-actions" style={{ marginTop: 20 }}>
            <Link className="btn" to="/demos">
              All demos
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="experience">
        <div className="container">
          <SectionHead num="03" title="Experience" range="2021 to now" />
          <Timeline roles={roles} />
        </div>
      </section>

      <section className="section" id="capabilities">
        <div className="container">
          <SectionHead num="04" title="Capabilities" />
          <div className="skill-grid">
            <div className="skill-block">
              <h3>AI systems</h3>
              <p>
                LLM orchestration, evaluation design, Bayesian networks,
                decision processes, multi-criteria analysis, uncertainty
                quantification and provenance.
              </p>
            </div>
            <div className="skill-block">
              <h3>Integration</h3>
              <p>
                Single sign-on, directory synchronisation, data access
                services, alerting and vendor adaptation, in Go, Rust and Java.
              </p>
            </div>
            <div className="skill-block">
              <h3>Infrastructure</h3>
              <p>
                Linux, Docker, Kubernetes, systemd, Caddy, offline deployment,
                high availability, audit trails and backups.
              </p>
            </div>
            <div className="skill-block">
              <h3>Research</h3>
              <p>
                Literature-grounded design, baseline evaluation, failure
                analysis and technical writing. Comfortable publishing
                limitations, not just results.
              </p>
            </div>
          </div>

          <div className="demo-grid" style={{ marginTop: 44 }}>
            <div className="media-card">
              <h3>How a service fits together</h3>
              <p>
                The architecture I reach for: typed clients, a gateway, service
                boundaries and a build path.
              </p>
              <DemoSurface>
                <LanguagesDiagram />
              </DemoSurface>
            </div>
            <div className="media-card">
              <h3>How a product gets built</h3>
              <p>
                From schematic to firmware to assembly, with the tools I
                actually use at each stage.
              </p>
              <DemoSurface>
                <HardwarePipelineDiagram />
              </DemoSurface>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="current">
        <div className="container">
          <SectionHead num="05" title="Current" />
          <div className="current">
            <div>
              <h3>Analyst, Deloitte</h3>
              <p>
                Deploying an enterprise AI agent platform for a large client:
                identity, data access, alerting and offline porting. The
                client, the vendor and the systems stay out of this site by
                design; the CV carries the detail.
              </p>
            </div>
            <div className="about-facts">
              <div>
                Since
                <strong>September 2026</strong>
              </div>
              <div>
                Focus
                <strong>Enterprise AI integration</strong>
              </div>
              <div>
                Stack
                <strong>Go, Rust, Java, Kubernetes</strong>
              </div>
              <div>
                Based in
                <strong>Hong Kong</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="next-track">
        <div className="container">
          <TrackLink
            to="/craft"
            kicker="Next track"
            title="Craft"
            text="Games, hardware and interactive work. The same practice, different materials."
          />
        </div>
      </section>
    </>
  );
}
