"use server";
import prisma from "@/lib/platform/db";
import { getCurrentUser } from "@/lib/platform/auth/context";

export async function updateUserRole(userId: string, newRole: string) {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) {
    throw new Error('Unauthorized');
  }
  const currentMembership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: user.organizationId, userId: user.id } },
    include: { role: true }
  });
  if (currentMembership?.role?.name?.toUpperCase() !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  await prisma.user.update({
    where: { id: userId },
    data: { profession: newRole }
  });
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
}
