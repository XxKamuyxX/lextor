"use client";

import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { useAgendar } from "@/components/landing/AgendarModal";
import { InstallPwaButton } from "@/components/landing/InstallPwaButton";

const nav = [
  { href: "#filosofia", label: "Filosofia" },
  { href: "#para-quem", label: "Para quem é" },
  { href: "#solucoes", label: "Soluções" },
  { href: "#tecnologia", label: "Tecnologia" },
  { href: "#metodologia", label: "Metodologia" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const { openAgendar } = useAgendar();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Logo size="sm" />

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-sans text-sm font-medium tracking-wide text-slate-300 transition hover:text-blue-400"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <InstallPwaButton
            label="Baixar App"
            className="inline-flex rounded-full border border-white/20 px-2.5 py-2 text-[11px] font-medium text-white transition hover:border-blue-400/50 hover:bg-white/5 sm:px-4 sm:text-sm"
          />
          <Link
            href="/login"
            className="inline-flex rounded-full border border-blue-500/30 px-3 py-2 text-xs font-medium text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-500/10 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <span className="sm:hidden">Login</span>
            <span className="hidden sm:inline">Área do cliente</span>
          </Link>
          <button
            type="button"
            onClick={openAgendar}
            className="rounded-full bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-800 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Agendar
          </button>
        </div>
      </div>
    </header>
  );
}
