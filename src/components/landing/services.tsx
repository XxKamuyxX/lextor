const services = [
  {
    title: "Planejamento Patrimonial",
    description:
      "Estruturação de metas de curto, médio e longo prazo com alinhamento tributário, sucessório e de liquidez.",
    tag: "Estratégia",
  },
  {
    title: "Gestão de Carteira",
    description:
      "Alocação multiativos — renda fixa, variável, FIIs e internacional — calibrada ao seu perfil de risco.",
    tag: "Performance",
  },
  {
    title: "Consultoria Empresarial",
    description:
      "Capital de giro, tesouraria e expansão com visão financeira integrada ao ciclo do negócio.",
    tag: "Corporativo",
  },
  {
    title: "Relatórios & Cockpit",
    description:
      "Dashboard exclusivo com patrimônio, rentabilidade, teses de investimento e histórico de aportes.",
    tag: "Transparência",
  },
];

export function LandingServices() {
  return (
    <section id="servicos" className="bg-black px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
            Serviços
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Soluções completas para quem trata patrimônio com seriedade
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            Da definição de objetivos à execução da carteira, com processos
            claros, documentados e orientados por suitability regulatório.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-8 transition duration-300 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(37,99,235,0.08)]"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
              <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-300">
                {service.tag}
              </span>
              <h3 className="relative mt-5 text-xl font-semibold text-white">
                {service.title}
              </h3>
              <p className="relative mt-3 leading-relaxed text-slate-400">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
