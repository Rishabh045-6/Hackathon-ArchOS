import { logout } from "../login/actions";
import { acceptInvitation } from "@/lib/platform/users/actions";
import { LogoMark } from "@/components/FigmaApp";
import { getCurrentUser } from "@/lib/platform/auth/context";
import prisma from "@/lib/platform/db";
import { redirect } from "next/navigation";

export default async function PendingRoute() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  
  if (!(user as any).profession) {
    redirect('/onboarding');
  }

  // If the user already has an active organization, they shouldn't be on the pending page
  if (user.organizationId) {
    redirect('/');
  }

  // Find all pending invitations for this user
  const invitations = await prisma.organizationMember.findMany({
    where: { userId: user.id, status: 'INVITED' },
    include: { organization: true, role: true }
  });

  return (
    <div className="flex bg-[#F5F3EF] h-screen items-center justify-center p-8" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <div className="bg-white p-12 max-w-[480px] w-full text-center border border-[#E5E1D9] shadow-sm">
        <div className="flex justify-center mb-6 text-[#B07245]">
          <LogoMark size={32} />
        </div>
        <h1 className="text-[24px] font-bold text-[#111] mb-2 tracking-tight">Your account has been confirmed.</h1>
        <p className="text-[14px] text-[#71717A] mb-8 leading-relaxed">
          You don't have access to an ArchOS workspace yet.<br/><br/>
          An organization administrator must invite you before you can access a workspace.
        </p>
        
        {invitations.length > 0 && (
          <div className="mb-8 text-left border border-[#E5E1D9] bg-[#FDFCFA] p-4">
            <h2 className="text-[14px] font-semibold text-[#111] mb-3">Pending Invitations</h2>
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-[#F5F2EC] last:border-0">
                <div>
                  <div className="text-[13px] font-medium text-[#1A1918]">{inv.organization.name}</div>
                  <div className="text-[11px] text-[#B0ABA5]">Role: {inv.role.name}</div>
                </div>
                <form action={async () => {
                  "use server";
                  await acceptInvitation(inv.organization.id);
                }}>
                  <button type="submit" className="bg-[#B07245] text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-[#965c34] transition-colors">
                    Accept
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={logout}>
          <button
            type="submit"
            className="bg-[#111] text-white px-6 py-2.5 text-[13px] font-medium hover:bg-[#27272A] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
