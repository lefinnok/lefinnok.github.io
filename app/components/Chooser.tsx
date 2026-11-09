import { Link } from "react-router";
import { LineArt } from "./LineArt";

export function Chooser() {
  return (
    <section className="chooser" aria-label="Choose a track">
      <Link to="/engineering" className="half half--engineering">
        <div className="half__top">
          <span className="mono">01 / Engineering</span>
          <span className="mono" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="half__mid">
          <h1>Engineering</h1>
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
      </Link>

      <div className="seam" aria-hidden="true" />

      <Link to="/craft" className="half half--craft">
        <div className="half__top">
          <span className="mono">02 / Craft</span>
          <span className="mono" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="half__mid">
          <h1>Craft</h1>
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
      </Link>
    </section>
  );
}
