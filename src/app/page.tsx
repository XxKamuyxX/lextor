import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingStats } from "@/components/landing/stats";
import { LandingServices } from "@/components/landing/services";
import { LandingMethodology } from "@/components/landing/methodology";
import { LandingAbout } from "@/components/landing/about";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";
import { AuthCodeRedirect } from "@/components/auth-code-redirect";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100">
      <AuthCodeRedirect />
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingStats />
        <LandingServices />
        <LandingMethodology />
        <LandingAbout />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
