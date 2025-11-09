import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function insertCount(status: string, count: number) {
  if (count <= 0) return
  const values = Array.from({ length: count }, () => `('${status}', CURRENT_TIMESTAMP)`).join(', ')
  await prisma.$executeRawUnsafe(`INSERT INTO Request (status, createdAt) VALUES ${values};`)
}

async function ensureAdmin() {
  const username = 'admin'
  const email = 'admin@local'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123'
  const hash = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] }
  })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password_hash: hash, role: 'admin', status: 'approved' }
    })
  } else {
    await prisma.user.create({
      data: { username, email, password_hash: hash, role: 'admin', status: 'approved' }
    })
  }

  // Dev-only note: printing admin credentials for local testing; do not use in production
  console.log('Dev admin seeded:')
  console.log(`username: ${username}`)
  console.log(`password: ${password}`)
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Dev-only script. Aborting: NODE_ENV=production')
    process.exit(1)
  }

  await ensureAdmin()

  await insertCount('pending', 5)
  await insertCount('in_progress', 3)
  await insertCount('completed', 20)
  await insertCount('rejected', 2)

  console.log('Seeded demo Request rows: pending=5, in_progress=3, completed=20, rejected=2')
}

main()
  .catch((err) => {
    console.error('Seed demo failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })