import prisma from "./db";

type EventHandler = (payload: any) => void | Promise<void>;

class EventBus {
  private handlers: Record<string, EventHandler[]> = {};

  subscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
    return () => this.unsubscribe(eventType, handler);
  }

  unsubscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers[eventType]) return;
    this.handlers[eventType] = this.handlers[eventType].filter(h => h !== handler);
  }

  async publish(eventType: string, payload: any) {
    if (!this.handlers[eventType]) return;
    const promises = this.handlers[eventType].map(handler => handler(payload));
    await Promise.all(promises);
  }
}

export const platformEventBus = new EventBus();

// --- Hackathon Subscriptions ---
platformEventBus.subscribe("OPPORTUNITY_WON", async (payload: any) => {
  console.log("Processing OPPORTUNITY_WON event:", payload);
  const { opportunityId, organizationId, contactId, name, value } = payload;
  
  // Check idempotency (prevent duplicate projects)
  const existingProject = await prisma.project.findFirst({
    where: { sourceOpportunityId: opportunityId }
  });
  
  if (existingProject) {
    console.log(`Project already exists for opportunity ${opportunityId}`);
    return;
  }

  // Create Project
  const project = await prisma.project.create({
    data: {
      organizationId,
      clientId: contactId,
      sourceOpportunityId: opportunityId,
      name,
      budget: value,
      status: "ACTIVE"
    }
  });

  // Generate starter tasks
  const starterTasks = [
    "Initial Client Meeting",
    "Site Survey",
    "Design Brief",
    "Material Selection"
  ];

  for (const taskName of starterTasks) {
    await prisma.task.create({
      data: {
        organizationId,
        projectId: project.id,
        title: taskName,
        status: "TODO"
      }
    });
  }
  
  console.log(`Project ${project.id} and tasks created successfully.`);
});
