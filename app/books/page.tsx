import BooksPageClient, { BookItem } from '@/components/BooksPageClient'
import rawManifest from '@/src/data/books.json'
import { ctx, favIdsFor } from '@/lib/data'

export const metadata = {
  title: 'Books & PDFs — Premium Digital Library | TheMohitFact Hub',
  description:
    'Curved 3D tape arc shelf, curated publications, and in-browser reading sanctuary from TheMohitFact.',
}

export const dynamic = 'force-dynamic'

export default async function Books() {
  let favs: string[] = []
  let remoteBooks: any[] = []

  try {
    const { sb, user } = await ctx()
    if (sb) {
      const [resResult, favsResult] = await Promise.allSettled([
        sb.from('resources').select('*').order('created_at', { ascending: false }),
        favIdsFor(sb, user),
      ])

      if (resResult.status === 'fulfilled' && resResult.value?.data) {
        remoteBooks = resResult.value.data
      }
      if (favsResult.status === 'fulfilled' && Array.isArray(favsResult.value)) {
        favs = favsResult.value
      }
    }
  } catch (err) {
    console.error('[Books] Data loading error:', err)
  }

  // 1. Base manifest from src/data/books.json (single source of truth for prepared books)
  const manifestItems: BookItem[] = (rawManifest as BookItem[]) || []

  // 2. Map any additional remote publications if uploaded via admin
  const manifestIds = new Set(manifestItems.map((b) => b.id))
  const additionalItems: BookItem[] = (remoteBooks ?? [])
    .filter(
      (r: any) =>
        !manifestIds.has(r.id) &&
        (['E-Books', 'PDF Collection', 'Guides', 'Study Materials', 'Notes'].includes(r.category) ||
          ['PDF', 'EPUB', 'TXT', 'MOBI', 'DOCX'].includes(r.format) ||
          (r.tags && r.tags.some((t: string) => ['book', 'pdf', 'guide', 'ebook'].includes(t.toLowerCase()))))
    )
    .map((r: any) => ({
      id: r.id,
      title: r.title,
      author: r.author || 'TheMohitFact',
      category: r.category || 'Guides',
      year: r.created_at ? new Date(r.created_at).getFullYear() : 2026,
      pages: r.size_bytes ? Math.max(12, Math.round(r.size_bytes / 45000)) : 50,
      description: r.description || 'Exclusive curated publication from TheMohitFact Hub.',
      format: r.format || 'PDF',
      file_path: r.file_path,
      cover_url: r.cover_url,
      size_bytes: r.size_bytes,
      access: r.access || 'free',
      tags: r.tags || ['book', 'pdf'],
      created_at: r.created_at || new Date().toISOString(),
      spine: {
        color: '#1f2937',
        accent: '#9ca3af',
        label: r.format || 'PDF',
      },
    }))

  const allBooks = [...manifestItems, ...additionalItems]

  return (
    <main className="wrap sec">
      <BooksPageClient initialBooks={allBooks} favIds={favs} />
    </main>
  )
}
