import * as React from 'react'
import Link from 'next/link'

type TabKey = 'home' | 'requests' | 'users' | 'settings'

export type TopNavProps = {
  active?: TabKey
  initials?: string
  role?: string
}

const tabs: Array<{ key: TabKey; label: string; href: string }> = [
  { key: 'home', label: 'Home', href: '/admin' },
  { key: 'requests', label: 'Requests', href: '/admin/requests' },
  { key: 'users', label: 'Users', href: '/admin/users' },
  { key: 'settings', label: 'Settings', href: '/admin/settings' }
]

export default function TopNav({ active = 'home', initials = 'AU', role = 'admin' }: TopNavProps) {
  return (
    <nav className="bg-card border-b border-slate-700 px-6 py-3 flex items-center justify-between" aria-label="Admin navigation">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-sm font-semibold text-text-high">
          Zoho Admin
        </Link>
      </div>

      {/* Center: Tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Admin sections">
        {tabs.map((t) => {
          const isActive = active === t.key
          const baseClasses = 'px-3 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-400'
          const activeClasses = 'bg-primary-600/12 text-primary-500'
          const inactiveClasses = 'text-text-medium hover:text-text-high'
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={isActive ? 'page' : undefined}
              className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      {/* Right: User area */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-800 text-text-medium flex items-center justify-center" aria-hidden="true">
          <span className="text-xs font-semibold">{initials}</span>
        </div>
        <span className="text-sm text-text-medium">{role}</span>
      </div>
    </nav>
  )
}