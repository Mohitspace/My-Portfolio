'use client'

import React, { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  alpha: number
  targetAlpha: number
  pulseSpeed: number
  color: string
}

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  alpha: number
  color: string
}

export default function HeroCinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let animId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    // Twinkling background stars (Diamond white, icy blue, celestial cyan)
    const starColors = [
      '#ffffff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#c084fc',
    ]

    const stars: Star[] = []
    const starCount = Math.min(Math.floor((width * height) / 14000), 55)

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.75), // Concentrate in upper space area
        size: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.8 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      })
    }

    // Floating cosmic blue micro-particles
    const particles: Particle[] = []
    const particleCount = 28
    const pColors = ['rgba(56, 189, 248, ', 'rgba(14, 165, 233, ', 'rgba(96, 165, 250, ', 'rgba(255, 255, 255, ']

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1, // Floating gently upward
        alpha: Math.random() * 0.6 + 0.2,
        color: pColors[Math.floor(Math.random() * pColors.length)],
      })
    }

    // Cursor tracking for subtle atmospheric illumination
    let targetX = width * 0.4
    let targetY = height * 0.4
    let currentX = targetX
    let currentY = targetY

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }

    window.addEventListener('resize', handleResize)

    let isVisible = true
    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Smooth cursor lerp
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`
      }

      // Draw Twinkling Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        if (!prefersReducedMotion) {
          s.alpha += (s.targetAlpha - s.alpha) * s.pulseSpeed
          if (Math.abs(s.targetAlpha - s.alpha) < 0.05) {
            s.targetAlpha = Math.random() * 0.85 + 0.15
          }
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha))
        ctx.shadowBlur = s.size > 1.2 ? 8 : 4
        ctx.shadowColor = s.color
        ctx.fill()
      }

      // Draw Floating Blue Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy
          if (p.y < -10) {
            p.y = height + 10
            p.x = Math.random() * width
          }
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.shadowBlur = 10
        ctx.shadowColor = '#38bdf8'
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div className="hero-cinematic-bg" aria-hidden="true">
      {/* 1. Base Pristine Wallpaper (Cinematic Earth Horizon, Mountains & Space) */}
      <div className="hero-cinematic-layer hero-plate-img" />

      {/* 2. Rotating Holographic 3D Digital Globe in Upper Right Space */}
      <div className="hero-holo-globe-rig">
        <div className="hero-holo-core-glow" />
        <svg
          className="hero-holo-globe-svg"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Atmosphere Glow Circle */}
          <circle
            cx="200"
            cy="200"
            r="170"
            stroke="url(#globeCyanGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="globe-orbit-ring ring-1"
          />
          <circle
            cx="200"
            cy="200"
            r="150"
            stroke="rgba(56, 189, 248, 0.45)"
            strokeWidth="1"
            className="globe-orbit-ring ring-2"
          />

          {/* Dotted Latitude Circles */}
          <ellipse cx="200" cy="110" rx="100" ry="24" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1" strokeDasharray="3 5" />
          <ellipse cx="200" cy="155" rx="138" ry="34" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" strokeDasharray="4 6" />
          <ellipse cx="200" cy="200" rx="150" ry="40" stroke="rgba(56, 189, 248, 0.65)" strokeWidth="1.5" strokeDasharray="6 6" />
          <ellipse cx="200" cy="245" rx="138" ry="34" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" strokeDasharray="4 6" />
          <ellipse cx="200" cy="290" rx="100" ry="24" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1" strokeDasharray="3 5" />

          {/* Dotted Longitudinal Arcs */}
          <ellipse cx="200" cy="200" rx="40" ry="150" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1" strokeDasharray="4 6" />
          <ellipse cx="200" cy="200" rx="90" ry="150" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="4 6" />
          <ellipse cx="200" cy="200" rx="130" ry="150" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" strokeDasharray="3 5" />

          {/* Equator & Meridian Axis lines */}
          <line x1="50" y1="200" x2="350" y2="200" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="200" y1="50" x2="200" y2="350" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="2 4" />

          {/* Pulsing Intersect Nodes */}
          <circle cx="200" cy="200" r="3.5" fill="#38bdf8" className="globe-pulse-node" />
          <circle cx="290" cy="200" r="2.5" fill="#bae6fd" />
          <circle cx="110" cy="200" r="2.5" fill="#bae6fd" />
          <circle cx="200" cy="110" r="2.5" fill="#bae6fd" />
          <circle cx="200" cy="290" r="2.5" fill="#bae6fd" />
          <circle cx="240" cy="155" r="2" fill="#7dd3fc" />
          <circle cx="160" cy="155" r="2" fill="#7dd3fc" />
          <circle cx="240" cy="245" r="2" fill="#7dd3fc" />
          <circle cx="160" cy="245" r="2" fill="#7dd3fc" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="globeCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3. Earth Horizon Radiant Limb Glow Arc (Animated Breathing) */}
      <div className="hero-earth-limb-glow" />

      {/* 4. Atmospheric Mountain Mist & Cloud Drift (Layer 1 & 2) */}
      <div className="hero-mist-layer hero-mist-1" />
      <div className="hero-mist-layer hero-mist-2" />

      {/* 5. Deep Space Vignette & Top Gradient (Seamless navbar blend) */}
      <div className="hero-top-vignette" />

      {/* 6. Interactive Specular Studio Spotlight */}
      <div ref={spotlightRef} className="hero-cursor-spotlight" />

      {/* 7. Canvas with Twinkling Stars & Floating Blue Stardust */}
      <canvas ref={canvasRef} className="hero-star-canvas" />

      {/* 8. Bottom Transition Gradient into Explore Section */}
      <div className="hero-bottom-transition" />
    </div>
  )
}
