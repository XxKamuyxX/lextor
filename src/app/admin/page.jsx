"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [booting, setBooting] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("poucavistavidelonge@gmail.com");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("52998224725");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadClientes = useCallback(async () => {
    const res = await fetch("/api/admin/clientes");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Falha ao listar clientes.");
    setClientes(data.clientes || []);
  }, []);

  useEffect(() => {
    async function boot() {
      try {
        const res = await fetch("/api/admin/session");
        const data = await res.json();
        if (data.autenticado) {
          setAutenticado(true);
          await loadClientes();
        }
      } catch {
        setError("Não foi possível verificar a sessão admin.");
      } finally {
        setBooting(false);
      }
    }
    boot();
  }, [loadClientes]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Senha incorreta.");

      setAutenticado(true);
      setPassword("");
      await loadClientes();
      setMessage("Sessão admin iniciada.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAutenticado(false);
    setClientes([]);
    setMessage(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nome,
          cpf,
          acesso_liberado: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao cadastrar.");

      setMessage(data.message);
      setEmail("poucavistavidelonge@gmail.com");
      setNome("");
      setCpf("52998224725");
      await loadClientes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAcesso(cliente) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acesso_liberado: !cliente.acesso_liberado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao atualizar.");
      await loadClientes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeCliente(cliente) {
    if (
      !window.confirm(
        `Remover o acesso de ${cliente.email}? Esta ação não apaga aportes vinculados automaticamente.`
      )
    ) {
      return;
    }

    setError(null);
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao remover.");
      setMessage(`Cliente ${cliente.email} removido.`);
      await loadClientes();
    } catch (err) {
      setError(err.message);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Carregando painel admin...
      </div>
    );
  }

  if (!autenticado) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.16)_0%,_transparent_55%)]"
          aria-hidden
        />
        <form
          onSubmit={handleLogin}
          className="relative z-10 w-full max-w-md space-y-5 rounded-2xl border border-sky-900/50 bg-slate-900/80 p-8 shadow-2xl"
        >
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
              Consultoria · Admin
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">
              Painel administrativo
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Cadastre e liberar e-mails de clientes com plano ativo.
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Senha admin
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25"
              placeholder="ADMIN_SECRET"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-xs text-slate-600">
            <Link href="/" className="hover:text-sky-400">
              ← Voltar ao site
            </Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-sky-950/80 bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-600">
              Admin
            </p>
            <h1 className="text-lg font-bold text-white">Gestão de membros</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 transition hover:text-sky-300"
            >
              Área do membro
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section className="rounded-2xl border border-sky-900/50 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">
            Cadastrar / liberar cliente
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            O e-mail cadastrado aqui poderá solicitar Magic Link na área de
            membros.
          </p>

          <form
            onSubmit={handleCreate}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-400"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="nome"
                className="block text-xs font-medium text-slate-400"
              >
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label
                htmlFor="cpf"
                className="block text-xs font-medium text-slate-400"
              >
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                placeholder="000.000.000-00"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Salvando..." : "Liberar acesso"}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <p className="rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-sky-900/50 bg-slate-900/70">
          <div className="border-b border-sky-950 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Clientes cadastrados ({clientes.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">E-mail</th>
                  <th className="px-6 py-3 font-medium">CPF</th>
                  <th className="px-6 py-3 font-medium">Acesso</th>
                  <th className="px-6 py-3 font-medium">Suitability</th>
                  <th className="px-6 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {clientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Nenhum cliente cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-slate-900/80">
                      <td className="px-6 py-4 text-white">
                        {cliente.nome || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {cliente.email}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {cliente.cpf || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            cliente.acesso_liberado
                              ? "bg-emerald-950/60 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {cliente.acesso_liberado ? "Liberado" : "Bloqueado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {cliente.perfil_suitability || "Pendente"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleAcesso(cliente)}
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-sky-600 hover:text-sky-300"
                          >
                            {cliente.acesso_liberado ? "Bloquear" : "Liberar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCliente(cliente)}
                            className="rounded-lg border border-red-900/50 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-950/40"
                          >
                            Remover
                          </button>
                        </div>
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
