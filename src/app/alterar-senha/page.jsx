"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mustChangePassword } from "@/lib/auth-guards";
import { isSenhaValida } from "@/lib/password";
import { fetchCliente, getSessionUser } from "@/lib/cliente";
import { isAcessoLiberado } from "@/lib/acesso";

export default function AlterarSenhaPage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const user = await getSessionUser(supabase);
        if (!user) {
          router.replace("/login");
          return;
        }

        const cliente = await fetchCliente(supabase, user);
        if (!isAcessoLiberado(cliente)) {
          await supabase.auth.signOut();
          router.replace("/login?error=nao_autorizado");
          return;
        }

        if (!mustChangePassword(user)) {
          router.replace(
            cliente?.perfil_suitability ? "/dashboard" : "/onboarding"
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Não foi possível carregar a página.");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!isSenhaValida(novaSenha)) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha,
        data: { must_change_password: false },
      });

      if (updateError) throw updateError;

      const cliente = await fetchCliente(supabase, user);
      if (cliente?.id) {
        await supabase
          .from("clientes")
          .update({ senha_acesso: null })
          .eq("id", cliente.id);
      }

      router.replace("/onboarding");
      router.refresh();
    } catch (err) {
      setError(
        err?.message ||
          "Não foi possível alterar a senha. Tente uma senha diferente."
      );
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.18)_0%,_transparent_55%)]"
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
            Primeiro acesso
          </p>
          <h1 className="mt-6 text-2xl font-bold text-white">
            Defina sua senha
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Por segurança, substitua a senha temporária enviada pela consultoria
            antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="novaSenha"
              className="block text-sm font-medium text-slate-300"
            >
              Nova senha
            </label>
            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="block text-sm font-medium text-slate-300"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a nova senha"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar e continuar"}
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
      </div>
    </div>
  );
}
