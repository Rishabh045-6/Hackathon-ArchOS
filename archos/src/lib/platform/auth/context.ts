import { cookies } from "next/headers";
import prisma from "../db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const orgId = cookieStore.get("archos_org_id")?.value || "org_acme";
  
  // Since this is a demo, we dynamically adjust the user based on the selected org
  if (orgId === "org_small") {
    return {
      id: "user_small_admin",
      name: "Small Studio Admin",
      email: "admin@smallstudio.com",
      organizationId: "org_small"
    };
  }

  return {
    id: "user_acme_admin",
    name: "Demo Admin",
    email: "admin@acmedesign.com",
    organizationId: "org_acme"
  };
}

export async function currentOrganization() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return prisma.organization.findUnique({
    where: { id: user.organizationId }
  });
}
