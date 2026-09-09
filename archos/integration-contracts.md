# ArchOS Platform Core Integration Contract

This document outlines the API boundaries and reusable modules provided by the Platform Core. Agent 2 (CRM) and Agent 3 (Projects & Accounts) should use these utilities instead of building their own.

## 1. Database Shared Models

The `prisma/schema.prisma` defines several core models that you should reference but not recreate:
- **Contact**: A shared client/contact model across all apps.
- **File**: A shared file storage metadata model.
- **Organization** & **User**: Core identity tables.

When creating app-specific tables (like `Lead` or `Project`), add relations to the existing `Contact` model:
```prisma
model Lead {
  id             String   @id @default(uuid())
  organizationId String
  contactId      String
  // Add other fields
}
```

## 2. Platform Utilities

Import utilities from `@/lib/platform` inside your Next.js route handlers or server actions.

### 2.1 Entitlements (App access control)
Every API route should check if the organization is entitled to use your app:
```typescript
import { requireApp } from '@/lib/platform';

// In an API route:
await requireApp(organizationId, "CRM"); 
```

### 2.2 RBAC (User permissions)
Check user permissions before performing actions:
```typescript
import { requirePermission } from '@/lib/platform';

// Check if user can write to projects:
await requirePermission(organizationId, userId, "PROJECTS.PROJECT.WRITE");
```

### 2.3 Shared Contacts & Files
```typescript
import { createContact, getContact, createFile } from '@/lib/platform';

const contact = await createContact({
  organizationId,
  name: "John Doe",
  email: "john@example.com",
});
```

### 2.4 Logging (Audit, Activities, Notifications)
Show the connected nature of the ecosystem by logging activities.
```typescript
import { createActivity, createAuditLog, createNotification } from '@/lib/platform';

// When a lead is converted:
await createActivity({
  organizationId,
  actorId: userId,
  type: "LEAD_CONVERTED",
  entityType: "Lead",
  entityId: lead.id,
  sourceApp: "CRM"
});
```

### 2.5 Event Bus
Use the local event bus to trigger actions in other apps without tightly coupling your code.
```typescript
import { platformEventBus } from '@/lib/platform';

// Agent 2 (CRM) publishes:
await platformEventBus.publish("OPPORTUNITY_WON", {
  opportunityId: opt.id,
  organizationId,
  contactId: opt.contactId,
  value: opt.value
});

// Agent 3 (Projects) subscribes (e.g., during app initialization or a dedicated worker):
platformEventBus.subscribe("OPPORTUNITY_WON", async (payload) => {
  // Auto-create a project
});
```
