'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Phase = 'welcome' | 'loading' | 'exit' | 'done'

export default function WelcomeIntro() {
  const pathname = usePathname()
  // Run on the root/homepage or initial entrance
  const isHomePage = !pathname || pathname === '/'

  // Start in 'welcome' phase so the overlay is present immediately in HTML (prevents flash)
  const [phase, setPhase] = useState<Phase>('welcome')

  useEffect(() => {
    // If user directly opened a deep internal page like /books or /dashboard, skip intro
    if (!isHomePage) {
      setPhase('done')
      return
    }

    // STEP 1: Welcome Screen (Text on left + Photo on right together) -> 0.0s to 2.6s
    const t1 = setTimeout(() => {
      setPhase('loading')
    }, 2600)

    // STEP 2: Loading Screen (Center Photo + Name + Loading animation) -> 2.6s to 4.3s
    const t2 = setTimeout(() => {
      setPhase('exit')
    }, 4300)

    // STEP 3: Reveal Homepage smoothly & unmount overlay -> 4.3s to 5.0s
    const t3 = setTimeout(() => {
      setPhase('done')
    }, 5000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [isHomePage])

  const handleSkip = () => {
    setPhase('exit')
    setTimeout(() => {
      setPhase('done')
    }, 500)
  }

  // Once completely finished or if not on homepage, remove from DOM
  if (phase === 'done' || !isHomePage) {
    return null
  }

  const welcomeText = "WELCOME TO MOHIT'S WORLD"
  const isExiting = phase === 'exit'
  const isWelcome = phase === 'welcome'
  const isLoading = phase === 'loading' || isExiting

  return (
    <div
      className={`intro-overlay${isExiting ? ' intro-fade-out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome Intro — TheMohitFact Hub"
    >
      {/* Cinematic Ambient Background */}
      <div className="intro-backdrop">
        <div className="intro-orb intro-orb-purple" />
        <div className="intro-orb intro-orb-blue" />
        <div className="intro-orb intro-orb-pink" />
        <div className="intro-grid-pattern" />
      </div>

      {/* Skip Button */}
      {!isExiting && (
        <button
          type="button"
          className="intro-skip-btn"
          onClick={handleSkip}
          aria-label="Skip intro to homepage"
        >
          <span>Skip Intro</span>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>→</span>
        </button>
      )}

      {/* ── STEP 1: WELCOME SCREEN (Text on Left + Photo on Right Together) ── */}
      {isWelcome && (
        <div className="intro-welcome-stage">
          <div className="intro-welcome-grid">
            {/* Left Side: Welcome Text */}
            <div className="intro-welcome-left">
              <div className="intro-eyebrow">
                <span>✦</span> OFFICIAL DIGITAL PLATFORM <span>✦</span>
              </div>

              <h1 className="intro-title intro-title-left" aria-label={welcomeText}>
                {welcomeText.split('').map((char, index) => (
                  <span
                    key={index}
                    className="intro-char"
                    style={{ animationDelay: `${0.12 + index * 0.035}s` }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h1>

              <p className="intro-subtitle intro-subtitle-left">
                Knowledge that moves you forward · Curated digital books, guides &amp; study notes
              </p>

              <div className="intro-creator-pill">
                <span className="intro-badge-pulse" />
                <span>MOHIT KUMAR · CREATOR &amp; CURATOR</span>
              </div>
            </div>

            {/* Right Side: Profile Photo */}
            <div className="intro-welcome-right">
              <div className="intro-welcome-photo-wrap">
                <div className="intro-photo-glow" />

                <div className="intro-photo-frame intro-welcome-photo-frame">
                  <img
                    src="/image/Confident Young Man in White Shirt.png"
                    alt="Mohit Kumar – TheMohitFact"
                    className="intro-photo-img"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget
                      if (!target.src.endsWith('mohit-portrait.png')) {
                        target.src = '/image/mohit-portrait.png'
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
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: LOADING SCREEN (Center Photo + Name + Circular Glow + Loading Animation) ── */}
      {isLoading && (
        <div className="intro-loading-stage">
          {/* Centered Profile Picture with Glowing Circular Rings */}
          <div className="intro-loading-photo-wrap">
            <div className="intro-loading-glow" />
            <div className="intro-loading-rings">
              <span className="ring-pulse ring-1" />
              <span className="ring-pulse ring-2" />
            </div>

            <div className="intro-photo-frame intro-loading-photo-frame">
              <img
                src="/image/Confident Young Man in White Shirt.png"
                alt="Mohit Kumar – TheMohitFact"
                className="intro-photo-img"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget
                  if (!target.src.endsWith('mohit-portrait.png')) {
                    target.src = '/image/mohit-portrait.png'
                  }
                }}
              />
              <div className="intro-photo-sheen" />
            </div>
          </div>

          {/* Prominent Name */}
          <h2 className="intro-loading-name">
            MOHIT KUMAR – THEMOHITFACT
          </h2>

          {/* Smooth Loading Progress Animation */}
          <div className="intro-progress-bar-wrap">
            <div className="intro-progress-bar-fill intro-progress-fast" />
          </div>

          {/* Subtitle / Status */}
          <p className="intro-loading-status">
            <span className="intro-loading-dot" />
            INITIALIZING KNOWLEDGE HUB...
          </p>
        </div>
      )}
    </div>
  )
}
