"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { formatBRL } from "@/lib/cliente";
import {
  staggerContainer,
  staggerItem,
} from "@/components/dashboard/motion-variants";

const LIMITE_ISENCAO = 20000;
const LIMITE_ALERTA = 15000;

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

function mesAnoKey(value) {
  const raw = String(value || "");
  if (!raw) return null;
  const date = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(key) {
  if (!key) return "—";
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Visão fiscal compartilhada (admin e cliente).
 *
 * @param {{
 *   cliente?: object | null;
 *   vendas?: Array;
 *   emptyHint?: string;
 * }} props
 */
export function FiscalOverview({
  cliente = null,
  vendas = [],
  emptyHint = "Nenhuma venda registrada.",
}) {
  const agora = new Date();
  const mesAtualKey = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;

  const volumeAcoesMes = useMemo(() => {
    return vendas.reduce((acc, venda) => {
      if (String(venda.tipo || "").toLowerCase() !== "ação") return acc;
      if (mesAnoKey(venda.data_venda) !== mesAtualKey) return acc;
      const valor =
        venda.valor_venda != null
          ? Number(venda.valor_venda)
          : Number(venda.preco_venda || 0) * Number(venda.quantidade || 0);
      return acc + (Number.isFinite(valor) ? valor : 0);
    }, 0);
  }, [vendas, mesAtualKey]);

  const progressoIsencao = Math.min(
    100,
    (volumeAcoesMes / LIMITE_ISENCAO) * 100
  );

  const corBarra =
    volumeAcoesMes >= LIMITE_ISENCAO
      ? "bg-rose-500"
      : volumeAcoesMes >= LIMITE_ALERTA
        ? "bg-amber-400"
        : "bg-emerald-500";

  const ultrapassou = volumeAcoesMes >= LIMITE_ISENCAO;

  const prejuizosAcumulados = useMemo(() => {
    const manual = Number(cliente?.prejuizos_acumulados);
    if (Number.isFinite(manual) && manual !== 0) {
      return manual < 0 ? manual : -Math.abs(manual);
    }

    const ordenadas = [...vendas].sort((a, b) =>
      String(a.data_venda || "").localeCompare(String(b.data_venda || ""))
    );
    let saldo = 0;
    for (const venda of ordenadas) {
      const lucro = Number(venda.lucro);
      if (!Number.isFinite(lucro)) continue;
      saldo += lucro;
      if (saldo > 0) saldo = 0;
    }
    return saldo;
  }, [cliente, vendas]);

  const historicoMensal = useMemo(() => {
    const map = new Map();

    for (const venda of vendas) {
      const key = mesAnoKey(venda.data_venda);
      if (!key) continue;
      const prev = map.get(key) || {
        key,
        volume: 0,
        lucroComuns: 0,
        lucroFiis: 0,
        operacoes: 0,
      };
      const valor =
        venda.valor_venda != null
          ? Number(venda.valor_venda)
          : Number(venda.preco_venda || 0) * Number(venda.quantidade || 0);
      const lucro = Number(venda.lucro) || 0;
      const tipo = String(venda.tipo || "").toLowerCase();

      prev.volume += Number.isFinite(valor) ? valor : 0;
      prev.operacoes += 1;
      if (tipo.includes("fii")) prev.lucroFiis += lucro;
      else prev.lucroComuns += lucro;
      map.set(key, prev);
    }

    return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
  }, [vendas]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Monitoramento Mensal
        </h2>

        <motion.div
          className="grid gap-4 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.article
            variants={staggerItem}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20 lg:col-span-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Termômetro de Isenção (Ações) — Mês Atual
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Soma de preço de venda × quantidade das vendas de Ação no mês
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Limite: {formatBRL(LIMITE_ISENCAO)}
              </p>
            </div>

            <p className="mt-6 text-3xl font-bold tabular-nums text-white">
              {formatBRL(volumeAcoesMes)}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {progressoIsencao.toFixed(1)}% do limite de isenção mensal
            </p>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${corBarra}`}
                style={{ width: `${progressoIsencao}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-slate-600">
              <span>0</span>
              <span className="text-amber-500/80">R$ 15 mil</span>
              <span className="text-rose-500/80">R$ 20 mil</span>
            </div>

            {ultrapassou ? (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-rose-700/50 bg-rose-950/40 px-3 py-2.5 text-sm text-rose-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Limite de Isenção Ultrapassado. DARF de 15% sobre o lucro
                aplicável.
              </p>
            ) : volumeAcoesMes >= LIMITE_ALERTA ? (
              <p className="mt-4 rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 py-2.5 text-sm text-amber-200">
                Atenção: próximo do limite de R$ 20.000. Avalie novas vendas no
                mês.
              </p>
            ) : (
              <p className="mt-4 text-sm text-emerald-400/90">
                Dentro da faixa de isenção para operações comuns com ações.
              </p>
            )}
          </motion.article>

          <div className="flex flex-col gap-4">
            <motion.article
              variants={staggerItem}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Prejuízos Acumulados a Compensar
              </p>
              <p className="mt-3 text-2xl font-bold tabular-nums text-slate-300">
                {formatBRL(prejuizosAcumulados)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Saldo negativo disponível para abater de lucros futuros em
                operações comuns.
              </p>
            </motion.article>

            <motion.article
              variants={staggerItem}
              className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500/90">
                Atenção FIIs
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Lembrete: Vendas de FIIs e ETFs não possuem isenção dos 20 mil.
                Alíquota de 20% e 15% respectivamente.
              </p>
            </motion.article>
          </div>
        </motion.div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Histórico de DARFs e Lucros
        </h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Mês</th>
                  <th className="px-6 py-3.5 font-medium">Operações</th>
                  <th className="px-6 py-3.5 font-medium">Volume</th>
                  <th className="px-6 py-3.5 font-medium">Lucro Comuns</th>
                  <th className="px-6 py-3.5 font-medium">Lucro FIIs</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {historicoMensal.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      {emptyHint}
                    </td>
                  </tr>
                ) : (
                  historicoMensal.map((row) => {
                    const precisaDarfComuns =
                      row.key === mesAtualKey
                        ? volumeAcoesMes >= LIMITE_ISENCAO &&
                          row.lucroComuns > 0
                        : row.lucroComuns > 0;
                    const precisaDarfFii = row.lucroFiis > 0;

                    return (
                      <tr
                        key={row.key}
                        className="transition hover:bg-slate-900/80"
                      >
                        <td className="px-6 py-4 capitalize text-white">
                          {labelMes(row.key)}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-slate-300">
                          {row.operacoes}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-slate-300">
                          {formatBRL(row.volume)}
                        </td>
                        <td
                          className={`px-6 py-4 tabular-nums ${
                            row.lucroComuns >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatBRL(row.lucroComuns)}
                        </td>
                        <td
                          className={`px-6 py-4 tabular-nums ${
                            row.lucroFiis >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatBRL(row.lucroFiis)}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {precisaDarfFii || precisaDarfComuns ? (
                            <span className="rounded-full border border-rose-700/50 bg-rose-950/40 px-2.5 py-1 text-rose-300">
                              Verificar DARF
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-800/40 bg-emerald-950/30 px-2.5 py-1 text-emerald-400">
                              Sem DARF aparente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {vendas.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="border-b border-slate-800 px-6 py-3">
              <h3 className="text-sm font-semibold text-white">
                Últimas operações
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Data</th>
                    <th className="px-6 py-3 font-medium">Ticker</th>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Qtd</th>
                    <th className="px-6 py-3 font-medium">Preço</th>
                    <th className="px-6 py-3 font-medium">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vendas.slice(0, 12).map((venda) => (
                    <tr key={venda.id}>
                      <td className="px-6 py-3 tabular-nums text-slate-400">
                        {formatData(venda.data_venda)}
                      </td>
                      <td className="px-6 py-3 font-medium text-white">
                        {venda.ticker}
                      </td>
                      <td className="px-6 py-3 text-slate-300">{venda.tipo}</td>
                      <td className="px-6 py-3 tabular-nums text-slate-300">
                        {Number(venda.quantidade || 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-3 tabular-nums text-slate-300">
                        {formatBRL(venda.preco_venda)}
                      </td>
                      <td
                        className={`px-6 py-3 tabular-nums ${
                          Number(venda.lucro) >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {venda.lucro != null ? formatBRL(venda.lucro) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
