"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserShell } from "@/components/app/user-shell";
import { PassiveIncomeChart } from "@/components/dashboard/PassiveIncomeChart";
import { staggerContainer } from "@/components/dashboard/motion-variants";
import { authHeaders } from "@/lib/auth-fetch";
import { formatBRL } from "@/lib/cliente";
import { useClientePainel } from "@/hooks/useClientePainel";

function formatData(value) {
  if (!value) return "—";
  const raw = String(value);
  const date = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ClienteRendaPassivaPage() {
  const { loading, error, user, accessToken, nome } = useClientePainel();
  const [dividendos, setDividendos] = useState([]);
  const [listError, setListError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!accessToken) return;
      setListError(null);
      try {
        const res = await fetch("/api/cliente/dividendos", {
          credentials: "same-origin",
          headers: authHeaders(accessToken),
        });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          throw new Error(
            data.message || "Não foi possível carregar os proventos."
          );
        }
        if (!cancelled) setDividendos(data.dividendos ?? []);
      } catch (err) {
        if (!cancelled) {
          setListError(err?.message || "Erro ao carregar proventos.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

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

  const ordenados = [...dividendos].sort((a, b) =>
    String(b.data_pagamento || "").localeCompare(String(a.data_pagamento || ""))
  );

  return (
    <UserShell email={user?.email}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Renda Passiva</h1>
          <p className="mt-1 text-sm text-slate-400">
            Evolução dos proventos recebidos de {nome} — somente visualização
          </p>
        </div>

        {(error || listError) && (
          <p
            role="alert"
            className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {error || listError}
          </p>
        )}

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <PassiveIncomeChart accessToken={accessToken} />
        </motion.section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="border-b border-slate-800 px-6 py-3">
            <h2 className="text-sm font-semibold text-white">
              Histórico de proventos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Ticker</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {ordenados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Nenhum provento registrado ainda.
                    </td>
                  </tr>
                ) : (
                  ordenados.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-900/80">
                      <td className="px-6 py-3 tabular-nums text-slate-400">
                        {formatData(row.data_pagamento)}
                      </td>
                      <td className="px-6 py-3 font-medium text-white">
                        {row.ticker || "—"}
                      </td>
                      <td className="px-6 py-3 text-slate-300">
                        {row.tipo || "—"}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-sky-300">
                        {formatBRL(row.valor_total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </UserShell>
  );
}
