/** Questionário regulatório rápido — 5 perguntas essenciais. */

export const SUITABILITY_QUESTIONS = [
  {
    id: "horizonte",
    title: "Horizonte de investimento",
    description: "Por quanto tempo você pretende manter os recursos investidos?",
    options: [
      { label: "Até 1 ano", value: 1 },
      { label: "De 1 a 3 anos", value: 2 },
      { label: "De 3 a 5 anos", value: 3 },
      { label: "Acima de 5 anos", value: 4 },
    ],
  },
  {
    id: "tolerancia",
    title: "Tolerância a quedas",
    description:
      "Como você reagiria a uma queda temporária de 20% na carteira?",
    options: [
      { label: "Resgataria tudo imediatamente", value: 1 },
      { label: "Ficaria preocupado e reduziria exposição", value: 2 },
      { label: "Manteria a estratégia com acompanhamento", value: 3 },
      { label: "Aportaria mais aproveitando o preço", value: 4 },
    ],
  },
  {
    id: "objetivo",
    title: "Objetivo principal",
    description: "Qual é o principal objetivo dos seus investimentos?",
    options: [
      { label: "Preservar capital com baixa volatilidade", value: 1 },
      { label: "Renda periódica com risco controlado", value: 2 },
      { label: "Crescimento equilibrado do patrimônio", value: 3 },
      { label: "Maximizar retorno no longo prazo", value: 4 },
    ],
  },
  {
    id: "experiencia",
    title: "Experiência com investimentos",
    description: "Qual o seu nível de conhecimento e prática no mercado?",
    options: [
      { label: "Iniciante — pouco ou nenhum contato", value: 1 },
      { label: "Básico — já investiu em produtos simples", value: 2 },
      { label: "Intermediário — acompanha carteira regularmente", value: 3 },
      { label: "Avançado — opera ativos e estratégias diversas", value: 4 },
    ],
  },
  {
    id: "capacidade",
    title: "Capacidade financeira",
    description:
      "Qual percentual da sua renda mensal você pode destinar a investimentos sem comprometer o orçamento?",
    options: [
      { label: "Até 5%", value: 1 },
      { label: "De 5% a 15%", value: 2 },
      { label: "De 15% a 30%", value: 3 },
      { label: "Acima de 30%", value: 4 },
    ],
  },
];

/**
 * Calcula o perfil a partir das respostas (valores 1–4).
 * @param {Record<string, number>} answers
 * @returns {"Conservador" | "Moderado" | "Arrojado"}
 */
export function calculatePerfil(answers) {
  const values = SUITABILITY_QUESTIONS.map((q) => Number(answers[q.id] || 0));
  const total = values.reduce((sum, v) => sum + v, 0);
  const max = SUITABILITY_QUESTIONS.length * 4;
  const ratio = max > 0 ? total / max : 0;

  if (ratio <= 0.4) return "Conservador";
  if (ratio <= 0.7) return "Moderado";
  return "Arrojado";
}
