"use client";

import { useMemo, useState } from "react";
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
import {
  FILTROS_CLASSE,
  SEGMENTOS_POR_TIPO,
  moedaDoAporte,
  segmentoDoAporte,
  tipoAtivoDoAporte,
} from "@/lib/segmentos-carteira";
import { isRendaFixa, valorAtualAporte } from "@/utils/calculosRendaFixa";

const COLORS = [
  "#38bdf8",
  "#34d399",
  "#a78bfa",
  "#fbbf24",
  "#f472b6",
  "#2dd4bf",
  "#fb7185",
  "#94a3b8",
  "#60a5fa",
  "#c084fc",
];

/**
 * @param {Map<string, number>} map
 * @param {number} [limit]
 */
function mapToSeries(map, limit) {
  const series = [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (limit == null || series.length <= limit) return series;

  const top = series.slice(0, limit - 1);
  const rest = series
    .slice(limit - 1)
    .reduce((sum, item) => sum + item.value, 0);
  if (rest > 0) top.push({ name: "Outros", value: rest });
  return top;
}

function pct(value, total) {
  if (!total) return "0%";
  return `${((value / total) * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}%`;
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-sky-500/50 bg-sky-950/60 text-sky-200"
          : "border-slate-700 bg-slate-950/40 text-slate-400 hover:border-slate-500 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function ChartCard({ title, subtitle, children, legend }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-4 h-64">{children}</div>
      {legend ? <div className="mt-3">{legend}</div> : null}
    </div>
  );
}

