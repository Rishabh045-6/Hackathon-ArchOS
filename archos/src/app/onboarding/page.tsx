import { LogoMark } from "@/components/FigmaApp";
import { getCurrentUser } from "@/lib/platform/auth/context";
import { redirect } from "next/navigation";
import prisma from "@/lib/platform/db";

export default async function OnboardingRoute() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // If already set, go to home
  // @ts-ignore
  if ((user as any).profession) {
    redirect('/');
  }

  async function submitRole(formData: FormData) {
    "use server";
    const role = formData.get("role") as string;
    const currentUser = await getCurrentUser();
    if (!currentUser) redirect('/login');
    
    // Security: Do not allow a normal user to change their role if already set
    if ((currentUser as any).profession) {
      throw new Error('Role is already set and cannot be changed.');
    }
    
    // @ts-ignore
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { profession: role }
    });
    
    redirect('/');
  }

  const options = [
    "Architect",
    "Interior Designer",
    "Project Manager",
    "Designer",
    "Sales",
    "Finance / Accounts",
    "Other"
  ];

  return (
    <div className="flex bg-[#F5F3EF] h-screen items-center justify-center p-8" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <div className="bg-white p-12 max-w-[480px] w-full text-center border border-[#E5E1D9] shadow-sm">
        <div className="flex justify-center mb-6 text-[#B07245]">
          <LogoMark size={32} />
        </div>
        <h1 className="text-[28px] font-medium text-[#1A1918] mb-2 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Welcome to ArchOS
        </h1>
        <p className="text-[14px] text-[#9E9A95] mb-8 leading-relaxed">
          Before we continue, tell us a bit about what you do.
        </p>

        <form action={submitRole} className="space-y-4">
          <div className="text-left space-y-2">
            <label className="block text-[12px] font-semibold text-[#1A1918] mb-4 uppercase tracking-wider">
              What best describes your role?
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {options.map(opt => (
                <label key={opt} className="flex items-center gap-3 p-3.5 border border-[#E5E1D9] hover:border-[#B07245] cursor-pointer transition-colors bg-[#FDFCFA]">
                  <input type="radio" name="role" value={opt} required className="w-4 h-4 text-[#B07245] border-[#E5E1D9] focus:ring-[#B07245]" />
                  <span className="text-[13px] font-medium text-[#1A1918]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-[#1A1918] text-white px-6 py-3.5 text-[13px] font-semibold hover:bg-[#B07245] transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
