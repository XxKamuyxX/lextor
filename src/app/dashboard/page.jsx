"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  displayName,
  fetchAportes,
  fetchCliente,
  formatBRL,
  formatPercent,
  formatTaxa,
  getSessionUser,
  summarizeAportes,
} from "@/lib/cliente";
import { LogoutButton } from "@/components/app/logout-button";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [user, setUser] = useState(null);
  const [aportes, setAportes] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionUser = await getSessionUser(supabase);
        if (!sessionUser) {
          router.replace("/login");
          return;
        }

        const clienteData = await fetchCliente(supabase, sessionUser);

        if (!clienteData?.perfil_suitability) {
          router.replace("/onboarding");
          return;
        }

        const list = await fetchAportes(supabase, clienteData.id);

        if (!cancelled) {
          setUser(sessionUser);
          setCliente(clienteData);
          setAportes(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Não foi possível carregar o dashboard. Tente novamente."
          );
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

  const summary = useMemo(() => summarizeAportes(aportes), [aportes]);
  const nome = displayName(cliente, user);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Carregando painel...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.16)_0%,_transparent_55%)]"
        aria-hidden
      />

      <header className="relative z-10 border-b border-sky-950/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-sky-400">
              Alex J. Dantas
            </Link>
            <nav className="hidden gap-4 text-sm text-slate-400 sm:flex">
              <Link href="/dashboard" className="text-sky-300">
                Dashboard
              </Link>
              <Link
                href="/preferencias"
                className="transition hover:text-sky-300"
              >
                Teses e Objetivos
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
            Área do cliente
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Bem-vindo, {nome}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Perfil de suitability:{" "}
            <span className="font-medium text-sky-300">
              {cliente?.perfil_suitability}
            </span>
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Patrimônio Total"
            value={formatBRL(summary.patrimonio)}
            hint="Com base nos aportes registrados"
          />
          <SummaryCard
            label="Rentabilidade"
            value={formatPercent(summary.rentabilidade)}
            hint="Estimativa patrimonial vs. aportado"
            accent={
              summary.rentabilidade >= 0 ? "text-emerald-400" : "text-red-400"
            }
          />
          <SummaryCard
            label="Total Aportado"
            value={formatBRL(summary.totalAportado)}
            hint="Soma dos aportes da carteira"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-sky-900/50 bg-slate-900/60 shadow-xl shadow-sky-950/30">
          <div className="flex items-center justify-between border-b border-sky-950 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Seus ativos</h2>
              <p className="text-sm text-slate-400">
                Dados da carteira vinculados à tabela de aportes
              </p>
            </div>
            <Link
              href="/preferencias"
              className="hidden rounded-lg border border-sky-800/70 px-3 py-2 text-xs font-medium text-sky-300 transition hover:bg-slate-900 sm:inline-block"
            >
              Ajustar teses
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Ticker / Nome</th>
                  <th className="px-6 py-3 font-medium">Quantidade</th>
                  <th className="px-6 py-3 font-medium">Preço médio</th>
                  <th className="px-6 py-3 font-medium">Taxa (RF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {aportes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Nenhum aporte encontrado para este cliente.
                    </td>
                  </tr>
                ) : (
                  aportes.map((aporte) => (
                    <tr
                      key={aporte.id}
                      className="transition hover:bg-slate-900/80"
                    >
                      <td className="px-6 py-4 text-slate-300">
                        {aporte.tipo_ativo || aporte.tipo || "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {aporte.ticker || aporte.nome || "—"}
                        {aporte.ticker && aporte.nome ? (
                          <span className="mt-0.5 block text-xs font-normal text-slate-500">
                            {aporte.nome}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 tabular-nums text-slate-300">
                        {Number(aporte.quantidade ?? 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 tabular-nums text-slate-300">
                        {formatBRL(aporte.preco_medio ?? aporte.preco ?? 0)}
                      </td>
                      <td className="px-6 py-4 tabular-nums text-sky-300">
                        {formatTaxa(aporte)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-2xl border border-sky-900/50 bg-slate-900/70 p-6 shadow-lg shadow-sky-950/20">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p
        className={`mt-3 text-2xl font-bold tracking-tight ${accent || "text-white"}`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
