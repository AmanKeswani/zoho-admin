// POST /api/auth/signup
// Purpose: Create pending user accounts to await admin approval
// Inputs: { username: string, email: string, password: string }
// Outputs: 201 with { ok: true, status: 'pending' } on success; error messages tailored to user status
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Body = {
  username?: string
  email?: string
  password?: string
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5
const rateMap = new Map<string, { count: number; resetAt: number }>()

function getIP(req: NextApiRequest) {
  const xf = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
  return xf || (req.socket.remoteAddress ?? 'unknown')
}

function checkRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_REQUESTS) return false
  entry.count += 1
  return true
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = getIP(req)
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Too many requests' })

  const body: Body = req.body || {}
  const { username, email, password } = body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }
  if (typeof username !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid input types' })
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    })
    console.log(existing)
    if (existing) {
      if (existing.status === 'pending') {
        return res.status(409).json({ error: 'Signup pending approval' })
      }
      if (existing.status === 'approved') {
        return res.status(409).json({ error: 'User already exists' })
      }
      // declined: allow resubmit (set status back to pending, update password hash)
      const hash = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password_hash: hash,
          status: 'pending',
          role: 'user'
        }
      })
      
      return res.status(201).json({ ok: true, message: 'Signup submitted and awaiting admin approval' })
    }

    // create new user
    const hash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hash,
        role: 'user',
        status: 'pending'
      }
    })

    return res.status(201).json({ ok: true, message: 'Signup submitted and awaiting admin approval' })
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}