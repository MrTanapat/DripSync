import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import BrewView from "./BrewView";

export default async function BrewPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  return <BrewView />;
}
