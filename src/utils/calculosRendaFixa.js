/**
 * Motor matemático de Renda Fixa — marcação na curva (juros compostos diários).
 *
 * Fórmula: V = Aporte * (1 + taxa/100) ^ (dias / 365)
 *
 * @param {number|string} valorAporte Valor inicialmente aportado
 * @param {string|Date} dataAporte Data do aporte (YYYY-MM-DD ou Date)
 * @param {number|string} taxaAnual Taxa anual em % (ex.: 10 = 10%)
 * @param {Date} [referencia=new Date()] Data de referência (padrão: hoje)
 * @returns {number} Valor atualizado na curva
 */
export function calcularMarcacaoNaCurva(
  valorAporte,
  dataAporte,
  taxaAnual,
  referencia = new Date()
) {
  const aporte = Number(valorAporte);
  const taxa = Number(taxaAnual);

  if (!Number.isFinite(aporte) || aporte < 0) return 0;
  if (!dataAporte) return aporte;
  if (!Number.isFinite(taxa)) return aporte;

  const inicio = parseDataLocal(dataAporte);
  if (!inicio) return aporte;

  const fim = startOfDay(referencia);
  const msPorDia = 24 * 60 * 60 * 1000;
  const dias = Math.max(0, Math.floor((fim.getTime() - inicio.getTime()) / msPorDia));

  return aporte * Math.pow(1 + taxa / 100, dias / 365);
}

/**
 * @param {unknown} aporte
 * @returns {boolean}
 */
export function isRendaFixa(aporte) {
  const tipo = String(aporte?.tipo_ativo || aporte?.tipo || "").toLowerCase();
  return (
    tipo.includes("renda fixa") ||
    tipo === "rf" ||
    tipo.includes("cdb") ||
    tipo.includes("tesouro") ||
    tipo.includes("lci") ||
    tipo.includes("lca")
  );
}

/**
 * Valor atual de um aporte: marcação na curva (RF) ou cotação × quantidade.
 *
 * @param {object} aporte
 * @param {Record<string, number>} [precosAtuais]
 * @returns {number}
 */
export function valorAtualAporte(aporte, precosAtuais = {}) {
  if (isRendaFixa(aporte)) {
    const valorBase =
      aporte.valor_aportado != null
        ? Number(aporte.valor_aportado)
        : Number(aporte.preco_medio ?? aporte.preco ?? 0);
    const taxa = aporte.taxa_contratada ?? aporte.taxa;
    const data =
      aporte.data_aporte || aporte.data || aporte.created_at;
    return calcularMarcacaoNaCurva(valorBase, data, taxa);
  }

  const ticker = String(
    aporte.ticker_normalizado || aporte.ticker || aporte.ativo || ""
  )
    .trim()
    .toUpperCase()
    .replace(/\.SA$/i, "");
  const qtd = Number(aporte.quantidade ?? 0);
  const precoMedio = Number(aporte.preco_medio ?? aporte.preco ?? 0);
  const cotacao =
    ticker && precosAtuais[ticker] != null
      ? Number(precosAtuais[ticker])
      : aporte.preco_atual != null
        ? Number(aporte.preco_atual)
        : precoMedio;

  return qtd * (Number.isFinite(cotacao) ? cotacao : precoMedio);
}

function parseDataLocal(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return startOfDay(value);
  }

  const raw = String(value ?? "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.slice(0, 10).split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : startOfDay(date);
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
