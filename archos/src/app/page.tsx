import FigmaApp from "@/components/FigmaApp";
import { getFigmaAppState } from "./figma-actions";

export default async function Home() {
  const state = await getFigmaAppState();
  return <FigmaApp serverState={state} />;
}
