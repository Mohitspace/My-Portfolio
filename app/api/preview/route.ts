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
      .select('file_path,access,format,preview_allowed,title,author')
      .eq('id', id)
      .single()

    if (rError || !r || r.preview_allowed === false) {
      return NextResponse.json({ error: 'no_preview' }, { status: 404 })
    }
    if (r.access === 'members' && !user) {
      return NextResponse.json({ error: 'login_required' }, { status: 401 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!serviceKey) return NextResponse.json({ error: 'configuration_missing' }, { status: 500 })

    const svc = admin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    // 3600 seconds (1 hour) for uninterrupted reading session
    const { data: signedData, error: signError } = await svc.storage
      .from('resources')
      .createSignedUrl(r.file_path, 3600)

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ error: 'sign_failed' }, { status: 500 })
    }

    return NextResponse.json({
      url: signedData.signedUrl,
      format: r.format || 'PDF',
      title: r.title,
      author: r.author,
    })
  } catch (err: any) {
    console.error('[API /preview] error:', err)
    return NextResponse.json({ error: err?.message || 'internal_error' }, { status: 500 })
  }
}
