'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface BookReaderProps {
  book: {
    id: string
    title: string
    author?: string | null
    format?: string | null
    cover_url?: string | null
    file_path?: string
    size_bytes?: number | null
  }
  fileUrl: string
  onClose: () => void
  onDownload: () => void
}

type ReaderTheme = 'dark' | 'sepia' | 'light'

export default function BookReader({
  book,
  fileUrl,
  onClose,
  onDownload,
}: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [zoom, setZoom] = useState<number>(100)
  const [theme, setTheme] = useState<ReaderTheme>('dark')
  const [fontSize, setFontSize] = useState<number>(18)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [resumedToast, setResumedToast] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Storage key for remembering last reading position
  const storageKey = `themohitfact_reading_pos_${book.id}`

  // Restore last saved reading position
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.page && typeof parsed.page === 'number') {
          setCurrentPage(parsed.page)
          setResumedToast(`Resumed from page ${parsed.page}`)
          setTimeout(() => setResumedToast(null), 3500)
        }
        if (parsed.theme) setTheme(parsed.theme)
        if (parsed.zoom) setZoom(parsed.zoom)
      }
    } catch {}
  }, [storageKey])

  // Save reading position when changed
  const savePosition = useCallback(
    (page: number) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            page,
            theme,
            zoom,
            updatedAt: Date.now(),
          })
        )
      } catch {}
    },
    [storageKey, theme, zoom]
  )

  const handlePrevPage = () => {
    setCurrentPage((prev) => {
      const next = Math.max(1, prev - 1)
      savePosition(next)
      // Navigate PDF if iframe supports it
      if (iframeRef.current && book.format === 'PDF') {
        iframeRef.current.contentWindow?.postMessage({ type: 'page', page: next }, '*')
      }
      return next
    })
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => {
      const next = prev + 1
      savePosition(next)
      if (iframeRef.current && book.format === 'PDF') {
        iframeRef.current.contentWindow?.postMessage({ type: 'page', page: next }, '*')
      }
      return next
    })
  }

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 15))
  const handleZoomOut = () => setZoom((z) => Math.max(60, z - 15))
  const handleZoomReset = () => setZoom(100)

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        } else {
          onClose()
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage()
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn()
      } else if (e.key === '-') {
        handleZoomOut()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // PDF src URL with page and zoom parameters
  const pdfViewerUrl = `${fileUrl}#page=${currentPage}&zoom=${zoom}`

  return (
    <div
      ref={containerRef}
      className={`reader-overlay reader-theme-${theme}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Reading ${book.title}`}
    >
      {/* Top Reading Navigation Bar */}
      <header className="reader-toolbar">
        {/* Left: Book Meta Info */}
        <div className="reader-meta">
          <button
            type="button"
            className="reader-btn-back"
            onClick={onClose}
            aria-label="Exit Reader"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="reader-book-title-wrap">
            <span className="reader-format-pill">{book.format || 'BOOK'}</span>
            <h2 className="reader-book-title">{book.title}</h2>
            {book.author && <span className="reader-book-author">by {book.author}</span>}
          </div>
        </div>

        {/* Center: Pagination & Navigation */}
        <div className="reader-nav-controls">
          <button
            type="button"
            className="reader-icon-btn"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            title="Previous Page (←)"
          >
            ◀
          </button>
          <div className="reader-page-indicator">
            <span>Page</span>
            <input
              type="number"
              min={1}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val) && val >= 1) {
                  setCurrentPage(val)
                  savePosition(val)
                }
              }}
              className="reader-page-input"
              aria-label="Current page number"
            />
          </div>
          <button
            type="button"
            className="reader-icon-btn"
            onClick={handleNextPage}
            title="Next Page (→)"
          >
            ▶
          </button>
        </div>

        {/* Right: Zoom, Theme, Fullscreen & Download */}
        <div className="reader-actions">
          {/* Zoom controls */}
          <div className="reader-zoom-group">
            <button
              type="button"
              className="reader-tool-btn"
              onClick={handleZoomOut}
              title="Zoom out (-)"
            >
              −
            </button>
            <button
              type="button"
              className="reader-zoom-level"
              onClick={handleZoomReset}
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <button
              type="button"
              className="reader-tool-btn"
              onClick={handleZoomIn}
              title="Zoom in (+)"
            >
              +
            </button>
          </div>

          {/* Theme switcher */}
          <div className="reader-theme-group" role="radiogroup" aria-label="Reading theme">
            <button
              type="button"
              className={`reader-theme-btn theme-dark ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              title="Obsidian Dark Theme"
              aria-label="Dark Theme"
            >
              🌙
            </button>
            <button
              type="button"
              className={`reader-theme-btn theme-sepia ${theme === 'sepia' ? 'active' : ''}`}
              onClick={() => setTheme('sepia')}
              title="Warm Sepia Theme"
              aria-label="Sepia Theme"
            >
              📜
            </button>
            <button
              type="button"
              className={`reader-theme-btn theme-light ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              title="Clean Light Theme"
              aria-label="Light Theme"
            >
              ☀️
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="reader-tool-btn"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? '⤦' : '⛶'}
          </button>

          {/* Download Book */}
          <button
            type="button"
            className="reader-btn-download"
            onClick={onDownload}
            title="Download this book"
          >
            <span>↓</span>
            <span>Download</span>
          </button>

          {/* Close Reader */}
          <button
            type="button"
            className="reader-btn-close"
            onClick={onClose}
            aria-label="Close reading view"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Reading Progress Bar along top */}
      <div className="reader-progress-track">
        <div
          className="reader-progress-fill"
          style={{ width: `${Math.min(100, Math.max(5, (currentPage / Math.max(totalPages, 1)) * 100))}%` }}
        />
      </div>

      {/* Resumed Position Toast */}
      {resumedToast && (
        <div className="reader-resume-toast" role="status">
          <span>🔖</span>
          <span>{resumedToast}</span>
        </div>
      )}

      {/* Dedicated Reading Body */}
      <main className="reader-content-viewport">
        <div
          className="reader-canvas-container"
          style={{
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            ref={iframeRef}
            src={pdfViewerUrl}
            title={`Reading ${book.title}`}
            className="reader-document-frame"
            loading="eager"
          />
        </div>
      </main>

      {/* Floating Bottom Quick-Nav Bar (Optimized for Mobile/Tablet) */}
      <footer className="reader-bottom-bar">
        <button
          type="button"
          className="reader-floating-btn"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
        >
          ← Previous Page
        </button>
        <span className="reader-floating-status">
          Page {currentPage} · {zoom}%
        </span>
        <button
          type="button"
          className="reader-floating-btn"
          onClick={handleNextPage}
        >
          Next Page →
        </button>
      </footer>
    </div>
  )
}

