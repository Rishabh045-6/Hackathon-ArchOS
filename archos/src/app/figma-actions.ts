"use server";

import prisma from "@/lib/platform/db";
import { getCurrentUser } from "@/lib/platform/auth/context";
import { markOpportunityAsWon } from "@/lib/crm/actions";
import { createExpense } from "@/lib/accounts/actions";

export async function getFigmaAppState() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No user");
  const orgId = user.organizationId || "";

  const expenses = await prisma.expense.findMany({
    where: { organizationId: orgId },
    include: { project: true }
  });

  const opp = await prisma.opportunity.findFirst({
    where: { name: 'Luxury Villa' }
  });

  const activities = await prisma.activity.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' }
  });
  
  const projects = await prisma.project.findMany({
    where: { organizationId: orgId }
  });

  return {
    expenses,
    opportunity: opp,
    activities,
    projects
  };
}

export async function submitWon(oppId: string) {
  return markOpportunityAsWon(oppId);
}

export async function submitExpense(data: { projectId: string, category: string, description: string, amount: number, date?: string }) {
  return createExpense(data);
}
