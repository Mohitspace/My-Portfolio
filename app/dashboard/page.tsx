import Link from 'next/link'
import { ctx } from '@/lib/data'

export default async function Dashboard() {
  const { sb, user } = await ctx()
  const head = { count: 'exact' as const, head: true }
  const [{ data: prof }, { data: hist, count: dl }, { count: saved }, { data: latest }] =
    await Promise.all([
      sb.from('profiles').select('full_name').eq('id', user!.id).single(),
      sb
        .from('downloads')
        .select('created_at,resources(title,format)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10),
      sb.from('favorites').select('resource_id', head),
      sb
        .from('resources')
        .select('id,title,category,format,created_at')
        .order('created_at', { ascending: false })
        .limit(4),
    ])

  return (
    <>
      <div style={{ marginBottom: 28 }}>
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
          <span>✦</span> MEMBER DASHBOARD
        </div>

        <h1 className="dh">
          Welcome back{prof?.full_name ? `, ${prof.full_name}` : ''}
        </h1>
        <p className="muted" style={{ marginTop: 4 }}>
          Signed in as <span style={{ color: 'var(--tx)' }}>{user!.email}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat">
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />
          <b>{dl ?? 0}</b>
          <span>Total Downloads</span>
        </div>

        <div className="stat">
          <div
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />
          <b>{saved ?? 0}</b>
          <span>Saved to Library</span>
        </div>
      </div>

      {/* Recently Uploaded */}
      <div style={{ marginTop: 36, marginBottom: 36 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.4rem' }}>Recently added to hub</h2>
          <Link href="/#explore" className="btn" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            View all →
          </Link>
        </div>

        {!latest?.length ? (
          <p className="muted">No resources uploaded to the hub yet.</p>
        ) : (
          <ul className="hist">
            {latest.map((r: any) => (
              <li key={r.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="tag">{r.format || 'FILE'}</span>
                  <span style={{ fontWeight: 600 }}>{r.title}</span>
                </div>
                <span className="muted" style={{ fontSize: '0.86rem' }}>
                  {r.category}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Download History */}
      <div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Your download history</h2>
        {!hist?.length ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              background: 'var(--card)',
              borderRadius: 16,
              border: '1px solid var(--bd)',
            }}
          >
            <p className="muted" style={{ marginBottom: 14 }}>
              You haven&apos;t downloaded any resources or books yet.
            </p>
            <Link className="btn pri" href="/books">
              Explore Books &amp; PDFs
            </Link>
          </div>
        ) : (
          <ul className="hist">
            {hist.map((h: any, i: number) => (
              <li key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="tag" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
                    {h.resources?.format || 'FILE'}
                  </span>
                  <span style={{ fontWeight: 600 }}>{h.resources?.title || 'Resource'}</span>
                </div>
                <span className="muted" style={{ fontSize: '0.86rem' }}>
                  {new Date(h.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
