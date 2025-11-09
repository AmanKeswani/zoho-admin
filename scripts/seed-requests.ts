import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function insertCount(status: string, count: number) {
  if (count <= 0) return
  const values = Array.from({ length: count }, () => `('${status}', CURRENT_TIMESTAMP)`).join(', ')
  await prisma.$executeRawUnsafe(`INSERT INTO Request (status, createdAt) VALUES ${values};`)
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Dev-only script. Aborting: NODE_ENV=production')
    process.exit(1)
  }

  await insertCount('pending', 5)
  await insertCount('completed', 20)
  await insertCount('rejected', 2)
  await insertCount('in_progress', 3)

  console.log('Seeded Request rows: pending=5, completed=20, rejected=2, in_progress=3')
}

main()
  .catch((err) => {
    console.error('Seed requests failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })