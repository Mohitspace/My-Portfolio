'use client'

import { useEffect, useRef } from 'react'

interface Ember {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  swaySpeed: number
  swayDist: number
  swayOffset: number
  alpha: number
  targetAlpha: number
  pulseSpeed: number
  color: string
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Palette: Diamond White, Soft Rose Pink, Celestial Lavender, Electric Violet
    const starColors = [
      'rgba(255, 255, 255, ',     // Pure Diamond White
      'rgba(253, 164, 175, ',     // Rose Pink
      'rgba(244, 114, 182, ',     // Soft Blossom
      'rgba(233, 213, 255, ',     // Lavender Starlight
      'rgba(192, 132, 252, ',     // Violet Shimmer
      'rgba(216, 240, 255, ',     // Soft Icy Blue
    ]

    const particleCount = Math.min(Math.floor((width * height) / 22000), 50)
    const embers: Ember[] = []

    for (let i = 0; i < particleCount; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.28 - 0.08, // Slow, elegant upward cosmic drift
        swaySpeed: Math.random() * 0.015 + 0.006,
        swayDist: Math.random() * 1.8 + 0.6,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.55 + 0.15,
        targetAlpha: Math.random() * 0.65 + 0.15,
        pulseSpeed: Math.random() * 0.012 + 0.005,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      })
    }

    // Smooth Mouse Specular Spotlight Tracking (Lerp)
    let targetX = width * 0.5
    let targetY = height * 0.35
    let currentX = targetX
    let currentY = targetY

    const handlePointerMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    let isVisible = true
    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    let time = 0

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      time += 0.015
      ctx.clearRect(0, 0, width, height)

      // Smoothly interpolate mouse spotlight position
      currentX += (targetX - currentX) * 0.06
      currentY += (targetY - currentY) * 0.06

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`
      }

      // Draw Floating Embers & Stardust
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i]

        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(time * p.swaySpeed + p.swayOffset) * (p.swayDist * 0.4)
          p.y += p.vy

          // Wrap around top to bottom
          if (p.y < -10) {
            p.y = height + 10
            p.x = Math.random() * width
          }
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10

          // Shimmer and pulse
          p.alpha += (p.targetAlpha - p.alpha) * p.pulseSpeed
          if (Math.abs(p.targetAlpha - p.alpha) < 0.04) {
            p.targetAlpha = Math.random() * 0.75 + 0.2
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.shadowBlur = p.size > 1.3 ? 9 : 4
        ctx.shadowColor = `${p.color}0.75)`
        ctx.fill()
      }

      ctx.shadowBlur = 0

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="ambient-scene" aria-hidden="true">
      {/* 1. Deep Obsidian Void Base */}
      <div className="ambient-base" />

      {/* 2. Luxury Dark Purple & Rose Aurora Mesh Foundation Layer */}
      <div className="ambient-liquid-wrap">
        <div className="ambient-liquid-img" />
        <div className="ambient-liquid-overlay" />
      </div>

      {/* 3. Fluid Animated Ambient Aurora Glow Orbs (Rose top-left & Violet bottom-right) */}
      <div className="ambient-aurora-orb ambient-orb-topleft" />
      <div className="ambient-aurora-orb ambient-orb-bottomright" />
      <div className="ambient-aurora-orb ambient-orb-center" />

      {/* 4. Interactive Specular Cursor Spotlight (Soft Rose-Violet Halo) */}
      <div ref={spotlightRef} className="ambient-cursor-spotlight" />

      {/* 5. Precision Dark Micro-Grid with Moving Horizon Scanner Beam */}
      <div className="ambient-grid">
        <div className="ambient-scanner-beam" />
      </div>

      {/* 6. Floating Diamond Stardust & Celestial Particles Canvas */}
      <canvas ref={canvasRef} className="ambient-canvas" />

      {/* 7. Deep Perimeter Contrast Vignette for crystal-clear text readability */}
      <div className="ambient-vignette" />

      {/* 8. Ultra-Fine Filmic Noise */}
      <div className="ambient-noise" />
    </div>
  )
}
