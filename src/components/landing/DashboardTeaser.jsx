"use client";

import { motion } from "framer-motion";

const highlights = [
  "Rendimentos e evolução da renda passiva em tempo real",
  "Comparação direta com os principais benchmarks do mercado",
  "Histórico completo de aportes e teses de investimento",
];

const bars = [38, 52, 46, 64, 58, 78, 71, 92];

export function DashboardTeaser() {
  return (
    <section
      id="tecnologia"
      className="border-t border-white/5 bg-black px-6 py-24 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">
            Tecnologia Proprietária
          </p>
          <h2 className="mt-6 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            O controle absoluto do seu patrimônio na palma da mão
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Cada cliente LEXTOR recebe acesso vitalício a um dashboard
            exclusivo, com transparência integral sobre alocação, rentabilidade
            e evolução da sua renda passiva.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span className="text-base leading-relaxed text-slate-200">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative"
        >
          <div
            className="pointer-events-none absolute -inset-8 bg-[radial-gradient(ellipse_at_center,_rgba(29,78,216,0.16)_0%,_transparent_70%)]"
            aria-hidden
          />

          <div className="relative rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-lg transition duration-300 hover:shadow-[0_0_30px_rgba(29,78,216,0.15)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600/60" />
              </div>
              <span className="rounded-full border border-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500">
                Dashboard LEXTOR
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-black/40 p-5">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Patrimônio total
                </p>
                <p className="mt-3 font-serif text-2xl font-semibold tracking-tight text-white">
                  R$ 1.284.500
                </p>
                <p className="mt-1 text-xs text-blue-400">
                  +14,2% em 12 meses
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-5">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Renda passiva
                </p>
                <p className="mt-3 font-serif text-2xl font-semibold tracking-tight text-white">
                  R$ 7.940
                </p>
                <p className="mt-1 text-xs text-slate-500">média mensal</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-black/40 p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Evolução patrimonial
                </p>
                <p className="text-[10px] uppercase tracking-widest text-blue-500">
                  vs. CDI
                </p>
              </div>

              <div className="mt-6 flex h-28 items-end gap-2">
                {bars.map((height, index) => (
                  <motion.span
                    key={index}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: 0.25 + index * 0.06,
                      ease: "easeOut",
                    }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-blue-900/40 to-blue-600"
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-black/40 px-5 py-4">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <span className="text-xs text-slate-400">
                Cotações atualizadas automaticamente
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
