'use client'

import Link from 'next/link'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Link href="/" className="logo">
              TheMohitFact Hub
              <span className="logo-badge">Pro</span>
            </Link>
            <p className="muted" style={{ maxWidth: '42ch', marginTop: 10, fontSize: '0.92rem' }}>
              Your premium destination for high-impact books, curated PDFs, deep study notes, and life-changing insights.
            </p>
          </div>

          <div className="row" style={{ gap: 20 }}>
            <Link className="nav-link" href="/">Home</Link>
            <Link className="nav-link" href="/#explore">Explore</Link>
            <Link className="nav-link" href="/books">Books &amp; PDFs</Link>
            <Link className="nav-link" href="/#about">About</Link>
            <Link className="nav-link" href="/#contact">Contact</Link>
            <button className="btn" onClick={scrollToTop} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              ↑ Top
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} TheMohitFact Hub. All rights reserved.</p>
          <div className="row" style={{ gap: 16 }}>
            <span style={{ color: 'var(--tx3)' }}>Knowledge that moves you forward</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
