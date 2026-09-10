"use client";

import { motion } from "framer-motion";

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
    text: "Entregamos relatórios contínuos e realizamos reuniões de revisão a cada 3 meses. Enquanto você for nosso cliente, tem acesso a um Dashboard Exclusivo da LEXTOR para acompanhar seus rendimentos, evolução da renda passiva e benchmarks em tempo real, com total transparência.",
  },
];

export function Methodology() {
  return (
    <section
      id="metodologia"
      className="overflow-hidden border-t border-white/5 bg-[#0a0a0a] px-4 py-24 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          O caminho estruturado para a sua liberdade financeira
        </motion.h2>

        <ol className="relative mt-16 space-y-10 pl-1 sm:pl-4">
          <span
            className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-blue-700/40 via-white/10 to-transparent sm:left-[27px]"
            aria-hidden
          />

          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="relative flex gap-3 sm:gap-6"
            >
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-700/40 bg-blue-950/40 font-sans text-sm font-semibold text-blue-300 backdrop-blur-lg sm:h-12 sm:w-12 sm:text-base">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-lg transition duration-300 hover:border-blue-700/30 hover:shadow-[0_0_30px_rgba(29,78,216,0.15)] sm:p-6">
                <h3 className="font-sans text-xl font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-3 font-sans text-base leading-relaxed text-slate-300">
                  {step.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
