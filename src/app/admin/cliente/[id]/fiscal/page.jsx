"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { FiscalOverview } from "@/components/dashboard/FiscalOverview";

const TIPOS_VENDA = ["Ação", "FII", "ETF"];

const emptyForm = () => ({
  ticker: "",
  tipo: "Ação",
  quantidade: "",
  preco_venda: "",
  data_venda: new Date().toISOString().slice(0, 10),
});

export default function AdminClienteFiscalPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [vendas, setVendas] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadVendas = useCallback(async () => {
    if (!id) return;
    setError(null);

    const res = await fetch(`/api/admin/clientes/${id}/vendas`, {
      credentials: "same-origin",
    });
    const data = await res.json();

    if (res.status === 401) {
      router.replace("/admin");
      return;
    }
    if (!res.ok) {
      throw new Error(data.message || "Não foi possível carregar as vendas.");
    }

    setCliente(data.cliente);
    setVendas(data.vendas ?? []);
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
        if (!id) throw new Error("ID do cliente inválido.");
        if (!cancelled) await loadVendas();
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Não foi possível carregar o painel fiscal.");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [id, router, loadVendas]);

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

  async function handleSaveVenda(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/clientes/${id}/vendas`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: form.ticker,
          tipo: form.tipo,
          quantidade: Number(String(form.quantidade).replace(",", ".")),
          preco_venda: Number(String(form.preco_venda).replace(",", ".")),
          data_venda: form.data_venda,
        }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Erro ao registrar venda.");
      }

      setModalOpen(false);
      setForm(emptyForm());
      setMessage("Operação de venda registrada com sucesso.");
      await loadVendas();
    } catch (err) {
      setFormError(err?.message || "Erro ao registrar venda.");
    } finally {
      setSaving(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#0a0a0a] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando inteligência fiscal...</p>
        </div>
      </div>
    );
  }

  const nome = cliente?.nome || "Cliente";

  return (
    <div className="mx-auto max-w-6xl space-y-8 bg-[#0a0a0a]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600">
            Inteligência Tributária
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Tributário e Fiscal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitoramento de isenção, DARFs e operações de {nome}
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Registrar Operação de Venda
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

      <FiscalOverview
        cliente={cliente}
        vendas={vendas}
        emptyHint='Nenhuma venda registrada. Use "Registrar Operação de Venda" para começar.'
      />

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-venda-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-blue-900/50 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="modal-venda-title"
                  className="text-lg font-semibold text-white"
                >
                  Registrar Operação de Venda
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Vinculada a {nome}
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

            <form onSubmit={handleSaveVenda} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="venda_ticker"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Ticker
                  </label>
                  <input
                    id="venda_ticker"
                    type="text"
                    required
                    value={form.ticker}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ticker: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm uppercase text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                    placeholder="PETR4"
                  />
                </div>
                <div>
                  <label
                    htmlFor="venda_tipo"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Tipo
                  </label>
                  <select
                    id="venda_tipo"
                    required
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tipo: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                  >
                    {TIPOS_VENDA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="venda_qtd"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Quantidade
                  </label>
                  <input
                    id="venda_qtd"
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={form.quantidade}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quantidade: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="venda_preco"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Preço de venda
                  </label>
                  <input
                    id="venda_preco"
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={form.preco_venda}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, preco_venda: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                    placeholder="28.50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="venda_data"
                  className="block text-xs font-medium text-slate-400"
                >
                  Data da venda
                </label>
                <input
                  id="venda_data"
                  type="date"
                  required
                  value={form.data_venda}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, data_venda: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
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
                  className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Registrar venda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
