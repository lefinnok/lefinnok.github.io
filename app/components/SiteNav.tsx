import { NavLink, Link } from "react-router";

const LINKS = [
  { label: "Engineering", to: "/engineering" },
  { label: "Craft", to: "/craft" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function SiteNav() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link to="/" className="brand" aria-label="Lefinno Kwok, home">
          Lefinno Kwok
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/contact" className="btn">
          CV
        </Link>
      </div>
    </header>
  );
}
