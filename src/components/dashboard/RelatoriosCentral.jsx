"use client";

import { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { FileDown, Loader2 } from "lucide-react";
import { formatBRL, summarizeAportes, tickerDoAporte } from "@/lib/cliente";
import {
  isRendaFixa,
  valorAtualAporte,
} from "@/utils/calculosRendaFixa";

const TIPOS_RELATORIO = [
  {
    id: "consolidado",
    label: "Consolidado Patrimonial",
    slug: "Consolidado",
  },
  {
    id: "renda-passiva",
    label: "Extrato de Renda Passiva",
    slug: "RendaPassiva",
  },
  {
    id: "composicao",
    label: "Composição de Carteira",
    slug: "Composicao",
  },
  {
    id: "kit-contador",
    label: "Kit do Contador (IRPF)",
    slug: "KitContador_IRPF",
  },
];

const PIE_COLORS = [
  "#1d4ed8",
  "#0ea5e9",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#475569",
];

const ANO_ATUAL = new Date().getFullYear();
const ANOS_CALENDARIO = [ANO_ATUAL, ANO_ATUAL - 1, ANO_ATUAL - 2, ANO_ATUAL + 1];

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

function sanitizeFilename(value) {
  return String(value || "Cliente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
}

function yearOf(value) {
  const raw = String(value || "");
  if (!raw) return null;
  const date = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}

function mesKey(value) {
  const raw = String(value || "");
  if (!raw) return null;
  const date = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(key) {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, 1));
}

function codigoReceita(tipo) {
  const t = String(tipo || "").toLowerCase();
  if (t.includes("fii")) return "03 — Fundos de Investimento Imobiliário";
  if (t.includes("ação") || t.includes("acao")) return "04 — Ações";
  if (t.includes("etf")) return "74 — ETF / Fundos de Índice";
  if (t.includes("renda fixa") || t.includes("rf") || t.includes("tesouro"))
    return "45 — Aplicação de Renda Fixa";
  return "99 — Outros bens e direitos";
}

function LightTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-slate-800">{item.name}</p>
      <p className="tabular-nums text-slate-600">{formatBRL(item.value)}</p>
    </div>
  );
}

/**
 * Central de relatórios com prévia e exportação PDF.
 * Usada no painel do cliente e no cockpit admin.
 *
 * @param {{
 *   cliente?: object | null;
 *   aportes?: Array;
 *   precos?: Record<string, number>;
 *   summaryApi?: object | null;
 *   dividendos?: Array;
 *   vendas?: Array;
 *   subtitle?: string | null;
 * }} props
 */
