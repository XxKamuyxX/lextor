"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  formatBRL,
  summarizeAportes,
  tickerDoAporte,
} from "@/lib/cliente";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { CarteiraCharts } from "@/components/dashboard/carteira-charts";
import {
  staggerContainer,
  staggerItem,
} from "@/components/dashboard/motion-variants";

const TIPOS_ATIVO = ["Ação", "FII", "Renda Fixa"];

const emptyForm = () => ({
  tipo_ativo: "Ação",
  ticker: "",
  quantidade: "",
  preco_medio: "",
  data: new Date().toISOString().slice(0, 10),
});

export default function AdminClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [booting, setBooting] = useState(true);
  const [loadingCarteira, setLoadingCarteira] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [precos, setPrecos] = useState({});
  const [summaryApi, setSummaryApi] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadCarteira = useCallback(async () => {
    if (!id) return;

    setLoadingCarteira(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clientes/${id}/aportes`, {
        credentials: "same-origin",
      });
      const data = await res.json();

      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Não foi possível carregar a carteira.");
      }

      setCliente(data.cliente);
      setAportes(data.aportes ?? []);
      setPrecos(data.precos ?? {});
      setSummaryApi(data.summary ?? null);
    } catch (err) {
      setError(
        err?.message || "Não foi possível carregar a carteira do cliente."
      );
    } finally {
      setLoadingCarteira(false);
    }
  }, [id, router]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const sessionRes = await fetch("/api/admin/session");
        const sessionData = await sessionRes.json();
        if (!sessionData.autenticado) {
          router.replace("/admin");
          return;
        }

        if (!id) {
          throw new Error("ID do cliente inválido.");
        }

        if (!cancelled) {
          await loadCarteira();
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message || "Não foi possível carregar a carteira do cliente."
          );
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [id, router, loadCarteira]);

  const summary = useMemo(() => {
    if (summaryApi) return summaryApi;
    return summarizeAportes(aportes, precos);
  }, [summaryApi, aportes, precos]);

  function openModal() {
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setFormError(null);
  }

  async function handleSaveAporte(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/clientes/${id}/aportes`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_ativo: form.tipo_ativo,
          ticker: form.ticker,
          quantidade: Number(String(form.quantidade).replace(",", ".")),
          preco_medio: Number(String(form.preco_medio).replace(",", ".")),
          data: form.data,
        }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Erro ao salvar aporte.");
      }

      setModalOpen(false);
      setForm(emptyForm());
      setMessage("Aporte registrado com sucesso.");
      await loadCarteira();
    } catch (err) {
      setFormError(err?.message || "Erro ao salvar aporte.");
    } finally {
      setSaving(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando cockpit...</p>
        </div>
      </div>
    );
  }

  const nome = cliente?.nome || "Cliente";
  const email = cliente?.email || "—";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.14)_0%,_transparent_55%)]"
        aria-hidden
      />

      <header className="relative z-10 border-b border-sky-950/80 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-600">
              Cockpit do Consultor
            </p>
            <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {nome}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {email}
              <span className="mx-2 text-slate-700">·</span>
              <span className="font-mono text-xs text-slate-500">ID: {id}</span>
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-sky-700 hover:text-sky-300"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-8 px-6 py-10">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
            {message}
          </p>
        )}

        <motion.section
          className="grid gap-4 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <SummaryCard
            label="Patrimônio Total"
            value={summary.patrimonio}
            format="brl"
            hint="Quantidade × preço atual (cotações)"
          />
          <SummaryCard
            label="Total Aportado"
            value={summary.totalAportado}
            format="brl"
            hint="Soma dos aportes registrados"
          />
          <SummaryCard
            label="Rentabilidade"
            value={summary.rentabilidade}
            format="percent"
            hint="Patrimônio vs. capital aportado"
            accent={
              summary.rentabilidade >= 0 ? "text-emerald-400" : "text-red-400"
            }
          />
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <CarteiraCharts aportes={aportes} precos={precos} />
        </motion.section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Carteira do cliente
              </h2>
              <p className="text-sm text-slate-400">
                Aportes cruzados com o último preço em cotacoes_historicas
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/cliente/${id}/preferencias`}
                className="rounded-lg border border-sky-800/70 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-slate-900"
              >
                Objetivos e Teses
              </Link>
              <button
                type="button"
                onClick={openModal}
                className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Novo Aporte
              </button>
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={staggerItem}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-sky-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] cursor-default"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5 font-medium">Tipo</th>
                      <th className="px-6 py-3.5 font-medium">Ticker</th>
                      <th className="px-6 py-3.5 font-medium">Quantidade</th>
                      <th className="px-6 py-3.5 font-medium">Preço médio</th>
                      <th className="px-6 py-3.5 font-medium">Preço atual</th>
                      <th className="px-6 py-3.5 font-medium">Valor atual</th>
                      <th className="px-6 py-3.5 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {loadingCarteira ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          Atualizando carteira...
                        </td>
                      </tr>
                    ) : aportes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          Nenhum aporte registrado. Use &quot;Novo Aporte&quot;
                          para começar.
                        </td>
                      </tr>
                    ) : (
                      aportes.map((aporte) => {
                        const ticker =
                          aporte.ticker_normalizado || tickerDoAporte(aporte);
                        const precoMedio = Number(
                          aporte.preco_medio ?? aporte.preco ?? 0
                        );
                        const precoAtual =
                          aporte.preco_atual != null
                            ? Number(aporte.preco_atual)
                            : ticker && precos[ticker] != null
                              ? Number(precos[ticker])
                              : null;
                        const valorAtual =
                          aporte.valor_atual != null
                            ? Number(aporte.valor_atual)
                            : Number(aporte.quantidade ?? 0) *
                              (precoAtual != null ? precoAtual : precoMedio);
                        const dataExibir =
                          aporte.data_aporte ||
                          aporte.data ||
                          aporte.created_at;

                        return (
                          <tr
                            key={aporte.id}
                            className="transition hover:bg-slate-900/80"
                          >
                            <td className="px-6 py-4 text-slate-300">
                              {aporte.tipo_ativo || "—"}
                            </td>
                            <td className="px-6 py-4 font-medium text-white">
                              {ticker || aporte.ticker || aporte.ativo || "—"}
                            </td>
                            <td className="px-6 py-4 tabular-nums text-slate-300">
                              {Number(aporte.quantidade ?? 0).toLocaleString(
                                "pt-BR"
                              )}
                            </td>
                            <td className="px-6 py-4 tabular-nums text-slate-300">
                              {formatBRL(precoMedio)}
                            </td>
                            <td className="px-6 py-4 tabular-nums text-sky-300">
                              {precoAtual != null
                                ? formatBRL(precoAtual)
                                : "—"}
                            </td>
                            <td className="px-6 py-4 tabular-nums font-medium text-white">
                              {formatBRL(valorAtual)}
                            </td>
                            <td className="px-6 py-4 tabular-nums text-slate-400">
                              {formatData(dataExibir)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-novo-aporte-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-sky-900/60 bg-slate-900 p-6 shadow-2xl shadow-sky-950/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="modal-novo-aporte-title"
                  className="text-lg font-semibold text-white"
                >
                  Novo Aporte
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Vinculado a {nome} ({id.slice(0, 8)}…)
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm text-slate-400 transition hover:text-white"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAporte} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="tipo_ativo"
                  className="block text-xs font-medium text-slate-400"
                >
                  Tipo de Ativo
                </label>
                <select
                  id="tipo_ativo"
                  required
                  value={form.tipo_ativo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tipo_ativo: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                >
                  {TIPOS_ATIVO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ticker"
                  className="block text-xs font-medium text-slate-400"
                >
                  Ticker
                </label>
                <input
                  id="ticker"
                  type="text"
                  required
                  value={form.ticker}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ticker: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm uppercase text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                  placeholder="PETR4, MXRF11, Tesouro..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="quantidade"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Quantidade
                  </label>
                  <input
                    id="quantidade"
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={form.quantidade}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quantidade: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="preco_medio"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Preço Médio
                  </label>
                  <input
                    id="preco_medio"
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={form.preco_medio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, preco_medio: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                    placeholder="28.50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="block text-xs font-medium text-slate-400"
                >
                  Data
                </label>
                <input
                  id="data"
                  type="date"
                  required
                  value={form.data}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, data: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                />
              </div>

              {formError && (
                <p className="rounded-lg border border-red-800/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar aporte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
