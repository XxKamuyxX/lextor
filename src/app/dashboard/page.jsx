"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { summarizeAportes } from "@/lib/cliente";
import { UserShell } from "@/components/app/user-shell";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { CarteiraCharts } from "@/components/dashboard/carteira-charts";
import { BenchmarkComparison } from "@/components/dashboard/benchmark-comparison";
import { staggerContainer } from "@/components/dashboard/motion-variants";
import { useClientePainel } from "@/hooks/useClientePainel";

export default function DashboardPage() {
  const {
    loading,
    error,
    cliente,
    user,
    aportes,
    precosAtuais,
    accessToken,
    nome,
  } = useClientePainel();

  const summary = useMemo(
    () => summarizeAportes(aportes, precosAtuais),
    [aportes, precosAtuais]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <UserShell email={user?.email}>
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
            Resumo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Bem-vindo, {nome}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Perfil de suitability:{" "}
            <span className="font-medium text-sky-300">
              {cliente?.perfil_suitability}
            </span>
          </p>
        </motion.div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <motion.section
          className="grid gap-4 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <SummaryCard
            label="Patrimônio Total"
            value={summary.patrimonio}
            format="brl"
            hint="Cotações + marcação na curva (RF)"
          />
          <SummaryCard
            label="Rentabilidade"
            value={summary.rentabilidade}
            format="percent"
            hint="Patrimônio vs. capital aportado"
            accent={
              summary.rentabilidade >= 0 ? "text-emerald-400" : "text-red-400"
            }
          />
          <SummaryCard
            label="Total Aportado"
            value={summary.totalAportado}
            format="brl"
            hint="Soma dos aportes da carteira"
          />
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <BenchmarkComparison accessToken={accessToken} />
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <CarteiraCharts aportes={aportes} precos={precosAtuais} />
        </motion.section>
      </div>
    </UserShell>
  );
}
