import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Consultoria Financeira
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Decisões financeiras com clareza e estratégia
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Planejamento patrimonial, gestão de investimentos e orientação
            personalizada para construir e proteger seu patrimônio.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#servicos"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-sky-900"
            >
              Conheça os serviços
            </a>
            <Link
              href="/login"
              className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-50"
            >
              Acessar plataforma
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
