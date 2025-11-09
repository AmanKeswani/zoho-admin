import React, { useEffect, useState } from 'react'
import type { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type PendingUser = { id: number; username: string; email: string; createdAt: string }

type Props = { initialUsers: PendingUser[] }

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const admin = requireAdmin(ctx.req)
  if (!admin) {
    return { redirect: { destination: '/', permanent: false } }
  }
  // Only admin may view
  const users = await prisma.user.findMany({
    where: { status: 'pending' },
    select: { id: true, username: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  })
  return {
    props: {
      initialUsers: users.map((u: { id: number; username: string; email: string; createdAt: Date }) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        createdAt: new Date(u.createdAt).toISOString()
      }))
    }
  }
}

export default function AdminPendingPage({ initialUsers }: Props) {
  const [users, setUsers] = useState<PendingUser[]>(initialUsers)
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({})

  async function approve(id: number) {
    setLoadingMap((m) => ({ ...m, [id]: true }))
    try {
      const res = await fetch(`/api/admin/users/${id}/approve`, { method: 'POST' })
      if (res.ok) {
        setUsers((list) => list.filter((u) => u.id !== id))
      }
    } finally {
      setLoadingMap((m) => ({ ...m, [id]: false }))
    }
  }

  async function decline(id: number) {
    setLoadingMap((m) => ({ ...m, [id]: true }))
    try {
      const res = await fetch(`/api/admin/users/${id}/decline`, { method: 'POST' })
      if (res.ok) {
        setUsers((list) => list.filter((u) => u.id !== id))
      }
    } finally {
      setLoadingMap((m) => ({ ...m, [id]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Pending Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-gray-600">No pending users.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Username</th>
                    <th className="text-left py-2 pr-4">Email</th>
                    <th className="text-left py-2 pr-4">Requested At</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2 pr-4">{u.username}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleString()}</td>
                      <td className="py-2 space-x-2">
                        <Button
                          onClick={() => approve(u.id)}
                          disabled={!!loadingMap[u.id]}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => decline(u.id)}
                          disabled={!!loadingMap[u.id]}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Decline
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}