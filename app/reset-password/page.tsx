'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPassword() {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const password = String(new FormData(e.currentTarget).get('password'))
    const { error } = await createClient().auth.updateUser({ password })
    if (error) {
      setMsg(error.message)
      setBusy(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="wrap sec" style={{ maxWidth: 480, margin: '40px auto 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--lavender)',
            marginBottom: 8,
          }}
        >
          <span>✦</span> SECURITY
        </div>
        <h1 className="dh">Set a New Password</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Choose a new password of at least 8 characters for your TheMohitFact Hub account.
        </p>
      </div>

      <div
        className="modal"
        style={{
          position: 'static',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 35px rgba(168,85,247,0.25)',
        }}
      >
        <form onSubmit={submit}>
          <label className="f">
            New Password
            <input
              name="password"
              type="password"
              minLength={8}
              required
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </label>
          <button className="btn pri" disabled={busy} style={{ marginTop: 8 }}>
            {busy && <span className="spinner" />}
            Save &amp; Continue to Dashboard
          </button>
          {msg && (
            <p className="msg" role="alert" style={{ marginTop: 8 }}>
              {msg}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
