import type { Route } from "./+types/home";
import { Chooser } from "~/components/Chooser";
import { SectionHead } from "~/components/SectionHead";
import { SectionRail } from "~/components/SectionRail";
import { CaseStudyBlock } from "~/components/CaseStudyBlock";
import { ProjectBlock } from "~/components/ProjectBlock";
import { DemoBlock } from "~/components/DemoBlock";
import { DemoSurface } from "~/components/DemoSurface";
import { Timeline } from "~/components/Timeline";
import { FbxModelViewer } from "~/components/FbxModelViewer";
import { LineArt } from "~/components/LineArt";
import { ScrollDraw } from "~/components/ScrollDraw";
import { caseStudies } from "~/data/caseStudies";
import { craftProjects } from "~/data/craftProjects";
import { demos } from "~/data/demos";
import { roles } from "~/data/roles";
import { pageMeta } from "~/lib/meta";
import { usePageBackground } from "~/hooks/usePageBackground";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Lefinno Kwok | Engineering and craft",
    path: "/",
  });

const engineeringCases = caseStudies.filter((study) => study.track === "engineering");
const eccentricity = craftProjects.find((project) => project.slug === "eccentricity");
const craftOnly = craftProjects.filter((project) => project.slug !== "eccentricity");
const craftDemos = ["cpu-simulator", "gesture-recognition", "ml-playground", "cnn-visualiser"];
const inlineDemos = ["uml-generator", "service-architecture", "hardware-pipeline", "3d-models"];

function demoBySlug(slug: string) {
  return demos.find((demo) => demo.slug === slug)!;
}

const eras = [
  { year: "2018", title: "First game", text: "Space Saver, Ludum Dare, high school." },
  { year: "2020", title: "Transistor computer", text: "Discrete logic, custom instruction set." },
  { year: "2022", title: "Retro handheld", text: "Custom PCB, firmware, enclosure." },
  { year: "2025", title: "Eccentricity", text: "Jam build to commercial production." },
  { year: "2026", title: "Studio work", text: "Steam page, Binmin, contract development." },
];

