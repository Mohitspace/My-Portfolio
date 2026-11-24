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
  swaySpeed: number
  swayDist: number
  swayOffset: number
  alpha: number
  targetAlpha: number
  pulseSpeed: number
  color: string
  depth: number
}

interface Bokeh {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  alpha: number
  color: string
  pulse: number
  pulseSpeed: number
}

interface Meteor {
  x: number
  y: number
  len: number
  speed: number
  vx: number
  vy: number
  alpha: number
  active: boolean
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

    // Palette matching the uploaded luxury dark purple/rose mesh:
    // Pure diamond white, soft rose-pink, radiant lavender, electric violet, celestial cyan
    const stardustColors = [
      'rgba(255, 255, 255, ',     // Diamond White
      'rgba(253, 164, 175, ',     // Soft Rose Pink
      'rgba(244, 114, 182, ',     // Vibrant Blossom Pink
      'rgba(233, 213, 255, ',     // Soft Radiant Lavender
      'rgba(192, 132, 252, ',     // Electric Violet
      'rgba(216, 240, 255, ',     // Celestial Starlight
    ]

    // 1. Twinkling Pinpoint Stars
    const starCount = Math.min(Math.floor((width * height) / 16000), 55)
    const stars: Star[] = []
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.85 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.006,
        color: i % 3 === 0 ? '#fda4af' : i % 3 === 1 ? '#e9d5ff' : '#ffffff',
      })
    }

    // 2. Floating Stardust Particles (Multi-depth cosmic drift)
    const particleCount = Math.min(Math.floor((width * height) / 14000), 65)
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.35 - 0.1, // Smooth upward floating
        swaySpeed: Math.random() * 0.018 + 0.008,
        swayDist: Math.random() * 2 + 0.8,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.6 + 0.2,
        targetAlpha: Math.random() * 0.75 + 0.2,
        pulseSpeed: Math.random() * 0.015 + 0.006,
        color: stardustColors[Math.floor(Math.random() * stardustColors.length)],
        depth: Math.random() > 0.6 ? 1 : Math.random() > 0.3 ? 0.65 : 0.4,
      })
    }

    // 3. Out-of-focus soft glowing bokeh orbs
    const bokehList: Bokeh[] = []
    const bokehColors = [
      'rgba(244, 114, 182, ', // Rose
      'rgba(192, 132, 252, ', // Violet
      'rgba(168, 85, 247, ',  // Purple
      'rgba(233, 213, 255, ', // Lavender
    ]
    const bokehCount = 10
    for (let i = 0; i < bokehCount; i++) {
      bokehList.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 32 + 16,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.2 - 0.06,
        alpha: Math.random() * 0.16 + 0.04,
        color: bokehColors[Math.floor(Math.random() * bokehColors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.012 + 0.005,
      })
    }

    // 4. Occasional elegant meteor streak / shooting star
    const meteor: Meteor = {
      x: 0,
      y: 0,
      len: 120,
      speed: 12,
      vx: -8,
      vy: 6,
      alpha: 0,
      active: false,
      color: '#f472b6',
    }

    let meteorCooldown = 180 // frames (~3s)

    const spawnMeteor = () => {
      meteor.x = Math.random() * (width * 0.5) + width * 0.4
      meteor.y = Math.random() * (height * 0.3)
      meteor.len = Math.random() * 90 + 80
      meteor.speed = Math.random() * 6 + 10
      meteor.vx = -meteor.speed * 0.85
      meteor.vy = meteor.speed * 0.52
      meteor.alpha = 1
      meteor.active = true
      meteor.color = Math.random() > 0.5 ? '#fda4af' : '#c084fc'
    }

    // Mouse tracking for specular spotlight
    let targetX = width * 0.5
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

    let time = 0

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render)
        return
      }

      time += 0.016
      ctx.clearRect(0, 0, width, height)

      // Smooth spotlight lerp
      currentX += (targetX - currentX) * 0.06
      currentY += (targetY - currentY) * 0.06

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`
      }

      // --- A. Draw Soft Glowing Bokeh Circles ---
      for (let i = 0; i < bokehList.length; i++) {
        const b = bokehList[i]
        if (!prefersReducedMotion) {
          b.y += b.vy
          b.x += b.vx + Math.sin(time * 0.6 + b.pulse) * 0.15
          b.pulse += b.pulseSpeed

          if (b.y < -b.radius * 2) {
            b.y = height + b.radius * 2
            b.x = Math.random() * width
          }
          if (b.x < -b.radius * 2) b.x = width + b.radius * 2
          if (b.x > width + b.radius * 2) b.x = -b.radius * 2
        }

        const currentAlpha = Math.max(0.02, b.alpha * (0.8 + 0.35 * Math.sin(b.pulse)))
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
        grad.addColorStop(0, `${b.color}${currentAlpha})`)
        grad.addColorStop(0.55, `${b.color}${currentAlpha * 0.4})`)
        grad.addColorStop(1, `${b.color}0)`)

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // --- B. Draw Twinkling Stars ---
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
        ctx.globalAlpha = Math.max(0.12, Math.min(1, s.alpha))
        ctx.shadowBlur = s.size > 1.2 ? 8 : 4
        ctx.shadowColor = s.color
        ctx.fill()
      }

      // --- C. Draw Floating Stardust Particles ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(time * p.swaySpeed + p.swayOffset) * (p.swayDist * 0.35)
          p.y += p.vy * p.depth

          p.alpha += (p.targetAlpha - p.alpha) * p.pulseSpeed
          if (Math.abs(p.targetAlpha - p.alpha) < 0.04) {
            p.targetAlpha = Math.random() * 0.8 + 0.2
          }

          if (p.y < -15) {
            p.y = height + 15
            p.x = Math.random() * width
          }
          if (p.x < -15) p.x = width + 15
          if (p.x > width + 15) p.x = -15
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.depth, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.shadowBlur = p.size > 1.3 ? 9 : 4
        ctx.shadowColor = `${p.color}0.75)`
        ctx.fill()
      }

      // --- D. Draw Meteor / Shooting Star ---
      if (!prefersReducedMotion) {
        if (!meteor.active) {
          meteorCooldown--
          if (meteorCooldown <= 0) {
            spawnMeteor()
            meteorCooldown = Math.floor(Math.random() * 320 + 240) // every 4-8s
          }
        } else {
          meteor.x += meteor.vx
          meteor.y += meteor.vy
          meteor.alpha -= 0.018

          if (meteor.alpha <= 0 || meteor.x < -100 || meteor.y > height + 100) {
            meteor.active = false
          } else {
            const tailX = meteor.x - (meteor.vx / meteor.speed) * meteor.len
            const tailY = meteor.y - (meteor.vy / meteor.speed) * meteor.len

            const meteorGrad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY)
            meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha * 0.95})`)
            meteorGrad.addColorStop(0.3, meteor.color === '#fda4af' ? `rgba(253, 164, 175, ${meteor.alpha * 0.7})` : `rgba(192, 132, 252, ${meteor.alpha * 0.7})`)
            meteorGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')

            ctx.beginPath()
            ctx.moveTo(meteor.x, meteor.y)
            ctx.lineTo(tailX, tailY)
            ctx.strokeStyle = meteorGrad
            ctx.lineWidth = 1.8
            ctx.shadowBlur = 8
            ctx.shadowColor = meteor.color
            ctx.stroke()
          }
        }
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
      {/* 1. Base Wallpaper Plate: Luxury Dark Purple & Rose Aurora Mesh */}
      <div className="hero-cinematic-layer hero-plate-img" />

      {/* 2. Top-Left Warm Rose / Coral Ambient Radiant Glow Orb */}
      <div className="hero-aurora-orb hero-aurora-topleft" />

      {/* 3. Bottom-Right Vibrant Violet / Lavender Ambient Glow Orb */}
      <div className="hero-aurora-orb hero-aurora-bottomright" />

      {/* 4. Center-Diagonal Deep Royal Indigo Cosmic Bridge */}
      <div className="hero-aurora-orb hero-aurora-center" />

      {/* 5. Shimmering Aurora Caustic Sheen Wave */}
      <div className="hero-aurora-caustic-wave" />

      {/* 6. Subtle Cybernetic Micro-Grid (Luxury Tech Texture) */}
      <div className="hero-aurora-grid" />

      {/* 7. Interactive Specular Studio Spotlight */}
      <div ref={spotlightRef} className="hero-cursor-spotlight" />

      {/* 8. Live Canvas: Diamond Stars, Stardust Particles, Soft Bokeh & Meteors */}
      <canvas ref={canvasRef} className="hero-star-canvas" />

      {/* 9. Top Vignette (Seamless navbar integration) */}
      <div className="hero-top-vignette" />

      {/* 10. Bottom Transition Gradient into Explore Section */}
      <div className="hero-bottom-transition" />
    </div>
  )
}
