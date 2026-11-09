import { NextResponse } from 'next/server'
import { createClient as admin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const sb = await createClient()
    const { data } = await sb.auth.getUser()
    const user = data?.user ?? null
    if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({ error: 'service_role_key_missing' }, { status: 500 })
    }

    const svc = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    const { error } = await svc.auth.admin.deleteUser(user.id)
    if (error) return NextResponse.json({ error: 'delete_failed' }, { status: 500 })

    await sb.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[API /account/delete] error:', err)
    return NextResponse.json({ error: err?.message || 'internal_error' }, { status: 500 })
  }
}
