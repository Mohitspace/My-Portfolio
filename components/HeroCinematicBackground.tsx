'use client'

import React, { useEffect, useRef } from 'react'

interface Sparkle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  alpha: number
  targetAlpha: number
  pulseSpeed: number
  color: string
  twinklePhase: number
  depth: number // 1: foreground, 0.6: mid, 0.3: background
}

interface BokehCircle {
  x: number
  y: number
  radius: number
  vy: number
  vx: number
  alpha: number
  color: string
  pulse: number
  pulseSpeed: number
}

interface DriftingPage {
  x: number
  y: number
  w: number
  h: number
  vx: number
  vy: number
  rot: number
  rotSpeed: number
  alpha: number
  color: string
}

interface NeuralNode {
  x: number
  y: number
  baseX: number
  baseY: number
  radius: number
  pulse: number
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

    // Palette matching the uploaded image:
    // Electric cyan, neon magenta, warm gold, radiant white
    const sparkleColors = [
      '#ffffff',
      '#fef08a', // warm gold
      '#facc15', // amber gold
      '#fbbf24', // rich gold
      '#38bdf8', // electric cyan
      '#06b6d4', // deep cyan
      '#e879f9', // neon magenta
      '#c084fc', // purple violet
    ]

    // 1. Upward streaming stardust sparkles (concentrated along the ascending stairs)
    const sparkles: Sparkle[] = []
    const sparkleCount = Math.min(Math.floor((width * height) / 10000), 75)

