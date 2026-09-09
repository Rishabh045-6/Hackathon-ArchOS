# CRM Integration Contract

## 1. Cross-App Event: `OPPORTUNITY_WON`

When an Opportunity is marked as "WON" in the CRM module, it publishes the `OPPORTUNITY_WON` event via the Platform Core event bus.

### Event Name
`OPPORTUNITY_WON`

### Payload Schema

```json
{
  "opportunityId": "string",
  "organizationId": "string",
  "contactId": "string",
  "name": "string",     // Name of the opportunity (e.g. "Luxury Villa")
  "value": "number",    // Estimated value in the base currency
  "ownerId": "string"   // ID of the user who owns this opportunity
}
```

### Action Required by "Projects" Application

The Agent 1 / Projects module should listen for the `OPPORTUNITY_WON` event. Upon receiving it, the Projects module should automatically create a new Project using:
- **Project Name**: `payload.name`
- **Budget**: `payload.value`
- **Client/Contact ID**: `payload.contactId`
- **Organization ID**: `payload.organizationId`

## 2. Shared Platform Requirements

The CRM module depends on the following APIs from the Platform Core. Until they are fully implemented, mock adapters have been provided in `src/lib/platform-core/index.ts`.

### Authorization & Entitlements
- `getCurrentUser(): Promise<User | null>`
- `requireApp(appName: string): Promise<void>` (throws if not entitled)

### Shared Data
- `getContact(id: string): Promise<Contact | undefined>`
- `getContacts(organizationId: string): Promise<Contact[]>`

### Shared Infrastructure
- `publishEvent(eventName: string, payload: any): Promise<void>`
- `sendNotification(userId: string, message: string): Promise<void>`
- `logAudit(action: string, organizationId: string, actorId: string, entityType: string, entityId: string, metadata?: any): Promise<void>`
- `logActivity(message: string, sourceApp: string, organizationId: string): Promise<void>`

## 3. Running & Testing the CRM

1. Navigate to the project directory:
   ```bash
   cd archos
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`. You will be automatically redirected to `/crm`.
5. Testing the Primary Flow:
   - Go to **Pipeline** (`/crm/opportunities`).
   - Find the "Luxury Villa" opportunity in the "PROPOSAL" column.
   - Click **Mark as Won**.
   - Check the terminal console to see the mock Platform Core emitting the `OPPORTUNITY_WON` event, creating an Audit log, and sending a Notification.
