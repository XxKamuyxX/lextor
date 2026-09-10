"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RelatoriosCentral } from "@/components/dashboard/RelatoriosCentral";

export default function AdminClienteRelatoriosPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [booting, setBooting] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [precos, setPrecos] = useState({});
  const [summaryApi, setSummaryApi] = useState(null);
  const [dividendos, setDividendos] = useState([]);
  const [vendas, setVendas] = useState([]);

  const loadData = useCallback(async () => {
    if (!id) return;
    setError(null);

    const [aportesRes, divRes, vendasRes] = await Promise.all([
      fetch(`/api/admin/clientes/${id}/aportes`, { credentials: "same-origin" }),
      fetch(`/api/admin/clientes/${id}/dividendos`, {
        credentials: "same-origin",
      }),
      fetch(`/api/admin/clientes/${id}/vendas`, { credentials: "same-origin" }),
    ]);

    if (
      aportesRes.status === 401 ||
      divRes.status === 401 ||
      vendasRes.status === 401
    ) {
      router.replace("/admin");
      return;
    }

    const aportesData = await aportesRes.json();
    const divData = await divRes.json();
    const vendasData = await vendasRes.json();

    if (!aportesRes.ok) {
      throw new Error(
        aportesData.message || "Não foi possível carregar a carteira."
      );
    }
    if (!divRes.ok) {
      throw new Error(
        divData.message || "Não foi possível carregar os dividendos."
      );
    }
    if (!vendasRes.ok) {
      throw new Error(
        vendasData.message || "Não foi possível carregar as vendas."
      );
    }

    setCliente(aportesData.cliente || divData.cliente || vendasData.cliente);
    setAportes(aportesData.aportes ?? []);
    setPrecos(aportesData.precos ?? {});
    setSummaryApi(aportesData.summary ?? null);
    setDividendos(divData.dividendos ?? []);
    setVendas(vendasData.vendas ?? []);
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
        if (!cancelled) await loadData();
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Não foi possível carregar os relatórios.");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [id, router, loadData]);

  if (booting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando central de relatórios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <p
          role="alert"
          className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <RelatoriosCentral
      cliente={cliente}
      aportes={aportes}
      precos={precos}
      summaryApi={summaryApi}
      dividendos={dividendos}
      vendas={vendas}
      subtitle={`Prévia institucional e exportação PDF para ${cliente?.nome || "cliente"}`}
    />
  );
}
