import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span className="footer-copy">© {new Date().getFullYear()} Notevo · Free forever</span>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/about">About</Link>
        <Link href="/sponsor" className="footer-sponsor">❤️ Sponsor</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/cookies">Cookies</Link>
        <a
          href="https://github.com/SamoTech/notevo"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </nav>
    </footer>
  )
}
