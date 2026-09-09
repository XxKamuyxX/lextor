"use client";

import { motion } from "framer-motion";

const paragraphs = [
  "Durante anos, observei pessoas que dedicaram uma vida inteira aos seus negócios e carreiras perderem dinheiro e oportunidades simplesmente porque confiaram na pessoa errada.",
  "O mercado financeiro tradicional foi desenhado para proteger a instituição, não você. Gerentes de banco e agentes comissionados não são pagos para multiplicar o seu patrimônio; eles são pagos para bater metas de vendas, empurrando os produtos que geram as maiores taxas ocultas para eles, enquanto você assume todo o risco. Esse conflito de interesses é a “taxa invisível” que corrói a sua riqueza.",
  "Foi essa indignação que me fez fundar a LEXTOR. Construí esta consultoria para ser uma fortaleza onde sentamos do mesmo lado da mesa que o cliente. Sem comissões ocultas, sem produtos da moda, sem conflito de interesses. A nossa única meta é a preservação absoluta do seu capital e a construção de uma renda passiva inabalável. O nosso sucesso está matematicamente atrelado ao seu.",
  "Seja bem-vindo a um novo padrão de inteligência financeira.",
];

export function FounderManifesto() {
  return (
    <section
      id="manifesto"
      className="border-t border-white/5 bg-[#050505] px-6 py-24 sm:py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-3xl"
      >
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-slate-400">
          Manifesto do fundador
        </p>

        <h2 className="mt-6 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Uma carta aberta sobre o seu patrimônio
        </h2>

        <span
          className="mt-8 block h-px w-24 bg-gradient-to-r from-blue-700/60 to-transparent"
          aria-hidden
        />

        <div className="mt-10 space-y-6 font-sans text-lg leading-relaxed text-slate-300">
          {paragraphs.map((paragraph, index) => (
            <motion.p
              key={paragraph.slice(0, 32)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-12 border-t border-white/5 pt-8"
        >
          <p className="font-sans text-2xl font-medium text-white">Alex Dantas</p>
          <p className="mt-1 font-sans text-sm uppercase tracking-widest text-blue-400">
            Fundador
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
