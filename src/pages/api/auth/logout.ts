import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieName = process.env.APP_COOKIE_NAME || 'zoho_admin_session'

  // Clear cookie on GET or POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  // Send both secure and non-secure variants to ensure removal in dev and prod
  const clearCookies = [
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`,
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  ]
  res.setHeader('Set-Cookie', clearCookies)

  return res.status(200).json({ ok: true, message: 'Logged out successfully' })
}