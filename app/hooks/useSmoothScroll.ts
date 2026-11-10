import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scrolling with anchor handling that opens collapsed targets
 * before the scroll starts.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      autoRaf: true,
    });

    const onClick = (event: MouseEvent) => {
      const eventTarget = event.target as Element | null;
      const anchor = eventTarget?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const id = hash.slice(1);
      const section = document.getElementById(id);
      if (!section) return;

      const sectionIds = new Set([
        "engineering",
        "craft",
        "systems",
        "about",
        "contact",
      ]);
      const isSection = sectionIds.has(id);
      const title = isSection
        ? section.querySelector<HTMLElement>(".section-hero__title")
        : null;
      const jumpTarget = title ?? section;

      event.preventDefault();
      window.dispatchEvent(new CustomEvent("anchor:open", { detail: id }));
      history.pushState(null, "", hash);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const isTitle = jumpTarget.classList.contains("section-hero__title");
          const top =
            window.scrollY +
            jumpTarget.getBoundingClientRect().top -
            (isSection || isTitle ? 88 : 76);
          lenis.scrollTo(top, { duration: 1.1 });
        });
      });
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);
}
