'use client'

import React, { useState } from 'react'

/* ==========================================================================
   ABOUT ME SECTION CONFIGURATION
   👉 You can easily customize your photo, copy & social links below!
   ========================================================================== */
export const ABOUT_CONFIG = {
  // 1. Creator Profile Information
  badge: 'THE CREATOR',
  name: 'Mohit Kumar',
  titlePrefix: 'Building Stronger',
  titleHighlight: 'Minds & Habits',
  leadParagraph:
    'Welcome to TheMohitFact — a community dedicated to self-improvement, resilient mindset, and daily personal development.',
  bodyParagraph:
    'My mission is simple: to help you build unbreakable discipline, think with clarity, and elevate your everyday life — one practical step at a time. No shortcuts or empty motivation, just real perspective to unlock your genuine potential.',

  // 2. Profile Photo (Replace with any image URL or file path in /public/image/)
  photoUrl: '/image/mohit-portrait.png',
  fallbackPhotoUrl: '/image/Confident%20Young%20Man%20in%20White%20Shirt.png',
  creatorRole: 'Creator & Mindset Mentor',
  creatorPill: 'Self-Improvement · YouTube',

  // 3. "What I Believe In" / Mission Pillars (3 Glass Cards)
  pillars: [
    {
      icon: '🌱',
      tag: '01 / PROGRESSION',
      title: 'Self Growth',
      description:
        'Continuous daily evolution. Striving for 1% daily improvement in your habits, mindset, and standards over quick fixes.',
      accent: 'purple',
    },
    {
      icon: '🧠',
      tag: '02 / PSYCHOLOGY',
      title: 'Mindset Shift',
      description:
        'Rewiring mental limitations into resilient inner frameworks that stay composed under challenge and pressure.',
      accent: 'pink',
    },
    {
      icon: '⚡',
      tag: '03 / SYSTEMS',
      title: 'Iron Discipline',
      description:
        'Building structured routines and daily accountability that drive consistent action even when fleeting motivation fades.',
      accent: 'cyan',
    },
  ],

  // 4. Social Links & Main CTA
  // Replace these URLs with your actual profile links
  youtubeUrl: 'https://youtube.com/@themohitfact',
  instagramUrl: 'https://instagram.com/themohitfact',
  twitterUrl: 'https://twitter.com/themohitfact',
}

export default function AboutSection({
  site,
}: {
  site?: { youtube?: string; instagram?: string; twitter?: string }
}) {
  // Use site database URL if configured, otherwise fallback to ABOUT_CONFIG
  const youtubeLink = site?.youtube || ABOUT_CONFIG.youtubeUrl
  const instagramLink = site?.instagram || ABOUT_CONFIG.instagramUrl
  const twitterLink = site?.twitter || ABOUT_CONFIG.twitterUrl

  // Profile Image state with fallback
  const [imgSrc, setImgSrc] = useState(ABOUT_CONFIG.photoUrl)

  return (
    <section id="about" className="wrap sec about-sec" aria-label="About The Creator">
      {/* Background Volumetric Glow Orbs */}
      <div className="about-ambient-glow about-ambient-glow-1" aria-hidden="true" />
      <div className="about-ambient-glow about-ambient-glow-2" aria-hidden="true" />

      <div className="about-panel">
        {/* ==================================================================
            1. TWO-COLUMN HERO GRID (Text Left, Profile Visual Right)
           ================================================================== */}
        <div className="about-hero-grid">
          {/* Left Column: Text & Content */}
          <div className="about-text-col">
            {/* Glowing Pill Badge */}
            <div className="about-badge-pill">
              <span className="about-badge-sparkle">✦</span>
              <span>{ABOUT_CONFIG.badge}</span>
              <span className="about-badge-sparkle">✦</span>
            </div>

            {/* Impressive Large Gradient Heading */}
            <h2 className="about-heading">
              {ABOUT_CONFIG.titlePrefix}{' '}
              <span className="about-gradient-text">{ABOUT_CONFIG.titleHighlight}</span>
            </h2>

            {/* Short, Punchy, Relatable & Inspiring Copy */}
            <p className="about-lead">{ABOUT_CONFIG.leadParagraph}</p>
            <p className="about-body">{ABOUT_CONFIG.bodyParagraph}</p>

            {/* CTA & Social Links Row */}
            <div className="about-actions-row">
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="about-btn-youtube"
                aria-label="Watch TheMohitFact on YouTube"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>Watch on YouTube</span>
                <span className="about-btn-arrow">→</span>
              </a>

              {/* Glassmorphic Social Icons */}
              <div className="about-social-group">
                {youtubeLink && (
                  <a
                    href={youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-icon about-social-yt"
                    title="YouTube Channel"
                    aria-label="YouTube Channel"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}

                {instagramLink && (
                  <a
                    href={instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-icon about-social-ig"
                    title="Instagram Profile"
                    aria-label="Instagram Profile"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}

                {twitterLink && (
                  <a
                    href={twitterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-icon about-social-tw"
                    title="X / Twitter"
                    aria-label="X / Twitter"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Futuristic Creator Profile Visual */}
          <div className="about-visual-col">
            <div className="about-frame-wrapper">
              {/* Diffuse Ambient Halo Behind Profile */}
              <div className="about-photo-halo" aria-hidden="true" />

              {/* Glowing Outer Gradient Orbit Ring */}
              <div className="about-photo-frame">
                <div className="about-photo-inner">
                  <img
                    src={imgSrc}
                    alt={ABOUT_CONFIG.name}
                    className="about-photo-img"
                    onError={() => {
                      if (imgSrc !== ABOUT_CONFIG.fallbackPhotoUrl) {
                        setImgSrc(ABOUT_CONFIG.fallbackPhotoUrl)
                      }
                    }}
                  />
                  {/* Glass Shimmer Overlay */}
                  <div className="about-photo-shimmer" />
                </div>
              </div>

              {/* Floating Futuristic Badge Pill Over Photo */}
              <div className="about-floating-pill about-pill-bottom">
                <span className="about-pill-dot" />
                <span>{ABOUT_CONFIG.creatorPill}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================
            2. "WHAT I BELIEVE IN" MISSION PILLARS (3 Glass Cards)
           ================================================================== */}
        <div className="about-mission-section">
          <div className="about-mission-header">
            <div className="about-sub-eyebrow">
              <span className="about-badge-sparkle">✦</span>
              <span>CORE PILLARS</span>
            </div>
            <h3 className="about-mission-title">What I Believe In</h3>
          </div>

          <div className="about-pillars-grid">
            {ABOUT_CONFIG.pillars.map((pillar, idx) => (
              <div key={idx} className={`about-pillar-card about-pillar-${pillar.accent}`}>
                <div className="about-pillar-glow" />
                <div className="about-pillar-top">
                  <div className="about-pillar-icon">{pillar.icon}</div>
                  <span className="about-pillar-tag">{pillar.tag}</span>
                </div>
                <h4 className="about-pillar-title">{pillar.title}</h4>
                <p className="about-pillar-desc">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
