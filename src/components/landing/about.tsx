import { Logo } from "@/components/landing/logo";

const pillars = [
  {
    title: "Compliance & Transparência",
    text: "Termos, suitability e registros de preferências documentados em ambiente seguro.",
  },
  {
    title: "Visão Institucional",
    text: "Relatórios, métricas de rentabilidade e composição de carteira com padrão profissional.",
  },
  {
    title: "Relacionamento Próximo",
    text: "Consultoria dedicada, com linguagem clara e foco no que importa para o seu patrimônio.",
  },
];

export function LandingAbout() {
  return (
    <section id="sobre" className="bg-black px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
              Sobre a ETR
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Investimentos conduzidos com rigor, discrição e visão de longo
              prazo
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              A ETR nasce da convicção de que patrimônio exige método — não
              improviso. Unimos análise, governança e tecnologia para entregar
              uma experiência digna de investidores exigentes.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Nossa plataforma integra onboarding regulatório, mapeamento de
              teses, cockpit consultivo e acompanhamento patrimonial em tempo
              real.
            </p>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-black p-12">
              <Logo size="lg" showLink={false} />
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-white/10 bg-slate-950/50 p-8"
            >
              <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
