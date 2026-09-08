"use client";

import { motion } from "framer-motion";

const solutions = [
  {
    title: "Planejamento Financeiro e de Investimentos",
    text: "Estratégia de alocação desenhada milimetricamente para o seu momento de vida, focada em mitigar riscos e otimizar retornos reais.",
    icon: (
      <>
        <path d="M4 20V10" />
        <path d="M12 20V4" />
        <path d="M20 20v-7" />
      </>
    ),
  },
  {
    title: "Gestão de Riscos e Seguros",
    text: "Proteção robusta contra imprevistos que podem destruir décadas de trabalho em questão de dias.",
    icon: (
      <>
        <path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" />
        <path d="m9 12 2.2 2.2L15 10.5" />
      </>
    ),
  },
  {
    title: "Planejamento Sucessório",
    text: "Transição inteligente e estruturação patrimonial para proteger as próximas gerações da sua família.",
    icon: (
      <>
        <path d="M12 4v8" />
        <path d="M6 20v-3a6 6 0 0 1 12 0v3" />
        <circle cx="12" cy="19.5" r="0.5" />
        <path d="M8.5 7.5 12 4l3.5 3.5" />
      </>
    ),
  },
];

export function Solutions() {
  return (
    <section
      id="solucoes"
      className="border-t border-white/5 bg-[#0a0a0a] px-6 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Gestão Patrimonial 360º
        </motion.h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {solutions.map((solution, index) => (
            <motion.article
              key={solution.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-lg transition duration-300 hover:-translate-y-2 hover:border-blue-700/30 hover:shadow-[0_0_30px_rgba(29,78,216,0.15)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-blue-950/30 text-blue-400 transition group-hover:border-blue-700/40 group-hover:text-blue-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden
                >
                  {solution.icon}
                </svg>
              </span>

              <h3 className="mt-6 font-serif text-xl font-semibold tracking-tight text-white">
                {solution.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                {solution.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
