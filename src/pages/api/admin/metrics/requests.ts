// GET /api/admin/metrics/requests
// Purpose: Admin-only endpoint returning aggregated counts of Request records by status.
// Notes: Validates httpOnly JWT cookie; returns only aggregated counts (no raw rows).
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

type Counts = {
  pending: number
  completed: number
  rejected: number
  in_progress: number
}

const STATUSES: Array<keyof Counts> = ['pending', 'completed', 'rejected', 'in_progress']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const admin = requireAdmin(req)
  if (!admin) {
    return res.status(403).json({ ok: false, error: 'Forbidden' })
  }

  try {
    // Prefer a single grouped query; fall back to multiple counts if needed.
    const grouped = await (prisma as any).request.groupBy({
      by: ['status'],
      _count: { _all: true }
    })

    const counts: Counts = {
      pending: 0,
      completed: 0,
      rejected: 0,
      in_progress: 0
    }

    for (const row of grouped as Array<{ status: string; _count: { _all: number } }>) {
      const key = row.status as keyof Counts
      if (STATUSES.includes(key)) {
        counts[key] = row._count._all || 0
      }
    }

    return res.status(200).json({ ok: true, counts })
  } catch (e) {
    // If groupBy is not supported or model not found, try individual counts.
    try {
      const [pending, completed, rejected, in_progress] = await Promise.all([
        (prisma as any).request.count({ where: { status: 'pending' } }),
        (prisma as any).request.count({ where: { status: 'completed' } }),
        (prisma as any).request.count({ where: { status: 'rejected' } }),
        (prisma as any).request.count({ where: { status: 'in_progress' } })
      ])

      const counts: Counts = { pending, completed, rejected, in_progress }
      return res.status(200).json({ ok: true, counts })
    } catch (err) {
      return res.status(500).json({ ok: false, error: 'Internal server error' })
    }
  }
}