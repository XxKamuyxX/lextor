"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
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
    href: "/dashboard/fiscal",
    label: "Tributário e Fiscal",
    icon: Landmark,
    match: (path) => path.startsWith("/dashboard/fiscal"),
  },
  {
    href: "/dashboard/relatorios",
    label: "Relatórios",
    icon: FileText,
    match: (path) => path.startsWith("/dashboard/relatorios"),
  },
  {
    href: "/preferencias",
    label: "Projetos e Teses",
    icon: Target,
    match: (path) => path.startsWith("/preferencias"),
  },
];

function BrandMark({ href = "/dashboard", onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="font-serif text-xl font-bold tracking-[0.18em] text-white transition hover:text-blue-300"
    >
      LEXTOR
    </Link>
  );
}

/**
 * @param {{ email?: string | null }} props
 */
export function ClientSidebar({ email }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  function close() {
    setOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-[#050505]/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex rounded-lg border border-slate-700 p-2 text-slate-200 transition hover:bg-white/[0.04] hover:text-white"
          aria-expanded={open}
          aria-controls="client-sidebar"
        >
          <span className="sr-only">Abrir menu</span>
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <BrandMark />
        <span className="w-9" aria-hidden />
      </header>

      {open ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[1px] lg:hidden"
          onClick={close}
        />
      ) : null}

      <aside
        id="client-sidebar"
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(16rem,86vw)] flex-col border-r border-slate-800 bg-[#050505] shadow-2xl shadow-black/50 transition-transform duration-200 ease-out lg:w-64 lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "max-lg:-translate-x-full max-lg:pointer-events-none",
        ].join(" ")}
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-5">
          <div>
            <BrandMark onClick={close} />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Área do Cliente
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:bg-white/[0.04] hover:text-white lg:hidden"
          >
            <span className="sr-only">Fechar menu</span>
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname || "");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
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
            <p className="truncate px-3 text-xs text-slate-500">{email}</p>
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
    </>
  );
}
