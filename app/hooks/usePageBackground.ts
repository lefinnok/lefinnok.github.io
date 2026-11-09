import { useEffect } from "react";

const PAPER: [number, number, number] = [242, 239, 233];
const INK: [number, number, number] = [21, 20, 18];
const ZONE = 620;

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return a.map((value, index) => Math.round(value + (b[index] - value) * clamped)) as [
    number,
    number,
    number,
  ];
}

/**
 * Interpolates the whole page background between paper and ink based on
 * scroll position. There are no gradient bands: the page changes colour
 * gradually as the reader moves from Engineering into Craft and back.
 */
export function usePageBackground() {
  useEffect(() => {
    const gapOne = document.getElementById("bg-gap-1");
    const gapTwo = document.getElementById("bg-gap-2");
    if (!gapOne || !gapTwo) return;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const center = window.scrollY + window.innerHeight / 2;
      const craftStart = gapOne.offsetTop;
      const craftEnd = gapOne.offsetTop + gapOne.offsetHeight;
      const aboutStart = gapTwo.offsetTop;
      const aboutEnd = gapTwo.offsetTop + gapTwo.offsetHeight;

      let color: [number, number, number];
      if (center < craftStart) {
        color = PAPER;
      } else if (center < craftEnd) {
        color = mix(PAPER, INK, (center - craftStart) / (craftEnd - craftStart));
      } else if (center < aboutStart) {
        color = INK;
      } else if (center < aboutEnd) {
        color = mix(INK, PAPER, (center - aboutStart) / (aboutEnd - aboutStart));
      } else {
        color = PAPER;
      }

      root.style.setProperty("--page-bg", `rgb(${color.join(" ")})`);
      const luminance = (0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]) / 255;
      root.dataset.bg = luminance < 0.4 ? "ink" : "paper";
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
}
