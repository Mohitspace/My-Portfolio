import Bookshelf from '@/components/Bookshelf'
import { ctx, favIdsFor } from '@/lib/data'

export const metadata = {
  title: 'Books & PDFs — Premium Digital Library | TheMohitFact Hub',
  description: 'Interactive 3D bookshelf, curated e-books, and full in-browser reading sanctuary from TheMohitFact.',
}

export const dynamic = 'force-dynamic'

export default async function Books() {
  let data: any[] = []
  let favs: string[] = []

  try {
    const { sb, user } = await ctx()
    if (sb) {
      const [resResult, favsResult] = await Promise.allSettled([
        sb.from('resources').select('*').order('created_at', { ascending: false }),
        favIdsFor(sb, user),
      ])

      if (resResult.status === 'fulfilled' && resResult.value?.data) {
        data = resResult.value.data
      }
      if (favsResult.status === 'fulfilled' && Array.isArray(favsResult.value)) {
        favs = favsResult.value
      }
    }
  } catch (err) {
    console.error('[Books] Data loading error:', err)
  }

  // Capture all publications: e-books, PDFs, workbooks, and study guides
  const items = (data ?? []).filter(
    (r: any) =>
      ['E-Books', 'PDF Collection', 'Guides', 'Study Materials', 'Notes'].includes(r.category) ||
      ['PDF', 'EPUB', 'TXT', 'MOBI', 'DOCX'].includes(r.format) ||
      (r.tags && r.tags.some((t: string) => ['book', 'pdf', 'guide', 'ebook'].includes(t.toLowerCase())))
  )

  return (
    <main className="wrap sec bs-page-container">
      {/* Cinematic Bookshelf Header Banner */}
      <div className="bs-header-banner">
        <div className="bs-header-badge">
          <span className="bs-badge-sparkle">✦</span>
          <span>THEMOHITFACT DIGITAL LIBRARY &amp; READING SANCTUARY</span>
          <span className="bs-badge-sparkle">✦</span>
        </div>

        <h1 className="dh bs-header-title">
          Books &amp; <span className="hero-gradient-text">PDF Collection</span>
        </h1>

        <p className="muted bs-header-desc">
          Browse our interactive 3D digital bookshelf. Click any book to inspect its details, rotate its 3D cover,
          and enter the dedicated in-browser <b>READ NOW</b> reading sanctuary with customizable themes, zoom, and bookmark progress.
        </p>
      </div>

      {/* Interactive 3D Digital Bookshelf */}
      <Bookshelf
        initialBooks={items}
        favIds={favs}
        emptyMessage="No digital books or PDF guides have been uploaded yet. When uploaded via Admin Panel, they will appear dynamically on these shelves."
      />
    </main>
  )
}
