// POST /api/auth/login
// Purpose: Authenticate approved users, issue httpOnly JWT cookie
// Inputs: { usernameOrEmail: string, password: string }
// Outputs: { ok: true, role } on success; error messages with appropriate status codes
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// @ts-ignore – no @types/jsonwebtoken installed, but runtime works
import { serialize } from 'cookie'

type Body = {
  usernameOrEmail?: string
  password?: string
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 3 // Per policy: 3 attempts per 60s
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

  // Configuration guard: require APP_JWT_SECRET to be set
  if (!process.env.APP_JWT_SECRET) {
    console.error('[CONFIG] APP_JWT_SECRET missing')
    return res
      .status(500)
      .json({ ok: false, error: 'Server misconfiguration: APP_JWT_SECRET not set' })
  }

  const ip = getIP(req)
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Too many requests' })

  const body: Body = req.body || {}
  const { usernameOrEmail, password } = body
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ ok: false, error: 'Missing username or password' })
  }
  if (typeof usernameOrEmail !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ ok: false, error: 'Invalid input types' })
  }
  if (password.length < 8) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters' })
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
      }
    })

    if (!user) {
      console.error('login failed: user not found')
      return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    }

    if (user.status !== 'approved') {
      if (user.status === 'pending') {
        console.error('login failed: signup pending approval')
        return res.status(403).json({ ok: false, error: 'Signup pending admin approval' })
      }
      if (user.status === 'declined') {
        console.error('login failed: signup declined')
        return res.status(403).json({ ok: false, error: 'Signup declined — contact admin' })
      }
      return res.status(403).json({ ok: false, error: 'Access not permitted' })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      console.error('login failed: bcrypt mismatch')
      return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    }

    const secret = process.env.APP_JWT_SECRET
    if (!secret) {
      console.error('[CONFIG] APP_JWT_SECRET missing at sign stage')
      return res
        .status(500)
        .json({ ok: false, error: 'Server misconfiguration: APP_JWT_SECRET not set' })
    }

    const token = jwt.sign(
      { sub: String(user.id), username: user.username, role: user.role },
      secret,
      { expiresIn: '8h' }
    )

    const cookieName = process.env.APP_COOKIE_NAME || 'zoho_admin_session'
    const isProd = process.env.NODE_ENV === 'production'
    // Security: set httpOnly cookie for session; do not include tokens in JSON responses
    // Cookie settings: httpOnly for security, secure in production, SameSite=Lax, root path, 8h maxAge
    const cookie = serialize(cookieName, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    })

    res.setHeader('Set-Cookie', cookie)
    return res.status(200).json({ ok: true, role: user.role })
  } catch (e) {
    // Log without leaking secrets
    const msg = e instanceof Error ? e.message : String(e)
    console.error('login error', msg)
    return res
      .status(500)
      .json({ ok: false, error: 'Internal server error — please try again later' })
  }
}