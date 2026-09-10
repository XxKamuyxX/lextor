/**
 * Schema compartilhado do mapeamento estratégico (Projetos e Teses).
 */

export const MOMENTO_VIDA = [
  "Acumulação agressiva de patrimônio",
  "Transição para viver de renda (Aposentadoria)",
  "Preservação de capital contra inflação",
  "Sucessão patrimonial / Herança",
  "Compra de imóvel ou bens de alto valor",
  "Custear educação dos filhos",
  "Reserva para ano sabático / Empreendedorismo",
];

export const ESTRATEGIA_ACOES = [
  "Foco exclusivo em Dividendos (Vacas Leiteiras)",
  "Foco em Crescimento e Valorização (Growth / Small Caps)",
  "Setores Defensivos (Energia, Saneamento, Seguros, Bancos)",
  "Setores Cíclicos (Varejo, Commodities, Construção)",
  "Exposição ao Dólar / BDRs / Ações Globais",
  "Aceita investir em Estatais (Petrobras, Banco do Brasil, etc.)",
];

export const TESES_FIIS = [
  "FIIs de Papel / Recebíveis (Foco em dividendos altos, atrelados ao CDI/IPCA)",
  "Galpões Logísticos (E-commerce e infraestrutura)",
  "Shoppings Centers",
  "Lajes Corporativas (Escritórios)",
  "Fiagros (Exposição ao Agronegócio)",
  "FIIs de Infraestrutura (Isentos de IR)",
];

export const RESTRICOES = [
  "ZERO Criptomoedas",
  "ZERO Empresas Estatais (Risco político)",
  "ZERO Varejo",
  "ZERO Ativos sem liquidez diária",
  "ZERO Setores polêmicos (Armas, Jogos de Azar)",
];

export const INDEXADOR_LABELS = {
  hibrido_ipca: "Híbrido (IPCA+)",
  pos_cdi: "Pós-fixado (CDI)",
  pre_fixado: "Pré-fixado",
};

export const SIM_NAO_LABELS = {
  sim: "Sim",
  nao: "Não",
};

export function emptyPreferencias() {
  return {
    momento_vida: [],
    estrategia_acoes: [],
    teses_fiis: [],
    renda_fixa: {
      indexador: "",
      trava_acima_3_anos: "",
      credito_privado: "",
    },
    restricoes: [],
    mapeamento_qualitativo: {
      expectativa_comportamento: "",
      eventos_liquidez: "",
      historico_vieses: "",
      legado_protecao: "",
    },
  };
}

/**
 * @param {unknown} saved
 */
export function normalizePreferencias(saved) {
  const base = emptyPreferencias();
  const data = saved && typeof saved === "object" ? saved : {};
  return {
    ...base,
    ...data,
    renda_fixa: {
      ...base.renda_fixa,
      ...(data.renda_fixa || {}),
    },
    mapeamento_qualitativo: {
      ...base.mapeamento_qualitativo,
      ...(data.mapeamento_qualitativo || {}),
    },
    momento_vida: Array.isArray(data.momento_vida) ? data.momento_vida : [],
    estrategia_acoes: Array.isArray(data.estrategia_acoes)
      ? data.estrategia_acoes
      : [],
    teses_fiis: Array.isArray(data.teses_fiis) ? data.teses_fiis : [],
    restricoes: Array.isArray(data.restricoes) ? data.restricoes : [],
  };
}
