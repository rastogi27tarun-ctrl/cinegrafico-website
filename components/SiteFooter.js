export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-copyright">© {new Date().getFullYear()} Cinegrafico Studios</span>
          <a href="https://www.cinegraficostudios.in" className="site-footer-domain">
            cinegraficostudios.in
          </a>
        </div>
        <nav className="site-footer-links" aria-label="Social links">
          <a href="https://www.instagram.com/cinegraficostudios/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.linkedin.com/in/tarun-rastogi-192726175/" target="_blank" rel="noreferrer">
            LinkedIn — Tarun Rastogi
          </a>
          <a href="https://www.linkedin.com/company/cinegrafico-studios/" target="_blank" rel="noreferrer">
            LinkedIn — Cinegrafico Studios
          </a>
        </nav>
      </div>
    </footer>
  );
}
