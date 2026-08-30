"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  displayName,
  fetchUltimosPrecos,
  formatBRL,
  formatTaxa,
  summarizeAportes,
  tickerDoAporte,
} from "@/lib/cliente";
import { authHeaders, getAccessTokenFromBrowser } from "@/lib/auth-fetch";
import { LogoutButton } from "@/components/app/logout-button";
import { mustChangePassword } from "@/lib/auth-guards";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { CarteiraCharts } from "@/components/dashboard/carteira-charts";
import {
  staggerContainer,
  staggerItem,
} from "@/components/dashboard/motion-variants";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [user, setUser] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [precosAtuais, setPrecosAtuais] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const sessionUser = session?.user ?? null;
        if (!sessionUser) {
          router.replace("/login");
          return;
        }

        if (mustChangePassword(sessionUser)) {
          router.replace("/alterar-senha");
          return;
        }

        const accessToken =
          session.access_token ?? (await getAccessTokenFromBrowser(supabase));
        const res = await fetch("/api/cliente/me", {
          credentials: "same-origin",
          headers: authHeaders(accessToken),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error(data.message || "Não foi possível carregar o dashboard.");
        }

        const listaAportes = data.aportes ?? [];

        let precos = {};
        try {
          if (data.cliente?.id) {
            const { data: aportesDb, error: aportesError } = await supabase
              .from("aportes")
              .select("*")
              .eq("cliente_id", data.cliente.id);

            if (aportesError) throw aportesError;

            const base = aportesDb?.length > 0 ? aportesDb : listaAportes;
            const tickers = base.map(tickerDoAporte).filter(Boolean);
            precos = await fetchUltimosPrecos(supabase, tickers);

            if (!cancelled) {
              setAportes(base);
              setPrecosAtuais(precos);
            }
          } else {
            const tickers = listaAportes.map(tickerDoAporte).filter(Boolean);
            precos = await fetchUltimosPrecos(supabase, tickers);
            if (!cancelled) {
              setAportes(listaAportes);
              setPrecosAtuais(precos);
            }
          }
        } catch (cotacaoErr) {
          console.error("Falha ao cruzar cotações:", cotacaoErr);
          if (!cancelled) {
            setAportes(listaAportes);
            setPrecosAtuais({});
          }
        }

        if (!cancelled) {
          setUser(sessionUser);
          setCliente(data.cliente);
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

  const summary = useMemo(
    () => summarizeAportes(aportes, precosAtuais),
    [aportes, precosAtuais]
  );
  const nome = displayName(cliente, user);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando painel...</p>
        </div>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>

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
            hint="Quantidade × último preço de cotação"
          />
          <SummaryCard
            label="Rentabilidade"
            value={summary.rentabilidade}
            format="percent"
            hint="Diferença entre preço médio e preço atual"
            accent={
              summary.rentabilidade >= 0 ? "text-emerald-400" : "text-red-400"
            }
          />
          <SummaryCard
            label="Total Aportado"
            value={summary.totalAportado}
            format="brl"
            hint="Soma dos aportes da carteira"
          />
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <CarteiraCharts aportes={aportes} precos={precosAtuais} />
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={staggerItem}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-sky-950/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] cursor-default"
          >
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
                    <th className="px-6 py-3 font-medium">Preço atual</th>
                    <th className="px-6 py-3 font-medium">Taxa (RF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {aportes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        Nenhum aporte encontrado para este cliente.
                      </td>
                    </tr>
                  ) : (
                    aportes.map((aporte) => {
                      const ticker = tickerDoAporte(aporte);
                      const precoMedio = Number(
                        aporte.preco_medio ?? aporte.preco ?? 0
                      );
                      const precoAtual =
                        ticker && precosAtuais[ticker] != null
                          ? Number(precosAtuais[ticker])
                          : null;

                      return (
                        <tr
                          key={aporte.id}
                          className="transition hover:bg-slate-900/80"
                        >
                          <td className="px-6 py-4 text-slate-300">
                            {aporte.tipo_ativo || aporte.tipo || "—"}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {aporte.ticker || aporte.ativo || aporte.nome || "—"}
                            {(aporte.ticker || aporte.ativo) && aporte.nome ? (
                              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                                {aporte.nome}
                              </span>
                            ) : null}
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
                            {precoAtual != null ? formatBRL(precoAtual) : "—"}
                          </td>
                          <td className="px-6 py-4 tabular-nums text-sky-300">
                            {formatTaxa(aporte)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
