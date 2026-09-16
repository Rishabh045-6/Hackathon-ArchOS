"use server";

import prisma from "@/lib/platform/db";
import { getCurrentUser } from "@/lib/platform/auth/context";
import { markOpportunityAsWon } from "@/lib/crm/actions";
import { createExpense } from "@/lib/accounts/actions";
import { getEnabledApps } from "@/lib/platform/entitlements";

export async function getFigmaAppState() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No user");
  const orgId = user.organizationId || "";
  
  if (!orgId) {
    return {
      user,
      userOrganizations: [],
      expenses: [],
      opportunity: null,
      activities: [],
      projects: [],
      members: [],
      allUsers: []
    };
  }

  const enabledApps = await getEnabledApps(orgId);
  const hasAccounts = enabledApps.includes("ACCOUNTS");
  const hasCRM = enabledApps.includes("CRM");
  const hasProjects = enabledApps.includes("PROJECTS");

  let expenses: any[] = [];
  if (hasAccounts) {
    expenses = await prisma.expense.findMany({
      where: { organizationId: orgId },
      include: { project: true }
    });
  }

  let opp = null;
  if (hasCRM) {
    opp = await prisma.opportunity.findFirst({
      where: { organizationId: orgId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  let projects: any[] = [];
  if (hasProjects) {
    projects = await prisma.project.findMany({
      where: { organizationId: orgId }
    });
  }

  // Activities can belong to any app, but we only fetch if the user is in the org.
  const activities = await prisma.activity.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' }
  });

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: { user: true, role: true }
  });

  let allUsers: any[] = [];
  const currentMembership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId: user.id } },
    include: { role: true }
  });
  const isAdmin = currentMembership?.role?.name?.toUpperCase() === 'ADMIN';

  if (isAdmin) {
    allUsers = await prisma.user.findMany({
      include: { memberships: { include: { organization: true, role: true } } }
    });
  }

  const userOrganizations = await prisma.organizationMember.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
    include: { organization: true, role: true }
  });

  return {
    user,
    userOrganizations,
    expenses,
    opportunity: opp,
    activities,
    projects,
    members,
    allUsers,
    enabledApps
  };
}

export async function submitWon(oppId: string) {
  return markOpportunityAsWon(oppId);
}

export async function submitExpense(data: { projectId: string, category: string, description: string, amount: number, date?: string }) {
  return createExpense(data);
}
