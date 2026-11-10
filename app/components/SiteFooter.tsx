
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <div>
          <div className="footer-links">
            <a href="#engineering-title">Engineering</a>
            <a href="#craft-title">Craft</a>
            <a href="#about-title">About</a>
            <a href="#contact-title">Contact</a>
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
