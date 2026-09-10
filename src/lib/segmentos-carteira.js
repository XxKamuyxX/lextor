/**
 * Taxonomia de classes e segmentos da carteira LEXTOR.
 */

export const TIPOS_ATIVO = [
  "Ação",
  "FII",
  "Renda Fixa",
  "Tesouro Direto",
];

/** @type {Record<string, string[]>} */
export const SEGMENTOS_POR_TIPO = {
  Ação: [
    "Energia",
    "Financeiro",
    "Commodities",
    "Consumo",
    "Saúde",
    "Tecnologia",
    "Utilidades",
    "Indústria",
    "Telecomunicações",
    "Agronegócio",
    "Construção Civil",
    "Varejo",
    "Outros",
  ],
  FII: [
    "Papel / CRIs",
    "Híbrido",
    "Shopping",
    "Logística",
    "Lajes Corporativas",
    "Residencial",
    "Fundo de Fundos (FoF)",
    "Desenvolvimento",
    "Agronegócio",
    "Hospitalar / Educação",
    "Outros",
  ],
  "Renda Fixa": [
    "Pré-fixado",
    "Pós-fixado (CDI)",
    "IPCA+",
    "CDB",
    "LCI / LCA",
    "Debêntures",
    "Outros",
  ],
  "Tesouro Direto": [
    "Tesouro Prefixado",
    "Tesouro Selic",
    "Tesouro IPCA+",
    "Tesouro Renda+",
    "Tesouro Educa+",
    "Outros",
  ],
};

export const FILTROS_CLASSE = [
  { id: "todos", label: "Todos" },
  { id: "Ação", label: "Ações" },
  { id: "FII", label: "FIIs" },
  { id: "Renda Fixa", label: "Renda Fixa" },
  { id: "Tesouro Direto", label: "Tesouro" },
];

const INDEXADOR_PARA_SEGMENTO = {
  "Pré-fixado": "Pré-fixado",
  CDI: "Pós-fixado (CDI)",
  "IPCA+": "IPCA+",
};

/**
 * @param {unknown} aporte
 * @returns {string}
 */
export function tipoAtivoDoAporte(aporte) {
  const tipo = String(aporte?.tipo_ativo || aporte?.tipo || "").trim();
  if (!tipo) return "Outros";

  const lower = tipo.toLowerCase();
  if (lower.includes("tesouro")) return "Tesouro Direto";
  if (lower.includes("renda fixa") || lower === "rf") return "Renda Fixa";
  if (lower.includes("fii") || lower.includes("fundo imobili")) return "FII";
  if (lower.includes("aç") || lower.includes("acao") || lower.includes("ação"))
    return "Ação";

  if (TIPOS_ATIVO.includes(tipo)) return tipo;
  return tipo;
}

/**
 * Resolve o segmento exibido/agrupado do aporte.
 * Prioridade: campo salvo → indexador (RF/Tesouro) → fallback do tipo.
 *
 * @param {unknown} aporte
 * @returns {string}
 */
export function segmentoDoAporte(aporte) {
  const explicit = String(aporte?.segmento ?? "").trim();
  if (explicit) return explicit;

  const tipo = tipoAtivoDoAporte(aporte);
  const indexador = String(aporte?.indexador ?? "").trim();

  if ((tipo === "Renda Fixa" || tipo === "Tesouro Direto") && indexador) {
    if (tipo === "Tesouro Direto") {
      if (indexador === "Pré-fixado") return "Tesouro Prefixado";
      if (indexador === "CDI") return "Tesouro Selic";
      if (indexador === "IPCA+") return "Tesouro IPCA+";
      return indexador;
    }
    return INDEXADOR_PARA_SEGMENTO[indexador] || indexador;
  }

  return "Não classificado";
}

/**
 * @param {string} tipoAtivo
 * @returns {string[]}
 */
export function segmentosDoTipo(tipoAtivo) {
  return SEGMENTOS_POR_TIPO[tipoAtivo] || ["Outros"];
}

/**
 * @param {string} tipoAtivo
 * @param {string} [indexador]
 * @returns {string}
 */
export function segmentoPadrao(tipoAtivo, indexador) {
  if (tipoAtivo === "Renda Fixa" && indexador) {
    return INDEXADOR_PARA_SEGMENTO[indexador] || "Outros";
  }
  if (tipoAtivo === "Tesouro Direto") {
    if (indexador === "Pré-fixado") return "Tesouro Prefixado";
    if (indexador === "CDI") return "Tesouro Selic";
    if (indexador === "IPCA+") return "Tesouro IPCA+";
    return "Tesouro Prefixado";
  }
  const lista = segmentosDoTipo(tipoAtivo);
  return lista[0] || "Outros";
}

/**
 * Indexador sugerido a partir do segmento (RF / Tesouro).
 * @param {string} tipoAtivo
 * @param {string} segmento
 * @returns {string | null}
 */
export function indexadorDoSegmento(tipoAtivo, segmento) {
  if (tipoAtivo === "Renda Fixa") {
    if (segmento === "Pré-fixado") return "Pré-fixado";
    if (segmento === "Pós-fixado (CDI)" || segmento === "CDB" || segmento === "LCI / LCA")
      return "CDI";
    if (segmento === "IPCA+" || segmento === "Debêntures") return "IPCA+";
  }
  if (tipoAtivo === "Tesouro Direto") {
    if (segmento === "Tesouro Prefixado") return "Pré-fixado";
    if (segmento === "Tesouro Selic") return "CDI";
    if (
      segmento === "Tesouro IPCA+" ||
      segmento === "Tesouro Renda+" ||
      segmento === "Tesouro Educa+"
    )
      return "IPCA+";
  }
  return null;
}

/**
 * @param {unknown} aporte
 * @returns {string}
 */
export function moedaDoAporte(aporte) {
  const explicit = String(aporte?.moeda ?? "").trim().toUpperCase();
  if (explicit) return explicit;

  const tipo = String(aporte?.tipo_ativo || aporte?.tipo || "").toLowerCase();
  if (
    tipo.includes("exterior") ||
    tipo.includes("internacional") ||
    tipo.includes("dólar") ||
    tipo.includes("dolar") ||
    tipo.includes("usd")
  ) {
    return "USD";
  }

  const ticker = String(aporte?.ticker_normalizado || aporte?.ticker || aporte?.ativo || "")
    .trim()
    .toUpperCase()
    .replace(/\.SA$/i, "");

  if (/3[2-5]$/.test(ticker)) return "USD";
  return "BRL";
}
