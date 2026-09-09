import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Create a demo organization
  const org = await prisma.organization.create({
    data: { name: 'Acme Architecture' }
  })

  // 2. Create a demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@acmearch.com',
      name: 'Demo Admin',
      passwordHash: 'hashed_password_stub'
    }
  })

  // 3. Add user to organization as Admin
  const adminRole = await prisma.role.create({
    data: { name: 'Admin', organizationId: org.id }
  })

  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      roleId: adminRole.id
    }
  })

  // 4. Setup app entitlements
  await prisma.appEntitlement.createMany({
    data: [
      { organizationId: org.id, appId: 'CRM', status: 'ACTIVE' },
      { organizationId: org.id, appId: 'PROJECTS', status: 'ACTIVE' },
      { organizationId: org.id, appId: 'ACCOUNTS', status: 'SUSPENDED' }
    ]
  })

  // 5. Create a shared contact
  await prisma.contact.create({
    data: {
      organizationId: org.id,
      name: 'Jane Smith',
      company: 'BuildCo',
      email: 'jane@buildco.com'
    }
  })

  console.log('Seed completed successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
