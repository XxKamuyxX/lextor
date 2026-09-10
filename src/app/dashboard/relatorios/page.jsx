"use client";

import { useEffect, useState } from "react";
import { UserShell } from "@/components/app/user-shell";
import { RelatoriosCentral } from "@/components/dashboard/RelatoriosCentral";
import { authHeaders } from "@/lib/auth-fetch";
import { summarizeAportes } from "@/lib/cliente";
import { useClientePainel } from "@/hooks/useClientePainel";

export default function ClienteRelatoriosPage() {
  const {
    loading,
    error: painelError,
    cliente,
    user,
    aportes,
    precosAtuais,
    accessToken,
    nome,
  } = useClientePainel();

  const [dividendos, setDividendos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [extraError, setExtraError] = useState(null);
  const [extraLoading, setExtraLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadExtras() {
      if (!accessToken) {
        if (!loading) setExtraLoading(false);
        return;
      }

      setExtraLoading(true);
      setExtraError(null);

      try {
        const [divRes, vendasRes] = await Promise.all([
          fetch("/api/cliente/dividendos", {
            credentials: "same-origin",
            headers: authHeaders(accessToken),
          }),
          fetch("/api/cliente/vendas", {
            credentials: "same-origin",
            headers: authHeaders(accessToken),
          }),
        ]);

        const divData = await divRes.json();
        const vendasData = await vendasRes.json();

        if (!divRes.ok || divData.ok === false) {
          throw new Error(
            divData.message || "Não foi possível carregar os dividendos."
          );
        }
        if (!vendasRes.ok || vendasData.ok === false) {
          throw new Error(
            vendasData.message || "Não foi possível carregar as vendas."
          );
        }

        if (!cancelled) {
          setDividendos(divData.dividendos ?? []);
          setVendas(vendasData.vendas ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setExtraError(
            err?.message || "Não foi possível carregar dados dos relatórios."
          );
        }
      } finally {
        if (!cancelled) setExtraLoading(false);
      }
    }

    loadExtras();
    return () => {
      cancelled = true;
    };
  }, [accessToken, loading]);

  if (loading || extraLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  const error = painelError || extraError;
  const summary = summarizeAportes(aportes, precosAtuais);

  return (
    <UserShell email={user?.email}>
      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      <RelatoriosCentral
        cliente={{ ...(cliente || {}), nome }}
        aportes={aportes}
        precos={precosAtuais}
        summaryApi={summary}
        dividendos={dividendos}
        vendas={vendas}
        subtitle="Gere e baixe seus relatórios patrimoniais e o Kit do Contador em PDF"
      />
    </UserShell>
  );
}
