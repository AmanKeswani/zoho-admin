export type UserRole = 'admin' | 'user'

export type UserModel = {
  id: number
  username: string
  passwordHash: string
  role: UserRole
}

export type TokenCacheModel = {
  id: number
  accessToken: string
  refreshToken: string
  expiresAt: Date
  lastRefreshed: Date
}