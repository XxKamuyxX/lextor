"use client";

import { useState } from "react";

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

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="border-t border-white/5 bg-black px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Perguntas Frequentes
        </h2>

        <div className="mt-14 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-white sm:text-lg">
                    {faq.question}
                  </span>
                  <span className="text-blue-400">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen ? (
                  <p className="pb-6 text-base leading-relaxed text-slate-200">
                    {faq.answer}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
