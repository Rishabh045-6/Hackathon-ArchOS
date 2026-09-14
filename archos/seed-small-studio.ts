import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const contact = await prisma.contact.create({
    data: {
      organization: { connect: { id: 'org_small' } },
      name: 'Jane Doe',
      company: 'Jane Cafe'
    }
  });

  await prisma.project.create({
    data: {
      organization: { connect: { id: 'org_small' } },
      client: { connect: { id: contact.id } },
      name: 'Small Studio Rebrand',
      budget: 50000,
      status: 'ACTIVE'
    }
  });
  await prisma.project.create({
    data: {
      organization: { connect: { id: 'org_small' } },
      client: { connect: { id: contact.id } },
      name: 'Local Cafe Interior',
      budget: 80000,
      status: 'ACTIVE'
    }
  });
  console.log("Small Studio projects seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
