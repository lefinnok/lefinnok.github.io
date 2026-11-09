export function SectionFade({
  from,
  to,
}: {
  from: "paper" | "ink";
  to: "paper" | "ink";
}) {
  return (
    <div
      className={`section-fade section-fade--${from}-${to}`}
      aria-hidden="true"
    />
  );
}
