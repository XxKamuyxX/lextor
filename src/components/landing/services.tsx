const services = [
  {
    title: "Planejamento Patrimonial",
    description:
      "Estruturação de metas financeiras de curto, médio e longo prazo com acompanhamento contínuo.",
  },
  {
    title: "Gestão de Investimentos",
    description:
      "Alocação estratégica de ativos alinhada ao seu perfil de risco e objetivos de vida.",
  },
  {
    title: "Consultoria Empresarial",
    description:
      "Análise de fluxo de caixa, capital de giro e estratégias de crescimento sustentável.",
  },
];

export function LandingServices() {
  return (
    <section id="servicos" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Serviços
          </h2>
          <p id="sobre" className="mt-4 text-lg text-muted">
            Soluções sob medida para investidores individuais e empresas que
            buscam segurança e performance financeira.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-border bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 h-1 w-12 rounded-full bg-accent" />
              <h3 className="text-xl font-semibold text-foreground">
                {service.title}
              </h3>
              <p className="mt-3 text-muted leading-relaxed">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
