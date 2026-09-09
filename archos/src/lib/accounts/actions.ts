'use server'

import prisma from '@/lib/platform/db'
import { getCurrentUser } from '@/lib/platform/auth/context'
import { requireApp } from '@/lib/platform/entitlements'
import { requirePermission } from '@/lib/platform/rbac'
import { createActivity, createAuditLog } from '@/lib/platform/logging'
import { revalidatePath } from 'next/cache'

export async function getExpenses() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized");
  await requireApp(user.organizationId, 'ACCOUNTS')
  await requirePermission(user.organizationId, user.id, 'ACCOUNTS.EXPENSE.READ')

  return prisma.expense.findMany({
    where: { organizationId: user.organizationId },
    include: {
      project: true
    },
    orderBy: { date: 'desc' }
  })
}

export async function createExpense(data: {
  projectId: string
  category: string
  description: string
  amount: number
  date?: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized");
  await requireApp(user.organizationId, 'ACCOUNTS')
  await requirePermission(user.organizationId, user.id, 'ACCOUNTS.EXPENSE.WRITE')

  // Multi-tenant check: Verify the project belongs to the current org
  const project = await prisma.project.findUnique({
    where: { id: data.projectId }
  });
  if (!project) throw new Error("Project not found");
  if (project.organizationId !== user.organizationId) throw new Error("Organization mismatch");
  if (data.amount <= 0) throw new Error("Amount must be greater than 0");

  const expense = await prisma.expense.create({
    data: {
      organizationId: user.organizationId,
      projectId: data.projectId,
      category: data.category,
      description: data.description,
      amount: data.amount,
      createdById: user.id,
      date: data.date ? new Date(data.date) : new Date(),
    }
  })

  // Project expenses are calculated dynamically by the relation, no need to update a float field.

  await createActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    type: 'EXPENSE_CREATED',
    entityType: 'Expense',
    entityId: expense.id,
    sourceApp: 'ACCOUNTS',
    metadata: {
      description: data.description,
      amount: data.amount,
      projectId: data.projectId,
      projectName: project.name
    }
  })

  await createAuditLog({
    organizationId: user.organizationId,
    actorId: user.id,
    action: 'EXPENSE_CREATED',
    entityType: 'Expense',
    entityId: expense.id,
    metadata: {
      description: data.description,
      amount: data.amount,
      projectId: data.projectId
    }
  })
  
  revalidatePath('/accounts')
  revalidatePath(`/projects/${data.projectId}`)
  revalidatePath('/projects')
  
  return expense
}
