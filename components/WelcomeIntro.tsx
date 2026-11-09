'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

/**
 * In-memory session flag so the intro plays once on initial visit or refresh,
 * but does not replay during client-side route navigations.
 */
let hasPlayedThisSession = false

interface Star {
  x: number
  y: number
  z: number
  prevZ: number
  color: string
  size: number
}

const STAR_COLORS = ['#38bdf8', '#c084fc', '#fbbf24', '#ffffff', '#818cf8', '#ec4899']

export default function WelcomeIntro() {
  const [phase, setPhase] = useState<'intro' | 'warp' | 'done'>(() => {
    if (typeof window !== 'undefined' && hasPlayedThisSession) {
      return 'done'
    }
    return 'intro'
  })

  const [progress, setProgress] = useState(0)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [telemetry, setTelemetry] = useState({ rx: 0, ry: 0, fps: 60 })

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const warpSpeedRef = useRef(1)
  const isWarpingRef = useRef(false)
  const lastTimeRef = useRef(performance.now())
  const frameCountRef = useRef(0)

  // Trigger Warp Exit to smoothly unveil homepage
  const triggerWarp = useCallback(() => {
    if (isWarpingRef.current || phase === 'done') return
    isWarpingRef.current = true
    setPhase('warp')

    // After 750ms of warp hyperdrive dive, unmount intro completely
    setTimeout(() => {
      hasPlayedThisSession = true
      setPhase('done')
    }, 750)
  }, [phase])

  // Mouse / Touch Move handler for 3D Camera & Gyroscopic Parallax
  const handlePointerMove = (e: React.PointerEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1
    const ny = (e.clientY / window.innerHeight) * 2 - 1
    mouseRef.current.targetX = nx
    mouseRef.current.targetY = ny
    setCoords({
      x: Math.round(nx * 100) / 100,
      y: Math.round(ny * 100) / 100,
    })
    setTelemetry((prev) => ({
      ...prev,
      rx: Math.round(-ny * 14 * 10) / 10,
      ry: Math.round(nx * 14 * 10) / 10,
    }))
  }

  // 3D WebGL / Canvas Space-Warp Particle Engine
  useEffect(() => {
    if (phase === 'done') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Generate 320 3D spatial particles
    const starCount = 320
    const stars: Star[] = []
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2.2,
        y: (Math.random() - 0.5) * height * 2.2,
        z: Math.random() * 1200 + 1,
        prevZ: 1200,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        size: Math.random() * 2 + 0.8,
      })
    }
    starsRef.current = stars

    const focalLength = 380

    const render = (time: number) => {
      frameCountRef.current++
      if (time - lastTimeRef.current >= 1000) {
        setTelemetry((prev) => ({ ...prev, fps: frameCountRef.current }))
        frameCountRef.current = 0
        lastTimeRef.current = time
      }

      // Smooth Camera Lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06

      // Accelerate during warp dive
      if (isWarpingRef.current) {
        warpSpeedRef.current = Math.min(warpSpeedRef.current * 1.25 + 1.2, 48)
      } else {
        warpSpeedRef.current = 1.6
      }

      const speed = warpSpeedRef.current
      const cx = width / 2 + mouseRef.current.x * 60
      const cy = height / 2 + mouseRef.current.y * 50

      // Semi-transparent clear creates light trails during warp
      if (isWarpingRef.current) {
        ctx.fillStyle = 'rgba(3, 1, 12, 0.35)'
      } else {
        ctx.fillStyle = 'rgba(3, 1, 10, 0.85)'
      }
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        star.prevZ = star.z
        star.z -= speed * 2.5

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2.2
          star.y = (Math.random() - 0.5) * height * 2.2
          star.z = 1200
          star.prevZ = 1200
        }

        const k = focalLength / star.z
        const px = star.x * k + cx
        const py = star.y * k + cy

        const prevK = focalLength / star.prevZ
        const prevPx = star.x * prevK + cx
        const prevPy = star.y * prevK + cy

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthRatio = 1 - star.z / 1200
          const radius = Math.max(0.6, star.size * k * 0.7)

          if (isWarpingRef.current) {
            // Hyperspace light-speed streaks
            ctx.beginPath()
            ctx.moveTo(prevPx, prevPy)
            ctx.lineTo(px, py)
            ctx.strokeStyle = star.color
            ctx.lineWidth = radius * 1.8
            ctx.lineCap = 'round'
            ctx.stroke()
          } else {
            // Normal 3D starlight particle with soft glow
            ctx.beginPath()
            ctx.arc(px, py, radius, 0, Math.PI * 2)
            ctx.fillStyle = star.color
            ctx.globalAlpha = Math.min(1, depthRatio * 1.4)
            ctx.fill()
            ctx.globalAlpha = 1
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [phase])

  // Progress counter timer (0% to 100% in 3.6s, then auto-triggers warp)
  useEffect(() => {
    if (phase === 'done') return

    const duration = 3600
    const interval = 30
    const step = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            triggerWarp()
          }, 350)
          return 100
        }
        return next
      })
    }, interval)

    // Global fail-safe: dismiss after 5.5s under all circumstances
    const failSafe = setTimeout(() => {
      triggerWarp()
    }, 5500)

    return () => {
      clearInterval(timer)
      clearTimeout(failSafe)
    }
  }, [phase, triggerWarp])

  if (phase === 'done') {
    return null
  }

  const welcomeText = "WELCOME TO MOHIT'S WORLD"
  const isWarping = phase === 'warp'

  return (
    <div
      className={`m3d-overlay ${isWarping ? 'm3d-is-warping' : ''}`}
      onPointerMove={handlePointerMove}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Mohit's World 3D Spatial Experience"
    >
      {/* 3D WebGL / Canvas Space Warp Tunnel */}
      <canvas ref={canvasRef} className="m3d-canvas" />

      {/* Volumetric Nebulae Background */}
      <div className="m3d-nebula-wrap" aria-hidden="true">
        <div className="m3d-nebula m3d-nebula-1" />
        <div className="m3d-nebula m3d-nebula-2" />
        <div className="m3d-nebula m3d-nebula-3" />
        <div className="m3d-grid-floor" />
      </div>

      {/* Cybernetic Telemetry HUD (Top Bar) */}
      <header className="m3d-hud-top" aria-hidden="true">
        <div className="m3d-hud-tag">
          <span className="m3d-hud-dot" />
          <span>THEMOHITFACT // 3D SPATIAL ENGINE</span>
          <span className="m3d-hud-sep">/</span>
          <span className="m3d-fps">{telemetry.fps} FPS</span>
        </div>

        {/* Enter Portal / Skip Button */}
        <button
          type="button"
          className="m3d-enter-btn"
          onClick={triggerWarp}
          aria-label="Enter Website Homepage Immediately"
        >
          <span>ENTER PORTAL</span>
          <span className="m3d-enter-arrow">↵</span>
        </button>
      </header>

      {/* Central 3D Spatial Stage */}
      <main
        className="m3d-stage"
        style={
          {
            '--rx': `${telemetry.rx}deg`,
            '--ry': `${telemetry.ry}deg`,
            '--mouse-x': `${coords.x * 20}px`,
            '--mouse-y': `${coords.y * 20}px`,
          } as React.CSSProperties
        }
      >
        {/* Floating 3D Gyroscopic Gimbal Portal */}
        <div className="m3d-portal-rig">
          {/* Outer Cyan Laser Ring */}
          <div className="m3d-ring m3d-ring-outer">
            <span className="m3d-ring-node node-1" />
            <span className="m3d-ring-node node-2" />
          </div>

          {/* Middle Violet Laser Ring */}
          <div className="m3d-ring m3d-ring-mid">
            <span className="m3d-ring-node node-3" />
          </div>

          {/* Inner Molten Amber Ring */}
          <div className="m3d-ring m3d-ring-inner" />

          {/* Diffuse Luminous Core Glow */}
          <div className="m3d-core-bloom" />

          {/* 3D Floating Crystal Portrait Prism */}
          <div className="m3d-portrait-prism">
            <div className="m3d-portrait-glass">
              <img
                src="/image/Confident%20Young%20Man%20in%20White%20Shirt.png"
                alt="Mohit Kumar – TheMohitFact Creator"
                className="m3d-portrait-img"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget
                  if (!target.src.endsWith('mohit-portrait.png')) {
                    target.src = '/image/mohit-portrait.png'
                  }
                }}
              />
              <div className="m3d-portrait-sheen" />
              <div className="m3d-portrait-border" />
            </div>

            {/* Glowing Identity Pill */}
            <div className="m3d-identity-pill">
              <span className="m3d-identity-pulse" />
              <span>MOHIT KUMAR · THEMOHITFACT</span>
            </div>
          </div>
        </div>

        {/* 3D Kinetic Spatial Typography */}
        <div className="m3d-typography">
          <div className="m3d-eyebrow">
            <span className="m3d-sparkle">✦</span>
            <span>OFFICIAL DIGITAL DESTINATION</span>
            <span className="m3d-sparkle">✦</span>
          </div>

          <h1 className="m3d-title" aria-label={welcomeText}>
            {welcomeText.split('').map((char, i) => (
              <span
                key={i}
                className="m3d-char"
                style={{ animationDelay: `${0.1 + i * 0.032}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

          <p className="m3d-tagline">
            Knowledge that moves you forward · Curated Digital Books, Guides &amp; Study Notes
          </p>
        </div>

        {/* Cyber Progress Matrix */}
        <div className="m3d-matrix-loader">
          <div className="m3d-matrix-info">
            <span className="m3d-matrix-status">
              <span className="m3d-pulse-dot" />
              {progress >= 100 ? 'PORTAL READY // WARPING' : 'SPATIAL CALIBRATION IN PROGRESS...'}
            </span>
            <span className="m3d-matrix-pct">{Math.floor(progress)}%</span>
          </div>

          <div className="m3d-progress-track">
            <div
              className="m3d-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            >
              <span className="m3d-progress-laser" />
            </div>
          </div>
        </div>
      </main>

      {/* Telemetry Footer HUD */}
      <footer className="m3d-hud-bottom" aria-hidden="true">
        <div className="m3d-telemetry-item">
          <span className="m3d-lbl">3D COORD</span>
          <span className="m3d-val">
            X:[{coords.x >= 0 ? `+${coords.x}` : coords.x}] Y:[{coords.y >= 0 ? `+${coords.y}` : coords.y}]
          </span>
        </div>

        <div className="m3d-telemetry-item m3d-telemetry-center">
          <span className="m3d-lbl">SPATIAL RIG</span>
          <span className="m3d-val">ROT_X: {telemetry.rx}° / ROT_Y: {telemetry.ry}°</span>
        </div>

        <div className="m3d-telemetry-item">
          <span className="m3d-lbl">SYSTEM</span>
          <span className="m3d-val">THEMOHITFACT 2026 // SECURE</span>
        </div>
      </footer>

      {/* Hyperspace Warp White Flash Bloom */}
      <div className={`m3d-warp-flash ${isWarping ? 'm3d-flash-active' : ''}`} aria-hidden="true" />
    </div>
  )
}
