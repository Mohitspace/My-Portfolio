import { createClient } from '@/lib/supabase/server'

export async function ctx() {
  try {
    const sb = await createClient()
    const { data } = await sb.auth.getUser()
    return { sb, user: data?.user ?? null }
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err
    }
    console.error('[ctx] Supabase auth check error:', err)
    try {
      const sb = await createClient()
      return { sb, user: null }
    } catch {
      return { sb: null as any, user: null }
    }
  }
}

export async function favIdsFor(sb: any, user: any): Promise<string[]> {
  if (!sb || !user) return []
  try {
    const { data, error } = await sb.from('favorites').select('resource_id')
    if (error || !data) return []
    return data.map((r: any) => r.resource_id)
  } catch (err) {
    console.error('[favIdsFor] Query error:', err)
    return []
  }
}

export const DEFAULT_SITE = {
  about_title: 'About TheMohitFact',
  about_body:
    'TheMohitFact is a YouTube channel about self-improvement and personal development. This hub holds the extra material: PDFs, books, notes and guides that go deeper than a video can.\n\nCreate a free account to download resources and save your favorites. If a topic helped you, or you want one covered, send a message below.',
  youtube: '',
  instagram: '',
  twitter: '',
  email: '',
}

export async function getSite(sb: any) {
  if (!sb) return DEFAULT_SITE
  try {
    const { data, error } = await sb.from('site_settings').select('value').eq('key', 'site').single()
    if (error || !data) return DEFAULT_SITE
    return { ...DEFAULT_SITE, ...(data?.value ?? {}) }
  } catch (err) {
    console.error('[getSite] Query error:', err)
    return DEFAULT_SITE
  }
}
