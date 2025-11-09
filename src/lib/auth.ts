import type { JwtPayload } from '../types/api'
// @ts-ignore
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

export function getAuthCookieName(): string {
  return process.env.APP_COOKIE_NAME || 'app_session'
}

type CookieCarrier = {
  headers?: { cookie?: string | undefined }
}

export function getTokenFromRequest(req: CookieCarrier): string | null {
  const cookieHeader = req?.headers?.cookie
  if (!cookieHeader) return null
  const cookies = parse(cookieHeader)
  const name = getAuthCookieName()
  return cookies[name] || null
}

export function verifyJWT(token: string): JwtPayload | null {
  try {
    const secret = process.env.APP_JWT_SECRET
    if (!secret) return null
    const decoded = jwt.verify(token, secret) as JwtPayload
    return decoded
  } catch {
    return null
  }
}

export function requireAdmin(req: CookieCarrier): JwtPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  const payload = verifyJWT(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}