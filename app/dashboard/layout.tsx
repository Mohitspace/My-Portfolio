import DashNav from '@/components/DashNav'
import { ctx } from '@/lib/data'
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const { sb, user } = await ctx()
  const { data: prof } = await sb.from('profiles').select('is_admin').eq('id', user!.id).single()
  return (
    <div className="wrap dash">
      <DashNav isAdmin={!!prof?.is_admin} />
      <div>{children}</div>
    </div>
  )
}
