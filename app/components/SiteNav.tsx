import { Link } from "react-router";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "engineering", label: "Engineering" },
  { id: "craft", label: "Craft" },
  { id: "systems", label: "Systems" },
  { id: "demos", label: "Demos" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("engineering");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 8);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const nodes = SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            setDark((entry.target as HTMLElement).dataset.theme === "ink");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`site-header ${scrolled ? "is-scrolled" : ""} ${dark ? "is-dark" : ""}`}
    >
      <div className="container nav">
        <Link to="/" className="brand" aria-label="Lefinno Kwok, home">
          Lefinno Kwok
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <a href="#contact" className="btn nav-cv">
            CV
          </a>
          <button
            type="button"
            className={`nav-toggle ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <div className="nav-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? "is-open" : ""}`}
        hidden={!open}
      >
        <nav aria-label="Mobile">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setOpen(false)}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <p className="mono">Hong Kong · lefinnokwok@gmail.com</p>
      </div>
    </header>
  );
}
