import Link from "next/link";
import { Logo } from "@/components/landing/logo";

const nav = [
  { href: "#filosofia", label: "Filosofia" },
  { href: "#para-quem", label: "Para quem é" },
  { href: "#solucoes", label: "Soluções" },
  { href: "#metodologia", label: "Metodologia" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo size="sm" />

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide text-slate-400 transition hover:text-blue-400"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full border border-blue-500/30 px-5 py-2.5 text-sm font-medium text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-500/10 sm:inline-flex"
          >
            Área do cliente
          </Link>
          <a
            href="mailto:contato@alexjdantas.com?subject=Agendar%20Sess%C3%A3o%20de%20Alinhamento"
            className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-800"
          >
            Agendar
          </a>
        </div>
      </div>
    </header>
  );
}
