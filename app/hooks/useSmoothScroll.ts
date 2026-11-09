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
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (!el) return;

      event.preventDefault();
      window.dispatchEvent(new CustomEvent("anchor:open", { detail: id }));
      history.pushState(null, "", hash);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis.scrollTo(el, { offset: -76, duration: 1.1 });
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
