'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  alpha: number
  targetAlpha: number
  pulseSpeed: number
  color: string
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const colors = [
      'rgba(192, 132, 252, ', // Lavender
      'rgba(168, 85, 247, ', // Neon Violet
      'rgba(244, 114, 182, ', // Soft Pink
      'rgba(236, 72, 153, ', // Magenta
      'rgba(56, 189, 248, ', // Electric Blue
      'rgba(255, 255, 255, ', // White Star
    ]

    const particleCount = Math.min(Math.floor((width * height) / 18000), 70)
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1,
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.8 + 0.2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

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

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy

          // Wrap edges
          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0

          // Shimmer alpha
          p.alpha += (p.targetAlpha - p.alpha) * p.pulseSpeed
          if (Math.abs(p.targetAlpha - p.alpha) < 0.05) {
            p.targetAlpha = Math.random() * 0.8 + 0.2
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.shadowBlur = p.size > 1.5 ? 8 : 4
        ctx.shadowColor = `${p.color}0.8)`
        ctx.fill()
      }

      ctx.shadowBlur = 0

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="ambient-scene" aria-hidden="true">
      {/* Deep Space Base Vignette */}
      <div className="ambient-base" />

      {/* Futuristic Subtle Grid Pattern */}
      <div className="ambient-grid" />

      {/* Animated Glowing Light Beams & Spotlights */}
      <div className="ambient-beam beam-1" />
      <div className="ambient-beam beam-2" />

      {/* Floating Violet & Midnight Purple Orbs */}
      <div className="ambient-orb orb-violet" />
      <div className="ambient-orb orb-pink" />
      <div className="ambient-orb orb-blue" />
      <div className="ambient-orb orb-center" />

      {/* Starfield Particles Canvas */}
      <canvas ref={canvasRef} className="ambient-canvas" />

      {/* Subtle Noise / Grain Overlay for filmic cinematic finish */}
      <div className="ambient-noise" />
    </div>
  )
}
