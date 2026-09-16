"use server";

import prisma from "../platform/db";
import { getCurrentUser } from "../platform/auth/context";
import { requireApp } from "../platform";
import { platformEventBus } from "../platform/eventBus";
import { createAuditLog, createActivity } from "../platform/logging";
import { revalidatePath } from "next/cache";

export type OpportunityStage = "QUALIFICATION" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";

export async function markOpportunityAsWon(opportunityId: string) {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) throw new Error("Unauthorized");

  await requireApp(user.organizationId, "CRM");

  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId, organizationId: user.organizationId },
    data: { stage: "WON" },
    include: { contact: true }
  });

  // Cross-app event
  await platformEventBus.publish("OPPORTUNITY_WON", {
    opportunityId: opportunity.id,
    organizationId: opportunity.organizationId,
    contactId: opportunity.contactId,
    name: opportunity.name,
    value: opportunity.value,
    ownerId: opportunity.ownerId
  });

  // Audit
  await createAuditLog({
    organizationId: user.organizationId,
    actorId: user.id,
    action: "OPPORTUNITY_WON",
    entityType: "Opportunity",
    entityId: opportunity.id,
    metadata: { value: opportunity.value }
  });

  // Activity Timeline
  await createActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    type: "STATUS_CHANGED",
    entityType: "Opportunity",
    entityId: opportunity.id,
    sourceApp: "CRM",
    metadata: { stage: "WON" }
  });

  revalidatePath("/crm");
  revalidatePath("/crm/opportunities");
  revalidatePath(`/crm/opportunities/${opportunityId}`);

  return opportunity;
}

export async function updateOpportunityStage(opportunityId: string, stage: OpportunityStage) {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) throw new Error("Unauthorized");

  await requireApp(user.organizationId, "CRM");

  if (stage === "WON") {
    return markOpportunityAsWon(opportunityId);
  }

  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId, organizationId: user.organizationId },
    data: { stage }
  });

  revalidatePath("/crm");
  revalidatePath("/crm/opportunities");
  revalidatePath(`/crm/opportunities/${opportunityId}`);

  return opportunity;
}

export async function convertLeadToOpportunity(leadId: string) {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) throw new Error("Unauthorized");
  await requireApp(user.organizationId, "CRM");

  const lead = await prisma.lead.findUnique({
    where: { id: leadId, organizationId: user.organizationId }
  });
  if (!lead) throw new Error("Lead not found");

  const opportunity = await prisma.opportunity.create({
    data: {
      organizationId: user.organizationId,
      contactId: lead.contactId,
      name: lead.title,
      value: lead.estimatedValue,
      stage: "QUALIFICATION",
      ownerId: user.id
    }
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "QUALIFIED" }
  });

  revalidatePath("/crm");
  revalidatePath("/crm/leads");
  revalidatePath("/crm/opportunities");

  return opportunity.id;
}
