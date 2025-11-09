import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminUsername = 'admin'
  const adminEmail = 'aman.keswani@quicksell.co'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'

  const passwordHash = await bcrypt.hash(adminPassword, 10)

  // Ensure single-row TokenCache exists with id=1 and refresh_token left null
  await prisma.tokenCache.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, refresh_token: null }
  })

  // Create or update the admin user
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      username: adminUsername,
      password_hash: passwordHash,
      role: 'admin',
      status: 'approved'
    },
    create: {
      username: adminUsername,
      email: adminEmail,
      password_hash: passwordHash,
      role: 'admin',
      status: 'approved'
    }
  })

  // Output only the admin username and local initial password (dev only)
  console.log('Seeded admin user for local development:')
  console.log(`username: ${adminUsername}`)
  console.log(`password: ${adminPassword}`)
}

main()
  .catch(async (e) => {
    console.error('Seed failed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })