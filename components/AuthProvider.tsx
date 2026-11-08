'use client'

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup' | 'forgot'

const Ctx = createContext<{
  loggedIn: boolean
  open: (m?: Mode, after?: () => void) => void
}>({
  loggedIn: false,
  open: () => {},
})

export const useAuth = () => useContext(Ctx)

export default function AuthProvider({
  loggedIn,
  children,
}: {
  loggedIn: boolean
  children: React.ReactNode
}) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [after, setAfter] = useState<(() => void) | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const sb = createClient()

  const open = (m: Mode = 'login', cb?: () => void) => {
    setMsg('')
    setMode(m)
    setAfter(() => cb ?? null)
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email')).trim()
    const password = String(f.get('password') || '')

    let error: any = null
    if (mode === 'login') {
      ;({ error } = await sb.auth.signInWithPassword({ email, password }))
      if (!error) {
        const cb = after
        setMode(null)
        router.refresh()
        setBusy(false)
        cb?.()
        return
      }
    } else if (mode === 'signup') {
      ;({ error } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: location.origin + '/auth/callback',
          data: { full_name: String(f.get('name') || '').trim() },
        },
      }))
      if (!error) {
        setMsg('Check your email and confirm your account, then log in.')
      }
    } else {
      ;({ error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + '/auth/callback?next=/reset-password',
      }))
      if (!error) {
        setMsg('Reset link sent. Check your email inbox.')
      }
    }

    if (error) setMsg(error.message)
    setBusy(false)
  }

  const google = () =>
    sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + '/auth/callback' },
    })

  const title =
    mode === 'signup'
      ? 'Create your account'
      : mode === 'forgot'
      ? 'Reset your password'
      : 'Welcome back'

  const subtitle =
    mode === 'signup'
      ? 'Join TheMohitFact Hub to access exclusive resources & books'
      : mode === 'forgot'
      ? "Enter your registered email and we'll send a recovery link"
      : 'Log in to download free books, PDFs and access your dashboard'

  return (
    <Ctx.Provider value={{ loggedIn, open }}>
      {children}
      {mode && (
        <div className="overlay" onClick={() => setMode(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="x"
              aria-label="Close modal"
              onClick={() => setMode(null)}
            >
              ✕
            </button>

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--lavender)',
                  marginBottom: 6,
                }}
              >
                <span>✦</span> THE MOHIT FACT
              </div>
              <h2>{title}</h2>
              <p className="muted" style={{ fontSize: '0.9rem', marginTop: 4 }}>
                {subtitle}
              </p>
            </div>

            {mode !== 'forgot' && (
              <button
                type="button"
                className="btn"
                onClick={google}
                style={{
                  width: '100%',
                  gap: 12,
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderColor: 'rgba(168, 85, 247, 0.25)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.57 0 2.98.54 4.09 1.6l3.07-3.07C17.3 1.77 14.86 1 12 1 7.42 1 3.51 3.6 1.63 7.37l3.65 2.83C6.18 7.33 8.84 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.85c2.14-1.98 3.74-4.89 3.74-8.67z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.8c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.63 7.37C.59 9.46 0 11.66 0 14s.59 4.54 1.63 6.63l3.65-2.83z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.68-2.85c-1.07.72-2.45 1.16-4.25 1.16-3.16 0-5.82-2.33-6.72-5.2L1.63 16.03C3.51 19.8 7.42 23 12 23z"
                  />
                </svg>
                Continue with Google
              </button>
            )}

            {mode !== 'forgot' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: 'var(--tx3)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  margin: '4px 0',
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'rgba(168, 85, 247, 0.15)' }} />
                <span>OR WITH EMAIL</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(168, 85, 247, 0.15)' }} />
              </div>
            )}

            <form onSubmit={submit}>
              {mode === 'signup' && (
                <label className="f">
                  Your Full Name
                  <input
                    name="name"
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label className="f">
                Email Address
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </label>

              {mode !== 'forgot' && (
                <label className="f">
                  Password
                  <input
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                  />
                </label>
              )}

              <button className="btn pri" disabled={busy} style={{ marginTop: 4 }}>
                {busy && <span className="spinner" />}
                {mode === 'signup'
                  ? 'Create Account'
                  : mode === 'forgot'
                  ? 'Send Reset Link'
                  : 'Log In'}
              </button>
            </form>

            {msg && (
              <p
                className={`msg ${msg.toLowerCase().includes('sent') || msg.toLowerCase().includes('confirm') ? 'ok' : ''}`}
                role="status"
              >
                {msg}
              </p>
            )}

            <p className="alt">
              {mode === 'login' && (
                <>
                  Don&apos;t have an account?{' '}
                  <a onClick={() => open('signup', after ?? undefined)}>Sign up free</a> ·{' '}
                  <a onClick={() => open('forgot')}>Forgot password?</a>
                </>
              )}
              {mode === 'signup' && (
                <>
                  Already registered?{' '}
                  <a onClick={() => open('login', after ?? undefined)}>Log in here</a>
                </>
              )}
              {mode === 'forgot' && (
                <a onClick={() => open('login')}>← Back to log in</a>
              )}
            </p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
