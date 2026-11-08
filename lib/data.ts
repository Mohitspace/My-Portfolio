import { createClient } from '@/lib/supabase/server'
export async function ctx() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  return { sb, user }
}
export async function favIdsFor(sb: any, user: any): Promise<string[]> {
  if (!user) return []
  const { data } = await sb.from('favorites').select('resource_id')
  return (data ?? []).map((r: any) => r.resource_id)
}
export const DEFAULT_SITE = {
  about_title: 'About TheMohitFact',
  about_body: 'TheMohitFact is a YouTube channel about self-improvement and personal development. This hub holds the extra material: PDFs, books, notes and guides that go deeper than a video can.\n\nCreate a free account to download resources and save your favorites. If a topic helped you, or you want one covered, send a message below.',
  youtube: '', instagram: '', twitter: '', email: '',
}
export async function getSite(sb: any) {
  const { data } = await sb.from('site_settings').select('value').eq('key', 'site').single()
  return { ...DEFAULT_SITE, ...(data?.value ?? {}) }
}
