'use client'

import React from 'react'

interface Book {
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
}

interface BookDetailsModalProps {
  book: Book
  isSaved: boolean
  onToggleSave: () => void
  onReadNow: () => void
  onDownload: () => void
  onClose: () => void
  isOpening?: boolean
}

const formatSize = (b?: number | null) =>
  !b ? 'Standard PDF' : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`

// Estimate page count from file size if not explicitly recorded
const estimatePages = (sizeBytes?: number | null) => {
  if (!sizeBytes) return '50+ Pages'
  const est = Math.max(12, Math.min(650, Math.round(sizeBytes / 45000)))
  return `${est} Pages`
}

export default function BookDetailsModal({
  book,
  isSaved,
  onToggleSave,
  onReadNow,
  onDownload,
  onClose,
  isOpening = false,
}: BookDetailsModalProps) {
  const isFree = book.access !== 'members'

  return (
    <div
      className={`bdm-overlay ${isOpening ? 'bdm-opening-anim' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${book.title}`}
    >
      <div
        className="bdm-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          className="bdm-close-btn"
          onClick={onClose}
          aria-label="Back to Bookshelf"
        >
          ✕
        </button>

        {/* 2-Column Content Grid */}
        <div className="bdm-grid">
          {/* =========================================================
              LEFT COLUMN: Realistic 3D Book Presentation
              ========================================================= */}
          <div className="bdm-col-visual">
            <div className="bdm-3d-stage">
              {/* Floating 3D Book Model */}
              <div className="bdm-book-3d">
                {/* Book Spine */}
                <div className="bdm-book-spine">
                  <span className="bdm-spine-title">{book.title}</span>
                  <span className="bdm-spine-author">{book.author || 'TheMohitFact'}</span>
                </div>

                {/* Front Cover */}
                <div
                  className="bdm-book-front"
                  style={
                    book.cover_url
                      ? { backgroundImage: `url(${book.cover_url})` }
                      : undefined
                  }
                >
                  {!book.cover_url && (
                    <div className="bdm-procedural-cover">
                      <div className="bdm-proc-foil-top">
                        <span className="bdm-proc-sparkle">✦</span>
                        <span>THEMOHITFACT EDITION</span>
                        <span className="bdm-proc-sparkle">✦</span>
                      </div>
                      <h3 className="bdm-proc-title">{book.title}</h3>
                      <p className="bdm-proc-author">{book.author || 'Mohit Kumar'}</p>
                      <div className="bdm-proc-foil-bottom">
                        <span className="bdm-proc-format">{book.format || 'DIGITAL BOOK'}</span>
                      </div>
                    </div>
                  )}

                  {/* High-Gloss Protective Sheen */}
                  <div className="bdm-book-sheen" />
                  {/* Subtle Book Spine Fold Crease */}
                  <div className="bdm-book-crease" />
                </div>

                {/* Right Edge Pages Thickness */}
                <div className="bdm-book-pages-edge" />

                {/* Realistic Ribbon Bookmark */}
                <div className="bdm-book-ribbon" />
              </div>

              {/* Book Ambient Pedestal Shadow */}
              <div className="bdm-book-shadow" />
            </div>

            {/* Badges Bar below 3D book */}
            <div className="bdm-visual-badges">
              <span className="bdm-pill-format">
                {book.format === 'EPUB' ? '📖 EPUB BOOK' : '📄 PDF DOCUMENT'}
              </span>
              <span className="bdm-pill-size">
                {formatSize(book.size_bytes)}
              </span>
              <span className={`bdm-pill-tier ${isFree ? 'tier-free' : 'tier-members'}`}>
                {isFree ? '✨ Free to Read' : '🔒 Members Only'}
              </span>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: Book Metadata, Description & Actions
              ========================================================= */}
          <div className="bdm-col-info">
            {/* Category / Collection Tag */}
            <div className="bdm-category-tag">
              <span className="bdm-cat-dot" />
              <span>{book.category || 'Digital Library'}</span>
            </div>

            {/* Book Title */}
            <h1 className="bdm-title">{book.title}</h1>

            {/* Author row */}
            <div className="bdm-author-row">
              <span className="bdm-by-lbl">Author:</span>
              <span className="bdm-author-val">{book.author || 'Mohit Kumar · TheMohitFact'}</span>
            </div>

            {/* Technical Specifications Grid */}
            <div className="bdm-specs-table">
              <div className="bdm-spec-item">
                <span className="bdm-spec-lbl">FORMAT</span>
                <span className="bdm-spec-val">{book.format || 'PDF'}</span>
              </div>
              <div className="bdm-spec-item">
                <span className="bdm-spec-lbl">ESTIMATED LENGTH</span>
                <span className="bdm-spec-val">{estimatePages(book.size_bytes)}</span>
              </div>
              <div className="bdm-spec-item">
                <span className="bdm-spec-lbl">LANGUAGE</span>
                <span className="bdm-spec-val">English / Hindi</span>
              </div>
              <div className="bdm-spec-item">
                <span className="bdm-spec-lbl">PUBLICATION</span>
                <span className="bdm-spec-val">
                  {new Date(book.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Synopsis / Summary */}
            <div className="bdm-desc-wrap">
              <h4 className="bdm-desc-heading">About This Edition</h4>
              <p className="bdm-desc-body">
                {book.description ||
                  'An exclusive curated e-book and reference study guide from TheMohitFact Hub. Designed to deepen your mastery, expand actionable insight, and provide rigorous distilled knowledge.'}
              </p>
            </div>

            {/* Tags row */}
            {book.tags && book.tags.length > 0 && (
              <div className="bdm-tags-row">
                {book.tags.map((tag) => (
                  <span key={tag} className="bdm-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Primary Action Button: Glowing READ NOW */}
            <div className="bdm-actions-group">
              <button
                type="button"
                className="bdm-read-now-btn"
                onClick={onReadNow}
              >
                <span className="bdm-read-icon">📖</span>
                <span className="bdm-read-text">READ NOW</span>
                <span className="bdm-read-arrow">→</span>
              </button>

              <button
                type="button"
                className="bdm-download-btn"
                onClick={onDownload}
              >
                <span>↓ Download</span>
              </button>

              {/* Save / Favorite toggle */}
              <button
                type="button"
                className={`bdm-fav-btn ${isSaved ? 'is-saved' : ''}`}
                onClick={onToggleSave}
                aria-label={isSaved ? 'Remove from saved books' : 'Save to my library'}
                title={isSaved ? 'Saved in collection' : 'Save to collection'}
              >
                <span>{isSaved ? '♥' : '♡'}</span>
              </button>
            </div>

            {/* Back to Library Navigation Link */}
            <div className="bdm-back-footer">
              <button
                type="button"
                className="bdm-back-link"
                onClick={onClose}
              >
                <span>← Back to Bookshelf</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

