import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { PhilosophySection } from "@/components/landing/PhilosophySection";
import { TargetProfile } from "@/components/landing/TargetProfile";
import { Solutions } from "@/components/landing/Solutions";
import { DashboardTeaser } from "@/components/landing/DashboardTeaser";
import { Methodology } from "@/components/landing/Methodology";
import { Faq } from "@/components/landing/Faq";
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
        <TargetProfile />
        <Solutions />
        <DashboardTeaser />
        <Methodology />
        <Faq />
      </main>
      <LandingFooter />
    </div>
  );
}
