import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "engineering", label: "Engineering" },
  { id: "craft", label: "Craft" },
  { id: "demos", label: "Demos" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function SectionRail() {
  const [active, setActive] = useState("engineering");

  useEffect(() => {
    const nodes = SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="section-rail" aria-label="Sections">
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={active === section.id ? "is-active" : ""}
          aria-current={active === section.id ? "location" : undefined}
        >
          <span className="section-rail__dot" aria-hidden="true" />
          <span className="section-rail__label">{section.label}</span>
        </a>
      ))}
    </nav>
  );
}
