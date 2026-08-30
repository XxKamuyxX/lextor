"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const MOMENTO_VIDA = [
  "Acumulação agressiva de patrimônio",
  "Transição para viver de renda (Aposentadoria)",
  "Preservação de capital contra inflação",
  "Sucessão patrimonial / Herança",
  "Compra de imóvel ou bens de alto valor",
  "Custear educação dos filhos",
  "Reserva para ano sabático / Empreendedorismo",
];

const ESTRATEGIA_ACOES = [
  "Foco exclusivo em Dividendos (Vacas Leiteiras)",
  "Foco em Crescimento e Valorização (Growth / Small Caps)",
  "Setores Defensivos (Energia, Saneamento, Seguros, Bancos)",
  "Setores Cíclicos (Varejo, Commodities, Construção)",
  "Exposição ao Dólar / BDRs / Ações Globais",
  "Aceita investir em Estatais (Petrobras, Banco do Brasil, etc.)",
];

const TESES_FIIS = [
  "FIIs de Papel / Recebíveis (Foco em dividendos altos, atrelados ao CDI/IPCA)",
  "Galpões Logísticos (E-commerce e infraestrutura)",
  "Shoppings Centers",
  "Lajes Corporativas (Escritórios)",
  "Fiagros (Exposição ao Agronegócio)",
  "FIIs de Infraestrutura (Isentos de IR)",
];

const RESTRICOES = [
  "ZERO Criptomoedas",
  "ZERO Empresas Estatais (Risco político)",
  "ZERO Varejo",
  "ZERO Ativos sem liquidez diária",
  "ZERO Setores polêmicos (Armas, Jogos de Azar)",
];

const emptyPreferencias = () => ({
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
});

