const steps = [
  {
    step: "01",
    title: "Diagnóstico & Suitability",
    description:
      "Mapeamento de perfil, objetivos, restrições e horizonte de investimento conforme práticas regulatórias.",
  },
  {
    step: "02",
    title: "Tese & Alocação",
    description:
      "Construção da estratégia por classes de ativos, com teses documentadas e alinhadas ao seu momento de vida.",
  },
  {
    step: "03",
    title: "Execução & Monitoramento",
    description:
      "Aportes registrados, cotações atualizadas e acompanhamento contínuo da evolução patrimonial.",
  },
  {
    step: "04",
    title: "Revisão Periódica",
    description:
      "Rebalanceamentos e ajustes táticos com base em mercado, metas e mudanças no seu contexto pessoal.",
  },
];

export function LandingMethodology() {
  return (
    <section id="metodologia" className="border-t border-white/5 bg-slate-950 px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
              Metodologia
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Processo consultivo estruturado, do primeiro contato ao longo
              prazo
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Cada etapa é desenhada para reduzir ruído, aumentar transparência
              e garantir que a carteira reflita quem você é como investidor.
            </p>
          </div>

          <ol className="space-y-6">
            {steps.map((item) => (
              <li
                key={item.step}
                className="flex gap-6 rounded-2xl border border-white/5 bg-black/40 p-6 transition hover:border-blue-500/20"
              >
                <span className="shrink-0 font-mono text-2xl font-bold text-blue-500/80">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
