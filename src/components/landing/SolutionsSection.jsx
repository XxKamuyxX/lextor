const solutions = [
  {
    title: "Planejamento Financeiro e de Investimentos",
    text: "Estratégia de alocação desenhada milimetricamente para o seu momento de vida, focada em mitigar riscos e otimizar retornos reais.",
  },
  {
    title: "Gestão de Riscos e Seguros",
    text: "Proteção robusta contra imprevistos que podem destruir décadas de trabalho em questão de dias.",
  },
  {
    title: "Planejamento Sucessório",
    text: "Transição inteligente e estruturação patrimonial para proteger as próximas gerações da sua família.",
  },
];

export function SolutionsSection() {
  return (
    <section id="solucoes" className="border-t border-white/5 bg-black px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Gestão Patrimonial 360º
        </h2>

        <div className="mt-16 space-y-12">
          {solutions.map((item, index) => (
            <div
              key={item.title}
              className="grid gap-4 border-l-2 border-blue-700 pl-6 md:grid-cols-[auto_1fr] md:gap-10"
            >
              <span className="text-sm font-semibold tracking-widest text-blue-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-200">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
