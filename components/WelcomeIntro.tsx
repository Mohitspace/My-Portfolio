'use client'

import React, { useEffect, useState } from 'react'

type Phase = 'text' | 'photo' | 'exit' | 'done' | 'skip'

export default function WelcomeIntro() {
  // Start as 'text' by default so the overlay renders immediately (prevents homepage flash).
  // useEffect will immediately set to 'skip' if the user has already seen it.
  const [phase, setPhase] = useState<Phase>('text')

  useEffect(() => {
    // Check session on the client side only
    try {
      if (sessionStorage.getItem('mohit_intro_seen') === 'true') {
        setPhase('skip')
        return
      }
    } catch {
      // sessionStorage blocked — still show intro
    }

    // Cinematic timing sequence
    // 0.0s — 'text'  : welcome text letter-by-letter reveal
    // 2.4s — 'photo' : text fades, portrait fades in
    // 4.2s — 'exit'  : everything fades + zooms out
    // 5.0s — 'done'  : unmount overlay, homepage fully visible
    const t1 = setTimeout(() => setPhase('photo'), 2400)
    const t2 = setTimeout(() => setPhase('exit'), 4200)
    const t3 = setTimeout(() => {
      setPhase('done')
      try { sessionStorage.setItem('mohit_intro_seen', 'true') } catch {}
    }, 5000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const handleSkip = () => {
    try { sessionStorage.setItem('mohit_intro_seen', 'true') } catch {}
    setPhase('exit')
    setTimeout(() => setPhase('done'), 600)
  }

  // Fully removed — render nothing
  if (phase === 'done' || phase === 'skip') return null

  const welcomeText = "WELCOME TO MOHIT'S WORLD"
  const isExiting = phase === 'exit'
  const showPhoto = phase === 'photo' || phase === 'exit'
  const showText = phase === 'text'

  return (
    <div
      className={`intro-overlay${isExiting ? ' intro-fade-out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome intro"
    >
      {/* Animated ambient backdrop orbs */}
      <div className="intro-backdrop">
        <div className="intro-orb intro-orb-purple" />
        <div className="intro-orb intro-orb-blue" />
        <div className="intro-orb intro-orb-pink" />
      </div>

      {/* Skip button */}
      {!isExiting && (
        <button
          type="button"
          className="intro-skip-btn"
          onClick={handleSkip}
          aria-label="Skip welcome intro"
        >
          Skip&nbsp;→
        </button>
      )}

      {/* Centre stage */}
      <div className="intro-center-stage">
        {/* ── PHASE: text ── */}
        {showText && (
          <div className="intro-text-area intro-text-enter">
            <div className="intro-eyebrow">
              <span>✦</span> OFFICIAL DIGITAL PLATFORM <span>✦</span>
            </div>

            <h1 className="intro-title" aria-label={welcomeText}>
              {welcomeText.split('').map((char, i) => (
                <span
                  key={i}
                  className="intro-char"
                  style={{ animationDelay: `${0.3 + i * 0.045}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="intro-subtitle">
              Knowledge that moves you forward · Curated digital books, guides &amp; study notes
            </p>

            {/* Progress bar */}
            <div className="intro-progress-bar-wrap">
              <div className="intro-progress-bar-fill" />
            </div>
          </div>
        )}

        {/* ── PHASE: photo ── */}
        {showPhoto && (
          <div className={`intro-photo-wrapper${phase === 'photo' ? ' intro-photo-enter' : ''}`}>
            <div className="intro-photo-glow" />

            <div className="intro-photo-frame">
              <img
                src="/image/Confident Young Man in White Shirt.png"
                alt="Mohit Kumar – TheMohitFact"
                className="intro-photo-img"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  const t = e.currentTarget
                  if (!t.src.endsWith('mohit-portrait.png')) {
                    t.src = '/image/mohit-portrait.png'
                  }
                }}
              />
              <div className="intro-photo-sheen" />
            </div>

            <div className="intro-badge">
              <span className="intro-badge-pulse" />
              <span>Mohit Kumar · TheMohitFact</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
