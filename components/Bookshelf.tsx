'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'
import BookDetailsModal from './BookDetailsModal'
import BookReader from './BookReader'
import { ALL } from '@/lib/constants'

export interface Book {
  id: string
  title: string
  author?: string | null
  description?: string | null
  category: string
  format?: string | null
  size_bytes?: number | null
  cover_url?: string | null
  file_path?: string
  access?: string
  tags?: string[]
  created_at: string
  downloads_count?: number
  preview_allowed?: boolean
}

interface BookshelfProps {
  initialBooks: Book[]
  favIds?: string[]
  emptyMessage?: string
}

const SORTS: Record<string, (a: Book, b: Book) => number> = {
  new: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  pop: (a, b) => (b.downloads_count || 0) - (a.downloads_count || 0),
  az: (a, b) => (a.title || '').localeCompare(b.title || ''),
  big: (a, b) => (b.size_bytes || 0) - (a.size_bytes || 0),
  old: (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
}

export default function Bookshelf({
  initialBooks = [],
  favIds = [],
  emptyMessage = 'No books or PDFs have been uploaded to the library yet.',
}: BookshelfProps) {
  const router = useRouter()
  const { open } = useAuth()
  const sb = createClient()

  // State
  const [books] = useState<Book[]>(initialBooks)
  const [favs, setFavs] = useState<string[]>(favIds)
  const [q, setQ] = useState('')
  const [selectedCat, setSelectedCat] = useState(ALL)
  const [selectedFmt, setSelectedFmt] = useState('')
  const [sortBy, setSortBy] = useState('new')
  const [savedOnly, setSavedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'shelf' | 'grid'>('shelf')

  // Flow State: Selected book, Opening transition, Active Reader
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isOpeningBookId, setIsOpeningBookId] = useState<string | null>(null)
  const [readerState, setReaderState] = useState<{ book: Book; fileUrl: string } | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Sync favorites
  useEffect(() => {
    setFavs(favIds)
  }, [favIds])

  // Parse URL query parameter (e.g. ?cat=E-Books or ?book=id or ?fmt=PDF)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const catParam = params.get('cat')
    const fmtParam = params.get('fmt')
    const bookParam = params.get('book')

    if (catParam) setSelectedCat(catParam)
    if (fmtParam) setSelectedFmt(fmtParam)
    if (bookParam) {
      const match = books.find((b) => b.id === bookParam)
      if (match) setSelectedBook(match)
    }
  }, [books])

  // Extract all categories & formats
  const categories = useMemo(() => {
    const cats = [...new Set(books.map((b) => b.category).filter(Boolean))]
    return [ALL, ...cats]
  }, [books])

  const formats = useMemo(() => {
    return [...new Set(books.map((b) => b.format).filter(Boolean))].sort()
  }, [books])

  // Filtered & Sorted books list
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
      .sort(SORTS[sortBy] || SORTS.new)
  }, [books, q, selectedCat, selectedFmt, savedOnly, favs, sortBy])

  // Partition books across shelves (4 books per shelf tier on desktop)
  const shelfTiers = useMemo(() => {
    const tiers: Book[][] = []
    const booksPerShelf = 4
    for (let i = 0; i < filteredBooks.length; i += booksPerShelf) {
      tiers.push(filteredBooks.slice(i, i + booksPerShelf))
    }
    return tiers
  }, [filteredBooks])

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
    } else {
      router.refresh()
    }
  }

  // Download handler
  const handleDownload = async (book: Book) => {
    setActionError(null)
    setDownloadingId(book.id)
    try {
      const res = await fetch(`/api/download?id=${book.id}`)
      if (res.status === 401) {
        setDownloadingId(null)
        return open('login', () => handleDownload(book))
      }
      const data = await res.json()
      if (data.url) {
        const a = document.createElement('a')
        a.href = data.url
        a.download = `${book.title}.${(book.format || 'pdf').toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        setActionError('Download failed. Please try again.')
      }
    } catch {
      setActionError('Download encountered an issue.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Book Click: Triggers cinematic 3D Opening Animation before opening Details Modal
  const handleBookClick = useCallback((book: Book) => {
    setIsOpeningBookId(book.id)
    // 450ms smooth 3D cover tilt and forward zoom
    setTimeout(() => {
      setIsOpeningBookId(null)
      setSelectedBook(book)
    }, 450)
  }, [])

  // Read Now handler: fetches preview URL and transitions into reader
  const handleReadNow = async (book: Book) => {
    setActionError(null)
    try {
      const res = await fetch(`/api/preview?id=${book.id}`)
      if (res.status === 401) {
        return open('login', () => handleReadNow(book))
      }
      const data = await res.json()
      if (data.url) {
        setReaderState({ book, fileUrl: data.url })
      } else {
        setActionError('Book reading preview is currently unavailable for this file.')
      }
    } catch {
      setActionError('Could not open reader. Please check your connection.')
    }
  }

  return (
    <div className="digital-bookshelf-wrapper">
      {/* =========================================================
          CONTROL BAR: Search, Category Tabs, Sort & View Mode
          ========================================================= */}
      <div className="bs-control-bar">
        {/* Search Bar */}
        <div className="bs-search-box">
          <span className="bs-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search books by title, author, topic..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bs-search-input"
            aria-label="Search digital bookshelf"
          />
          {q && (
            <button
              type="button"
              className="bs-search-clear"
              onClick={() => setQ('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Group (Category, Format, Sort, View Toggle) */}
        <div className="bs-filter-tools">
          <select
            value={selectedFmt}
            onChange={(e) => setSelectedFmt(e.target.value)}
            className="bs-select"
            aria-label="Filter by format"
          >
            <option value="">All Formats</option>
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bs-select"
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
            className={`bs-btn-saved ${savedOnly ? 'is-active' : ''}`}
            onClick={() => setSavedOnly((v) => !v)}
            title="Show saved books only"
          >
            <span>{savedOnly ? '♥' : '♡'}</span>
            <span>Saved ({favs.length})</span>
          </button>

          {/* View Mode Switcher */}
          <div className="bs-view-toggle">
            <button
              type="button"
              className={`bs-toggle-btn ${viewMode === 'shelf' ? 'active' : ''}`}
              onClick={() => setViewMode('shelf')}
              title="3D Bookshelf View"
              aria-label="3D Bookshelf View"
            >
              📚 Shelf
            </button>
            <button
              type="button"
              className={`bs-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid Card View"
              aria-label="Grid Card View"
            >
              🗂️ Grid
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="bs-categories-row" role="tablist" aria-label="Book Categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCat === cat}
            className={`bs-cat-pill ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat)}
          >
            <span>{cat}</span>
            {cat === ALL && (
              <span className="bs-cat-count">{books.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Error message banner */}
      {actionError && (
        <div className="bs-error-banner" role="alert">
          <span>⚠️ {actionError}</span>
          <button type="button" onClick={() => setActionError(null)}>✕</button>
        </div>
      )}

      {/* Active Results Status */}
      <div className="bs-status-meta">
        <span>
          Showing <b>{filteredBooks.length}</b> of <b>{books.length}</b> published publications
        </span>
        {(q || selectedCat !== ALL || selectedFmt || savedOnly) && (
          <button
            type="button"
            className="bs-reset-filters-btn"
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

      {/* =========================================================
          VIEW 1: CINEMATIC 3D BOOKSHELF
          ========================================================= */}
      {filteredBooks.length === 0 ? (
        <div className="bs-empty-state">
          <div className="bs-empty-icon">📚</div>
          <h3 className="bs-empty-title">
            {books.length === 0 ? 'Digital Bookshelf is Being Curated' : 'No Books Match Your Search'}
          </h3>
          <p className="bs-empty-desc">
            {books.length === 0
              ? emptyMessage
              : 'Try clearing your search query or selecting a different category to explore available publications.'}
          </p>
          {(q || selectedCat !== ALL || selectedFmt || savedOnly) && (
            <button
              type="button"
              className="btn pri"
              onClick={() => {
                setQ('')
                setSelectedCat(ALL)
                setSelectedFmt('')
                setSavedOnly(false)
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'shelf' ? (
        <div className="bs-shelves-container">
          {shelfTiers.map((tier, tierIdx) => (
            <div key={tierIdx} className="bs-shelf-tier">
              {/* Shelf Ambient Overhead Downlight */}
              <div className="bs-shelf-lighting" />

              {/* Books Row Sitting on the Shelf */}
              <div className="bs-shelf-books-row">
                {tier.map((book) => {
                  const isSaved = favs.includes(book.id)
                  const isOpening = isOpeningBookId === book.id

                  return (
                    <div
                      key={book.id}
                      className={`bs-book-3d-item ${isOpening ? 'is-opening-anim' : ''}`}
                      onClick={() => handleBookClick(book)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleBookClick(book)
                        }
                      }}
                      aria-label={`${book.title} by ${book.author || 'TheMohitFact'}. Click to view details and read.`}
                    >
                      {/* Realistic 3D Hardcover Book Object */}
                      <div className="bs-book-geometry">
                        {/* 3D Book Spine (Left Thickness) */}
                        <div className="bs-book-spine">
                          <span className="bs-spine-text">{book.title}</span>
                          <span className="bs-spine-decor" />
                        </div>

                        {/* 3D Book Front Cover */}
                        <div
                          className="bs-book-cover"
                          style={
                            book.cover_url
                              ? { backgroundImage: `url(${book.cover_url})` }
                              : undefined
                          }
                        >
                          {!book.cover_url && (
                            <div className="bs-procedural-cover">
                              <span className="bs-proc-tag">{book.category}</span>
                              <h4 className="bs-proc-title">{book.title}</h4>
                              <p className="bs-proc-author">{book.author || 'Mohit Kumar'}</p>
                              <span className="bs-proc-fmt">{book.format || 'PDF'}</span>
                            </div>
                          )}

                          {/* Gloss Specular Sheen Layer */}
                          <div className="bs-cover-sheen" />
                          {/* Spine Embossed Crease */}
                          <div className="bs-cover-crease" />

                          {/* Format Pill Badge */}
                          <span className="bs-cover-format-badge">
                            {book.format || 'PDF'}
                          </span>
                        </div>

                        {/* Right Trim Pages Edge (Cream layered texture) */}
                        <div className="bs-book-pages-side" />

                        {/* Top Pages Trim */}
                        <div className="bs-book-pages-top" />
                      </div>

                      {/* Realistic Shadow Cast onto Shelf Plank */}
                      <div className="bs-book-shelf-shadow" />

                      {/* Hover Info Tooltip Banner */}
                      <div className="bs-book-hover-card">
                        <span className="bs-hover-title">{book.title}</span>
                        {book.author && <span className="bs-hover-author">by {book.author}</span>}
                        <div className="bs-hover-cta">
                          <span>Click to Open</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Realistic Shelf Plank with Wood/Obsidian Grain & Glass Bevel */}
              <div className="bs-shelf-plank">
                <div className="bs-plank-surface" />
                <div className="bs-plank-front-edge" />
                <div className="bs-plank-under-shadow" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* =========================================================
           VIEW 2: MODERN HIGH-CONTRAST GRID VIEW
           ========================================================= */
        <div className="grid">
          {filteredBooks.map((book) => {
            const isSaved = favs.includes(book.id)
            const isDownloading = downloadingId === book.id

            return (
              <article key={book.id} className="card bs-grid-card">
                <div
                  className="cover"
                  style={
                    book.cover_url
                      ? { backgroundImage: `url(${book.cover_url})` }
                      : undefined
                  }
                  onClick={() => handleBookClick(book)}
                  role="button"
                  tabIndex={0}
                >
                  {!book.cover_url && (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: 4 }}>
                        {book.format === 'EPUB' ? '📖' : '📄'}
                      </span>
                      <span>{book.format || 'BOOK'}</span>
                    </div>
                  )}

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    className={`heart ${isSaved ? 'on' : ''}`}
                    aria-label={isSaved ? 'Remove from saved' : 'Save book'}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFav(book.id)
                    }}
                  >
                    {isSaved ? '♥' : '♡'}
                  </button>
                </div>

                <h3 onClick={() => handleBookClick(book)} style={{ cursor: 'pointer' }}>
                  {book.title}
                </h3>
                {book.author && <p className="meta" style={{ color: 'var(--lavender)' }}>by {book.author}</p>}
                <p className="muted">{book.description || 'Exclusive publication from TheMohitFact Hub.'}</p>

                <div className="meta">
                  <span>{book.category}</span>
                  <span>·</span>
                  <span>{book.format || 'PDF'}</span>
                  <span>·</span>
                  <span>{book.access === 'members' ? '🔒 Members only' : '✨ Free download'}</span>
                </div>

                <div className="acts">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleBookClick(book)}
                  >
                    <span>👁</span> Details
                  </button>
                  <button
                    type="button"
                    className="btn pri"
                    onClick={() => handleReadNow(book)}
                  >
                    <span>📖</span> Read Now
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* =========================================================
          MODAL 1: BOOK DETAILS SCREEN (2-Column Presentation)
          ========================================================= */}
      {selectedBook && !readerState && (
        <BookDetailsModal
          book={selectedBook}
          isSaved={favs.includes(selectedBook.id)}
          onToggleSave={() => handleToggleFav(selectedBook.id)}
          onReadNow={() => handleReadNow(selectedBook)}
          onDownload={() => handleDownload(selectedBook)}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* =========================================================
          MODAL 2: FULLSCREEN DEDICATED READING SANCTUARY
          ========================================================= */}
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

