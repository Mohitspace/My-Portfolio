import { redirect } from 'next/navigation'
import DashNav from '@/components/DashNav'
import { ctx } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const { sb, user } = await ctx()
  if (!user) {
    redirect('/')
  }

  let isAdmin = false
  try {
    if (sb && user?.id) {
      const { data: prof } = await sb.from('profiles').select('is_admin').eq('id', user.id).single()
      isAdmin = !!prof?.is_admin
    }
  } catch (err) {
    console.error('[DashLayout] Profile check error:', err)
  }

  return (
    <div className="wrap dash">
      <DashNav isAdmin={isAdmin} />
      <div>{children}</div>
    </div>
  )
}
