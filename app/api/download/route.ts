import { NextRequest, NextResponse } from 'next/server'
import { createClient as admin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data: r } = await sb.from('resources').select('file_path,access').eq('id', id).single()
  if (!r) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (r.access === 'members' && !user) return NextResponse.json({ error: 'login_required' }, { status: 401 })
  const svc = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await svc.storage.from('resources').createSignedUrl(r.file_path, 60, { download: true })
  if (error || !data) return NextResponse.json({ error: 'sign_failed' }, { status: 500 })
  if (user) await sb.rpc('log_download', { rid: id })
  return NextResponse.json({ url: data.signedUrl })
}
