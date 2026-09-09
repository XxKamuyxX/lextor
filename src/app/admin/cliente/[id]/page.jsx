"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { summarizeAportes } from "@/lib/cliente";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { CarteiraCharts } from "@/components/dashboard/carteira-charts";
import { staggerContainer } from "@/components/dashboard/motion-variants";

export default function AdminClienteResumoPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [precos, setPrecos] = useState({});
  const [summaryApi, setSummaryApi] = useState(null);

  const loadCarteira = useCallback(async () => {
    if (!id) return;

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
        throw new Error(data.message || "Não foi possível carregar o resumo.");
      }

      setCliente(data.cliente);
      setAportes(data.aportes ?? []);
      setPrecos(data.precos ?? {});
      setSummaryApi(data.summary ?? null);
    } catch (err) {
      setError(err?.message || "Não foi possível carregar o resumo do cliente.");
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
          setError(err?.message || "Não foi possível carregar o resumo.");
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

  if (booting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando resumo...</p>
        </div>
      </div>
    );
  }

  const nome = cliente?.nome || "Cliente";
  const email = cliente?.email || "—";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-sky-600">
          Cockpit do Consultor
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          {nome}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {email}
          <span className="mx-2 text-slate-700">·</span>
          <span className="font-mono text-xs text-slate-500">ID: {id}</span>
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          {error}
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
    </div>
  );
}
