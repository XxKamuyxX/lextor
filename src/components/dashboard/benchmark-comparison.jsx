"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { staggerItem } from "@/components/dashboard/motion-variants";
import { authHeaders } from "@/lib/auth-fetch";
import {
  INDICADORES_BENCHMARK,
  PERIODOS_BENCHMARK,
} from "@/lib/benchmarks";
import { formatPercent } from "@/lib/cliente";

const CARTEIRA_COLOR = "#34d399";

/**
 * @param {{ accessToken?: string | null }} props
 */
export function BenchmarkComparison({ accessToken }) {
  const [periodo, setPeriodo] = useState("12m");
  const [indicadores, setIndicadores] = useState(["cdi", "ibovespa", "ipca"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const indicadoresParam = indicadores.join(",");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        periodo,
        indicadores: indicadoresParam,
      });
      const res = await fetch(`/api/cliente/benchmarks?${params}`, {
        credentials: "same-origin",
        headers: authHeaders(accessToken),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Não foi possível carregar os benchmarks.");
      }
      setData(json);
    } catch (err) {
      setError(err?.message || "Falha ao carregar comparação.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, periodo, indicadoresParam]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleIndicador(id) {
    setIndicadores((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  }

  const metaIndicadores = useMemo(
    () =>
      INDICADORES_BENCHMARK.filter((item) =>
        (data?.indicadores ?? indicadores).includes(item.id)
      ),
    [data?.indicadores, indicadores]
  );

  return (
    <motion.section
      variants={staggerItem}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Rentabilidade vs benchmarks
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Compare a evolução da carteira com CDI, Ibovespa e inflação (IPCA).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODOS_BENCHMARK.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriodo(item.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                periodo === item.id
                  ? "border-sky-500 bg-sky-950/50 text-sky-200"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {INDICADORES_BENCHMARK.map((item) => {
          const active = indicadores.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleIndicador(item.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-slate-600 bg-slate-950/60 text-slate-100"
                  : "border-slate-800 text-slate-500 hover:border-slate-600"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? item.color : "#475569" }}
              />
              {item.label}
            </button>
          );
        })}
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
          Carregando comparação...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3">
              <p className="text-xs text-slate-400">Sua carteira</p>
              <p
                className={`mt-1 text-lg font-semibold tabular-nums ${
                  (data?.resumo?.carteira ?? 0) >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatPercent(data?.resumo?.carteira ?? 0)}
              </p>
            </div>
            {metaIndicadores.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3"
              >
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-slate-200">
                  {formatPercent(data?.resumo?.[item.id] ?? 0)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 h-72">
            {data?.series?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.series}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={{ stroke: "#1e293b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => `${Number(v).toFixed(0)}`}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    wrapperStyle={{ outline: "none", border: "none" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="carteira"
                    name="Carteira"
                    stroke={CARTEIRA_COLOR}
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls
                  />
                  {metaIndicadores.map((item) => (
                    <Line
                      key={item.id}
                      type="monotone"
                      dataKey={item.id}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
                Sem dados suficientes para o período selecionado.
              </div>
            )}
          </div>
        </>
      )}
    </motion.section>
  );
}
