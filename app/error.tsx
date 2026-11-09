'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="wrap sec" style={{ textAlign: 'center', paddingTop: 140, minHeight: '60vh' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Something went wrong!</h2>
      <p className="muted" style={{ marginBottom: 24 }}>{error?.message || 'Unable to load this section.'}</p>
      <button className="btn pri" onClick={() => reset()} style={{ display: 'inline-flex' }}>
        Try again
      </button>
    </main>
  )
}
