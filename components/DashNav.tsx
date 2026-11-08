'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname()

  const items = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/saved', label: 'Saved Resources', icon: '♥' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
    ...(isAdmin ? [{ href: '/dashboard/admin', label: 'Admin Control', icon: '⚡' }] : []),
  ]

  return (
    <nav className="dnav" aria-label="Dashboard navigation">
      <div style={{ padding: '8px 12px 14px', borderBottom: '1px solid rgba(168, 85, 247, 0.15)', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--lavender)' }}>
          Member Area
        </span>
      </div>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={path === item.href ? 'on' : ''}
        >
          <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
