import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  if (code) await (await createClient()).auth.exchangeCodeForSession(code)
  return NextResponse.redirect(origin + (next.startsWith('/') ? next : '/dashboard'))
}
