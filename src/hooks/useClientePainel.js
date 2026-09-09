"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  displayName,
  fetchUltimosPrecos,
  tickerDoAporte,
} from "@/lib/cliente";
import { authHeaders, getAccessTokenFromBrowser } from "@/lib/auth-fetch";
import { mustChangePassword } from "@/lib/auth-guards";
import { isRendaFixa } from "@/utils/calculosRendaFixa";

/**
 * Carrega sessão + dados do painel do cliente.
 * @returns {{
 *   loading: boolean;
 *   error: string | null;
 *   cliente: object | null;
 *   user: object | null;
 *   aportes: Array;
 *   precosAtuais: Record<string, number>;
 *   accessToken: string | null;
 *   nome: string;
 * }}
 */
export function useClientePainel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [user, setUser] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [precosAtuais, setPrecosAtuais] = useState({});
  const [accessToken, setAccessToken] = useState(null);

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

        const token =
          session.access_token ?? (await getAccessTokenFromBrowser(supabase));
        if (!cancelled) setAccessToken(token);

        const res = await fetch("/api/cliente/me", {
          credentials: "same-origin",
          headers: authHeaders(token),
        });
        const data = await res.json();

        if (!res.ok || !data.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error(data.message || "Não foi possível carregar o painel.");
        }

        const listaAportes = data.aportes ?? [];
        let base = listaAportes;

        if (data.cliente?.id) {
          try {
            const { data: aportesDb, error: aportesError } = await supabase
              .from("aportes")
              .select("*")
              .eq("cliente_id", data.cliente.id);

            if (!aportesError && aportesDb?.length > 0) {
              base = aportesDb;
            }
          } catch {
            // mantém lista da API
          }
        }

        const tickers = base
          .filter((a) => !isRendaFixa(a))
          .map(tickerDoAporte)
          .filter(Boolean);
        const precos = await fetchUltimosPrecos(supabase, tickers);

        if (!cancelled) {
          setUser(sessionUser);
          setCliente(data.cliente);
          setAportes(base);
          setPrecosAtuais(precos);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Não foi possível carregar o painel. Tente novamente."
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

  return {
    loading,
    error,
    cliente,
    user,
    aportes,
    precosAtuais,
    accessToken,
    nome: displayName(cliente, user),
  };
}
