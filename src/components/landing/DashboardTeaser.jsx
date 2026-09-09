"use client";

import { motion } from "framer-motion";

const highlights = [
  "Rendimentos e evolução da renda passiva em tempo real",
  "Comparação direta com os principais benchmarks do mercado",
  "Histórico completo de aportes e teses de investimento",
];

const summaryCards = [
  {
    label: "Patrimônio Total",
    value: "R$ 4.270,00",
    hint: "Quantidade × último preço de cotação",
    accent: "text-white",
  },
  {
    label: "Rentabilidade",
    value: "+18,61%",
    hint: "Diferença entre preço médio e preço atual",
    accent: "text-emerald-400",
  },
  {
    label: "Total Aportado",
    value: "R$ 3.600,00",
    hint: "Soma dos aportes da carteira",
    accent: "text-white",
  },
];

const benchmarks = [
  { id: "cdi", label: "CDI", color: "#38bdf8", active: true },
  { id: "ibovespa", label: "Ibovespa", color: "#fbbf24", active: true },
  { id: "ipca", label: "Inflação (IPCA)", color: "#f472b6", active: true },
];

const periods = [
  { id: "1m", label: "1 mês", active: false },
  { id: "3m", label: "3 meses", active: false },
  { id: "6m", label: "6 meses", active: false },
  { id: "12m", label: "12 meses", active: true },
  { id: "ytd", label: "Ano atual", active: false },
];

const resumeCards = [
  { label: "Sua carteira", value: "+18,61%", accent: "text-emerald-400", highlight: true },
  { label: "CDI", value: "+12,40%", accent: "text-slate-200" },
  { label: "Ibovespa", value: "+8,15%", accent: "text-slate-200" },
  { label: "Inflação (IPCA)", value: "+4,20%", accent: "text-slate-200" },
];

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
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">
            Tecnologia Proprietária
          </p>
          <h2 className="mt-6 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            O controle absoluto do seu patrimônio na palma da mão
          </h2>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-slate-300">
            Cada cliente LEXTOR recebe acesso vitalício a um dashboard
            exclusivo, com transparência integral sobre alocação, rentabilidade
            e evolução da sua renda passiva.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span className="font-sans text-base leading-relaxed text-slate-300">
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
          aria-hidden
        >
          <div
            className="pointer-events-none absolute -inset-8 bg-[radial-gradient(ellipse_at_center,_rgba(29,78,216,0.18)_0%,_transparent_70%)]"
          />

          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0B1120] p-4 shadow-2xl shadow-blue-900/20 sm:p-5">
            {/* Cabeçalho do painel */}
            <div className="border-b border-slate-800/80 pb-4">
              <p className="font-sans text-[10px] font-medium uppercase tracking-widest text-sky-500">
                Área do Cliente
              </p>
              <div className="mt-1.5 flex flex-wrap items-end justify-between gap-2">
                <p className="font-sans text-lg font-bold tracking-tight text-white sm:text-xl">
                  Bem-vindo
                </p>
                <p className="font-sans text-xs text-slate-400">
                  Perfil:{" "}
                  <span className="font-medium text-sky-300">Arrojado</span>
                </p>
              </div>
            </div>

            {/* Cards de resumo */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-slate-700/50 bg-[#111827] p-4"
                >
                  <p className="font-sans text-xs font-medium text-slate-400">
                    {card.label}
                  </p>
                  <p
                    className={`mt-2 font-sans text-xl font-bold tracking-tight tabular-nums ${card.accent}`}
                  >
                    {card.value}
                  </p>
                  <p className="mt-1.5 font-sans text-[10px] leading-snug text-slate-500">
                    {card.hint}
                  </p>
                </div>
              ))}
            </div>

            {/* Gráfico vs benchmarks */}
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-sans text-sm font-semibold text-white">
                    Rentabilidade vs benchmarks
                  </p>
                  <p className="mt-0.5 font-sans text-[11px] text-slate-400">
                    Compare a evolução da carteira com CDI, Ibovespa e inflação.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {periods.map((period) => (
                    <span
                      key={period.id}
                      className={`rounded-full border px-2.5 py-1 font-sans text-[10px] font-medium ${
                        period.active
                          ? "border-sky-500 bg-sky-950/50 text-sky-200"
                          : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {period.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {benchmarks.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-950/60 px-2.5 py-1 font-sans text-[10px] font-medium text-slate-100"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {resumeCards.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border px-3 py-2 ${
                      item.highlight
                        ? "border-emerald-800/40 bg-emerald-950/20"
                        : "border-slate-800 bg-slate-950/40"
                    }`}
                  >
                    <p className="font-sans text-[10px] text-slate-400">
                      {item.label}
                    </p>
                    <p
                      className={`mt-0.5 font-sans text-sm font-semibold tabular-nums ${item.accent}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Gráfico simulado */}
              <div className="relative mt-4 h-40 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/50">
                {/* Grades horizontais */}
                <div className="absolute inset-x-3 inset-y-3 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-slate-800"
                    />
                  ))}
                </div>

                {/* Labels do eixo Y */}
                <div className="absolute inset-y-3 left-2 flex flex-col justify-between font-sans text-[9px] text-slate-600">
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
                </div>

                {/* Curvas SVG */}
                <svg
                  viewBox="0 0 400 160"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  {/* IPCA */}
                  <path
                    d="M 24 130 C 80 128, 140 122, 200 118 S 320 110, 380 105"
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                  {/* CDI */}
                  <path
                    d="M 24 128 C 90 120, 150 108, 220 95 S 320 78, 380 68"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.75"
                    opacity="0.85"
                  />
                  {/* Ibovespa */}
                  <path
                    d="M 24 125 C 70 118, 110 100, 160 108 S 250 90, 300 85 S 350 70, 380 78"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    opacity="0.75"
                  />
                  {/* Carteira (ascendente em destaque) */}
                  <path
                    d="M 24 126 C 80 118, 130 100, 180 82 S 280 48, 340 32 L 380 24"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="380" cy="24" r="3.5" fill="#34d399" />
                </svg>

                {/* Labels do eixo X */}
                <div className="absolute inset-x-8 bottom-1.5 flex justify-between font-sans text-[9px] text-slate-500">
                  <span>abr/25</span>
                  <span>jul/25</span>
                  <span>out/25</span>
                  <span>jan/26</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 font-sans text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded bg-emerald-400" />
                  Carteira
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded bg-sky-400" />
                  CDI
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded bg-amber-400" />
                  Ibovespa
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded bg-pink-400" />
                  IPCA
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
