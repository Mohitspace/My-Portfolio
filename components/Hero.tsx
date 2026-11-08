'use client'

import React from 'react'

export default function Hero({ count }: { count: number }) {
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--ry', `${x * 20}deg`)
    e.currentTarget.style.setProperty('--rx', `${-y * 16}deg`)
  }

  const reset = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--ry', '0deg')
    e.currentTarget.style.setProperty('--rx', '0deg')
  }

  return (
    <section className="wrap hero">
      <div>
        <div className="hero-eyebrow">
          <span className="hero-sparkle">✦</span>
          <span>TheMohitFact Hub · Official Digital Library</span>
        </div>

        <h1>
          Knowledge that <br />
          <span className="hero-gradient-text">moves you forward.</span>
        </h1>

        <p>
          Welcome to TheMohitFact Hub — your premium destination for exclusive digital resources,
          insightful books, valuable PDFs, and deep study material designed to expand your mind and fuel your growth.
        </p>

        <div className="row">
          <a className="btn pri" href="#explore">
            Explore Resources
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>→</span>
          </a>
          <a className="btn" href="/books">
            Browse Books &amp; PDFs
          </a>
          <a className="btn" href="#about">
            About Me
          </a>
        </div>

        <div className="hero-stats-row">
          {count > 0 && (
            <div className="count">
              <b>{count}</b>
              <span>{count === 1 ? 'Resource' : 'Resources'} in Library</span>
            </div>
          )}
          <div className="hero-feature-pill">
            <span className="hero-dot" />
            <span>Instant Free Downloads</span>
          </div>
          <div className="hero-feature-pill">
            <span className="hero-dot" style={{ background: '#ec4899', boxShadow: '0 0 8px #ec4899' }} />
            <span>Live PDF Preview</span>
          </div>
          <div className="hero-feature-pill">
            <span className="hero-dot" style={{ background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
            <span>Verified Study Notes</span>
          </div>
        </div>
      </div>

      <div
        className="stack"
        onMouseMove={move}
        onMouseLeave={reset}
        aria-hidden="true"
      >
        <div className="stack-glow-backdrop" />
        <div className="tilt">
          {/* Card 1: PDF Guide */}
          <div className="fc">
            <div className="fc-top">
              <span className="fc-badge">PDF GUIDE</span>
              <div className="fc-icon">📄</div>
            </div>
            <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.7 }}>
              <div style={{ height: 6, width: '85%', borderRadius: 3, background: 'linear-gradient(90deg, #a855f7, transparent)' }} />
              <div style={{ height: 6, width: '65%', borderRadius: 3, background: 'linear-gradient(90deg, #ec4899, transparent)' }} />
              <div style={{ height: 6, width: '75%', borderRadius: 3, background: 'linear-gradient(90deg, #38bdf8, transparent)' }} />
            </div>
            <div className="fc-bottom">
              <span className="fc-title">Workbooks &amp; Guides</span>
              <small>Actionable step-by-step master guides</small>
            </div>
          </div>

          {/* Card 2: EPUB Book */}
          <div className="fc">
            <div className="fc-top">
              <span className="fc-badge" style={{ background: 'rgba(236, 72, 153, 0.25)', borderColor: 'rgba(236, 72, 153, 0.5)' }}>EPUB BOOK</span>
              <div className="fc-icon">📚</div>
            </div>
            <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.8 }}>
              <div style={{ height: 6, width: '90%', borderRadius: 3, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
              <div style={{ height: 6, width: '55%', borderRadius: 3, background: 'linear-gradient(90deg, #ec4899, transparent)' }} />
              <div style={{ height: 6, width: '70%', borderRadius: 3, background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
            </div>
            <div className="fc-bottom">
              <span className="fc-title">Digital Books</span>
              <small>Read anywhere on tablet, phone &amp; laptop</small>
            </div>
          </div>

          {/* Card 3: Notes */}
          <div className="fc">
            <div className="fc-top">
              <span className="fc-badge" style={{ background: 'rgba(56, 189, 248, 0.25)', borderColor: 'rgba(56, 189, 248, 0.5)' }}>STUDY NOTES</span>
              <div className="fc-icon">🧠</div>
            </div>
            <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.8 }}>
              <div style={{ height: 6, width: '80%', borderRadius: 3, background: 'linear-gradient(90deg, #38bdf8, #a855f7)' }} />
              <div style={{ height: 6, width: '95%', borderRadius: 3, background: 'linear-gradient(90deg, #38bdf8, transparent)' }} />
              <div style={{ height: 6, width: '60%', borderRadius: 3, background: 'linear-gradient(90deg, #a855f7, transparent)' }} />
            </div>
            <div className="fc-bottom">
              <span className="fc-title">Mastery Notes</span>
              <small>Distilled psychological &amp; life frameworks</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
