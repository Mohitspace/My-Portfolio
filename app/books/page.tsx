import Library from '@/components/Library'
import { ctx, favIdsFor } from '@/lib/data'

export const metadata = {
  title: 'Books & PDFs — TheMohitFact Hub',
  description: 'Curated e-books and PDFs to read and download from TheMohitFact.',
}

export default async function Books() {
  const { sb, user } = await ctx()
  const [{ data }, favs] = await Promise.all([
    sb.from('resources').select('*').order('created_at', { ascending: false }),
    favIdsFor(sb, user),
  ])

  const items = (data ?? []).filter(
    (r: any) =>
      ['E-Books', 'PDF Collection'].includes(r.category) ||
      ['PDF', 'EPUB'].includes(r.format)
  )

  return (
    <main className="wrap sec">
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--lavender)',
            marginBottom: 10,
          }}
        >
          <span>✦</span> DIGITAL READING ROOM
        </div>

        <h1 className="dh" style={{ marginBottom: 12 }}>
          Books &amp; <span className="hero-gradient-text">PDF Collection</span>
        </h1>

        <p className="muted" style={{ maxWidth: '62ch', fontSize: '1.08rem' }}>
          Explore our complete library of books and PDF workbooks. You can read any PDF directly
          in your browser before downloading, or tap the heart icon to save it to your collection.
        </p>
      </div>

      <Library
        items={items}
        favIds={favs}
        books
        empty="No books or PDFs have been uploaded to this section yet."
      />
    </main>
  )
}
