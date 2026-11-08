'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminContent({ site }: { site: any }) {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const { error } = await createClient()
      .from('site_settings')
      .upsert({ key: 'site', value: f })
    setBusy(false)
    setMsg(error ? error.message : 'Settings saved! The About Me and Contact sections are updated.')
    router.refresh()
  }

  const L = (k: string, label: string, ph = '') => (
    <label className="f">
      {label}
      <input name={k} defaultValue={site[k] || ''} placeholder={ph} />
    </label>
  )

  return (
    <section className="panel">
      <div>
        <h2>Site Content &amp; Social Links</h2>
        <p className="muted" style={{ fontSize: '0.9rem', marginTop: 2 }}>
          Customize your homepage About story and public social profile URLs.
        </p>
      </div>

      <form onSubmit={save}>
        {L('about_title', 'About Section Heading', 'About TheMohitFact')}

        <label className="f">
          About Story Text (leave a blank line between paragraphs)
          <textarea
            name="about_body"
            style={{ minHeight: 200 }}
            defaultValue={site.about_body || ''}
            placeholder="Write your story, mission, and why you created this hub..."
          />
        </label>

        <div className="two">
          {L('youtube', 'YouTube Channel URL', 'https://youtube.com/@TheMohitFact')}
          {L('instagram', 'Instagram Profile URL', 'https://instagram.com/...')}
          {L('twitter', 'X / Twitter URL', 'https://x.com/...')}
          {L('email', 'Public Contact Email', 'contact@themohitfact.com')}
        </div>

        <div>
          <button className="btn pri" disabled={busy}>
            {busy && <span className="spinner" />}
            Save Content Settings
          </button>
        </div>

        {msg && (
          <p
            className={`msg ${msg.toLowerCase().includes('saved') ? 'ok' : ''}`}
            role="status"
          >
            {msg}
          </p>
        )}
      </form>
    </section>
  )
}
