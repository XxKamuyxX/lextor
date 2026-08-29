import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingServices } from "@/components/landing/services";
import { LandingFooter } from "@/components/landing/footer";
import { AuthCodeRedirect } from "@/components/auth-code-redirect";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthCodeRedirect />
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingServices />
        <section className="bg-primary px-6 py-20 text-primary-foreground">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Acesse a área de membros
            </h2>
            <p className="mt-4 text-lg text-sky-100">
              Conteúdos exclusivos, relatórios e ferramentas para acompanhar sua
              evolução financeira.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-sky-50"
            >
              Entrar na plataforma
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
