"use client";

import { UserShell } from "@/components/app/user-shell";
import { PreferenciasView } from "@/components/dashboard/PreferenciasView";
import { useClientePainel } from "@/hooks/useClientePainel";
import { normalizePreferencias } from "@/lib/preferencias-investimento";

export default function PreferenciasPage() {
  const { loading, error, cliente, user, nome } = useClientePainel();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sky-800 border-t-sky-400"
            aria-hidden
          />
          <p>Carregando projetos e teses...</p>
        </div>
      </div>
    );
  }

  const preferencias = normalizePreferencias(
    cliente?.preferencias_investimento
  );

  return (
    <UserShell email={user?.email}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600">
            Projetos e Teses
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            {nome}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Mapeamento estratégico registrado pelo consultor — somente
            visualização. Para alterações, fale com a LEXTOR.
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}

        <PreferenciasView preferencias={preferencias} />
      </div>
    </UserShell>
  );
}
