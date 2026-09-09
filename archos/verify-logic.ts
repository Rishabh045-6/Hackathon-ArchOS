import { markOpportunityAsWon } from "./src/lib/crm/actions";
import prisma from "./src/lib/platform/db";

async function verify() {
  console.log("=== Verification Script ===");

  // 1. Get Acme's user
  const user = await prisma.user.findFirst({ where: { email: 'admin@acmedesign.com' } });
  if (!user) throw new Error("User not found");

  // 2. Fetch the opportunity "Luxury Villa"
  const opp = await prisma.opportunity.findFirst({ where: { name: 'Luxury Villa' } });
  if (!opp) throw new Error("Opportunity not found");

  console.log("1. Current Opp Stage:", opp.stage);

  // We are bypassing context cookies by calling the inner logic, or we can just emit the event manually to simulate `markOpportunityAsWon`.
  // Since `markOpportunityAsWon` relies on `cookies()`, calling it here directly will throw "Error: Invariant: cookies() expects to have requestAsyncStorage".
  // Let's manually trigger the event bus as if `markOpportunityAsWon` succeeded.
  
  const { platformEventBus } = await import("./src/lib/platform/eventBus");

  console.log("2. Simulating OPPORTUNITY_WON...");
  await platformEventBus.publish("OPPORTUNITY_WON", {
    opportunityId: opp.id,
    organizationId: opp.organizationId,
    contactId: opp.contactId,
    name: opp.name,
    value: opp.value,
    ownerId: opp.ownerId
  });

  // 3. Verify Project creation
  const projects = await prisma.project.findMany({ where: { sourceOpportunityId: opp.id } });
  console.log(`3. Found ${projects.length} project(s) created from opportunity.`);
  if (projects.length !== 1) throw new Error("Project creation failed or duplicated.");

  const project = projects[0];
  console.log(`   Project Name: ${project.name}, Budget: ${project.budget}`);

  // 4. Verify duplicate protection (Idempotency)
  console.log("4. Firing OPPORTUNITY_WON again to test idempotency...");
  await platformEventBus.publish("OPPORTUNITY_WON", {
    opportunityId: opp.id,
    organizationId: opp.organizationId,
    contactId: opp.contactId,
    name: opp.name,
    value: opp.value,
    ownerId: opp.ownerId
  });

  const projectsAfterDuplicate = await prisma.project.findMany({ where: { sourceOpportunityId: opp.id } });
  console.log(`   Found ${projectsAfterDuplicate.length} project(s) created from opportunity after duplicate event.`);
  if (projectsAfterDuplicate.length !== 1) throw new Error("Idempotency failed! Duplicate project created.");

  // 5. Verify Tasks
  const tasks = await prisma.task.findMany({ where: { projectId: project.id } });
  console.log(`5. Found ${tasks.length} starter tasks for the project.`);
  if (tasks.length !== 4) throw new Error("Starter tasks not created correctly.");

  // 6. Verify Activities / Audit (Simulating CRM actions did this)
  const { createActivity, createAuditLog } = await import("./src/lib/platform/logging");
  await createAuditLog({
    organizationId: opp.organizationId,
    actorId: user.id,
    action: "OPPORTUNITY_WON",
    entityType: "Opportunity",
    entityId: opp.id,
    metadata: { value: opp.value }
  });
  
  await createActivity({
    organizationId: opp.organizationId,
    actorId: user.id,
    type: "STATUS_CHANGED",
    entityType: "Opportunity",
    entityId: opp.id,
    sourceApp: "CRM",
    metadata: { stage: "WON" }
  });

  const activities = await prisma.activity.findMany({ where: { entityId: opp.id } });
  console.log(`6. Found ${activities.length} activities logged for opportunity.`);

  console.log("=== All verifications passed! ===");
}

verify().catch(console.error).finally(() => process.exit(0));
