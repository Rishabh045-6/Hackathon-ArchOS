import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetEmail = '0456rishabh@gmail.com'; // Your specific Supabase email
  const orgId = 'org_acme'; // Acme Design Studio
  
  console.log(`Looking for user with email: ${targetEmail}`);
  const user = await prisma.user.findFirst({
    where: { email: targetEmail }
  });

  if (!user) {
    console.error("User not found. Please sign up through the UI first.");
    process.exit(1);
  }
  
  console.log(`Found ArchOS User: ${user.id}`);

  // Find or create a non-ADMIN role (MEMBER) for Acme Design Studio
  let memberRole = await prisma.role.findFirst({
    where: { organizationId: orgId, name: 'MEMBER' }
  });

  if (!memberRole) {
    console.log(`'MEMBER' role not found in Acme. Creating it...`);
    memberRole = await prisma.role.create({
      data: {
        organizationId: orgId,
        name: 'MEMBER'
      }
    });
  }
  
  console.log(`Using Role: ${memberRole.name} (ID: ${memberRole.id})`);

  // Create the membership
  const membership = await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id
      }
    },
    update: {
      roleId: memberRole.id,
      status: 'ACTIVE'
    },
    create: {
      organizationId: orgId,
      userId: user.id,
      roleId: memberRole.id,
      status: 'ACTIVE'
    }
  });

  console.log(`Successfully provisioned membership for ${targetEmail}!`);
  console.log(`Organization: Acme Design Studio`);
  console.log(`Role Assigned: ${memberRole.name}`);
  console.log(`Membership Status: ${membership.status}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
