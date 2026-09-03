import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { PhilosophySection } from "@/components/landing/PhilosophySection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { SolutionsSection } from "@/components/landing/SolutionsSection";
import { MethodologySection } from "@/components/landing/MethodologySection";
import { FaqSection } from "@/components/landing/FaqSection";
import { AuthCodeRedirect } from "@/components/auth-code-redirect";

// Evita HTML estático desatualizado após deploy (causava CSS 404 na Hostinger).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <AuthCodeRedirect />
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <PhilosophySection />
        <AudienceSection />
        <SolutionsSection />
        <MethodologySection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
