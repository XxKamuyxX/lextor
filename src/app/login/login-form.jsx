"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MENSAGEM_ACESSO_NEGADO } from "@/lib/acesso";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "nao_autorizado") {
      setError(MENSAGEM_ACESSO_NEGADO);
    } else if (err === "auth_callback_failed") {
      setError("Falha na autenticação. Solicite um novo link de acesso.");
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const check = await fetch("/api/auth/verificar-acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const { autorizado, message: deniedMessage } = await check.json();

      if (!autorizado) {
        setError(deniedMessage || MENSAGEM_ACESSO_NEGADO);
        setLoading(false);
        return;
      }

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        },
      });

      if (signInError) {
        setError(
          "Não foi possível enviar o link. Verifique o e-mail e tente novamente."
        );
        return;
      }

      setMessage(
        "Enviamos um link de acesso para o seu e-mail. Verifique sua caixa de entrada e a pasta de spam."
      );
    } catch {
      setError("Erro ao verificar acesso. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.18)_0%,_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md rounded-2xl border border-sky-900/50 bg-slate-900/80 p-8 shadow-2xl shadow-sky-950/40 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-sky-400 transition hover:text-sky-300"
          >
            Alex J. Dantas
          </Link>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-sky-600">
            Consultoria Financeira
          </p>
          <h1 className="mt-6 text-2xl font-bold text-white">Área do membro</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Acesso exclusivo para clientes com plano ativo. Informe o e-mail
            cadastrado pela consultoria para receber o link de acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verificando..." : "Acessar com Magic Link"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className="mt-5 rounded-lg border border-emerald-800/50 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-600">
          Ainda não é cliente?{" "}
          <Link href="/" className="text-sky-500 hover:text-sky-400">
            Conheça os planos
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link href="/" className="transition hover:text-sky-400">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
