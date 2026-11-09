import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <div>
          <div className="footer-links">
            <Link to="/engineering">Engineering</Link>
            <Link to="/craft">Craft</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <a href="https://github.com/lefinnok" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
          <p className="footer-note" style={{ marginTop: 14 }}>
            &copy; {new Date().getFullYear()} Lefinno Kwok. Built in Hong Kong.
          </p>
        </div>
        <p className="footer-note">
          <a href="mailto:lefinnokwok@gmail.com">lefinnokwok@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
