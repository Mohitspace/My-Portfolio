import Hero from '@/components/Hero'
import Library from '@/components/Library'
import ContactForm from '@/components/ContactForm'
import WelcomeIntro from '@/components/WelcomeIntro'
import { ctx, favIdsFor, getSite, DEFAULT_SITE } from '@/lib/data'

export const dynamic = 'force-dynamic'

const ok = (u: string) => /^https?:\/\//.test(u)

export default async function Home() {
  let data: any[] = []
  let favs: string[] = []
  let site: any = DEFAULT_SITE

  try {
    const { sb, user } = await ctx()
    if (sb) {
      const [resResult, favsResult, siteResult] = await Promise.allSettled([
        sb.from('resources').select('*').order('created_at', { ascending: false }),
        favIdsFor(sb, user),
        getSite(sb),
      ])

      if (resResult.status === 'fulfilled' && resResult.value?.data) {
        data = resResult.value.data
      }
      if (favsResult.status === 'fulfilled' && Array.isArray(favsResult.value)) {
        favs = favsResult.value
      }
      if (siteResult.status === 'fulfilled' && siteResult.value) {
        site = siteResult.value
      }
    }
  } catch (err) {
    console.error('[Home] Data loading error:', err)
  }

  const links = [
    { name: 'YouTube Channel', url: site.youtube, icon: '▶' },
    { name: 'Instagram', url: site.instagram, icon: '📸' },
    { name: 'X / Twitter', url: site.twitter, icon: '𝕏' },
  ].filter((item) => ok(item.url))

  return (
    <>
      <WelcomeIntro />
      <Hero count={data?.length ?? 0} />

      {/* Explore Section */}
      <section id="explore" className="wrap sec">
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
              color: 'var(--lavender)',
              marginBottom: 8,
            }}
          >
            <span>✦</span> CURATED REPOSITORY
          </div>
          <h2>Explore All Resources</h2>
          <p className="muted" style={{ maxWidth: '64ch' }}>
            Filter by format, category, or search across workbooks, notes, and e-books.
            Download instantly or save items to your personal library.
          </p>
        </div>

        <Library items={data ?? []} favIds={favs} />
      </section>

      {/* About Section */}
      <section id="about" className="wrap sec about">
        <div
          className="panel"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '40px 36px',
            background: 'linear-gradient(135deg, rgba(22, 12, 42, 0.75), rgba(10, 5, 20, 0.85))',
            borderColor: 'rgba(168, 85, 247, 0.3)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

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
            <span>✦</span> THE CREATOR
          </div>

          <h2 style={{ marginBottom: 20 }}>{site.about_title || 'About TheMohitFact'}</h2>

          <div>
            {String(site.about_body || '')
              .split(/\n\s*\n/)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>

          {links.length > 0 && (
            <div className="row" style={{ marginTop: 24, gap: 12 }}>
              {links.map((link) => (
                <a
                  key={link.name}
                  className="btn"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ gap: 8 }}
                >
                  <span>{link.icon}</span> {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="wrap sec">
        <div
          className="panel"
          style={{
            padding: '40px 36px',
            background: 'linear-gradient(135deg, rgba(18, 10, 36, 0.75), rgba(8, 4, 18, 0.85))',
            borderColor: 'rgba(168, 85, 247, 0.25)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ac3)',
              marginBottom: 8,
            }}
          >
            <span>✦</span> GET IN TOUCH
          </div>

          <h2 style={{ marginBottom: 8 }}>Contact &amp; Collabs</h2>
          <p className="muted" style={{ marginBottom: 28, maxWidth: '60ch' }}>
            Have a question regarding a resource, a recommendation for the next video, or a
            collaboration proposal? Send a message below.
            {site.email && (
              <>
                {' '}
                Direct email:{' '}
                <a style={{ color: 'var(--lavender)', fontWeight: 600 }} href={'mailto:' + site.email}>
                  {site.email}
                </a>
              </>
            )}
          </p>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
