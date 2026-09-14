'use server'

import { prisma } from '@/lib/platform/db'
import { getCurrentUser } from '@/lib/platform/auth/context'

export async function getProjects() {
  const user = await getCurrentUser()
  if (!user || !user.organizationId) throw new Error("Unauthorized");
  return prisma.project.findMany({
    where: { organizationId: user.organizationId },
    include: {
      expenses: true,
      client: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getProject(projectId: string) {
  const user = await getCurrentUser()
  if (!user || !user.organizationId) throw new Error("Unauthorized");
  return prisma.project.findFirst({
    where: { 
      id: projectId,
      organizationId: user.organizationId
    },
    include: {
      expenses: true,
      client: true,
      tasks: true
    }
  })
}
