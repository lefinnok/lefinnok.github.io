import type { Route } from "./+types/contact";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Contact | Lefinno Kwok",
    description: "Email, LinkedIn, GitHub and CV for Lefinno Kwok, based in Hong Kong.",
    path: "/contact",
  });

export default function Contact() {
  return (
    <>
      <section className="container contact">
        <span className="eyebrow">Contact</span>
        <h1>Start a conversation.</h1>
        <a className="contact__mail" href="mailto:lefinnokwok@gmail.com">
          lefinnokwok@gmail.com
        </a>
        <div className="contact__grid">
          <a href="mailto:lefinnokwok@gmail.com">
            <span>Email</span>
            lefinnokwok@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/lefinno/"
            target="_blank"
            rel="noreferrer"
          >
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
          Based in Hong Kong. Available for conversations about AI engineering,
          platform roles and game development. Client work is discussed at the
          level of engineering, never at the level of the client.
        </p>
      </section>
    </>
  );
}
