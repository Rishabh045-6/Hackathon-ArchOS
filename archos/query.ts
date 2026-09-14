import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log('All Roles:', roles);
  
  const permissions = await prisma.rolePermission.findMany();
  console.log('All Permissions:', permissions);
}
main().catch(console.error).finally(() => prisma.$disconnect());
