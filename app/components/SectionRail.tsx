import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "engineering", hash: "engineering-title", label: "Engineering" },
  { id: "craft", hash: "craft-title", label: "Craft" },
  { id: "systems", hash: "systems-title", label: "Systems" },
  { id: "about", hash: "about-title", label: "About" },
  { id: "contact", hash: "contact-title", label: "Contact" },
];

export function SectionRail() {
  const [active, setActive] = useState("engineering");
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav className="section-rail" aria-label="Sections">
      <span className="section-rail__track" aria-hidden="true">
        <span
          className="section-rail__fill"
          style={{ transform: `scaleY(${progress})` }}
        />
      </span>
      {SECTIONS.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.hash}`}
          className={active === section.id ? "is-active" : ""}
          aria-current={active === section.id ? "location" : undefined}
        >
          <span className="section-rail__label">{section.label}</span>
          <span className="section-rail__num">
            {String(index + 1).padStart(2, "0")}
          </span>
        </a>
      ))}
    </nav>
  );
}
