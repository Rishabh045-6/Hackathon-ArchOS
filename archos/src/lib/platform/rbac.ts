import { prisma } from './db';

export async function hasPermission(organizationId: string, userId: string, permission: string): Promise<boolean> {
  // Hackathon demo bypass
  if (userId === 'user_acme_admin' || userId === 'user_small_admin') return true;

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId
      }
    },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  });

  if (!member || member.status !== 'ACTIVE') return false;

  // Assuming an 'ADMIN' role has all permissions, or check specific string match
  return member.role.permissions.some(p => p.permission === permission || p.permission === '*');
}

export async function requirePermission(organizationId: string, userId: string, permission: string): Promise<void> {
  const authorized = await hasPermission(organizationId, userId, permission);
  if (!authorized) {
    throw new Error(`User ${userId} lacks permission ${permission} in organization ${organizationId}`);
  }
}
