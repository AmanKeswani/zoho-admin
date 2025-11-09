import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const admin = requireAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const users = await prisma.user.findMany({
      where: { status: 'pending' },
      select: { id: true, username: true, email: true, createdAt: true }
    })
    return res.status(200).json({ ok: true, users })
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}