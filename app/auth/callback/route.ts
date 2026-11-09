import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    if (code) {
      const sb = await createClient()
      await sb.auth.exchangeCodeForSession(code)
    }
    return NextResponse.redirect(origin + (next.startsWith('/') ? next : '/dashboard'))
  } catch (err) {
    console.error('[Auth Callback] error:', err)
    return NextResponse.redirect(new URL('/', req.url))
  }
}
