import * as React from 'react'

export default function ServiceBadge() {
  return (
    <div className="mx-auto inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm bg-slate-50 border border-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-muted">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-4 h-4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>Service available 09:00–21:00 IST</span>
    </div>
  )
}