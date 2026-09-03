const steps = [
  {
    title: "Diagnóstico Profundo",
    text: "Uma reunião de alinhamento estratégico para mapear suas variáveis de vida, propósitos, disponibilidade de capital, medos e horizontes de tempo.",
  },
  {
    title: "Arquitetura Patrimonial",
    text: "Com base no diagnóstico, montamos um planejamento financeiro completo, compreendendo alocação, seguros e estruturação de longo prazo.",
  },
  {
    title: "Implementação e Blindagem",
    text: "Após a sua aprovação, executamos a estratégia com disciplina rigorosa, colocando cada pilar do seu patrimônio no lugar certo.",
  },
  {
    title: "Acompanhamento Premium e Tecnologia",
    text: "Entregamos relatórios contínuos e realizamos reuniões de revisão a cada 3 meses. Você recebe acesso vitalício a um Dashboard Exclusivo da LEXTOR para acompanhar seus rendimentos, evolução da renda passiva e benchmarks em tempo real, com total transparência.",
  },
];

export function MethodologySection() {
  return (
    <section id="metodologia" className="border-t border-white/5 bg-black px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          O caminho estruturado para a sua liberdade financeira
        </h2>

        <ol className="mt-16 space-y-10">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-200">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
