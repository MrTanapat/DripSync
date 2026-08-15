import HeroSection from "./_components/Section/HeroSection";
import { auth } from "~/server/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="bg-cream-50">
      <HeroSection session={session} />
    </main>
  );
}