'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

const ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/#explore', label: 'Explore' },
  { href: '/books', label: 'Books & PDFs' },
  { href: '/#explore', label: 'Resources' },
  { href: '/#about', label: 'About Me' },
  { href: '/#contact', label: 'Contact' },
]

export default function Navbar({ email }: { email: string | null }) {
  const { open } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function logout() {
    setMenu(false)
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  const auth = email ? (
    <>
      <Link
        className={`btn ${pathname.startsWith('/dashboard') ? 'pri' : ''}`}
        href="/dashboard"
        onClick={() => setMenu(false)}
      >
        <span style={{ fontSize: '0.9rem' }}>✦</span> Dashboard
      </Link>
      <button className="btn" onClick={logout}>
        Log out
      </button>
    </>
  ) : (
    <>
      <button className="btn" onClick={() => { setMenu(false); open('login') }}>
        Login
      </button>
      <button className="btn pri" onClick={() => { setMenu(false); open('signup') }}>
        Sign Up
      </button>
    </>
  )

  return (
    <nav className="nav" style={scrolled ? { background: 'rgba(5, 2, 12, 0.88)', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(168, 85, 247, 0.25) inset' } : undefined}>
      <div className="wrap">
        <Link href="/" className="logo">
          TheMohitFact Hub
          <span className="logo-badge">PRO</span>
        </Link>

        <div className="links">
          {ITEMS.map((item, index) => {
            const isBooks = item.href === '/books' && pathname === '/books'
            const isHome = item.href === '/' && pathname === '/'
            const isActive = isBooks || (isHome && typeof window !== 'undefined' && !window.location.hash)
            return (
              <Link
                key={`${item.label}-${index}`}
                href={item.href}
                className={isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="row desk">
          {auth}
        </div>

        <button
          className="burger"
          aria-label="Toggle navigation menu"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? '✕' : '☰'}
        </button>
      </div>

      {menu && (
        <div className="mpanel">
          {ITEMS.map((item, index) => (
            <Link
              key={`mobile-${item.label}-${index}`}
              href={item.href}
              onClick={() => setMenu(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            {auth}
          </div>
        </div>
      )}
    </nav>
  )
}
