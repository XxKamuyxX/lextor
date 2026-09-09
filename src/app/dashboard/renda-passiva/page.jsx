"use client";

import { motion } from "framer-motion";
import { UserShell } from "@/components/app/user-shell";
import { PassiveIncomeChart } from "@/components/dashboard/PassiveIncomeChart";
import { staggerContainer } from "@/components/dashboard/motion-variants";
import { useClientePainel } from "@/hooks/useClientePainel";

export default function ClienteRendaPassivaPage() {
  const { loading, error, user, accessToken } = useClientePainel();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando renda passiva...</p>
        </div>
      </div>
    );
  }

  return (
    <UserShell email={user?.email}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Renda Passiva</h1>
          <p className="mt-1 text-sm text-slate-400">
            Evolução dos proventos recebidos — efeito bola de neve
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <PassiveIncomeChart accessToken={accessToken} />
        </motion.section>
      </div>
    </UserShell>
  );
}
