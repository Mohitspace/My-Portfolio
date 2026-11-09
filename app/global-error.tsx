'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ background: '#06030e', color: '#f8fafc', fontFamily: 'sans-serif', padding: 40, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Something went wrong!</h2>
        <p style={{ color: '#a5b4fc', marginBottom: 24 }}>{error?.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => reset()}
          style={{ padding: '10px 24px', borderRadius: 999, background: '#a855f7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
