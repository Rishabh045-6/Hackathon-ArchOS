import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ 
    where: { email: '0456rishabh@gmail.com' }, 
    include: { 
      memberships: { 
        include: { organization: true, role: true } 
      } 
    } 
  });
  console.log(JSON.stringify(user, null, 2));
}
main().finally(() => prisma.$disconnect());
