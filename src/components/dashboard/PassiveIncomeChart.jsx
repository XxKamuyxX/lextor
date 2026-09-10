"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { staggerItem } from "@/components/dashboard/motion-variants";
import { authHeaders } from "@/lib/auth-fetch";
import { formatBRL } from "@/lib/cliente";

/**
 * Agrupa dividendos por mês/ano da data_pagamento.
 * @param {Array<{ data_pagamento?: string; valor_total?: number }>} rows
 */
export function groupDividendosByMonth(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const raw = String(row.data_pagamento ?? "");
    if (!raw) continue;

    const date = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
    if (Number.isNaN(date.getTime())) continue;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "2-digit",
    }).format(date);

    const prev = map.get(key) ?? { key, label, total: 0 };
    prev.total += Number(row.valor_total) || 0;
    map.set(key, prev);
  }

  return [...map.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, total }) => ({
      mes: label.replace(/\.$/, ""),
      total,
      "Total recebido": total,
    }));
}

/**
 * Gráfico de renda passiva mensal (proventos agrupados por mês).
 *
 * @param {{
 *   clienteId?: string | null;
 *   accessToken?: string | null;
 *   refreshKey?: number | string;
 * }} props
 */
export function PassiveIncomeChart({
  clienteId = null,
  accessToken = null,
  refreshKey = 0,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dividendos, setDividendos] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = clienteId
        ? `/api/admin/clientes/${clienteId}/dividendos`
        : "/api/cliente/dividendos";

      const res = await fetch(url, {
        credentials: "same-origin",
        headers: clienteId ? undefined : authHeaders(accessToken),
      });
      const json = await res.json();

      if (!res.ok || json.ok === false) {
        throw new Error(
          json.message || "Não foi possível carregar a renda passiva."
        );
      }

      setDividendos(json.dividendos ?? []);
    } catch (err) {
      setError(err?.message || "Falha ao carregar dividendos.");
      setDividendos([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId, accessToken]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const series = useMemo(
    () => groupDividendosByMonth(dividendos),
    [dividendos]
  );

  const totalGeral = useMemo(
    () => dividendos.reduce((acc, row) => acc + (Number(row.valor_total) || 0), 0),
    [dividendos]
  );

  return (
    <motion.section
      variants={staggerItem}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Renda Passiva
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Proventos recebidos agrupados por mês de pagamento
          </p>
        </div>
        {!loading && dividendos.length > 0 ? (
          <p className="text-sm text-slate-400">
            Total acumulado:{" "}
            <span className="font-semibold tabular-nums text-white">
              {formatBRL(totalGeral)}
            </span>
          </p>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 flex h-64 items-center justify-center text-sm text-slate-500">
          Carregando renda passiva...
        </div>
      ) : series.length === 0 ? (
        <div className="mt-6 flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
          Nenhum provento registrado ainda.
        </div>
      ) : (
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  Number(v).toLocaleString("pt-BR", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  })
                }
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(148,163,184,0.08)" }}
                wrapperStyle={{ outline: "none", border: "none" }}
              />
              <Bar
                dataKey="Total recebido"
                fill="#1d4ed8"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.section>
  );
}
