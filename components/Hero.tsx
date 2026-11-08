'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'

interface CardItem {
  id: string
  href: string
  badgeText: string
  badgeBg: string
  badgeBorder: string
  icon: string
  title: string
  subtitle: string
  bars: Array<{ width: string; gradient: string }>
  baseAngle: number
  baseZ: number
  slotStyle: React.CSSProperties
}

const CARDS_DATA: CardItem[] = [
  {
    id: 'pdf-guide',
    href: '/books?fmt=PDF',
    badgeText: 'PDF GUIDE',
    badgeBg: 'rgba(168, 85, 247, 0.25)',
    badgeBorder: 'rgba(168, 85, 247, 0.55)',
    icon: '📄',
    title: 'Workbooks & Guides',
    subtitle: 'Actionable step-by-step master guides',
    bars: [
      { width: '85%', gradient: 'linear-gradient(90deg, #a855f7, transparent)' },
      { width: '65%', gradient: 'linear-gradient(90deg, #ec4899, transparent)' },
      { width: '75%', gradient: 'linear-gradient(90deg, #38bdf8, transparent)' },
    ],
    baseAngle: -8,
    baseZ: 20,
    slotStyle: {
      left: '4%',
      top: '50px',
      animationDelay: '0s',
      zIndex: 1,
    },
  },
  {
    id: 'epub-book',
    href: '/books?fmt=EPUB',
    badgeText: 'EPUB BOOK',
    badgeBg: 'rgba(236, 72, 153, 0.25)',
    badgeBorder: 'rgba(236, 72, 153, 0.55)',
    icon: '📚',
    title: 'Digital Books',
    subtitle: 'Read anywhere on tablet, phone & laptop',
    bars: [
      { width: '90%', gradient: 'linear-gradient(90deg, #ec4899, #a855f7)' },
      { width: '55%', gradient: 'linear-gradient(90deg, #ec4899, transparent)' },
      { width: '70%', gradient: 'linear-gradient(90deg, #c084fc, transparent)' },
    ],
    baseAngle: 1,
    baseZ: 70,
    slotStyle: {
      left: '30%',
      top: '10px',
      animationDelay: '-2s',
      zIndex: 2,
    },
  },
  {
    id: 'study-notes',
    href: '/#explore',
    badgeText: 'STUDY NOTES',
    badgeBg: 'rgba(56, 189, 248, 0.25)',
    badgeBorder: 'rgba(56, 189, 248, 0.55)',
    icon: '🧠',
    title: 'Mastery Notes',
    subtitle: 'Distilled psychological & life frameworks',
    bars: [
      { width: '80%', gradient: 'linear-gradient(90deg, #38bdf8, #a855f7)' },
      { width: '95%', gradient: 'linear-gradient(90deg, #38bdf8, transparent)' },
      { width: '60%', gradient: 'linear-gradient(90deg, #a855f7, transparent)' },
    ],
    baseAngle: 8,
    baseZ: 120,
    slotStyle: {
      left: '56%',
      top: '75px',
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
      className={`fc-slot ${isHovered ? 'is-hovered' : ''} ${isPressed ? 'is-pressed' : ''}`}
      style={card.slotStyle}
    >
      {/* Soft Ambient Glow Aura Behind Each Card */}
      <div className="fc-ambient-glow" />

      {/* Clickable Card with 3D Hover Zoom and Tilt */}
      <Link
        ref={cardRef}
        href={card.href}
        className={`fc ${isHovered ? 'is-hovered' : ''} ${isPressed ? 'is-pressed' : ''}`}
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

        {/* Card Header */}
        <div className="fc-top">
          <span
            className="fc-badge"
            style={{
              background: card.badgeBg,
              borderColor: card.badgeBorder,
            }}
          >
            {card.badgeText}
          </span>
          <div className="fc-icon">{card.icon}</div>
        </div>

        {/* Card Miniature Page Lines */}
        <div
          style={{
            margin: '14px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            opacity: 0.85,
          }}
        >
          {card.bars.map((bar, i) => (
            <div
              key={i}
              style={{
                height: 6,
                width: bar.width,
                borderRadius: 3,
                background: bar.gradient,
              }}
            />
          ))}
        </div>

        {/* Card Bottom Details & Click Callout */}
        <div className="fc-bottom">
          <span className="fc-title">{card.title}</span>
          <small>{card.subtitle}</small>
          <div className="fc-action-hint">
            <span>Explore {card.badgeText}</span>
            <span className="fc-arrow">→</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function Hero({ count }: { count: number }) {
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

      <div className="stack" aria-label="Featured digital resource categories">
        <div className="stack-glow-backdrop" />
        <div className="tilt">
          {CARDS_DATA.map((card) => (
            <HeroResourceCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
