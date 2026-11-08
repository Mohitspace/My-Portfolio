'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'
import { ALL, CATEGORIES } from '@/lib/constants'

const size = (b?: number) =>
  !b ? '' : b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1e3) + ' KB'

const INIT = { q: '', cat: ALL, fmt: '', access: '', tag: '', sort: 'new', saved: false }

const SORTS: Record<string, (a: any, b: any) => number> = {
  new: (a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at),
  old: (a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at),
  pop: (a: any, b: any) => (b.downloads_count || 0) - (a.downloads_count || 0),
  az: (a: any, b: any) => (a.title || '').localeCompare(b.title || ''),
  big: (a: any, b: any) => (b.size_bytes || 0) - (a.size_bytes || 0),
}

export default function Library({
  items,
  favIds = [],
  empty,
  books = false,
}: {
  items: any[]
  favIds?: string[]
  empty?: string
  books?: boolean
}) {
  const { open } = useAuth()
  const router = useRouter()
  const sb = createClient()
  const [f, setF] = useState(INIT)
  const [favs, setFavs] = useState<string[]>(favIds)
  const [err, setErr] = useState('')
  const [pv, setPv] = useState<any>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => setFavs(favIds), [favIds.join()])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const fmtParam = params.get('fmt')
    const catParam = params.get('cat')
    if (fmtParam) {
      setF((prev) => ({ ...prev, fmt: fmtParam }))
    } else if (catParam) {
      setF((prev) => ({ ...prev, cat: catParam }))
    }
  }, [])
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }))

  const fmts = [...new Set(items.map((r) => r.format).filter(Boolean))].sort()
  const tags = [...new Set(items.flatMap((r) => r.tags ?? []))].sort()

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return items
      .filter(
        (r) =>
          (f.cat === ALL || r.category === f.cat) &&
          (!f.fmt || r.format === f.fmt) &&
          (!f.access || r.access === f.access) &&
          (!f.tag || (r.tags ?? []).includes(f.tag)) &&
          (!f.saved || favs.includes(r.id)) &&
          (!q ||
            [r.title, r.description, r.author, ...(r.tags ?? [])]
              .join(' ')
              .toLowerCase()
              .includes(q))
      )
      .sort(SORTS[f.sort] || SORTS.new)
  }, [items, f, favs])

  async function download(id: string) {
    setErr('')
    setDownloadingId(id)
    try {
      const res = await fetch('/api/download?id=' + id)
      if (res.status === 401) {
        setDownloadingId(null)
        return open('login', () => download(id))
      }
      const j = await res.json()
      if (j.url) {
        location.href = j.url
      } else {
        setErr('Download failed. Please try again.')
      }
    } catch {
      setErr('An error occurred during download.')
    } finally {
      setDownloadingId(null)
    }
  }

  async function preview(r: any) {
    setErr('')
    try {
      const res = await fetch('/api/preview?id=' + r.id)
      if (res.status === 401) return open('login', () => preview(r))
      const j = await res.json()
      if (j.url) setPv({ r, url: j.url })
      else setErr('Preview is not available for this file.')
    } catch {
      setErr('Could not open preview.')
    }
  }

  async function toggleFav(id: string) {
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) return open('login', () => toggleFav(id))

    const on = favs.includes(id)
    setFavs((p) => (on ? p.filter((x) => x !== id) : [...p, id]))

    const { error } = on
      ? await sb.from('favorites').delete().eq('resource_id', id)
      : await sb.from('favorites').insert({ resource_id: id })

    if (error) {
      setFavs(favIds)
      setErr('Could not update your saved resources.')
    } else {
      router.refresh()
    }
  }

  const tilt = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.setProperty('--ry', `${x * 12}deg`)
    card.style.setProperty('--rx', `${-y * 12}deg`)
  }

  const untilt = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    card.style.setProperty('--ry', '0deg')
    card.style.setProperty('--rx', '0deg')
  }

  const dirty = JSON.stringify(f) !== JSON.stringify(INIT)

  return (
    <div className={books ? 'books' : ''}>
      {/* Search & Sort Row */}
      <div className="tools">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search resources by title, author, topic or keywords..."
            value={f.q}
            onChange={(e) => set('q', e.target.value)}
            aria-label="Search resources"
          />
        </div>
        <select
          value={f.sort}
          onChange={(e) => set('sort', e.target.value)}
          aria-label="Sort resources"
        >
          <option value="new">✦ Latest uploads</option>
          <option value="pop">🔥 Most downloaded</option>
          <option value="az">🔤 Title A–Z</option>
          <option value="big">📦 Largest file size</option>
          <option value="old">⏳ Oldest first</option>
        </select>
      </div>

      {/* Category Filter Chips */}
      <div className="chips">
        {[ALL, ...CATEGORIES].map((c) => (
          <button
            key={c}
            className={'chip' + (c === f.cat ? ' on' : '')}
            onClick={() => set('cat', c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Format, Access, Tag Filters & Saved Toggle */}
      <div className="filters">
        <select
          value={f.fmt}
          onChange={(e) => set('fmt', e.target.value)}
          aria-label="File format"
        >
          <option value="">All Formats</option>
          {fmts.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>

        <select
          value={f.access}
          onChange={(e) => set('access', e.target.value)}
          aria-label="Access tier"
        >
          <option value="">All Access (Free &amp; Members)</option>
          <option value="public">Free to Download</option>
          <option value="members">Members Only</option>
        </select>

        <select
          value={f.tag}
          onChange={(e) => set('tag', e.target.value)}
          aria-label="Tag filter"
        >
          <option value="">All Tags</option>
          {tags.map((x) => (
            <option key={x} value={x}>
              #{x}
            </option>
          ))}
        </select>

        <label className="check">
          <input
            type="checkbox"
            checked={f.saved}
            onChange={(e) => set('saved', e.target.checked)}
          />
          <span>Saved only</span>
        </label>
      </div>

      {/* Results status metadata */}
      <div
        className="meta"
        style={{
          marginBottom: 20,
          justifyContent: 'space-between',
          color: 'var(--tx2)',
        }}
      >
        <span>
          Showing <b>{list.length}</b> of <b>{items.length}</b> resources
        </span>
        {dirty && (
          <button
            className="chip"
            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            onClick={() => setF(INIT)}
          >
            Reset all filters ✕
          </button>
        )}
      </div>

      {err && (
        <p className="msg" role="alert" style={{ marginBottom: 16 }}>
          {err}
        </p>
      )}

      {/* Resource Cards Grid */}
      {list.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'var(--card)',
            borderRadius: 20,
            border: '1px solid var(--bd)',
          }}
        >
          <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📚</p>
          <p className="muted" style={{ fontSize: '1.05rem', maxWidth: '45ch', margin: '0 auto' }}>
            {items.length === 0
              ? empty ?? 'No resources have been uploaded to the library yet.'
              : 'No resources match your search or filter criteria. Try clearing search or selecting a different category.'}
          </p>
          {dirty && (
            <button
              className="btn pri"
              style={{ marginTop: 20 }}
              onClick={() => setF(INIT)}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid">
          {list.map((r) => {
            const saved = favs.includes(r.id)
            const isPdf = r.format === 'PDF'
            const isEpub = r.format === 'EPUB'
            const isDownloading = downloadingId === r.id

            return (
              <article
                key={r.id}
                className="card"
                onMouseMove={tilt}
                onMouseLeave={untilt}
              >
                <div
                  className="cover"
                  style={
                    r.cover_url
                      ? { backgroundImage: `url(${r.cover_url})` }
                      : undefined
                  }
                >
                  {!r.cover_url && (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1.9rem', display: 'block', marginBottom: 4 }}>
                        {isPdf ? '📄' : isEpub ? '📖' : '📁'}
                      </span>
                      <span>{r.format || 'FILE'}</span>
                    </div>
                  )}

                  {/* Favorite Heart Button */}
                  <button
                    className={'heart' + (saved ? ' on' : '')}
                    aria-pressed={saved}
                    aria-label={saved ? 'Remove from saved' : 'Save resource'}
                    onClick={() => toggleFav(r.id)}
                  >
                    {saved ? '♥' : '♡'}
                  </button>
                </div>

                <h3>{r.title}</h3>
                {r.author && <p className="meta" style={{ color: 'var(--lavender)' }}>by {r.author}</p>}
                <p className="muted">{r.description || 'Exclusive curated resource from TheMohitFact.'}</p>

                {r.tags && r.tags.length > 0 && (
                  <div className="row" style={{ gap: 6, margin: '2px 0' }}>
                    {r.tags.map((t: string) => (
                      <span key={t} className="tag">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="meta">
                  {[
                    r.category,
                    r.format,
                    size(r.size_bytes),
                    new Date(r.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }),
                    r.access === 'members' ? '🔒 Members only' : '✨ Free download',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                <div className="acts">
                  {isPdf && r.preview_allowed !== false && (
                    <button className="btn" onClick={() => preview(r)}>
                      <span>👁</span> Preview
                    </button>
                  )}
                  <button
                    className="btn pri"
                    disabled={isDownloading}
                    onClick={() => download(r.id)}
                  >
                    {isDownloading ? (
                      <>
                        <span className="spinner" /> Downloading...
                      </>
                    ) : (
                      <>
                        <span>↓</span> Download
                      </>
                    )}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* PDF Preview Modal */}
      {pv && (
        <div className="overlay" onClick={() => setPv(null)}>
          <div
            className="pvbox"
            role="dialog"
            aria-modal="true"
            aria-label={'Preview of ' + pv.r.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span className="fc-badge" style={{ background: 'rgba(168, 85, 247, 0.3)' }}>
                  PDF
                </span>
                <h3 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pv.r.title}
                </h3>
              </div>

              <div className="row" style={{ gap: 8 }}>
                <a
                  className="btn"
                  href={pv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '8px 14px', fontSize: '0.86rem' }}
                >
                  ↗ Open in new tab
                </a>
                <button
                  className="btn pri"
                  onClick={() => download(pv.r.id)}
                  style={{ padding: '8px 16px', fontSize: '0.86rem' }}
                >
                  ↓ Download PDF
                </button>
                <button
                  className="btn"
                  onClick={() => setPv(null)}
                  style={{ padding: '8px 14px', fontSize: '0.86rem' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <iframe src={pv.url} title={'Preview of ' + pv.r.title} />
          </div>
        </div>
      )}
    </div>
  )
}
