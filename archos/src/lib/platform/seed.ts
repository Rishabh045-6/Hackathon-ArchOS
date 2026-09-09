import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seed() {
  console.log('Seeding demo organizations...');

  // 1. Small Studio
  const smallStudio = await prisma.organization.upsert({
    where: { id: 'org_small' },
    update: {},
    create: {
      id: 'org_small',
      name: 'Small Studio',
      entitlements: {
        create: [
          { appId: 'PROJECTS', status: 'ACTIVE' }
        ]
      }
    }
  });

  // 2. Acme Design Studio
  const acme = await prisma.organization.upsert({
    where: { id: 'org_acme' },
    update: {},
    create: {
      id: 'org_acme',
      name: 'Acme Design Studio',
      entitlements: {
        create: [
          { appId: 'CRM', status: 'ACTIVE' },
          { appId: 'PROJECTS', status: 'ACTIVE' },
          { appId: 'ACCOUNTS', status: 'ACTIVE' }
        ]
      }
    }
  });

  // User for Acme
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@acmedesign.com' },
    update: {},
    create: {
      id: 'user_acme_admin',
      email: 'admin@acmedesign.com',
      name: 'Demo Admin'
    }
  });

  // ABC Interiors Contact for Acme
  const contact = await prisma.contact.create({
    data: {
      organizationId: acme.id,
      name: 'ABC Interiors',
      company: 'ABC Interiors'
    }
  });

  // Opportunity for Acme
  await prisma.opportunity.create({
    data: {
      organizationId: acme.id,
      contactId: contact.id,
      name: 'Luxury Villa',
      value: 2500000,
      stage: 'PROPOSAL',
      ownerId: demoAdmin.id
    }
  });

  console.log('Seeding complete.');
}