import React, { useEffect, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { getTokenFromRequest, verifyJWT } from '@/lib/auth'
// MetricCard grid removed in favor of unified Request Overview card

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

  const total = (counts.pending ?? 0) + (counts.in_progress ?? 0) + (counts.approved ?? counts.completed ?? 0) + (counts.rejected ?? 0)

  return (
    <div className="min-h-screen px-6 py-6 bg-background">
      <h1 className="text-2xl font-semibold text-text-high mb-4">Overview</h1>
      <p className="text-sm text-text-medium mb-6">Key system metrics</p>

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-3xl animate-pulse h-[200px]" />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm max-w-3xl" aria-live="polite" aria-atomic={true}>
          <h2 className="text-xl font-semibold text-text-high mb-4">Request Overview</h2>
          <div className="text-5xl font-bold text-text-high">{total}</div>
          <div className="text-sm text-text-medium mb-6">Total Requests</div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-text-medium">Pending:</span>
              <span className="text-text-high font-medium">{counts.pending ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="text-text-medium">Approved:</span>
              <span className="text-text-high font-medium">{(counts.approved ?? counts.completed ?? 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-text-medium">Rejected:</span>
              <span className="text-text-high font-medium">{counts.rejected ?? 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}