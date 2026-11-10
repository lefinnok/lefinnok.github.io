import type { Route } from "./+types/home";
import { Chooser } from "~/components/Chooser";
import { SectionHead } from "~/components/SectionHead";
import { SectionRail } from "~/components/SectionRail";
import { GhostWord } from "~/components/GhostWord";
import { CaseStudyBlock } from "~/components/CaseStudyBlock";
import { ProjectBlock } from "~/components/ProjectBlock";
import { DemoBlock } from "~/components/DemoBlock";
import { ModelFrame } from "~/components/ModelFrame";
import { UmlArchitecture } from "~/components/UmlArchitecture";
import { Workflow } from "~/components/Workflow";
import { TShape } from "~/components/TShape";
import { Timeline } from "~/components/Timeline";
import { FbxModelViewer } from "~/components/FbxModelViewer";
import { caseStudies } from "~/data/caseStudies";
import { craftProjects } from "~/data/craftProjects";
import { demos } from "~/data/demos";
import { roles } from "~/data/roles";
import { pageMeta } from "~/lib/meta";
import { usePageBackground } from "~/hooks/usePageBackground";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Lefinno Kwok | Generalist with a specialization",
    path: "/",
  });

const engineeringCases = caseStudies.filter((study) => study.track === "engineering");
const eccentricity = craftProjects.find((project) => project.slug === "eccentricity");
const craftOnly = craftProjects.filter((project) => project.slug !== "eccentricity");
const craftDemos = ["gesture-recognition", "cpu-simulator", "ml-playground", "cnn-visualiser"];
const systemsDemos = demos.filter((demo) => demo.category === "diagram");

function demoBySlug(slug: string) {
  return demos.find((demo) => demo.slug === slug)!;
}

