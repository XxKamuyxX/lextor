"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSessionUser } from "@/lib/cliente";
import { authHeaders, getAccessTokenFromBrowser } from "@/lib/auth-fetch";
import { UserShell } from "@/components/app/user-shell";

const CLASSES_ATIVOS = [
  { id: "fiis", label: "FIIs" },
  { id: "acoes", label: "Ações" },
  { id: "renda_fixa", label: "Renda Fixa" },
  { id: "etfs", label: "ETFs" },
  { id: "internacional", label: "Internacional" },
];

const SETORES = [
  "Logística",
  "Shopping",
  "Papel / CRIs",
  "Bancos",
  "Energia",
  "Commodities",
  "Tecnologia",
  "Saúde",
  "Consumo",
  "Agronegócio",
];

const OBJETIVOS = [
  "Geração de renda mensal",
  "Crescimento de patrimônio",
  "Proteção contra inflação",
  "Reserva para objetivos de médio prazo",
  "Sucessão / planejamento patrimonial",
];

const emptyForm = {
  classes_interesse: [],
  setores_desejados: [],
  objetivos: [],
  horizonte_tese: "",
  alocacao_desejada: "",
  restricoes: "",
  teses_abertas: "",
};

export default function PreferenciasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const user = await getSessionUser(supabase);
        if (!user) {
          router.replace("/login");
          return;
        }

        const accessToken = await getAccessTokenFromBrowser(supabase);
        const res = await fetch("/api/cliente/me", {
          credentials: "same-origin",
          headers: authHeaders(accessToken),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error(data.message || "Não foi possível carregar as preferências.");
        }

        if (!cancelled) {
          setUserEmail(user.email ?? null);
          setClienteId(data.cliente.id);
          setForm({
            ...emptyForm,
            ...(data.cliente.preferencias_investimento || {}),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Não foi possível carregar as preferências.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function toggleArrayItem(field, value) {
    setForm((prev) => {
      const list = prev[field] || [];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const user = await getSessionUser(supabase);
      if (!user) {
        router.replace("/login");
        return;
      }

      let id = clienteId;
      if (!id) {
        const cliente = await ensureCliente(supabase, user);
        id = cliente.id;
        setClienteId(id);
      }

      const { error: updateError } = await supabase
        .from("clientes")
        .update({
          preferencias_investimento: {
            ...form,
            atualizado_em: new Date().toISOString(),
          },
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setMessage("Preferências salvas com sucesso.");
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível salvar. Confirme a coluna preferencias_investimento (jsonb) em clientes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Carregando preferências...
      </div>
    );
  }

  return (
    <UserShell email={userEmail}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
            Nível 2 · Preferências profundas
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Teses e Objetivos de Investimento
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Este questionário é opcional e não bloqueia o primeiro acesso.
            Use-o para registrar desejos setoriais e teses de longo prazo
            além do suitability regulatório.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-sky-900/50 bg-slate-900/70 p-8 shadow-xl shadow-sky-950/30"
        >
          <fieldset>
            <legend className="text-sm font-semibold text-white">
              Classes de ativos de interesse
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {CLASSES_ATIVOS.map((item) => {
                const active = form.classes_interesse?.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleArrayItem("classes_interesse", item.id)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      active
                        ? "border-sky-500 bg-sky-950/50 text-sky-200"
                        : "border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-white">
              Setores desejados
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SETORES.map((setor) => {
                const active = form.setores_desejados?.includes(setor);
                return (
                  <button
                    key={setor}
                    type="button"
                    onClick={() => toggleArrayItem("setores_desejados", setor)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      active
                        ? "border-sky-500 bg-sky-950/50 text-sky-200"
                        : "border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {setor}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-white">
              Objetivos de investimento
            </legend>
            <div className="mt-3 space-y-2">
              {OBJETIVOS.map((objetivo) => {
                const active = form.objetivos?.includes(objetivo);
                return (
                  <label
                    key={objetivo}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                      active
                        ? "border-sky-500 bg-sky-950/40 text-sky-100"
                        : "border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!active}
                      onChange={() => toggleArrayItem("objetivos", objetivo)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                    />
                    {objetivo}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="horizonte_tese"
              className="block text-sm font-semibold text-white"
            >
              Horizonte das suas teses
            </label>
            <select
              id="horizonte_tese"
              value={form.horizonte_tese}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, horizonte_tese: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            >
              <option value="">Selecione</option>
              <option value="curto">Curto prazo (até 2 anos)</option>
              <option value="medio">Médio prazo (2 a 5 anos)</option>
              <option value="longo">Longo prazo (acima de 5 anos)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="alocacao_desejada"
              className="block text-sm font-semibold text-white"
            >
              Alocação desejada (múltipla escolha descritiva)
            </label>
            <select
              id="alocacao_desejada"
              value={form.alocacao_desejada}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  alocacao_desejada: e.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            >
              <option value="">Selecione</option>
              <option value="conservadora">
                Predominância de Renda Fixa
              </option>
              <option value="balanceada">
                Balanceada (RF + FIIs + Ações)
              </option>
              <option value="crescimento">
                Foco em crescimento (Ações / ETFs)
              </option>
              <option value="renda">Foco em renda (FIIs / RF)
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="restricoes"
              className="block text-sm font-semibold text-white"
            >
              Restrições ou temas a evitar
            </label>
            <textarea
              id="restricoes"
              rows={3}
              value={form.restricoes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, restricoes: e.target.value }))
              }
              placeholder="Ex.: evitar commodities cíclicas, sem exposição a empresas X..."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>

          <div>
            <label
              htmlFor="teses_abertas"
              className="block text-sm font-semibold text-white"
            >
              Teses e desejos em texto aberto
            </label>
            <textarea
              id="teses_abertas"
              rows={5}
              value={form.teses_abertas}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, teses_abertas: e.target.value }))
              }
              placeholder="Descreva teses que gostaria de desenvolver com a consultoria..."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>

          {message && (
            <p
              role="status"
              className="rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar preferências"}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </form>
      </div>
    </UserShell>
  );
}
