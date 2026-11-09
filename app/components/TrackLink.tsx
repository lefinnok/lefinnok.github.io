import { Link } from "react-router";

export function TrackLink({
  to,
  kicker,
  title,
  text,
}: {
  to: string;
  kicker: string;
  title: string;
  text: string;
}) {
  return (
    <Link to={to} className="track-link">
      <span className="eyebrow">{kicker}</span>
      <strong>{title}</strong>
      <p>{text}</p>
      <span className="enter">Continue</span>
    </Link>
  );
}
