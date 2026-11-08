export default function Loader({ label = 'Loading TheMohitFact Hub' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-label={label}>
      <div className="rings">
        <i />
        <i />
        <i />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--lavender)' }}>
          {label}
        </p>
        <p className="muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>
          Preparing knowledge repository...
        </p>
      </div>
    </div>
  )
}
