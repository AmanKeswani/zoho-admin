import React, { useEffect, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { getTokenFromRequest, verifyJWT } from '@/lib/auth'
import MetricCard from '@/components/MetricCard'

type Counts = {
  pending: number
  in_progress: number
  completed?: number
  approved?: number
  rejected: number
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyJWT(token) : null
  if (!payload || !payload.sub || !payload.role) {
    return { redirect: { destination: '/', permanent: false } }
  }
  return { props: {} }
}

export default function AdminOverview() {
  const [counts, setCounts] = useState<Counts>({ pending: 0, in_progress: 0, completed: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/metrics/requests')
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.ok === true && data?.counts) {
          const c = data.counts as Partial<Counts>
          const approved = c.approved ?? c.completed ?? 0
          const nextCounts: Counts = {
            pending: c.pending ?? 0,
            in_progress: c.in_progress ?? 0,
            completed: c.completed ?? 0,
            approved,
            rejected: c.rejected ?? 0
          }
          if (mounted) setCounts(nextCounts)
        } else {
          if (mounted) setError(data?.error || 'Failed to load metrics')
        }
      } catch {
        if (mounted) setError('Failed to load metrics')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen px-6 py-6 bg-background">
      <h1 className="text-2xl font-semibold text-text-high mb-4">Overview</h1>
      <p className="text-sm text-text-medium mb-6">Key system metrics</p>

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-live="polite" aria-atomic={true}>
        {/* Pending */}
        {loading ? (
          <div className="bg-card border border-slate-700 rounded-2xl p-4 shadow-sm animate-pulse h-[140px]" />
        ) : (
          <MetricCard
            title="Pending"
            value={<span aria-live="polite">{counts.pending ?? 0}</span>}
            description="Awaiting approval"
            color="orange"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
        )}

        {/* In Progress */}
        {loading ? (
          <div className="bg-card border border-slate-700 rounded-2xl p-4 shadow-sm animate-pulse h-[140px]" />
        ) : (
          <MetricCard
            title="In Progress"
            value={<span aria-live="polite">{counts.in_progress ?? 0}</span>}
            description="Currently processing"
            color="blue"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" /><path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" /><path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
              </svg>
            }
          />
        )}

        {/* Approved */}
        {loading ? (
          <div className="bg-card border border-slate-700 rounded-2xl p-4 shadow-sm animate-pulse h-[140px]" />
        ) : (
          <MetricCard
            title="Approved"
            value={<span aria-live="polite">{counts.approved ?? 0}</span>}
            description="Approved requests"
            color="green"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            }
          />
        )}

        {/* Rejected */}
        {loading ? (
          <div className="bg-card border border-slate-700 rounded-2xl p-4 shadow-sm animate-pulse h-[140px]" />
        ) : (
          <MetricCard
            title="Rejected"
            value={<span aria-live="polite">{counts.rejected ?? 0}</span>}
            description="Rejected requests"
            color="red"
            icon={
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  )
}