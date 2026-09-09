const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const roleAcme = await prisma.role.create({
    data: {
      name: 'Admin',
    }
  });

  const acme = await prisma.organization.create({
    data: {
      name: 'Acme Design Studio',
      entitlements: {
        create: [
          { appId: 'CRM' },
          { appId: 'PROJECTS' },
          { appId: 'ACCOUNTS' }
        ]
      }
    }
  });

  const small = await prisma.organization.create({
    data: {
      name: 'Small Studio',
      entitlements: {
        create: [
          { appId: 'CRM' }
        ]
      }
    }
  });

  const acmeUser = await prisma.user.create({
    data: {
      name: 'Acme Admin',
      email: 'admin@acmedesign.com',
      memberships: {
        create: {
          organizationId: acme.id,
          roleId: roleAcme.id
        }
      }
    }
  });

  const contact = await prisma.contact.create({
    data: {
      organizationId: acme.id,
      name: 'ABC Interiors',
      company: 'ABC Interiors'
    }
  });

  await prisma.opportunity.create({
    data: {
      organizationId: acme.id,
      contactId: contact.id,
      name: 'Luxury Villa',
      stage: 'OPEN',
      ownerId: acmeUser.id,
      value: 150000
    }
  });

  console.log('Seeded database successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
