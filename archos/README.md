# ArchOS

ArchOS is an integrated platform for architectural and design studios, providing centralized management for CRM, Projects, and Financial Accounts.

## Features

- **Platform Core**: Multi-tenant architecture with Organizations, Memberships, Roles, and Entitlements.
- **Supabase Authentication**: Secure, SSR-based authentication integrated directly with Prisma.
- **CRM Module**: Manage Leads, Opportunities, and Pipelines.
- **Projects Module**: Track active projects and budgets.
- **Accounts Module**: Record expenses securely tied to specific projects and organizations.
- **Activity & Audit**: Comprehensive platform-wide event tracking.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Prisma + SQLite (local development)
- **Authentication**: Supabase Auth (SSR)
- **Styling**: Tailwind CSS

## Setup & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Authentication Flow & Security

ArchOS natively uses Supabase for Identity management while retaining business logic (Roles, Organizations, RBAC) in the local Prisma Database. 

- **Protected Routes**: An edge proxy (`src/proxy.ts`) ensures that unauthenticated users are redirected to `/login`, and authenticated users cannot access the `/login` page.
- **Provisioning**: First-time logins are automatically provisioned and securely mapped to a local Prisma `User` record via `supabaseUserId`.
- **Organization Switching**: Demo users are automatically granted access to "Acme Design Studio" and "Small Studio". Switching organizations scopes the user's view and dynamically alters their App Entitlements (e.g., Small Studio only has access to Projects).

## Development Notes
- The primary frontend is managed within `src/components/FigmaApp.tsx` utilizing a custom SPA shell rendered dynamically via Next.js Server Components.