export function RelatoriosCentral({
  cliente = null,
  aportes = [],
  precos = {},
  summaryApi = null,
  dividendos = [],
  vendas = [],
  subtitle = null,
}) {
  const [exportError, setExportError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [tipo, setTipo] = useState("consolidado");
  const [anoCalendario, setAnoCalendario] = useState(ANO_ATUAL - 1);

  const tipoMeta = TIPOS_RELATORIO.find((item) => item.id === tipo);
  const nomeCliente = cliente?.nome || "Cliente";
  const dataEmissao = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const summary = useMemo(() => {
    if (summaryApi) return summaryApi;
    return summarizeAportes(aportes, precos);
  }, [summaryApi, aportes, precos]);

  const alocacaoPorTipo = useMemo(() => {
    const map = new Map();
    for (const a of aportes) {
      const tipoAtivo = a.tipo_ativo || a.tipo || "Outros";
      const valor = valorAtualAporte(a, precos);
      if (valor <= 0) continue;
      map.set(tipoAtivo, (map.get(tipoAtivo) || 0) + valor);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [aportes, precos]);

  const aportesPorTipo = useMemo(() => {
    const groups = new Map();
    for (const a of aportes) {
      const key = a.tipo_ativo || a.tipo || "Outros";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(a);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [aportes]);

  const dividendosAno = useMemo(
    () => dividendos.filter((d) => yearOf(d.data_pagamento) === anoCalendario),
    [dividendos, anoCalendario]
  );

  const vendasAno = useMemo(
    () => vendas.filter((v) => yearOf(v.data_venda) === anoCalendario),
    [vendas, anoCalendario]
  );

  const isentosAno = useMemo(() => {
    const map = new Map();
    for (const row of dividendosAno) {
      const tipoDiv = String(row.tipo || "");
      if (tipoDiv !== "Dividendo" && tipoDiv !== "Rendimento FII") continue;
      const ticker = row.ticker || "—";
      const prev = map.get(ticker) || {
        ticker,
        tipo: tipoDiv,
        total: 0,
      };
      prev.total += Number(row.valor_total) || 0;
      if (tipoDiv === "Rendimento FII") prev.tipo = "Rendimento FII";
      map.set(ticker, prev);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [dividendosAno]);

  const jcpAno = useMemo(() => {
    const map = new Map();
    for (const row of dividendosAno) {
      if (String(row.tipo || "") !== "JCP") continue;
      const ticker = row.ticker || "—";
      const prev = map.get(ticker) || { ticker, total: 0 };
      prev.total += Number(row.valor_total) || 0;
      map.set(ticker, prev);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [dividendosAno]);

  const ganhosMensais = useMemo(() => {
    const map = new Map();
    for (const venda of vendasAno) {
      const key = mesKey(venda.data_venda);
      if (!key) continue;
      const prev = map.get(key) || {
        key,
        comuns: 0,
        fiis: 0,
      };
      const lucro = Number(venda.lucro) || 0;
      const tipoVenda = String(venda.tipo || "").toLowerCase();
      if (tipoVenda.includes("fii")) prev.fiis += lucro;
      else prev.comuns += lucro;
      map.set(key, prev);
    }
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [vendasAno]);

  const bensDireitos = useMemo(() => {
    return aportes.map((a) => {
      const ticker = tickerDoAporte(a) || a.ticker || a.ativo || "—";
      const qtd = Number(a.quantidade ?? (isRendaFixa(a) ? 1 : 0));
      const precoMedio = Number(a.preco_medio ?? a.preco ?? 0);
      const valorAdquirido =
        a.valor_aportado != null
          ? Number(a.valor_aportado)
          : isRendaFixa(a)
            ? precoMedio
            : qtd * precoMedio;
      return {
        id: a.id,
        codigo: codigoReceita(a.tipo_ativo || a.tipo),
        ticker,
        quantidade: qtd,
        precoMedio,
        valorAdquirido,
      };
    });
  }, [aportes]);

  const totalDividendos = useMemo(
    () =>
      dividendos.reduce((acc, row) => acc + (Number(row.valor_total) || 0), 0),
    [dividendos]
  );

  async function gerarPDF() {
    const el = document.getElementById("documento-pdf");
    if (!el) return;

    setExporting(true);
    setExportError(null);

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const anoSuffix =
        tipo === "kit-contador" || tipo === "renda-passiva"
          ? `_${anoCalendario}`
          : "";
      const filename = `LEXTOR_${sanitizeFilename(nomeCliente)}_${tipoMeta?.slug || "Relatorio"}${anoSuffix}.pdf`;
      pdf.save(filename);
    } catch (err) {
      setExportError(err?.message || "Falha ao gerar o PDF.");
    } finally {
      setExporting(false);
    }
  }

  const tituloDocumento =
    tipo === "kit-contador"
      ? `${tipoMeta?.label} — Ano-Calendário ${anoCalendario}`
      : tipoMeta?.label;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Central de Relatórios</h1>
        <p className="mt-1 text-sm text-slate-400">
          {subtitle ||
            `Prévia institucional e exportação PDF — ${nomeCliente}`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Tipo de relatório
          </p>

          <div className="space-y-2">
            {TIPOS_RELATORIO.map((item) => {
              const active = tipo === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTipo(item.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "border-blue-700 bg-blue-950/40 text-white"
                      : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="ano-calendario"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Ano-Calendário
              </label>
              <select
                id="ano-calendario"
                value={anoCalendario}
                onChange={(e) => setAnoCalendario(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                {ANOS_CALENDARIO.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={gerarPDF}
              disabled={exporting}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-600 disabled:opacity-60 sm:min-w-[160px]"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            O ano-calendário filtra dividendos e vendas no Kit do Contador e no
            extrato de renda passiva.
          </p>

          {exportError && (
            <p className="rounded-lg border border-red-800/50 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {exportError}
            </p>
          )}
        </aside>

        <div className="lg:col-span-2">
          <div className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-6">
            <div
              id="documento-pdf"
              className="mx-auto w-full max-w-[720px] overflow-hidden bg-white text-slate-900 shadow-xl"
              style={{ minHeight: "calc(720px * 1.414)", height: "auto" }}
            >
              <header className="relative overflow-hidden bg-[#0a0a0a] px-8 pb-7 pt-8 text-white">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(29,78,216,0.35)_0%,_transparent_55%)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-sky-400 to-blue-700"
                  aria-hidden
                />

                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-3xl font-bold tracking-[0.22em] text-white">
                      LEXTOR
                    </p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.28em] text-blue-300/90">
                      Consultoria Patrimonial
                    </p>
                    <p className="mt-3 text-xs tabular-nums text-slate-400">
                      CNPJ 42.721.809/0001-52
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Emissão
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-100">
                      {dataEmissao}
                    </p>
                  </div>
                </div>

                <div className="relative mt-7 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Preparado para
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {nomeCliente}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Documento
                    </p>
                    <p className="mt-1 text-base font-semibold text-sky-300">
                      {tituloDocumento}
                    </p>
                  </div>
                </div>
              </header>

              <div className="space-y-6 px-8 py-7 text-sm">
                {tipo === "consolidado" && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Patrimônio Total
                        </p>
                        <p className="mt-2 text-xl font-bold tabular-nums text-slate-900">
                          {formatBRL(summary.patrimonio)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Total Aportado
                        </p>
                        <p className="mt-2 text-xl font-bold tabular-nums text-slate-900">
                          {formatBRL(summary.totalAportado)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Rentabilidade
                        </p>
                        <p
                          className={`mt-2 text-xl font-bold tabular-nums ${
                            summary.rentabilidade >= 0
                              ? "text-emerald-700"
                              : "text-red-700"
                          }`}
                        >
                          {summary.rentabilidade >= 0 ? "+" : ""}
                          {Number(summary.rentabilidade || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="border-l-4 border-blue-700 pl-3 text-sm font-semibold tracking-tight text-slate-900">
                        Alocação por tipo de ativo
                      </h3>
                      {alocacaoPorTipo.length === 0 ? (
                        <p className="mt-4 text-slate-500">
                          Sem ativos para exibir alocação.
                        </p>
                      ) : (
                        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                          <div className="h-48 w-48 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={alocacaoPorTipo}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={42}
                                  outerRadius={70}
                                  paddingAngle={2}
                                >
                                  {alocacaoPorTipo.map((_, index) => (
                                    <Cell
                                      key={index}
                                      fill={
                                        PIE_COLORS[index % PIE_COLORS.length]
                                      }
                                    />
                                  ))}
                                </Pie>
                                <Tooltip content={<LightTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <ul className="w-full space-y-2">
                            {alocacaoPorTipo.map((item, index) => {
                              const pct =
                                summary.patrimonio > 0
                                  ? (item.value / summary.patrimonio) * 100
                                  : 0;
                              return (
                                <li
                                  key={item.name}
                                  className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2"
                                >
                                  <span className="inline-flex items-center gap-2 text-slate-700">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{
                                        backgroundColor:
                                          PIE_COLORS[index % PIE_COLORS.length],
                                      }}
                                    />
                                    {item.name}
                                  </span>
                                  <span className="tabular-nums text-slate-800">
                                    {formatBRL(item.value)}{" "}
                                    <span className="text-slate-500">
                                      ({pct.toFixed(1)}%)
                                    </span>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {tipo === "renda-passiva" && (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50/80 to-white p-5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Total de proventos
                        {anoCalendario ? ` (${anoCalendario})` : ""}
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                        {formatBRL(
                          dividendosAno.reduce(
                            (acc, row) => acc + (Number(row.valor_total) || 0),
                            0
                          ) || totalDividendos
                        )}
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-900 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                          <tr>
                            <th className="px-4 py-3 font-medium">Data</th>
                            <th className="px-4 py-3 font-medium">Ticker</th>
                            <th className="px-4 py-3 font-medium">Tipo</th>
                            <th className="px-4 py-3 font-medium text-right">
                              Valor
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(dividendosAno.length
                            ? dividendosAno
                            : dividendos
                          ).length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-8 text-center text-slate-500"
                              >
                                Nenhum provento registrado.
                              </td>
                            </tr>
                          ) : (
                            [...(dividendosAno.length ? dividendosAno : dividendos)]
                              .sort((a, b) =>
                                String(b.data_pagamento || "").localeCompare(
                                  String(a.data_pagamento || "")
                                )
                              )
                              .map((row) => (
                                <tr key={row.id}>
                                  <td className="px-4 py-2.5 tabular-nums text-slate-700">
                                    {formatData(row.data_pagamento)}
                                  </td>
                                  <td className="px-4 py-2.5 font-medium text-slate-900">
                                    {row.ticker || "—"}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600">
                                    {row.tipo || "—"}
                                  </td>
                                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                                    {formatBRL(row.valor_total)}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {tipo === "composicao" && (
                  <>
                    {aportesPorTipo.length === 0 ? (
                      <p className="text-slate-500">
                        Nenhum aporte registrado na carteira.
                      </p>
                    ) : (
                      aportesPorTipo.map(([grupo, lista]) => (
                        <div key={grupo}>
                          <h3 className="mb-2 border-l-4 border-blue-700 pl-3 text-sm font-semibold text-slate-900">
                            {grupo}
                          </h3>
                          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                            <table className="min-w-full text-left text-sm">
                              <thead className="bg-slate-900 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                                <tr>
                                  <th className="px-4 py-2.5 font-medium">
                                    Ativo
                                  </th>
                                  <th className="px-4 py-2.5 font-medium">
                                    Qtd / Detalhe
                                  </th>
                                  <th className="px-4 py-2.5 font-medium text-right">
                                    Valor atual
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {lista.map((aporte) => {
                                  const rf = isRendaFixa(aporte);
                                  const ticker =
                                    tickerDoAporte(aporte) ||
                                    aporte.ticker ||
                                    aporte.ativo ||
                                    "—";
                                  const valor = valorAtualAporte(
                                    aporte,
                                    precos
                                  );
                                  const detalhe = rf
                                    ? [
                                        aporte.indexador,
                                        aporte.taxa_contratada != null
                                          ? `${Number(aporte.taxa_contratada).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% a.a.`
                                          : null,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ")
                                    : Number(
                                        aporte.quantidade ?? 0
                                      ).toLocaleString("pt-BR");

                                  return (
                                    <tr key={aporte.id}>
                                      <td className="px-4 py-2.5 font-medium text-slate-900">
                                        {ticker}
                                      </td>
                                      <td className="px-4 py-2.5 text-slate-600">
                                        {detalhe || "—"}
                                      </td>
                                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                                        {formatBRL(valor)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {tipo === "kit-contador" && (
                  <>
                    <section>
                      <h3 className="border-l-4 border-blue-700 pl-3 text-sm font-semibold tracking-tight text-slate-900">
                        1. Bens e Direitos (posição em 31/12)
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Declaração de Bens e Direitos — códigos da Receita
                        Federal
                      </p>
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-slate-900 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                            <tr>
                              <th className="px-3 py-2 font-medium">Código RF</th>
                              <th className="px-3 py-2 font-medium">Ticker</th>
                              <th className="px-3 py-2 font-medium">Qtd</th>
                              <th className="px-3 py-2 font-medium">
                                Preço médio
                              </th>
                              <th className="px-3 py-2 font-medium text-right">
                                Valor adquirido
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bensDireitos.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-3 py-6 text-center text-slate-500"
                                >
                                  Sem posição em carteira.
                                </td>
                              </tr>
                            ) : (
                              bensDireitos.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2 text-slate-700">
                                    {item.codigo}
                                  </td>
                                  <td className="px-3 py-2 font-medium text-slate-900">
                                    {item.ticker}
                                  </td>
                                  <td className="px-3 py-2 tabular-nums text-slate-700">
                                    {item.quantidade.toLocaleString("pt-BR")}
                                  </td>
                                  <td className="px-3 py-2 tabular-nums text-slate-700">
                                    {formatBRL(item.precoMedio)}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                                    {formatBRL(item.valorAdquirido)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section>
                      <h3 className="border-l-4 border-blue-700 pl-3 text-sm font-semibold tracking-tight text-slate-900">
                        2. Rendimentos Isentos e Não Tributáveis
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Dividendos e Rendimentos de FII — ano {anoCalendario}
                      </p>
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-slate-900 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                            <tr>
                              <th className="px-3 py-2 font-medium">Ticker</th>
                              <th className="px-3 py-2 font-medium">
                                Fonte / Tipo
                              </th>
                              <th className="px-3 py-2 font-medium text-right">
                                Total recebido
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {isentosAno.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-3 py-6 text-center text-slate-500"
                                >
                                  Sem rendimentos isentos no ano.
                                </td>
                              </tr>
                            ) : (
                              isentosAno.map((item) => (
                                <tr key={item.ticker}>
                                  <td className="px-3 py-2 font-medium text-slate-900">
                                    {item.ticker}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600">
                                    {item.tipo}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                                    {formatBRL(item.total)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section>
                      <h3 className="border-l-4 border-blue-700 pl-3 text-sm font-semibold tracking-tight text-slate-900">
                        3. Rendimentos Sujeitos à Tributação Exclusiva
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        JCP (Juros sobre Capital Próprio) — ano {anoCalendario}
                      </p>
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-slate-900 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                            <tr>
                              <th className="px-3 py-2 font-medium">Ticker</th>
                              <th className="px-3 py-2 font-medium text-right">
                                Total JCP
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {jcpAno.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="px-3 py-6 text-center text-slate-500"
                                >
                                  Sem JCP no ano.
                                </td>
                              </tr>
                            ) : (
                              jcpAno.map((item) => (
                                <tr key={item.ticker}>
                                  <td className="px-3 py-2 font-medium text-slate-900">
                                    {item.ticker}
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                                    {formatBRL(item.total)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section>
                      <h3 className="border-l-4 border-blue-700 pl-3 text-sm font-semibold tracking-tight text-slate-900">
                        4. Apuração de Ganhos de Capital (Vendas e DARF)
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Lucros e prejuízos mês a mês — Operações Comuns × Fundos
                        Imobiliários ({anoCalendario})
                      </p>
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                        <table className="min-w-full text-left text-xs">
                          <thead className="bg-slate-900 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                            <tr>
                              <th className="px-3 py-2 font-medium">Mês</th>
                              <th className="px-3 py-2 font-medium text-right">
                                Op. Comuns
                              </th>
                              <th className="px-3 py-2 font-medium text-right">
                                FIIs
                              </th>
                              <th className="px-3 py-2 font-medium text-right">
                                Saldo
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {ganhosMensais.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-3 py-6 text-center text-slate-500"
                                >
                                  Sem vendas no ano-calendário.
                                </td>
                              </tr>
                            ) : (
                              ganhosMensais.map((row) => {
                                const saldo = row.comuns + row.fiis;
                                return (
                                  <tr key={row.key}>
                                    <td className="px-3 py-2 capitalize text-slate-800">
                                      {labelMes(row.key)}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                                      {formatBRL(row.comuns)}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                                      {formatBRL(row.fiis)}
                                    </td>
                                    <td
                                      className={`px-3 py-2 text-right tabular-nums font-medium ${
                                        saldo >= 0
                                          ? "text-emerald-700"
                                          : "text-rose-700"
                                      }`}
                                    >
                                      {formatBRL(saldo)}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                        Observação ao contador: verifique isenção mensal de R$
                        20.000 em operações comuns com ações. FIIs e ETFs não
                        possuem essa isenção (alíquotas típicas 20% e 15%). Emita
                        DARF quando houver saldo tributável.
                      </p>
                    </section>
                  </>
                )}
              </div>

              <footer className="mt-2 border-t border-slate-200 bg-slate-50 px-8 py-5 text-[10px] leading-relaxed text-slate-500">
                <p className="font-medium text-slate-700">
                  LEXTOR · CNPJ 42.721.809/0001-52
                </p>
                <p className="mt-1.5">
                  Documento gerado automaticamente pela plataforma LEXTOR.
                  Informações auxiliares para o contador — não substituem
                  assessoria contábil/fiscal formal. Investimentos envolvem
                  riscos. Rentabilidade passada não garante resultados futuros.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
