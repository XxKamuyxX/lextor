"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  Target,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/landing/logo";

/**
 * @param {{ clienteId: string }} props
 */
export function Sidebar({ clienteId }) {
  const pathname = usePathname();
  const base = `/admin/cliente/${clienteId}`;

  const nav = [
    {
      href: base,
      label: "Resumo",
      icon: LayoutDashboard,
      match: (path) => path === base || path === `${base}/`,
    },
    {
      href: `${base}/carteira`,
      label: "Carteira",
      icon: Briefcase,
      match: (path) => path.startsWith(`${base}/carteira`),
    },
    {
      href: `${base}/renda-passiva`,
      label: "Renda Passiva",
      icon: TrendingUp,
      match: (path) => path.startsWith(`${base}/renda-passiva`),
    },
    {
      href: `${base}/preferencias`,
      label: "Projetos e Teses",
      icon: Target,
      match: (path) => path.startsWith(`${base}/preferencias`),
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#050505]">
      <div className="border-b border-slate-800 px-5 py-6">
        <Logo href="/admin" size="sm" />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          Cockpit LEXTOR
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname || "");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-l-2 border-blue-700 bg-blue-950/40 text-white"
                  : "border-l-2 border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  active
                    ? "text-blue-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition hover:bg-white/[0.03] hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Voltar ao painel
        </Link>
      </div>
    </aside>
  );
}
