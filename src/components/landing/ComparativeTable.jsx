"use client";

import { motion } from "framer-motion";

const traditionalMarket = [
  {
    title: "Conflito de Interesses",
    text: "Remuneração baseada em comissões ocultas sobre o que você compra.",
  },
  {
    title: "Foco na Instituição",
    text: "O objetivo é bater as metas de vendas de produtos do banco/corretora.",
  },
  {
    title: "Falsas Promessas",
    text: "Oferta de produtos da moda e promessas de rentabilidade rápida e irreal.",
  },
  {
    title: "Risco Assimétrico",
    text: "O cliente assume todo o risco do investimento, mas a instituição garante a taxa dela de qualquer forma.",
  },
];

const lextorStandard = [
  {
    title: "Alinhamento Absoluto",
    text: "Modelo transparente onde ganhamos um percentual sobre o patrimônio. Se você cresce, nós crescemos.",
  },
  {
    title: "Foco no Cliente",
    text: "O objetivo é exclusivamente a proteção e a multiplicação da sua riqueza.",
  },
  {
    title: "Estratégia Sólida",
    text: "Foco em preservação contra a inflação, segurança a longo prazo e geração de renda passiva.",
  },
  {
    title: "Parceria Real",
    text: "Só temos sucesso se a sua estratégia financeira for vitoriosa ao longo do tempo.",
  },
];

export function ComparativeTable() {
  return (
    <section
      id="comparativo"
      className="overflow-hidden border-t border-white/5 bg-[#0a0a0a] px-4 py-24 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          O Mercado Tradicional vs. O Padrão LEXTOR
        </motion.h2>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/5 bg-white/[0.015] p-6 sm:p-8"
          >
            <h3 className="font-sans text-xl font-semibold tracking-tight text-slate-300">
              O Mercado Tradicional
            </h3>
            <p className="mt-1 font-sans text-sm text-slate-400">
              Bancos e corretoras
            </p>

            <ul className="mt-8 space-y-6">
              {traditionalMarket.map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 0.75, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="flex gap-4"
                >
                  <span
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/5 text-slate-500"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6 6 18 18" />
                      <path d="M18 6 6 18" />
                    </svg>
                  </span>

                  <div>
                    <p className="font-sans font-medium text-slate-300">
                      {item.title}
                    </p>
                    <p className="mt-1.5 font-sans text-sm leading-relaxed text-slate-300">
                      {item.text}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-blue-700/40 bg-blue-950/10 p-6 shadow-[0_0_40px_rgba(29,78,216,0.15)] backdrop-blur-lg sm:p-8"
          >
            <h3 className="font-sans text-xl font-semibold tracking-tight text-white">
              O Padrão LEXTOR
            </h3>
            <p className="mt-1 font-sans text-sm text-blue-400">
              Consultoria sem conflito de interesses
            </p>

            <ul className="mt-8 space-y-6">
              {lextorStandard.map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="flex gap-4"
                >
                  <span
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-700/40 bg-blue-950/40 text-blue-300"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="m5 12.5 4.5 4.5L19 7" />
                    </svg>
                  </span>

                  <div>
                    <p className="font-sans font-medium text-white">
                      {item.title}
                    </p>
                    <p className="mt-1.5 font-sans text-sm leading-relaxed text-slate-300">
                      {item.text}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
