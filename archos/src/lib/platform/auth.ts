import { prisma } from './db';

export async function getCurrentUser() {
  const user = await prisma.user.findFirst({
    where: { name: 'Acme Admin' }
  });
  return user;
}

export async function currentOrganization() {
  const org = await prisma.organization.findFirst({
    where: { name: 'Acme Design Studio' }
  });
  return org;
}
