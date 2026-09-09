import { prisma } from './db';

export async function createAuditLog(data: {
  organizationId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
}) {
  return prisma.auditLog.create({
    data: {
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null
    }
  });
}

export async function createActivity(data: {
  organizationId: string;
  actorId: string;
  type: string;
  entityType: string;
  entityId: string;
  sourceApp: string;
  metadata?: any;
}) {
  return prisma.activity.create({
    data: {
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null
    }
  });
}

export async function createNotification(data: {
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  return prisma.notification.create({
    data
  });
}
