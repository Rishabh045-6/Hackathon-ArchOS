import { PrismaClient as SQLiteClient } from '@prisma/client-sqlite';
import { PrismaClient as PostgresClient } from '@prisma/client';

const sqlite = new SQLiteClient();
const pg = new PostgresClient();

async function main() {
  console.log("Starting migration from SQLite to Supabase Postgres...");

  // Now copy tables in dependency order
  // 1. Users
  console.log("Migrating Users...");
  const users = await sqlite.user.findMany();
  if (users.length > 0) await pg.user.createMany({ data: users, skipDuplicates: true });

  // 2. Organizations
  console.log("Migrating Organizations...");
  const organizations = await sqlite.organization.findMany();
  if (organizations.length > 0) await pg.organization.createMany({ data: organizations, skipDuplicates: true });

  // 3. Roles
  console.log("Migrating Roles...");
  const roles = await sqlite.role.findMany();
  if (roles.length > 0) await pg.role.createMany({ data: roles, skipDuplicates: true });

  // 4. RolePermissions
  console.log("Migrating RolePermissions...");
  const rolePermissions = await sqlite.rolePermission.findMany();
  if (rolePermissions.length > 0) await pg.rolePermission.createMany({ data: rolePermissions, skipDuplicates: true });

  // 5. OrganizationMembers
  console.log("Migrating OrganizationMembers...");
  const organizationMembers = await sqlite.organizationMember.findMany();
  if (organizationMembers.length > 0) await pg.organizationMember.createMany({ data: organizationMembers, skipDuplicates: true });

  // 6. AppEntitlements
  console.log("Migrating AppEntitlements...");
  const appEntitlements = await sqlite.appEntitlement.findMany();
  if (appEntitlements.length > 0) await pg.appEntitlement.createMany({ data: appEntitlements, skipDuplicates: true });

  // 7. Contacts
  console.log("Migrating Contacts...");
  const contacts = await sqlite.contact.findMany();
  if (contacts.length > 0) await pg.contact.createMany({ data: contacts, skipDuplicates: true });

  // 8. Leads
  console.log("Migrating Leads...");
  const leads = await sqlite.lead.findMany();
  if (leads.length > 0) await pg.lead.createMany({ data: leads, skipDuplicates: true });

  // 9. Opportunities
  console.log("Migrating Opportunities...");
  const opportunities = await sqlite.opportunity.findMany();
  if (opportunities.length > 0) await pg.opportunity.createMany({ data: opportunities, skipDuplicates: true });

  // 10. Projects
  console.log("Migrating Projects...");
  const projects = await sqlite.project.findMany();
  if (projects.length > 0) await pg.project.createMany({ data: projects, skipDuplicates: true });

  // 11. ProjectMembers
  console.log("Migrating ProjectMembers...");
  const projectMembers = await sqlite.projectMember.findMany();
  if (projectMembers.length > 0) await pg.projectMember.createMany({ data: projectMembers, skipDuplicates: true });

  // 12. Tasks
  console.log("Migrating Tasks...");
  const tasks = await sqlite.task.findMany();
  if (tasks.length > 0) await pg.task.createMany({ data: tasks, skipDuplicates: true });

  // 13. Expenses
  console.log("Migrating Expenses...");
  const expenses = await sqlite.expense.findMany();
  if (expenses.length > 0) await pg.expense.createMany({ data: expenses, skipDuplicates: true });

  // 14. Files
  console.log("Migrating Files...");
  const files = await sqlite.file.findMany();
  if (files.length > 0) await pg.file.createMany({ data: files, skipDuplicates: true });

  // 15. Notifications
  console.log("Migrating Notifications...");
  const notifications = await sqlite.notification.findMany();
  if (notifications.length > 0) await pg.notification.createMany({ data: notifications, skipDuplicates: true });

  // 16. AuditLogs
  console.log("Migrating AuditLogs...");
  const auditLogs = await sqlite.auditLog.findMany();
  if (auditLogs.length > 0) await pg.auditLog.createMany({ data: auditLogs, skipDuplicates: true });

  // 17. Activities
  console.log("Migrating Activities...");
  const activities = await sqlite.activity.findMany();
  if (activities.length > 0) await pg.activity.createMany({ data: activities, skipDuplicates: true });

  console.log("Migration Complete! Verify data below:");
  
  const models = [
    'user', 'organization', 'role', 'rolePermission', 'organizationMember',
    'appEntitlement', 'contact', 'lead', 'opportunity', 'project',
    'projectMember', 'task', 'expense', 'file', 'notification',
    'auditLog', 'activity'
  ];

  for (const model of models) {
    const sqliteCount = await (sqlite[model as keyof typeof sqlite] as any).count();
    const pgCount = await (pg[model as keyof typeof pg] as any).count();
    console.log(`${model} - SQLite: ${sqliteCount} | Postgres: ${pgCount}`);
  }
  
  // Specific checks
  const acme = await pg.organization.findUnique({ where: { id: 'org_acme' } });
  const small = await pg.organization.findUnique({ where: { id: 'org_small' } });
  const admin = await pg.user.findFirst({ where: { email: 'admin@archos.demo' } });
  const villa = await pg.project.findFirst({ where: { name: 'Luxury Villa' } });
  
  console.log(`Specific Checks:`);
  console.log(`Acme Design Studio exists: ${!!acme}`);
  console.log(`Small Studio exists: ${!!small}`);
  console.log(`admin@archos.demo exists: ${!!admin}`);
  console.log(`Luxury Villa project exists: ${!!villa}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await pg.$disconnect();
  });
