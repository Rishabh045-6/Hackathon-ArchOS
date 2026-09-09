import { prisma } from './db';

export async function hasApp(organizationId: string, appId: string): Promise<boolean> {
  const entitlement = await prisma.appEntitlement.findUnique({
    where: {
      organizationId_appId: {
        organizationId,
        appId
      }
    }
  });

  return entitlement?.status === 'ACTIVE';
}

export async function requireApp(organizationId: string, appId: string): Promise<void> {
  const hasAccess = await hasApp(organizationId, appId);
  if (!hasAccess) {
    throw new Error(`Organization ${organizationId} does not have access to app: ${appId}`);
  }
}

export async function getEnabledApps(organizationId: string): Promise<string[]> {
  const entitlements = await prisma.appEntitlement.findMany({
    where: { organizationId, status: 'ACTIVE' },
    select: { appId: true }
  });
  return entitlements.map(e => e.appId);
}
