import { useEffect, useRef } from "react";

/** Oversized outlined word that drifts against the scroll. */
export function GhostWord({ word }: { word: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const progress =
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      el.style.setProperty("--ghost-shift", `${(progress - 0.5) * 90}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <span ref={ref} className="ghost-word" aria-hidden="true">
      {word}
    </span>
  );
}
