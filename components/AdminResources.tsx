'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/constants'

const safe = (n: string) => n.replace(/[^\w.\-]+/g, '_')
const coverPath = (url: string) => decodeURIComponent(url.split('/covers/')[1] ?? '')

export default function AdminResources({ items }: { items: any[] }) {
  const sb = createClient()
  const router = useRouter()
  const [edit, setEdit] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const file = f.get('file') as File
    const cover = f.get('cover') as File

    if (!edit && !file?.size) return setMsg('Please select a file to upload.')
    setBusy(true)
    setMsg('')
    let uploaded = ''

    try {
      const row: any = {
        title: String(f.get('title')).trim(),
        description: String(f.get('description') || '').trim() || null,
        author: String(f.get('author') || '').trim() || null,
        category: String(f.get('category')),
        access: String(f.get('access')),
        preview_allowed: f.get('preview') === 'on',
        tags: String(f.get('tags') || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }

      if (file?.size) {
        const path = crypto.randomUUID() + '/' + safe(file.name)
        const up = await sb.storage
          .from('resources')
          .upload(path, file, { contentType: file.type || undefined })
        if (up.error) throw up.error
        uploaded = path
        Object.assign(row, {
          file_path: path,
          format: (file.name.split('.').pop() || 'FILE').toUpperCase(),
          size_bytes: file.size,
        })
      }

      if (cover?.size) {
        const cp = crypto.randomUUID() + '-' + safe(cover.name)
        const up = await sb.storage
          .from('covers')
          .upload(cp, cover, { contentType: cover.type || undefined })
        if (up.error) throw up.error
        row.cover_url = sb.storage.from('covers').getPublicUrl(cp).data.publicUrl
      }

      const { error } = edit
        ? await sb.from('resources').update(row).eq('id', edit.id)
        : await sb.from('resources').insert(row)

      if (error) throw error

      if (edit && row.file_path && edit.file_path) {
        await sb.storage.from('resources').remove([edit.file_path])
      }
      if (edit && row.cover_url && edit.cover_url) {
        await sb.storage.from('covers').remove([coverPath(edit.cover_url)])
      }

      form.reset()
      setMsg(edit ? 'Resource updated successfully.' : 'Resource published to library!')
      setEdit(null)
      router.refresh()
    } catch (err: any) {
      if (uploaded) await sb.storage.from('resources').remove([uploaded])
      setMsg(err.message ?? 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  async function del(r: any) {
    if (!confirm(`Are you sure you want to delete "${r.title}"? The file will also be permanently removed from storage.`))
      return
    const { error } = await sb.from('resources').delete().eq('id', r.id)
    if (error) return setMsg(error.message)
    if (r.file_path) await sb.storage.from('resources').remove([r.file_path])
    if (r.cover_url) await sb.storage.from('covers').remove([coverPath(r.cover_url)])
    router.refresh()
  }

  return (
    <>
      {/* Upload or Edit Panel */}
      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{edit ? '✏️ Edit Resource' : '📤 Upload New Resource'}</h2>
            <p className="muted" style={{ fontSize: '0.9rem', marginTop: 2 }}>
              {edit
                ? `Updating: ${edit.title}`
                : 'Upload PDFs, EPUBs, notes, workbooks or guides to the library.'}
            </p>
          </div>
          {edit && (
            <button
              type="button"
              className="chip"
              onClick={() => {
                setEdit(null)
                setMsg('')
              }}
            >
              Cancel Edit ✕
            </button>
          )}
        </div>

        <form key={edit?.id ?? 'new'} onSubmit={save}>
          <label className="f">
            Title *
            <input
              name="title"
              required
              defaultValue={edit?.title}
              placeholder="e.g. The Focus Framework: Master Productivity"
            />
          </label>

          <label className="f">
            Description
            <textarea
              name="description"
              defaultValue={edit?.description ?? ''}
              placeholder="Detailed description of what the reader will learn or gain..."
              rows={3}
            />
          </label>

          <div className="two">
            <label className="f">
              Author
              <input
                name="author"
                defaultValue={edit?.author ?? ''}
                placeholder="TheMohitFact or Author Name"
              />
            </label>

            <label className="f">
              Tags (comma-separated)
              <input
                name="tags"
                defaultValue={(edit?.tags ?? []).join(', ')}
                placeholder="mindset, habits, psychology, productivity"
              />
            </label>

            <label className="f">
              Category
              <select name="category" defaultValue={edit?.category ?? CATEGORIES[0]}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="f">
              Access Permission
              <select name="access" defaultValue={edit?.access ?? 'members'}>
                <option value="members">Logged-in members only</option>
                <option value="public">Free for everyone (no login)</option>
              </select>
            </label>

            <label className="f">
              {edit ? 'Replace file (leave blank to keep current)' : 'Resource File (PDF, EPUB, DOCX...)'}
              <input name="file" type="file" />
            </label>

            <label className="f">
              {edit ? 'Replace cover image (optional)' : 'Cover Image (optional)'}
              <input name="cover" type="file" accept="image/*" />
            </label>
          </div>

          <label className="check" style={{ width: 'fit-content' }}>
            <input
              name="preview"
              type="checkbox"
              defaultChecked={edit?.preview_allowed ?? true}
            />
            <span>Allow in-browser PDF preview</span>
          </label>

          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn pri" disabled={busy}>
              {busy && <span className="spinner" />}
              {busy ? 'Saving...' : edit ? 'Save Changes' : 'Publish Resource'}
            </button>
            {edit && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEdit(null)
                  setMsg('')
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {msg && (
            <p
              className={`msg ${msg.toLowerCase().includes('success') || msg.toLowerCase().includes('published') ? 'ok' : ''}`}
              role="status"
            >
              {msg}
            </p>
          )}
        </form>
      </section>

      {/* Existing Resources List */}
      <section className="panel">
        <h2>Existing Resources ({items.length})</h2>
        {items.length === 0 ? (
          <p className="muted">No resources uploaded yet. Use the form above to add your first resource.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((r) => (
              <div className="arow" key={r.id}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="tag">{r.format || 'FILE'}</span>
                    <strong>{r.title}</strong>
                  </div>
                  <p className="meta" style={{ marginTop: 4 }}>
                    {[
                      r.category,
                      r.access === 'members' ? '🔒 Members' : '✨ Public',
                      `${r.downloads_count || 0} downloads`,
                    ].join(' · ')}
                  </p>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setEdit(r)
                      setMsg('')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn danger" onClick={() => del(r)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
