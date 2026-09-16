import { cache } from 'react';
import { cookies } from "next/headers";
import prisma from "../db";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

  if (!supabaseUser || error) {
    return null;
  }

  // Find or provision ArchOS user
  let archosUser = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseUserId: supabaseUser.id },
        { email: supabaseUser.email }
      ]
    }
  });

  if (archosUser && !archosUser.supabaseUserId) {
    // Link existing user by email
    archosUser = await prisma.user.update({
      where: { id: archosUser.id },
      data: { supabaseUserId: supabaseUser.id }
    });
  }

  if (!archosUser) {
    // Provision new user
    archosUser = await prisma.user.create({
      data: {
        supabaseUserId: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || "New User"
      }
    });

    // We no longer automatically add the user to Acme Design Studio or Small Studio
    // The user must be explicitly invited to an organization.
  }

  // Get current organization context
  const cookieStore = await cookies();
  let orgId = cookieStore.get("archos_org_id")?.value;

  // Validate organization membership
  if (orgId) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: archosUser.id
        }
      }
    });
    if (!member || member.status !== 'ACTIVE') {
      orgId = undefined; // Invalid org for this user
    }
  }

  if (!orgId) {
    // Fallback to first available org
    const firstMembership = await prisma.organizationMember.findFirst({
      where: { userId: archosUser.id, status: 'ACTIVE' }
    });
    if (firstMembership) {
      orgId = firstMembership.organizationId;
    }
  }

  return {
    ...archosUser,
    organizationId: orgId || null
  };
});

export async function currentOrganization() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) return null;
  
  return prisma.organization.findUnique({
    where: { id: user.organizationId }
  });
}
