export function ModelFrame({
  label,
  meta,
  dimensions,
  children,
}: {
  label: string;
  meta: string;
  dimensions?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="model-frame">
      <div className="model-frame__bar">
        <span className="model-frame__label">
          <i aria-hidden="true" />
          {label}
        </span>
        <span>{meta}</span>
      </div>

      <div className="model-frame__stage">
        <span className="model-frame__grid" aria-hidden="true" />
        <span className="model-frame__side" aria-hidden="true">
          CAD / OBJECT
        </span>
        <span className="model-frame__corner model-frame__corner--tl" aria-hidden="true" />
        <span className="model-frame__corner model-frame__corner--tr" aria-hidden="true" />
        <span className="model-frame__corner model-frame__corner--bl" aria-hidden="true" />
        <span className="model-frame__corner model-frame__corner--br" aria-hidden="true" />
        <span className="model-frame__reticle" aria-hidden="true" />
        <div className="model-frame__canvas">{children}</div>
      </div>

      <figcaption className="model-frame__foot">
        <span>{dimensions ?? "Rotating assembly"}</span>
        <span>3D / auto-rotate</span>
      </figcaption>
    </figure>
  );
}
