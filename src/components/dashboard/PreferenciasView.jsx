"use client";

import {
  INDEXADOR_LABELS,
  MOMENTO_VIDA,
  RESTRICOES,
  SIM_NAO_LABELS,
  ESTRATEGIA_ACOES,
  TESES_FIIS,
} from "@/lib/preferencias-investimento";

function FormCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-sky-900/50 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20">
      <div className="mb-5 border-b border-sky-950/80 pb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ChipList({ options, selected, danger = false }) {
  const active = options.filter((option) => selected.includes(option));
  if (active.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma opção selecionada.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {active.map((option) => (
        <li
          key={option}
          className={`rounded-xl border px-3.5 py-2 text-sm leading-snug ${
            danger
              ? "border-red-800/70 bg-red-950/30 text-red-100"
              : "border-sky-700/60 bg-sky-950/30 text-sky-50"
          }`}
        >
          {option}
        </li>
      ))}
    </ul>
  );
}

function ReadValue({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-200">{label}</p>
      <p className="mt-1.5 text-sm text-slate-300">
        {value || <span className="text-slate-500">Não informado</span>}
      </p>
    </div>
  );
}

function TextBlock({ label, description, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-200">{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      <div className="mt-3 min-h-[4.5rem] rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-3 text-sm leading-relaxed text-slate-200">
        {value?.trim() ? (
          value
        ) : (
          <span className="text-slate-500">Sem resposta registrada.</span>
        )}
      </div>
    </div>
  );
}

/**
 * Visualização somente leitura do mapeamento estratégico.
 * @param {{ preferencias: object }} props
 */
export function PreferenciasView({ preferencias }) {
  const rf = preferencias?.renda_fixa || {};
  const qualitativo = preferencias?.mapeamento_qualitativo || {};

  return (
    <div className="space-y-6">
      <FormCard
        title="1. Momento de Vida e Objetivos"
        subtitle="Seleções registradas pelo consultor"
      >
        <ChipList
          options={MOMENTO_VIDA}
          selected={preferencias.momento_vida || []}
        />
      </FormCard>

      <FormCard
        title="2. Estratégia de Ações — Brasil e Exterior"
        subtitle="Teses de renda variável"
      >
        <ChipList
          options={ESTRATEGIA_ACOES}
          selected={preferencias.estrategia_acoes || []}
        />
      </FormCard>

      <FormCard
        title="3. Teses de Fundos Imobiliários e Fiagros"
        subtitle="Segmentos de interesse"
      >
        <ChipList
          options={TESES_FIIS}
          selected={preferencias.teses_fiis || []}
        />
      </FormCard>

      <FormCard
        title="4. Renda Fixa e Perfil de Liquidez"
        subtitle="Preferências de indexador e crédito"
      >
        <div className="space-y-4">
          <ReadValue
            label="Indexador preferido"
            value={INDEXADOR_LABELS[rf.indexador] || rf.indexador}
          />
          <ReadValue
            label="Aceita travar o dinheiro por mais de 3 anos por taxas maiores?"
            value={SIM_NAO_LABELS[rf.trava_acima_3_anos] || rf.trava_acima_3_anos}
          />
          <ReadValue
            label="Interesse em Crédito Privado (Debêntures, CRIs, CRAs)?"
            value={SIM_NAO_LABELS[rf.credito_privado] || rf.credito_privado}
          />
        </div>
      </FormCard>

      <FormCard
        title="5. Restrições e Exclusões"
        subtitle="O que não deve entrar na carteira"
      >
        <ChipList
          options={RESTRICOES}
          selected={preferencias.restricoes || []}
          danger
        />
      </FormCard>

      <FormCard
        title="6. Mapeamento Qualitativo"
        subtitle="Contexto comportamental e patrimonial"
      >
        <div className="space-y-5">
          <TextBlock
            label="Expectativa e Comportamento"
            description="Expectativa de rentabilidade e reação a um ano negativo."
            value={qualitativo.expectativa_comportamento}
          />
          <TextBlock
            label="Eventos de Liquidez"
            description="Necessidade de resgate relevante nos próximos 1 a 3 anos."
            value={qualitativo.eventos_liquidez}
          />
          <TextBlock
            label="Histórico e Vieses"
            description="Melhor e pior investimento — aprendizados."
            value={qualitativo.historico_vieses}
          />
          <TextBlock
            label="Legado e Proteção"
            description="Sucessão, blindagem patrimonial ou herança."
            value={qualitativo.legado_protecao}
          />
        </div>
      </FormCard>
    </div>
  );
}
