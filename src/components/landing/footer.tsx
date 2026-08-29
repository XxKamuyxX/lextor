import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-slate-50 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div>
          <p className="font-semibold text-foreground">Alex J. Dantas</p>
          <p className="mt-1 text-sm text-muted">
            Consultoria Financeira · alexjdantas.com
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/login" className="hover:text-primary transition">
            Área do membro
          </Link>
          <a href="mailto:contato@alexjdantas.com" className="hover:text-primary transition">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
}
