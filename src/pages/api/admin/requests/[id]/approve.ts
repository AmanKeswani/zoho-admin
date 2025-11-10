import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// POST /api/admin/requests/[id]/approve
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const admin = requireAdmin(req)
  if (!admin) return res.status(403).json({ ok: false, error: 'Forbidden' })

  const idParam = req.query.id
  const id = typeof idParam === 'string' ? parseInt(idParam, 10) : NaN
  if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: 'Invalid id' })

  try {
    await (prisma as any).request.update({ where: { id }, data: { status: 'completed' } })
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('approve request error', e instanceof Error ? e.message : e)
    return res.status(500).json({ ok: false, error: 'Internal server error' })
  }
}