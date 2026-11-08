'use client'

import { useState } from 'react'
import AdminResources from './AdminResources'
import AdminMessages from './AdminMessages'
import AdminContent from './AdminContent'

export default function AdminPanel({ stats, resources, messages, site }: any) {
  const [tab, setTab] = useState('res')
  const unread = messages.filter((m: any) => !m.is_read).length

  const statItems = [
    { label: 'Published Resources', value: stats.resources, icon: '📁', color: '#a855f7' },
    { label: 'Registered Members', value: stats.members, icon: '👥', color: '#38bdf8' },
    { label: 'Total Downloads', value: stats.downloads, icon: '⚡', color: '#ec4899' },
    { label: 'Unread Messages', value: unread, icon: '💬', color: '#f59e0b' },
  ]

  const tabs = [
    { key: 'res', label: 'Resource Library', count: resources.length },
    { key: 'msg', label: 'Messages', count: unread > 0 ? `${unread} new` : messages.length },
    { key: 'site', label: 'Site Content & Socials' },
  ]

  return (
    <>
      {/* Admin Quick Stat Overview Cards */}
      <div className="stats">
        {statItems.map((item) => (
          <div className="stat" key={item.label}>
            <div
              style={{
                position: 'absolute',
                top: -15,
                right: -15,
                width: 90,
                height: 90,
                background: `radial-gradient(circle, ${item.color}35 0%, transparent 70%)`,
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>{item.value}</b>
              <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={'chip' + (tab === t.key ? ' on' : '')}
            onClick={() => setTab(t.key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'rgba(168,85,247,0.2)',
                  color: '#ffffff',
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Tab View */}
      {tab === 'res' && <AdminResources items={resources} />}
      {tab === 'msg' && <AdminMessages items={messages} />}
      {tab === 'site' && <AdminContent site={site} />}
    </>
  )
}
