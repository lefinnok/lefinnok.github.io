interface SectionHeadProps {
  num: string;
  title: string;
  range?: string;
}

export function SectionHead({ num, title, range }: SectionHeadProps) {
  return (
    <div className="section-head">
      <span className="section-head__num">{num}</span>
      <h2>{title}</h2>
      {range ? <span className="section-head__range">{range}</span> : null}
    </div>
  );
}
