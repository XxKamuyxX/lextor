"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    question: "Como proteger meu patrimônio financeiro da inflação?",
    answer:
      "A proteção contra a inflação exige a alocação em ativos reais e indexadores de longo prazo. Estruturamos sua carteira com títulos de renda fixa atrelados à inflação (IPCA+) e ativos geradores de caixa, garantindo que o seu poder de compra não seja corroído pelo tempo.",
  },
  {
    question: "Recebi uma herança ou vendi um imóvel, o que fazer com o dinheiro?",
    answer:
      "O maior erro ao receber grandes injeções de capital é a descapitalização acelerada ou a pulverização sem estratégia. O foco deve ser o mapeamento imediato de liquidez e a transição gradual para uma carteira que gere renda passiva recorrente.",
  },
  {
    question: "Tenho R$ 100 mil para aplicar, por onde começo?",
    answer:
      "O primeiro passo não é escolher o produto financeiro, mas definir o objetivo. Na LEXTOR, alocamos o seu capital dividindo-o entre reserva de segurança, caixa para oportunidades e uma carteira de crescimento e renda de longo prazo, de forma estruturada.",
  },
  {
    question: "Como garantir uma renda segura na aposentadoria?",
    answer:
      "A aposentadoria não depende de idade, mas de acúmulo de capital. Desenhamos um planejamento focado na fase de acumulação agressiva (com ativos de crescimento) e planejamos a transição suave para a fase de usufruto (focada em proventos, dividendos e juros), garantindo que seu dinheiro trabalhe por você.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      id="faq"
      className="border-t border-white/5 bg-black px-6 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Perguntas Frequentes
        </motion.h2>

        <div className="mt-14 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-lg transition duration-300 hover:border-blue-700/30 hover:shadow-[0_0_30px_rgba(29,78,216,0.15)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-sans text-base font-semibold tracking-tight text-white sm:text-lg">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/5 text-lg text-blue-400"
                    aria-hidden
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 font-sans text-base leading-relaxed text-slate-300">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
