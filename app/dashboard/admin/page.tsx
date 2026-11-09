import { redirect } from 'next/navigation'
import AdminPanel from '@/components/AdminPanel'
import { ctx, getSite, DEFAULT_SITE } from '@/lib/data'

export const metadata = {
  title: 'Admin Control Center — TheMohitFact Hub',
}

export default async function Admin() {
  const { sb, user } = await ctx()
  if (!user) {
    redirect('/')
  }

  let prof: any = null
  try {
    if (sb) {
      const { data } = await sb
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      prof = data
    }
  } catch (err) {
    console.error('[Admin] Profile error:', err)
  }

  if (!prof?.is_admin) redirect('/dashboard')

  const head = { count: 'exact' as const, head: true }
  let resources: any[] = []
  let messages: any[] = []
  let site: any = DEFAULT_SITE
  let rCount = 0
  let mCount = 0
  let dCount = 0

  try {
    if (sb) {
      const [resRes, msgRes, siteRes, rRes, mRes, dRes] = await Promise.allSettled([
        sb.from('resources').select('*').order('created_at', { ascending: false }),
        sb.from('messages').select('*').order('created_at', { ascending: false }),
        getSite(sb),
        sb.from('resources').select('id', head),
        sb.from('profiles').select('id', head),
        sb.from('downloads').select('id', head),
      ])

      if (resRes.status === 'fulfilled' && resRes.value?.data) resources = resRes.value.data
      if (msgRes.status === 'fulfilled' && msgRes.value?.data) messages = msgRes.value.data
      if (siteRes.status === 'fulfilled' && siteRes.value) site = siteRes.value
      if (rRes.status === 'fulfilled') rCount = rRes.value?.count ?? 0
      if (mRes.status === 'fulfilled') mCount = mRes.value?.count ?? 0
      if (dRes.status === 'fulfilled') dCount = dRes.value?.count ?? 0
    }
  } catch (err) {
    console.error('[Admin] Data fetch error:', err)
  }

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
        initialResources={resources}
        messages={messages}
        site={site}
        stats={{
          resources: rCount,
          members: mCount,
          downloads: dCount,
        }}
      />
    </>
  )
}
