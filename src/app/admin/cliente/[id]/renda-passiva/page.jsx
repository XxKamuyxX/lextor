"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PassiveIncomeChart } from "@/components/dashboard/PassiveIncomeChart";
import { staggerContainer } from "@/components/dashboard/motion-variants";

const TIPOS_PROVENTO = ["Dividendo", "JCP", "Rendimento FII", "Outros"];

const emptyProventoForm = () => ({
  ticker: "",
  tipo: "Dividendo",
  valor_total: "",
  data_pagamento: new Date().toISOString().slice(0, 10),
});

export default function AdminClienteRendaPassivaPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cliente, setCliente] = useState(null);

  const [proventoModalOpen, setProventoModalOpen] = useState(false);
  const [proventoForm, setProventoForm] = useState(emptyProventoForm);
  const [savingProvento, setSavingProvento] = useState(false);
  const [proventoFormError, setProventoFormError] = useState(null);
  const [dividendosRefreshKey, setDividendosRefreshKey] = useState(0);

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

        if (!id) throw new Error("ID do cliente inválido.");

        const res = await fetch(`/api/admin/clientes/${id}/dividendos`, {
          credentials: "same-origin",
        });
        const data = await res.json();

        if (res.status === 401) {
          router.replace("/admin");
          return;
        }
        if (!res.ok) {
          throw new Error(
            data.message || "Não foi possível carregar a renda passiva."
          );
        }

        if (!cancelled) setCliente(data.cliente);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Não foi possível carregar a renda passiva.");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  function openProventoModal() {
    setProventoForm(emptyProventoForm());
    setProventoFormError(null);
    setProventoModalOpen(true);
  }

  function closeProventoModal() {
    if (savingProvento) return;
    setProventoModalOpen(false);
    setProventoFormError(null);
  }

  async function handleSaveProvento(e) {
    e.preventDefault();
    setSavingProvento(true);
    setProventoFormError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/clientes/${id}/dividendos`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: proventoForm.ticker,
          tipo: proventoForm.tipo,
          valor_total: Number(
            String(proventoForm.valor_total).replace(",", ".")
          ),
          data_pagamento: proventoForm.data_pagamento,
        }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Erro ao salvar provento.");
      }

      setProventoModalOpen(false);
      setProventoForm(emptyProventoForm());
      setMessage("Provento registrado com sucesso.");
      setDividendosRefreshKey((k) => k + 1);
    } catch (err) {
      setProventoFormError(err?.message || "Erro ao salvar provento.");
    } finally {
      setSavingProvento(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando renda passiva...</p>
        </div>
      </div>
    );
  }

  const nome = cliente?.nome || "Cliente";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Renda Passiva</h1>
          <p className="mt-1 text-sm text-slate-400">
            Proventos e efeito bola de neve de {nome}
          </p>
        </div>
        <button
          type="button"
          onClick={openProventoModal}
          className="rounded-lg border border-blue-700/60 bg-blue-950/40 px-4 py-2.5 text-sm font-semibold text-blue-200 transition hover:border-blue-500 hover:bg-blue-900/40"
        >
          Lançar Provento
        </button>
      </div>

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
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <PassiveIncomeChart
          clienteId={id}
          refreshKey={dividendosRefreshKey}
        />
      </motion.section>

      {proventoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-lancar-provento-title"
          onClick={closeProventoModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-blue-900/50 bg-slate-900 p-6 shadow-2xl shadow-blue-950/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="modal-lancar-provento-title"
                  className="text-lg font-semibold text-white"
                >
                  Lançar Provento
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Renda passiva de {nome} ({id.slice(0, 8)}…)
                </p>
              </div>
              <button
                type="button"
                onClick={closeProventoModal}
                className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm text-slate-400 transition hover:text-white"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProvento} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="provento_ticker"
                  className="block text-xs font-medium text-slate-400"
                >
                  Ticker do Ativo
                </label>
                <input
                  id="provento_ticker"
                  type="text"
                  required
                  value={proventoForm.ticker}
                  onChange={(e) =>
                    setProventoForm((f) => ({ ...f, ticker: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm uppercase text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                  placeholder="PETR4, MXRF11, ITUB3..."
                />
              </div>

              <div>
                <label
                  htmlFor="provento_tipo"
                  className="block text-xs font-medium text-slate-400"
                >
                  Tipo
                </label>
                <select
                  id="provento_tipo"
                  required
                  value={proventoForm.tipo}
                  onChange={(e) =>
                    setProventoForm((f) => ({ ...f, tipo: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                >
                  {TIPOS_PROVENTO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="provento_valor"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Valor Total (R$)
                  </label>
                  <input
                    id="provento_valor"
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={proventoForm.valor_total}
                    onChange={(e) =>
                      setProventoForm((f) => ({
                        ...f,
                        valor_total: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="provento_data"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Data do Pagamento
                  </label>
                  <input
                    id="provento_data"
                    type="date"
                    required
                    value={proventoForm.data_pagamento}
                    onChange={(e) =>
                      setProventoForm((f) => ({
                        ...f,
                        data_pagamento: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                  />
                </div>
              </div>

              {proventoFormError && (
                <p className="rounded-lg border border-red-800/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {proventoFormError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeProventoModal}
                  disabled={savingProvento}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProvento}
                  className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {savingProvento ? "Salvando..." : "Salvar provento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