function LegendList({ items, total }) {
  if (!items?.length) return null;

  return (
    <ul className="space-y-1.5 text-xs text-slate-400">
      {items.slice(0, 8).map((item, index) => (
        <li key={item.name} className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{item.name}</span>
          </span>
          <span className="shrink-0 tabular-nums text-slate-300">
            {formatBRL(item.value)}
            <span className="ml-2 text-slate-500">{pct(item.value, total)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * @param {{ aportes: Array; precos?: Record<string, number> }} props
 */
export function CarteiraCharts({ aportes = [], precos = {} }) {
  const [classeFiltro, setClasseFiltro] = useState("todos");
  const [segmentoFiltro, setSegmentoFiltro] = useState("todos");

  const enriquecidos = useMemo(() => {
    return aportes
      .map((a) => {
        const valor = valorAtualAporte(a, precos);
        if (valor <= 0) return null;
        return {
          aporte: a,
          valor,
          tipo: tipoAtivoDoAporte(a),
          segmento: segmentoDoAporte(a),
          moeda: moedaDoAporte(a),
          ticker: tickerDoAporte(a) || a.ticker || a.ativo || "Outros",
        };
      })
      .filter(Boolean);
  }, [aportes, precos]);

  const resumoClasses = useMemo(() => {
    const map = new Map();
    for (const item of enriquecidos) {
      map.set(item.tipo, (map.get(item.tipo) || 0) + item.valor);
    }
    return mapToSeries(map);
  }, [enriquecidos]);

  const totalGeral = useMemo(
    () => enriquecidos.reduce((sum, item) => sum + item.valor, 0),
    [enriquecidos]
  );

  const segmentosDisponiveis = useMemo(() => {
    const base =
      classeFiltro === "todos"
        ? Object.values(SEGMENTOS_POR_TIPO).flat()
        : SEGMENTOS_POR_TIPO[classeFiltro] || [];

    const presentes = new Set(
      enriquecidos
        .filter((item) =>
          classeFiltro === "todos" ? true : item.tipo === classeFiltro
        )
        .map((item) => item.segmento)
    );

    const lista = [
      ...base.filter((s) => presentes.has(s)),
      ...[...presentes].filter((s) => !base.includes(s)),
    ];

    return ["todos", ...lista];
  }, [classeFiltro, enriquecidos]);

  const filtrados = useMemo(() => {
    return enriquecidos.filter((item) => {
      if (classeFiltro !== "todos" && item.tipo !== classeFiltro) return false;
      if (segmentoFiltro !== "todos" && item.segmento !== segmentoFiltro)
        return false;
      return true;
    });
  }, [enriquecidos, classeFiltro, segmentoFiltro]);

  const { porAtivo, porSegmento, porMoeda, totalFiltrado } = useMemo(() => {
    const ativoMap = new Map();
    const segmentoMap = new Map();
    const moedaMap = new Map();
    let total = 0;

    for (const item of filtrados) {
      total += item.valor;
      const label = isRendaFixa(item.aporte)
        ? `${item.ticker}${
            item.aporte.indexador ? ` (${item.aporte.indexador})` : ""
          }`
        : item.ticker;

      ativoMap.set(label, (ativoMap.get(label) || 0) + item.valor);
      segmentoMap.set(
        item.segmento,
        (segmentoMap.get(item.segmento) || 0) + item.valor
      );
      moedaMap.set(item.moeda, (moedaMap.get(item.moeda) || 0) + item.valor);
    }

    return {
      porAtivo: mapToSeries(ativoMap, 10),
      porSegmento: mapToSeries(segmentoMap),
      porMoeda: mapToSeries(moedaMap),
      totalFiltrado: total,
    };
  }, [filtrados]);

  function mudarClasse(id) {
    setClasseFiltro(id);
    setSegmentoFiltro("todos");
  }

  if (aportes.length === 0) {
    return (
      <motion.div
        variants={staggerItem}
        className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-sm text-slate-500"
      >
        Adicione aportes para visualizar a distribuição da carteira.
      </motion.div>
    );
  }

  return (
    <motion.section
      variants={staggerItem}
      className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Distribuição da carteira
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Filtre por classe e segmento — ações, FIIs, renda fixa e Tesouro
            Direto.
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Filtro:{" "}
          <span className="font-medium tabular-nums text-sky-300">
            {formatBRL(totalFiltrado)}
          </span>
          {totalFiltrado !== totalGeral ? (
            <span className="text-slate-500">
              {" "}
              de {formatBRL(totalGeral)}
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS_CLASSE.map((filtro) => (
          <FilterChip
            key={filtro.id}
            active={classeFiltro === filtro.id}
            onClick={() => mudarClasse(filtro.id)}
          >
            {filtro.label}
            {filtro.id !== "todos" && resumoClasses.find((c) => c.name === filtro.id)
              ? ` · ${pct(
                  resumoClasses.find((c) => c.name === filtro.id)?.value || 0,
                  totalGeral
                )}`
              : null}
          </FilterChip>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Segmento
          {classeFiltro !== "todos" ? ` · ${classeFiltro}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {segmentosDisponiveis.map((seg) => (
            <FilterChip
              key={seg}
              active={segmentoFiltro === seg}
              onClick={() => setSegmentoFiltro(seg)}
            >
              {seg === "todos" ? "Todos os segmentos" : seg}
            </FilterChip>
          ))}
        </div>
      </div>

      {resumoClasses.length > 0 && classeFiltro === "todos" ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {resumoClasses.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => mudarClasse(item.name)}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-left transition hover:border-sky-700/40"
            >
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.name}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-white">
                {formatBRL(item.value)}
              </p>
              <p className="text-xs text-slate-500">{pct(item.value, totalGeral)}</p>
            </button>
          ))}
        </div>
      ) : null}

      {filtrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 px-4 py-10 text-center text-sm text-slate-500">
          Nenhum ativo neste filtro. Ajuste a classe ou o segmento.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <ChartCard
            title="Por ativo"
            subtitle="Participação individual no filtro"
            legend={<LegendList items={porAtivo} total={totalFiltrado} />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porAtivo}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={84}
                  paddingAngle={2}
                >
                  {porAtivo.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip valueFormat="brl" />}
                  cursor={false}
                  wrapperStyle={{ outline: "none", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Por segmento"
            subtitle={
              classeFiltro === "todos"
                ? "Setores, tipologias e indexadores"
                : `Segmentos de ${classeFiltro}`
            }
            legend={<LegendList items={porSegmento} total={totalFiltrado} />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={porSegmento}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={{ stroke: "#1e293b" }}
                  tickLine={false}
                  interval={0}
                  angle={porSegmento.length > 3 ? -20 : 0}
                  textAnchor={porSegmento.length > 3 ? "end" : "middle"}
                  height={porSegmento.length > 3 ? 64 : 30}
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
                  content={<ChartTooltip valueFormat="brl" />}
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  wrapperStyle={{ outline: "none", border: "none" }}
                />
                <Bar dataKey="value" name="Valor" radius={[8, 8, 0, 0]}>
                  {porSegmento.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Por moeda"
            subtitle="Exposição cambial no filtro"
            legend={<LegendList items={porMoeda} total={totalFiltrado} />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porMoeda}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={84}
                  paddingAngle={2}
                >
                  {porMoeda.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip valueFormat="brl" />}
                  cursor={false}
                  wrapperStyle={{ outline: "none", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </motion.section>
  );
}
