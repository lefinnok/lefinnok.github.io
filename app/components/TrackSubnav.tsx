import { useEffect, useState } from "react";

interface TrackSubnavProps {
  items: { id: string; label: string }[];
  label: string;
}

export function TrackSubnav({ items, label }: TrackSubnavProps) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="subnav" aria-label={label}>
      <div className="container subnav__inner">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? "is-active" : ""}
            aria-current={active === item.id ? "location" : undefined}
          >
            {item.label}
          </a>
        ))}
        <span className="subnav__rule" aria-hidden="true" />
      </div>
    </nav>
  );
}
