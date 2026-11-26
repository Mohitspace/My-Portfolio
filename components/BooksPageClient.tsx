'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import styles from './BooksPage.module.css'
import BookReader from './BookReader'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

export interface BookItem {
  id: string
  title: string
  author?: string | null
  category: string
  year?: number | null
  pages?: number | null
  description?: string | null
  format?: string | null
  file_path?: string
  cover_url?: string | null
  size_bytes?: number | null
  access?: string
  tags?: string[]
  created_at: string
  spine?: {
    color?: string
    accent?: string
    label?: string
  }
}

interface BooksPageClientProps {
  initialBooks: BookItem[]
  favIds?: string[]
}

const ALL = 'All Resources'

// Smoothstep utility: 3x^2 - 2x^3
function smoothstep(x: number): number {
  const c = Math.max(0, Math.min(1, x))
  return c * c * (3 - 2 * c)
}

// B(r) continuous step function from reference
function stepB(r: number): number {
  if (Math.abs(r) < 1) {
    return (r + Math.sin(Math.PI * r) / Math.PI) / 2
  }
  return r > 0 ? 0.5 : -0.5
}

export default function BooksPageClient({
  initialBooks = [],
  favIds = [],
}: BooksPageClientProps) {
  const { open } = useAuth()
  const sb = createClient()

  // State
  const [books] = useState<BookItem[]>(initialBooks)
  const [favs, setFavs] = useState<string[]>(favIds)
  const [q, setQ] = useState('')
  const [selectedCat, setSelectedCat] = useState(ALL)
  const [selectedFmt, setSelectedFmt] = useState('')
  const [sortBy, setSortBy] = useState('new')
  const [savedOnly, setSavedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'shelf' | 'grid'>('shelf')

  // Selected book & Reader state
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null)
  const [readerState, setReaderState] = useState<{ book: BookItem; fileUrl: string } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Motion engine refs
  const stagePanelRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const stageOriginRef = useRef<HTMLDivElement | null>(null)
  const probeRef = useRef<HTMLDivElement | null>(null)
  const playRingRef = useRef<HTMLButtonElement | null>(null)
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const detailDialogRef = useRef<HTMLDialogElement | null>(null)
  const inkMaskCirclesRef = useRef<SVGCircleElement[]>([])

  // Dimensions
  const dimsRef = useRef({ H: 380, ws: 64, d: 200, gap: 11, W: 1200, cy: 300 })

  // Animation & Physics State
  const animStateRef = useRef({
    s: 0,
    T: 0,
    hoverIdx: -1,
    activeIdx: 0,
    mx: -1000,
    my: -1000,
    cx: -1000,
    cy: -1000,
    tiltX: 0,
    tiltY: 0,
    onCover: false,
    isOpen: false,
    isDragging: false,
    dragStartX: 0,
    dragStartT: 0,
    hasMoved: false,
    lastTime: 0,
    wheelTimer: null as any,
    inkRaf: null as any,
    sheetAnim: null as Animation | null,
    lifts: {} as Record<number, number>,
  })

  // Caption state
  const [caption, setCaption] = useState({
    title: '',
    sub: '',
    meta: '',
    dir: 1,
  })

  // Synchronize favorites
  useEffect(() => {
    setFavs(favIds)
  }, [favIds])

  // Extract categories & formats
  const categories = useMemo(() => {
    const cats = [...new Set(books.map((b) => b.category).filter(Boolean))]
    return [ALL, ...cats]
  }, [books])

  const formats = useMemo(() => {
    return [...new Set(books.map((b) => b.format).filter(Boolean))].sort()
  }, [books])

  // Filter & Sort
  const filteredBooks = useMemo(() => {
    const query = q.trim().toLowerCase()
    return books
      .filter((b) => {
        if (selectedCat !== ALL && b.category !== selectedCat) return false
        if (selectedFmt && b.format !== selectedFmt) return false
        if (savedOnly && !favs.includes(b.id)) return false
        if (!query) return true

        const searchable = [b.title, b.author, b.description, b.category, ...(b.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return searchable.includes(query)
      })
      .sort((a, b) => {
        if (sortBy === 'pop') return (b.pages || 0) - (a.pages || 0)
        if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '')
        if (sortBy === 'big') return (b.size_bytes || 0) - (a.size_bytes || 0)
        if (sortBy === 'old') return +new Date(a.created_at) - +new Date(b.created_at)
        return +new Date(b.created_at) - +new Date(a.created_at)
      })
  }, [books, q, selectedCat, selectedFmt, savedOnly, favs, sortBy])

  // Determine copies for endless shelf: minimum 3 copies or 24 items
  const N = filteredBooks.length
  const copyCount = N >= 8 ? 3 : N >= 4 ? 4 : N > 0 ? 6 : 0
  const totalTapes = N * copyCount

  // Pre-resolve dimensions from probe
  const updateDims = useCallback(() => {
    if (!probeRef.current || !viewportRef.current) return
    const H = probeRef.current.offsetHeight || 380
    const ws = (H * 142) / 840
    const d = (H * 474) / 900
    const gap = H * 0.03
    const rect = viewportRef.current.getBoundingClientRect()
    dimsRef.current = {
      H,
      ws,
      d,
      gap,
      W: rect.width,
      cy: rect.height / 2,
    }

    if (stageOriginRef.current) {
      stageOriginRef.current.style.setProperty('--ws', `${ws}px`)
      stageOriginRef.current.style.setProperty('--d', `${d}px`)
    }
  }, [])

  useEffect(() => {
    updateDims()
    window.addEventListener('resize', updateDims, { passive: true })
    return () => window.removeEventListener('resize', updateDims)
  }, [updateDims])

  // Reset scroll and target when filtered list changes
  useEffect(() => {
    if (N > 0) {
      // Start near middle copy
      const midCopy = Math.floor(copyCount / 2)
      const initialScroll = midCopy * N
      animStateRef.current.s = initialScroll
      animStateRef.current.T = initialScroll
      animStateRef.current.activeIdx = 0

      const b = filteredBooks[0]
      setCaption({
        title: b.title,
        sub: `${b.category.toUpperCase()} — ${b.pages || 50} PAGES`,
        meta: b.author ? `BY ${b.author.toUpperCase()}` : 'THEMOHITFACT ARCHIVE',
        dir: 1,
      })
    }
  }, [filteredBooks, N, copyCount])

  // Favorite toggle handler
  const handleToggleFav = async (bookId: string) => {
    setActionError(null)
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) {
      return open('login', () => handleToggleFav(bookId))
    }

    const isFav = favs.includes(bookId)
    setFavs((prev) => (isFav ? prev.filter((id) => id !== bookId) : [...prev, bookId]))

    const { error } = isFav
      ? await sb.from('favorites').delete().eq('resource_id', bookId)
      : await sb.from('favorites').insert({ resource_id: bookId })

    if (error) {
      setFavs(favIds)
      setActionError('Could not update favorites.')
    }
  }

  // Download handler
  const handleDownload = (book: BookItem) => {
    const a = document.createElement('a')
    a.href = book.file_path || `/books/${encodeURIComponent(book.title)}.pdf`
    a.download = `${book.title}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Read Now handler: launches existing BookReader
  const handleReadNow = (book: BookItem) => {
    if (selectedBook) {
      closeDetail()
    }
    setReaderState({
      book,
      fileUrl: book.file_path || `/books/${encodeURIComponent(book.title)}.pdf`,
    })
  }

  // Open detail dialog with clip-path growth and ink bleed
  const openDetail = useCallback(
    (book: BookItem, coverRect?: DOMRect | null) => {
      setSelectedBook(book)
      animStateRef.current.isOpen = true

      const dialog = detailDialogRef.current
      if (!dialog) return

      dialog.showModal()

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const duration = prefersReduced ? 1 : 1050

      // Animate dialog clip-path growth from cover rect
      if (coverRect) {
        const top = coverRect.top
        const right = window.innerWidth - coverRect.right
        const bottom = window.innerHeight - coverRect.bottom
        const left = coverRect.left

        dialog.style.transformOrigin = `${coverRect.left + coverRect.width / 2}px ${coverRect.top + coverRect.height / 2}px`

        const anim = dialog.animate(
          [
            {
              clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`,
              transform: 'rotate(-4.5deg)',
            },
            {
              clipPath: 'inset(0px 0px 0px 0px round 0px)',
              transform: 'rotate(0deg)',
            },
          ],
          {
            duration,
            easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
            fill: 'both',
          }
        )
        animStateRef.current.sheetAnim = anim
      }

      // Ink Mask Blobs animation: expand radii from 0 to 720 over 1250ms
      const circles = inkMaskCirclesRef.current
      circles.forEach((c) => {
        if (c) c.setAttribute('r', '0')
      })

      const blobDelays = [0, 120, 220, 300, 360, 420, 180]
      const startTime = performance.now() + 520

      if (animStateRef.current.inkRaf) {
        cancelAnimationFrame(animStateRef.current.inkRaf)
      }

      const animateInk = (now: number) => {
        let allDone = true
        circles.forEach((circle, idx) => {
          if (!circle) return
          const delay = blobDelays[idx] || 0
          const elapsed = now - (startTime + delay)
          if (elapsed < 0) {
            allDone = false
            return
          }
          const p = Math.min(1, elapsed / 1250)
          // ease-out cubic: 1 - (1 - p)^3
          const easeOut = 1 - Math.pow(1 - p, 3)
          const radius = easeOut * 720
          circle.setAttribute('r', radius.toFixed(1))
          if (p < 1) allDone = false
        })

        if (!allDone && animStateRef.current.isOpen) {
          animStateRef.current.inkRaf = requestAnimationFrame(animateInk)
        }
      }

      animStateRef.current.inkRaf = requestAnimationFrame(animateInk)
    },
    []
  )

  // Close detail dialog with reverse animation
  const closeDetail = useCallback(() => {
    const dialog = detailDialogRef.current
    if (!dialog) return

    animStateRef.current.isOpen = false
    if (animStateRef.current.inkRaf) {
      cancelAnimationFrame(animStateRef.current.inkRaf)
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      dialog.close()
      setSelectedBook(null)
      return
    }

    const anim = dialog.animate(
      [
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
        { clipPath: 'inset(35% 40% 35% 40% round 3px)', transform: 'rotate(-4.5deg)' },
      ],
      {
        duration: 550,
        easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
        fill: 'both',
      }
    )

    anim.onfinish = () => {
      dialog.close()
      setSelectedBook(null)
    }
  }, [])

  // Jump to specific book index
  const jumpToBook = useCallback(
    (index: number) => {
      if (N <= 0) return
      const s = animStateRef.current.s
      const currentNorm = ((Math.round(s) % N) + N) % N
      let diff = index - currentNorm
      if (diff > N / 2) diff -= N
      if (diff < -N / 2) diff += N
      animStateRef.current.T = Math.round(s) + diff
    },
    [N]
  )

  // Main Animation Loop (rAF)
  useEffect(() => {
    if (viewMode !== 'shelf' || N === 0) return

    let rafId: number
    const state = animStateRef.current

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick)

      const dt = state.lastTime ? Math.min(0.05, (now - state.lastTime) / 1000) : 0.016
      state.lastTime = now

      const { H, ws, d, gap, W, cy } = dimsRef.current
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // 1. Spring physics for scroll
      const k = state.isDragging ? 18 : 5.2
      if (prefersReduced) {
        state.s = state.T
      } else {
        state.s += (state.T - state.s) * (1 - Math.exp(-k * dt))
        if (Math.abs(state.T - state.s) < 0.0001) state.s = state.T
      }

      // Normalise loop when drifting past +/- 4 loops
      if (state.s > N * 3) {
        state.s -= N
        state.T -= N
      } else if (state.s < N) {
        state.s += N
        state.T += N
      }

      // 2. Cursor follow smoothing
      state.cx += (state.mx - state.cx) * (1 - Math.exp(-16 * dt))
      state.cy += (state.my - state.cy) * (1 - Math.exp(-16 * dt))

      if (cursorRef.current && window.matchMedia('(pointer: fine)').matches) {
        cursorRef.current.style.transform = `translate3d(${state.cx}px, ${state.cy}px, 0)`
      }

      // 3. Test if cursor is over active cover
      const onCover =
        Math.abs(state.mx - W / 2) < 0.55 * d &&
        Math.abs(state.my - cy) < 0.55 * H &&
        !state.isOpen &&
        Math.abs(state.T - state.s) < 0.35
      state.onCover = onCover

      // 4. Tilt calculation towards mouse
      let targetTiltY = 0
      let targetTiltX = 0
      if (onCover) {
        targetTiltY = ((state.mx - W / 2) / (0.55 * d)) * 9
        targetTiltX = -((state.my - cy) / (H / 2)) * 6
      } else {
        targetTiltY = ((state.mx - W / 2) / Math.max(1, W)) * 4
        targetTiltX = 0
      }
      state.tiltY += (targetTiltY - state.tiltY) * (1 - Math.exp(-7 * dt))
      state.tiltX += (targetTiltX - state.tiltX) * (1 - Math.exp(-7 * dt))

      // 5. Active book & Caption swap
      const roundedS = Math.round(state.s)
      const currentActive = ((roundedS % N) + N) % N
      if (currentActive !== state.activeIdx) {
        const dir = state.T >= state.s ? 1 : -1
        state.activeIdx = currentActive
        const b = filteredBooks[currentActive]
        if (b) {
          setCaption({
            title: b.title,
            sub: `${b.category.toUpperCase()} — ${b.pages || 50} PAGES`,
            meta: b.author ? `BY ${b.author.toUpperCase()}` : 'THEMOHITFACT ARCHIVE',
            dir,
          })
        }
      }

      // 6. Update Tape 3D Elements
      const stageOrigin = stageOriginRef.current
      if (!stageOrigin) return

      const tapeEls = stageOrigin.children
      for (let v = 0; v < tapeEls.length; v++) {
        const el = tapeEls[v] as HTMLElement
        const bookIdx = v % N

        // Relative index r within range [-totalTapes/2, totalTapes/2]
        let r = ((v - state.s) % totalTapes)
        if (r > totalTapes / 2) r -= totalTapes
        if (r < -totalTapes / 2) r += totalTapes

        // Horizontal position x = F(r)
        const x = r * (ws + gap) + (d - ws + 1.6 * gap) * stepB(r)

        // Culling off-screen tapes
        if (Math.abs(x) > W / 2 + 1.8 * d) {
          el.style.visibility = 'hidden'
          continue
        }
        el.style.visibility = 'visible'

        // Openness o: 1 for active item, 0 for upright spines
        const o = smoothstep(Math.max(0, 1 - Math.abs(r)))

        // Lift tracking for hovered spine
        const isHovered = state.hoverIdx === v && Math.abs(r) > 0.5
        const currentLift = state.lifts[v] || 0
        const targetLift = isHovered ? 1 : 0
        const newLift = currentLift + (targetLift - currentLift) * (1 - Math.exp(-12 * dt))
        state.lifts[v] = newLift

        // Rotations & Translations
        const rotY = -90 * o + state.tiltY * o
        const rotX = state.tiltX * o
        const rotZ = -4.5 * o
        const transZ = o * 0.2 * H
        const transY = -o * 0.025 * H - newLift * 0.045 * H

        el.style.transform = `translate3d(${x.toFixed(2)}px, ${transY.toFixed(2)}px, ${transZ.toFixed(2)}px) rotateZ(${rotZ.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`
        el.style.zIndex = `${Math.round(100 - Math.abs(r) * 4)}`

        // Shading: spine darkens as it opens, cover brightens
        const spineShade = el.querySelector('[data-spine-shade]') as HTMLElement
        const coverShade = el.querySelector('[data-cover-shade]') as HTMLElement
        if (spineShade) spineShade.style.opacity = `${(o * 0.55).toFixed(3)}`
        if (coverShade) coverShade.style.opacity = `${((1 - o) * 0.5).toFixed(3)}`
      }

      // 7. Update Play Ring button
      if (playRingRef.current) {
        const ringScale = smoothstep(Math.max(0, 1 - Math.abs(state.T - state.s) * 3))
        if (ringScale > 0.01 && !state.isOpen) {
          playRingRef.current.style.display = 'flex'
          playRingRef.current.style.transform = `scale(${ringScale.toFixed(3)})`
          playRingRef.current.style.left = `${W / 2 - 0.5 * d - 10}px`
          playRingRef.current.style.top = `${cy + 0.36 * H}px`
        } else {
          playRingRef.current.style.display = 'none'
        }
      }

      // 8. Update Custom Cursor Mode
      if (cursorRef.current) {
        cursorRef.current.classList.remove(
          styles['bk-cursor-spine'],
          styles['bk-cursor-btn'],
          styles['bk-cursor-open']
        )
        if (state.isOpen) {
          cursorRef.current.style.display = 'none'
        } else {
          cursorRef.current.style.display = 'flex'
          if (onCover) {
            cursorRef.current.classList.add(styles['bk-cursor-open'])
          } else if (state.hoverIdx >= 0) {
            cursorRef.current.classList.add(styles['bk-cursor-spine'])
          }
        }
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [viewMode, N, totalTapes, filteredBooks])

  // Mouse & Drag Event Handlers on Viewport
  const handlePointerDown = (e: React.PointerEvent) => {
    if (animStateRef.current.isOpen) return
    const state = animStateRef.current
    state.isDragging = true
    state.dragStartX = e.clientX
    state.dragStartT = state.T
    state.hasMoved = false
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = animStateRef.current
    state.mx = e.clientX
    state.my = e.clientY

    if (!state.isDragging) return
    const dx = e.clientX - state.dragStartX
    if (Math.abs(dx) > 5) {
      state.hasMoved = true
      const { ws, gap } = dimsRef.current
      state.T = state.dragStartT - dx / (ws + gap)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = animStateRef.current
    if (state.isDragging) {
      state.isDragging = false
      state.T = Math.round(state.T)
      try {
        ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      } catch {}
    }
  }

  // Wheel listener
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (e: WheelEvent) => {
      if (animStateRef.current.isOpen) return
      e.preventDefault()
      const state = animStateRef.current
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      const { ws, gap } = dimsRef.current
      state.T += (delta / (ws + gap)) * 0.45

      clearTimeout(state.wheelTimer)
      state.wheelTimer = setTimeout(() => {
        state.T = Math.round(state.T)
      }, 160)
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (animStateRef.current.isOpen) {
        if (e.key === 'Escape') closeDetail()
        return
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const state = animStateRef.current
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        state.T = Math.round(state.T) - 1
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        state.T = Math.round(state.T) + 1
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const book = filteredBooks[state.activeIdx]
        if (book) openDetail(book)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredBooks, openDetail, closeDetail])

  // Tape click handler
  const handleTapeClick = (v: number, e: React.MouseEvent) => {
    if (animStateRef.current.hasMoved) return
    const state = animStateRef.current
    let r = ((v - state.s) % totalTapes)
    if (r > totalTapes / 2) r -= totalTapes
    if (r < -totalTapes / 2) r += totalTapes

    const bookIdx = v % N
    const book = filteredBooks[bookIdx]

    if (Math.abs(r) < 0.5) {
      // Clicked active item: open detail sheet!
      const coverEl = (e.currentTarget as HTMLElement).querySelector(`.${styles['bk-cover-face']}`)
      const rect = coverEl ? coverEl.getBoundingClientRect() : null
      openDetail(book, rect)
    } else {
      // Clicked neighbor tape: glide it to center
      state.T = Math.round(state.T + r)
    }
  }

  // Active book item for play ring
  const activeBook = filteredBooks[animStateRef.current.activeIdx] || filteredBooks[0]

  return (
    <div className={styles['bk-page-wrapper']}>
      {/* Off-screen height probe */}
      <div
        ref={probeRef}
        style={{ position: 'absolute', visibility: 'hidden', height: 'var(--H)', pointerEvents: 'none' }}
      />

      {/* Scoped Custom Cursor */}
      <div ref={cursorRef} className={styles['bk-custom-cursor']}>
        <div className={styles['bk-cursor-dot']} />
        <div className={styles['bk-cursor-label']}>
          OPEN
          <br />
          READ
        </div>
      </div>

      {/* ====================================================================
          HEADER BANNER (Preserved design, typography, gradient & sparkle)
          ==================================================================== */}
      <div className={styles['bk-header-banner']}>
        <div className={styles['bk-header-badge']}>
          <span className={styles['bk-badge-sparkle']}>✦</span>
          <span>THEMOHITFACT DIGITAL LIBRARY &amp; READING SANCTUARY</span>
          <span className={styles['bk-badge-sparkle']}>✦</span>
        </div>

        <h1 className={styles['bk-header-title']}>
          Books &amp; <span className={styles['bk-hero-gradient']}>PDF Collection</span>
        </h1>

        <p className={styles['bk-header-desc']}>
          Browse our interactive 3D curved digital bookshelf. Slide, drag, or inspect any publication, flip its cover
          in 3D, and enter the dedicated in-browser <b>READ NOW</b> sanctuary with zoom, bookmarks, and dark reading themes.
        </p>
      </div>

      {/* ====================================================================
          CONTROL BAR: Search, Formats, Sorts, Saved, View Toggle
          ==================================================================== */}
      <div className={styles['bk-control-bar']}>
        {/* Search Box */}
        <div className={styles['bk-search-box']}>
          <span className={styles['bk-search-icon']}>🔍</span>
          <input
            type="search"
            placeholder="Search books by title, author, topic..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={styles['bk-search-input']}
            aria-label="Search books and publications"
          />
          {q && (
            <button
              type="button"
              className={styles['bk-search-clear']}
              onClick={() => setQ('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tools */}
        <div className={styles['bk-filter-tools']}>
          {/* Formats Dropdown */}
          <select
            value={selectedFmt}
            onChange={(e) => setSelectedFmt(e.target.value)}
            className={styles['bk-select']}
            aria-label="Filter by format"
          >
            <option value="">All Formats</option>
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles['bk-select']}
            aria-label="Sort books"
          >
            <option value="new">✦ Latest Uploads</option>
            <option value="pop">🔥 Most Downloaded</option>
            <option value="az">🔤 Title A–Z</option>
            <option value="big">📦 Largest Size</option>
            <option value="old">⏳ Oldest First</option>
          </select>

          {/* Saved Toggle */}
          <button
            type="button"
            className={`${styles['bk-btn-saved']} ${savedOnly ? styles['bk-saved-active'] : ''}`}
            onClick={() => setSavedOnly((v) => !v)}
            title="Show saved books only"
          >
            <span>{savedOnly ? '♥' : '♡'}</span>
            <span>Saved ({favs.length})</span>
          </button>

          {/* View Mode Switcher */}
          <div className={styles['bk-view-toggle']}>
            <button
              type="button"
              className={`${styles['bk-toggle-btn']} ${viewMode === 'shelf' ? styles['bk-active'] : ''}`}
              onClick={() => setViewMode('shelf')}
              title="Curved 3D Shelf View"
            >
              📚 Shelf
            </button>
            <button
              type="button"
              className={`${styles['bk-toggle-btn']} ${viewMode === 'grid' ? styles['bk-active'] : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
            >
              🗂️ Grid
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className={styles['bk-categories-row']} role="tablist" aria-label="Book Categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCat === cat}
            className={`${styles['bk-cat-pill']} ${selectedCat === cat ? styles['bk-cat-active'] : ''}`}
            onClick={() => setSelectedCat(cat)}
          >
            <span>{cat}</span>
            {cat === ALL && <span className={styles['bk-cat-count']}>{books.length}</span>}
          </button>
        ))}
      </div>

      {/* Active Results Status */}
      <div className={styles['bk-status-meta']}>
        <span>
          Showing <b>{filteredBooks.length}</b> of <b>{books.length}</b> published publications
        </span>
        {(q || selectedCat !== ALL || selectedFmt || savedOnly) && (
          <button
            type="button"
            className={styles['bk-clear-filters-btn']}
            onClick={() => {
              setQ('')
              setSelectedCat(ALL)
              setSelectedFmt('')
              setSavedOnly(false)
            }}
          >
            Clear Filters ✕
          </button>
        )}
      </div>

      {/* ====================================================================
          VIEW 1: CURVED 3D ARC SHELF (Warm Archival Paper Stage)
          ==================================================================== */}
      {filteredBooks.length === 0 ? (
        <div className={styles['bk-empty-state']}>
          <div className={styles['bk-empty-icon']}>📚</div>
          <h3 className={styles['bk-empty-title']}>No Publications Found</h3>
          <p className={styles['bk-empty-desc']}>
            Try clearing your search query or selecting a different category to explore available publications.
          </p>
          <button
            type="button"
            className={styles['bk-reset-btn']}
            onClick={() => {
              setQ('')
              setSelectedCat(ALL)
              setSelectedFmt('')
              setSavedOnly(false)
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'shelf' ? (
        <div ref={stagePanelRef} className={styles['bk-stage-panel']}>
          {/* Paper Grain Overlay with SVG Noise */}
          <svg className={styles['bk-grain']} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <filter id="bk-grain-filter" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves="3"
                stitchTiles="stitchTiles"
                result="noise"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.45   0 0 0 0 0.42   0 0 0 0 0.38   0 0 0 0.22 0"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#bk-grain-filter)" />
          </svg>

          {/* Big Archival Watermark Text (Subtle background) */}
          <div className={styles['bk-watermark-backdrop']}>
            <span className={styles['bk-watermark-text']}>THEMOHITFACT ARCHIVE</span>
          </div>

          {/* Top Bar on Stage */}
          <div className={styles['bk-stage-topbar']}>
            <span className={styles['bk-stage-tag']}>COLLECTION 2026</span>
            <div className={styles['bk-stage-brand']}>
              <span className={styles['bk-stage-brand-title']}>THEMOHITFACT ARCHIVE</span>
              <span className={styles['bk-stage-brand-sub']}>CURATED DIGITAL LIBRARY</span>
            </div>
            <span className={styles['bk-stage-counter']}>
              {animStateRef.current.activeIdx + 1} / {N}
            </span>
          </div>

          {/* 3D Shelf Viewport */}
          <div
            ref={viewportRef}
            className={styles['bk-shelf-viewport']}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Zero-size stage origin */}
            <div ref={stageOriginRef} className={styles['bk-stage-origin']}>
              {Array.from({ length: totalTapes }).map((_, v) => {
                const book = filteredBooks[v % N]
                const spineColor = book.spine?.color || '#262626'
                const spineAccent = book.spine?.accent || '#ffffff'

                return (
                  <div
                    key={v}
                    className={styles['bk-tape']}
                    onClick={(e) => handleTapeClick(v, e)}
                    onPointerEnter={() => {
                      animStateRef.current.hoverIdx = v
                    }}
                    onPointerLeave={() => {
                      if (animStateRef.current.hoverIdx === v) {
                        animStateRef.current.hoverIdx = -1
                      }
                    }}
                  >
                    {/* Spine Face (Upright cuboid front) */}
                    <div
                      className={`${styles['bk-face']} ${styles['bk-spine-face']}`}
                      style={{ backgroundColor: spineColor }}
                    >
                      <div className={styles['bk-spine-content']}>
                        <span
                          className={styles['bk-spine-tag']}
                          style={{ borderColor: spineAccent, color: spineAccent }}
                        >
                          {book.category.slice(0, 10)}
                        </span>

                        <div className={styles['bk-spine-title-wrap']}>
                          <span className={styles['bk-spine-title']}>{book.title}</span>
                        </div>

                        <span className={styles['bk-spine-author']}>{book.author || 'TheMohitFact'}</span>
                        <span className={styles['bk-spine-bottom-badge']}>PDF</span>
                      </div>
                      <div className={styles['bk-shade']} data-spine-shade />
                    </div>

                    {/* Cover Face (Turned 90deg, illustrated front) */}
                    <div
                      className={`${styles['bk-face']} ${styles['bk-cover-face']}`}
                      style={{
                        backgroundImage: book.cover_url ? `url("${book.cover_url}")` : undefined,
                      }}
                    >
                      {!book.cover_url && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#ffffff',
                          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                          boxSizing: 'border-box'
                        }}>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.7 }}>
                            {book.category}
                          </span>
                          <h4 style={{ fontSize: '15px', margin: '12px 0 6px', fontFamily: 'var(--bk-font-serif)', lineHeight: 1.2 }}>
                            {book.title}
                          </h4>
                          <p style={{ fontSize: '11px', opacity: 0.8, margin: 0 }}>
                            {book.author || 'TheMohitFact'}
                          </p>
                        </div>
                      )}
                      <div className={styles['bk-shade']} data-cover-shade />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Play Ring on Active Cover */}
            <button
              ref={playRingRef}
              type="button"
              className={styles['bk-play-ring']}
              title="Open publication details"
              aria-label="Open publication details"
              onClick={() => {
                if (activeBook) openDetail(activeBook)
              }}
            >
              <div className={styles['bk-play-triangle']} />
            </button>
          </div>

          {/* Caption Under the Cover (Masked Slide) */}
          <div className={styles['bk-caption-container']} aria-live="polite">
            <div className={styles['bk-caption-mask']}>
              <span className={styles['bk-caption-sub']}>{caption.sub}</span>
            </div>
            <div className={styles['bk-caption-mask']}>
              <h2 className={styles['bk-caption-title']}>{caption.title}</h2>
            </div>
            <div className={styles['bk-caption-mask']}>
              <span className={styles['bk-caption-meta']}>{caption.meta}</span>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            className={`${styles['bk-arrow-btn']} ${styles['bk-arrow-left']}`}
            onClick={() => {
              animStateRef.current.T = Math.round(animStateRef.current.T) - 1
            }}
            aria-label="Previous book"
          >
            ←
          </button>
          <button
            type="button"
            className={`${styles['bk-arrow-btn']} ${styles['bk-arrow-right']}`}
            onClick={() => {
              animStateRef.current.T = Math.round(animStateRef.current.T) + 1
            }}
            aria-label="Next book"
          >
            →
          </button>

          {/* Timeline / Scrubber Bar at Bottom */}
          <div className={styles['bk-stage-timeline']}>
            <span className={styles['bk-timeline-label']}>SCRUBBER</span>
            <div className={styles['bk-scrubber-track']}>
              {filteredBooks.map((b, idx) => (
                <div
                  key={b.id}
                  className={`${styles['bk-scrubber-item']} ${
                    idx === animStateRef.current.activeIdx ? styles['bk-item-active'] : ''
                  }`}
                  onClick={() => jumpToBook(idx)}
                  title={`${b.title} (${b.category})`}
                />
              ))}
            </div>
            <span className={styles['bk-timeline-label']}>DRAG / WHEEL / ARROWS</span>
          </div>
        </div>
      ) : (
        /* ====================================================================
           VIEW 2: GRID CARDS VIEW
           ==================================================================== */
        <div className={styles['bk-grid-container']}>
          {filteredBooks.map((book) => {
            const isSaved = favs.includes(book.id)

            return (
              <article key={book.id} className={styles['bk-grid-card']}>
                <div
                  className={styles['bk-card-cover-wrap']}
                  onClick={() => openDetail(book)}
                  role="button"
                  tabIndex={0}
                >
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      loading="lazy"
                      className={styles['bk-card-cover-img']}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      📄 PDF
                    </div>
                  )}

                  <button
                    type="button"
                    className={`${styles['bk-card-fav-btn']} ${isSaved ? styles['bk-fav-on'] : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFav(book.id)
                    }}
                    title={isSaved ? 'Remove from saved' : 'Save publication'}
                  >
                    {isSaved ? '♥' : '♡'}
                  </button>
                </div>

                <div className={styles['bk-card-body']}>
                  <h3 className={styles['bk-card-title']} onClick={() => openDetail(book)}>
                    {book.title}
                  </h3>
                  {book.author && <p className={styles['bk-card-author']}>by {book.author}</p>}
                  <p className={styles['bk-card-desc']}>
                    {book.description || 'Exclusive curated publication from TheMohitFact Hub.'}
                  </p>

                  <div className={styles['bk-card-meta-row']}>
                    <span>{book.category}</span>
                    <span>·</span>
                    <span>{book.pages || 50}+ Pages</span>
                    <span>·</span>
                    <span>{book.format || 'PDF'}</span>
                  </div>

                  <div className={styles['bk-card-acts']}>
                    <button
                      type="button"
                      className={styles['bk-card-btn-details']}
                      onClick={() => openDetail(book)}
                    >
                      👁 Details
                    </button>
                    <button
                      type="button"
                      className={styles['bk-card-btn-read']}
                      onClick={() => handleReadNow(book)}
                    >
                      📖 Read Now
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* ====================================================================
          DETAIL SHEET: Growing Paper Sheet + Organic Ink-Bleed Reveal Poster
          ==================================================================== */}
      <dialog
        ref={detailDialogRef}
        className={styles['bk-detail-dialog']}
        aria-modal="true"
        onClose={() => animStateRef.current.isOpen && closeDetail()}
      >
        <button
          type="button"
          className={styles['bk-detail-close-btn']}
          onClick={closeDetail}
          aria-label="Close detail sheet"
        >
          ✕ CLOSE / 閉じる
        </button>

        {selectedBook && (
          <div className={styles['bk-detail-content']}>
            {/* Left Column: Metadata & CTAs */}
            <div className={styles['bk-detail-left']}>
              <div className={styles['bk-detail-mask']}>
                <span className={styles['bk-detail-sub']}>
                  {selectedBook.category} — {selectedBook.pages || 50} PAGES
                </span>
              </div>

              <div className={styles['bk-detail-mask']}>
                <h1 className={styles['bk-detail-title']}>{selectedBook.title}</h1>
              </div>

              <div className={styles['bk-detail-mask']}>
                <span className={styles['bk-detail-meta']}>
                  {selectedBook.author ? `AUTHOR: ${selectedBook.author.toUpperCase()}` : 'THEMOHITFACT COLLECTION'}
                  {selectedBook.year ? ` · ${selectedBook.year}` : ''} · FORMAT: {selectedBook.format || 'PDF'}
                </span>
              </div>

              <div className={styles['bk-detail-mask']}>
                <p className={styles['bk-detail-desc']}>
                  {selectedBook.description || 'Exclusive curated publication from TheMohitFact Hub.'}
                </p>
              </div>

              <div className={styles['bk-detail-mask']}>
                <p className={styles['bk-detail-credit']}>
                  Curated &amp; published for TheMohitFact Hub Digital Library &amp; Reading Sanctuary.
                </p>
              </div>

              <div className={styles['bk-detail-actions']}>
                <button
                  type="button"
                  className={styles['bk-btn-read-now']}
                  onClick={() => handleReadNow(selectedBook)}
                >
                  📖 READ NOW
                </button>

                <button
                  type="button"
                  className={styles['bk-btn-download']}
                  onClick={() => handleDownload(selectedBook)}
                >
                  ⬇ DOWNLOAD PDF
                </button>

                <button
                  type="button"
                  className={`${styles['bk-btn-save-modal']} ${
                    favs.includes(selectedBook.id) ? styles['bk-modal-saved'] : ''
                  }`}
                  onClick={() => handleToggleFav(selectedBook.id)}
                >
                  <span>{favs.includes(selectedBook.id) ? '♥' : '♡'}</span>
                  <span>{favs.includes(selectedBook.id) ? 'SAVED' : 'SAVE'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Ink-Bleed Poster SVG */}
            <div className={styles['bk-detail-poster-wrap']}>
              <svg className={styles['bk-detail-poster']} viewBox="0 0 474 900" aria-hidden="true">
                <defs>
                  <filter id="bk-ink-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.011"
                      numOctaves="3"
                      seed="7"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="120"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>

                  <mask
                    id="bk-ink-mask"
                    maskUnits="userSpaceOnUse"
                    x="-200"
                    y="-200"
                    width="874"
                    height="1300"
                  >
                    <rect x="-200" y="-200" width="874" height="1300" fill="black" />
                    <g filter="url(#bk-ink-filter)">
                      {[
                        { cx: 150, cy: 330 },
                        { cx: 340, cy: 600 },
                        { cx: 250, cy: 120 },
                        { cx: 90, cy: 760 },
                        { cx: 400, cy: 250 },
                        { cx: 260, cy: 860 },
                        { cx: 230, cy: 470 },
                      ].map((blob, idx) => (
                        <circle
                          key={idx}
                          ref={(el) => {
                            if (el) inkMaskCirclesRef.current[idx] = el
                          }}
                          cx={blob.cx}
                          cy={blob.cy}
                          r="0"
                          fill="white"
                        />
                      ))}
                    </g>
                  </mask>

                  <clipPath id="bk-poster-clip">
                    <rect x="0" y="0" width="474" height="900" rx="4" />
                  </clipPath>
                </defs>

                <g clipPath="url(#bk-poster-clip)" mask="url(#bk-ink-mask)">
                  {selectedBook.cover_url && (
                    <image
                      href={selectedBook.cover_url}
                      x="0"
                      y="0"
                      width="474"
                      height="900"
                      preserveAspectRatio="none"
                    />
                  )}
                </g>
              </svg>
            </div>
          </div>
        )}
      </dialog>

      {/* ====================================================================
          MODAL 2: FULLSCREEN DEDICATED IN-BROWSER READING SANCTUARY
          Reusing existing BookReader with 3D cover, themes, zoom & bookmarks
          ==================================================================== */}
      {readerState && (
        <BookReader
          book={readerState.book}
          fileUrl={readerState.fileUrl}
          onClose={() => setReaderState(null)}
          onDownload={() => handleDownload(readerState.book)}
        />
      )}
    </div>
  )
}
