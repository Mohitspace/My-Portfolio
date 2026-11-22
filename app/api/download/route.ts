import { NextRequest, NextResponse } from 'next/server'
import { createClient as admin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

    const sb = await createClient()
    const { data } = await sb.auth.getUser()
    const user = data?.user ?? null

    const { data: r, error: rError } = await sb
      .from('resources')
      .select('file_path,access')
      .eq('id', id)
      .single()

    if (rError || !r) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    if (r.access === 'members' && !user) return NextResponse.json({ error: 'login_required' }, { status: 401 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwinhlaobgacnmoxraus.supabase.co'
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'sb_publishable_d78FsEQirjTNChHeCZ_ZCg_jt3R1eFF'

    const svc = admin(supabaseUrl, serviceKey)
    const { data: signedData, error: signError } = await svc.storage
      .from('resources')
      .createSignedUrl(r.file_path, 60, { download: true })

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ error: 'sign_failed' }, { status: 500 })
    }

    if (user) {
      try {
        await sb.rpc('log_download', { rid: id })
      } catch {}
    }

    return NextResponse.json({ url: signedData.signedUrl })
  } catch (err: any) {
    console.error('[API /download] error:', err)
    return NextResponse.json({ error: err?.message || 'internal_error' }, { status: 500 })
  }
}
