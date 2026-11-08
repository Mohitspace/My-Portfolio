'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsForms({
  userId,
  email,
  name,
}: {
  userId: string
  email: string
  name: string
}) {
  const sb = createClient()
  const router = useRouter()
  const [m, setM] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const say = (k: string, v: string) => setM((p) => ({ ...p, [k]: v }))
  const val = (e: React.FormEvent<HTMLFormElement>) =>
    Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>

  async function saveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy('name')
    const { error } = await sb
      .from('profiles')
      .update({ full_name: val(e).name.trim() })
      .eq('id', userId)
    say('name', error ? error.message : 'Profile name updated successfully.')
    setBusy(null)
    router.refresh()
  }

  async function saveEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy('email')
    const { error } = await sb.auth.updateUser(
      { email: val(e).email },
      { emailRedirectTo: location.origin + '/auth/callback?next=/dashboard/settings' }
    )
    say(
      'email',
      error
        ? error.message
        : 'Confirmation links sent. Please check both your current and new inbox.'
    )
    setBusy(null)
  }

  async function savePw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy('pw')
    const form = e.currentTarget
    const { password, confirm } = val(e)
    if (password !== confirm) {
      setBusy(null)
      return say('pw', 'Passwords do not match.')
    }
    const { error } = await sb.auth.updateUser({ password })
    if (!error) form.reset()
    say('pw', error ? error.message : 'Password updated successfully.')
    setBusy(null)
  }

  async function del(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (val(e).confirm !== 'DELETE') return say('del', 'Type DELETE to confirm account deletion.')
    if (!confirm('Are you sure you want to permanently delete your account? This action cannot be undone.'))
      return
    setBusy('del')
    const r = await fetch('/api/account/delete', { method: 'POST' })
    if (!r.ok) {
      setBusy(null)
      return say('del', 'Could not delete the account. Please try again.')
    }
    await sb.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const note = (k: string) =>
    m[k] && (
      <p
        className={`msg ${m[k].toLowerCase().includes('success') || m[k].toLowerCase().includes('sent') ? 'ok' : ''}`}
        role="status"
        style={{ marginTop: 12 }}
      >
        {m[k]}
      </p>
    )

  return (
    <>
      {/* Profile Section */}
      <section className="panel">
        <div>
          <h2>Public Profile</h2>
          <p className="muted" style={{ fontSize: '0.9rem', marginTop: 2 }}>
            Your display name shown across your dashboard.
          </p>
        </div>
        <form onSubmit={saveName}>
          <label className="f">
            Full Name
            <input
              name="name"
              defaultValue={name}
              maxLength={120}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <div>
            <button className="btn pri" disabled={busy === 'name'}>
              {busy === 'name' && <span className="spinner" />}
              Save Name
            </button>
          </div>
        </form>
        {note('name')}
      </section>

      {/* Email Section */}
      <section className="panel">
        <div>
          <h2>Email Address</h2>
          <p className="muted" style={{ fontSize: '0.9rem', marginTop: 2 }}>
            The email address you use to log in and receive notifications.
          </p>
        </div>
        <form onSubmit={saveEmail}>
          <label className="f">
            Email
            <input
              name="email"
              type="email"
              defaultValue={email}
              required
              placeholder="you@example.com"
            />
          </label>
          <div>
            <button className="btn pri" disabled={busy === 'email'}>
              {busy === 'email' && <span className="spinner" />}
              Change Email
            </button>
          </div>
        </form>
        {note('email')}
      </section>

      {/* Password Section */}
      <section className="panel">
        <div>
          <h2>Security &amp; Password</h2>
          <p className="muted" style={{ fontSize: '0.9rem', marginTop: 2 }}>
            Update your account password with a secure phrase.
          </p>
        </div>
        <form onSubmit={savePw}>
          <div className="two">
            <label className="f">
              New Password
              <input
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
            </label>
            <label className="f">
              Confirm Password
              <input
                name="confirm"
                type="password"
                minLength={8}
                required
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </label>
          </div>
          <div>
            <button className="btn pri" disabled={busy === 'pw'}>
              {busy === 'pw' && <span className="spinner" />}
              Update Password
            </button>
          </div>
        </form>
        {note('pw')}
      </section>

      {/* Danger Zone */}
      <section
        className="panel"
        style={{
          borderColor: 'rgba(244, 63, 94, 0.35)',
          background: 'linear-gradient(135deg, rgba(32, 12, 24, 0.7), rgba(16, 7, 18, 0.8))',
        }}
      >
        <div>
          <h2 style={{ color: '#fda4af' }}>Danger Zone</h2>
          <p className="muted" style={{ fontSize: '0.9rem', marginTop: 2 }}>
            Permanently delete your user account, download records, and saved resources.
          </p>
        </div>
        <form onSubmit={del}>
          <label className="f">
            Type <strong style={{ color: '#ffffff' }}>DELETE</strong> to confirm:
            <input
              name="confirm"
              placeholder="DELETE"
              autoComplete="off"
              style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}
            />
          </label>
          <div>
            <button className="btn danger" disabled={busy === 'del'}>
              {busy === 'del' && <span className="spinner" />}
              Permanently Delete Account
            </button>
          </div>
        </form>
        {note('del')}
      </section>
    </>
  )
}
