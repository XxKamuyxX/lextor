import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { PhilosophySection } from "@/components/landing/PhilosophySection";
import { FounderManifesto } from "@/components/landing/FounderManifesto";
import { ComparativeTable } from "@/components/landing/ComparativeTable";
import { TargetProfile } from "@/components/landing/TargetProfile";
import { Solutions } from "@/components/landing/Solutions";
import { DashboardTeaser } from "@/components/landing/DashboardTeaser";
import { Methodology } from "@/components/landing/Methodology";
import { Faq } from "@/components/landing/Faq";
import { SecurityProtocol } from "@/components/landing/SecurityProtocol";
import { AuthCodeRedirect } from "@/components/auth-code-redirect";
import { AgendarProvider } from "@/components/landing/AgendarModal";

// Evita HTML estático / CDN desatualizado após deploy (Hostinger).
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function HomePage() {
  return (
    <AgendarProvider>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-black text-white">
        <AuthCodeRedirect />
        <LandingHeader />
        <main className="flex-1">
          <HeroSection />
          <PhilosophySection />
          <FounderManifesto />
          <ComparativeTable />
          <TargetProfile />
          <Solutions />
          <DashboardTeaser />
          <Methodology />
          <Faq />
          <SecurityProtocol />
        </main>
        <LandingFooter />
      </div>
    </AgendarProvider>
  );
}
