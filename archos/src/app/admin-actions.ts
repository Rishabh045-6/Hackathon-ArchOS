"use server";
import prisma from "@/lib/platform/db";
import { getCurrentUser } from "@/lib/platform/auth/context";

export async function updateUserRole(userId: string, newRole: string) {
  const user = await getCurrentUser();
  if (!user || user.email !== 'admin@archos.demo') {
    throw new Error('Unauthorized');
  }
  await prisma.user.update({
    where: { id: userId },
    data: { profession: newRole }
  });
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
}
