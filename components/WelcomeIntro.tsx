'use client'

import React, { useEffect, useState } from 'react'

/**
 * In-memory flag so the intro plays once on initial website visit or refresh,
 * but does not replay on client-side route navigations.
 */
let hasPlayedThisSession = false

/**
 * Fully automatic cinematic intro sequence:
 *   STEP 1  'text'         — Welcome text appears (fade-in, slide-up, letter reveal)
 *   STEP 2  'textAndPhoto' — Profile image smoothly revealed beside the text
 *   STEP 3  'loading'      — Centered loading screen (photo, name, progress bar)
 *   STEP 4  'exit'         — Cinematic fade/zoom out revealing the homepage
 *           'done'         — Overlay unmounted from DOM
 *
 * No skip button. No user interaction required. Fully automatic.
 * Zero external routing hooks to prevent Webpack runtime resolution errors.
 */
type Phase = 'text' | 'textAndPhoto' | 'loading' | 'exit' | 'done'

export default function WelcomeIntro() {
  const [phase, setPhase] = useState<Phase>(() => {
    // If already played in this page session, don't show again
    if (typeof window !== 'undefined' && hasPlayedThisSession) {
      return 'done'
    }
    return 'text'
  })

  useEffect(() => {
    // If already marked done, do nothing
    if (hasPlayedThisSession) {
      setPhase('done')
      return () => {}
    }

    // Fully automatic timed sequence — no interaction needed
    // STEP 1 → STEP 2:  Welcome text finishes → profile image slides in (1.5s)
    const t1 = setTimeout(() => {
      setPhase('textAndPhoto')
    }, 1500)

    // STEP 2 → STEP 3:  Both visible → transition to centered loading screen (3.2s)
    const t2 = setTimeout(() => {
      setPhase('loading')
    }, 3200)

    // STEP 3 → STEP 4:  Loading done → begin cinematic exit (4.7s)
    const t3 = setTimeout(() => {
      setPhase('exit')
    }, 4700)

    // STEP 4 → Done:    Unmount overlay completely (5.4s)
    const t4 = setTimeout(() => {
      hasPlayedThisSession = true
      setPhase('done')
    }, 5400)

    // Hard fail-safe: unconditionally dismiss intro after 5.8s no matter what happens
    const tFailSafe = setTimeout(() => {
      hasPlayedThisSession = true
      setPhase('done')
    }, 5800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(tFailSafe)
    }
  }, [])

  // Once complete or dismissed — render nothing
  if (phase === 'done') {
    return null
  }

  const welcomeText = "WELCOME TO MOHIT'S WORLD"
  const isExiting = phase === 'exit'
  const showWelcome = phase === 'text' || phase === 'textAndPhoto'
  const photoRevealed = phase === 'textAndPhoto'
  const showLoading = phase === 'loading' || isExiting

  return (
    <div
      className={`intro-overlay${isExiting ? ' intro-fade-out' : ''}`}
      role="status"
      aria-label="Welcome Intro"
    >
      {/* Cinematic Ambient Background */}
      <div className="intro-backdrop">
        <div className="intro-orb intro-orb-purple" />
        <div className="intro-orb intro-orb-blue" />
        <div className="intro-orb intro-orb-pink" />
        <div className="intro-grid-pattern" />
      </div>

      {/* ── STEP 1: Welcome Text  |  STEP 2: + Profile Image ── */}
      {showWelcome && (
        <div className="intro-welcome-stage">
          <div className="intro-welcome-grid">
            {/* Left Side — Welcome Text (appears first) */}
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

            {/* Right Side — Profile Photo (revealed automatically after text) */}
            <div
              className={`intro-welcome-right${photoRevealed ? ' intro-photo-revealed' : ' intro-photo-hidden'}`}
            >
              <div className="intro-welcome-photo-wrap">
                <div className="intro-photo-glow" />

                <div className="intro-photo-frame intro-welcome-photo-frame">
                  <img
                    src="/image/Confident%20Young%20Man%20in%20White%20Shirt.png"
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
                  <span>MOHIT KUMAR • THEMOHITFACT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Automatic Loading Screen ── */}
      {showLoading && (
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
                src="/image/Confident%20Young%20Man%20in%20White%20Shirt.png"
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

          {/* Name */}
          <h2 className="intro-loading-name">
            MOHIT KUMAR • THEMOHITFACT
          </h2>

          {/* Smooth Loading Progress Animation */}
          <div className="intro-progress-bar-wrap">
            <div className="intro-progress-bar-fill intro-progress-fast" />
          </div>

          {/* Status */}
          <p className="intro-loading-status">
            <span className="intro-loading-dot" />
            INITIALIZING KNOWLEDGE HUB...
          </p>
        </div>
      )}
    </div>
  )
}
