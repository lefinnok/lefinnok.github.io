import { LineArt } from "./LineArt";

export function Chooser() {
  return (
    <section className="chooser" aria-label="Choose a track">
      <h1 className="sr-only">Lefinno Kwok: engineering and craft</h1>
      <a href="#engineering" className="half half--engineering" aria-labelledby="chooser-engineering">
        <div className="half__top">
          <span className="mono">01 / Engineering</span>
          <span className="mono" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="half__mid">
          <h2 id="chooser-engineering">Engineering</h2>
          <p>
            AI systems, integration, infrastructure and research. Judged on
            correctness, reliability and delivery.
          </p>
        </div>
        <div className="half__bottom">
          <div className="preview">
            <span>Currently</span>
            <strong>Analyst, Deloitte</strong>
            <span>Enterprise AI platform, 2026 to present</span>
          </div>
          <span className="enter">Enter engineering</span>
        </div>
        <LineArt variant="arch" />
      </a>

      <div className="seam" aria-hidden="true" />

      <a href="#craft" className="half half--craft" aria-labelledby="chooser-craft">
        <div className="half__top">
          <span className="mono">02 / Craft</span>
          <span className="mono" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="half__mid">
          <h2 id="chooser-craft">Craft</h2>
          <p>
            Games, hardware and interactive work. Judged on experience,
            interaction and finish.
          </p>
        </div>
        <div className="half__bottom">
          <div className="preview">
            <span>In production</span>
            <strong>Eccentricity</strong>
            <span>Steam, Chefs Hat Studio</span>
          </div>
          <span className="enter">Enter craft</span>
        </div>
        <LineArt variant="waves" />
      </a>
    </section>
  );
}
