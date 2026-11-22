'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import HeroCinematicBackground from './HeroCinematicBackground'

interface CardItem {
  id: string
  theme: 'amber' | 'blue' | 'emerald'
  href: string
  badgeText: string
  iconType: 'document' | 'tools' | 'insight'
  title: string
  subtitle: string
  actionText: string
  floatDelay: string
}

const CARDS_DATA: CardItem[] = [
  {
    id: 'pdf-guide',
    theme: 'amber',
    href: '/books?fmt=PDF',
    badgeText: 'PDF GUIDE',
    iconType: 'document',
    title: 'Workbook Guides',
    subtitle: 'Actionable step-by-step master guides to accelerate your growth.',
    actionText: 'EXPLORE PDF GUIDE',
    floatDelay: '0s',
  },
  {
    id: 'epub-book',
    theme: 'blue',
    href: '/books?fmt=EPUB',
    badgeText: 'EPUB BOOK',
    iconType: 'tools',
    title: 'Digital Books',
    subtitle: 'Curated digital books to read anywhere on phone & laptop.',
    actionText: 'EXPLORE EPUB',
    floatDelay: '-2s',
  },
  {
    id: 'study-notes',
    theme: 'emerald',
    href: '/#explore',
    badgeText: 'STUDY NOTES',
    iconType: 'insight',
    title: 'Mastery Notes',
    subtitle: 'Distilled psychological frameworks & life mastery blueprints.',
    actionText: 'EXPLORE STUDY NOTES',
    floatDelay: '-4s',
  },
]

