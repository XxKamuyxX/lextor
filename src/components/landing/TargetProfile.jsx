"use client";

import { motion } from "framer-motion";

const blocks = [
  {
    title: "O Seu Perfil",
    text: "Desenhado para profissionais, executivos e empresários com renda superior a R$ 15.000 mensais ou capital disponível para alocação a partir de R$ 100.000.",
  },
  {
    title: "O Seu Desafio",
    text: "Você sabe que dinheiro parado é corroído pela inflação, mas não tem tempo para decifrar o mercado. Está exausto das altas taxas dos grandes bancos e do conflito de interesses de profissionais que trabalham para as instituições, e não para o seu bolso.",
  },
  {
    title: "A Solução LEXTOR",
    text: "Operamos em um modelo transparente e sem comissões ocultas. Não recebemos para empurrar produtos financeiros. Nosso ganho é atrelado exclusivamente ao volume e ao sucesso do seu patrimônio. Se você cresce, nós crescemos. Suas vitórias são as nossas vitórias.",
  },
];

export function TargetProfile() {
  return (
    <section
      id="para-quem"
      className="border-t border-white/5 bg-black px-6 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Exclusividade e Alinhamento Real de Interesses
        </motion.h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {blocks.map((block, index) => (
            <motion.article
              key={block.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-lg transition duration-300 hover:border-blue-700/30 hover:shadow-[0_0_30px_rgba(29,78,216,0.15)]"
            >
              <h3 className="font-sans text-lg font-semibold tracking-tight text-blue-400">
                {block.title}
              </h3>
              <p className="mt-4 font-sans text-base leading-relaxed text-slate-300">
                {block.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