export default function AdminPreferenciasPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [preferencias, setPreferencias] = useState(emptyPreferencias);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionRes = await fetch("/api/admin/session");
        const sessionData = await sessionRes.json();
        if (!sessionData.autenticado) {
          router.replace("/admin");
          return;
        }

        if (!id) throw new Error("ID do cliente inválido.");

        const res = await fetch(`/api/admin/clientes/${id}`, {
          credentials: "same-origin",
        });
        const data = await res.json();

        if (res.status === 401) {
          router.replace("/admin");
          return;
        }
        if (!res.ok) {
          throw new Error(data.message || "Não foi possível carregar o cliente.");
        }

        if (!cancelled) {
          setCliente(data.cliente);
          const saved = data.cliente?.preferencias_investimento || {};
          setPreferencias({
            ...emptyPreferencias(),
            ...saved,
            renda_fixa: {
              ...emptyPreferencias().renda_fixa,
              ...(saved.renda_fixa || {}),
            },
            mapeamento_qualitativo: {
              ...emptyPreferencias().mapeamento_qualitativo,
              ...(saved.mapeamento_qualitativo || {}),
            },
            momento_vida: saved.momento_vida || [],
            estrategia_acoes: saved.estrategia_acoes || [],
            teses_fiis: saved.teses_fiis || [],
            restricoes: saved.restricoes || [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Erro ao carregar preferências.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function toggleCheckbox(field, value) {
    setPreferencias((prev) => {
      const list = Array.isArray(prev[field]) ? prev[field] : [];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [field]: next };
    });
  }

  function setRendaFixa(field, value) {
    setPreferencias((prev) => ({
      ...prev,
      renda_fixa: {
        ...prev.renda_fixa,
        [field]: value,
      },
    }));
  }

  function setQualitativo(field, value) {
    setPreferencias((prev) => ({
      ...prev,
      mapeamento_qualitativo: {
        ...prev.mapeamento_qualitativo,
        [field]: value,
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...preferencias,
        atualizado_em: new Date().toISOString(),
        atualizado_por: "admin",
      };

      const res = await fetch(`/api/admin/clientes/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferencias_investimento: payload }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) {
        throw new Error(
          data.message ||
            "Não foi possível salvar. Confirme a coluna preferencias_investimento (jsonb)."
        );
      }

      setCliente(data.cliente);
      setToast({
        type: "success",
        text: "Mapeamento estratégico salvo com sucesso.",
      });
    } catch (err) {
      setError(err?.message || "Erro ao salvar mapeamento.");
      setToast({
        type: "error",
        text: err?.message || "Erro ao salvar mapeamento.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando mapeamento...</p>
        </div>
      </div>
    );
  }

  const nome = cliente?.nome || "Cliente";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.14)_0%,_transparent_55%)]"
        aria-hidden
      />

      {toast && (
        <div
          role="status"
          className={`fixed right-4 top-4 z-[60] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl transition ${
            toast.type === "success"
              ? "border-emerald-700/60 bg-emerald-950/95 text-emerald-100"
              : "border-red-800/60 bg-red-950/95 text-red-100"
          }`}
        >
          {toast.text}
        </div>
      )}

      <header className="relative z-10 border-b border-sky-950/80 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-600">
              Aprofundamento de Objetivos e Teses
            </p>
            <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {nome}
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-500">ID: {id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/cliente/${id}`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-sky-700 hover:text-sky-300"
            >
              ← Carteira
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-sky-700 hover:text-sky-300"
            >
              Painel
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-10">
        <p className="mb-8 text-sm text-slate-400">
          Mapeie objetivos, teses e restrições do cliente. As respostas são
          salvas em JSON na coluna{" "}
          <code className="text-sky-300">preferencias_investimento</code>.
        </p>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormCard
            title="1. Momento de Vida e Objetivos"
            subtitle="Múltipla escolha — selecione todos que se aplicam"
          >
            <CheckboxGroup
              options={MOMENTO_VIDA}
              selected={preferencias.momento_vida}
              onToggle={(value) => toggleCheckbox("momento_vida", value)}
            />
          </FormCard>

          <FormCard
            title="2. Estratégia de Ações — Brasil e Exterior"
            subtitle="Checkboxes — teses de renda variável"
          >
            <CheckboxGroup
              options={ESTRATEGIA_ACOES}
              selected={preferencias.estrategia_acoes}
              onToggle={(value) => toggleCheckbox("estrategia_acoes", value)}
            />
          </FormCard>

          <FormCard
            title="3. Teses de Fundos Imobiliários e Fiagros"
            subtitle="Checkboxes — segmentos de interesse"
          >
            <CheckboxGroup
              options={TESES_FIIS}
              selected={preferencias.teses_fiis}
              onToggle={(value) => toggleCheckbox("teses_fiis", value)}
            />
          </FormCard>

          <FormCard
            title="4. Renda Fixa e Perfil de Liquidez"
            subtitle="Radios e checkboxes de perfil"
          >
            <fieldset className="space-y-5">
              <RadioGroup
                legend="Indexador preferido"
                name="indexador"
                value={preferencias.renda_fixa.indexador}
                onChange={(value) => setRendaFixa("indexador", value)}
                options={[
                  { value: "hibrido_ipca", label: "Híbrido (IPCA+)" },
                  { value: "pos_cdi", label: "Pós-fixado (CDI)" },
                  { value: "pre_fixado", label: "Pré-fixado" },
                ]}
              />

              <RadioGroup
                legend="Aceita travar o dinheiro por mais de 3 anos por taxas maiores?"
                name="trava_acima_3_anos"
                value={preferencias.renda_fixa.trava_acima_3_anos}
                onChange={(value) => setRendaFixa("trava_acima_3_anos", value)}
                options={[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ]}
              />

              <RadioGroup
                legend="Interesse em Crédito Privado (Debêntures, CRIs, CRAs)?"
                name="credito_privado"
                value={preferencias.renda_fixa.credito_privado}
                onChange={(value) => setRendaFixa("credito_privado", value)}
                options={[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ]}
              />
            </fieldset>
          </FormCard>

          <FormCard
            title="5. Restrições e Exclusões"
            subtitle="O que NÃO comprar de jeito nenhum"
          >
            <CheckboxGroup
              options={RESTRICOES}
              selected={preferencias.restricoes}
              onToggle={(value) => toggleCheckbox("restricoes", value)}
              danger
            />
          </FormCard>

          <FormCard
            title="6. Mapeamento Qualitativo (Perguntas Abertas)"
            subtitle="Respostas em texto livre — contexto comportamental e patrimonial"
          >
            <div className="space-y-5">
              <TextAreaField
                id="expectativa_comportamento"
                label="Expectativa e Comportamento"
                description="Qual a sua expectativa real de rentabilidade anual e como você reagiria (emocionalmente e financeiramente) se a sua carteira fechasse um ano inteiro no negativo?"
                value={
                  preferencias.mapeamento_qualitativo
                    ?.expectativa_comportamento || ""
                }
                onChange={(value) =>
                  setQualitativo("expectativa_comportamento", value)
                }
              />
              <TextAreaField
                id="eventos_liquidez"
                label="Eventos de Liquidez"
                description="Existe alguma previsão de necessidade de resgate de uma parcela significativa desse capital nos próximos 1 a 3 anos? (Ex: compra de imóvel, mudança de país, saída de sociedade, casamento)."
                value={
                  preferencias.mapeamento_qualitativo?.eventos_liquidez || ""
                }
                onChange={(value) => setQualitativo("eventos_liquidez", value)}
              />
              <TextAreaField
                id="historico_vieses"
                label="Histórico e Vieses"
                description="Qual foi o seu melhor e o seu pior investimento até hoje? O que você aprendeu com eles?"
                value={
                  preferencias.mapeamento_qualitativo?.historico_vieses || ""
                }
                onChange={(value) => setQualitativo("historico_vieses", value)}
              />
              <TextAreaField
                id="legado_protecao"
                label="Legado e Proteção"
                description="Há alguma preocupação específica com sucessão familiar, blindagem patrimonial ou herança que precisamos considerar na estruturação da carteira desde o dia 1?"
                value={
                  preferencias.mapeamento_qualitativo?.legado_protecao || ""
                }
                onChange={(value) => setQualitativo("legado_protecao", value)}
              />
            </div>
          </FormCard>

          <div className="sticky bottom-4 z-20 flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/40 transition hover:bg-sky-500 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar Mapeamento Estratégico"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

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

function CheckboxGroup({ options, selected, onToggle, danger = false }) {
  return (
    <ul className="space-y-2.5">
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <li key={option}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
                checked
                  ? danger
                    ? "border-red-800/70 bg-red-950/30"
                    : "border-sky-700/60 bg-sky-950/30"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option)}
                className={`mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-900 focus:ring-sky-500/40 ${
                  danger
                    ? "text-red-500 focus:ring-red-500/30"
                    : "text-sky-500"
                }`}
              />
              <span
                className={`text-sm leading-snug ${
                  checked
                    ? danger
                      ? "text-red-100"
                      : "text-sky-50"
                    : "text-slate-300"
                }`}
              >
                {option}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function RadioGroup({ legend, name, value, onChange, options }) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-medium text-slate-200">{legend}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition ${
                checked
                  ? "border-sky-700/60 bg-sky-950/30 text-sky-50"
                  : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="h-4 w-4 border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500/40"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TextAreaField({ id, label, description, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 min-h-[6rem] w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
        placeholder="Digite a resposta do cliente..."
      />
    </div>
  );
}
