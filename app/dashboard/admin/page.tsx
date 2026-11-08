import { redirect } from 'next/navigation'
import AdminPanel from '@/components/AdminPanel'
import { ctx, getSite } from '@/lib/data'

export const metadata = {
  title: 'Admin Control Center — TheMohitFact Hub',
}

export default async function Admin() {
  const { sb, user } = await ctx()
  const { data: prof } = await sb
    .from('profiles')
    .select('is_admin')
    .eq('id', user!.id)
    .single()

  if (!prof?.is_admin) redirect('/dashboard')

  const head = { count: 'exact' as const, head: true }
  const [{ data: resources }, { data: messages }, site, r, m, d] = await Promise.all([
    sb.from('resources').select('*').order('created_at', { ascending: false }),
    sb.from('messages').select('*').order('created_at', { ascending: false }),
    getSite(sb),
    sb.from('resources').select('id', head),
    sb.from('profiles').select('id', head),
    sb.from('downloads').select('id', head),
  ])

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ac)',
            marginBottom: 8,
          }}
        >
          <span>⚡</span> SYSTEM ADMINISTRATION
        </div>
        <h1 className="dh">Admin Control Center</h1>
        <p className="muted" style={{ marginTop: 4 }}>
          Manage your uploaded digital library, view member analytics, and read inbound messages.
        </p>
      </div>

      <AdminPanel
        stats={{
          resources: r.count ?? 0,
          members: m.count ?? 0,
          downloads: d.count ?? 0,
        }}
        resources={resources ?? []}
        messages={messages ?? []}
        site={site}
      />
    </>
  )
}
