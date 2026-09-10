"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatBRL, tickerDoAporte } from "@/lib/cliente";
import {
  calcularMarcacaoNaCurva,
  isRendaFixa,
} from "@/utils/calculosRendaFixa";
import {
  staggerContainer,
  staggerItem,
} from "@/components/dashboard/motion-variants";
import { CarteiraCharts } from "@/components/dashboard/carteira-charts";
import {
  TIPOS_ATIVO,
  indexadorDoSegmento,
  segmentoDoAporte,
  segmentoPadrao,
  segmentosDoTipo,
} from "@/lib/segmentos-carteira";

const INDEXADORES = ["Pré-fixado", "CDI", "IPCA+"];

const emptyForm = () => ({
  tipo_ativo: "Ação",
  segmento: segmentoPadrao("Ação"),
  ticker: "",
  quantidade: "",
  preco_medio: "",
  data: new Date().toISOString().slice(0, 10),
  indexador: "Pré-fixado",
  taxa_contratada: "",
  data_vencimento: "",
  moeda: "BRL",
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

function formatTaxaLabel(aporte) {
  const taxa = aporte.taxa_contratada ?? aporte.taxa;
  if (taxa == null || taxa === "") return null;
  const n = Number(taxa);
  if (Number.isNaN(n)) return String(taxa);
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% a.a.`;
}

export default function AdminClienteCarteiraPage() {
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

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const isRFForm =
    form.tipo_ativo === "Renda Fixa" || form.tipo_ativo === "Tesouro Direto";
  const segmentosForm = segmentosDoTipo(form.tipo_ativo);

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

        if (!id) throw new Error("ID do cliente inválido.");
        if (!cancelled) await loadCarteira();
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Não foi possível carregar a carteira.");
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
      const payload = {
        tipo_ativo: form.tipo_ativo,
        segmento: form.segmento,
        moeda: form.moeda || "BRL",
        ticker: form.ticker,
        preco_medio: Number(String(form.preco_medio).replace(",", ".")),
        data: form.data,
      };

      if (isRFForm) {
        payload.indexador =
          form.indexador ||
          indexadorDoSegmento(form.tipo_ativo, form.segmento) ||
          "Pré-fixado";
        payload.taxa_contratada = Number(
          String(form.taxa_contratada).replace(",", ".")
        );
        payload.data_vencimento = form.data_vencimento;
      } else {
        payload.quantidade = Number(String(form.quantidade).replace(",", "."));
      }

      const res = await fetch(`/api/admin/clientes/${id}/aportes`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando carteira...</p>
        </div>
      </div>
    );
  }

  const nome = cliente?.nome || "Cliente";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Carteira</h1>
          <p className="mt-1 text-sm text-slate-400">
            Aportes de {nome} — ações/FIIs por cotação, RF por marcação na curva
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
        >
          Novo Aporte
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

      {!loadingCarteira ? (
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <CarteiraCharts aportes={aportes} precos={precos} />
        </motion.section>
      ) : null}

      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        <motion.div
          variants={staggerItem}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-sky-950/20"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                    <th className="px-6 py-3.5 font-medium">Tipo</th>
                  <th className="px-6 py-3.5 font-medium">Segmento</th>
                  <th className="px-6 py-3.5 font-medium">Ticker / Nome</th>
                  <th className="px-6 py-3.5 font-medium">Quantidade</th>
                  <th className="px-6 py-3.5 font-medium">Preço médio</th>
                  <th className="px-6 py-3.5 font-medium">
                    Preço / Saldo atual
                  </th>
                  <th className="px-6 py-3.5 font-medium">Valor atual</th>
                  <th className="px-6 py-3.5 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loadingCarteira ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Atualizando carteira...
                    </td>
                  </tr>
                ) : aportes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Nenhum aporte registrado. Use &quot;Novo Aporte&quot; para
                      começar.
                    </td>
                  </tr>
                ) : (
                  aportes.map((aporte) => {
                    const rf = isRendaFixa(aporte);
                    const ticker =
                      aporte.ticker_normalizado || tickerDoAporte(aporte);
                    const precoMedio = Number(
                      aporte.preco_medio ?? aporte.preco ?? 0
                    );
                    const valorAportado =
                      aporte.valor_aportado != null
                        ? Number(aporte.valor_aportado)
                        : precoMedio;

                    let precoOuSaldo = null;
                    let valorAtual = null;

                    if (rf) {
                      const saldo = calcularMarcacaoNaCurva(
                        valorAportado,
                        aporte.data_aporte || aporte.data || aporte.created_at,
                        aporte.taxa_contratada ?? aporte.taxa
                      );
                      precoOuSaldo = saldo;
                      valorAtual = saldo;
                    } else {
                      const precoAtual =
                        aporte.preco_atual != null
                          ? Number(aporte.preco_atual)
                          : ticker && precos[ticker] != null
                            ? Number(precos[ticker])
                            : null;
                      precoOuSaldo = precoAtual;
                      valorAtual =
                        aporte.valor_atual != null
                          ? Number(aporte.valor_atual)
                          : Number(aporte.quantidade ?? 0) *
                            (precoAtual != null ? precoAtual : precoMedio);
                    }

                    const dataExibir =
                      aporte.data_aporte || aporte.data || aporte.created_at;
                    const taxaLabel = formatTaxaLabel(aporte);
                    const vencimento = formatData(aporte.data_vencimento);

                    return (
                      <tr
                        key={aporte.id}
                        className="transition hover:bg-slate-900/80"
                      >
                        <td className="px-6 py-4 text-slate-300">
                          {aporte.tipo_ativo || "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {segmentoDoAporte(aporte)}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {ticker || aporte.ticker || aporte.ativo || "—"}
                          {rf ? (
                            <span className="mt-0.5 block text-xs font-normal text-slate-500">
                              {[
                                aporte.indexador,
                                taxaLabel,
                                vencimento !== "—"
                                  ? `Venc. ${vencimento}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-slate-300">
                          {rf
                            ? "—"
                            : Number(aporte.quantidade ?? 0).toLocaleString(
                                "pt-BR"
                              )}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-slate-300">
                          {formatBRL(rf ? valorAportado : precoMedio)}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-sky-300">
                          {precoOuSaldo != null
                            ? formatBRL(precoOuSaldo)
                            : "—"}
                        </td>
                        <td className="px-6 py-4 tabular-nums font-medium text-white">
                          {valorAtual != null ? formatBRL(valorAtual) : "—"}
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
              <div className="grid gap-4 sm:grid-cols-2">
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
                    onChange={(e) => {
                      const tipo = e.target.value;
                      const segmento = segmentoPadrao(tipo, form.indexador);
                      const idx =
                        indexadorDoSegmento(tipo, segmento) || form.indexador;
                      setForm((f) => ({
                        ...f,
                        tipo_ativo: tipo,
                        segmento,
                        indexador: idx,
                      }));
                    }}
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
                    htmlFor="segmento"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Segmento
                  </label>
                  <select
                    id="segmento"
                    required
                    value={form.segmento}
                    onChange={(e) => {
                      const segmento = e.target.value;
                      const idx =
                        indexadorDoSegmento(form.tipo_ativo, segmento) ||
                        form.indexador;
                      setForm((f) => ({
                        ...f,
                        segmento,
                        indexador: idx,
                      }));
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                  >
                    {segmentosForm.map((seg) => (
                      <option key={seg} value={seg}>
                        {seg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ticker"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Ticker / Nome
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
                    placeholder={
                      form.tipo_ativo === "Tesouro Direto"
                        ? "TESOURO IPCA+ 2035"
                        : isRFForm
                          ? "CDB BANCO X, LCI..."
                          : "PETR4, MXRF11..."
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="moeda"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Moeda
                  </label>
                  <select
                    id="moeda"
                    value={form.moeda}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, moeda: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                  >
                    <option value="BRL">BRL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {isRFForm ? (
                <>
                  <div>
                    <label
                      htmlFor="indexador"
                      className="block text-xs font-medium text-slate-400"
                    >
                      Indexador (marcação na curva)
                    </label>
                    <select
                      id="indexador"
                      required
                      value={form.indexador}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, indexador: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                    >
                      {INDEXADORES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="taxa_contratada"
                        className="block text-xs font-medium text-slate-400"
                      >
                        Taxa Contratada Anual (%)
                      </label>
                      <input
                        id="taxa_contratada"
                        type="number"
                        required
                        step="any"
                        value={form.taxa_contratada}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            taxa_contratada: e.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                        placeholder="10.5"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="data_vencimento"
                        className="block text-xs font-medium text-slate-400"
                      >
                        Data de Vencimento
                      </label>
                      <input
                        id="data_vencimento"
                        type="date"
                        required
                        value={form.data_vencimento}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            data_vencimento: e.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="preco_medio"
                      className="block text-xs font-medium text-slate-400"
                    >
                      Valor do Aporte (R$)
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
                      placeholder="10000.00"
                    />
                  </div>
                </>
              ) : (
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
              )}

              <div>
                <label
                  htmlFor="data"
                  className="block text-xs font-medium text-slate-400"
                >
                  Data do Aporte
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
