import { redirect } from 'next/navigation'
import Library from '@/components/Library'
import { ctx } from '@/lib/data'

export const metadata = {
  title: 'Saved Resources — TheMohitFact Hub',
}

export default async function Saved() {
  const { sb, user } = await ctx()
  if (!user) {
    redirect('/')
  }

  let items: any[] = []
  try {
    if (sb) {
      const { data, error } = await sb
        .from('favorites')
        .select('created_at,resources(*)')
        .order('created_at', { ascending: false })

      if (!error && data) {
        items = data.map((r: any) => r.resources).filter(Boolean)
      }
    }
  } catch (err) {
    console.error('[Saved] Query error:', err)
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ac2)',
            marginBottom: 8,
          }}
        >
          <span>♥</span> PERSONAL BOOKMARKS
        </div>
        <h1 className="dh" style={{ marginBottom: 8 }}>
          Saved Resources
        </h1>
        <p className="muted">
          Your personal collection of saved guides, books and materials for quick access.
        </p>
      </div>

      <Library
        items={items}
        favIds={items.map((r: any) => r.id)}
        empty="You haven't saved any resources yet. Tap the heart icon on any card in the library to save it here."
      />
    </>
  )
}
