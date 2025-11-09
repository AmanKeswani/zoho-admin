// Admin Home Overview: protected page rendering request metrics
import React, { useEffect, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { requireAdmin } from '@/lib/auth'
import MetricCard from '@/components/MetricCard'

type Counts = {
  pending: number
  completed: number
  rejected: number
  in_progress: number
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const admin = requireAdmin(req)
  if (!admin) {
    return {
      redirect: { destination: '/', permanent: false }
    }
  }
  return { props: {} }
}

export default function AdminHome() {
  const [counts, setCounts] = useState<Counts>({ pending: 0, completed: 0, rejected: 0, in_progress: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/metrics/requests')
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.ok === true && data?.counts) {
          if (mounted) setCounts(data.counts as Counts)
        } else {
          if (mounted) setError(data?.error || 'Failed to load metrics')
        }
      } catch {
        if (mounted) setError('Failed to load metrics')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const noData = !loading && counts.pending === 0 && counts.completed === 0 && counts.rejected === 0 && counts.in_progress === 0

  return (
    <div className="min-h-screen px-4 py-8 bg-slate-50 dark:bg-background">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-text-high">Admin Overview</h1>
        <p className="text-sm text-slate-700 dark:text-text-medium mt-1">Requests status snapshot</p>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-live="polite" aria-atomic={true} role="region" aria-label="Request status counts">
          <MetricCard
            title="Pending Requests"
            value={counts.pending}
            description={loading ? 'Loading…' : 'Since last 30 days'}
            color="orange"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />

          <MetricCard
            title="In Progress"
            value={counts.in_progress}
            description={loading ? 'Loading…' : 'Total'}
            color="blue"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
              </svg>
            }
          />

          <MetricCard
            title="Completed"
            value={counts.completed}
            description={loading ? 'Loading…' : 'Total'}
            color="green"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            }
          />

          <MetricCard
            title="Rejected"
            value={counts.rejected}
            description={loading ? 'Loading…' : 'Total'}
            color="red"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            }
          />
        </div>

        {noData && (
          <p className="mt-3 text-xs text-slate-700 dark:text-text-medium">No data</p>
        )}

        <div className="mt-6">
          <a href="/admin/requests" className="text-primary-500 hover:underline font-medium">View all requests</a>
        </div>
      </div>
    </div>
  )
}