const eras = [
  { year: "2018", title: "First game", text: "Space Saver, Ludum Dare, high school." },
  { year: "2020", title: "Transistor computer", text: "Discrete logic, custom instruction set." },
  { year: "2022", title: "Retro handheld", text: "Custom PCB, firmware, enclosure." },
  { year: "2024", title: "Intern gift", text: "ESP32 LED medallion for the HKSTP cohort." },
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
          <GhostWord word="ENGINEERING" />
          <span className="eyebrow">Engineering / 01</span>
          <h2 className="section-hero__title">Broad by default. Deep where it matters.</h2>
          <p className="lede">
            I am a generalist with a specialization in AI and ML. I move
            between product, software, hardware and research, and go deep where
            the risk is. Most of what I do is make an idea real, then explain it
            clearly enough that someone else can run it.
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
          <SectionHead num="03" title="Capabilities" range="Range and depth" />
          <p className="capabilities__lede">
            Generalist breadth with specialist depth. I am most useful at the
            seam between disciplines: scoping the idea, building the system, and
            translating it for the people who have to run it.
          </p>
          <TShape />
          <div className="skill-grid">
            <div className="skill-block">
              <div className="skill-block__top">
                <span className="skill-block__num">01</span>
                <span className="skill-block__tag">Range</span>
              </div>
              <h3>Product and delivery</h3>
              <p>
                Scoping ambiguous briefs, writing proposals, coordinating across
                teams, and carrying an idea from demo to something someone else
                can run.
              </p>
            </div>
            <div className="skill-block">
              <div className="skill-block__top">
                <span className="skill-block__num">02</span>
                <span className="skill-block__tag">Range</span>
              </div>
              <h3>Software</h3>
              <p>
                TypeScript and React, Go, Rust, Java and Python. Frontends,
                APIs, data access and integration; typed boundaries over glue.
              </p>
            </div>
            <div className="skill-block">
              <div className="skill-block__top">
                <span className="skill-block__num">03</span>
                <span className="skill-block__tag">Specialization</span>
              </div>
              <h3>AI and ML</h3>
              <p>
                LLM orchestration, evaluation design, Bayesian decision models,
                computer vision, uncertainty and provenance. The area where I go
                deepest.
              </p>
            </div>
            <div className="skill-block">
              <div className="skill-block__top">
                <span className="skill-block__num">04</span>
                <span className="skill-block__tag">Depth</span>
              </div>
              <h3>Systems and infrastructure</h3>
              <p>
                Linux, Docker, Kubernetes, networking, offline deployment, high
                availability, observability and backups.
              </p>
            </div>
            <div className="skill-block">
              <div className="skill-block__top">
                <span className="skill-block__num">05</span>
                <span className="skill-block__tag">Range</span>
              </div>
              <h3>Hardware and interaction</h3>
              <p>
                KiCad boards, ESP32 firmware, FreeCAD and 3D printing, game
                engines and interactive installations.
              </p>
            </div>
            <div className="skill-block">
              <div className="skill-block__top">
                <span className="skill-block__num">06</span>
                <span className="skill-block__tag">Range</span>
              </div>
              <h3>Research and communication</h3>
              <p>
                Literature-grounded design, baseline evaluation, failure
                analysis and technical writing. Explaining tradeoffs to
                technical and non-technical teams.
              </p>
            </div>
          </div>
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
          <GhostWord word="CRAFT" />
          <span className="eyebrow">Craft / 02</span>
          <h2 className="section-hero__title">Fun to use. Useful when it counts.</h2>
          <p className="lede">
            Games, tools and physical objects, judged on whether someone enjoys
            using them and whether they help. Some of it is commercial, some of
            it is a jam, all of it is built for someone other than me.
          </p>
          <div className="hero-actions">
            <a className="btn btn--solid" href="#case-eccentricity">
              Eccentricity
            </a>
            <a className="btn" href="#systems">
              Systems work
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
            <ModelFrame
              label="Dynamo"
              meta="2026 · OBJ"
              dimensions="Godot game asset"
            >
              <FbxModelViewer
                config={{ path: "/models/dynamo.obj", cameraZ: 2.2, cameraY: 0, scale: 1.6 }}
                height={340}
              />
            </ModelFrame>
          </div>
        </div>

        <div className="container">
          <SectionHead num="02" title="Demos" range="Run them here" />
          <p className="instruments__lede">
            Five working systems from both sides: a gesture installation, a
            transistor computer, a training playground, a CNN inspector and a
            language-to-diagram tool.
          </p>
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
                  index={String(index + 1).padStart(2, "0")}
                />
              </div>
            );
          })}

          <details className="uml-how">
            <summary>
              <span>
                <span className="uml-how__meta">UML generator / architecture</span>
                <span className="uml-how__title">How it works</span>
              </span>
              <span className="uml-how__action">
                <span className="uml-how__action-open">Open</span>
                <span className="uml-how__action-close">Close</span>
              </span>
            </summary>
            <UmlArchitecture />
          </details>

          {demos
            .filter((demo) => demo.slug === "uml-generator")
            .map((demo) => (
              <div key={demo.slug} id={`demo-${demo.slug}`} className="demo-anchor">
                <DemoBlock
                  componentName={demo.component!}
                  title={demo.title}
                  description={demo.description}
                  year={demo.year}
                  context={demo.context}
                  kicker={demo.kicker}
                  related={demo.related}
                  index="05"
                />
              </div>
            ))}
        </div>

        <div className="container">
          <SectionHead num="03" title="Projects" range="Selected" />
          <div className="project-blocks">
            {craftOnly.map((project, index) => (
              <ProjectBlock key={project.slug} project={project} />
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

      <section id="systems" data-theme="ink" className="page-section page-section--ink">
        <div className="container section-hero">
          <GhostWord word="SYSTEMS" />
          <span className="eyebrow">Method / 03</span>
          <h2 className="section-hero__title">One workflow, many systems.</h2>
          <p className="lede">
            A repeatable path from an unclear problem to something that can be
            operated and maintained. The same five moves apply to a service, a
            board or a model. The drawings below are two artifacts from that
            path, not a catalogue of the only shapes I work in.
          </p>
        </div>

        <div className="container">
          <SectionHead num="01" title="Workflow" range="How I work" />
          <Workflow />

          <SectionHead num="02" title="Artifacts" range="Two examples" />
          {systemsDemos.map((demo, index) => (
            <div key={demo.slug} id={`demo-${demo.slug}`} className="demo-anchor">
              <DemoBlock
                componentName={demo.component!}
                title={demo.title}
                description={demo.description}
                year={demo.year}
                context={demo.context}
                kicker={demo.kicker}
                related={demo.related}
                index={String(index + 1).padStart(2, "0")}
              />
            </div>
          ))}
        </div>
      </section>

      <div id="bg-gap-2" className="bg-gap" aria-hidden="true" />

      <section id="about" data-theme="paper" className="page-section page-section--paper">
        <div className="container about-hero">
          <GhostWord word="ABOUT" />
          <div>
            <span className="eyebrow">About / 04</span>
            <h2 className="section-hero__title">A generalist with a specialization.</h2>
            <p>
              I am a builder in Hong Kong. Generalist by default, with a
              specialization in AI and ML. I move between product, software,
              hardware and research; the common thread is making an idea real
              and explaining it clearly enough that someone else can run it.
            </p>
            <p>
              I studied computer science at HKU, worked across an embedded
              startup, a science park and a consultancy, and now build an
              enterprise AI platform. I care about the unglamorous middle:
              integration, tests, release processes, and the parts that decide
              whether a system survives contact with reality.
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
            Based in Hong Kong. Available for conversations about product,
            engineering, platform roles and game development. Client work is
            discussed at the level of engineering, never at the level of the
            client.
          </p>
        </div>
      </section>
    </>
  );
}
