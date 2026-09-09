"use client";

import { motion } from "framer-motion";
import { formatBRL, formatTaxa, tickerDoAporte } from "@/lib/cliente";
import {
  calcularMarcacaoNaCurva,
  isRendaFixa,
} from "@/utils/calculosRendaFixa";
import { UserShell } from "@/components/app/user-shell";
import {
  staggerContainer,
  staggerItem,
} from "@/components/dashboard/motion-variants";
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

export default function ClienteCarteiraPage() {
  const { loading, error, user, aportes, precosAtuais } = useClientePainel();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando carteira...</p>
        </div>
      </div>
    );
  }

  return (
    <UserShell email={user?.email}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Carteira</h1>
          <p className="mt-1 text-sm text-slate-400">
            Seus ativos — ações/FIIs por cotação, renda fixa por marcação na
            curva
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

        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          <motion.div
            variants={staggerItem}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-sky-950/30"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Ticker / Nome</th>
                    <th className="px-6 py-3 font-medium">Quantidade</th>
                    <th className="px-6 py-3 font-medium">Preço médio</th>
                    <th className="px-6 py-3 font-medium">Preço / Saldo atual</th>
                    <th className="px-6 py-3 font-medium">Taxa (RF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {aportes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        Nenhum aporte encontrado para este cliente.
                      </td>
                    </tr>
                  ) : (
                    aportes.map((aporte) => {
                      const rf = isRendaFixa(aporte);
                      const ticker = tickerDoAporte(aporte);
                      const precoMedio = Number(
                        aporte.preco_medio ?? aporte.preco ?? 0
                      );
                      const valorAportado =
                        aporte.valor_aportado != null
                          ? Number(aporte.valor_aportado)
                          : precoMedio;

                      let precoOuSaldo = null;
                      if (rf) {
                        precoOuSaldo = calcularMarcacaoNaCurva(
                          valorAportado,
                          aporte.data_aporte ||
                            aporte.data ||
                            aporte.created_at,
                          aporte.taxa_contratada ?? aporte.taxa
                        );
                      } else if (ticker && precosAtuais[ticker] != null) {
                        precoOuSaldo = Number(precosAtuais[ticker]);
                      }

                      const taxaLabel = formatTaxa(aporte);
                      const vencimento = formatData(aporte.data_vencimento);

                      return (
                        <tr
                          key={aporte.id}
                          className="transition hover:bg-slate-900/80"
                        >
                          <td className="px-6 py-4 text-slate-300">
                            {aporte.tipo_ativo || aporte.tipo || "—"}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {aporte.ticker || aporte.ativo || aporte.nome || "—"}
                            {rf ? (
                              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                                {[
                                  aporte.indexador,
                                  taxaLabel !== "—" ? taxaLabel : null,
                                  vencimento !== "—"
                                    ? `Venc. ${vencimento}`
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            ) : aporte.nome &&
                              (aporte.ticker || aporte.ativo) ? (
                              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                                {aporte.nome}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-6 py-4 tabular-nums text-slate-300">
                            {rf
                              ? "—"
                              : Number(aporte.quantidade ?? 0).toLocaleString(
                                  "pt-BR"
                                )}
                          </td>
                          <td className="px-6 py-4 tabular-nums text-slate-300">
                            {formatBRL(rf ? valorAportado : precoMedio)}
                          </td>
                          <td className="px-6 py-4 tabular-nums text-sky-300">
                            {precoOuSaldo != null
                              ? formatBRL(precoOuSaldo)
                              : "—"}
                          </td>
                          <td className="px-6 py-4 tabular-nums text-sky-300">
                            {taxaLabel}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </UserShell>
  );
}
