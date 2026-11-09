import { redirect } from 'next/navigation'
import SettingsForms from '@/components/SettingsForms'
import { ctx } from '@/lib/data'

export const metadata = {
  title: 'Account Settings — TheMohitFact Hub',
}

export default async function Settings() {
  const { sb, user } = await ctx()
  if (!user) {
    redirect('/')
  }

  let prof: any = null
  try {
    if (sb) {
      const { data } = await sb
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      prof = data
    }
  } catch (err) {
    console.error('[Settings] Profile query error:', err)
  }

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
          <span>⚙</span> PREFERENCES &amp; SECURITY
        </div>
        <h1 className="dh">Account Settings</h1>
        <p className="muted" style={{ marginTop: 4 }}>
          Manage your personal profile information, email preferences, and password security.
        </p>
      </div>

      <SettingsForms
        userId={user.id}
        email={user.email ?? ''}
        name={prof?.full_name ?? ''}
      />
    </>
  )
}
