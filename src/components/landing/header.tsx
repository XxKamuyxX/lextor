import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold text-primary">
          Alex J. Dantas
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground md:flex">
          <a href="#servicos" className="hover:text-primary transition">
            Serviços
          </a>
          <a href="#sobre" className="hover:text-primary transition">
            Sobre
          </a>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition hover:bg-sky-900"
          >
            Área do membro
          </Link>
        </nav>
      </div>
    </header>
  );
}
