export function ThumbMarks() {
  return (
    <span className="thumb-marks" aria-hidden="true">
      <i className="thumb-marks__corner thumb-marks__corner--tl" />
      <i className="thumb-marks__corner thumb-marks__corner--tr" />
      <i className="thumb-marks__corner thumb-marks__corner--bl" />
      <i className="thumb-marks__corner thumb-marks__corner--br" />
      <i className="thumb-marks__rule thumb-marks__rule--top" />
      <i className="thumb-marks__rule thumb-marks__rule--bottom" />
      <svg
        className="thumb-marks__shapes"
        viewBox="0 0 210 150"
        preserveAspectRatio="none"
        fill="none"
      >
        <g stroke="var(--thumb-accent)" strokeOpacity="0.6" strokeWidth="0.8">
          <rect
            x="5.5"
            y="5.5"
            width="199"
            height="139"
            strokeDasharray="30 8 3 8"
          />
          <path d="M0 0L12 12M210 0L198 12M0 150L12 138M210 150L198 138" />
          <path d="M100 11l4-4 4 4-4 4z" />
          <circle cx="203" cy="75" r="3.5" />
          <path d="M3 13L9 3l6 10z" />
          <circle cx="200" cy="8" r="4" />
          <path d="M3 137l5-5 5 5-5 5z" />
          <path d="M186 147l14-14M192 150l14-14" />
          <path d="M6 52v3M6 59v3M6 66v3" />
          <path d="M0 22L22 0M0 30L30 0M0 38L38 0" />
          <path d="M210 112L188 134M210 120L188 142M210 128L188 150" />
          <path d="M182 0a28 28 0 0 1 28 28" />
          <path d="M0 112l12 12M0 120l12 12" />
        </g>
        <g stroke="var(--thumb-line)" strokeOpacity="0.7" strokeWidth="0.8">
          <path d="M62 6h8M74 6h4M132 144h8M144 144h4" />
          <path d="M6 54v8M6 66v4M204 96v8M204 108v4" />
        </g>
      </svg>
    </span>
  );
}
