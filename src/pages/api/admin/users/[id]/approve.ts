import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const admin = requireAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })

  const id = Number(req.query.id)
  if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' })

  try {
    const exists = await prisma.user.findUnique({ where: { id } })
    if (!exists) return res.status(404).json({ error: 'User not found' })

    const updated = await prisma.user.update({
      where: { id },
      data: { status: 'approved' }
    })
    console.info('AdminAction', {
      adminId: admin.sub,
      action: 'approve',
      userId: updated.id,
      at: new Date().toISOString()
    })
    return res.status(200).json({ ok: true, userId: updated.id, status: 'approved' })
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}