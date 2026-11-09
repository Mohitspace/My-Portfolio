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

    // Palette: Luxurious Molten Amber, Burnished Copper, Champagne Gold & Diamond Starlight
    const emberColors = [
      'rgba(255, 155, 30, ',   // Radiant Molten Amber
      'rgba(255, 120, 15, ',   // Deep Electric Orange
      'rgba(255, 185, 55, ',   // Luminous Gold
      'rgba(255, 215, 115, ',  // Soft Champagne
      'rgba(255, 245, 220, ',  // White-hot Core
      'rgba(215, 120, 255, ',  // Subtle Violet Specular Accent
    ]

    // Scale particle count to screen size
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55)
    const embers: Ember[] = []

    for (let i = 0; i < particleCount; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.45 - 0.15, // Upward floating ember drift
        swaySpeed: Math.random() * 0.02 + 0.008,
        swayDist: Math.random() * 1.5 + 0.5,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.65 + 0.2,
        targetAlpha: Math.random() * 0.75 + 0.2,
        pulseSpeed: Math.random() * 0.015 + 0.006,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
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
        ctx.shadowBlur = p.size > 1.4 ? 10 : 5
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
      {/* 1. Deep Obsidian Base Vignette */}
      <div className="ambient-base" />

      {/* 2. Liquid Obsidian & Amber Texture Layer with Smooth Wave Undulation */}
      <div className="ambient-liquid-wrap">
        <div className="ambient-liquid-img" />
        <div className="ambient-liquid-overlay" />
      </div>

      {/* 3. Molten Amber Caustic Pulse (matches glowing focal ring in artwork) */}
      <div className="ambient-caustic-pool" />

      {/* 4. Sweeping Molten Light Ribbons across curved ridges */}
      <div className="ambient-light-sweep sweep-1" />
      <div className="ambient-light-sweep sweep-2" />

      {/* 5. Deep Dimensional Ambient Glow Orbs */}
      <div className="ambient-glow-orb orb-amber-primary" />
      <div className="ambient-glow-orb orb-amber-secondary" />
      <div className="ambient-glow-orb orb-violet-deep" />

      {/* 6. Interactive Specular Cursor Spotlight (follows mouse smoothly) */}
      <div ref={spotlightRef} className="ambient-cursor-spotlight" />

      {/* 7. Subtle Cybernetic Micro-Grid Pattern */}
      <div className="ambient-grid" />

      {/* 8. Floating Golden Embers & Stardust Canvas */}
      <canvas ref={canvasRef} className="ambient-canvas" />

      {/* 9. Perimeter Contrast Vignette for crystal-clear readability */}
      <div className="ambient-vignette" />

      {/* 10. Filmic Texture Grain */}
      <div className="ambient-noise" />
    </div>
  )
}
