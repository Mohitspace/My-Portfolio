export default function NotFound() {
  return (
    <main
      className="wrap sec"
      style={{ textAlign: 'center', paddingTop: 140, minHeight: '70vh' }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          marginBottom: 32,
          fontSize: '2.5rem',
        }}
      >
        🔍
      </div>
      <h1 className="dh" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: 16 }}>
        404 — Page Not Found
      </h1>
      <p className="muted" style={{ marginTop: 12, maxWidth: 440, margin: '0 auto 32px' }}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <a href="/" className="btn pri" style={{ display: 'inline-flex', gap: 8 }}>
        ← Go Home
      </a>
    </main>
  )
}
