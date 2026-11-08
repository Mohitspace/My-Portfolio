'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminMessages({ items }: { items: any[] }) {
  const sb = createClient()
  const router = useRouter()

  const toggle = async (m: any) => {
    await sb.from('messages').update({ is_read: !m.is_read }).eq('id', m.id)
    router.refresh()
  }

  const del = async (m: any) => {
    if (!confirm(`Delete message from ${m.name}?`)) return
    await sb.from('messages').delete().eq('id', m.id)
    router.refresh()
  }

  return (
    <section className="panel">
      <h2>Contact Messages ({items.length})</h2>
      {items.length === 0 ? (
        <p className="muted">No messages received yet. Messages sent via the contact form will appear here.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((m) => (
            <div
              className="msgbox"
              key={m.id}
              style={
                !m.is_read
                  ? {
                      borderColor: 'rgba(168, 85, 247, 0.45)',
                      background: 'rgba(168, 85, 247, 0.08)',
                    }
                  : undefined
              }
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>{m.name}</strong>{' '}
                  <span className="muted" style={{ fontSize: '0.88rem' }}>
                    &lt;{m.email}&gt; ·{' '}
                    {new Date(m.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                {!m.is_read && (
                  <span
                    className="tag"
                    style={{
                      background: 'rgba(236, 72, 153, 0.25)',
                      borderColor: 'rgba(236, 72, 153, 0.6)',
                      color: '#ffffff',
                    }}
                  >
                    ● NEW
                  </span>
                )}
              </div>

              {m.subject && (
                <p style={{ marginTop: 8, fontWeight: 600, color: '#f3e8ff' }}>
                  {m.subject}
                </p>
              )}

              <p
                className="muted"
                style={{
                  whiteSpace: 'pre-wrap',
                  margin: '8px 0 14px',
                  background: 'rgba(0,0,0,0.25)',
                  padding: 12,
                  borderRadius: 10,
                  fontSize: '0.94rem',
                }}
              >
                {m.body}
              </p>

              <div className="row" style={{ gap: 8 }}>
                <a
                  className="btn pri"
                  href={
                    'mailto:' +
                    m.email +
                    '?subject=' +
                    encodeURIComponent('Re: ' + (m.subject || 'Your message on TheMohitFact Hub'))
                  }
                  style={{ padding: '8px 14px', fontSize: '0.86rem' }}
                >
                  ✉ Reply by Email
                </a>
                <button
                  className="btn"
                  onClick={() => toggle(m)}
                  style={{ padding: '8px 14px', fontSize: '0.86rem' }}
                >
                  {m.is_read ? 'Mark unread' : '✓ Mark as read'}
                </button>
                <button
                  className="btn danger"
                  onClick={() => del(m)}
                  style={{ padding: '8px 14px', fontSize: '0.86rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
