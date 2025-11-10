import React, { useEffect, useMemo, useState } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import { getTokenFromRequest, verifyJWT } from '@/lib/auth'

type RequestRow = {
  id: number
  userId: number | null
  status: string
  type: string | null
  createdAt: string
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyJWT(token) : null
  if (!payload || !payload.sub || !payload.role) {
    return { redirect: { destination: '/', permanent: false } }
  }
  return { props: {} }
}

export default function AdminRequestsPage() {
  const [data, setData] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [q, setQ] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/requests')
        const json = await res.json().catch(() => ({}))
        if (res.ok && json?.ok === true && Array.isArray(json.data)) {
          if (mounted) setData(json.data as RequestRow[])
        } else {
          if (mounted) setError(json?.error || 'Failed to load requests')
        }
      } catch {
        if (mounted) setError('Failed to load requests')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return data.filter((r) => {
      const status = r.status.toLowerCase()
      const passesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && status === 'pending') ||
        (statusFilter === 'approved' && (status === 'approved' || status === 'completed')) ||
        (statusFilter === 'rejected' && status === 'rejected')

      const text = `${r.id} ${r.userId ?? ''} ${r.type ?? ''} ${r.status}`.toLowerCase()
      const passesSearch = term ? text.includes(term) : true
      return passesStatus && passesSearch
    })
  }, [data, statusFilter, q])

  async function onApprove(id: number) {
    try {
      const res = await fetch(`/api/admin/requests/${id}/approve`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json?.ok) {
        setData((rows) => rows.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)))
      }
    } catch {}
  }

  async function onDecline(id: number) {
    try {
      const res = await fetch(`/api/admin/requests/${id}/decline`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json?.ok) {
        setData((rows) => rows.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)))
      }
    } catch {}
  }

  function statusPill(status: string) {
    const s = status.toLowerCase()
    if (s === 'pending') return <span className="px-2 py-1 rounded-full bg-warning-700/10 text-warning-500 text-xs">Pending</span>
    if (s === 'completed' || s === 'approved') return <span className="px-2 py-1 rounded-full bg-success-700/10 text-success-500 text-xs">Approved</span>
    if (s === 'rejected') return <span className="px-2 py-1 rounded-full bg-danger-700/10 text-danger-500 text-xs">Rejected</span>
    if (s === 'in_progress') return <span className="px-2 py-1 rounded-full bg-info-700/10 text-info-500 text-xs">In Progress</span>
    return <span className="px-2 py-1 rounded-full bg-slate-800/10 text-text-medium text-xs">{status}</span>
  }

  return (
    <div className="min-h-screen px-6 py-6 bg-background text-text-high">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Requests</h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-card border border-border text-text-high text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="bg-card border border-border text-text-high placeholder:text-text-medium text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
            aria-label="Search requests"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-card border border-border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="text-text-medium">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Created At</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6">
                  <div className="h-6 bg-slate-700/40 animate-pulse rounded" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-text-medium">No requests found</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">{r.userId ?? 'N/A'}</td>
                  <td className="px-4 py-2">{r.type ?? 'N/A'}</td>
                  <td className="px-4 py-2">{statusPill(r.status)}</td>
                  <td className="px-4 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/requests/${r.id}`} className="text-info-500 hover:text-info-400 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded">View</Link>
                      {r.status.toLowerCase() === 'pending' ? (
                        <>
                          <button onClick={() => onApprove(r.id)} className="px-2 py-1 rounded-md bg-success-600 hover:bg-success-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-success-500">Approve</button>
                          <button onClick={() => onDecline(r.id)} className="px-2 py-1 rounded-md bg-danger-600 hover:bg-danger-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-danger-500">Decline</button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}