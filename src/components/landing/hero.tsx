"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/landing/logo";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-black px-6 pb-24 pt-16 sm:pb-32 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.18)_0%,_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">
            Consultoria de investimentos
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Patrimônio com visão{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              institucional
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Estratégia, governança e acompanhamento contínuo para investidores
            que exigem clareza, compliance e performance no longo prazo.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#servicos"
              className="inline-flex items-center rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-900/30 transition hover:bg-blue-500"
            >
              Conheça a ETR
            </a>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-slate-700 px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-white/5"
            >
              Acessar plataforma
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
            {[
              { label: "Foco", value: "Longo prazo" },
              { label: "Método", value: "Suitability" },
              { label: "Modelo", value: "Fee-based" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs uppercase tracking-widest text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-black p-10 shadow-2xl shadow-blue-950/20">
            <div
              className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-blue-500/20 to-transparent opacity-60"
              aria-hidden
            />
            <div className="relative flex flex-col items-center text-center">
              <Logo size="lg" showLink={false} />
              <p className="mt-8 max-w-xs text-sm leading-relaxed text-slate-400">
                Alocação estratégica, gestão de risco e relatórios
                patrimoniais para uma experiência de investimento de alto
                padrão.
              </p>
              <div className="mt-8 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-4 py-2 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Mercado monitorado em tempo real
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
