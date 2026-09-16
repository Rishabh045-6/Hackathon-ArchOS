"use server";

import prisma from "../db";
import { getCurrentUser } from "../auth/context";

import { revalidatePath } from "next/cache";

export async function inviteUser(email: string, profession: string, orgId: string) {
  const user = await getCurrentUser();
  if (!user || !orgId) throw new Error("Unauthorized");
  
  // Require ADMIN-level permission to invite users
  // We'll just check if they have the ADMIN role name for now, or check a generic permission if configured
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id
      }
    },
    include: { role: true }
  });
  
  if (member?.role.name?.toUpperCase() !== 'ADMIN') {
    throw new Error("Only administrators can invite users.");
  }

  // Find or create the user in ArchOS
  let targetUser = await prisma.user.findFirst({ where: { email } });
  const isExistingUser = !!targetUser;
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        profession
      }
    });
  } else {
    targetUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: { profession }
    });
  }

  // Find or create MEMBER role for this organization
  let orgRole = await prisma.role.findFirst({
    where: { organizationId: orgId, name: 'MEMBER' }
  });
  if (!orgRole) {
    orgRole = await prisma.role.create({
      data: { organizationId: orgId, name: 'MEMBER' }
    });
  }
  const roleId = orgRole.id;


  // If the user already existed (i.e. they signed up themselves), activate them directly. Otherwise INVITED.
  const finalStatus = isExistingUser ? 'ACTIVE' : 'INVITED';

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: targetUser.id
      }
    },
    update: {
      status: finalStatus,
      roleId
    },
    create: {
      organizationId: orgId,
      userId: targetUser.id,
      roleId,
      status: finalStatus
    }
  });

  // Check if we have the Service Role Key to actually send the email
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is missing. Cannot send real invitation emails.");
  }

  // Initialize Supabase Admin Client
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { headers } = await import('next/headers');
  const headersList = await headers();
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Send the real email via Supabase
  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback`
  });

  if (inviteError) {
    // If the user already exists in Supabase Auth, inviteUserByEmail might return an error.
    // In a production scenario with custom SMTP, you might send a standard "You've been added" email here instead.
    // For this MVP, if it fails because they exist, we just let it pass so they can log in normally.
    console.warn("Supabase invite error (user might already exist):", inviteError.message);
  } else {
    console.log(`Successfully sent real invitation email to ${email}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function acceptInvitation(organizationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id
      }
    }
  });

  if (!member || member.status !== 'INVITED') {
    throw new Error("No pending invitation found.");
  }

  await prisma.organizationMember.update({
    where: { id: member.id },
    data: { status: 'ACTIVE' }
  });

  const { cookies } = await import('next/headers');
  (await cookies()).set('archos_org_id', organizationId);

  revalidatePath("/");
  
  const { redirect } = await import('next/navigation');
  redirect("/");
}
