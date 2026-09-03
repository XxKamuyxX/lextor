"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-black px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(29,78,216,0.22)_0%,_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500"
        >
          LEXTOR
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          O seu trabalho constrói a sua riqueza.{" "}
          <span className="text-blue-400">
            A LEXTOR protege e multiplica o seu patrimônio.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-slate-200 sm:text-xl"
        >
          Consultoria patrimonial exclusiva e sem conflito de interesses.
          Estruturamos a sua transição para viver de renda, blindamos seu
          capital contra a inflação e organizamos o seu futuro financeiro com
          clareza institucional.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-12"
        >
          <a
            href="mailto:contato@alexjdantas.com?subject=Agendar%20Sess%C3%A3o%20de%20Alinhamento"
            className="inline-flex items-center rounded-full bg-blue-700 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-950/40 transition hover:bg-blue-800"
          >
            Agendar Sessão de Alinhamento
          </a>
        </motion.div>
      </div>
    </section>
  );
}