    for (let i = 0; i < sparkleCount; i++) {
      const xRatio = 0.32 + Math.random() * 0.68
      sparkles.push({
        x: xRatio * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.4) * 0.35,
        vy: -Math.random() * 0.5 - 0.18, // gentle upward drift
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.85 + 0.15,
        pulseSpeed: Math.random() * 0.025 + 0.008,
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
        twinklePhase: Math.random() * Math.PI * 2,
        depth: Math.random() > 0.6 ? 1 : Math.random() > 0.3 ? 0.6 : 0.3,
      })
    }

    // 2. Out-of-focus golden bokeh circles
    const bokehCircles: BokehCircle[] = []
    const bokehColors = [
      'rgba(251, 191, 36, ', // gold
      'rgba(245, 158, 11, ', // amber
      'rgba(232, 121, 249, ', // magenta
      'rgba(56, 189, 248, ', // cyan
    ]
    const bokehCount = 14

    for (let i = 0; i < bokehCount; i++) {
      bokehCircles.push({
        x: (0.38 + Math.random() * 0.62) * width,
        y: Math.random() * height,
        radius: Math.random() * 26 + 14,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -Math.random() * 0.25 - 0.08,
        alpha: Math.random() * 0.18 + 0.05,
        color: bokehColors[Math.floor(Math.random() * bokehColors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.008,
      })
    }

    // 3. Floating zero-gravity paper sheets & glowing book pages
    const pages: DriftingPage[] = []
    const pageCount = 8
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        x: (0.46 + Math.random() * 0.48) * width,
        y: Math.random() * height,
        w: Math.random() * 12 + 10,
        h: Math.random() * 16 + 14,
        vx: (Math.random() - 0.45) * 0.25,
        vy: -Math.random() * 0.3 - 0.12,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.012,
        alpha: Math.random() * 0.5 + 0.35,
        color: i % 2 === 0 ? 'rgba(255, 255, 255, ' : 'rgba(224, 242, 254, ',
      })
    }

    // 4. Subtle neural network constellation nodes around the book
    const neuralNodes: NeuralNode[] = []
    const nodeCount = 14
    for (let i = 0; i < nodeCount; i++) {
      const baseX = (0.46 + Math.random() * 0.28) * width
      const baseY = (0.32 + Math.random() * 0.36) * height
      neuralNodes.push({
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        radius: Math.random() * 1.8 + 1.2,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    // Cursor tracking for subtle atmospheric illumination
    let targetX = width * 0.55
    let targetY = height * 0.45
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

    let time = 0

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render)
        return
      }

      time += 0.016
      ctx.clearRect(0, 0, width, height)

      // Smooth cursor lerp
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`
      }

      // --- A. Draw Out-of-Focus Golden Bokeh ---
      for (let i = 0; i < bokehCircles.length; i++) {
        const b = bokehCircles[i]
        if (!prefersReducedMotion) {
          b.y += b.vy
          b.x += b.vx + Math.sin(time * 0.8 + b.pulse) * 0.15
          b.pulse += b.pulseSpeed

          if (b.y < -b.radius * 2) {
            b.y = height + b.radius * 2
            b.x = (0.38 + Math.random() * 0.62) * width
          }
        }

        const currentAlpha = Math.max(0.02, b.alpha * (0.8 + 0.3 * Math.sin(b.pulse)))
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
        grad.addColorStop(0, `${b.color}${currentAlpha})`)
        grad.addColorStop(0.6, `${b.color}${currentAlpha * 0.4})`)
        grad.addColorStop(1, `${b.color}0)`)

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // --- B. Draw Neural Network Lines & Nodes ---
      ctx.save()
      for (let i = 0; i < neuralNodes.length; i++) {
        const n = neuralNodes[i]
        if (!prefersReducedMotion) {
          n.pulse += 0.02
          n.x = n.baseX + Math.sin(time + n.pulse) * 6
          n.y = n.baseY + Math.cos(time * 0.8 + n.pulse) * 5
        }

        // Connect to neighbors
        for (let j = i + 1; j < neuralNodes.length; j++) {
          const n2 = neuralNodes[j]
          const dx = n2.x - n.x
          const dy = n2.y - n.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * 0.26
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(n2.x, n2.y)
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()

            // Small light pulse traveling along line
            const pulsePos = (Math.sin(time * 1.5 + i + j) + 1) / 2
            const px = n.x + dx * pulsePos
            const py = n.y + dy * pulsePos
            ctx.beginPath()
            ctx.arc(px, py, 1, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${lineAlpha * 1.5})`
            ctx.fill()
          }
        }

        // Draw node
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)'
        ctx.shadowBlur = 6
        ctx.shadowColor = '#38bdf8'
        ctx.fill()
      }
      ctx.restore()

      // --- C. Draw Zero-Gravity Floating Pages ---
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]
        if (!prefersReducedMotion) {
          p.y += p.vy
          p.x += p.vx + Math.sin(time + i) * 0.25
          p.rot += p.rotSpeed

          if (p.y < -30) {
            p.y = height + 30
            p.x = (0.46 + Math.random() * 0.48) * width
          }
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(p.rot * 1.5) * 0.4 + 0.6) // 3D tumble illusion

        // Page glow
        ctx.shadowColor = '#facc15'
        ctx.shadowBlur = 8

        // Glassy paper body
        ctx.fillStyle = `${p.color}${p.alpha * 0.55})`
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)

        // Page border
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.85})`
        ctx.lineWidth = 0.8
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h)

        // Subtle lines on paper
        ctx.strokeStyle = `rgba(251, 191, 36, ${p.alpha * 0.4})`
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(-p.w * 0.35, -p.h * 0.2)
        ctx.lineTo(p.w * 0.35, -p.h * 0.2)
        ctx.moveTo(-p.w * 0.35, 0)
        ctx.lineTo(p.w * 0.35, 0)
        ctx.moveTo(-p.w * 0.35, p.h * 0.2)
        ctx.lineTo(p.w * 0.1, p.h * 0.2)
        ctx.stroke()

        ctx.restore()
      }

      // --- D. Draw Upward Streaming Sparkles & Stardust ---
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i]
        if (!prefersReducedMotion) {
          s.x += s.vx + Math.sin(time * 1.2 + s.twinklePhase) * 0.2
          s.y += s.vy * s.depth

          s.alpha += (s.targetAlpha - s.alpha) * s.pulseSpeed
          if (Math.abs(s.targetAlpha - s.alpha) < 0.05) {
            s.targetAlpha = Math.random() * 0.85 + 0.15
          }

          if (s.y < -15) {
            s.y = height + 15
            s.x = (0.32 + Math.random() * 0.68) * width
          }
          if (s.x < 0) s.x = width
          if (s.x > width) s.x = 0
        }

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * s.depth, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha))
        ctx.shadowBlur = s.size > 1.4 ? 10 : 4
        ctx.shadowColor = s.color
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
      {/* 1. Base Wallpaper Plate: Floating Glass Steps, Glowing Book & Zero-Gravity Pages */}
      <div className="hero-cinematic-layer hero-plate-img" />

      {/* 2. Idea Bulb Ambient Warm Glow Breathe (4-second smooth cycle) */}
      <div className="hero-bulb-glow" />

      {/* 3. Top-Right Volumetric Cyan & Pink Shimmering Light Rays */}
      <div className="hero-light-rays" />

      {/* 4. Glass Steps Specular Light Wave Sweep (Ascending cyan-magenta wave) */}
      <div className="hero-steps-wave-sweep" />

      {/* 5. Left Calm Dark Vignette (Guarantees crisp readability of Hero Text & Cards) */}
      <div className="hero-left-calm-vignette" />

      {/* 6. Top Space Vignette (Seamless navbar blend) */}
      <div className="hero-top-vignette" />

      {/* 7. Interactive Specular Studio Spotlight */}
      <div ref={spotlightRef} className="hero-cursor-spotlight" />

      {/* 8. Canvas for Golden Stardust, Out-of-Focus Bokeh, Neural Nodes & Zero-Gravity Pages */}
      <canvas ref={canvasRef} className="hero-star-canvas" />

      {/* 9. Bottom Transition Gradient into Explore Section */}
      <div className="hero-bottom-transition" />
    </div>
  )
}
