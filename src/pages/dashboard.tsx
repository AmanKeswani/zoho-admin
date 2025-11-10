// Protected Dashboard: verifies JWT cookie server-side and greets the user
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import { getTokenFromRequest, verifyJWT } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  username: string
  role: string
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyJWT(token) : null
  
  if (!payload || !payload.sub || !payload.role || !payload.username) {
    return { redirect: { destination: '/', permanent: false } }
  }
  return { props: { username: payload.username, role: payload.role } }
}

export default function Dashboard({ username, role }: Props) {
  return (
    <div className="min-h-screen px-4 py-8 bg-slate-50 dark:bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-text-high">Dashboard</h1>
        <p className="text-sm text-slate-700 dark:text-text-medium mt-1">Welcome, {username} ({role})</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-text-high">Requests Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <p className="text-sm text-slate-700 dark:text-text-medium mb-3">View pending, in-progress, completed, and rejected requests.</p>
              <Link href="/admin" className="inline-flex items-center rounded-md bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 text-sm font-medium shadow-sm">
                Go to Admin
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}