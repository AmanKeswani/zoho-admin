// Updated: consistent teal color scheme + navigation link to signup/login
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ServiceBadge from '../components/ServiceBadge'

type FormState = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password must match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password })
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 201 && data?.ok === true) {
        setSuccess('Signup submitted — awaiting admin approval.')
        setForm({ username: '', email: '', password: '', confirmPassword: '' })
      } else if (res.status >= 400 && res.status < 500) {
        setError(data?.error || data?.message || 'Unable to submit signup')
      } else {
        setError('Unable to sign up — try again later')
      }
    } catch {
      setError('Unable to sign up — try again later')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background px-4">
      <Card className="max-w-md w-full bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-text-high">Sign up</CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-text-medium">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => onChange('username', e.target.value)}
                placeholder="yourname"
                className="w-full rounded-md border border-slate-200 dark:border-border bg-white dark:bg-inputBg text-slate-800 dark:text-text-high placeholder:text-slate-400 dark:placeholder:text-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-text-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-slate-200 dark:border-border bg-white dark:bg-inputBg text-slate-800 dark:text-text-high placeholder:text-slate-400 dark:placeholder:text-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-text-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => onChange('password', e.target.value)}
                placeholder="********"
                className="w-full rounded-md border border-slate-200 dark:border-border bg-white dark:bg-inputBg text-slate-800 dark:text-text-high placeholder:text-slate-400 dark:placeholder:text-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirm" className="text-sm font-medium text-slate-700 dark:text-text-medium">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                placeholder="********"
                className="w-full rounded-md border border-slate-200 dark:border-border bg-white dark:bg-inputBg text-slate-800 dark:text-text-high placeholder:text-slate-400 dark:placeholder:text-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-teal-600" role="status">
                {success}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white py-2 text-sm font-medium shadow-sm transition">
              {loading ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-primary-600 hover:underline font-medium"
              aria-label="Sign in"
            >
              Already have an account? Sign in
            </button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4">
        <ServiceBadge />
      </div>
    </div>
  )
}