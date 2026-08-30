/** @typedef {"1m" | "3m" | "6m" | "12m" | "ytd" | "max"} PeriodoBenchmark */
/** @typedef {"cdi" | "ibovespa" | "ipca"} IndicadorBenchmark */

export const PERIODOS_BENCHMARK = [
  { id: "1m", label: "1 mês" },
  { id: "3m", label: "3 meses" },
  { id: "6m", label: "6 meses" },
  { id: "12m", label: "12 meses" },
  { id: "ytd", label: "Ano atual" },
  { id: "max", label: "Máximo" },
];

export const INDICADORES_BENCHMARK = [
  { id: "cdi", label: "CDI", color: "#38bdf8" },
  { id: "ibovespa", label: "Ibovespa", color: "#fbbf24" },
  { id: "ipca", label: "Inflação (IPCA)", color: "#f472b6" },
];

const INDICADOR_DB = {
  cdi: "CDI",
  ibovespa: "IBOVESPA",
  ipca: "IPCA",
};

/** Taxas mensais de referência quando não há histórico no banco. */
const FALLBACK_MENSAL = {
  CDI: 0.0105,
  IBOVESPA: 0.0075,
  IPCA: 0.0042,
};

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

function monthEndDates(start, end) {
  const points = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const limit = startOfDay(end);

  while (cursor <= limit) {
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    points.push(startOfDay(lastDay > limit ? limit : lastDay));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (!points.length) points.push(limit);
  return points;
}

export function resolvePeriodoRange(periodo, aportes = []) {
  const hoje = startOfDay(new Date());
  let inicio;

  switch (periodo) {
    case "1m":
      inicio = new Date(hoje);
      inicio.setMonth(inicio.getMonth() - 1);
      break;
    case "3m":
      inicio = new Date(hoje);
      inicio.setMonth(inicio.getMonth() - 3);
      break;
    case "6m":
      inicio = new Date(hoje);
      inicio.setMonth(inicio.getMonth() - 6);
      break;
    case "12m":
      inicio = new Date(hoje);
      inicio.setFullYear(inicio.getFullYear() - 1);
      break;
    case "ytd":
      inicio = new Date(hoje.getFullYear(), 0, 1);
      break;
    case "max":
    default: {
      const datas = (aportes ?? [])
        .map((a) => parseDate(a.data_aporte || a.created_at))
        .filter(Boolean);
      inicio = datas.length
        ? new Date(Math.min(...datas.map((d) => d.getTime())))
        : new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1);
      break;
    }
  }

  return { inicio: startOfDay(inicio), fim: hoje };
}

function findPriceOnOrBefore(series, date) {
  const target = date.getTime();
  let best = null;
  for (const row of series) {
    const t = parseDate(row.data)?.getTime();
    if (t == null || t > target) continue;
    if (!best || t > best.t) best = { t, price: Number(row.preco) };
  }
  return best?.price ?? null;
}

function buildCotacoesMap(rows) {
  const map = {};
  for (const row of rows ?? []) {
    const ativo = String(row.ativo ?? "")
      .trim()
      .toUpperCase();
    if (!ativo) continue;
    if (!map[ativo]) map[ativo] = [];
    map[ativo].push({
      data: row.data_cotacao,
      preco: Number(row.preco_fechamento),
    });
  }
  for (const list of Object.values(map)) {
    list.sort((a, b) => new Date(a.data) - new Date(b.data));
  }
  return map;
}