export default function Home() {
  usePageBackground();

  return (
    <>
      <SectionRail />
      <Chooser />

      <section id="engineering" data-theme="paper" className="page-section page-section--paper">
        <div className="container section-hero">
          <span className="eyebrow">Engineering / 01</span>
          <h2 className="section-hero__title">I build AI systems that can be audited.</h2>
          <p className="lede">
            Integration, infrastructure and research for systems where being
            wrong is expensive. The work below is public; client engagements
            are described only at the level of the engagement.
          </p>
          <div className="hero-actions">
            <a className="btn btn--solid" href="#case-pdss">
              Read the PDSS case
            </a>
            <a className="btn" href="#contact">
              Get in touch
            </a>
          </div>
        </div>

        <div className="container">
          <SectionHead num="01" title="Selected work" range="2025 to 2027" />
          {engineeringCases.map((study) => (
            <CaseStudyBlock key={study.slug} study={study} />
          ))}
        </div>

        <div className="container">
          <SectionHead num="02" title="Experience" range="2021 to now" />
          <Timeline roles={roles} />
        </div>

        <div className="container">
          <SectionHead num="03" title="Capabilities" />
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
          <ScrollDraw>
            <LineArt variant="connector" className="" />
          </ScrollDraw>
        </div>

        <div className="container">
          <SectionHead num="04" title="Current" />
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

      <div id="bg-gap-1" className="bg-gap" aria-hidden="true" />

      <section id="craft" data-theme="ink" className="page-section page-section--ink">
        <div className="container section-hero">
          <span className="eyebrow">Craft / 02</span>
          <h2 className="section-hero__title">I make things you can play with.</h2>
          <p className="lede">
            Games, hardware and interactive work, judged on experience and
            finish. Some of it is commercial, some of it is a jam, all of it is
            built to be used by someone other than me.
          </p>
          <div className="hero-actions">
            <a className="btn btn--solid" href="#case-eccentricity">
              Eccentricity
            </a>
            <a className="btn" href="#demos">
              All demos
            </a>
          </div>
        </div>

        <div className="container">
          <SectionHead num="01" title="In production" range="2025 to now" />
          <div className="feature">
            <div className="feature__body">
              <span className="mono accent">{eccentricity?.year}</span>
              <h2>Eccentricity</h2>
              <p>
                A steampunk engineering roguelike about building chain-reaction
                power grids. It started as a Ludum Dare entry and became a
                commercial release with a data pipeline, tests and a repeatable
                build process.
              </p>
              <div className="hero-actions" style={{ marginTop: 8 }}>
                <a className="btn" href="#case-eccentricity">
                  Read the case study
                </a>
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
            <DemoSurface>
              <FbxModelViewer
                config={{ path: "/models/dynamo.obj", cameraZ: 2.2, cameraY: 0, scale: 1.6 }}
                height={340}
              />
            </DemoSurface>
          </div>
        </div>

        <div className="container">
          <SectionHead num="02" title="Demos" range="Run them here" />
          {craftDemos.map((slug, index) => {
            const demo = demoBySlug(slug);
            return (
              <div key={slug} id={`demo-${slug}`} className="demo-anchor">
                <DemoBlock
                  componentName={demo.component!}
                  title={demo.title}
                  description={demo.description}
                  year={demo.year}
                  context={demo.context}
                  kicker={demo.kicker}
                  related={demo.related}
                />
              </div>
            );
          })}
        </div>

        <div className="container">
          <SectionHead num="03" title="Projects" range="Selected" />
          <div className="project-blocks">
            {craftOnly.map((project, index) => (
              <ProjectBlock key={project.slug} project={project} showModel={index < 2} />
            ))}
          </div>
        </div>

        <div className="container">
          <SectionHead num="04" title="Chronology" range="2018 to 2026" />
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

      <section id="demos" data-theme="ink" className="page-section page-section--ink">
        <div className="container section-hero">
          <span className="eyebrow">Demos / 03</span>
          <h2 className="section-hero__title">Eight things that run here.</h2>
          <p className="lede">
            Not screenshots. Working systems from the projects, with the date
            and the context they were built in. The four on Craft are above;
            the rest live here.
          </p>
        </div>

        <div className="container">
          <div className="demos-grid">
            {demos.map((demo) => (
              <a key={demo.slug} href={`#demo-${demo.slug}`} className="demo-card">
                <span className="eyebrow">
                  {demo.kicker} · {demo.year}
                </span>
                <h3>{demo.title}</h3>
                <p>{demo.description}</p>
                <span className="demo-card__open">Jump to demo →</span>
              </a>
            ))}
          </div>
        </div>

        <div className="container">
          {inlineDemos
            .filter((slug) => slug !== "3d-models")
            .map((slug) => {
              const demo = demoBySlug(slug);
              return (
                <div key={slug} id={`demo-${slug}`} className="demo-anchor">
                  <DemoBlock
                    componentName={demo.component!}
                    title={demo.title}
                    description={demo.description}
                    year={demo.year}
                    context={demo.context}
                    kicker={demo.kicker}
                    related={demo.related}
                  />
                </div>
              );
            })}

          <div id="demo-3d-models" className="demo-anchor">
            <div className="demo-frame">
              <header className="demo-frame__head">
                <div>
                  <span className="eyebrow">3D · 2020 to 2026</span>
                  <h3>3D model gallery</h3>
                  <p>
                    Wireframe models from six years of making, available on
                    their project pages.
                  </p>
                </div>
              </header>
              <div className="model-links">
                {craftProjects.filter((project) => project.model).map((project) => (
                  <a key={project.slug} href={`#project-${project.slug}`}>
                    <span className="mono">{project.year}</span>
                    <strong>{project.title}</strong>
                    <span className="mono accent">Jump to project →</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="bg-gap-2" className="bg-gap" aria-hidden="true" />

      <section id="about" data-theme="paper" className="page-section page-section--paper">
        <div className="container about-hero">
          <div>
            <span className="eyebrow">About / 04</span>
            <h2 className="section-hero__title">Two registers, one builder.</h2>
            <p>
              I am an AI platform engineer in Hong Kong. I build systems where
              correctness matters, and I make games and hardware where
              experience matters. The two are not a side project and a job;
              they are the same practice applied to different materials.
            </p>
            <p>
              I studied computer science at HKU, worked across an embedded
              startup, a science park and a consultancy, and now deploy an
              enterprise AI platform. What I care about is the unglamorous
              middle: provenance, audit trails, integration, tests, release
              processes.
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
        </div>

        <div className="container">
          <SectionHead num="01" title="Trajectory" range="2015 to now" />
          <div className="trajectory">
            <div className="era">
              <div className="era__year">2015 to 2020</div>
              <h3>Making</h3>
              <p>Microcontrollers, a game jam entry, and a computer from discrete transistors.</p>
            </div>
            <div className="era">
              <div className="era__year">2021 to 2024</div>
              <h3>Working</h3>
              <p>Embedded video, automation at HKSTP, then enterprise delivery at Deloitte.</p>
            </div>
            <div className="era">
              <div className="era__year">2025</div>
              <h3>Research</h3>
              <p>A solo capstone on probabilistic decision support, evaluated against five language models.</p>
            </div>
            <div className="era">
              <div className="era__year">2026</div>
              <h3>Now</h3>
              <p>Analyst at Deloitte, studio owner at Chefs Hat, and an event platform for 300 to 400 jammers.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" data-theme="paper" className="page-section page-section--paper">
        <div className="container contact">
          <span className="eyebrow">Contact / 05</span>
          <h2 className="section-hero__title">Start a conversation.</h2>
          <a className="contact__mail" href="mailto:lefinnokwok@gmail.com">
            lefinnokwok@gmail.com
          </a>
          <div className="contact__grid">
            <a href="mailto:lefinnokwok@gmail.com">
              <span>Email</span>
              lefinnokwok@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/lefinno/" target="_blank" rel="noreferrer">
              <span>LinkedIn</span>
              /in/lefinno
            </a>
            <a href="https://github.com/lefinnok" target="_blank" rel="noreferrer">
              <span>GitHub</span>
              github.com/lefinnok
            </a>
            <a href="/lefinnok-kwok-cv.pdf" download>
              <span>CV</span>
              Download PDF
            </a>
          </div>
          <p className="footer-note" style={{ marginTop: 40, maxWidth: "56ch" }}>
            Based in Hong Kong. Available for conversations about AI
            engineering, platform roles and game development. Client work is
            discussed at the level of engineering, never at the level of the
            client.
          </p>
        </div>
      </section>
    </>
  );
}