function HeroResourceCard({ card }: { card: CardItem }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50 })
  const cardRef = useRef<HTMLAnchorElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    // Gentle 3D tilt tracking cursor
    const rx = -(y - 0.5) * 14
    const ry = (x - 0.5) * 14
    setTilt({
      rx: Math.round(rx * 10) / 10,
      ry: Math.round(ry * 10) / 10,
      px: Math.round(x * 100),
      py: Math.round(y * 100),
    })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 })
  }

  const transformStyle: React.CSSProperties = isHovered
    ? {
        transform: `translateY(-10px) scale(1.04) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }
    : isPressed
    ? {
        transform: `translateY(-3px) scale(0.99)`,
      }
    : {
        transform: `translateY(0px) scale(1) rotateX(0deg) rotateY(0deg)`,
      }

  return (
    <div
      className={`fc-slot fc-slot-${card.theme} ${isHovered ? 'is-hovered' : ''} ${isPressed ? 'is-pressed' : ''}`}
      style={{ animationDelay: card.floatDelay }}
    >
      {/* Soft Ambient Volumetric Bottom Glow Aura */}
      <div className={`fc-ambient-glow fc-ambient-glow-${card.theme}`} />

      {/* Clickable Card with Glass Body and 3D Interaction */}
      <Link
        ref={cardRef}
        href={card.href}
        className={`fc fc-${card.theme} ${isHovered ? 'is-hovered' : ''} ${isPressed ? 'is-pressed' : ''}`}
        style={
          {
            ...transformStyle,
            '--glare-x': `${tilt.px}%`,
            '--glare-y': `${tilt.py}%`,
          } as React.CSSProperties
        }
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        aria-label={`${card.badgeText}: ${card.title} - ${card.subtitle}. Click to explore.`}
      >
        {/* Subtle moving light reflection / sheen */}
        <div className="fc-sheen">
          <div className="fc-sheen-glare" />
          <div className="fc-sheen-sweep" />
        </div>

        {/* Luminous Bottom Caustic Glow (Signature feature from Reference Image 1) */}
        <div className={`fc-glow-bottom fc-glow-bottom-${card.theme}`} />

        {/* Card Header: Glass Icon Box on Left, Clean Category Badge on Right */}
        <div className="fc-top">
          <div className={`fc-icon-box fc-icon-box-${card.theme}`}>
            {card.iconType === 'document' && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )}
            {card.iconType === 'tools' && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            )}
            {card.iconType === 'insight' && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4 4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2 2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 0-4zm-4 4a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2zm8 0a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2zm-4 4a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z" />
              </svg>
            )}
          </div>
          <span className={`fc-badge fc-badge-${card.theme}`}>
            {card.badgeText}
          </span>
        </div>

        {/* Card Body: Bold Title & Subtitle */}
        <div className="fc-body">
          <h3 className="fc-title">{card.title}</h3>
          <p className="fc-subtitle">{card.subtitle}</p>
        </div>

        {/* Card Footer: Action Hint & Arrow */}
        <div className="fc-bottom">
          <div className={`fc-action-hint fc-action-${card.theme}`}>
            <span>{card.actionText}</span>
            <span className="fc-arrow">→</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function Hero({ count }: { count: number }) {
  return (
    <section className="hero-viewport" aria-label="Welcome and Featured Resources">
      {/* 1. Cinematic Animated Space, Earth & Mountain Environment */}
      <HeroCinematicBackground />

      {/* 2. Main Content Grid (Left: Welcome text & buttons, Right: 3 Animated Cards Side-by-Side) */}
      <div className="wrap hero-content-grid">
        {/* Left Column */}
        <div className="hero-left-col">
          {/* Eyebrow with horizontal gradient divider lines */}
          <div className="hero-eyebrow-cinematic">
            <span className="hero-eyebrow-divider" />
            <span className="hero-eyebrow-label">W E L C O M E &nbsp; T O</span>
            <span className="hero-eyebrow-divider" />
          </div>

          {/* Main Title: THE MOHIT (White) FACT HUB (Neon Cyan Glow) */}
          <h1 className="hero-heading-cinematic">
            <span className="hero-heading-white">THE MOHIT</span>{' '}
            <span className="hero-heading-cyan">FACT HUB</span>
          </h1>

          {/* Subtitle: Explore Beyond What You Know. */}
          <p className="hero-subtitle-cinematic">
            Explore Beyond What You Know.
          </p>

          {/* Topic / Category Filter Buttons: Facts, Analysis, Explainers */}
          <div className="hero-topics-row">
            <a href="#explore" className="hero-topic-btn">
              <span className="topic-icon">📖</span>
              <span>Facts</span>
            </a>
            <a href="#explore" className="hero-topic-btn">
              <span className="topic-icon">📈</span>
              <span>Analysis</span>
            </a>
            <a href="#explore" className="hero-topic-btn">
              <span className="topic-icon">▶</span>
              <span>Explainers</span>
            </a>
          </div>

          {/* Primary CTA Button: Explore Now → */}
          <div className="hero-cta-group">
            <a href="#explore" className="hero-explore-now-btn">
              <span>Explore Now</span>
              <span className="hero-cta-arrow">→</span>
            </a>
          </div>
        </div>

        {/* Right Column: 3 Preserved 3D Animated Resource Cards Spaced Apart ("Door Door") */}
        <div className="hero-right-col" aria-label="Featured resource categories">
          <div className="hero-cards-container">
            {/* 3 Cards Side-by-Side Row with Generous Gaps */}
            <div className="hero-cards-row">
              {CARDS_DATA.map((card) => (
                <HeroResourceCard key={card.id} card={card} />
              ))}
            </div>

            {/* Bottom Feature Pills Row Underneath the 3 Cards (From Image 1) */}
            <div className="hero-feature-pills-row" aria-label="Key features">
              <div className="hero-feature-pill">
                <span className="hero-feature-pill-icon">⚡</span>
                <span className="hero-feature-pill-text">Always Current</span>
              </div>
              <div className="hero-feature-pill">
                <span className="hero-feature-pill-icon">👤</span>
                <span className="hero-feature-pill-text">Focused for You</span>
              </div>
              <div className="hero-feature-pill">
                <span className="hero-feature-pill-icon">✦</span>
                <span className="hero-feature-pill-text">Actionable Steps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Chevron Scroll Down Indicator */}
      <a href="#explore" className="hero-scroll-down-btn" aria-label="Scroll down to Explore Resources">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hero-chevron-svg"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </a>
    </section>
  )
}
