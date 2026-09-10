"use client";

import { useEffect, useState } from "react";
import { UserShell } from "@/components/app/user-shell";
import { FiscalOverview } from "@/components/dashboard/FiscalOverview";
import { authHeaders } from "@/lib/auth-fetch";
import { useClientePainel } from "@/hooks/useClientePainel";

export default function ClienteFiscalPage() {
  const {
    loading: painelLoading,
    error: painelError,
    user,
    accessToken,
    nome,
  } = useClientePainel();

  const [cliente, setCliente] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!accessToken) {
        if (!painelLoading) setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/cliente/vendas", {
          credentials: "same-origin",
          headers: authHeaders(accessToken),
        });
        const data = await res.json();

        if (!res.ok || data.ok === false) {
          throw new Error(
            data.message || "Não foi possível carregar o painel fiscal."
          );
        }

        if (!cancelled) {
          setCliente(data.cliente ?? null);
          setVendas(data.vendas ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Erro ao carregar dados fiscais.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, painelLoading]);

  if (painelLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
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

  const displayError = painelError || error;

  return (
    <UserShell email={user?.email}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600">
            Inteligência Tributária
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Tributário e Fiscal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Acompanhe isenção, DARFs e operações de {nome} — somente
            visualização
          </p>
        </div>

        {displayError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {displayError}
          </p>
        ) : null}

        <FiscalOverview
          cliente={cliente}
          vendas={vendas}
          emptyHint="Nenhuma venda registrada pelo seu consultor ainda."
        />
      </div>
    </UserShell>
  );
}
