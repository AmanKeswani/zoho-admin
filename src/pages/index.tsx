// Updated: consistent teal color scheme + navigation link to signup/login
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ServiceBadge from '../components/ServiceBadge'

type FormState = {
  usernameOrEmail: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ usernameOrEmail: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const [showPassword, setShowPassword] = useState(false)

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.usernameOrEmail || !form.password) {
      setError('Both fields are required.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      // Guard: session is via httpOnly cookie; never read tokens from response
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: form.usernameOrEmail, password: form.password })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.ok === true) {
        await router.push('/admin')
      } else if (res.status === 401 || res.status === 403) {
        setError(data?.error || 'Invalid credentials')
        // Focus the error element for accessibility
        setTimeout(() => errorRef.current?.focus(), 0)
      } else if (res.status === 500) {
        setError(data?.error || 'Unable to sign in — try again later')
        setTimeout(() => errorRef.current?.focus(), 0)
      } else {
        setError('Unable to sign in — try again later')
        setTimeout(() => errorRef.current?.focus(), 0)
      }
    } catch {
      setError('Unable to sign in — try again later')
      setTimeout(() => errorRef.current?.focus(), 0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background px-4">
      <Card className="max-w-md w-full bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-text-high">Login</CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="usernameOrEmail" className="text-sm font-medium text-slate-700 dark:text-text-medium">Username or Email</Label>
              <Input
                id="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={(e) => onChange('usernameOrEmail', e.target.value)}
                placeholder="yourname or you@example.com"
                className="w-full rounded-md border border-slate-200 dark:border-border bg-white dark:bg-inputBg text-text-high dark:text-text-high placeholder:text-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-text-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => onChange('password', e.target.value)}
                  placeholder="********"
                  className="w-full rounded-md border border-slate-200 dark:border-border bg-white dark:bg-inputBg text-text-high dark:text-text-high placeholder:text-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 pr-9"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-medium hover:text-text-high focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-md p-1"
                >
                  {showPassword ? (
                    <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.03-2.89 2.94-5.26 5.42-6.73" />
                      <path d="M1 1l22 22" />
                      <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                ref={errorRef}
                className="text-sm text-red-600"
                role="alert"
                tabIndex={-1}
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white py-2 text-sm font-medium shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-primary-600 hover:underline font-medium"
              aria-label="Create an account"
            >
              Don't have an account? Create an account
            </button>
          </div>
        </CardContent>
      </Card>
      {/* ServiceBadge moved to _app for persistent bottom-right positioning */}
    </div>
  )
}
