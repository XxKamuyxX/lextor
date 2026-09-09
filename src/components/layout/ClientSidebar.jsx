"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Target,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { supabase } from "@/lib/supabase";

const NAV = [
  {
    href: "/dashboard",
    label: "Resumo",
    icon: LayoutDashboard,
    match: (path) => path === "/dashboard" || path === "/dashboard/",
  },
  {
    href: "/dashboard/carteira",
    label: "Carteira",
    icon: Briefcase,
    match: (path) => path.startsWith("/dashboard/carteira"),
  },
  {
    href: "/dashboard/renda-passiva",
    label: "Renda Passiva",
    icon: TrendingUp,
    match: (path) => path.startsWith("/dashboard/renda-passiva"),
  },
  {
    href: "/preferencias",
    label: "Projetos e Teses",
    icon: Target,
    match: (path) => path.startsWith("/preferencias"),
  },
];

/**
 * @param {{ email?: string | null }} props
 */
export function ClientSidebar({ email }) {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#050505]">
      <div className="border-b border-slate-800 px-5 py-6">
        <Logo href="/dashboard" size="sm" />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          Área do Cliente
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {NAV.map((item) => {
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

      <div className="space-y-2 border-t border-slate-800 p-3">
        {email ? (
          <p className="truncate px-3 text-xs text-slate-600">{email}</p>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition hover:bg-white/[0.03] hover:text-slate-300"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  );
}
