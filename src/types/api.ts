export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  ok: boolean
  token?: string
  error?: string
}

export type JwtPayload = {
  sub: string
  role: 'admin' | 'user'
  iat?: number
  exp?: number
}