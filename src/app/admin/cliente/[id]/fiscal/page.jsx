"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Plus } from "lucide-react";
import { formatBRL } from "@/lib/cliente";
import {
  staggerContainer,
  staggerItem,
} from "@/components/dashboard/motion-variants";

const LIMITE_ISENCAO = 20000;
const LIMITE_ALERTA = 15000;
const TIPOS_VENDA = ["Ação", "FII", "ETF"];

const emptyForm = () => ({
  ticker: "",
  tipo: "Ação",
  quantidade: "",
  preco_venda: "",
  data_venda: new Date().toISOString().slice(0, 10),
});

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

function mesAnoKey(value) {
  const raw = String(value || "");
  if (!raw) return null;
  const date = new Date(raw.includes("T") ? raw : `${raw}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(key) {
  if (!key) return "—";
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

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

  const agora = new Date();
  const mesAtualKey = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;

  const volumeAcoesMes = useMemo(() => {
    return vendas.reduce((acc, venda) => {
      if (String(venda.tipo || "").toLowerCase() !== "ação") return acc;
      if (mesAnoKey(venda.data_venda) !== mesAtualKey) return acc;
      const valor =
        venda.valor_venda != null
          ? Number(venda.valor_venda)
          : Number(venda.preco_venda || 0) * Number(venda.quantidade || 0);
      return acc + (Number.isFinite(valor) ? valor : 0);
    }, 0);
  }, [vendas, mesAtualKey]);

  const progressoIsencao = Math.min(
    100,
    (volumeAcoesMes / LIMITE_ISENCAO) * 100
  );

  const corBarra =
    volumeAcoesMes >= LIMITE_ISENCAO
      ? "bg-rose-500"
      : volumeAcoesMes >= LIMITE_ALERTA
        ? "bg-amber-400"
        : "bg-emerald-500";

  const ultrapassou = volumeAcoesMes >= LIMITE_ISENCAO;

  const prejuizosAcumulados = useMemo(() => {
    const manual = Number(cliente?.prejuizos_acumulados);
    if (Number.isFinite(manual) && manual !== 0) {
      return manual < 0 ? manual : -Math.abs(manual);
    }

    // Compensa cronologicamente: prejuízos líquidos restantes
    const ordenadas = [...vendas].sort((a, b) =>
      String(a.data_venda || "").localeCompare(String(b.data_venda || ""))
    );
    let saldo = 0;
    for (const venda of ordenadas) {
      const lucro = Number(venda.lucro);
      if (!Number.isFinite(lucro)) continue;
      saldo += lucro;
      if (saldo > 0) saldo = 0;
    }
    return saldo;
  }, [cliente, vendas]);

  const historicoMensal = useMemo(() => {
    const map = new Map();

    for (const venda of vendas) {
      const key = mesAnoKey(venda.data_venda);
      if (!key) continue;
      const prev = map.get(key) || {
        key,
        volume: 0,
        lucroComuns: 0,
        lucroFiis: 0,
        operacoes: 0,
      };
      const valor =
        venda.valor_venda != null
          ? Number(venda.valor_venda)
          : Number(venda.preco_venda || 0) * Number(venda.quantidade || 0);
      const lucro = Number(venda.lucro) || 0;
      const tipo = String(venda.tipo || "").toLowerCase();

      prev.volume += Number.isFinite(valor) ? valor : 0;
      prev.operacoes += 1;
      if (tipo.includes("fii")) prev.lucroFiis += lucro;
      else prev.lucroComuns += lucro;
      map.set(key, prev);
    }

    return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
  }, [vendas]);

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

      {/* Monitoramento Mensal */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Monitoramento Mensal
        </h2>

        <motion.div
          className="grid gap-4 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.article
            variants={staggerItem}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20 lg:col-span-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Termômetro de Isenção (Ações) — Mês Atual
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Soma de preço de venda × quantidade das vendas de Ação no mês
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Limite: {formatBRL(LIMITE_ISENCAO)}
              </p>
            </div>

            <p className="mt-6 text-3xl font-bold tabular-nums text-white">
              {formatBRL(volumeAcoesMes)}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {progressoIsencao.toFixed(1)}% do limite de isenção mensal
            </p>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${corBarra}`}
                style={{ width: `${progressoIsencao}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-slate-600">
              <span>0</span>
              <span className="text-amber-500/80">R$ 15 mil</span>
              <span className="text-rose-500/80">R$ 20 mil</span>
            </div>

            {ultrapassou ? (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-rose-700/50 bg-rose-950/40 px-3 py-2.5 text-sm text-rose-300 animate-pulse">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Limite de Isenção Ultrapassado. DARF de 15% sobre o lucro
                aplicável.
              </p>
            ) : volumeAcoesMes >= LIMITE_ALERTA ? (
              <p className="mt-4 rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 py-2.5 text-sm text-amber-200">
                Atenção: próximo do limite de R$ 20.000. Avalie novas vendas no
                mês.
              </p>
            ) : (
              <p className="mt-4 text-sm text-emerald-400/90">
                Dentro da faixa de isenção para operações comuns com ações.
              </p>
            )}
          </motion.article>

          <div className="flex flex-col gap-4">
            <motion.article
              variants={staggerItem}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Prejuízos Acumulados a Compensar
              </p>
              <p className="mt-3 text-2xl font-bold tabular-nums text-slate-300">
                {formatBRL(prejuizosAcumulados)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Saldo negativo disponível para abater de lucros futuros em
                operações comuns.
              </p>
            </motion.article>

            <motion.article
              variants={staggerItem}
              className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500/90">
                Atenção FIIs
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Lembrete: Vendas de FIIs e ETFs não possuem isenção dos 20 mil.
                Alíquota de 20% e 15% respectivamente.
              </p>
            </motion.article>
          </div>
        </motion.div>
      </section>

      {/* Histórico DARFs e Lucros */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Histórico de DARFs e Lucros
        </h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Mês</th>
                  <th className="px-6 py-3.5 font-medium">Operações</th>
                  <th className="px-6 py-3.5 font-medium">Volume</th>
                  <th className="px-6 py-3.5 font-medium">Lucro Comuns</th>
                  <th className="px-6 py-3.5 font-medium">Lucro FIIs</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {historicoMensal.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Nenhuma venda registrada. Use &quot;Registrar Operação de
                      Venda&quot; para começar.
                    </td>
                  </tr>
                ) : (
                  historicoMensal.map((row) => {
                    const precisaDarfComuns =
                      row.key === mesAtualKey
                        ? volumeAcoesMes >= LIMITE_ISENCAO &&
                          row.lucroComuns > 0
                        : row.lucroComuns > 0;
                    const precisaDarfFii = row.lucroFiis > 0;

                    return (
                      <tr
                        key={row.key}
                        className="transition hover:bg-slate-900/80"
                      >
                        <td className="px-6 py-4 capitalize text-white">
                          {labelMes(row.key)}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-slate-300">
                          {row.operacoes}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-slate-300">
                          {formatBRL(row.volume)}
                        </td>
                        <td
                          className={`px-6 py-4 tabular-nums ${
                            row.lucroComuns >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatBRL(row.lucroComuns)}
                        </td>
                        <td
                          className={`px-6 py-4 tabular-nums ${
                            row.lucroFiis >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatBRL(row.lucroFiis)}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {precisaDarfFii || precisaDarfComuns ? (
                            <span className="rounded-full border border-rose-700/50 bg-rose-950/40 px-2.5 py-1 text-rose-300">
                              Verificar DARF
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-800/40 bg-emerald-950/30 px-2.5 py-1 text-emerald-400">
                              Sem DARF aparente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {vendas.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="border-b border-slate-800 px-6 py-3">
              <h3 className="text-sm font-semibold text-white">
                Últimas operações
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Data</th>
                    <th className="px-6 py-3 font-medium">Ticker</th>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Qtd</th>
                    <th className="px-6 py-3 font-medium">Preço</th>
                    <th className="px-6 py-3 font-medium">Lucro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vendas.slice(0, 12).map((venda) => (
                    <tr key={venda.id}>
                      <td className="px-6 py-3 tabular-nums text-slate-400">
                        {formatData(venda.data_venda)}
                      </td>
                      <td className="px-6 py-3 font-medium text-white">
                        {venda.ticker}
                      </td>
                      <td className="px-6 py-3 text-slate-300">{venda.tipo}</td>
                      <td className="px-6 py-3 tabular-nums text-slate-300">
                        {Number(venda.quantidade || 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-3 tabular-nums text-slate-300">
                        {formatBRL(venda.preco_venda)}
                      </td>
                      <td
                        className={`px-6 py-3 tabular-nums ${
                          Number(venda.lucro) >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {venda.lucro != null ? formatBRL(venda.lucro) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

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
                  placeholder="PETR4, MXRF11, BOVA11..."
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
                  />
                </div>
                <div>
                  <label
                    htmlFor="venda_preco"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Preço de Venda
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
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="venda_data"
                  className="block text-xs font-medium text-slate-400"
                >
                  Data
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
                  {saving ? "Salvando..." : "Salvar venda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
