import FigmaApp from "@/components/FigmaApp";
import { getFigmaAppState } from "./figma-actions";
import { getCurrentUser } from "@/lib/platform/auth/context";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  if (user && !(user as any).profession) {
    redirect('/onboarding');
  }
  if (user && !user.organizationId) {
    redirect('/pending');
  }

  const state = await getFigmaAppState();
  return <FigmaApp serverState={state} />;
}
