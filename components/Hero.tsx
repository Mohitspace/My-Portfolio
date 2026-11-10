'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'

interface CardItem {
  id: string
  theme: 'amber' | 'blue' | 'emerald'
  href: string
  badgeText: string
  icon: string
  title: string
  subtitle: string
  actionText: string
  bars: Array<{ width: string; gradient: string }>
  baseAngle: number
  baseZ: number
  slotStyle: React.CSSProperties
}

const CARDS_DATA: CardItem[] = [
  {
    id: 'pdf-guide',
    theme: 'amber',
    href: '/books?fmt=PDF',
    badgeText: 'PDF GUIDE',
    icon: '📄',
    title: 'Workbook Guides',
    subtitle: 'Actionable step master guides',
    actionText: 'EXPLORE PDF GUIDE',
    bars: [
      { width: '85%', gradient: 'linear-gradient(90deg, #f43f5e, #c084fc, transparent)' },
      { width: '65%', gradient: 'linear-gradient(90deg, #ec4899, transparent)' },
      { width: '75%', gradient: 'linear-gradient(90deg, #a855f7, #38bdf8, transparent)' },
    ],
    baseAngle: -7,
    baseZ: 20,
    slotStyle: {
      left: '0%',
      top: '55px',
      animationDelay: '0s',
      zIndex: 1,
    },
  },
  {
    id: 'epub-book',
    theme: 'blue',
    href: '/books?fmt=EPUB',
    badgeText: 'EPUB BOOK',
    icon: '📚',
    title: 'Digital Books',
    subtitle: 'Read anywhere on your phone & laptop',
    actionText: 'EXPLORE EPUB',
    bars: [
      { width: '90%', gradient: 'linear-gradient(90deg, #38bdf8, #60a5fa, transparent)' },
      { width: '55%', gradient: 'linear-gradient(90deg, #0ea5e9, transparent)' },
      { width: '70%', gradient: 'linear-gradient(90deg, #38bdf8, #c084fc, transparent)' },
    ],
    baseAngle: 1,
    baseZ: 70,
    slotStyle: {
      left: '26%',
      top: '15px',
      animationDelay: '-2s',
      zIndex: 2,
    },
  },
  {
    id: 'study-notes',
    theme: 'emerald',
    href: '/#explore',
    badgeText: 'STUDY NOTES',
    icon: '🧠',
    title: 'Mastery Notes',
    subtitle: 'Distilled psychological & life frameworks',
    actionText: 'EXPLORE STUDY NOTES',
    bars: [
      { width: '80%', gradient: 'linear-gradient(90deg, #38bdf8, #0ea5e9, transparent)' },
      { width: '95%', gradient: 'linear-gradient(90deg, #10b981, #38bdf8, transparent)' },
      { width: '60%', gradient: 'linear-gradient(90deg, #38bdf8, transparent)' },
    ],
    baseAngle: 8,
    baseZ: 120,
    slotStyle: {
      left: '52%',
      top: '65px',
      animationDelay: '-4s',
      zIndex: 3,
    },
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
    // Subtle 3D tilt between -8deg and +8deg
    const rx = -(y - 0.5) * 16
    const ry = (x - 0.5) * 16
    setTilt({
      rx: Math.round(rx * 10) / 10,
      ry: Math.round(ry * 10) / 10,
      px: Math.round(x * 100),
      py: Math.round(y * 100),
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 })
  }

  // Exact same hover zoom scale(1.08) and identical transition dynamics for all 3 cards
  const transformStyle: React.CSSProperties = isHovered
    ? {
        transform: `translateZ(180px) rotateZ(0deg) scale(1.08) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }
    : isPressed
    ? {
        transform: `translateZ(140px) rotateZ(0deg) scale(1.04)`,
      }
    : {
        transform: `translateZ(${card.baseZ}px) rotateZ(${card.baseAngle}deg) scale(1) rotateX(0deg) rotateY(0deg)`,
      }

  return (
    <div
      className={`fc-slot fc-slot-${card.theme} ${isHovered ? 'is-hovered' : ''} ${isPressed ? 'is-pressed' : ''}`}
      style={card.slotStyle}
    >
      {/* Soft Ambient Volumetric Glow Behind Each Card */}
      <div className={`fc-ambient-glow fc-ambient-glow-${card.theme}`} />

      {/* Clickable Card with 3D Hover Zoom and Tilt */}
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
        {/* Dynamic Internal Luminous Neon Blooms (Signature effect from 2nd photo) */}
        <div className={`fc-glow-top fc-glow-top-${card.theme}`} />
        <div className={`fc-glow-bottom fc-glow-bottom-${card.theme}`} />

        {/* Subtle moving light reflection / sheen */}
        <div className="fc-sheen">
          <div className="fc-sheen-glare" />
          <div className="fc-sheen-sweep" />
        </div>

        {/* Card Header: Icon box + Badge */}
        <div className="fc-top">
          <div className={`fc-icon fc-icon-${card.theme}`}>{card.icon}</div>
          <span className={`fc-badge fc-badge-${card.theme}`}>
            {card.badgeText}
          </span>
        </div>

        {/* Card Miniature Animated Preview Bars */}
        <div className="fc-bars">
          {card.bars.map((bar, i) => (
            <div
              key={i}
              className={`fc-bar fc-bar-${card.theme}`}
              style={{
                width: bar.width,
                background: bar.gradient,
              }}
            />
          ))}
        </div>

        {/* Card Bottom Details & Click Callout */}
        <div className="fc-bottom">
          <span className={`fc-title fc-title-${card.theme}`}>{card.title}</span>
          <small>{card.subtitle}</small>
          <div className={`fc-action-hint fc-action-${card.theme}`}>
            <span>{card.actionText}</span>
            <span className="fc-arrow">→</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

import HeroCinematicBackground from './HeroCinematicBackground'

export default function Hero({ count }: { count: number }) {
  return (
    <section className="hero-viewport" aria-label="Welcome and Featured Resources">
      {/* 1. Cinematic Animated Space, Earth & Mountain Environment */}
      <HeroCinematicBackground />

      {/* 2. Main Content Grid (Left: Welcome text & buttons, Right: 3 Animated Cards) */}
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

        {/* Right Column: 3 Preserved 3D Animated Resource Cards */}
        <div className="hero-right-col" aria-label="Featured resource categories">
          <div className="stack" aria-label="Featured digital resource categories">
            <div className="stack-glow-backdrop" />
            <div className="tilt">
              {CARDS_DATA.map((card) => (
                <HeroResourceCard key={card.id} card={card} />
              ))}
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
