"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { staggerItem } from "@/components/dashboard/motion-variants";
import { formatBRL, tickerDoAporte } from "@/lib/cliente";

const COLORS = [
  "#38bdf8",
  "#34d399",
  "#a78bfa",
  "#fbbf24",
  "#f472b6",
  "#2dd4bf",
  "#fb7185",
  "#94a3b8",
];

/**
 * @param {{ aportes: Array; precos?: Record<string, number> }} props
 */
export function CarteiraCharts({ aportes = [], precos = {} }) {
  const { alocacao, porTipo } = useMemo(() => {
    const alocMap = new Map();
    const tipoMap = new Map();

    for (const a of aportes) {
      const ticker = tickerDoAporte(a) || a.ticker || a.ativo || "Outros";
      const qtd = Number(a.quantidade ?? 0);
      const precoMedio = Number(a.preco_medio ?? a.preco ?? 0);
      const precoAtual =
        a.preco_atual != null
          ? Number(a.preco_atual)
          : ticker && precos[ticker] != null
            ? Number(precos[ticker])
            : precoMedio;
      const valor =
        a.valor_atual != null ? Number(a.valor_atual) : qtd * precoAtual;

      if (valor <= 0) continue;

      alocMap.set(ticker, (alocMap.get(ticker) || 0) + valor);

      const tipo = a.tipo_ativo || a.tipo || "Outros";
      tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + valor);
    }

    const alocacao = [...alocMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const porTipo = [...tipoMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { alocacao, porTipo };
  }, [aportes, precos]);

  if (aportes.length === 0) {
    return (
      <motion.div
        variants={staggerItem}
        className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-sm text-slate-500"
      >
        Adicione aportes para visualizar a alocação da carteira.
      </motion.div>
    );
  }

  return (
    <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] cursor-default">
        <h3 className="text-sm font-semibold text-white">Alocação por ativo</h3>
        <p className="mt-1 text-xs text-slate-500">
          Composição do patrimônio atual
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={alocacao}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={2}
              >
                {alocacao.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                content={<ChartTooltip />}
                cursor={false}
                wrapperStyle={{ outline: "none", border: "none" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          {alocacao.slice(0, 5).map((item, index) => (
            <li key={item.name} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              {item.name} · {formatBRL(item.value)}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] cursor-default">
        <h3 className="text-sm font-semibold text-white">Valor por tipo</h3>
        <p className="mt-1 text-xs text-slate-500">Ação · FII · Renda Fixa</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porTipo} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(148,163,184,0.08)" }}
                wrapperStyle={{ outline: "none", border: "none" }}
              />
              <Bar dataKey="value" name="Valor" radius={[8, 8, 0, 0]}>
                {porTipo.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
