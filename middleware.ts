import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase credentials are missing, guard dashboard routes and continue
    if (!supabaseUrl || !supabaseAnonKey) {
      if (request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return response
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          } catch {}
        },
      },
    })

    // Only invoke getUser if auth cookies are present to avoid unnecessary external roundtrips
    const cookies = request.cookies.getAll()
    const hasAuthCookie = cookies.some(
      (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
    )

    let user = null
    if (hasAuthCookie) {
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null
    }

    // Protect dashboard routes
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (err) {
    console.error('[Middleware] Auth verification error:', err)
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|image/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
