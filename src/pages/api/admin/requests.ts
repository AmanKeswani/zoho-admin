import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// GET /api/admin/requests
// Admin-only: returns recent requests with limited fields
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const admin = requireAdmin(req)
  if (!admin) {
    return res.status(403).json({ ok: false, error: 'Forbidden' })
  }

  try {
    const rows = await (prisma as any).request.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const data = rows.map((r: any) => ({
      id: r.id,
      userId: r.userId ?? null,
      status: r.status,
      type: r.type ?? null,
      createdAt: r.createdAt
    }))

    return res.status(200).json({ ok: true, data })
  } catch (e) {
    console.error('admin requests error', e instanceof Error ? e.message : e)
    return res.status(500).json({ ok: false, error: 'Internal server error' })
  }
}