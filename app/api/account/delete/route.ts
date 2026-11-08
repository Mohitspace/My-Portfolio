import { NextResponse } from 'next/server'
import { createClient as admin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
export async function POST() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 })
  const svc = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await svc.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
  await sb.auth.signOut()
  return NextResponse.json({ ok: true })
}
