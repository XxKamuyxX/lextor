"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MENSAGEM_ACESSO_NEGADO, normalizeEmail } from "@/lib/acesso";

function mapSignInError(signInError) {
  const msg = signInError?.message?.toLowerCase() ?? "";

  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "E-mail ou senha incorretos. Confira os dados enviados pela consultoria.";
  }

  if (msg.includes("invalid") && msg.includes("email")) {
    return "E-mail inválido. Confira se não há espaços ou caracteres extras.";
  }

  return "Não foi possível entrar. Verifique e-mail e senha e tente novamente.";
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "nao_autorizado") {
      setError(
        `${MENSAGEM_ACESSO_NEGADO} Use exatamente o e-mail cadastrado no admin.`
      );
    } else if (err === "auth_callback_failed") {
      setError("Falha na autenticação. Tente entrar com e-mail e senha.");
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailNormalizado = normalizeEmail(email);

    if (!emailNormalizado || !emailNormalizado.includes("@")) {
      setError("Informe um e-mail válido, sem espaços.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Informe a senha enviada pela consultoria.");
      setLoading(false);
      return;
    }

    try {
      const check = await fetch("/api/auth/verificar-acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailNormalizado }),
      });

      const checkData = await check.json();

      if (!check.ok || !checkData.autorizado) {
        setError(
          checkData.message ||
            `${MENSAGEM_ACESSO_NEGADO} Verifique se digitou o mesmo e-mail cadastrado no admin.`
        );
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password,
      });

      if (signInError) {
        setError(mapSignInError(signInError));
        return;
      }

      const vinculo = await fetch("/api/auth/vincular-sessao", {
        method: "POST",
      });
      const vinculoData = await vinculo.json();

      if (!vinculo.ok || !vinculoData.ok) {
        setError(
          vinculoData.message ||
            `${MENSAGEM_ACESSO_NEGADO} Verifique se digitou o mesmo e-mail cadastrado no admin.`
        );
        return;
      }

      const redirect = searchParams.get("redirect");
      const destino =
        redirect && redirect.startsWith("/") && redirect !== "/login"
          ? redirect
          : vinculoData.redirect || "/dashboard";

      window.location.assign(destino);
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
            Acesso exclusivo para clientes com plano ativo. Use o e-mail e a
            senha enviados pela consultoria.
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
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(normalizeEmail(e.target.value))}
              placeholder="cliente@email.com"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha enviada pela consultoria"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

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