export function buildCarteiraSeries(aportes, cotacoesRows, inicio, fim) {
  const cotacoes = buildCotacoesMap(cotacoesRows);
  const meses = monthEndDates(inicio, fim);

  const pontos = meses.map((dataRef) => {
    let valor = 0;

    for (const a of aportes ?? []) {
      const dataAporte = parseDate(a.data_aporte || a.created_at);
      if (dataAporte && dataAporte > dataRef) continue;

      const qtd = Number(a.quantidade ?? 0);
      const precoMedio = Number(a.preco_medio ?? a.preco ?? 0);
      const ticker = String(a.ticker || a.ativo || "")
        .trim()
        .toUpperCase()
        .replace(/\.SA$/i, "");

      let preco = precoMedio;
      if (ticker && cotacoes[ticker]?.length) {
        preco = findPriceOnOrBefore(cotacoes[ticker], dataRef) ?? precoMedio;
      }

      const aportado =
        a.valor_aportado != null
          ? Number(a.valor_aportado)
          : a.valor != null
            ? Number(a.valor)
            : qtd * precoMedio;

      valor += qtd > 0 ? qtd * preco : aportado;
    }

    return { date: dataRef, value: valor };
  });

  return pontos.filter((p) => p.value > 0);
}

function monthlyReturnsFromDb(rows) {
  const map = {};
  for (const row of rows ?? []) {
    const key = String(row.indicador ?? "").toUpperCase();
    if (!map[key]) map[key] = [];
    map[key].push({
      date: parseDate(row.data_referencia),
      monthly: Number(row.valor_mensal) / 100,
    });
  }
  for (const list of Object.values(map)) {
    list.sort((a, b) => a.date - b.date);
  }
  return map;
}

function generateFallbackMonthly(indicador, inicio, fim) {
  const taxa = FALLBACK_MENSAL[indicador] ?? 0;
  const meses = monthEndDates(inicio, fim);
  let index = 100;
  return meses.map((date, i) => {
    if (i > 0) index *= 1 + taxa;
    return { date, value: index };
  });
}

export function buildBenchmarkSeries(indicador, dbRows, inicio, fim) {
  const key = INDICADOR_DB[indicador];
  const allMonthly = monthlyReturnsFromDb(dbRows)[key] ?? [];
  const monthly = allMonthly.filter(
    (row) => row.date && row.date >= inicio && row.date <= fim
  );

  if (!monthly.length) {
    return generateFallbackMonthly(key, inicio, fim);
  }

  const meses = monthEndDates(inicio, fim);
  let index = 100;
  let ptr = 0;

  return meses.map((date) => {
    while (ptr < monthly.length && monthly[ptr].date <= date) {
      index *= 1 + (monthly[ptr].monthly ?? 0);
      ptr += 1;
    }
    return { date, value: index };
  });
}

export function normalizeSeries(points) {
  if (!points?.length) return [];
  const base = points[0].value || 1;
  return points.map((p) => ({
    label: formatLabel(p.date),
    value: (p.value / base) * 100,
  }));
}

export function totalReturnPercent(points) {
  if (!points?.length || points.length < 2) return 0;
  const first = points[0].value;
  const last = points[points.length - 1].value;
  if (!first) return 0;
  return ((last - first) / first) * 100;
}

export function mergeComparisonSeries(carteira, benchmarks, indicadoresAtivos) {
  const meses = carteira.length
    ? carteira.map((p) => p.date.getTime())
    : benchmarks[indicadoresAtivos[0]]?.map((p) => p.date.getTime()) ?? [];

  const carteiraNorm = normalizeSeries(carteira);
  const benchNorm = {};
  for (const id of indicadoresAtivos) {
    benchNorm[id] = normalizeSeries(benchmarks[id] ?? []);
  }

  return meses.map((time, index) => {
    const row = {
      label: formatLabel(new Date(time)),
      carteira: carteiraNorm[index]?.value ?? null,
    };
    for (const id of indicadoresAtivos) {
      row[id] = benchNorm[id]?.[index]?.value ?? null;
    }
    return row;
  });
}

export function parseIndicadoresParam(raw) {
  const allowed = new Set(INDICADORES_BENCHMARK.map((i) => i.id));
  const list = String(raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => allowed.has(s));
  return list.length ? list : ["cdi", "ibovespa", "ipca"];
}
